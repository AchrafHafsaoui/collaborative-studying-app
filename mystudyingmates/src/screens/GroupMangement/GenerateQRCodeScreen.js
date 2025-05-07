import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Appbar, useTheme } from 'react-native-paper';
import { Image } from 'react-native-elements';



const GenerateQRCodeScreen = ({ navigation, route }) => {
    const [userImage, setUserImage] = useState(route?.params?.image ? route.params.image : "");
    const theme = useTheme();
    const [qrData, setQRData] = useState('');

    useEffect(() => {
        // Generate the data to be encoded in the QR code
        // For example, you can include the identifier, user email, etc.
        const dataToEncode = {
            identifier: route.params.identifier,
            // Add more data as needed
        };
        console.log('Data to encode:', dataToEncode);

        // Convert the data to a JSON string
        const jsonString = JSON.stringify(dataToEncode);
        console.log('JSON string:', jsonString);

        // Set the QR code data
        setQRData(jsonString);
    }, [route.params.identifier, route.params.userEmail]);

    const navigateToSettings = () => {
        navigation.navigate("Settings", route.params);
    };

    const navigateToPersonalInformation = () => {
        navigation.navigate("PersonalInformation", route.params);
    };

    return (
        <View style={styles.container}>
            <Appbar.Header>
                <Appbar.BackAction onPress={() => navigation.goBack()} />
                <Appbar.Content title={"Qr-Code for " + route.params.groupname} theme={{ colors: { background: theme.colors.background } }} />
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
            <View style={{alignSelf:'center', marginTop:150}}>
                {qrData ? (
                    <QRCode value={qrData} size={300} />
                ) : (
                    <Text>No data to generate QR code</Text>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default GenerateQRCodeScreen;
