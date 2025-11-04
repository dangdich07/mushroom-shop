// apps/api/src/utils/mongo-state.ts
export type MongoStateLabel =
  | 'disconnected'
  | 'connected'
  | 'connecting'
  | 'disconnecting'
  | 'unknown';

export function mongoStateLabel(state: number | undefined): MongoStateLabel {
  switch (state) {
    case 0: return 'disconnected';
    case 1: return 'connected';
    case 2: return 'connecting';
    case 3: return 'disconnecting';
    default: return 'unknown';
  }
}
