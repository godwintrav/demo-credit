export interface Transaction {
  id: number;
  user_id: number;
  transaction_type: 'fund' | 'withdraw' | 'transferIn' | 'transferOut';
  amount: number;
  reference?: string | null;
  created_at?: Date;
  updated_at?: Date;
}
