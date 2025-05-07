import React, { useEffect, useState } from 'react';
import { Switch, StyleSheet, View, Dimensions, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Avatar, useTheme, Appbar, Card, Button, Divider } from 'react-native-paper';
import { getGroups, server, getPublic, updateGroupImageRoute } from '../../../utils/apiRoutes';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { io } from "socket.io-client";
import { Image } from 'react-native-elements';
import Styles from "../../Styles";
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';


const MemberManagementScreen = ({ route }) => {

  const navigation = useNavigation();
  const [userImage, setUserImage] = useState(route?.params?.image ? route.params.image : "");
  const [image, setImage] = useState("");
  const socket = io(server);
  const [isPublic, setIsPublic] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const theme = useTheme();
  const [admins, setAdmins] = useState([]);
  const [members, setMembers] = useState([]);
  const [pending, setPending] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [subject, setSubject] = useState("");
  const [identifier, setIdentifier] = useState(-1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const identifier = route.params.identifier;
        const response = await axios.get(`${getGroups}?identifier=${identifier}`);
        setAdmins(response.data.users.filter((member) => member.isAdmin === true));
        setMembers(response.data.users.filter((member) => member.isAdmin === false));
        setPending(response.data.pending);
        const isAdminUser = response.data.users.some(
          (member) => member.email === route.params.email && member.isAdmin === true
        );
        setIsAdmin(isAdminUser);
        setImage(response.data.image);
        setSubject(response.data.subject);
        setIdentifier(response.data.identifier);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [isPublic, refresh]);

  const changePublic = () => {
    if (isAdmin) {
      socket.emit('changePublic', { identifier: route.params.identifier });
    }
  };

  const exitGroup = (user) => {
    if (!isAdmin) {
      socket.emit('removeMember', { identifier: route.params.identifier, user: user });
      navigation.navigate("Dashboard", route.params);
    }
    else setErrorMessage("Admins can not exit the group. Demote yourself first!");
  };

  const removeMember = (user) => {
    socket.emit('removeMember', { identifier: route.params.identifier, user: user });
  };

  const pullPublic = () => {
    axios.post(getPublic, {
      "identifier": route.params.identifier
    })
      .then((response) => {
        setIsPublic(!response.data.public);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  useEffect(() => {
    pullPublic();
  }, []);

  //handle server updates
  useEffect(() => {
    const handleNewPublic = () => {
      try {
        pullPublic()
      } catch (e) {
        console.log(e.message);
      }
    };
    const handleMemberChange = () => {
      try {
        setRefresh(!refresh);
      } catch (e) {
        console.log(e.message);
      }
    };

    socket.on('publicChanged', handleNewPublic);
    socket.on('join', handleMemberChange);
    socket.on('adminChanged', handleMemberChange);

    return () => {
      socket.off('publicChanged', handleNewPublic);
      socket.off('join', handleMemberChange);
      socket.off('adminChanged', handleMemberChange);

    };
  }, []);

  function acceptUser(user) {
    socket.emit('joinGroup', { identifier: route.params.identifier, user: user, accepted: true });
  }

  function rejectUser(user) {
    socket.emit('joinGroup', { identifier: route.params.identifier, user: user, rejected: true });
  }

  function makeAdmin(user) {
    socket.emit('changeAdmin', { identifier: route.params.identifier, user: user, promoted: true });
  }
  function removeAdmin(user) {
    socket.emit('changeAdmin', { identifier: route.params.identifier, user: user, promoted: false });
  }

  function rejectUser(user) {
    socket.emit('joinGroup', { identifier: route.params.identifier, user: user, rejected: true });
  }

  const navigateToSettings = () => {
    navigation.navigate("Settings", route.params);
  };

  const navigateToPersonalInformation = () => {
    navigation.navigate("PersonalInformation", route.params);
  };

  const changeImage = async () => {
    try {
      if (isAdmin) {
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
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  const handleChangeImage = async (image) => {
    try {
      const response = await axios.patch(updateGroupImageRoute, {
        identifier,
        image
      });
      setRefresh(true);
    } catch (error) {
      console.error("update image error:", error);
    }
  };

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

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={"Members"} theme={{ colors: { background: theme.colors.background } }} />
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

      <ScrollView style={{ marginBottom: 50, marginHorizontal: 15 }}>
        <Divider style={{ marginVertical: 15 }}></Divider>
        <View style={[Styles.settingsContainer, { justifyContent: 'center' }]}>
          <TouchableOpacity
            style={{ backgroundColor: 'white', width: 150, height: 150, borderRadius: 75 }}
            onPress={changeImage}
            testID="personalInfoButton"
          >
            {image === "" ? (
              <Image source={{ uri: subjectToImageUrl(subject) }} style={{ width: 150, height: 150, borderRadius: 75, alignSelf: 'center' }} />
            ) : (

              <Image
                source={{ uri: `data:image/jpeg;base64,${image}` }}
                style={{ width: 150, height: 150, borderRadius: 75, alignSelf: 'center' }}
              />

            )}
          </TouchableOpacity>
        </View>
        <Divider style={{ marginVertical: 15 }}></Divider>
        <Button
          onPress={() => exitGroup(route.params.email)}
          style={{
            alignSelf: 'center',
            width: Dimensions.get('screen').width / 3,
            borderWidth: 1,
            borderColor: 'black'
          }}
        >
          Exit Group
        </Button>
        {errorMessage ? <Text style={{ color: 'red', alignSelf: 'center', marginBottom: 10 }}>{errorMessage}</Text> : null}
        <View>
          <Text style={[styles.admintext, { color: theme.colors.onBackground }]}>Admins</Text>
        </View>
        <View>
          {admins
            .map((item, index) => (
              <Card key={index} style={{ marginVertical: 5 }}>
                <Card.Title
                  title={admins[index].email}
                  left={(props) => <Avatar.Icon {...props} icon="account" />}
                />
                {isAdmin && admins.length > 1 && (<Card.Actions>
                  <Button onPress={() => removeAdmin(admins[index].email)}>Demote</Button>
                </Card.Actions>)}
              </Card>
            ))}
        </View>

        <View style={[styles.memberslistContainer, { backgroundColor: theme.colors.background }]}>
          <Text style={[styles.memberstext, { color: theme.colors.onBackground }]}>Members</Text>
          <View>
            {members
              .map((item, index) => (
                <Card key={index} style={{ marginVertical: 5 }}>
                  <Card.Title
                    title={members[index].email}
                    left={(props) => <Avatar.Icon {...props} icon="account" />}
                  />
                  {isAdmin && (<Card.Actions>
                    <Button onPress={() => removeMember(members[index].email)}>Remove</Button>
                    <Button onPress={() => makeAdmin(members[index].email)}>Promote</Button>
                  </Card.Actions>)}
                </Card>
              ))}
          </View>
        </View>

        <View style={{ marginTop: 30, backgroundColor: theme.colors.background, flexDirection: 'row', alignItems: 'center' }}>
          <Text style={[styles.jointext, { color: theme.colors.onBackground }]}>Join Requests</Text>
          <Switch
            trackColor={{ false: '#767577', true: '#2c2d30' }}
            thumbColor={isPublic ? '#f2f2ed' : '#f2f2ed'}
            onValueChange={changePublic}
            value={isPublic}
          />
        </View>
        <Text style={styles.jointext2}>When disabled, users can join without approval</Text>
        <View>
          {pending
            .map((item, index) => (
              <Card key={index} style={{ marginVertical: 5 }}>
                <Card.Title
                  title={pending[index].email}
                  left={(props) => <Avatar.Icon {...props} icon="account" />}
                />
                {isAdmin && (<Card.Actions>
                  <Button onPress={() => rejectUser(pending[index].email)}>Reject</Button>
                  <Button onPress={() => acceptUser(pending[index].email)}>Accept</Button>
                </Card.Actions>)}
              </Card>
            ))}
        </View>
      </ScrollView>
    </View>
  );
};
export default MemberManagementScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
  },
  creatortext: {
    fontSize: Dimensions.get('screen').height / 35,
  },
  admintext: {
    fontSize: Dimensions.get('screen').height / 35,
  },
  memberslistContainer: {
    marginTop: 30,
  },
  memberstext: {
    fontSize: Dimensions.get('screen').height / 35,
  },
  groupName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  groupName1: {
    fontSize: 16,
    color: "gray",
  },
  acceptButton: {
    width: '28%',
    border: "solid",
    borderRadius: Dimensions.get('screen').width / 30,
    marginLeft: 'auto',
    marginTop: 'auto',
    backgroundColor: "black",
    marginLeft: 'auto',
  },
  acceptButtonText: {
    fontSize: Dimensions.get('screen').height / 45,
    textAlign: "center",
    color: "white",
    fontWeight: "bold",
  },
  Viewallbutton: {
    width: '28%',
    border: "solid",
    borderRadius: Dimensions.get('screen').width / 30,
    float: "right",
    marginTop: 10,
  },
  Viewalltext: {
    fontSize: Dimensions.get('screen').height / 45,
    textAlign: "center",
  },
  joinContainer: {
    marginTop: 30,
  },
  jointext: {
    fontSize: Dimensions.get('screen').height / 35,
  },
  jointext2: {
    color: "gray",
  },
  invitecontainer: {
    marginTop: 20,
  },
  invitebutton: {
    width: '40%',
    height: "25%",
    border: "solid",
    borderRadius: Dimensions.get('screen').height / 20,
    backgroundColor: "black",
    alignSelf: 'center',
    alignItems: 'center',
    alignContent: 'center'

  },
  invitetext: {
    fontSize: Dimensions.get('screen').height / 45,
    textAlign: "center",
    color: "white",
  },
  joinlistContainer: {

  },
  textContainer: {
    flexDirection: 'column',
    marginLeft: 0,
  },
  listItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
    flexDirection: 'row',
    alignItems: 'center',
  },
  listItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
  },
  icon: {
    marginRight: 16,
  },
  membersnametext: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
