import { StyleSheet, Dimensions } from 'react-native';

const Styles = StyleSheet.create({
  mainContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
    alignItems: 'center',
  },
  topBar: {
    height: '7%',
    width: '100%',
    backgroundColor:'white',
    shadowColor: "rgba(0, 0, 0, 0.12)",
    shadowRadius: 5,
  },
  headerText: {
    fontSize: Dimensions.get('screen').height / 35,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: Dimensions.get('screen').height / 50,
    marginLeft: Dimensions.get('screen').width>Dimensions.get('screen').height?Dimensions.get('screen').width *5/ 12:Dimensions.get('screen').height*5/12,
    position:'absolute'
  },  
  container: {
    width: '80%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Dimensions.get('screen').height / 70,
  },
  settingsContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Dimensions.get('screen').height / 70,
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: Dimensions.get('screen').height / 50,
    padding: Dimensions.get('screen').height / 70,
  },
  passwordToggle: {
    padding: Dimensions.get('screen').height / 70,
    position: 'absolute',
    right: 0,
  },
  button: {
    width: '80%',
    backgroundColor: 'black',
    alignItems: 'center',
    padding: Dimensions.get('screen').height / 70,
    borderRadius: Dimensions.get('screen').height / 50,
    marginBottom: Dimensions.get('screen').height / 70
  },
  buttonText: {
    color: 'white',
    fontSize: Dimensions.get('screen').height / 50,
    fontWeight: 'bold',
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  orText: {
    marginHorizontal: Dimensions.get('screen').height / 70,
    fontSize: Dimensions.get('screen').height / 50,
    fontWeight: 'bold',
    color: 'black',
  },
  termsAndConditionsText: {
    color: 'rgba(0, 0, 0, 0.4)',
    fontSize: Dimensions.get('screen').height / 70,
    textAlign: 'center',
  },
  backButtonContainer: {
    position: 'absolute',
    top: Dimensions.get('screen').height / 40,
    left: Dimensions.get('screen').width / 20,
    height: Dimensions.get('screen').height / 20,
    width: Dimensions.get('screen').width / 20,
    zIndex: 1,
  },
  backButtonImage: {
    width: 20,
    height: 20,
  },
});

export default Styles;
