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

class GeoQuest extends Component {
  state = {
    lastPosition: {}
  };

  watchID: ?number = null;

  componentDidMount() {
    this.watchID = navigator.geolocation.watchPosition(
      (position) => {
        var lastPosition = position;
        this.setState({lastPosition});
      },
      (error) => alert(JSON.stringify(error)),
      {
        enableHighAccuracy: true,
        distanceFilter: 5, //need to try less value 
        timeout: 10000, //show question on the center
        maximumAge: 500 //need to try less value
      }
    );
  }

  componentWillUnmount() {
    navigator.geolocation.clearWatch(this.watchID);
  }

  render() {
    const {coords, timestamp} = this.state.lastPosition;

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

    return (
      <View> 
        <Text>Version: 0.0.2</Text>
        <View>
          { timeInfo }
        </View>
        <View>
          { currentInfo }
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  title: {
    fontWeight: '500',
  },
});

AppRegistry.registerComponent('GeoQuest', () => GeoQuest);
