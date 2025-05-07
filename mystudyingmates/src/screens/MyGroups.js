import { StyleSheet, View, ScrollView, TouchableOpacity, Dimensions } from "react-native";
import { useTheme, Card, Searchbar, Button, Appbar } from 'react-native-paper';
import React, { useEffect, useState } from 'react';
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'react-native-elements';
import axios from 'axios';
import { getGroups } from '../../utils/apiRoutes';

function MyGroups({ route }) {
  const [image, setImage] = useState(route?.params?.image ? route.params.image : "");
  const theme = useTheme();
  const [groups, setGroups] = useState([]);
  const [searchedGroups, setSearchedGroups] = useState([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const navigation = useNavigation();


  useEffect(() => {
    const fetchData = async () => {
      try {
        const userEmail = route.params.email; // Assuming the user's email is passed in route.params.email
        const response = await axios.get(`${getGroups}?email=${userEmail}`);
        setGroups(response.data);
        console.log(response.data)
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const searchGroups = () => {
      const query = groups.filter((group) => group.groupname.includes(searchQuery));
      setSearchedGroups(query);
    };

    searchGroups();
  }, [searchQuery, groups]);

  const subjectToImageUrl = (subject) => {
    if (subject == 'Mathematics') {
      return "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Deus_mathematics.png/600px-Deus_mathematics.png?20210211120521";
    }
    if (subject == 'Economics') {
      return "https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Economic_indicator._from_%CE%B5%CE%BA%E2%82%AC_Hellenic_Republic.jpg/640px-Economic_indicator._from_%CE%B5%CE%BA%E2%82%AC_Hellenic_Republic.jpg";
    }
    if (subject == 'Chemistry') {
      return "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Wikipedia-zh-chemistry_logo.svg/640px-Wikipedia-zh-chemistry_logo.svg.png";
    }
    if (subject == 'Sociology') {
      return "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/WikiProject_Sociology_Babel_%28Deus_WikiProjects%29.png/640px-WikiProject_Sociology_Babel_%28Deus_WikiProjects%29.png";
    }
    if (subject == 'Biology') {
      return "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Biology_-_The_Noun_Project.svg/640px-Biology_-_The_Noun_Project.svg.png";
    }
    if (subject == 'Physics') {
      return "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Stylised_atom_with_three_Bohr_model_orbits_and_stylised_nucleus.svg/640px-Stylised_atom_with_three_Bohr_model_orbits_and_stylised_nucleus.svg.png";
    }
    if (subject == 'ComputerScience') {
      return "https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Computer_science_education.png/640px-Computer_science_education.png";
    }
    if (subject == 'Statistics') {
      return "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Standard_Normal_Distribution_uk.svg/640px-Standard_Normal_Distribution_uk.svg.png";
    }
  };

  // Define navigation variables
  const navigateToPersonalInformation = () => {
    navigation.navigate("PersonalInformation", route.params);
  };

  const navigateToSettings = () => {
    navigation.navigate("Settings", route.params);
  };

  const navigateToGroup = (item) => {
    navigation.navigate("Group", { ...route.params, group: item });
  };

  const navigateToMember = (identifier) => {
    navigation.navigate("MemberManagement", { ...route.params, id: identifier });
  };

  return (
    <SafeAreaView>
      {/*AppBar - Dashboard + Settings Icon + Personal Information Icon*/}
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="My Groups" theme={{ colors: { background: theme.colors.background } }} />
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
      <View style={{ marginVertical: 10 }}>
        <Searchbar
          placeholder="Search"
          onChangeText={setSearchQuery}
          value={searchQuery}
        />
      </View>
      <ScrollView style={styles.container}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {searchedGroups.map((item) => (
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
                <Button
                  style={{ width: Dimensions.get('screen').width / 6 }}
                  mode="outlined"
                  labelStyle={{ fontSize: 15, fontWeight: 'bold', width: Dimensions.get('screen').width / 2 - 30 }}
                  onPress={() => navigateToGroup(item)}
                >
                  View
                </Button>
              </Card.Actions>
            </Card>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView >
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 12,
    marginBottom:150
  }
});

export default MyGroups;
