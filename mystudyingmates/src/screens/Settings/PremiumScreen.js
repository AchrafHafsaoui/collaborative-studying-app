import React, { useState, useEffect } from 'react';
import { View, ScrollView, Dimensions} from 'react-native';
import { Appbar, Button, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StripeProvider, useStripe } from '@stripe/stripe-react-native';
import { paymentSheetRoute, updatePremiumRoute } from "../../../utils/apiRoutes";
import axios from 'axios';

function PremiumScreen({ route }) {
    const [isPremium, setIsPremium] = useState(route.params.premium);
    const navigation = useNavigation();
    useEffect(() => {
        initializePaymentSheet();
    }, []);

    const handlePayment = async () => {

        const {error} = await presentPaymentSheet();

        if(error){
            console.log("Error: " + error.code + error.message);
        }
        else{
            console.log("Success: Payment confirmed");
            setIsPremium(true);
            const response = await axios.patch(updatePremiumRoute, {
                userId: route.params._id,
                premium: true,
              });
            route.params = response.data;
            console.log(route.params);
        }   
 
    };

    const { initPaymentSheet, presentPaymentSheet } = useStripe();
    const [loading, setLoading] = useState(false);

    //Payment Stuff Begin

    const initializePaymentSheet = async () => {
        await axios
        .post(paymentSheetRoute, {userId: route.params._id})
        .then(res => {
            console.log(res.data);
            const { paymentIntent, ephemeralKey, customer} = res.data;
            const { error } = initPaymentSheet({
                merchantDisplayName: "MyStudyMates, Inc.",
                customerId: customer,
                customerEphemeralKeySecret: ephemeralKey,
                paymentIntentClientSecret: paymentIntent,
                allowsDelayedPaymentMethods: false,
                defaultBillingDetails: {
                name: route.params.name + " " + route.params.surname,
                }
            });
            if (!error) {
                console.log("erfolg");
                setLoading(true);
            }
            else{
                console.log(error.message);
            }

        })
        .catch(err => {
            console.log("fetchError:" + err.message);
        });
    };
    //Payment Stuff End



    return (
        <StripeProvider
        publishableKey="pk_test_51OZEdFGggnnmH2yDfTCEqQ8p39xiWCqsdYEidH3vRUm5BJqg3xpDfeLmGb5YDR7d8d9Fe4IMkNi2QolkKL3JqZ4500K8L8R0uB"
        >
        <SafeAreaView style={{ flex: 1 }}>
            <Appbar.Header>
                <Appbar.BackAction onPress={() => navigation.navigate("Settings", route.params)} />
                <Appbar.Content title="Premium" />
            </Appbar.Header>
            <ScrollView contentContainerStyle={{ paddingHorizontal: 20 }}>
                {!isPremium ? (
                    <View style={{ width: '100%', alignSelf: 'center', alignItems: 'center' }}>
                        <Text style={{ fontSize: 24, fontWeight: 'bold', marginTop: Dimensions.get('screen').height*0.35, marginBottom: 10}}>Upgrade to Premium</Text>
                        <Text style={{ fontSize: 16, textAlign: 'center', marginBottom: 20}}> You currently don't have a Premium Pass. Unlock exclusive features by going Premium!</Text>
                        <Button mode="contained" onPress={handlePayment}>
                            Upgrade Now
                        </Button>
                    </View>
                ) : (
                    <View style={{ width: '100%', alignSelf: 'center', alignItems: 'center' }}>
                        <Text style={{ fontSize: 24, fontWeight: 'bold', marginTop:Dimensions.get('screen').height*0.4 }}>You are already a Premium user!</Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
        </StripeProvider>
    );
}

export default PremiumScreen;
