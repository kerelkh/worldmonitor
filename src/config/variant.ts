// Centralized variant resolution - used by all config files
// Supports runtime override via URL param: ?variant=polkam|tech|full
const urlVariant = typeof window !== 'undefined'
  ? new URLSearchParams(window.location.search).get('variant')
  : null;

export const SITE_VARIANT = urlVariant || import.meta.env.VITE_VARIANT || 'full';
