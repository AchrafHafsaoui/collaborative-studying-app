import React, { useState } from 'react';
import { View, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { loginRoute } from '../../utils/apiRoutes';
import axios from 'axios';
import { useTheme, Text, Divider, TextInput, Button, HelperText } from 'react-native-paper';
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from "expo-image";


function LoginScreen() {
  const navigation = useNavigation();
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const theme = useTheme();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSignInAndNavigate = () => {
    const userData = {
      email: email.toLowerCase(),
      password
    };

    axios
      .post(loginRoute, userData)
      .then(res => {
        setError('');
        safeUserData(userData);
        navigation.navigate('Dashboard', res.data);
      })
      .catch(err => {
        if (err.response && err.response.status === 401 && err.response.data.errors === "Email not verified. Please check your email for verification instructions.") {
          // Login failed due to email not verified
          navigation.navigate('Verification', {email});
        } else {
          setError('Login failed');
        }
      });
  };


  const safeUserData = async (userData) => {
    try {
      await AsyncStorage.setItem('email', userData.email);
    } catch (error) {
      console.error('Error saving userData to AsyncStorage:', error);
    }
  };

  const itemStyle = { margin: 7 };
  return (
    <SafeAreaView>
      <Text style={{ textAlign: 'center', fontSize: 30, fontWeight: 'bold', padding: 20, paddingBottom: 0 }}>Login or Signup</Text>
      <Divider style={{ margin: 15 }}></Divider>
      <View style={{ justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
        <Image source={{uri: "https://i.ibb.co/JHv4y3m/logo.png"}} style={{ width: Dimensions.get('screen').width/2, height: Dimensions.get('screen').width/2}} />
      </View>
      <Divider style={{ margin: 15 }}></Divider>
      <View style={{ marginHorizontal: 20 }}>
        <TextInput
          placeholder="Email address"
          style={itemStyle}
          mode='outlined'
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          placeholder="Password"
          style={itemStyle}
          mode='outlined'
          placeholderTextColor="grey"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />

        <Button onPress={handleSignInAndNavigate} mode="contained" style={itemStyle} >Continue</Button>
        {error ? <HelperText type="error">{error}</HelperText> : null}

        <Text style={{ textAlign: 'center', margin: 7 }} variant="titleLarge">Or</Text>

        <Button onPress={() => navigation.navigate('SignUp')} mode="contained" style={itemStyle}> Sign Up </Button>

        <HelperText style={{ textAlign: 'center', fontSize: 12, fontWeight: 'bold', padding: 15, paddingBottom: 0 }}>
          If you are creating a new account, Terms & Conditions and Privacy Policy will apply.
        </HelperText>
      </View>
    </SafeAreaView>
  );
}

export default LoginScreen;
