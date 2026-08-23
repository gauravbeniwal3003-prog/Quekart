/**
 * Centralized API URL resolver for QueKart frontend.
 * Resolves full API backend URL when running on Vercel or custom domain,
 * or relative endpoint paths when running in local development / container preview.
 */
export function getApiUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const metaEnv = (import.meta as any).env || {};
  const envBase = (
    metaEnv.VITE_API_BASE_URL ||
    metaEnv.VITE_BACKEND_URL ||
    metaEnv.VITE_RENDER_URL ||
    ''
  ).trim();

  if (envBase) {
    const normalizedBase = envBase.replace(/\/+$/, '');
    return `${normalizedBase}${cleanPath}`;
  }

  return cleanPath;
}
