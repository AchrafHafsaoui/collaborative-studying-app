import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import * as Permissions from 'expo-permissions';
import { Camera } from 'expo-camera';


const ScanQRCodeScreen = ({ route, navigation }) => {
    const [scanned, setScanned] = useState(false);
    const [hasCameraPermission, setHasCameraPermission] = useState(null);

    useEffect(() => {
        (async () => {
            const { status } = await Permissions.askAsync(Permissions.CAMERA);
            setHasCameraPermission(status === 'granted');
        })();
    }, []);

    const handleBarCodeScanned = ({ data }) => {
        if (!scanned) {
            setScanned(true);
            const scannedData = JSON.parse(data);
            navigation.navigate('Dashboard', {...route.params, scannedData });
        }
    };

    useEffect(() => {
        return () => {
            setScanned(false); // Reset scanned state when leaving the screen
        };
    }, []);

    return (
        <View style={styles.container}>
            <Camera
                onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
                style={StyleSheet.absoluteFillObject}
            />
        </View >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    text: {
        fontSize: 18,
        color: 'white',
    },
});

export default ScanQRCodeScreen;
