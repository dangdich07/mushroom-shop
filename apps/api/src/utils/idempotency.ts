const inMemory = new Map<string, number>();

export function checkAndStoreIdempotency(key?: string): { ok: boolean; key: string } {
  const finalKey = key || cryptoRandom();
  if (inMemory.has(finalKey)) return { ok: false, key: finalKey };
  inMemory.set(finalKey, Date.now());
  return { ok: true, key: finalKey };
}

function cryptoRandom(): string {
  return (global as any).crypto?.randomUUID?.() || require('crypto').randomUUID();
}





