export interface Transaction {
  id: number;
  description: string;
  amount: number;
  date: string;
  category: string;
}

export const mockTransactions: Transaction[] = [
  { id: 1, description: 'Grocery Store', amount: -85.50, date: '2023-10-25', category: 'Food' },
  { id: 2, description: 'Salary', amount: 5000.00, date: '2023-10-01', category: 'Income' },
  { id: 3, description: 'Rent', amount: -1200.00, date: '2023-10-02', category: 'Housing' },
  { id: 4, description: 'Internet Bill', amount: -60.00, date: '2023-10-05', category: 'Utilities' },
  { id: 5, description: 'Coffee Shop', amount: -5.75, date: '2023-10-26', category: 'Food' },
  { id: 6, description: 'Netflix', amount: -15.00, date: '2023-10-20', category: 'Entertainment' },
  { id: 7, description: 'Netflix', amount: -15.00, date: '2023-10-21', category: 'Entertainment' }, // Potential duplicate anomaly
  { id: 8, description: 'Tech Gadget Store', amount: -850.00, date: '2023-10-15', category: 'Shopping' }, // Unusual spike
];
