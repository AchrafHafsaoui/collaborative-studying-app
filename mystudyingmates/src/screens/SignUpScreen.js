import React, { useState } from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { registerRoute } from '../../utils/apiRoutes';
import axios from 'axios';
import { useTheme, TextInput, Button, Appbar, HelperText } from 'react-native-paper';
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from '@react-native-async-storage/async-storage';

function SignUpScreen() {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [university, setUniversity] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [error, setError] = useState('');
  const theme = useTheme();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 8;
  };

  // Communicate the inputs to the backend, if no error is thrown before
  const handleSignUp = () => {
    if (name === '') {
      setError('No name provided');
    } else if (surname === '') {
      setError('No surname provided');
    } else if (university === '') {
      setError('No university provided');
    } else if (!validateEmail(email)) {
      setError('Invalid email address');
    } else if (!validatePassword(password)) {
      setError('Password must be at least 8 characters long');
    } else if (password !== repeatPassword) {
      setError('Passwords do not match');
    } else {
      const userData = {
        email: email.toLowerCase(),
        password,
        name,
        surname,
        password,
        university,
      };
      axios
        .post(registerRoute, userData)
        .then(res => {
          setError('');
          navigation.navigate('Verification', {email});
          safeUserData(userData);
        })
        .catch(err => {
          setError(err.response.data.errors);
        });
      setError('');
    }
  };

  const safeUserData = async (userData) => {
    try {
      await AsyncStorage.setItem('email', userData.email);
      props.onThemeChange && props.onThemeChange(theme);
    } catch (error) {
      console.error('Error saving theme to AsyncStorage:', error);
    }
  };

  const itemStyle = { margin: 7 };
  return (
    <SafeAreaView>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Create new account" theme={{ colors: { background: theme.colors.background } }} />
      </Appbar.Header>

      <View style={{ marginHorizontal: 20, marginVertical: 50 }}>
        <TextInput
          placeholder="Name"
          style={itemStyle}
          value={name}
          mode='outlined'
          onChangeText={setName}
        />

        <TextInput
          placeholder="Surname"
          style={itemStyle}
          value={surname}
          mode='outlined'
          onChangeText={setSurname}
        />

        <TextInput
          placeholder="Email adress"
          style={itemStyle}
          value={email}
          mode='outlined'
          onChangeText={setEmail}
        />

        <TextInput
          placeholder="University"
          style={itemStyle}
          value={university}
          mode='outlined'
          onChangeText={setUniversity}
        />

        <TextInput
          placeholder="Password"
          style={itemStyle}
          secureTextEntry={!showPassword}
          value={password}
          mode='outlined'
          onChangeText={setPassword}
        />

        <TextInput
          placeholder="Repeat password"
          style={itemStyle}
          secureTextEntry={!showRepeatPassword}
          value={repeatPassword}
          mode='outlined'
          onChangeText={setRepeatPassword}
        />


        <Button style={itemStyle} mode="contained" onPress={handleSignUp}>  Sign Up</Button>

        {error ? <HelperText style={{ alignSelf: 'center' }} type="error">{error}</HelperText> : null}

        <HelperText style={{ textAlign: 'center', fontSize: 12, fontWeight: 'bold', padding: 15, paddingBottom: 0 }}>
          If you are creating a new account, Terms & Conditions and Privacy Policy will apply.
        </HelperText>
      </View>
    </SafeAreaView>
  );
}

export default SignUpScreen;
