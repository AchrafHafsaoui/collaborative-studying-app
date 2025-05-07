import { View, ScrollView, TouchableOpacity } from "react-native";
import { Button, Appbar } from 'react-native-paper';
import { useTheme, TextInput } from 'react-native-paper';
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState } from "react";
import { useNavigation } from '@react-navigation/native';
import Styles from "../../Styles";
import { updateNameRoute, updateImageRoute } from "../../../utils/apiRoutes";
import axios from 'axios';
import { Image } from 'react-native-elements';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

function PersonalInformationScreen({ route }) {
  const theme = useTheme();
  const navigation = useNavigation();
  const [image, setImage] = useState(route.params.image ? route.params.image : "");
  const [firstName, setFirstName] = React.useState(route.params.name);
  const [lastName, setLastName] = React.useState(route.params.surname);

  const handleUpdateNames = async () => {
    // try to update the name
    try {
      const userId = route.params._id;
      const response = await axios.patch(updateNameRoute, {
        userId,
        name: firstName,
        surname: lastName,
      });

      console.log(response.data);
    } catch (error) {
      console.error("Save names error:", error);
    }
  };

  const handleChangeImage = async (image) => {
    // try to update the image
    try {
      const userId = route.params._id;
      const response = await axios.patch(updateImageRoute, {
        userId,
        image
      });

      console.log(response.data);
    } catch (error) {
      console.error("Save names error:", error);
    }
  };

  const itemStyle = { margin: 7, marginTop: 1, width: '95%' };

  const changeImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        alert('Permission to access the gallery is required!');
        return;
      }

      const imageResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.1,
      });

      if (!imageResult.canceled) {
        const selectedAsset = imageResult.assets[0];
        const { uri } = selectedAsset;

        const base64ImageData = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        handleChangeImage(base64ImageData);

      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} testID='goBack' />
        <Appbar.Content title="Personal Information" />
      </Appbar.Header>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20 }}>
        <View style={[Styles.settingsContainer, { justifyContent: 'center' }]}>
          
          {image === "" ? (
            <Appbar.Action icon="account" onPress={changeImage} testID="settingsButton" size={75} />
          ) : (
            <TouchableOpacity
              style={{ backgroundColor: 'white', width: 150, height:150, borderRadius: 75 }}
              onPress={changeImage}
              testID="personalInfoButton"
            >
              <Image
                source={{ uri: `data:image/jpeg;base64,${image}` }}
                style={{ width: 150, height: 150, borderRadius: 75, alignSelf: 'center' }}
              />
            </TouchableOpacity>
          )}
        </View>
        <View style={Styles.settingsContainer}>
          <TextInput
            placeholder="First Name"
            mode='outlined'
            value={firstName}
            onChangeText={(text) => setFirstName(text)}
            style={itemStyle}
          />
        </View>
        <View style={Styles.settingsContainer}>
          <TextInput
            placeholder="Last Name"
            mode='outlined'
            value={lastName}
            onChangeText={(text) => setLastName(text)}
            style={itemStyle}
          />
        </View>

        <View style={{ width: '100%', alignSelf: 'center', marginBottom: 16 }}>
          <Button mode="contained" onPress={handleUpdateNames}>
            Save
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default PersonalInformationScreen;
