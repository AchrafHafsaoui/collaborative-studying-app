import React from 'react';
import { render, waitFor, screen, fireEvent } from '@testing-library/react-native';
import '@testing-library/jest-dom';
import mockSafeAreaContext from 'react-native-safe-area-context/jest/mock';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import Dashboard from '../src/screens/Dashboard';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MyMeetings from '../src/screens/MyMeetings';
import SettingsScreen from '../src/screens/Settings/SettingsScreen';
import PersonalInformationScreen from '../src/screens/Settings/PersonalInformationScreen';
import { MaterialCommunityIcons } from '@expo/vector-icons';

jest.mock('@expo/vector-icons', () => ({
  MaterialCommunityIcons: jest.fn(({ name }) => <div>{name}</div>),
}));

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

  describe('DashboardScreen', () => {
    const Stack = createNativeStackNavigator();
    const mockRoute = {
        params: {
          _id: 'mockedId',
          image: 'base64-encoded-image',
          email: 'test@mail.com', 
        },
      };

    it('should render successfully', async () => {
        const { getByText, getByTestId } = render(
        <SafeAreaProvider>
            <NavigationContainer>
                <Dashboard route={mockRoute} />
            </NavigationContainer>
        </SafeAreaProvider>
        );

        const titleElement = getByText('Dashboard');
        expect(titleElement).toBeTruthy();

        const createGroupButton = getByText('Create Group');
        expect(createGroupButton).toBeTruthy();
        
        const meetingsTitle = getByText('Meetings');
        expect(meetingsTitle).toBeTruthy();
    });

    it('should navigate to screens successfully', async () => {
      const { getByText, getByTestId } = render(
            <NavigationContainer>
              <Stack.Navigator initialRouteName="Dashboard">
                <Stack.Screen name="Dashboard" component={() => <Dashboard route={mockRoute} />} />
                <Stack.Screen name="PersonalInformation" component={PersonalInformationScreen} />
                <Stack.Screen name="MyMeetings" component={MyMeetings} />
                <Stack.Screen name="Settings" component={SettingsScreen} />
              </Stack.Navigator>
            </NavigationContainer>
          );
        
      const personalInfoButton = getByTestId('personalInfoButton');
      fireEvent.press(personalInfoButton);
      await waitFor(() => {
        const personalInfoScreen = getByText('Personal Information');
        expect(personalInfoScreen).toBeTruthy();
      });
      fireEvent.press(getByTestId('goBack'));

      const settingsButton = getByTestId('settingsButton');
      fireEvent.press(settingsButton);
      await waitFor(() => {
        const settingsScreen = getByText('Settings');
        expect(settingsScreen).toBeTruthy();
      });
      fireEvent.press(getByTestId('goBack'));

      const myMeetingsButton = getByTestId('myMeetingsButton');
      fireEvent.press(myMeetingsButton);

      await waitFor(() => {
        const myMeetingsScreen = getByText('My Meetings');
        expect(myMeetingsScreen).toBeTruthy();
      });
      fireEvent.press(getByTestId('goBack'));
  });
});



