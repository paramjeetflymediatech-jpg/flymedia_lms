export interface PageOption {
  key: string;
  label: string;
  path?: string;
  icon?: string;
}

export const PRESET_PAGES: PageOption[] = [
  { key: 'HOME', label: 'Homepage', path: '/', icon: '🏠' },
  { key: 'PARTNER', label: 'Partner With Us', path: '/partner-with-us', icon: '🤝' },
  { key: 'ABOUT', label: 'About Us', path: '/about', icon: 'ℹ️' },
  { key: 'CONTACT', label: 'Contact Us', path: '/contact', icon: '📞' },
  { key: 'PACKAGES', label: 'Courses & Packages', path: '/packages', icon: '🎓' },
  { key: 'GALLERY', label: 'Placements & Gallery', path: '/gallery', icon: '🏆' },
  { key: 'BECOME-TUTOR', label: 'Become a Tutor', path: '/become-tutor', icon: '👩‍🏫' },
  { key: 'GLOBAL', label: 'Global / All Pages', path: '/faq', icon: '🌐' },
];
