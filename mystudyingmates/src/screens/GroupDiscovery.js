import React, { useEffect, useState } from 'react';
import { TouchableOpacity, ScrollView, View, Dimensions, StyleSheet } from 'react-native'
import { useNavigation } from '@react-navigation/native';
import { useTheme, Text, Divider, Button, Appbar, Card, Searchbar } from 'react-native-paper';
import { SafeAreaView } from "react-native-safe-area-context";
import { getGroupall, server } from '../../utils/apiRoutes';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { io } from "socket.io-client";
import { Image } from 'react-native-elements';

function GroupDiscovery({ route }) {
    const navigation = useNavigation();
    const [allGroups, setAllGroups] = useState([]);
    const [searchedGroups, setSearchedGroups] = useState([]);
    const [refresh, setRefresh] = useState(false);
    const [userImage, setUserImage] = useState(route?.params?.image ? route.params.image : "");
    const theme = useTheme();
    const socket = io(server);
    const [searchQuery, setSearchQuery] = React.useState('');

    const navigateToMember = (id) => {
        navigation.navigate("MemberManagement", { ...route.params, id: id });
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(getGroupall);
                const groupsUserNotIn = response.data.filter(group => {
                    // Check if the user is in the group
                    const userInGroup = group.users.find(user => user.email === route.params.email);
                    return !userInGroup; // Keep the group if the user is not in the group
                });
                // Sortiere die Gruppen nach der Anzahl der Mitglieder (absteigend)
                const sorted = groupsUserNotIn.sort((a, b) => b.users.length - a.users.length);
                setAllGroups(sorted);
            } catch (error) {
                console.error(error);
            }
        };

        fetchData();
    }, [refresh]);

    useEffect(() => {
        const searchGroups = () => {
            const query = allGroups.filter((group) => group.groupname.includes(searchQuery));
            setSearchedGroups(query);
        };

        searchGroups();
    }, [searchQuery, allGroups]);


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

    const navigateToPersonalInformation = () => {
        navigation.navigate("PersonalInformation", route.params);
    };

    const navigateToSettings = () => {
        navigation.navigate("Settings", route.params);
    };

    function joinGroup(identifier) {
        socket.emit('joinGroup', { identifier, user: route.params.email });
        setRefresh(!refresh)
    }

    return (
        <SafeAreaView>
            <Appbar.Header>
                <Appbar.BackAction onPress={() => navigation.goBack()} />
                <Appbar.Content title="Join Groups" />
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
            <ScrollView style={{ marginHorizontal: 10 }}>
                <View style={{ marginTop: 10 }}>
                    <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Search Groups</Text>
                </View>
                <View style={{ marginTop: 10 }}>
                    <Searchbar
                        placeholder="Search"
                        onChangeText={setSearchQuery}
                        value={searchQuery}
                    />
                </View>
                <View style={{ marginBottom: 80 }}>
                    <Divider style={{ marginTop: 15 }}></Divider>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                        {searchedGroups.slice(0, 8).map((item) => (
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
                                    {!item.public && (
                                        <MaterialCommunityIcons name="lock" size={25} color="black" />
                                    )}
                                    {!item.public && (
                                        <Button
                                            style={{ width: Dimensions.get('screen').width / 6 }}
                                            mode="outlined"
                                            labelStyle={{ fontSize: 15, fontWeight: 'bold', width: Dimensions.get('screen').width / 2 - 30 }}
                                            onPress={() => joinGroup(item.identifier)}
                                        >
                                            Apply
                                        </Button>
                                    )}
                                    {item.public && (
                                        <Button
                                            style={{ width: Dimensions.get('screen').width / 6 }}
                                            mode="outlined"
                                            labelStyle={{ fontSize: 15, fontWeight: 'bold', width: Dimensions.get('screen').width / 2 - 30 }}
                                            onPress={() => joinGroup(item.identifier)}
                                        >
                                            Join
                                        </Button>
                                    )}
                                </Card.Actions>
                            </Card>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({

    container: {
        marginLeft: 15,
        backgroundColor: "white",
        marginRight: 15,
        flexDirection: "row",
        flexWrap: "wrap",
    },
    creatortext: {
        fontSize: Dimensions.get('screen').height / 35,
    },
    adminlistContainer: {
        marginTop: 30,
    },
    admintext: {
        fontSize: Dimensions.get('screen').height / 35,
    },
    memberlistContainer: {
        marginTop: 30,
    },
    membertext: {
        fontSize: Dimensions.get('screen').height / 35,
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
    Switch:
    {
        marginTop: 15,
        float: "right",
        marginRight: 10,
    },
    invitecontainer: {
        marginTop: 20,
    },
    invitebutton: {
        width: '100%',
        border: "solid",
        borderRadius: Dimensions.get('screen').height / 80,
        backgroundColor: "black",
        alignItems: 'center',

    },
    invitetext: {
        fontSize: Dimensions.get('screen').height / 45,
        textAlign: "center",
        color: "white",
    },
    container: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap'
    },
    item: {
        backgroundColor: '#f9c2ff',
        padding: 20,
        marginVertical: 8,
        marginHorizontal: 16,
    },
    title: {
        fontSize: 32,
    },
});

export default GroupDiscovery;
