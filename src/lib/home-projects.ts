import type { PublicProject } from './projects';

/** Approved Home recency proxy: highest public bigint IDs, without changing API order. */
export function latestHomeProjects(projects: readonly PublicProject[]): PublicProject[] {
  return [...projects].sort((left, right) => {
    const a = BigInt(left.id);
    const b = BigInt(right.id);
    return a > b ? -1 : a < b ? 1 : 0;
  }).slice(0, 3);
}
