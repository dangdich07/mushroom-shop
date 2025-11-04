export const runtime = 'nodejs'; // 👈 giống trên, chắc chắn Node

export async function GET() {
  return new Response(
    JSON.stringify({
      HAS_SECRET: !!process.env.NEXTAUTH_SECRET,
      HAS_FALLBACK: true,     // vì ta đã set fallback
      NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? null,
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );
}
