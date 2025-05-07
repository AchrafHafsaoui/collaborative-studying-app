import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, View, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import { Divider, useTheme, Appbar, Button, Card, Title, Paragraph, Icon, Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import { Linking } from "react-native"
import FormData from 'form-data'
import { Image } from 'react-native-elements';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import axios from 'axios';
import { getGroups, fileListRoute, fileUploadRoute, fileDownloadRoute, checkPremiumRoute } from '../../../utils/apiRoutes';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const Group = ({ route }) => {
  const { colors } = useTheme();
  const [userImage, setUserImage] = useState(route?.params?.image ? route.params.image : "");
  const navigation = useNavigation();
  const [group, setGroup] = useState([]);
  const [files, setFiles] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [premium, setPremium] = useState(false);
  const meetings = {};

  useEffect(() => {
    const fetchData = async () => {
      try {
        const identifier = route.params.identifier;
        const response = await axios.get(`${getGroups}?identifier=${identifier}`);
        setGroup(response.data);
        const isAdminUser = response.data.users.some(user => user.email === route.params.email && user.isAdmin);
        setIsAdmin(isAdminUser);
        const fileResponse = await axios.get(`${fileListRoute}?identifier=${identifier}`)
        setFiles(fileResponse.data);
        axios.post(checkPremiumRoute, {
          "userId": route.params._id
        })
          .then((response) => {
            setPremium(response.data.isPremium);
          })
          .catch((error) => {
            console.log(error);
          });
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, [refresh]);

  group.meetings?.forEach((meeting, index) => {
    const dateString = meeting.date;
    meetings[dateString] = { selected: true, selectedColor: colors.primary };
  });

  LocaleConfig.locales['en'] = {
    monthNames: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    monthNamesShort: ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'Jun.', 'Jul.', 'Aug.', 'Sep.', 'Oct.', 'Nov.', 'Dec.'],
    dayNames: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    today: 'Today'
  };

  LocaleConfig.defaultLocale = 'en';

  const seeMeetings = (selectedDay) => {
    const filteredMeetings = group.meetings
      .filter(meeting => {
        return meeting.date === selectedDay;
      })
      .sort((a, b) => new Date(a.time) - new Date(b.time));

    navigation.navigate('Meeting', { ...route.params, group, meetings: filteredMeetings, day: selectedDay, isAdmin });
  };

  const uploadFile = async () => {
    var result = await DocumentPicker.getDocumentAsync({});
    if (!result.canceled) {
      let file = result.assets[0];
      const formData = new FormData();
      formData.append('identifier', route.params.identifier);
      formData.append('data', {
        uri: file.uri,
        type: file.mimeType,
        name: file.name,
      });
      axios({
        url: fileUploadRoute,
        method: 'POST',
        data: formData,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'multipart/form-data',
          'Authorization': 'Basic YnJva2VyOmJyb2tlcl8xMjM='
        }
      })
        .then(async function (response) {
          const fileResponse = await axios.get(`${fileListRoute}?identifier=${route.params.identifier}`);
          setFiles(fileResponse.data);
        })
        .catch(function (error) {
          console.log(error.response.message);
        })
    }
  };

  const downloadFile = async (fileID) => {
    const url = `${fileDownloadRoute}?fileID=${fileID}`;
    Linking.openURL(url);
  }

  const getIconForFileType = (fileType) => {
    if (fileType.includes("pdf"))
      return "file-pdf-box";
    else if (fileType.includes("image"))
      return "file-image-outline"
    else
      return "file-outline";
  }

  const navigateToSettings = () => {
    navigation.navigate("Settings", route.params);
  };

  const navigateToPersonalInformation = () => {
    navigation.navigate("PersonalInformation", route.params);
  };

  const navigateToQrCode = () => {
    navigation.navigate("GenerateQRCode", route.params);
  };

  const navigateToGroupchat = () => {
    navigation.navigate("Groupchat", { ...route.params });
  };

  const navigateToWhiteboard = () => {
    navigation.navigate("Whiteboard", { ...route.params, isAdmin });
  };

  const navigateToEditGroup = () => {
    navigation.navigate("MemberManagement", { ...route.params });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.navigate("Dashboard", route.params)} />
        <Appbar.Content title={route.params.groupname} theme={{ colors: { text: colors.text } }} />
        <TouchableOpacity
          style={{ backgroundColor: 'white', width: 25, height: 25, marginRight: 10 }}
          onPress={navigateToQrCode}
        >
          {premium && <MaterialCommunityIcons name="qrcode" size={25} color="black" />}
        </TouchableOpacity>
        <Appbar.Action icon="refresh" onPress={() => { setRefresh(!refresh) }} />
        <Appbar.Action icon="cog" onPress={navigateToSettings} />
        <TouchableOpacity
          style={{ backgroundColor: 'white', width: 30, height: 30, borderRadius: 15 }}
          onPress={navigateToPersonalInformation}
        >
          {userImage === "" ? (
            <Image source={require('../../../assets/user.png')} style={{ width: 30, height: 30, borderRadius: 15, alignSelf: 'center' }} />
          ) : (
            <Image
              source={{ uri: `data:image/jpeg;base64,${userImage}` }}
              style={{ width: 30, height: 30, borderRadius: 15, alignSelf: 'center' }}
            />
          )}
        </TouchableOpacity>
      </Appbar.Header>
      <ScrollView>
        <View style={styles.container}>
          <View style={{ flexDirection: "row", backgroundColor: colors.background }}>
            <Button
              style={{ width: Dimensions.get('screen').width / 3 - 15, marginLeft: 10 }}
              labelStyle={{ fontSize: 17, fontWeight: 'bold', width: Dimensions.get('screen').width / 2 - 15 }}
              mode="contained"
              onPress={() => navigateToGroupchat()}
            >
              Groupchat
            </Button>
            <Button
              style={{ width: Dimensions.get('screen').width / 3 - 15, marginLeft: 10 }}
              labelStyle={{ fontSize: 17, fontWeight: 'bold', width: Dimensions.get('screen').width / 2 - 15 }}
              mode="contained"
              onPress={() => navigateToWhiteboard()}
            >
              Whiteboard
            </Button>
            <Button
              style={{ width: Dimensions.get('screen').width / 3 - 15, marginLeft: 10 }}
              labelStyle={{ fontSize: 17, fontWeight: 'bold', width: Dimensions.get('screen').width / 2 - 15 }}
              mode="contained"
              onPress={() => navigateToEditGroup()}
            >
              Manage
            </Button>
          </View>
          <Calendar
            onDayPress={(day) => seeMeetings(day.dateString)}
            markedDates={meetings}
            theme={{
              todayTextColor: 'rgb(120, 69, 172)',
              arrowColor: 'rgb(120, 69, 172)',
              monthTextColor: 'rgb(120, 69, 172)',
              calendarBackground: colors.background,
              dayTextColor: colors.secondary,
              textDisabledColor: colors.backdrop
            }}
          />
          <Divider />
          <Appbar.Header>
            <Appbar.Content title="Shared Files" theme={{ colors: { text: colors.text, background: colors.background } }} />
            <Button icon="upload" mode="outlined" onPress={() => uploadFile()} style={{ width: Dimensions.get('screen').width / 3 }}>Upload</Button>
          </Appbar.Header>
          <Divider />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 10 }}>
          {files?.map((file, index) => (
            <Card key={index} style={{ marginLeft: 10, marginRight: 10, marginBottom: 5, width: 130 }} onPress={() => downloadFile(file.fileID)}>
              <Card.Content>
                <Icon source={getIconForFileType(file.contentType)} size={40} />
                <Text style={{ marginTop: 5 }}>{`${file.name}`}</Text>
              </Card.Content>
            </Card>
          ))}
        </ScrollView>

        <View>
          <Divider style={{ marginTop: 10 }}></Divider>
          <Appbar.Header>
            <Appbar.Content title="Ratings" theme={{ colors: { text: colors.text, background: colors.background } }} />
            <Button icon="arrow-right-bold-hexagon-outline" mode="outlined" style={{ width: Dimensions.get('screen').width / 3 }} onPress={() => navigation.navigate("Rating", { ...route.params, group })}>Rate</Button>
          </Appbar.Header>
          <Divider />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 10 }}>
          {group.ratings?.map((rating, index) => (
            <Card key={index} style={{ marginLeft: 10, marginRight: 10, marginBottom: 70 }}>
              <Card.Content>
                <Title>{rating.user}</Title>
                <Paragraph>{`Rating: ${rating.rating}`}</Paragraph>
                <Paragraph>{`Review: ${rating.review}`}</Paragraph>
              </Card.Content>
            </Card>
          ))}
        </ScrollView>
      </ScrollView >
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
  },
});

export default Group;
