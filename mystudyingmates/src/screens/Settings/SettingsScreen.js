import { View, Text, ScrollView } from "react-native";
import { useTheme, Button, Appbar, Divider, Modal } from 'react-native-paper';
import React from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from "react-native-safe-area-context";
import { logoutRoute, deleteAccountRoute } from "../../../utils/apiRoutes";
import axios from 'axios';

function SettingsScreen ({route}) {
  const theme = useTheme();
  const navigation = useNavigation();
  const [selectedTheme, setSelectedTheme] = React.useState('light')
  const [error, setError] = React.useState('');
  const [isDeleteModalVisible, setDeleteModalVisible] = React.useState(false);

  const showDeleteModal = () => setDeleteModalVisible(true);
  const hideDeleteModal = () => setDeleteModalVisible(false);

  console.log("SettingsRoute", route);
  console.log("SettingsRoute", route.params);

  const handleThemeChange = async (theme) => {
    setSelectedTheme(theme);

    try {
      await AsyncStorage.setItem('theme', theme);
      updateTheme();
    } catch (error) {
      console.error('Error storing theme:', error);
    }
    hideDeleteModal();
  };
  
  // load the stored Theme
  React.useEffect(() => {
    const loadTheme = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem('theme');
        if(storedTheme) {
          setSelectedTheme(storedTheme);
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      }
    };

    loadTheme();
  }, []);

  //handle logout and navigate the user to the login screen
  const handleLogoutAndNavigate = () => {
    axios
      .post(logoutRoute)
      .then(res => {
        console.log(res.data);
        setError('');
        navigation.navigate('Login');
      })
      .catch(err => {
        setError('Logout failed');
      });
  };

  // handle the account deletion and navigate the user to the login screen
  const handleDeleteAccount = () => {
    axios
      .delete(deleteAccountRoute, { data: { userId: route.params._id } })
      .then((res) => {
        console.log(res.data);
        navigation.navigate("Login");
      })
      .catch((err) => {
        console.error("Delete account failed", err);
      });
  };

  // Navigation variables
  const navigateToPersonalInformation = () => {
    navigation.navigate("PersonalInformation", route.params);
  };

  const navigateToEmail = () => {
    navigation.navigate("Email", route.params);
  }

  const navigateToPremium = () => {
    navigation.navigate("Premium", route.params);
  };

  const navigateToPW = () => {
    navigation.navigate("Password", route.params);
  };

  const navigateToDeleteAccount = () => {
    console.log("Delete Account");
    //handleDeleteAccount();
  };

  const navigateToTheme = () => {
    navigation.navigate("Theme")
  };

  // add icon, text and action for the section in the screen
  const accountItems = [
    {
      icon: "account-circle",
      text: "Personal Information",
      action: navigateToPersonalInformation,
    },
    {
      icon: "email",
      text: "Email",
      action: navigateToEmail,
    },
    {
      icon: "theme-light-dark",
      text: "Theme",
      action: navigateToTheme, 
    },
  ];

  const privacyItems = [
    {
      icon: "lock",
      text: "Password",
      action: navigateToPW
    }
  ]

  const supportItems = [
    {
      icon: "credit-card",
      text: "Upgrade to Premium",
      action: navigateToPremium,
    },
    { 
      icon: "logout", 
      text: "Delete account", 
      action: navigateToDeleteAccount,
    }
  ];

  const renderButtons = (item) => {
    return (
      <View key={item.text} style={{marginBottom: 12}}>
        <Button
          icon={item.icon}
          theme={{theme}}
          contentStyle={{flexDirection: 'row', justifyContent: 'flex-start'}}
          onPress={() => {
            if (item.text === "Delete account") {
              showDeleteModal();
            } else {
              item.action();
            }
          }}
        >
          {item.text}
        </Button>
        <Divider />
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>

        <Appbar.Header>
            <Appbar.BackAction onPress={() => navigation.goBack()} testID='goBack' />
            <Appbar.Content title="Settings" theme={{ colors: { background: theme.colors.background } }} />
        </Appbar.Header>
        <ScrollView style={{ marginHorizontal: 12 }}>
            
            {/* Account Settings */}
            <Text style={{marginVertical: 10, fontSize: 16, fontWeight: "bold", color: theme.colors.primary}}>Account Settings</Text>
            <View>{accountItems.map((item) => renderButtons(item))}</View>

            {/* Privacy Settings */}
            <Text style={{ marginVertical: 10, fontSize: 16, fontWeight: "bold", color: theme.colors.primary }}>Privacy Settings</Text>
            <View>{privacyItems.map((item) => renderButtons(item))}</View>

            {/* Support Settings */}
            <Text style={{marginVertical: 10, fontSize: 16, fontWeight: "bold", color: theme.colors.primary}}>Support Settings</Text>
            <View>{supportItems.map((item) => renderButtons(item))}</View>
            
            {/* Modal for Delete Account */}
            <Modal visible={isDeleteModalVisible} onDismiss={hideDeleteModal}>
              <View style={{ padding: 20, backgroundColor: theme.colors.surface, borderRadius: 10, alignItems: 'center' }}>
                <Text style={{ textAlign: 'center', fontWeight: 'bold', color: theme.colors.primary }}>
                  Are you sure you want to delete your account?
                </Text>
                <Button mode="contained" onPress={handleDeleteAccount} style={{ marginVertical: 10, backgroundColor: theme.colors.error }}>
                  Yes, Delete
                </Button>
                <Button mode="outlined" onPress={hideDeleteModal} style={{ marginVertical: 10 }}>
                  Cancel
                </Button>
              </View>
            </Modal>

            <Button mode="contained" onPress={handleLogoutAndNavigate}>Logout</Button>
        </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsScreen;