import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Puntuacio {
  _id: string;
  nom_usuari: string;
  puntuacio: number;
  nivell: number;
  data_joc: string;
}

export interface PuntuacioPayload {
  nom_usuari: string;
  puntuacio: number;
  nivell: number;
  data_joc?: string;
}

@Injectable({
  providedIn: 'root',
})
export class PuntuacioService {
  private readonly http = inject(HttpClient);
  private readonly apiBase = environment.apiBaseUrl;

  createPuntuacio(payload: PuntuacioPayload): Observable<Puntuacio> {
    return this.http.post<Puntuacio>(`${this.apiBase}/puntuacions`, payload);
  }

  getTopByNivell(nivell: number): Observable<Puntuacio[]> {
    return this.http.get<Puntuacio[]>(`${this.apiBase}/puntuacions/top/${nivell}`);
  }

  updatePuntuacio(id: string, puntuacio: number): Observable<Puntuacio> {
    return this.http.put<Puntuacio>(`${this.apiBase}/puntuacions/${id}`, { puntuacio });
  }
}
