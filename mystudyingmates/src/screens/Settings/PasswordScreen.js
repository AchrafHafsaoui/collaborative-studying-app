import React, { useState } from "react";
import { View, ScrollView } from "react-native";
import { Button, Appbar, Snackbar, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { updatePasswordRoute } from "../../../utils/apiRoutes";
import axios from "axios";
import Styles from "../../Styles";

function PasswordScreen({route}) {
  const navigation = useNavigation();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const handleUpdatePassword = async () => {

    if (newPassword !== confirmNewPassword) {
      setSnackbarMessage("New password and confirm new password do not match");
      setSnackbarVisible(true);
      return;
    }

    // try to update the password
    try {
      const userId = route.params._id;
      const response = await axios.patch(updatePasswordRoute, {
        userId,
        oldPassword,
        newPassword,
      });

      console.log(response.data);

      setSnackbarMessage("Password updated successfully");
      setSnackbarVisible(true);
    } catch (error) {
      console.error("Update password error:", error);
      console.log("Axios response error:", error.response); //Debug
      setSnackbarMessage("Failed to update password");
      setSnackbarVisible(true);
    }
  };

  const itemStyle = { margin: 7, width: '95%' };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Change Password" />
      </Appbar.Header>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20 }}>
        <View style={Styles.settingsContainer}>
          <TextInput
            placeholder="Old Password"
            style={itemStyle}
            mode="outlined"
            secureTextEntry={!showOldPassword}
            value={oldPassword}
            onChangeText={(text) => setOldPassword(text)}
            right={
              <TextInput.Icon
    name={showOldPassword ? 'eye-off' : 'eye'}
    onPress={() => setShowOldPassword(!showOldPassword)}
    color="gray"
    style={{ zIndex: 1 }}
  />
          }
          />
        </View>
        <View style={Styles.settingsContainer}>
          <TextInput
            placeholder="New Password"
            style={itemStyle}
            mode="outlined"
            secureTextEntry={!showNewPassword}
            value={newPassword}
            onChangeText={(text) => setNewPassword(text)}
            right={
              <TextInput.Icon
                name={showNewPassword ? 'eye-off' : 'eye'}
                onPress={() => setShowNewPassword(!showNewPassword)}
                color="gray" 
              />
            }
          />
        </View>
        <View style={Styles.settingsContainer}>
          <TextInput
            placeholder="Confirm New Password"
            style={itemStyle}
            mode="outlined"
            secureTextEntry={!showConfirmNewPassword}
            value={confirmNewPassword}
            onChangeText={(text) => setConfirmNewPassword(text)}
            right={
              <TextInput.Icon
                name={showConfirmNewPassword ? 'eye-off' : 'eye'}
                onPress={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                color="gray"
              />
            }
          />
        </View>
        <View style={{ width: '100%', alignSelf: 'center', marginVertical: 16 }}>
          <Button mode="contained" onPress={handleUpdatePassword}>
            Save
          </Button>
        </View>
      </ScrollView>
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        action={{
          label: 'OK',
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {snackbarMessage}
      </Snackbar>
    </SafeAreaView>
  );
}

export default PasswordScreen;
