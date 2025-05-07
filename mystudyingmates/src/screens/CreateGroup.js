import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme, Text, Divider, TextInput, Button, Appbar } from 'react-native-paper';
import DropDown from "react-native-paper-dropdown";
import { SafeAreaView } from "react-native-safe-area-context";
import { getUsersRoute, checkPremiumRoute, checkGroupsCreatedRoute, server } from '../../utils/apiRoutes';
import axios from 'axios';
import { io } from "socket.io-client";
import { Image } from 'react-native-elements';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

function CreateGroup({ route }) {
    const navigation = useNavigation();
    const [groupName, setGroupName] = useState('');
    const [userImage, setUserImage] = useState(route?.params?.image ? route.params.image : "");
    const [groupImage, setGroupImage] = useState('');
    const [showSubjectDropDown, setShowSubjectDropDown] = useState(false);
    const [showUsersDropDown, setShowUsersDropDown] = useState(false);
    const [premium, setPremium] = useState(false);
    const [groupsCreated, setGroupsCreated] = useState(false);
    const [subject, setSubject] = useState('');
    const [getUsers, setUsers] = useState([]);
    const [groupUsers, setGroupUsers] = useState('');
    const theme = useTheme();
    const socket = io(server);
    const [identifier, setIdentifier] = useState(1); // Neuer State für identifier

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

                setGroupImage(base64ImageData);
            }
        } catch (error) {
            console.error('Error picking image:', error);
        }
    };

    const subjectToImageUrl = (subject) => {
        if (subject == 'mathematics') {
            return "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Deus_mathematics.png/600px-Deus_mathematics.png?20210211120521";
        }
        if (subject == 'economics') {
            return "https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Economic_indicator._from_%CE%B5%CE%BA%E2%82%AC_Hellenic_Republic.jpg/640px-Economic_indicator._from_%CE%B5%CE%BA%E2%82%AC_Hellenic_Republic.jpg";
        }
        if (subject == 'chemistry') {
            return "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Wikipedia-zh-chemistry_logo.svg/640px-Wikipedia-zh-chemistry_logo.svg.png";
        }
        if (subject == 'sociology') {
            return "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/WikiProject_Sociology_Babel_%28Deus_WikiProjects%29.png/640px-WikiProject_Sociology_Babel_%28Deus_WikiProjects%29.png";
        }
        if (subject == 'biology') {
            return "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Biology_-_The_Noun_Project.svg/640px-Biology_-_The_Noun_Project.svg.png";
        }
        if (subject == 'physics') {
            return "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Stylised_atom_with_three_Bohr_model_orbits_and_stylised_nucleus.svg/640px-Stylised_atom_with_three_Bohr_model_orbits_and_stylised_nucleus.svg.png";
        }
        if (subject == 'computerScience') {
            return "https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Computer_science_education.png/640px-Computer_science_education.png";
        }
        if (subject == 'statistics') {
            return "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Standard_Normal_Distribution_uk.svg/640px-Standard_Normal_Distribution_uk.svg.png";
        }
    };

    const subjects = [
        {
            label: "Economics",
            value: "Economics",
        },
        {
            label: "Sociology",
            value: "Sociology",
        },
        {
            label: "Biology",
            value: "Biology",
        },
        {
            label: "Chemistry",
            value: "Chemistry",
        },
        {
            label: "Physics",
            value: "Physics",
        },
        {
            label: "Computer science",
            value: "ComputerScience",
        },
        {
            label: "Mathematics",
            value: "Mathematics",
        },
        {
            label: "Statistics",
            value: "Statistics",
        },
    ];

    useEffect(() => {
        axios.post(getUsersRoute, {})
            .then((response) => {
                const userNames = [];
                Object.entries(response.data).forEach(([key, values]) => {
                    userNames.push(
                        {
                            label: values.name + ' ' + values.surname,
                            value: values.email
                        }
                    );
                });
                setUsers(userNames);
            }, (error) => {
                console.log(error);
            });
        axios.post(checkPremiumRoute, {
            "userId": route.params._id
        })
            .then((response) => {
                console.log(response.data.isPremium)
                setPremium(response.data.isPremium);
            })
            .catch((error) => {
                console.log(error);
            });
        axios.post(checkGroupsCreatedRoute, {
            "userId": route.params._id
        })
            .then((response) => {
                setGroupsCreated(response.data.groupsCreated);
                console.log(response.data.groupsCreated);
            })
            .catch((error) => {
                console.log(error);
            });
    }, [])

    function newGroup(groupName) {
        if (premium || groupsCreated < 5) {
            socket.emit('newGroup', { identifier: identifier.toString(), admin: route.params.email, groupname: groupName, subject: subject, users: groupUsers, image: groupImage });
            if (!premium) {
                const left=5-groupsCreated-1;
                alert("You can only create " + left + " other group(s). Upgrade to premium to get unlimited number of groups as well as other exclusive features!")
            }
            navigation.navigate('Dashboard', { ...route.params });
        }
        else if(!premium&&groupsCreated >= 5) alert("You can no longer create any groups. Upgrade to premium to get unlimited number of groups as well as other exclusive features!")
    }

    const navigateToPersonalInformation = () => {
        navigation.navigate("PersonalInformation", route.params);
    };

    const navigateToSettings = () => {
        navigation.navigate("Settings", route.params);
    };

    return (
        <SafeAreaView>
            <Appbar.Header>
                <Appbar.BackAction onPress={() => navigation.goBack()} />
                <Appbar.Content title="Chat" />
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
            <View style={{ marginHorizontal: 15 }}>
                <Text style={{ fontWeight: 'bold', color: 'black', marginTop: 5 }}>Subject</Text>
                <DropDown
                    label={"Subject"}
                    mode={"outlined"}
                    visible={showSubjectDropDown}
                    showDropDown={() => setShowSubjectDropDown(true)}
                    onDismiss={() => setShowSubjectDropDown(false)}
                    value={subject}
                    setValue={setSubject}
                    list={subjects}
                />

                <Text style={{ fontWeight: 'bold', color: 'black', marginVertical: 5 }}>Group Name</Text>
                <TextInput
                    placeholder="Enter group name"
                    mode='outlined'
                    placeholderTextColor="grey"
                    value={groupName}
                    onChangeText={(text) => setGroupName(text)}
                />

                <Text style={{ fontWeight: 'bold', color: 'black', marginTop: 5 }}>Members</Text>
                <DropDown
                    label={"Members"}
                    mode={"outlined"}
                    visible={showUsersDropDown}
                    showDropDown={() => setShowUsersDropDown(true)}
                    onDismiss={() => setShowUsersDropDown(false)}
                    value={groupUsers}
                    setValue={setGroupUsers}
                    list={getUsers}
                    multiSelect
                />
                <Text style={{ fontWeight: 'bold', color: 'black', margin: 5 }}>Picture</Text>
                <View style={{ margin: 15 }}>
                    <TouchableOpacity
                        style={{ backgroundColor: 'white', width: 200, height: 200, borderWidth: 3, alignSelf: 'center' }}
                        onPress={changeImage}
                    >
                        {groupImage === "" ? (
                            <Image source={{ uri: subjectToImageUrl(subject) }} style={{ width: 194, height: 194, alignSelf: 'center' }} />
                        ) : (
                            <Image
                                source={{ uri: `data:image/jpeg;base64,${groupImage}` }}
                                style={{ width: 194, height: 194, alignSelf: 'center' }}
                            />
                        )}
                    </TouchableOpacity>
                    <Divider style={{ margin: 15 }}></Divider>
                </View>
            </View>
            <Button style={{ marginHorizontal: 20 }} icon="plus" mode="contained" onPress={() => { newGroup(groupName) }}>Create Group</Button>
        </SafeAreaView>
    );
}

export default CreateGroup;
