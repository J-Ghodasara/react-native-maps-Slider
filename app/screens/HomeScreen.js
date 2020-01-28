/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import SplashScreen from 'react-native-splash-screen';
import colors from '../config/colors';
import MapView, {PROVIDER_GOOGLE, Marker} from 'react-native-maps';
import firestore from '@react-native-firebase/firestore';
import firebase from '@react-native-firebase/app';
import '@react-native-firebase/auth';
import getDistance from 'geolib/es/getDistance';
import {FlatList, ScrollView} from 'react-native-gesture-handler';
import {Card} from 'react-native-elements';
import Share from 'react-native-share';
import Modal from 'react-native-modal';
import RNFetchBlob from 'rn-fetch-blob';
import GestureRecognizer, {swipeDirections} from 'react-native-swipe-gestures';
import {saveAsyncData} from '../helper/AsyncStorageUtil';

export class HomeScreen extends React.Component {
  isSharePostClicked = false;
  cardHeight = 0;
  instance = this;
  constructor(props) {
    super(props);
    this.state = {
      locations: [],
      visible: false,
      place: {},
      details: [],
      allLocations: [],
      cardheight: 120,
      showShare: false,
      numberOfLines: 1,
      textArray: [
        {text: '5', isSelectable: true},
        {text: '10', isSelectable: false},
        {text: '15', isSelectable: false},
        {text: '20', isSelectable: false},
        {text: '25', isSelectable: false},
        {text: '50', isSelectable: false},
        {text: '100', isSelectable: false},
      ],
      dividerWidth: 10,
    };
  }

  androidConfig = {
    clientId:
      '104800663700-pkjom2voar69801lei8e5uk6tk84gfcv.apps.googleusercontent.com',
    appId: '1:104800663700:android:c1458c658dae1bcc9adc81',
    apiKey: 'AIzaSyCdXtTx2u-LIxWY6Wl8mcDD6ZFu5wV4BaM',
    databaseURL: 'https://derive-6d1a1.firebaseio.com',
    storageBucket: 'derive-6d1a1.appspot.com',
    projectId: 'derive-6d1a1',
    messagingSenderId: 'x',
    persistence: true,
  };

  async componentDidMount() {
    SplashScreen.hide();
    firebase
      .initializeApp(this.androidConfig)
      .then(app => {})
      .catch(e => {});
    await firebase.auth().signInAnonymously();
    const ref = firestore().collection('dest_v3');
    ref.onSnapshot(querySnapshot => {
      let places = [];
      querySnapshot.docs.map((doc, i) => {
        places.push(doc.data());
      });
      console.log('PLACES', places);
      this.state.locations = places;
      this.state.allLocations = places;
      this.setState({details: places});
      console.log('PHOTOS', places[0].photos);
      this.updateSelectedState(0);
    });
    // this.setState({cardheight: this.cardHeight});
  }

  onViewableItemsChanged = ({viewableItems, changed}) => {
    if (viewableItems.length !== 0) {
      console.log('PUBLISH', viewableItems[0].index);
      this.mapView.animateToCoordinate({
        latitude: this.state.locations[viewableItems[0].index].lat,
        longitude: this.state.locations[viewableItems[0].index].lng,
      });
    }
  };

  updateSelectedState = position => {
    let newArray = [...this.state.textArray];

    this.state.textArray.map((item, key) => {
      if (key !== position) {
        newArray[key].isSelectable = false;
      } else {
        newArray[key].isSelectable = true;
        if (key > 0 && key < 6) {
          this.setState({dividerWidth: 20});
        } else if (key === 6) {
          this.setState({dividerWidth: 30});
        } else {
          this.setState({dividerWidth: 10});
        }
        this.radius = item.text;
      }
    });
    let updatedLocations = [];
    this.state.allLocations.map((data, i) => {
      let distance = getDistance(
        {latitude: 18.5204, longitude: 73.8567},
        {latitude: data.lat, longitude: data.lng},
      );
      if (distance <= this.radius * 1000) {
        updatedLocations.push(data);
      }
    });
    if (this.mapView) {
      let locationCoordinates = updatedLocations.map((d, i) => {
        return {
          latitude: parseFloat(d.lat),
          longitude: parseFloat(d.lng),
        };
      });
      this.mapView.fitToCoordinates(locationCoordinates, {
        edgePadding: {top: 30, right: 10, bottom: 10, left: 10},
        animated: true,
      });
    }

    this.setState({textArray: newArray, locations: updatedLocations});
  };

  getBase64Image(imgUrl, description, dishName) {
    const fs = RNFetchBlob.fs;
    let imagePath = null;
    RNFetchBlob.config({
      fileCache: true,
    })
      .fetch('GET', imgUrl)
      .then(resp => {
        imagePath = resp.path();
        return resp.readFile('base64');
      })
      .then(base64Data => {
        console.log(base64Data);
        const shareOptions = {
          title: 'Share via',
          message: description,
          subject: dishName,
          url: 'data:image/png;base64,' + base64Data,
          showAppsToView: false,
          filename: 'test',
        };
        // PubSub.publish(constant.keyAllConstant.keyPubProgress, {
        //   isShow: false,
        // });
        this.isSharePostClicked = false;
        Share.open(shareOptions)
          .then(res => {
            console.log(res);
          })
          .catch(e => {
            console.log(e);
          });
        return fs.unlink(imagePath);
      });
  }

  onSwipeDown = gestureState => {
    let height = this.state.cardheight;
    let timerCall = setInterval(() => {
      if (height > 120) {
        height = height - 150;
        if (height < 120) {
          this.setState({
            cardheight: 120,
            numberOfLines: 1,
            showShare: false,
          });
        } else {
          this.setState({
            cardheight: height,
            numberOfLines: 1,
            showShare: false,
          });
        }
      } else {
        clearInterval(timerCall);
      }
    }, 0.0001);
  };

  omSwipeUp = gestureState => {
    let height = 120;
    let timerCall = setInterval(() => {
      if (height < Dimensions.get('screen').height / 2) {
        height = height + 150;
        if (height > Dimensions.get('screen').height / 2) {
          this.setState({
            cardheight: Dimensions.get('screen').height / 2 - 50,
            numberOfLines: 12,
            showShare: true,
          });
        } else {
          this.setState({
            cardheight: height,
            numberOfLines: 12,
            showShare: true,
          });
        }
      } else {
        clearInterval(timerCall);
      }
    }, 0.0001);
  };

  render() {
    var views = [];
    views = this.state.textArray.map((item, key) => (
      <View key={key} style={styles.containerKmStyle}>
        <TouchableOpacity
          style={styles.touchableOpacityStyle}
          onPress={() => {
            this.updateSelectedState(key, false);
          }}>
          <View>
            <Text
              style={
                item.isSelectable
                  ? styles.selectableMilesStyle
                  : styles.milesStyle
              }
              key={key}>
              {item.text}
            </Text>
          </View>
        </TouchableOpacity>
        {item.isSelectable ? (
          <View
            style={[styles.diverderStyle, {width: this.state.dividerWidth}]}
          />
        ) : null}
      </View>
    ));

    return (
      <View style={{flex: 1}}>
        <View style={styles.kmContainerView}>
          <Text style={styles.textStyle}>Kilometers</Text>

          <Text
            onPress={() => {
              saveAsyncData('isTokenAvailable', 'false');
              this.props.navigation.navigate('LoginScreen');
            }}
            style={styles.textStyleLogout}>
            Logout
          </Text>
        </View>
        <View style={styles.contanierStyle}>{views}</View>
        <MapView
          style={{flex: 1}}
          provider={PROVIDER_GOOGLE}
          initialRegion={{
            latitude: 18.5204,
            longitude: 73.8567,
            latitudeDelta: 0.003,
            longitudeDelta: 0.19,
          }}
          ref={ref => {
            this.mapView = ref;
          }}
          minZoomLevel={4}
          maxZoomLevel={13}
          moveOnMarkerPress={false}
          onPress={() => {
            this.setState({isSelected: -1});
          }}>
          {this.state.locations.map((d, i) => {
            return (
              <Marker
                style={{height: 24, width: 24}}
                title={d.destination}
                coordinate={{
                  latitude: d.lat,
                  longitude: d.lng,
                }}
                onPress={e => {
                  e.stopPropagation();
                  this.setState({
                    isSelected: i,
                    region: {
                      latitudeDelta: 0.003,
                      longitudeDelta: 0.19,
                      latitude: d.lat,
                      longitude: d.lng,
                    },
                  });
                }}
                key={i}
              />
            );
          })}
        </MapView>
        <View style={{position: 'absolute', bottom: 0, left: 0, right: 0}}>
          <FlatList
            snapToAlignment={'center'}
            snapToInterval={Dimensions.get('screen').width}
            decelerationRate={'fast'}
            data={this.state.locations}
            horizontal={true}
            onViewableItemsChanged={this.onViewableItemsChanged}
            viewabilityConfig={{
              itemVisiblePercentThreshold: 90,
            }}
            renderItem={({item, index}) => (
              <GestureRecognizer
                onSwipeUp={this.omSwipeUp}
                onSwipeDown={this.onSwipeDown}>
                <View
                  onLayout={event => {
                    var {x, y, width, height} = event.nativeEvent.layout;
                    console.log(height);
                    this.cardHeight = height;
                  }}
                  style={{marginBottom: 10}}>
                  <Card
                    containerStyle={{
                      width: Dimensions.get('screen').width - 30,
                    }}>
                    <View
                      style={{
                        height: this.state.cardheight,
                      }}>
                      <View
                        style={{
                          // flex: 1,
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}>
                        <Image
                          style={{
                            height: 80,
                            width: 80,
                            backgroundColor: colors.colorLightGray,
                            marginStart: 5,
                          }}
                          resizeMode="cover"
                          source={{
                            uri: item.photos[0],
                          }}
                        />
                        <Text
                          style={{
                            marginStart: 10,
                            alignSelf: 'center',
                            width: 170,
                          }}>
                          {item.destination}
                        </Text>
                        {this.state.showShare ? (
                          <TouchableOpacity
                            onPress={() => {
                              console.log('SHARE');
                              if (!this.isSharePostClicked) {
                                this.isSharePostClicked = true;
                                this.getBase64Image(
                                  item.photos[0],
                                  item.summary,
                                  item.destination,
                                );
                              }
                            }}>
                            <Image
                              style={{
                                marginStart: 10,
                                width: 20,
                                height: 20,
                                zIndex: 10,
                                alignSelf: 'flex-end',
                              }}
                              source={require('../assets/share.png')}
                            />
                          </TouchableOpacity>
                        ) : null}
                      </View>
                      <Text
                        numberOfLines={this.state.numberOfLines}
                        ellipsizeMode={'tail'}
                        style={{marginTop: 10}}>
                        {item.summary}
                      </Text>
                    </View>
                  </Card>
                </View>
              </GestureRecognizer>
            )}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  contanierStyle: {
    backgroundColor: '#f8f8f8',
    height: 70,
    alignContent: 'space-between',
    justifyContent: 'space-between',
    flexDirection: 'row',
    paddingStart: 10,
  },
  milesStyle: {
    textAlignVertical: 'center',
    marginEnd: 10,
    color: '#bbbbbb',
    fontSize: 16,
    alignSelf: 'center',
  },
  touchableOpacityStyle: {
    height: 30,
    alignContent: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  containerKmStyle: {
    alignContent: 'center',
    justifyContent: 'center',
  },
  selectableMilesStyle: {
    textAlignVertical: 'center',
    marginEnd: 10,
    color: colors.colorRed,
    fontSize: 18,
    alignSelf: 'center',
  },
  milesStyle: {
    textAlignVertical: 'center',
    marginEnd: 10,
    color: colors.colorLightGray,
    fontSize: 16,
    alignSelf: 'center',
  },
  diverderStyle: {
    borderRadius: 5,
    width: 10,
    height: 3,
    backgroundColor: colors.colorPrimary,
    bottom: 0,
    position: 'absolute',
    marginTop: 10,
  },
  textStyle: {
    fontSize: 18,
    fontStyle: 'italic',
    color: colors.colorGray,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginStart: Dimensions.get('screen').width / 2 - 45,
  },
  textStyleLogout: {
    fontSize: 14,
    fontStyle: 'italic',
    color: colors.colorRed,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginStart: 80,
  },
  kmContainerView: {
    flexDirection: 'row',
    backgroundColor: '#f8f8f8',
    paddingTop: 10,
  },
});

export default HomeScreen;
