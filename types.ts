
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'Appetizer' | 'Main' | 'Drink' | 'Dessert';
  image: string;
  tags?: string[];
}

export interface CartItem extends MenuItem {
  quantity: number;
  note?: string;
}

export interface Order {
  id: string;
  tableId: string;
  items: CartItem[];
  status: 'pending' | 'preparing' | 'served' | 'completed';
  paymentStatus: 'pending' | 'paid';
  timestamp: Date;
  total: number;
}

export interface WaiterCall {
  id: string;
  tableId: string;
  type: 'help' | 'bill' | 'water' | 'clean' | 'cutlery' | 'other';
  status: 'pending' | 'responded';
  timestamp: Date;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning';
}

export type ViewMode = 'customer' | 'staff';

export interface TableLayout {
  id: string;
  name?: string;
  x: number; // Percentage 0-100
  y: number; // Percentage 0-100
  w: number; // Width in pixels or relative
  h: number; // Height in pixels or relative
}
