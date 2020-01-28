/* eslint-disable no-lone-blocks */
/* eslint-disable no-alert */
import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {
  LoginManager,
  AccessToken,
  GraphRequestManager,
  GraphRequest,
} from 'react-native-fbsdk';
import string from '../config/strings';
import colors from '../config/colors';
import {saveAsyncData, getAsyncData} from '../helper/AsyncStorageUtil';
import NetworkUtil from '../helper/NetworkUtil';
import {withNavigation} from 'react-navigation';

class FacebookButton extends Component {
  buttonPressed = false;
  fbUserInfo = {};
  deviceToken;
  constructor(props) {
    super(props);
  }

  handleFacebookLogin(props) {
    let instance = this;
    LoginManager.logOut();
    setTimeout(() => {
      LoginManager.logInWithPermissions(['public_profile', 'email']).then(
        function(result) {
          if (result.isCancelled) {
            LoginManager.logOut();
          } else {
            AccessToken.getCurrentAccessToken().then(data => {
              let accessToken = data.accessToken;
              const responseInfoCallback = (error, result) => {
                if (error) {
                  LoginManager.logOut();
                  alert('Error fetching data: ' + error.toString());
                } else {
                  console.log('RESULT', result);
                  saveAsyncData('isTokenAvailable', 'true');
                  instance.props.navigation.navigate('Home');
                }
              };

              const infoRequest = new GraphRequest(
                '/me',
                {
                  accessToken: accessToken,
                  parameters: {
                    fields: {
                      string:
                        'email,name,first_name,last_name,id,picture.type(large)',
                    },
                  },
                },
                responseInfoCallback,
              );
              new GraphRequestManager().addRequest(infoRequest).start();
            });
          }
        },
        function(error) {
          alert('Login failed with error: ' + error);
          LoginManager.logOut();
        },
      );
    }, 200);
  }

  render() {
    return (
      <View>
        <TouchableOpacity
          onPress={() => {
            if (NetworkUtil.returnNetworkState()) {
              this.handleFacebookLogin(this.props);
            }
          }}>
          <View
            style={[
              style.blueButtonStyle,
              {width: Dimensions.get('screen').width / 1.1},
            ]}>
            <Text style={style.buttonTextStyle}>{string.label_facebook}</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }
}

const style = StyleSheet.create({
  blueButtonStyle: {
    height: 50,
    paddingStart: 15,
    paddingEnd: 15,
    backgroundColor: colors.colorFacebook,
    alignItems: 'center',
    justifyContent: 'center',
    color: colors.colorFacebook,
    borderRadius: 5,
  },
  buttonTextStyle: {
    color: colors.colorWhite,
    fontSize: 16,
  },
});

export default withNavigation(FacebookButton);
