import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Linking,
  Platform,
  Image,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { X, ExternalLink, Play, Film, Award, AlertCircle } from 'lucide-react-native';
import { Colors } from '../../theme/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface VideoPlayerModalProps {
  visible: boolean;
  onClose: () => void;
  videoUrl?: string | null;
  title?: string;
  studentName?: string;
  companyOrCourse?: string;
  salaryPackage?: string;
  description?: string;
}

export function extractYouTubeId(url?: string | null): string | null {
  if (!url) return null;
  const regExp = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/;
  const match = url.match(regExp);
  return match ? match[1] : null;
}

interface ErrorBoundaryProps {
  videoUrl: string;
  youtubeId: string | null;
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class WebViewErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any) {
    console.warn('[VideoPlayerModal] WebView native module not ready:', error?.message);
  }

  render() {
    if (this.state.hasError) {
      const { videoUrl, youtubeId } = this.props;
      const thumbUrl = youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : null;

      return (
        <TouchableOpacity
          style={styles.fallbackContainer}
          activeOpacity={0.88}
          onPress={() => Linking.openURL(videoUrl).catch(() => {})}
        >
          {thumbUrl ? (
            <Image source={{ uri: thumbUrl }} style={styles.fallbackThumb} resizeMode="cover" />
          ) : (
            <View style={styles.fallbackThumbPlaceholder}>
              <Film size={40} color="#64748b" />
            </View>
          )}
          <View style={styles.fallbackOverlay}>
            <View style={styles.fallbackPlayCircle}>
              <Play size={26} color="#ffffff" fill="#ffffff" style={{ marginLeft: 3 }} />
            </View>
            <Text style={styles.fallbackTitle}>Watch Video</Text>
            <View style={styles.fallbackBtnRow}>
              <Text style={styles.fallbackSub}>Tap to open player</Text>
              <ExternalLink size={12} color="#f97316" />
            </View>
          </View>
        </TouchableOpacity>
      );
    }

    return this.props.children;
  }
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  visible,
  onClose,
  videoUrl,
  title,
  studentName,
  companyOrCourse,
  salaryPackage,
  description,
}) => {
  if (!visible || !videoUrl) return null;

  const youtubeId = extractYouTubeId(videoUrl);

  const htmlContent = youtubeId
    ? `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; background: #000; }
    html, body { width: 100%; height: 100%; overflow: hidden; background: #000; display: flex; align-items: center; justify-content: center; }
    iframe { width: 100%; height: 100%; border: none; }
  </style>
</head>
<body>
  <iframe
    src="https://www.youtube.com/embed/${youtubeId}?autoplay=1&playsinline=1&rel=0&modestbranding=1&controls=1&enablejsapi=1"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowfullscreen
  ></iframe>
</body>
</html>`
    : `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; background: #000; }
    html, body { width: 100%; height: 100%; overflow: hidden; background: #000; display: flex; align-items: center; justify-content: center; }
    video { width: 100%; height: 100%; object-fit: contain; }
  </style>
</head>
<body>
  <video src="${videoUrl}" controls autoplay playsinline preload="auto"></video>
</body>
</html>`;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        {/* Top Close Button */}
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={onClose}
          activeOpacity={0.8}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <X size={20} color="#ffffff" />
        </TouchableOpacity>

        <View style={styles.modalContent}>
          {/* Video Container (16:9 Aspect Ratio) */}
          <View style={styles.videoPlayerContainer}>
            <WebViewErrorBoundary videoUrl={videoUrl} youtubeId={youtubeId}>
              <WebView
                source={{ html: htmlContent }}
                style={styles.webView}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                allowsFullscreenVideo={true}
                allowsInlineMediaPlayback={true}
                mediaPlaybackRequiresUserAction={false}
                originWhitelist={['*']}
                startInLoadingState={true}
                renderLoading={() => (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#f97316" />
                    <Text style={styles.loadingText}>Loading video player...</Text>
                  </View>
                )}
              />
            </WebViewErrorBoundary>
          </View>

          {/* Details & Metadata Card */}
          <View style={styles.metaCard}>
            <View style={styles.metaHeaderRow}>
              <View style={styles.badgeRow}>
                <View style={styles.videoBadge}>
                  <Film size={11} color="#f97316" />
                  <Text style={styles.videoBadgeText}>STUDENT VIDEO REVIEW</Text>
                </View>
                {salaryPackage ? (
                  <View style={styles.pkgBadge}>
                    <Text style={styles.pkgBadgeText}>{salaryPackage}</Text>
                  </View>
                ) : null}
              </View>

              {/* Open in External YouTube Button */}
              {videoUrl ? (
                <TouchableOpacity
                  style={styles.externalLinkBtn}
                  onPress={() => Linking.openURL(videoUrl).catch(() => {})}
                  activeOpacity={0.7}
                >
                  <Text style={styles.externalLinkText}>Open App</Text>
                  <ExternalLink size={12} color="#94a3b8" />
                </TouchableOpacity>
              ) : null}
            </View>

            {title ? (
              <Text style={styles.metaTitle} numberOfLines={2}>
                {title}
              </Text>
            ) : null}

            {studentName || companyOrCourse ? (
              <Text style={styles.metaSub}>
                {studentName ? studentName : 'Flymedia Student'}
                {companyOrCourse ? ` • ${companyOrCourse}` : ''}
              </Text>
            ) : null}

            {description ? (
              <Text style={styles.metaDesc} numberOfLines={3}>
                “{description}”
              </Text>
            ) : null}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.94)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  closeBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 56 : 36,
    right: 20,
    zIndex: 50,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  modalContent: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: '#0f172a',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 20,
  },
  videoPlayerContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000000',
    overflow: 'hidden',
  },
  webView: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
  },
  metaCard: {
    padding: 16,
    backgroundColor: '#0f172a',
  },
  metaHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  videoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: 'rgba(249, 115, 22, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.3)',
  },
  videoBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#f97316',
    letterSpacing: 0.4,
  },
  pkgBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.35)',
  },
  pkgBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#34d399',
  },
  externalLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  externalLinkText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94a3b8',
  },
  metaTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
    lineHeight: 20,
    marginBottom: 4,
  },
  metaSub: {
    fontSize: 12,
    fontWeight: '600',
    color: '#38bdf8',
    marginBottom: 6,
  },
  metaDesc: {
    fontSize: 12,
    fontWeight: '500',
    color: '#94a3b8',
    lineHeight: 17,
  },
  fallbackContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#090d16',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackThumb: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    opacity: 0.6,
  },
  fallbackThumbPlaceholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#090d16',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackOverlay: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    zIndex: 2,
  },
  fallbackPlayCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f97316',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  fallbackTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
  },
  fallbackBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  fallbackSub: {
    fontSize: 11,
    fontWeight: '600',
    color: '#f97316',
  },
});
