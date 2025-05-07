import React from 'react';
import { render, waitFor, screen, fireEvent } from '@testing-library/react-native';
import '@testing-library/jest-dom';
import mockSafeAreaContext from 'react-native-safe-area-context/jest/mock';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import SignUpScreen from '../src/screens/SignUpScreen';
import VerificationScreen from '../src/screens/VerificationScreen';
import axios from 'axios';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

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

describe('SignUp Screen', () => {
    const Stack = createNativeStackNavigator();

    it('should render successfully', async () => {
        const { getByText, getByPlaceholderText } = render(
            <SafeAreaProvider>
                <NavigationContainer>
                    <SignUpScreen />
                </NavigationContainer>
            </SafeAreaProvider>
        );

        // Check if the component renders the title
        const titleElement = getByText('Create new account');
        expect(titleElement).toBeTruthy();

        // Check if component renders input fields
        const nameInput = getByPlaceholderText('Name');
        const surnameInput = getByPlaceholderText('Surname');
        const emailInput = getByPlaceholderText('Email adress');
        const universityInput = getByPlaceholderText('University');
        const passwordInput = getByPlaceholderText('Password');
        const repeatPasswordInput = getByPlaceholderText('Repeat password');
        
        expect(nameInput).toBeTruthy();
        expect(surnameInput).toBeTruthy();
        expect(emailInput).toBeTruthy();
        expect(universityInput).toBeTruthy();
        expect(passwordInput).toBeTruthy();
        expect(repeatPasswordInput).toBeTruthy();

        // Check if component renders sign Up Button
        const signUpButton = getByText('Sign Up');
        expect(signUpButton).toBeTruthy();

        // Check if renders additional text
        const additionalText = getByText('If you are creating a new account, Terms & Conditions and Privacy Policy will apply.');
        expect(additionalText).toBeTruthy();

        // Trigger new input values
        fireEvent.changeText(nameInput, 'Test');
        fireEvent.changeText(surnameInput, 'User');
        fireEvent.changeText(emailInput, 'test@user.com');
        fireEvent.changeText(universityInput, 'TU Test');
        fireEvent.changeText(passwordInput, 'test123123');
        fireEvent.changeText(repeatPasswordInput, 'test123123');

        // Test if new input values are displayed
        expect(nameInput.props.value).toBe('Test');
        expect(surnameInput.props.value).toBe('User');
        expect(emailInput.props.value).toBe('test@user.com');
        expect(universityInput.props.value).toBe('TU Test');
        expect(passwordInput.props.value).toBe('test123123');
        expect(repeatPasswordInput.props.value).toBe('test123123');
    });

    it('should navigate to verification screen if signUp is successful', async () => {
        axios.post.mockResolvedValue({ data: { token: 'test-token' } });

        // Render the login screen
        const { getByText, getByTestId, getByPlaceholderText } = render(
        <SafeAreaProvider>
          <NavigationContainer>
            <Stack.Navigator initialRouteName='SignUp'>
              <Stack.Screen name="SignUp" component={SignUpScreen} />
              <Stack.Screen name="Verification" component={VerificationScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </SafeAreaProvider>
      );

        fireEvent.changeText(getByPlaceholderText('Name'), 'Test');
        fireEvent.changeText(getByPlaceholderText('Surname'), 'User');
        fireEvent.changeText(getByPlaceholderText('Email adress'), 'test@user.com');
        fireEvent.changeText(getByPlaceholderText('University'), 'TU Test');
        fireEvent.changeText(getByPlaceholderText('Password'), 'test123123');
        fireEvent.changeText(getByPlaceholderText('Repeat password'), 'test123123');

      // Click on 
      fireEvent.press(getByTestId('button'));

      // Wait for the navigation to the verification screen
      await waitFor(() => {
        expect(getByText('Verify')).toBeTruthy();
        expect(getByText('Enter the verification code sent to your email:')).toBeTruthy();
        // const verificationScreen = getByText('Verify');
        // expect(verificationScreen).toBeTruthy();
      });
    });

    it('should return error messages for empty input fields', async () => {
        const { getByText, getByPlaceholderText } = render(
            <SafeAreaProvider>
                <NavigationContainer>
                    <SignUpScreen />
                </NavigationContainer>
            </SafeAreaProvider>
        );

        // Test no name provided
        fireEvent.press(getByText('Sign Up'));

        await waitFor(() => {
            expect(getByText('No name provided')).toBeTruthy();
        });

        // Test no surname provided
        fireEvent.changeText(getByPlaceholderText('Name'), "Not empty");
        fireEvent.press(getByText('Sign Up'));

        await waitFor(() => {
            expect(getByText('No surname provided')).toBeTruthy();
        });

        // Test no university provided
        fireEvent.changeText(getByPlaceholderText('Surname'), "Not empty");
        fireEvent.press(getByText('Sign Up'));

        await waitFor(() => {
            expect(getByText('No university provided')).toBeTruthy();
        });

        // Test invalid email 
        fireEvent.changeText(getByPlaceholderText('University'), "Not empty");
        fireEvent.press(getByText('Sign Up'));

        await waitFor(() => {
            expect(getByText('Invalid email address')).toBeTruthy();
        });

        // Test password length of eight characters
        fireEvent.changeText(getByPlaceholderText('Email adress'), "test@test.com");
        fireEvent.changeText(getByPlaceholderText('Password'), "test12")
        fireEvent.press(getByText('Sign Up'));

        await waitFor(() => {
            expect(getByText('Password must be at least 8 characters long')).toBeTruthy();
        });
    });
});
