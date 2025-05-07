import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import '@testing-library/jest-dom';
import mockSafeAreaContext from 'react-native-safe-area-context/jest/mock';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import LoginScreen from '../src/screens/LoginScreen';
import SignUpScreen from '../src/screens/SignUpScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Dashboard from '../src/screens/Dashboard';
import axios from 'axios';
import { loginRoute } from '../utils/apiRoutes';
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
jest.mock('axios');

describe('Login Test', () => {
  const Stack = createNativeStackNavigator();

    it('should render successfully', async () => {
      const { getByText, getByRole, getByPlaceholderText} = render(
        <SafeAreaProvider>
            <NavigationContainer>
              <LoginScreen />
          </NavigationContainer>
        </SafeAreaProvider>
      );

     expect(getByText('Login or Signup')).toBeTruthy();
     expect(getByPlaceholderText('Email address')).toBeTruthy();
     expect(getByPlaceholderText('Password')).toBeTruthy();
     expect(getByText('Continue')).toBeTruthy();
     expect(getByText('Sign Up')).toBeTruthy(); 
    });

    it('should navigate to signUp screen after clicking on signUp button', async () => {
      const { getByText } = render(
        <SafeAreaProvider>
          <NavigationContainer>
            <Stack.Navigator initialRouteName='Login' screenOptions={{ headerShown: false }}>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="SignUp" component={SignUpScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </SafeAreaProvider>
      );

      // Click on Sign Up
      fireEvent.press(getByText('Sign Up'));

      // Test if rendered
      await waitFor(() => {
        const signUpScreen = getByText('Create new account');
        expect(signUpScreen).toBeTruthy();
      });
    });

    it('should return error if mocked no existent inputs', async () => {
      axios.post.mockRejectedValue({ response: { data: { errors: 'Login failed' } } });
      
      // Render the LoginScreen with mocked axios
      const { getByText } = render(
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName='Login'>
            <Stack.Screen name="Login" component={LoginScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    );

    // Trigger the login attempt by pressing the "Continue" button
    const continueButton = getByText('Continue');
    fireEvent.press(continueButton);

    // Wait for the error message to be displayed
    await waitFor(() => {
      const errorText = getByText('Login failed');
      console.log("errorText", errorText);
      expect(errorText).toBeTruthy();
    });
  });

  it('should return error if account not registered', async () => {
    axios.post.mockRejectedValue({ response: { data: { errors: 'Login failed' } } });

    // Render the screen
    const { getByText, getByPlaceholderText } = render(
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName='Login'>
            <Stack.Screen name="Login" component={LoginScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    );

    // Trigger the login attempt with unregistered email
    const emailInput = getByPlaceholderText('Email address');
    const continueButton = getByText('Continue');

    fireEvent.changeText(emailInput, 'unregistered@test.com');
    fireEvent.press(continueButton);

    // Expect error message
    await waitFor(() => {
      const errorText = getByText('Login failed');
      expect(errorText).toBeTruthy();
    });
  
  });

    it('should login and navigate to whiteboard for existent user', async () => {
      axios.post.mockResolvedValue({ data: { token: 'test-token' } });

      // Render the login screen
      const { getByText, getByPlaceholderText } = render(
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName='Login'>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Dashboard" component={Dashboard} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    );

      // Trigger the login attempt by entering a registered email and pressing the "Continue" button
      const emailInput = getByPlaceholderText('Email address');
      const passwordInput = getByPlaceholderText('Password');
      const continueButton = getByText('Continue');

      fireEvent.changeText(emailInput, 'registered@mail.com');
      fireEvent.changeText(passwordInput, 'testPassword123123')
      fireEvent.press(continueButton);

      // Wait for the navigation to the dashboard screen
      await waitFor(() => {
        const dashboardScreen = getByText('Dashboard');
        expect(dashboardScreen).toBeTruthy();
      });

      // Test axios post
      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith(loginRoute, {
          email: 'registered@mail.com',
          password: 'testPassword123123',
        });
      });
  });
});
