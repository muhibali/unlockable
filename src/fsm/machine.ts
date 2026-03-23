import { LockState, LockEvent } from './types';

type TransitionMap = Partial<Record<LockEvent, LockState>>;
type FSMDefinition = Record<LockState, TransitionMap>;

const FSM: FSMDefinition = {
  LOCKED: {
    START_ATTEMPT: 'ATTEMPT',
    START_SET_PASSWORD: 'SET_PASSWORD',
  },
  UNLOCKED: {
    MANUAL_LOCK: 'LOCKED',
  },
  ATTEMPT: {
    CORRECT_PASSWORD: 'UNLOCKED',
    WRONG_PASSWORD: 'LOCKED',
    MAX_ATTEMPTS: 'TIMEOUT',
    MANUAL_LOCK: 'LOCKED',
  },
  TIMEOUT: {
    TIMEOUT_COMPLETE: 'LOCKED',
  },
  SET_PASSWORD: {
    PASSWORD_SUBMITTED: 'CONFIRM_PASSWORD',
    MANUAL_LOCK: 'LOCKED',
  },
  CONFIRM_PASSWORD: {
    CONFIRM_PASSWORD_MATCH: 'LOCKED',
    CONFIRM_PASSWORD_MISMATCH: 'SET_PASSWORD',
    MANUAL_LOCK: 'LOCKED',
  },
};

export function transition(state: LockState, event: LockEvent): LockState {
  const next = FSM[state]?.[event];
  return next ?? state;
}
