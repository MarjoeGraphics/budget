export interface DueItem {
  id: string;
  name: string;
  amount: number;
  dayOfMonth: number;
  category: string;
  isPaid: boolean;
}

export interface IncomeEvent {
  id: string;
  name: string;
  amount: number;
  dayOfMonth: number;
}
