// app/storage/wallet.ts
import * as SecureStore from 'expo-secure-store';

export interface Transaction {
  id: string;
  type: 'deposit' | 'spend' | 'shopping';
  amount: number;
  note: string;
  date: string;
}

const BALANCE_KEY = 'wallet_balance';
const TRANSACTIONS_KEY = 'wallet_transactions';

const safeParse = <T>(value: string | null, fallback: T): T => {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

export const getBalance = async (): Promise<number> => {
  const val = await SecureStore.getItemAsync(BALANCE_KEY);
  const parsed = val ? parseFloat(val) : NaN;
  return Number.isFinite(parsed) ? parsed : 0;
};

export const saveBalance = async (amount: number): Promise<void> => {
  await SecureStore.setItemAsync(BALANCE_KEY, amount.toString());
};

export const getTransactions = async (): Promise<Transaction[]> => {
  const val = await SecureStore.getItemAsync(TRANSACTIONS_KEY);
  return safeParse<Transaction[]>(val, []);
};

export const addTransaction = async (txn: Transaction): Promise<void> => {
  const existing = await getTransactions();
  existing.unshift(txn);
  await SecureStore.setItemAsync(TRANSACTIONS_KEY, JSON.stringify(existing));
};

export const resetWalletData = async (): Promise<void> => {
  await SecureStore.deleteItemAsync(BALANCE_KEY);
  await SecureStore.deleteItemAsync(TRANSACTIONS_KEY);
};