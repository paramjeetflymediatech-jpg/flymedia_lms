import React, { useState } from 'react';
import {
  View,
  Image,
  ImageProps,
  ImageSourcePropType,
  StyleSheet,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { formatImageUrl } from '../../utils/imageUrl';

interface CachedImageProps extends Omit<ImageProps, 'source'> {
  uri?: string | null;
  source?: ImageSourcePropType;
  fallbackUri?: string;
  showLoader?: boolean;
}

const DEFAULT_FALLBACK =
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80';

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
  const [isLoading, setIsLoading] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(0));

  // Determine image source with 'force-cache'
  let resolvedSource: ImageSourcePropType;

  if (hasError) {
    resolvedSource = { uri: fallbackUri, cache: 'force-cache' };
  } else if (uri !== undefined) {
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

  const handleLoadSuccess = () => {
    setIsLoading(false);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={[styles.container, style]}>
      {/* Background Placeholder Skeleton */}
      <View style={[StyleSheet.absoluteFill, styles.placeholder]} />

      {/* Optional subtle spinner if explicitly requested */}
      {isLoading && showLoader && (
        <View style={[StyleSheet.absoluteFill, styles.loaderContainer]}>
          <ActivityIndicator size="small" color="#94A3B8" />
        </View>
      )}

      {/* Fast Cached Image */}
      <Animated.Image
        {...rest}
        source={resolvedSource}
        style={[StyleSheet.absoluteFill, style, { opacity: fadeAnim }]}
        resizeMode={resizeMode}
        onLoad={handleLoadSuccess}
        onLoadEnd={() => {
          setIsLoading(false);
          if (onLoadEnd) onLoadEnd();
        }}
        onError={(e) => {
          setHasError(true);
          setIsLoading(false);
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
