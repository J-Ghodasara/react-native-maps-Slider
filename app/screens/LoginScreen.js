import React from 'react';
import {View, Image, Linking} from 'react-native';
import FacebookButton from '../components/FacebookButton';
import SplashScreen from 'react-native-splash-screen';
import {getAsyncData} from '../helper/AsyncStorageUtil';

export class LoginScreen extends React.Component {
  isFromLinking = false;

  async componentDidMount() {
    SplashScreen.hide();
    await Linking.getInitialURL().then(url => {
      console.log('URL', url);
      this.isFromLinking = true;
      if (url !== null && url !== undefined) {
        this.navigate(url);
      } else {
        getAsyncData('isTokenAvailable').then(res => {
          if (res === 'true') {
            this.props.navigation.navigate('Home');
          }
        });
      }
    });
  }

  navigate = url => {
    // E
    const {navigate} = this.props.navigation;
    const route = url.replace(/.*?:\/\//g, '');
    const routeName = route.split('/')[1];
    const id = route.split('/')[2];
    console.log('ROUTE', route);
    // console.log('ID', id);
    console.log('ROUTENAME', routeName);
    if (routeName === 'place') {
      navigate('Home', {id: id});
    }
  };

  render() {
    return (
      <View style={{flex: 1}}>
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Image
            style={{width: 250}}
            source={require('../assets/splash_exa.png')}
            resizeMode="contain"
          />
        </View>
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <View>
            <FacebookButton />
          </View>
        </View>
      </View>
    );
  }
}

export default LoginScreen;
