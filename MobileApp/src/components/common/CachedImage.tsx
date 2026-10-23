import React, { useState } from 'react';
import {
  View,
  Image,
  ImageProps,
  ImageSourcePropType,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { formatImageUrl } from '../../utils/imageUrl';

interface CachedImageProps extends Omit<ImageProps, 'source'> {
  uri?: string | null;
  source?: ImageSourcePropType;
  fallbackUri?: string;
  showLoader?: boolean;
}

const DEFAULT_FALLBACK =
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=75';

export const CachedImage: React.FC<CachedImageProps> = ({
  uri,
  source,
  fallbackUri = DEFAULT_FALLBACK,
  showLoader = false,
  style,
  resizeMode = 'cover',
  onLoadEnd,
  onError,
  ...rest
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Extract flat border radius if passed in style so container and image corners match perfectly
  const flattenedStyle = StyleSheet.flatten(style) || {};
  const borderRadius = flattenedStyle.borderRadius || 0;
  const borderTopLeftRadius = flattenedStyle.borderTopLeftRadius || borderRadius;
  const borderTopRightRadius = flattenedStyle.borderTopRightRadius || borderRadius;
  const borderBottomLeftRadius = flattenedStyle.borderBottomLeftRadius || borderRadius;
  const borderBottomRightRadius = flattenedStyle.borderBottomRightRadius || borderRadius;

  const cornerRadiusStyle = {
    borderTopLeftRadius,
    borderTopRightRadius,
    borderBottomLeftRadius,
    borderBottomRightRadius,
  };

  // Determine image source with 'force-cache'
  let resolvedSource: ImageSourcePropType;

  if (hasError) {
    resolvedSource = { uri: fallbackUri, cache: 'force-cache' };
  } else if (uri !== undefined && uri !== null) {
    const formatted = formatImageUrl(uri);
    resolvedSource = { uri: formatted, cache: 'force-cache' };
  } else if (source && typeof source === 'object' && 'uri' in source && (source as { uri?: string }).uri) {
    const remoteSource = source as { uri: string; headers?: Record<string, string> };
    resolvedSource = {
      ...remoteSource,
      uri: formatImageUrl(remoteSource.uri),
      cache: 'force-cache',
    };
  } else if (source) {
    resolvedSource = source;
  } else {
    resolvedSource = { uri: fallbackUri, cache: 'force-cache' };
  }

  return (
    <View style={[styles.container, style, cornerRadiusStyle]}>
      {/* Background Placeholder Skeleton - visible until image loads */}
      {!isLoaded && <View style={[StyleSheet.absoluteFill, styles.placeholder, cornerRadiusStyle]} />}

      {/* Optional subtle spinner if explicitly requested */}
      {!isLoaded && showLoader && (
        <View style={[StyleSheet.absoluteFill, styles.loaderContainer]}>
          <ActivityIndicator size="small" color="#94A3B8" />
        </View>
      )}

      {/* Instant Native Image with zero fade delay */}
      <Image
        {...rest}
        source={resolvedSource}
        style={[StyleSheet.absoluteFill, cornerRadiusStyle]}
        resizeMode={resizeMode}
        fadeDuration={0}
        onLoad={() => setIsLoaded(true)}
        onLoadEnd={() => {
          setIsLoaded(true);
          if (onLoadEnd) onLoadEnd();
        }}
        onError={(e) => {
          setHasError(true);
          setIsLoaded(true);
          if (onError) onError(e);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
  },
  placeholder: {
    backgroundColor: '#E2E8F0',
  },
  loaderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
