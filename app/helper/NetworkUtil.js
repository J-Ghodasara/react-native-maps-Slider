import NetInfo from '@react-native-community/netinfo';

class NetworkUtil {
  static isNetworkConnected = false;

  static initializeNetwork() {
    NetInfo.addEventListener(state => {
      this.handleConnectionChange(state);
    });
  }

  static handleConnectionChange(state) {
    isNetworkConnected = state.isConnected;
  }

  static returnNetworkState() {
    return isNetworkConnected;
  }
}

export default NetworkUtil;
