import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { Appbar, TouchableRipple, RadioButton, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

function ThemeScreen(props) {
  const navigation = useNavigation();
  const [selectedTheme, setSelectedTheme] = useState('System');
  const [loading, setLoading] = useState(true);

  const handleLocalThemeChange = async (theme) => {
    setSelectedTheme(theme);
    try {
      await AsyncStorage.setItem('selectedTheme', theme);
      props.onThemeChange && props.onThemeChange(theme);
    } catch (error) {
      console.error('Error saving theme to AsyncStorage:', error);
    }
  };

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem('selectedTheme');
        if (storedTheme !== null) {
          setSelectedTheme(storedTheme);
        } else {
          setSelectedTheme(props.selectedTheme || 'light'); 
        }
      } catch (error) {
        console.error('Error loading theme from AsyncStorage:', error);
      } finally {
        setLoading(false);
      }
    };
  
    loadTheme();

  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Theme Settings" />
      </Appbar.Header>

      <TouchableRipple
        onPress={() => handleLocalThemeChange('Light')}
        rippleColor="rgba(0, 0, 0, 0.1)"
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 16,
          }}
        >
          <Text>Light</Text>
          <RadioButton
            value="Light"
            status={selectedTheme === 'Light' ? 'checked' : 'unchecked'}
            onPress={() => handleLocalThemeChange('Light')}
          />
        </View>
      </TouchableRipple>

      <TouchableRipple
        onPress={() => handleLocalThemeChange('Dark')}
        rippleColor="rgba(0, 0, 0, 0.1)"
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 16,
          }}
        >
          <Text>Dark</Text>
          <RadioButton
            value="Dark"
            status={selectedTheme === 'Dark' ? 'checked' : 'unchecked'}
            onPress={() => handleLocalThemeChange('Dark')}
          />
        </View>
      </TouchableRipple>
    </SafeAreaView>
  );
}

export default ThemeScreen;
