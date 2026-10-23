/**
 * Converts relative or incomplete image paths (e.g. /uploads/packages/...)
 * into fully qualified, loadable HTTPS URLs for React Native mobile image rendering.
 */
export const formatImageUrl = (url?: string | null): string => {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80';
  }
  const trimmed = url.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `https://course.flymediatech.com${cleanPath}`;
};

/**
 * Returns a React Native Image source object with aggressive disk caching enabled
 * ('force-cache') to ensure instantaneous loading on repeat renders.
 */
export const getImageSource = (url?: string | null, fallback?: string) => {
  return {
    uri: formatImageUrl(url) || fallback || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
    cache: 'force-cache' as const,
  };
};
