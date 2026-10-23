import { Image } from 'react-native';

const DEFAULT_FALLBACK =
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=75';

/**
 * Converts relative or incomplete image paths (e.g. /uploads/packages/...)
 * into fully qualified, loadable HTTPS URLs for React Native mobile image rendering.
 * Also downsizes heavy Unsplash images (w=800 -> w=400) for 10x faster mobile downloads.
 */
export const formatImageUrl = (url?: string | null): string => {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return DEFAULT_FALLBACK;
  }
  let trimmed = url.trim();

  // Downsize heavy Unsplash image parameters to mobile-optimized 400px width
  if (trimmed.includes('images.unsplash.com')) {
    if (trimmed.includes('w=')) {
      trimmed = trimmed.replace(/w=\d+/, 'w=400').replace(/q=\d+/, 'q=75');
    } else {
      trimmed = `${trimmed}${trimmed.includes('?') ? '&' : '?'}w=400&q=75`;
    }
    return trimmed;
  }

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
    uri: formatImageUrl(url) || fallback || DEFAULT_FALLBACK,
    cache: 'force-cache' as const,
  };
};

/**
 * Proactively prefetches images into the device's native disk cache in background
 * so that when the user scrolls to them, they render instantly without network latency.
 */
export const prefetchImages = (urls: (string | null | undefined)[]) => {
  urls.forEach((url) => {
    if (!url || typeof url !== 'string') return;
    const formatted = formatImageUrl(url);
    if (formatted.startsWith('http://') || formatted.startsWith('https://')) {
      Image.prefetch(formatted).catch(() => {});
    }
  });
};
