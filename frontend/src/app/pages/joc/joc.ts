import { Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PuntuacioService, Puntuacio } from '../../services/puntuacio';

interface Cell {
  row: number;
  col: number;
  value: number; // 0 = empty, positive = prize, -1 = penalty
  revealed: boolean;
}

interface BestScore {
  puntuacio: number;
  puntuacioId?: string;
}

@Component({
  selector: 'app-joc',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './joc.html',
  styleUrl: './joc.css',
})
export class JocPage implements OnDestroy {
  private readonly puntuacioService = inject(PuntuacioService);
  private intervalId?: ReturnType<typeof setInterval>;

  // Game setup
  readonly nivell = signal<number>(5);
  readonly gameStarted = signal(false);
  readonly gameOver = signal(false);

  // Game state
  readonly grid = signal<Cell[][]>([]);
  readonly timeRemaining = signal(5);
  readonly totalTimePlayed = signal(0);
  private startTime?: Date;

  // Score registration
  readonly nomUsuari = signal('');
  readonly isSubmitting = signal(false);
  readonly submitSuccess = signal(false);
  readonly submitError = signal('');
  readonly registeredScoreId = signal<string | null>(null);

  // Best scores
  readonly topScores = signal<Puntuacio[]>([]);
  readonly isLoadingTopScores = signal(false);

  // Local best score per level (stored in localStorage)
  readonly localBestScores = signal<Record<number, BestScore>>({});

  readonly currentLevelBestScore = computed(() => {
    const scores = this.localBestScores();
    const level = this.nivell();
    return scores[level] || null;
  });

  readonly canUpdateScore = computed(() => {
    const best = this.currentLevelBestScore();
    const current = this.totalTimePlayed();
    return best && best.puntuacioId && current > best.puntuacio;
  });

  constructor() {
    this.loadLocalBestScores();
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  confirmNivell(): void {
    const n = this.nivell();
    if (n < 2) {
      this.nivell.set(2);
    }
    this.loadTopScores();
  }

  startGame(): void {
    const n = this.nivell();
    this.generateGrid(n);
    this.timeRemaining.set(5);
    this.totalTimePlayed.set(0);
    this.gameStarted.set(true);
    this.gameOver.set(false);
    this.submitSuccess.set(false);
    this.submitError.set('');
    this.registeredScoreId.set(null);
    this.startTime = new Date();
    this.startTimer();
  }

  private generateGrid(n: number): void {
    const totalCells = n * n;
    const prizeCells = Math.floor(totalCells * 0.3);
    const penaltyCells = Math.floor(totalCells * 0.2);

    // Create cell values array
    const values: number[] = new Array(totalCells).fill(0);

    // Assign prizes (1-5 seconds) uniformly
    for (let i = 0; i < prizeCells; i++) {
      values[i] = (i % 5) + 1; // 1, 2, 3, 4, 5, 1, 2, ...
    }

    // Assign penalties (-1 second)
    for (let i = prizeCells; i < prizeCells + penaltyCells; i++) {
      values[i] = -1;
    }

    // Shuffle the array
    this.shuffleArray(values);

    // Create grid
    const grid: Cell[][] = [];
    let index = 0;
    for (let row = 0; row < n; row++) {
      const rowCells: Cell[] = [];
      for (let col = 0; col < n; col++) {
        rowCells.push({
          row,
          col,
          value: values[index],
          revealed: false,
        });
        index++;
      }
      grid.push(rowCells);
    }
    this.grid.set(grid);
  }

  // Fisher-Yates shuffle algorithm
  private shuffleArray<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  private startTimer(): void {
    this.stopTimer();
    this.intervalId = setInterval(() => {
      const remaining = this.timeRemaining() - 1;
      if (remaining <= 0) {
        this.endGame();
      } else {
        this.timeRemaining.set(remaining);
      }
    }, 1000);
  }

  private stopTimer(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }

  private endGame(): void {
    this.stopTimer();
    this.timeRemaining.set(0);
    this.gameOver.set(true);

    // Calculate total time played
    if (this.startTime) {
      const endTime = new Date();
      const totalSeconds = Math.floor((endTime.getTime() - this.startTime.getTime()) / 1000);
      this.totalTimePlayed.set(totalSeconds);
    }

    // Update local best score if improved
    this.updateLocalBestIfImproved();
    this.loadTopScores();
  }

  revealCell(cell: Cell): void {
    if (cell.revealed || this.gameOver()) return;

    const grid = this.grid();
    const newGrid = grid.map((row) =>
      row.map((c) => (c.row === cell.row && c.col === cell.col ? { ...c, revealed: true } : c))
    );
    this.grid.set(newGrid);

    // Apply cell effect
    if (cell.value > 0) {
      // Prize: add seconds
      this.timeRemaining.set(this.timeRemaining() + cell.value);
    } else if (cell.value < 0) {
      // Penalty: subtract seconds
      const newTime = this.timeRemaining() + cell.value;
      if (newTime <= 0) {
        this.endGame();
      } else {
        this.timeRemaining.set(newTime);
      }
    }
  }

  registerScore(): void {
    const nom = this.nomUsuari().trim();
    if (!nom || nom.length < 2) {
      this.submitError.set("El nom d'usuari ha de tenir almenys 2 caràcters.");
      return;
    }

    this.isSubmitting.set(true);
    this.submitError.set('');

    this.puntuacioService
      .createPuntuacio({
        nom_usuari: nom,
        puntuacio: this.totalTimePlayed(),
        nivell: this.nivell(),
      })
      .subscribe({
        next: (saved) => {
          this.submitSuccess.set(true);
          this.isSubmitting.set(false);
          this.registeredScoreId.set(saved._id);
          this.updateLocalBestWithId(saved._id);
          this.loadTopScores();
        },
        error: () => {
          this.submitError.set("Error en registrar la puntuació. Torna-ho a intentar.");
          this.isSubmitting.set(false);
        },
      });
  }

  updateScore(): void {
    const best = this.currentLevelBestScore();
    if (!best?.puntuacioId) return;

    this.isSubmitting.set(true);
    this.submitError.set('');

    this.puntuacioService.updatePuntuacio(best.puntuacioId, this.totalTimePlayed()).subscribe({
      next: () => {
        this.submitSuccess.set(true);
        this.isSubmitting.set(false);
        this.saveLocalBestScore(this.nivell(), this.totalTimePlayed(), best.puntuacioId);
        this.loadTopScores();
      },
      error: () => {
        this.submitError.set("Error en actualitzar la puntuació. Torna-ho a intentar.");
        this.isSubmitting.set(false);
      },
    });
  }

  loadTopScores(): void {
    this.isLoadingTopScores.set(true);
    this.puntuacioService.getTopByNivell(this.nivell()).subscribe({
      next: (scores) => {
        this.topScores.set(scores);
        this.isLoadingTopScores.set(false);
      },
      error: () => {
        this.topScores.set([]);
        this.isLoadingTopScores.set(false);
      },
    });
  }

  private loadLocalBestScores(): void {
    try {
      const stored = localStorage.getItem('joc_best_scores');
      if (stored) {
        this.localBestScores.set(JSON.parse(stored));
      }
    } catch {
      this.localBestScores.set({});
    }
  }

  private saveLocalBestScore(level: number, score: number, id?: string): void {
    const scores = { ...this.localBestScores() };
    scores[level] = { puntuacio: score, puntuacioId: id };
    this.localBestScores.set(scores);
    localStorage.setItem('joc_best_scores', JSON.stringify(scores));
  }

  private updateLocalBestIfImproved(): void {
    const level = this.nivell();
    const currentScore = this.totalTimePlayed();
    const best = this.localBestScores()[level];

    if (!best || currentScore > best.puntuacio) {
      this.saveLocalBestScore(level, currentScore, best?.puntuacioId);
    }
  }

  private updateLocalBestWithId(id: string): void {
    const level = this.nivell();
    const currentScore = this.totalTimePlayed();
    this.saveLocalBestScore(level, currentScore, id);
  }

  resetGame(): void {
    this.stopTimer();
    this.gameStarted.set(false);
    this.gameOver.set(false);
    this.grid.set([]);
    this.timeRemaining.set(5);
    this.totalTimePlayed.set(0);
    this.submitSuccess.set(false);
    this.submitError.set('');
    this.registeredScoreId.set(null);
  }

  getCellClass(cell: Cell): string {
    if (!cell.revealed) return 'cell hidden';
    if (cell.value > 0) return 'cell prize';
    if (cell.value < 0) return 'cell penalty';
    return 'cell empty';
  }

  getCellContent(cell: Cell): string {
    if (!cell.revealed) return '?';
    if (cell.value > 0) return `+${cell.value}s`;
    if (cell.value < 0) return '-1s';
    return '';
  }
}
