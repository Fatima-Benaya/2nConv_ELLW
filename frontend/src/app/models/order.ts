export interface OrderItem {
  foodId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface OrderPayload {
  customerName: string;
  address: string;
  phone: string;
  email: string;
  paymentMethod: string;
  paymentDetails?: {
    cardHolder?: string;
    cardLast4?: string;
    cardExpiry?: string;
    bizumPhone?: string;
  };
  items: OrderItem[];
  total: number;
}
