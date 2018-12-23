import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import FetchLocation from './components/FetchLocation'
import UserMap from './components/UsersMap'

let thankYouMessage = null

export default class App extends React.Component {
  constructor(props) {
    super(props)

    // STATE
    this.state = {
      buttonClicked: false,
      userLocation: null
    }
  }

  // HANDLE GET LOCATION
  getUserLocationHandler = () => {
    this.setState = ({
      buttonClicked: true
    })

    console.log('# getUserLocationHandler #' + '\n', this.state.buttonClicked, '\n ------------------------------------')

    navigator.geolocation.getCurrentPosition(
      position => {
        this.setState = ({
          userLocation: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421
          },
          buttonClicked: true
        }, this.forceUpdate())
        console.log('# POSITION #' + '\n', this.state.userLocation, '\n ------------------------------------')
        console.log('# POSITION #' + '\n', position, '\n ------------------------------------')
      },
      error => console.log(error)
    )
  }


  render() {
    console.log('# RENDER # buttonClicked' + '\n', this.state.buttonClicked, '\n ------------------------------------')

    // HANDLE THANK YOU MESSAGE
    if (this.state.buttonClicked) {
      thankYouMessage = <Text>Thank you!</Text>
    } else {
      thankYouMessage = <Text>non.</Text>
    }


    return (
      <View style={styles.container}>
        <UserMap userLocation={ this.state.userLocation } />
        <Text style={ styles.welcome }>Click on the button to get Location</Text>
        <FetchLocation onGetLocation={ this.getUserLocationHandler } />
        { thankYouMessage }
        <Text style={ styles.footer }>&copy; 2018 Auxburgo</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcome: {
    marginTop: 100
  },
  footer: {
    marginTop: 100
  }
});
