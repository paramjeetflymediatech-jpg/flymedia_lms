import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Shadows } from '../../theme/colors';
import { User } from '../../types';
import { formatImageUrl } from '../../utils/imageUrl';
import {
  X,
  LayoutDashboard,
  BookOpen,
  PhoneCall,
  GraduationCap,
  Award,
  Users,
  Ticket,
  Pencil,
  PlusCircle,
  LogOut,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Sparkles,
  UserPlus,
  Tag,
} from 'lucide-react-native';

export type AdminTab = 'overview' | 'courses' | 'leads' | 'enrollments' | 'tutors' | 'users' | 'tools';

interface AdminDrawerModalProps {
  visible: boolean;
  onClose: () => void;
  activeTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  user: User | null;
  stats: {
    totalCourses: number;
    totalLeads: number;
    totalEnrollments: number;
    totalUsers: number;
    totalCoupons: number;
    totalTutors: number;
  };
  onOpenEditProfile: () => void;
  onAddCourse: () => void;
  onAddTutor: () => void;
  onAddUser: () => void;
  onAddCoupon: () => void;
  onLogout: () => void;
}

export const AdminDrawerModal: React.FC<AdminDrawerModalProps> = ({
  visible,
  onClose,
  activeTab,
  onSelectTab,
  user,
  stats,
  onOpenEditProfile,
  onAddCourse,
  onAddTutor,
  onAddUser,
  onAddCoupon,
  onLogout,
}) => {
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(insets.top, Platform.OS === 'ios' ? 44 : 20);
  const bottomPadding = Math.max(insets.bottom, 16);

  const handleTabPress = (tab: AdminTab) => {
    onSelectTab(tab);
    onClose();
  };

  const navItems: Array<{
    tab: AdminTab;
    label: string;
    icon: any;
    count?: number;
    color: string;
    bgColor: string;
  }> = [
    {
      tab: 'overview',
      label: 'Dashboard Overview',
      icon: LayoutDashboard,
      color: Colors.primaryRose,
      bgColor: '#FFF1F2',
    },
    {
      tab: 'courses',
      label: 'Courses & Programs',
      icon: BookOpen,
      count: stats.totalCourses,
      color: '#EA580C',
      bgColor: '#FFF7ED',
    },
    {
      tab: 'leads',
      label: 'Student Leads & Demos',
      icon: PhoneCall,
      count: stats.totalLeads,
      color: '#2563EB',
      bgColor: '#EFF6FF',
    },
    {
      tab: 'enrollments',
      label: 'Paid Enrollments',
      icon: GraduationCap,
      count: stats.totalEnrollments,
      color: '#059669',
      bgColor: '#ECFDF5',
    },
    {
      tab: 'tutors',
      label: 'Faculty & Instructors',
      icon: Award,
      count: stats.totalTutors,
      color: '#7C3AED',
      bgColor: '#F5F3FF',
    },
    {
      tab: 'users',
      label: 'User Accounts',
      icon: Users,
      count: stats.totalUsers,
      color: '#D97706',
      bgColor: '#FFFBEB',
    },
    {
      tab: 'tools',
      label: 'Coupons & Tools',
      icon: Ticket,
      count: stats.totalCoupons,
      color: '#DB2777',
      bgColor: '#FDF2F8',
    },
  ];

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        {/* Semi-transparent Backdrop: tap to close */}
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        {/* Slide-out Sidebar Drawer */}
        <View
          style={[
            styles.drawerContent,
            { paddingTop: topPadding, paddingBottom: bottomPadding },
          ]}
        >
          {/* Drawer Top Bar */}
          <View style={styles.drawerHeader}>
            <View style={{ flex: 1 }}>
              <Image
                source={require('../../assets/logo.png')}
                style={styles.drawerLogo}
                resizeMode="contain"
              />
              <View style={styles.adminRolePill}>
                <ShieldCheck size={11} color={Colors.primaryRose} />
                <Text style={styles.adminRolePillText}>ADMIN CONTROL</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Admin Profile Hero Card in Drawer */}
          <View style={styles.adminProfileCard}>
            <View style={styles.adminAvatarCol}>
              {user?.avatar ? (
                <Image
                  source={{
                    uri: user.avatar.startsWith('data:')
                      ? user.avatar
                      : formatImageUrl(user.avatar),
                  }}
                  style={styles.adminAvatarImg}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.adminAvatarFallback}>
                  <Text style={styles.adminAvatarInitial}>
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                  </Text>
                </View>
              )}
            </View>

            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.adminNameText} numberOfLines={1}>
                {user?.name || 'Administrator'}
              </Text>
              <Text style={styles.adminEmailText} numberOfLines={1}>
                {user?.email || 'admin@flymediatech.com'}
              </Text>
              {user?.phone ? (
                <Text style={styles.adminPhoneText} numberOfLines={1}>
                  📞 {user.phone}
                </Text>
              ) : null}

              <TouchableOpacity
                style={styles.editProfileBtn}
                onPress={() => {
                  onClose();
                  onOpenEditProfile();
                }}
                activeOpacity={0.8}
              >
                <Pencil size={11} color={Colors.primaryRose} />
                <Text style={styles.editProfileBtnText}>Edit Profile</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Scrollable Navigation and Actions */}
          <ScrollView
            style={styles.drawerScroll}
            contentContainerStyle={styles.drawerScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Section: Main Modules */}
            <Text style={styles.sectionHeaderLabel}>NAVIGATION MODULES</Text>
            <View style={styles.navGroup}>
              {navItems.map((item) => {
                const isActive = activeTab === item.tab;
                const IconComp = item.icon;

                return (
                  <TouchableOpacity
                    key={item.tab}
                    style={[
                      styles.navItem,
                      isActive && styles.navItemActive,
                    ]}
                    onPress={() => handleTabPress(item.tab)}
                    activeOpacity={0.75}
                  >
                    <View
                      style={[
                        styles.navIconWrap,
                        { backgroundColor: isActive ? Colors.primaryRose : item.bgColor },
                      ]}
                    >
                      <IconComp
                        size={17}
                        color={isActive ? '#ffffff' : item.color}
                        strokeWidth={isActive ? 2.4 : 1.8}
                      />
                    </View>

                    <Text
                      style={[
                        styles.navItemLabel,
                        isActive && styles.navItemLabelActive,
                      ]}
                    >
                      {item.label}
                    </Text>

                    {item.count !== undefined && (
                      <View
                        style={[
                          styles.navCountBadge,
                          isActive && styles.navCountBadgeActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.navCountBadgeText,
                            isActive && styles.navCountBadgeTextActive,
                          ]}
                        >
                          {item.count}
                        </Text>
                      </View>
                    )}

                    <ChevronRight
                      size={15}
                      color={isActive ? Colors.primaryRose : Colors.textLight}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Section: Quick Actions */}
            <Text style={[styles.sectionHeaderLabel, { marginTop: 18 }]}>
              QUICK CREATION
            </Text>
            <View style={styles.quickActionsGrid}>
              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={() => {
                  onClose();
                  onAddCourse();
                }}
                activeOpacity={0.8}
              >
                <PlusCircle size={16} color={Colors.primaryRose} />
                <Text style={styles.quickActionLabel}>New Course</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={() => {
                  onClose();
                  onAddTutor();
                }}
                activeOpacity={0.8}
              >
                <Award size={16} color="#7C3AED" />
                <Text style={styles.quickActionLabel}>Assign Tutor</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={() => {
                  onClose();
                  onAddUser();
                }}
                activeOpacity={0.8}
              >
                <UserPlus size={16} color="#2563EB" />
                <Text style={styles.quickActionLabel}>Add Student</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={() => {
                  onClose();
                  onAddCoupon();
                }}
                activeOpacity={0.8}
              >
                <Tag size={16} color="#059669" />
                <Text style={styles.quickActionLabel}>New Coupon</Text>
              </TouchableOpacity>
            </View>

            <View style={{ height: 20 }} />
          </ScrollView>

          {/* Drawer Footer with Logout & Status */}
          <View style={styles.drawerFooter}>
            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={() => {
                onClose();
                onLogout();
              }}
              activeOpacity={0.85}
            >
              <LogOut size={16} color="#DC2626" />
              <Text style={styles.logoutBtnText}>Sign Out of Admin Portal</Text>
            </TouchableOpacity>

            <View style={styles.systemStatusRow}>
              <View style={styles.systemDot} />
              <Text style={styles.systemStatusText}>
                Flymedia LMS • Cloud System Online
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
  },
  drawerContent: {
    width: '84%',
    maxWidth: 340,
    backgroundColor: '#ffffff',
    height: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 20,
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  drawerLogo: {
    width: 135,
    height: 30,
    marginBottom: 4,
  },
  adminRolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF1F2',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  adminRolePillText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: Colors.primaryRose,
    letterSpacing: 0.5,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminProfileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 10,
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  adminAvatarCol: {
    width: 48,
    height: 48,
  },
  adminAvatarImg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#FECDD3',
  },
  adminAvatarFallback: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF1F2',
    borderWidth: 1.5,
    borderColor: '#FECDD3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminAvatarInitial: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.primaryRose,
  },
  adminNameText: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  adminEmailText: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 1,
  },
  adminPhoneText: {
    fontSize: 10.5,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#FFF1F2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECDD3',
  },
  editProfileBtnText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: Colors.primaryRose,
  },
  drawerScroll: {
    flex: 1,
  },
  drawerScrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  sectionHeaderLabel: {
    fontSize: 10.5,
    fontWeight: '900',
    color: '#94A3B8',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  navGroup: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  navItemActive: {
    backgroundColor: '#FFF1F2',
  },
  navIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  navItemLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  navItemLabelActive: {
    fontWeight: '900',
    color: Colors.primaryRose,
  },
  navCountBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 6,
  },
  navCountBadgeActive: {
    backgroundColor: Colors.primaryRose,
  },
  navCountBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: Colors.textSecondary,
  },
  navCountBadgeTextActive: {
    color: '#ffffff',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickActionCard: {
    width: '48.5%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  quickActionLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  drawerFooter: {
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#ffffff',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingVertical: 11,
    borderRadius: 12,
    marginBottom: 8,
  },
  logoutBtnText: {
    color: '#DC2626',
    fontSize: 12.5,
    fontWeight: '800',
  },
  systemStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingTop: 2,
  },
  systemDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#059669',
  },
  systemStatusText: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '600',
  },
});
