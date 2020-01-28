import {createAppContainer, createSwitchNavigator} from 'react-navigation';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import {createStackNavigator} from 'react-navigation-stack';

const AuthStack = createStackNavigator({
  LoginScreen: {
    screen: LoginScreen,
    navigationOptions: {
      header: null,
    },
  },
});

const AppNavigator = createSwitchNavigator(
  {
    LoginScreen: AuthStack,
    Home: {
      screen: HomeScreen,
      navigationOptions: {
        header: null,
      },
    },
  },
  {
    animationType: 'none',
    animationEnabled: false,
    swipeEnabled: false,
  },
);

const AppContainer = (props = createAppContainer(AppNavigator));
export default AppContainer;
