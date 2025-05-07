import { Text, StyleSheet, View, ScrollView, TouchableOpacity, Dimensions } from "react-native";
import { useTheme, Divider, Card, Avatar, Button, Appbar } from 'react-native-paper';
import React, { useEffect, useState } from 'react';
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'react-native-elements';
import axios from 'axios';
import { getGroups, checkPremiumRoute, fileListRoute, fileDownloadRoute, chatHistoryRoute, fileUploadRoute } from '../../utils/apiRoutes';
import { Linking } from "react-native"


function Dashboard({ route }) {
  const [image, setImage] = useState(route?.params?.image ? route.params.image : "");
  const theme = useTheme();
  const [groups, setGroups] = useState([]);
  const [premium, setPremium] = useState(false);
  const [upcomingMeetings, setUpcomingMeetings] = useState([]);
  const navigation = useNavigation();
  const [refresh, setRefresh] = useState(false);

  //Download group's files when QR code is scanned
  useEffect(() => {
    const downloadFiles = async () => {
      try {
        const fileResponse = await axios.get(`${fileListRoute}?identifier=${route.params.scannedData}`);
        const files = fileResponse.data;

        // A function to download files sequentially
        const downloadFilesSequentially = async (index) => {
          if (index < files.length) {
            const file = files[index];
            const url = `${fileDownloadRoute}?fileID=${file.fileID}`;
            await Linking.openURL(url);

            // Download the next file recursively
            await downloadFilesSequentially(index + 1);
          }
        };

        // Start downloading files sequentially from the first file
        await downloadFilesSequentially(0);
      } catch (error) {
        console.error(error);
      }
    };

    downloadFiles();
  }, [route.params.scannedData]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userEmail = route.params.email; // Assuming the user's email is passed in route.params.email
        const response = await axios.get(`${getGroups}?email=${userEmail}`);
        setGroups(response.data);
        const currentDate = new Date();
        const meetings = response.data
          .flatMap((group) =>
            group.meetings
              .filter((meeting) => {
                const meetingDate = new Date(`${meeting.date}T${meeting.time}`);
                return meetingDate > currentDate; // Include only future meetings
              })
              .map((meeting) => ({ ...meeting, groupName: group.groupname }))
          )
          .sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.time}`);
            const dateB = new Date(`${b.date}T${b.time}`);
            return dateA - dateB;
          });
        setUpcomingMeetings(meetings);
        axios.post(checkPremiumRoute, {
          "userId" : route.params._id
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


  const subjectToImageUrl = (subject) => {
    if (subject == 'Mathematics') {
      return "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Deus_mathematics.png/600px-Deus_mathematics.png?20210211120521";
    }
    if (subject == 'Economics') {
      return "https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Economic_indicator._from_%CE%B5%CE%BA%E2%82%AC_Hellenic_Republic.jpg/640px-Economic_indicator._from_%CE%B5%CE%BA%E2%82%AC_Hellenic_Republic.jpg";
    }
    if (subject == 'Chemistry') {
      return "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Wikipedia-zh-chemistry_logo.svg/640px-Wikipedia-zh-chemistry_logo.svg.png";
    }
    if (subject == 'Sociology') {
      return "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/WikiProject_Sociology_Babel_%28Deus_WikiProjects%29.png/640px-WikiProject_Sociology_Babel_%28Deus_WikiProjects%29.png";
    }
    if (subject == 'Biology') {
      return "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Biology_-_The_Noun_Project.svg/640px-Biology_-_The_Noun_Project.svg.png";
    }
    if (subject == 'Physics') {
      return "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Stylised_atom_with_three_Bohr_model_orbits_and_stylised_nucleus.svg/640px-Stylised_atom_with_three_Bohr_model_orbits_and_stylised_nucleus.svg.png";
    }
    if (subject == 'ComputerScience') {
      return "https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Computer_science_education.png/640px-Computer_science_education.png";
    }
    if (subject == 'Statistics') {
      return "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Standard_Normal_Distribution_uk.svg/640px-Standard_Normal_Distribution_uk.svg.png";
    }
  };

  const navigateToPersonalInformation = () => {
    navigation.navigate("PersonalInformation", route.params);
  };

  const navigateToSettings = () => {
    navigation.navigate("Settings", route.params);
  };

  const navigateToCreateGroup = () => {
    navigation.navigate("CreateGroup", route.params);
  };

  const navigateToGroup = (item) => {
    navigation.navigate("Group", { ...route.params, identifier: item.identifier, groupname: item.groupname });
  };

  const navigateToGroupDiscovery = () => {
    navigation.navigate("GroupDiscovery", route.params);
  };

  const navigateToQrCode = () => {
    navigation.navigate("ScanQRCode", route.params);
  };


  return (
    <SafeAreaView>
      <Appbar.Header>
        <Appbar.Content title="Dashboard" theme={{ colors: { background: theme.colors.background } }} />
        <TouchableOpacity
          style={{ backgroundColor: 'white', width: 25, height: 25, marginRight: 10 }}
          onPress={navigateToQrCode}
        >
          {premium&&<MaterialCommunityIcons name="qrcode" size={25} color="black" />}
        </TouchableOpacity>
        <Appbar.Action icon="refresh" onPress={() => { setRefresh(!refresh) }} />
        <Appbar.Action icon="cog" onPress={navigateToSettings} testID="settingsButton" />
        {image === "" ? (
          <Appbar.Action icon="account" onPress={navigateToPersonalInformation} testID="settingsButton" />
        ) : (
          <TouchableOpacity
            style={{ backgroundColor: 'white', width: 30, height: 30, borderRadius: 15 }}
            onPress={navigateToPersonalInformation}
            testID="personalInfoButton"
          >
            <Image
              source={{ uri: `data:image/jpeg;base64,${image}` }}
              style={{ width: 30, height: 30, borderRadius: 15, alignSelf: 'center' }}
            />
          </TouchableOpacity>
        )}
      </Appbar.Header>
      <ScrollView style={styles.container}>
        <View style={{ display: 'flex', flexDirection: 'row' }}>
          <Button icon="plus" mode="outlined" onPress={navigateToCreateGroup} style={{ width: Dimensions.get('screen').width / 2 - 20 }} >Create Group</Button>
          <Button icon="account-group" mode="contained" onPress={navigateToGroupDiscovery} style={{ width: Dimensions.get('screen').width / 2 - 20, marginLeft: 10 }} >Join Groups</Button>
        </View>
        {/*My Groups*/}
        <View>
          <Divider style={{ marginTop: 15 }}></Divider>
          <Appbar.Header>
            <Appbar.Content title="My Groups" theme={{ colors: { background: theme.colors.background } }} />
            <Button icon="arrow-right-bold-hexagon-outline" mode="outlined" style={{ width: Dimensions.get('screen').width / 3 }} onPress={() => navigation.navigate("MyGroups", route.params)}>View all</Button>
          </Appbar.Header>
          <Text style={{ color: '#a9a9a9', marginLeft: 15 }}>Your previously joined groups</Text>
          <Divider style={{ marginTop: 15 }}></Divider>
        </View>

        {/*Groups Cards*/}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {groups.slice(0, 2).map((item) => (
            <Card style={{ margin: 5, marginTop: 10, width: Dimensions.get('screen').width / 2 - 22, alignItems: 'center' }} mode="elevated" >
              {!item.image ? (
                <Card.Cover source={{ uri: subjectToImageUrl(item.subject) }} style={{ width: 150, height: 150, borderRadius: 75, alignSelf: 'center' }} />
              ) : (
                <Card.Cover
                  source={{ uri: `data:image/jpeg;base64,${item.image}` }}
                  style={{ width: 150, height: 150, borderRadius: 75, alignSelf: 'center' }}
                />
              )}
              <Card.Title title={`${item.groupname}`} subtitle={`${item.subject}`}></Card.Title>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", padding: 10, paddingTop: 0 }}>
                {Array.from({ length: 5 }).map((_, index) => (
                  <MaterialCommunityIcons
                    key={index}
                    name="star"
                    size={24}
                    color={index < Math.round(item.averageRating) ? "black" : "grey"}
                  />
                ))}
              </View>
              <Card.Actions>
                <Button
                  style={{ width: Dimensions.get('screen').width / 6 }}
                  mode="outlined"
                  labelStyle={{ fontSize: 15, fontWeight: 'bold', width: Dimensions.get('screen').width / 2 - 30 }}
                  onPress={() => navigateToGroup(item)}
                >
                  View
                </Button>
              </Card.Actions>

            </Card>
          ))}
        </View>

        <View>
          <Divider style={{ marginTop: 15 }}></Divider>
          <Appbar.Header>
            <Appbar.Content title="Meetings" theme={{ colors: { background: theme.colors.background } }} />
            <Button icon="arrow-right-bold-hexagon-outline" mode="outlined" style={{ width: Dimensions.get('screen').width / 3 }} onPress={() => navigation.navigate("MyMeetings", { ...route.params, meetings: upcomingMeetings })} testID="myMeetingsButton">View all</Button>
          </Appbar.Header>
          <Text style={{ color: '#a9a9a9', marginLeft: 15 }}>Your scheduled meetings</Text>
          <Divider style={{ marginTop: 15 }}></Divider>
        </View>

        {/*Meeting Card */}
        <View style={{ flex: 1, marginBottom: 50 }}>
          {upcomingMeetings.slice(0, 3).map((meeting, index) => (
            <Card
              key={index}
              mode="elevated"
              style={{
                width: Dimensions.get('screen').width - 30,
                alignSelf: 'center',
                justifyContent: 'center',
                paddingHorizontal: 10,
                marginTop: 10,
                marginBottom: 10,
              }}            >
              <Card.Title
                title={meeting.title}
                subtitle={`Group: ${meeting.groupName}`}
                left={(props) => <Avatar.Icon {...props} icon="account-group" />}
              />
              <Card.Content>
                <Text style={{ alignSelf: 'center' }}>{`Date: ${meeting.date} at ${meeting.time}`}</Text>
              </Card.Content>
            </Card>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView >
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 12,
    marginVertical: 25
  }
});

export default Dashboard;
