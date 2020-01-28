import AsyncStorage from '@react-native-community/async-storage';
export const saveAsyncData = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (error) {}
};

export const getAsyncData = async key => {
  try {
    return await AsyncStorage.getItem(key);
  } catch (error) {
    console.log('Got' + error);
  }
};

export const clearAsyncData = async () => {
  try {
    return await AsyncStorage.clear();
  } catch (error) {}
};
export const removeAsyncData = async key => {
  try {
    return await AsyncStorage.removeItem(key);
  } catch (error) {}
};
