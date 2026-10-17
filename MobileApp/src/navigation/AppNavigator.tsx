import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/HomeScreen';
import { CoursesScreen } from '../screens/CoursesScreen';
import { CourseDetailScreen } from '../screens/CourseDetailScreen';
import { MyLearningScreen } from '../screens/MyLearningScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { AdminDashboardScreen } from '../screens/admin';
import { StudentPanelScreen } from '../screens/StudentPanelScreen';
import { TutorPanelScreen } from '../screens/tutor';
import { Colors } from '../theme/colors';
import { Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import {
  Home,
  BookOpen,
  GraduationCap,
  User,
} from 'lucide-react-native';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabIconItem({
  Icon,
  color,
  focused,
}: {
  Icon: any;
  color: string;
  focused: boolean;
}) {
  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        width: 44,
        height: 28,
        borderRadius: 14,
        backgroundColor: focused ? 'rgba(230, 8, 112, 0.12)' : 'transparent',
      }}
    >
      <Icon size={20} color={color} strokeWidth={focused ? 2.4 : 1.8} />
    </View>
  );
}

function MainTabs() {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, Platform.OS === 'ios' ? 16 : 8);
  const { user } = useAuth();
  const isTutor = user?.role === 'TUTOR';
  const isAdmin = user?.role === 'ADMIN';

  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primaryRose,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#f1f5f9',
          borderTopWidth: 1,
          height: 60 + bottomInset,
          paddingBottom: bottomInset + 4,
          paddingTop: 8,
          shadowColor: '#0f172a',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          marginTop: 2,
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabIconItem Icon={Home} color={color} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="CoursesTab"
        component={CoursesScreen}
        options={{
          tabBarLabel: 'Courses',
          tabBarIcon: ({ color, focused }) => (
            <TabIconItem Icon={BookOpen} color={color} focused={focused} />
          ),
        }}
      />
      {!isTutor && !isAdmin && (
        <Tab.Screen
          name="MyLearningTab"
          component={MyLearningScreen}
          options={{
            tabBarLabel: 'Learning',
            tabBarIcon: ({ color, focused }) => (
              <TabIconItem Icon={GraduationCap} color={color} focused={focused} />
            ),
          }}
        />
      )}
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <TabIconItem Icon={User} color={color} focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  const { user } = useAuth();
  const isTutor = user?.role === 'TUTOR';
  const isAdmin = user?.role === 'ADMIN';

  const userKey = user ? (isAdmin ? 'admin' : isTutor ? 'tutor' : 'user') : 'guest';

  return (
    <Stack.Navigator
      key={userKey}
      screenOptions={{
        headerShown: false,
      }}
    >
      {isAdmin ? (
        <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
      ) : isTutor ? (
        <Stack.Screen name="TutorPanel" component={TutorPanelScreen} />
      ) : (
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen
            name="CourseDetail"
            component={CourseDetailScreen}
            options={{
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="StudentPanel"
            component={StudentPanelScreen}
            options={{
              animation: 'slide_from_right',
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

