import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Button, TextInput, useTheme, Appbar } from 'react-native-paper';
import { Image } from 'react-native-elements';
import { io } from "socket.io-client";
import { server } from '../../../utils/apiRoutes';


const RatingScreen = ({ route, navigation }) => {
  const socket = io(server);
  const [userImage, setUserImage] = useState(route?.params?.image ? route.params.image : "");
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const theme = useTheme();

  const navigateToPersonalInformation = () => {
    navigation.navigate("PersonalInformation", route.params);
  };

  const navigateToSettings = () => {
    navigation.navigate("Settings", route.params);
  };

  const handleRatingSubmit = () => {
    socket.emit('rating', { groupIdentifier: route.params.group.identifier, userEmail:route.params.email, review: review, rating: rating });
    navigation.goBack();
  };

  const renderStarButton = (value) => (
    <Button
      key={value}
      onPress={() => setRating(value)}
      labelStyle={{ fontSize: 20, fontWeight: 'bold', width: 50, height: 50 }}
      style={{ width: 30, height: 30, marginTop:20, marginBottom:20 }}
    >
      {value <= rating ? '★' : '☆'}
    </Button>

  );

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Rate Group" />
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

      {/* Star Rating Buttons */}
      <View style={styles.ratingContainer}>
        {[1, 2, 3, 4, 5].map(value => renderStarButton(value))}
      </View>

      {/* Review Input */}
      <TextInput
        label="Write a review"
        multiline
        numberOfLines={4}
        value={review}
        onChangeText={text => setReview(text)}
        style={styles.reviewInput}
      />

      {/* Submit Button */}
      <Button mode="contained" onPress={handleRatingSubmit} style={{backgroundColor: 'rgb(120, 69, 172)', marginHorizontal:20}}>
        Submit Rating
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewInput: {
    marginHorizontal:20,
    marginBottom: 16,
  },
});

export default RatingScreen;