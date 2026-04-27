import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStaticNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Image } from 'react-native';
import { HomePage } from './screens/HomePage/Home';
import { Login } from "./screens/LoginPage/Login";
import { Profile } from './screens/ProfilePage/Profile';
import { Actions } from './screens/ActionsPage/Actions';
import { Events } from './screens/EventsPage/EventScreen';
import { NotFound } from './screens/NotFound';
import { AdminPage } from './screens/AdminPage/Admin';
import { AttendancePage } from './screens/AttendancePage/Attendance';
import { PublicProfile } from "./screens/SearchPage/PublicProfiles";
import { QuickLinks } from "./screens/QuickLinks";
import { DarkColors as colors } from '../styles/colors';

import calendar from '../assets/calendar.png';
import newspaper from '../assets/newspaper.png';
import profile from '../assets/profile.png';
import briefcase from '../assets/briefcase.png';
import ChangePasswordScreen from './screens/changepassword';

const createTabIcon = (source: any) => ({
  tabBarIcon: ({ color, size }: { color: string; size: number }) => (
    <Image
      source={source}
      tintColor={color}
      style={{ width: size, height: size }}
    />
  ),
});

const HomeTabs = createBottomTabNavigator({
  screenOptions: {
    tabBarStyle: {
      backgroundColor: colors.background,
    },
    tabBarActiveTintColor: '#FFFFFF',
    tabBarInactiveTintColor: '#9AA3B2',
  },
  screens: {
    Home: {
      screen: HomePage,
      options: {
        title: 'Home',
        headerShown: false,
        ...createTabIcon(newspaper),
      },
    },
    Events: {
      screen: Events,
      options: {
        title: 'Events',
        headerShown: false,
        ...createTabIcon(calendar),
      },
    },
    Actions: {
      screen: Actions,
      options: {
        title: "Actions",
        headerShown: false,
        tabBarIcon: ({ color, size }) => (
          <Image
            source={briefcase}
            tintColor={color}
            style={{ width: size, height: size }}
          />
        ),
      },
    },
    Profile: {
      screen: Profile,
      options: {
        title: 'Profile',
        headerShown: false,
        ...createTabIcon(profile),
      },
    },
  },
});

const RootStack = createNativeStackNavigator({
  screens: {
    Login: {
      screen: Login,
      options: { headerShown: false },
    },
    HomeTabs: {
      screen: HomeTabs,
      options: {
        title: "Home",
        headerShown: false,
      },
    },
    Admin: {
      screen: AdminPage,
      options: {
        title: "Admin Page",
        headerShown: false,
      },
    },
    Attendance: {
      screen: AttendancePage,
      options: {
        title: "Attendance Page",
        headerShown: false,
      }
    },
    PublicProfile: {
      screen: PublicProfile,
      options: {
        title: "Public Profile",
        headerShown: false,
      },
    },
    QuickLinks: {
      screen: QuickLinks,
      options: {
        title: "Quick Links",
        headerShown: false,
      },
    },
    ChangePassword: {
      screen: ChangePasswordScreen,
      options: { title: "Change Password" },
    },
    NotFound: {
      screen: NotFound,
      options: { title: "404" },
      linking: { path: "*" },
    },
  },
});

export const Navigation = createStaticNavigation(RootStack);

export type RootStackParamList = {
  Login: undefined;
  HomeTabs: undefined;
  Admin: undefined;
  Attendance: undefined;
  PublicProfile: { cadetKey: string };
  QuickLinks: undefined;
  ChangePassword: undefined;
  NotFound: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}