import { View, ScrollView } from "react-native";
import { Button, Appbar, TextInput } from 'react-native-paper';
import { useTheme } from 'react-native-paper'; 
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState } from "react";
import { useNavigation } from '@react-navigation/native';
import Styles from "../../Styles";
import { updateEmailRoute} from "../../../utils/apiRoutes";
import axios from 'axios';

function EmailScreen ({route}) {
  const theme = useTheme();
  const navigation = useNavigation();
  const [email, setEmail] = useState(route.params.email);

  const handleUpdateEmail = async () => {
    try {
      const userId = route.params._id; 
      const response = await axios.patch(updateEmailRoute, {
        userId,
        email: email,
      });

      console.log(response.data); 
    } catch (error) {
      console.error("Save email error:", error);
    }
  };

  const itemStyle = { margin: 7, width: '95%' };
  
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Email" />
      </Appbar.Header>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20 }}>
        <View style={Styles.settingsContainer}>
        <TextInput
          placeholder="Email"
          style={itemStyle}
          mode='outlined'
          value={email}
          onChangeText={(newEmail) => setEmail(newEmail)}
        />
      </View>
        <View style={{ width: '100%', alignSelf: 'center', marginBottom: 16 }}>
          <Button mode="contained" onPress={handleUpdateEmail}>
            Save
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default EmailScreen;
