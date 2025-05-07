import { Text, StyleSheet, View, ScrollView, TouchableOpacity, Dimensions } from "react-native";
import { useTheme, Card, Avatar, Appbar } from 'react-native-paper';
import React, { useState } from 'react';
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from 'react-native-elements';


function MyMeetings({ route }) {
    const [image, setImage] = useState(route?.params?.image ? route.params.image : "");
    const theme = useTheme();
    const navigation = useNavigation();

    const navigateToPersonalInformation = () => {
        navigation.navigate("PersonalInformation", route.params);
    };

    const navigateToSettings = () => {
        navigation.navigate("Settings", route.params);
    };

    return (
        <SafeAreaView>
            {/*AppBar - Dashboard + Settings Icon + Personal Information Icon*/}
            <Appbar.Header>
                <Appbar.BackAction onPress={() => navigation.goBack()} testID='goBack' />
                <Appbar.Content title="My Meetings" theme={{ colors: { background: theme.colors.background } }} />
                <Appbar.Action icon="cog" onPress={navigateToSettings} />
                <TouchableOpacity
                    style={{ backgroundColor: 'white', width: 30, height: 30, borderRadius: 15 }}
                    onPress={navigateToPersonalInformation}
                >
                    {image === "" ? (
                        <Image source={require('../../assets/user.png')} style={{ width: 30, height: 30, borderRadius: 15, alignSelf: 'center' }} />
                    ) : (
                        <Image
                            source={{ uri: `data:image/jpeg;base64,${image}` }}
                            style={{ width: 30, height: 30, borderRadius: 15, alignSelf: 'center' }}
                        />
                    )}
                </TouchableOpacity>
            </Appbar.Header>
            <ScrollView style={styles.container}>
                {route.params.meetings.map((meeting) => (
                    <Card
                        key={meeting.title}
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

export default MyMeetings;
