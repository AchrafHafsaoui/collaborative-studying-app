import React from 'react';
import { render, waitFor, screen, fireEvent } from '@testing-library/react-native';
import '@testing-library/jest-dom';
import mockSafeAreaContext from 'react-native-safe-area-context/jest/mock';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import SettingsScreen from '../src/screens/Settings/SettingsScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ThemeScreen from '../src/screens/Settings/ThemeScreen';
import PersonalInformationScreen from '../src/screens/Settings/PersonalInformationScreen';
import EmailScreen from '../src/screens/Settings/EmailScreen';
import EmailNotificationScreen from '../src/screens/Settings/EmailNotificationScreen';
import PasswordScreen from '../src/screens/Settings/PasswordScreen';
import PushNotificationScreen from '../src/screens/Settings/PushNotificationScreen';

jest.useFakeTimers();
jest.mock('react-native-safe-area-context', () => mockSafeAreaContext);
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    getAllKeys: jest.fn(),
    multiGet: jest.fn(),
    multiSet: jest.fn(),
    multiRemove: jest.fn(),
    multiMerge: jest.fn(),
    clear: jest.fn(),
  }));

  describe('SettingsScreen', () => {
    const Stack = createNativeStackNavigator();
    const mockRoute = {
        params: {
          _id: 'testUserId',
          image: require('../assets/user.png'),
          email: 'test@mail.com'
        },
      };

    it('should render successfully', async () => {
        const { getByText } = render(
            <SafeAreaProvider>
                <NavigationContainer>
                    <Stack.Navigator initialRouteName='Settings'>
                        <Stack.Screen name="Settings" component={SettingsScreen} initialParams={mockRoute}/>
                    </Stack.Navigator>
                </NavigationContainer>
            </SafeAreaProvider>
        );

        const appbarTitle = getByText('Settings');
        expect(appbarTitle).toBeTruthy();

        const accountSettingsSection = getByText('Account Settings');
        expect(accountSettingsSection).toBeTruthy();

        const notificationSettingsSection = getByText('Notification Settings');
        expect(notificationSettingsSection).toBeTruthy();

        const privacySettingsSection = getByText('Privacy Settings');
        expect(privacySettingsSection).toBeTruthy();

        const supportSettingsSection = getByText('Support Settings');
        expect(supportSettingsSection).toBeTruthy();

        const logoutButton = getByText('Logout');
        expect(logoutButton).toBeTruthy();
    });

    it('should navigate to screens successfully', async () => {
        const { getByText } = render(
            <NavigationContainer>
              <Stack.Navigator initialRouteName="Settings">
                <Stack.Screen name="Settings" component={() => <SettingsScreen route={mockRoute} />} />
                <Stack.Screen name="Theme" component={ThemeScreen} />
                <Stack.Screen name="PersonalInformation" component={PersonalInformationScreen} />
                <Stack.Screen name="Email" component={EmailScreen} />
                <Stack.Screen name="EmailNotification" component={EmailNotificationScreen} />
                <Stack.Screen name="Password" component={PasswordScreen} />
                <Stack.Screen name="PushNotification" component={PushNotificationScreen} />
              </Stack.Navigator>
            </NavigationContainer>
          );

        const themeButton = getByText('Theme');
        const personalInfoButton = getByText('Personal Information');
        const emailButton = getByText('Email');
        const emailNotiButton = getByText('Email Notifications');
        const passwordButton = getByText('Password');
        const pushNotiButton = getByText('Push Notifications');

        fireEvent.press(themeButton);
        await waitFor(() => {
            const themeScreen = getByText('Theme Settings');
            expect(themeScreen).toBeTruthy();
        });

        fireEvent.press(personalInfoButton);
        await waitFor(() => {
            const personalInfoScreen = getByText('Personal Information');
            expect(personalInfoScreen).toBeTruthy();
        });

        fireEvent.press(emailButton);
        await waitFor(() => {
            const emailScreen = getByText('Email');
            expect(emailScreen).toBeTruthy();
        });

        fireEvent.press(emailNotiButton);
        await waitFor(() => {
            const emailNotiScreen = getByText('Email Notifications');
            expect(emailNotiScreen).toBeTruthy();
        });

        fireEvent.press(passwordButton);
        await waitFor(() => {
            const passwordScreen = getByText('Change Password');
            expect(passwordScreen).toBeTruthy();
        });

        fireEvent.press(pushNotiButton);
        await waitFor(() => {
            const pushNotiScreen = getByText('Push Notifications');
            expect(pushNotiScreen).toBeTruthy();
        });
        
    });
});


