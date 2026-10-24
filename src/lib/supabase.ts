// Minimal PostgREST RPC caller. No SDK, so the build has no Supabase dependency, and when the env vars are
// missing every call resolves to { ok: false, skipped: true } and the page carries on client-side.
export interface RpcResult { ok: boolean; skipped?: boolean; error?: string }

export async function rpc(url: string, anonKey: string, fn: string, args: Record<string, unknown>): Promise<RpcResult> {
  if (!url || !anonKey) return { ok: false, skipped: true };
  try {
    const res = await fetch(`${url.replace(/\/$/, '')}/rest/v1/rpc/${fn}`, {
      method: 'POST',
      headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(args),
    });
    if (res.ok) return { ok: true };
    const body = await res.json().catch(() => ({}));
    return { ok: false, error: body.hint || body.message || `HTTP ${res.status}` };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
