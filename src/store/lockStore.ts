import { create } from 'zustand';
import { LockState, LockEvent } from '../fsm/types';
import { transition } from '../fsm/machine';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

const MAX_ATTEMPTS = 3;
const TIMEOUT_DURATION = 30; // seconds

interface LockStore {
  state: LockState;
  attempts: number;
  timeoutRemaining: number;
  pendingPassword: string;
  dispatch: (event: LockEvent, payload?: string) => Promise<void>;
  startTimeout: () => void;
}

async function hashPassword(password: string): Promise<string> {
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    password
  );
}

export const useLockStore = create<LockStore>((set, get) => ({
  state: 'LOCKED',
  attempts: 0,
  timeoutRemaining: 0,
  pendingPassword: '',

  dispatch: async (event: LockEvent, payload?: string) => {
    const { state, attempts } = get();

    if (event === 'START_ATTEMPT') {
      set({ state: transition(state, 'START_ATTEMPT') });
      return;
    }

    if (event === 'WRONG_PASSWORD') {
      const newAttempts = attempts + 1;
      if (newAttempts >= MAX_ATTEMPTS) {
        set({ state: 'TIMEOUT', attempts: newAttempts });
        get().startTimeout();
      } else {
        set({ state: transition(state, 'WRONG_PASSWORD'), attempts: newAttempts });
      }
      return;
    }

    if (event === 'CORRECT_PASSWORD') {
      set({ state: transition(state, 'CORRECT_PASSWORD'), attempts: 0 });
      return;
    }

    if (event === 'PASSWORD_SUBMITTED' && payload) {
      set({ state: transition(state, 'PASSWORD_SUBMITTED'), pendingPassword: payload });
      return;
    }

    if (event === 'CONFIRM_PASSWORD_MATCH' && payload) {
      const hashed = await hashPassword(payload);
      await SecureStore.setItemAsync('lock_password', hashed);
      set({ state: transition(state, 'CONFIRM_PASSWORD_MATCH'), pendingPassword: '' });
      return;
    }

    if (event === 'CONFIRM_PASSWORD_MISMATCH') {
      set({ state: transition(state, 'CONFIRM_PASSWORD_MISMATCH'), pendingPassword: '' });
      return;
    }

    set({ state: transition(state, event) });
  },

  startTimeout: () => {
    set({ timeoutRemaining: TIMEOUT_DURATION });
    const interval = setInterval(() => {
      const { timeoutRemaining } = get();
      if (timeoutRemaining <= 1) {
        clearInterval(interval);
        set({ state: 'LOCKED', attempts: 0, timeoutRemaining: 0 });
      } else {
        set({ timeoutRemaining: timeoutRemaining - 1 });
      }
    }, 1000);
  },
}));

export async function verifyPassword(input: string): Promise<boolean> {
  const stored = await SecureStore.getItemAsync('lock_password');
  const inputHash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    input
  );
  if (!stored) {
    // Default password: 1234
    const defaultHash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      '1234'
    );
    return inputHash === defaultHash;
  }
  return inputHash === stored;
}
