/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View
} from 'react-native';

import Dimensions from 'Dimensions';

class GeoQuest extends Component {
  state = {
    lastPosition: {}
  };

  watchID: null;

  componentDidMount() {
    this.watchID = navigator.geolocation.watchPosition(
      (position) => {
        var lastPosition = position;
        this.setState({lastPosition});
      },
      (error) => alert(JSON.stringify(error)),
      {
        enableHighAccuracy: true,
        distanceFilter: 1, //need to try less value
        // desiredAccuracy: 1,  
        timeout: 1000, //show question on the center
        maximumAge: 100 //need to try less value
      }
    );
  }

  componentWillUnmount() {
    navigator.geolocation.clearWatch(this.watchID);
  }

  render() {
    const {coords={heading: 0}, timestamp} = this.state.lastPosition;
    console.log(coords);
    let timeInfo;
    if(timestamp){
      const date = `Date: ${(new Date(timestamp))}`
      timeInfo = (<Text>{ date }</Text>);
    }else{
      timeInfo = (<Text>No date</Text>);
    }

    let currentInfo;
    if(coords){
      currentInfo = Object.keys(coords).map(name => (
        <Text key={name}>{name}: {coords[name]}</Text>
      ))
    }else{
      currentInfo = (<Text>Waiting for info</Text>)
    }

      // <Text>Version: 0.0.2</Text>
      //   <View>
      //     { timeInfo }
      //   </View>
      //   <View>
      //     { currentInfo }
      //   </View>

    return (
      <View>
        <View style={styles.container}></View>
        <View style={[styles.radarwrapper, {transform:[{rotate: `${coords.heading}deg`}]}]}>
          <View style={styles.radar}>
          </View>
          <Text style={[styles.corner, styles.northCorner]}>N</Text>
          <Text style={[styles.corner, styles.southCorner]}>S</Text>
          <Text style={[styles.corner, styles.westCorner]}>W</Text>
          <Text style={[styles.corner, styles.eastCorner]}>E</Text>
        </View>
        <View style={styles.userPoint}></View>
        <View style={styles.info}>
          <View>
            { timeInfo }
          </View>
          <View>
            { currentInfo }
          </View>
        </View>
      </View>
    );
  }
}

const {height, width} = Dimensions.get('window');
const radarPadding = width/10/2;
const radarDiameter = width-radarPadding*2;
const userPointDiameter = radarDiameter/20;
const styles = StyleSheet.create({
  container: {
    height,
    width,
    backgroundColor: 'black'
  },
  radarwrapper: {
    position: 'absolute',
    top: (height-radarDiameter)/2,
    left: 0,
    width: width,
    height: width,
    // backgroundColor: 'red'
  },
  radar: {
    position: 'absolute',
    top: radarPadding,
    left: radarPadding,
    width: radarDiameter,
    height: radarDiameter,
    borderWidth: 5,
    borderColor: '#0f0',
    backgroundColor: '#0a5',
    borderRadius: radarDiameter/2
  },
  userPoint: {
    position: 'absolute',
    top: height/2-userPointDiameter/4,
    left: width/2-userPointDiameter,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: userPointDiameter,
    borderRightWidth: userPointDiameter,
    borderBottomWidth: userPointDiameter*2,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#0f0'
  },
  corner: {
    position: 'absolute',
    fontSize: radarDiameter/25,
    color: '#0f0'
  },
  northCorner: {
    top: 0,
    left: radarDiameter/2+radarPadding-25,
    width: 50,
    textAlign: 'center'
  },
  southCorner: {
    bottom: 0,
    left: radarDiameter/2+radarPadding-25,
    width: 50,
    textAlign: 'center'
  },
  westCorner: {
    top: radarDiameter/2,
    left: 0-radarPadding,
    width: 50,
    textAlign: 'center'
  },
  eastCorner: {
    top: radarDiameter/2,
    right: 0-radarPadding,
    width: 50,
    textAlign: 'center'
  },
  info: {
    position: 'absolute',
    top: 0,
    left: 0,
    width,
    backgroundColor: 'white'
  }
});

AppRegistry.registerComponent('GeoQuest', () => GeoQuest);
