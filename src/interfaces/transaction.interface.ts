export interface Transaction {
  id: number;
  user_id: number;
  transaction_type: 'fund' | 'withdraw' | 'transferIn' | 'transferOut';
  amount: number;
  created_at?: Date;
  updated_at?: Date;
}
