import { useEffect, useState } from 'react';

/** Tiny pushState router — the site only needs "/", "/templates" and "/templates/:code". */
const EVENT = 'velora:navigate';

export const navigate = (path: string, { replace = false } = {}) => {
  if (path === window.location.pathname) return;
  if (replace) window.history.replaceState(null, '', path);
  else window.history.pushState(null, '', path);
  window.dispatchEvent(new Event(EVENT));
};

export const usePathname = () => {
  const [path, setPath] = useState(window.location.pathname);
  useEffect(() => {
    const update = () => setPath(window.location.pathname);
    window.addEventListener('popstate', update);
    window.addEventListener(EVENT, update);
    return () => {
      window.removeEventListener('popstate', update);
      window.removeEventListener(EVENT, update);
    };
  }, []);
  return path;
};

/** Parses "/templates" and "/templates/B2" (case-insensitive, trailing slash ok). */
export const matchTemplatesRoute = (path: string): { code: string | null } | null => {
  const m = path.replace(/\/+$/, '').match(/^\/templates(?:\/([A-Za-z0-9]+))?$/i);
  return m ? { code: m[1] ? m[1].toUpperCase() : null } : null;
};
