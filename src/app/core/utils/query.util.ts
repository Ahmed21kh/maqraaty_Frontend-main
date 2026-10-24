/**
 * Builds a `&key=value` query suffix from a params object.
 * Empty / nullish values are skipped and everything is URI-encoded, so
 * a name like "أحمد & علي" can no longer break the request URL.
 *
 * The output keeps the exact `&a=1&b=2` shape the existing `ApiService`
 * methods append to their base URL, so the backend contract is unchanged.
 */
export function buildQuery(params: Record<string, string | number | null | undefined>): string {
  let query = '';
  for (const [key, raw] of Object.entries(params)) {
    if (raw === null || raw === undefined) continue;
    const value = String(raw).trim();
    if (value === '') continue;
    query += `&${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
  }
  return query;
}
