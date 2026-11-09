import type { NormalizedPublicProject } from './projects.ts';
import { parseProjectsResponse } from './projects-response.ts';

export interface ProjectsClientDependencies {
  fetch: typeof fetch;
  timeout?: typeof AbortSignal.timeout;
}

/** Public, credential-free transport. Callers supply trusted configuration, not visitor input. */
export async function fetchPublicProjects(
  endpoint: string | undefined,
  uid: string | undefined,
  dependencies: ProjectsClientDependencies = { fetch: globalThis.fetch },
): Promise<NormalizedPublicProject[]> {
  try {
    if (!endpoint || !/^https:\/\/[a-z0-9]{20}\.supabase\.co\/functions\/v1\/public-projects$/.test(endpoint)
      || !uid || uid.length !== 36
      || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uid)) {
      throw new Error('Invalid configuration');
    }
    const url = new URL(endpoint);
    // Reject URL-parser normalization, including otherwise invisible trailing whitespace.
    if (url.href !== endpoint) throw new Error('Invalid endpoint');
    url.searchParams.set('uid', uid.toLowerCase());
    const signal = (dependencies.timeout ?? AbortSignal.timeout)(10_000);
    signal.throwIfAborted();
    const response = await dependencies.fetch(url, {
      method: 'GET', cache: 'no-store', redirect: 'error', signal,
    });
    if (response.status !== 200 || response.redirected) throw new Error('Invalid response');
    const body: unknown = await response.json();
    signal.throwIfAborted();
    return parseProjectsResponse(body, url.origin);
  } catch {
    // Never forward configuration, upstream bodies, network details or error causes.
    throw new Error('Projects unavailable');
  }
}
