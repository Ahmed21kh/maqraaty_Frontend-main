/**
 * Returns an `id → name` resolver that is cheap to call from templates.
 *
 * The id index is rebuilt only when the source array instance changes (signals and
 * HTTP results replace the array, they don't mutate it), so each lookup is O(1)
 * instead of scanning the whole students list on every change-detection pass.
 */
export function createNameResolver(
  source: () => readonly { _id: string; name: string }[] | null | undefined
): (id: string) => string | undefined {
  let current: readonly { _id: string; name: string }[] | null | undefined;
  let index = new Map<string, string>();

  return (id: string) => {
    const list = source();
    if (list !== current) {
      current = list;
      index = new Map((list ?? []).map((s) => [s._id, s.name]));
    }
    return index.get(id);
  };
}
