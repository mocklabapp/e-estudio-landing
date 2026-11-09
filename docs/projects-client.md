# Maintain the public projects consumer

`getProjects()` delegates to credential-free `fetchPublicProjects()` behind the server-only Astro boundary. The consumer preserves validated image/category/year fields; ES/CA client presentation is documented separately in [the portfolio guide](e-estudio-portfolio.md). Shared Edge code, SQL and exclusive service tests are maintained elsewhere, not in this client repository.

Historical implementation references remain R1 T3a/T3b and rich-contract reference commit `9ea92f0`; they are provenance, not current deployment proof.

## Site configuration

The server wrapper reads both values through `getSecret` on every call, never from route/query parameters:

| Site variable | Required value |
| --- | --- |
| `MOCKLAB_PROJECTS_URL` | Exact `https://<20-character-project-ref>.supabase.co/functions/v1/public-projects` URL; no port, credentials, extra path, trailing slash, query or fragment. |
| `MOCKLAB_USER_ID` | One owner UUID, normalized to lowercase by the client. |

The interface is `fetchPublicProjects(endpoint: string | undefined, uid: string | undefined, dependencies?: ProjectsClientDependencies): Promise<NormalizedPublicProject[]>`. Optional trusted test dependencies are `{ fetch: typeof fetch, timeout?: typeof AbortSignal.timeout }`; production defaults are native fetch and a ten-second deadline. `NormalizedPublicProject` requires the three additive fields; `PublicProject` keeps them optional for existing hand-authored consumers. The client imports only the normalized type, without an Astro runtime dependency.

No API key or Authorization header is sent and no environment variable is read by the pure client; the wrapper alone reads configuration. There is no fallback to old site variable names or Supabase credentials. The human-owned template must contain blank `MOCKLAB_PROJECTS_URL=` and `MOCKLAB_USER_ID=` assignments only; agents do not read or edit its contents. The semantic test reports only safe mismatch classes. See [setup and migration](projects.md#configure-one-portfolio) for the operator-owned configuration change.

## Request and response guarantees

- One GET to the configured endpoint with only `uid`, `cache: 'no-store'`, `redirect: 'error'` and one shared ten-second abort signal. Invalid configuration fails before fetch; every call requests fresh data.
- A successful `200 {projects: [...]}` response is treated as unknown input. The pure `projects-response.ts` parser reconstructs only `id`, nullable `title/description/weblink`, nullable `originalLanguage`, `translations` containing `language/title/description`, `images` containing only `url`, and nullable string `category/year`.
- `project-images.ts` validates public `projects-images`/`user-media` URLs against the configured endpoint origin, rejecting foreign/signed URLs, query/fragment suffixes, controls and encoded traversal. Image order and legitimate encoded object names are preserved. Absent legacy fields normalize to `[]`/`null`/`null`; present invalid images or metadata fail closed.
- IDs are strictly increasing, unique positive signed-bigint decimal strings, never converted to Number. Languages are `es`, `en` or `ca`; unknown original language remains null. Duplicate translation languages fail. Null/partial text stays unchanged, with no fallback or state filtering.
- Private extras are discarded. Malformed data, upstream errors, redirects and timeouts reject with exactly `Error('Projects unavailable')`, without partial output or an upstream cause.
- UID selects public data, not authorization. The DTO omits owner identity, so the client cannot independently recheck ownership. The configured external service owns selection and database pagination. It must return a complete portfolio or fail, never knowingly return partial success. See [the external service contract and release gates](projects.md#external-service-contract-and-release-gates).

## Verification boundary

`node --test tests/projects-client.test.mjs` exercises the exported client using fake fetch responses, with no credentials or live requests. Tests cover exact request/DTO contracts, rich and legacy envelopes, malformed additive fields, all-state pass-through, partial translations, bigint limits/order, freshness, unsafe configuration, failures and deadlines. `tests/project-images.test.mjs` exercises the URL trust boundary and nested encoding cases. `corepack pnpm check` resolves the existing Astro types when standalone TypeScript cannot resolve `astro:env/server` through the type-only DTO import.

`tests/projects.test.mjs` verifies the real wrapper/API with an isolated runtime environment bridge: only two configuration reads, fresh public requests, ignored visitor overrides and no secret fallback. HTTP/SSR fixtures now serve `{projects: DTO[]}` and retain all three no-store headers, locale selection and client-import rejection. Database owner selection, nested relation handling and capped pagination require the externally maintained service's own tests/proof; backend-exclusive T1/T2a tests are no longer present here. They are not duplicated as site REST logic.

These checks do not prove native service runtime, hosted grants, gateway/CORS behavior or deployment. The operator must verify the intended target, restricted database export/grants, credential-free gateway access and authorized rollout separately. Preserve [the unresolved dependency advisory](projects.md#dependency-security-limitation) and scoped override. Local consumer checks and repository cleanup do not authorize release or claim shared-service hardening.
