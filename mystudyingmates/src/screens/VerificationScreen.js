import React, { useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Appbar, Text, TextInput, Button } from 'react-native-paper';
import axios from 'axios';
import { verifyRoute } from '../../utils/apiRoutes';

const VerificationScreen = ({ route, navigation }) => {
    const [verificationCode, setVerificationCode] = useState('');

    const handleVerification = async () => {
        try {
            // Send the verification code to the server for validation
            const response = await axios.post(verifyRoute, {
                email: route.params.email,
                verificationCode: verificationCode,
            });

            // Assuming the verification is successful, navigate to the main screen
            navigation.navigate('Login'); // Replace with your main screen name
        } catch (error) {
            console.error('Verification failed:', error);
            // Handle the error, e.g., display an error message to the user
        }
    };

    return (
        <View style={styles.container}>
            <Appbar.Header>
                <Appbar.BackAction onPress={() => navigation.goBack()} />
                <Appbar.Content title="Email Verification" />
            </Appbar.Header>
            <Text style={styles.subtitle}>
                Enter the verification code sent to your email:
            </Text>
            <TextInput
                style={styles.input}
                placeholder="Verification Code"
                value={verificationCode}
                onChangeText={(code) => setVerificationCode(code)}
            />
            <View style={{ width: 80, alignSelf:'center' }}>
                <Button title="Verify" onPress={handleVerification} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        marginBottom: 20,
        textAlign: 'center',
        marginTop: Dimensions.get('screen').height*0.3
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        width: '80%',
        alignSelf: 'center',
        marginBottom: 20,
        padding: 10,
    },
});

export default VerificationScreen;
