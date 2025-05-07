import React, { useEffect} from 'react';
import { useColorScheme } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import LoginScreen from './src/screens/LoginScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import GroupchatScreen from './src/screens/GroupchatScreen.js';
import MyMeetings from './src/screens/MyMeetings.js';
import Whiteboard from './src/screens/WhiteboardScreen.js';
import Group from './src/screens/GroupMangement/Group.js';
import GenerateQRCode from './src/screens/GroupMangement/GenerateQRCodeScreen.js';
import Rating from './src/screens/GroupMangement/RatingScreen.js';
import Meeting from './src/screens/GroupMangement/Meeting.js';
import MemberManagementScreen from './src/screens/GroupMangement/Membermangement.js';
import PersonalInformationScreen from './src/screens/Settings/PersonalInformationScreen.js';
import EmailScreen from './src/screens/Settings/EmailScreen.js';
import PasswordScreen from './src/screens/Settings/PasswordScreen.js';
import SettingsScreen from './src/screens/Settings/SettingsScreen.js';
import GroupDiscovery from './src/screens/GroupDiscovery.js';
import MyGroups from './src/screens/MyGroups.js';
import ThemeScreen from './src/screens/Settings/ThemeScreen.js';
import Dashboard from './src/screens/Dashboard';
import ScanQRCode from './src/screens/ScanQRCodeScreen.js';
import Verification from './src/screens/VerificationScreen.js';
import { PaperProvider } from 'react-native-paper';
import { LightScheme } from './src/theme/lightScheme.js';
import { DarkScheme } from './src/theme/darkScheme.js';
import { StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CreateGroup from './src/screens/CreateGroup.js';
import PremiumScreen from './src/screens/Settings/PremiumScreen.js';


export default function App() {
  StatusBar.setHidden(true);

  const Stack = createNativeStackNavigator();
  const deviceColorScheme = useColorScheme();
  const [selectedTheme, setSelectedTheme] = React.useState('System');

  const loadThemeFromStorage = async () => {
    try {
      const storedTheme = await AsyncStorage.getItem('selectedTheme');
      return storedTheme || (deviceColorScheme === 'dark' ? 'dark' : 'light');
    } catch (error) {
      console.error('Error loading theme from AsyncStorage:', error);
      return deviceColorScheme === 'dark' ? 'dark' : 'light';
    }
  };

  useEffect(() => {
    const initializeTheme = async () => {
      const theme = await loadThemeFromStorage();
      setSelectedTheme(theme);
    };

    initializeTheme();
  }, []);

  const handleThemeChange = async (theme) => {
    setSelectedTheme(theme);
    try {
      await AsyncStorage.setItem('selectedTheme', theme);
    } catch (error) {
      console.error('Error saving theme to AsyncStorage:', error);
    }
  };

  const appTheme = selectedTheme === 'Dark' ? DarkScheme : LightScheme;
  
  return (
    <PaperProvider theme={appTheme}>
      <NavigationContainer theme={appTheme}>
        <Stack.Navigator initialRouteName='Login' screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen name="Dashboard" component={Dashboard} />
          <Stack.Screen name="Verification" component={Verification} />
          <Stack.Screen name="Groupchat" component={GroupchatScreen} />
          <Stack.Screen name="Whiteboard" component={Whiteboard} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="PersonalInformation" component={PersonalInformationScreen} />
          <Stack.Screen name="MyGroups" component={MyGroups} />
          <Stack.Screen name="MyMeetings" component={MyMeetings} />
          <Stack.Screen name="CreateGroup" component={CreateGroup} />
          <Stack.Screen name="Group" component={Group} />
          <Stack.Screen name="GenerateQRCode" component={GenerateQRCode} />
          <Stack.Screen name="ScanQRCode" component={ScanQRCode} />
          <Stack.Screen name="Rating" component={Rating} />
          <Stack.Screen name="Meeting" component={Meeting} />
          <Stack.Screen name="Theme">
            {props => <ThemeScreen {...props} onThemeChange={handleThemeChange} />}
          </Stack.Screen>
          <Stack.Screen name="Email" component={EmailScreen} />
          <Stack.Screen name="Password" component={PasswordScreen} />
          <Stack.Screen name="MemberManagement" component={MemberManagementScreen} />
          <Stack.Screen name="Premium" component={PremiumScreen} />
          <Stack.Screen name="GroupDiscovery" component={GroupDiscovery} />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
