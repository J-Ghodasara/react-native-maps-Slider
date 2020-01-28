import React from 'react';
import {View, Image} from 'react-native';
import FacebookButton from '../components/FacebookButton';
import SplashScreen from 'react-native-splash-screen';
import {getAsyncData} from '../helper/AsyncStorageUtil';

export class LoginScreen extends React.Component {
  componentDidMount() {
    SplashScreen.hide();
    getAsyncData('isTokenAvailable').then(res => {
      if (res === 'true') {
        this.props.navigation.navigate('Home');
      }
    });
  }

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
