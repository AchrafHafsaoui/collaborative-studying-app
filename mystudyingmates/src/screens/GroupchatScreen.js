import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { chatHistoryRoute, server } from '../../utils/apiRoutes';
import axios from 'axios';
import { io } from "socket.io-client";
import { Ionicons, AntDesign } from '@expo/vector-icons';
import { SafeAreaView } from "react-native-safe-area-context";
import { TextInput, useTheme, Appbar } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Image } from 'react-native-elements';

function GroupchatScreen({ route }) {
  var chatId = route.params.identifier;
  const navigation = useNavigation();
  const [userImage, setUserImage] = useState(route?.params?.image ? route.params.image : "");
  const [chatMessages, setChatMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [userData, setUserData] = useState('');
  const theme = useTheme();
  const [refresh, setRefresh] = useState(false);
  const [bubbledUsed, setBubbleUsed] = useState(false);
  const socket = io(server);
  const scrollViewRef = useRef();
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedUserData = await AsyncStorage.getItem('email');
        if (storedUserData) {
          setUserData(storedUserData);
        }
      } catch (error) {
        console.error('Error loading userData:', error);
      }
    };

    loadUserData();
  }, []);

  //receive new Message
  useEffect(() => {
    const handleNewMsg = (msg) => {
      try {
        setChatMessages((prevMessages) => {
          return [...prevMessages, { from: msg.from, userImage: msg.userImage, messageText: msg.messageText, imageData: msg.imageData, time: msg.time }];
        });
        setRefresh(!refresh);
      } catch (e) {
        console.log(e.message);
      }
    };

    socket.on('newMsg', handleNewMsg);

    return () => {
      socket.off('newMsg', handleNewMsg);
    };
  }, []);

  function sendMessage(from, message, image) {
    const date = new Date();
    const hour = date.getHours();
    const min = date.getMinutes();
    let time;
    if (min < 10) time = hour + ':0' + min;
    else time = hour + ':' + min;
    const holder = image ? "base64Image" : "none";
    const bubble = route.params.bubble !== undefined && route.params.bubble !== null &&!bubbledUsed? route.params.bubble : -1;
    socket.emit('sendMsg', { identifier: chatId, from, userImage: userImage, messageText: image ? holder : message, imageData: image ? message : holder, bubble: bubble, time });
    setMessage("");
    setBubbleUsed(true);
  }

  useEffect(() => {
    // Scroll to the bottom when chatMessages change
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [chatMessages]);

  //Pull Chat-History from Server for initial Render
  useEffect(() => {
    axios.post(chatHistoryRoute, {
      "identifier": chatId
    })
      .then((response) => {
        setChatMessages(response.data);
      }, (error) => {
        console.log(error);
      });
  }, [refresh])

  const sendImage = async () => {
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

        sendMessage(userData, base64ImageData, true)
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  const navigateToPersonalInformation = () => {
    navigation.navigate("PersonalInformation", route.params);
  };

  const navigateToSettings = () => {
    navigation.navigate("Settings", route.params);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={"Chat"} />
        <Appbar.Action icon="cog" onPress={navigateToSettings} />
        <TouchableOpacity
          style={{ backgroundColor: 'white', width: 30, height: 30, borderRadius: 15 }}
          onPress={navigateToPersonalInformation}
        >
          {userImage === "" ? (
            <Image source={require('../../assets/user.png')} style={{ width: 30, height: 30, borderRadius: 15, alignSelf: 'center' }} />
          ) : (
            <Image
              source={{ uri: `data:image/jpeg;base64,${userImage}` }}
              style={{ width: 30, height: 30, borderRadius: 15, alignSelf: 'center' }}
            />
          )}
        </TouchableOpacity>
      </Appbar.Header>
      <View style={[styles.chatLogContainer, { backgroundColor: theme.colors.background }]}>
        <ScrollView
          style={{ height: '100%' }}
          ref={scrollViewRef}
          onContentSizeChange={() => scrollViewRef.current.scrollToEnd({ animated: true })}
          automaticallyAdjustKeyboardInsets={true}
        >
          {chatMessages && chatMessages.map((item, index) => (
            <View key={index} style={item.from === userData ? styles.chatContainer : styles.otherChatContainer}>
              {item.userImage === "" ? (
                <Image source={require('../../assets/user.png')} style={[styles[item.from === userData ? styles.chatIcon : styles.otherChatIcon], { backgroundColor: theme.colors.secondary, width: 30, height: 30, borderRadius: 15, alignSelf: 'center', margin: 3 }]} theme={theme} />
              ) : (
                <Image
                  source={{ uri: `data:image/jpeg;base64,${item.userImage}` }}
                  style={{ width: 30, height: 30, borderRadius: 15, alignSelf: 'center', margin:3 }}
                />
              )}
              <View style={item.from === userData ? styles.chatMessage : styles.otherChatMessage}>
                <Text style={styles.messageHeader}>{item.from}</Text>
                {item.imageData === "none" ? (
                  <Text>{item.messageText}</Text>
                ) : (
                  <Image
                    source={{ uri: `data:image/jpeg;base64,${item.imageData}` }}
                    style={{ width: 200, height: 200 }}
                  />
                )}
                <Text style={styles.messageFooter}>{item.time}</Text>
              </View>
              {item.bubble !== undefined && item.bubble !== -1  && (
                  <TouchableOpacity
                    style={styles.bubbleButton}
                    onPress={() => {
                      navigation.navigate("Whiteboard", { ...route.params, bubble: item.bubble });
                    }
                    }
                  >
                  </TouchableOpacity>
                )}
            </View>
          ))}
        </ScrollView>
      </View>

      <View style={[styles.bottomPanel, { backgroundColor: theme.colors.primary }]}>
        <TextInput
          placeholder="Type your Message here.."
          placeholderTextColor={theme.colors.secondary}
          style={[styles.input, { backgroundColor: theme.colors.onPrimary }]}
          value={message}
          onChangeText={setMessage}
        />
        <TouchableOpacity
          style={styles.button}
          onPress={sendImage}
        >
          <AntDesign name="picture" size={32} color={theme.colors.onPrimary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => sendMessage(userData, message, false)}
        >
          <Ionicons name="send" size={32} color={theme.colors.onPrimary} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  chatLogContainer: {
    width: '100%',
    height: '85%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  bottomPanel: {
    width: '100%',
    height: '8%',
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 0.1,
    borderTopColor: "grey",
    backgroundColor: "darkgrey",
    position: "fixed",
    bottom: 0,
  },
  input: {
    marginLeft: 10,
    flex: 1,
    height: '80%',
    backgroundColor: 'white',
    border: "1 solid grey",
    borderRadius: 10,
  },
  button: {
    marginLeft: 5,
    marginRight: 5,
  },
  chatContainer: {
    flexDirection: 'row-reverse',
    marginRight: Dimensions.get('screen').width / 5,
    flex: 1
  },
  chatIcon: {
    alignSelf: 'end',
  },
  chatMessage: {
    alignSelf: 'flex-start',
    flexWrap: 'wrap',
    border: 1,
    borderRadius: Dimensions.get('screen').height / 50,
    padding: Dimensions.get('screen').height / 70,
    marginTop: Dimensions.get('screen').height / 90,
    marginBottom: Dimensions.get('screen').height / 90,
    backgroundColor: "lightgray",
    color: "black",
    overflow: 'hidden'
  },
  otherChatContainer: {
    flexDirection: 'row',
    width: '80%',
  },
  otherChatIcon: {
    alignSelf: 'end',
  },
  otherChatMessage: {
    alignSelf: 'flex-start',
    flexWrap: 'wrap',
    border: 1,
    borderRadius: Dimensions.get('screen').height / 50,
    padding: Dimensions.get('screen').height / 70,
    marginTop: Dimensions.get('screen').height / 90,
    marginBottom: Dimensions.get('screen').height / 90,
    backgroundColor: "lightgray",
    color: "black",
    overflow: 'hidden'
  },
  messageHeader: {
    flexDirection: "row",
    textAlign: "start",
    fontSize: 10,
  },
  messageFooter: {
    fontSize: 10,
  },
  bubbleButton: {
    backgroundColor: 'purple',
    padding: 10,
    borderRadius: 10,
    margin:5,
    alignSelf: 'flex-start',
  },
});
export default GroupchatScreen;
