import React from 'react';
import {Text, View, StyleSheet, TouchableOpacity} from 'react-native';
import SplashScreen from 'react-native-splash-screen';
import colors from '../config/colors';
import MapView, {PROVIDER_GOOGLE, Marker} from 'react-native-maps';
import firestore from '@react-native-firebase/firestore';
import firebase from '@react-native-firebase/app';
import '@react-native-firebase/auth';
import getDistance from 'geolib/es/getDistance';

export class HomeScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      locations: [],
      allLocations: [],
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
    const ref = firestore().collection('dest_v2');
    ref.onSnapshot(querySnapshot => {
      let places = [];
      querySnapshot.docs.map((doc, i) => {
        places.push(doc.data());
      });
      this.state.locations = places;
      this.state.allLocations = places;
      this.updateSelectedState(0);
    });
  }

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
          onMapReady={() => {
            // this.onMapReady();
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
                  // this.props.markerClick({data: this.props.data[i], index: i});
                }}
                key={i}
                // icon={
                //   this.state.isSelected === i
                //     ? constant.map.active
                //     : constant.map.inActive
                // }
              />
            );
          })}
        </MapView>
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
  },
  kmContainerView: {backgroundColor: '#f8f8f8',paddingTop:10},
});

export default HomeScreen;
