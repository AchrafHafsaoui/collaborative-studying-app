import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Title, Button, TextInput, useTheme, Appbar, Card, Paragraph } from 'react-native-paper';
import { Image } from 'react-native-elements';
import { io } from "socket.io-client";
import { server } from '../../../utils/apiRoutes';


const Meeting = ({ route, navigation }) => {
    const socket = io(server);
    const [userImage, setUserImage] = useState(route?.params?.image ? route.params.image : "");
    const [title, setTitle] = useState("");
    const [time, setTime] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const theme = useTheme();

    const navigateToPersonalInformation = () => {
        navigation.navigate("PersonalInformation", route.params);
    };

    const navigateToSettings = () => {
        navigation.navigate("Settings", route.params);
    };

    const addMeeting = () => {
        if (title && time && route.params.isAdmin) {
            socket.emit('addMeeting', { identifier: route.params.group.identifier, title, date: route.params.day, time });
            navigation.navigate("Group", route.params);
        }
        else setErrorMessage("Only an admin can create a meeting!")
    };
    const deleteMeeting = (title, date, time) => {
        if (title && time && route.params.isAdmin) {
            socket.emit('deleteMeeting', { identifier: route.params.group.identifier, title, date, time });
            navigation.navigate("Group", route.params);
        }
        else setErrorMessage("Only an admin can delete a meeting!")
    };

    const isValidTimeFormat = (input) => {
        // Regular expression for validating time in HH:mm format
        const timeRegex = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
        return timeRegex.test(input);
    };

    const handleTimeChange = (text) => {
        if (isValidTimeFormat(text)) {
            setTime(text);
            setErrorMessage('');
        } else {
            setTime('');
            setErrorMessage('Invalid time format. Please use HH:mm.');
        }
    };

    return (
        <View style={styles.container}>
            <Appbar.Header>
                <Appbar.BackAction onPress={() => navigation.goBack()} />
                <Appbar.Content title="Meeting Overview" />
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

            <TextInput
                label="Title"
                multiline
                onChangeText={text => setTitle(text)}
                style={styles.titleInput}
            />

            <TextInput
                label="Time"
                multiline
                onChangeText={handleTimeChange}
                style={styles.titleInput}
            />
            {errorMessage ? <Text style={{ color: 'red', alignSelf: 'center', marginBottom: 10 }}>{errorMessage}</Text> : null}
            {/* Submit Button */}
            <Button mode="contained" onPress={addMeeting} style={{ backgroundColor: 'rgb(120, 69, 172)', marginHorizontal: 20 }}>
                Schedule Meeting
            </Button>

            {/* Display Meetings as Cards */}
            <View style={{ margin: 20 }}>
                <Title>Upcoming Meetings</Title>
                {route.params.meetings.map((meeting, index) => (
                    <Card key={index} style={{ marginBottom: 10 }}>
                        <Card.Content>
                            <Title>{meeting.title}</Title>
                            <Paragraph>{`Date: ${meeting.date}, Time: ${meeting.time}`}</Paragraph>
                        </Card.Content>
                        <Card.Actions>
                            <Button onPress={() => deleteMeeting(meeting.title, meeting.date, meeting.time)}>Delete</Button>
                        </Card.Actions>
                    </Card>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    titleInput: {
        marginHorizontal: 20,
        marginBottom: 16,
    },
});

export default Meeting;