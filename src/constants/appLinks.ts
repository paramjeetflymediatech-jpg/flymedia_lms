/**
 * Official Mobile App Store download links for Flymedia LMS
 */
export const AppStoreLinks = {
  // Google Play Store direct URL
  playStore: process.env.NEXT_PUBLIC_PLAYSTORE_URL || 'https://play.google.com/store/apps/details?id=com.flymedia.lms',

  // Apple App Store direct URL
  appStore: process.env.NEXT_PUBLIC_APPSTORE_URL || 'https://apps.apple.com/in/app/flymedia-lms/id6823921800',

  // Direct APK download link (hosted in public/downloads/flymedia-lms.apk)
  apkDownload: process.env.NEXT_PUBLIC_APK_URL || '/downloads/flymedia-lms.apk',

  packageName: 'com.flymedia.lms',
  appName: 'Flymedia LMS',
};

export const APP_LINKS = AppStoreLinks;
