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
const {height, width} = Dimensions.get('window');
const radarPadding = width/10/2;
const radarDiameter = width-radarPadding*2;
const radarBorderWidth = 5;
const userPointDiameter = radarDiameter/20;
const targetDiameter = userPointDiameter;

class GeoQuest extends Component {

  constructor(props) {
    super(props);
    this.state = {
      lastPosition: {},
      scale: 500000,
      targets: [
        //home
        {
          latitude: 56.132374,
          longitude: 47.260439
        },
        //transform
        {
          latitude: 56.133569,
          longitude: 47.258969
        },
        //corner of next building
        {
          latitude: 56.131594,
          longitude: 47.262527
        },
        //near to kindergarden
        {
          latitude: 56.131426,
          longitude: 47.258643
        },
        //bayarea
        {
          latitude: 56.146603,
          longitude: 47.253530
        }
      ]
    };
  }

  watchID: null;

  // generateTargets(coords) {
  //   console.log(coords);
  //   let targets = []
  //   for(let i=0; i < 10; i++) {
  //     const target = {
  //       latitude: coords.latitude+(Math.random(1)-0.5),
  //       longitude: coords.longitude+(Math.random(1)-0.5)
  //     };
  //     targets.push(target);
  //   }
  //   return targets;
  // }

  componentDidMount() {
    this.watchID = navigator.geolocation.watchPosition(
      (position) => {
        this.setState((prevState)=>{
          let newState = {lastPosition: position, gpsProblem:false}
          console.log(position);
          // if(!prevState.lastPosition.coords){
          //   newState.targets = this.generateTargets(position.coords);
          // }
          return newState;
        });
      },
      (error) => {
        this.setState({gpsProblem:true})
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 0, //need to try less value
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
    const {coords={heading: 0, latitude:0, longitude:0}, timestamp} = this.state.lastPosition;
    // coords.heading = 0;
    // coords.latitude = 56.132374;
    // coords.longitude = 47.260439;
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
    console.log(this.state);
    const targetsScale = this.state.scale;
    const rotate = 360-coords.heading;

    function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
      var R = 6371; // Radius of the earth in km
      var dLat = deg2rad(lat2-lat1);  // deg2rad below
      var dLon = deg2rad(lon2-lon1); 
      var a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2)
        ; 
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
      var d = R * c; // Distance in km
      return d;
    }

    function deg2rad(deg) {
      return deg * (Math.PI/180)
    }

    return (
      <View>
        <View style={styles.container}></View>
        <View style={[styles.radarwrapper, {transform:[{rotate: `${rotate}deg`}]}]}>
          <View style={[styles.radar, {opacity:this.state.gpsProblem?0.1:1}]}>
            {
              this.state.targets.map((target, index) => {

                let targetPos = {
                  top:  ((radarDiameter/180.0) * (90 - target.latitude)),
                  left:  ((radarDiameter/360.0) * (180 + target.longitude))
                }

                let centerPos = {
                  top:  ((radarDiameter/180.0) * (90 - coords.latitude)),
                  left:  ((radarDiameter/360.0) * (180 + coords.longitude))
                }

                let targetVector = {
                  top: (targetPos.top-centerPos.top)*targetsScale,
                  left: (targetPos.left-centerPos.left)*targetsScale,
                }
                // targetVector.top =  ((radarDiameter/180.0) * (90 - target.latitude));
                // targetVector.left =  ((radarDiameter/360.0) * (180 + target.longitude));
                console.log(targetVector);
                const dist = parseInt(getDistanceFromLatLonInKm(target.latitude, target.longitude, coords.latitude, coords.longitude)*1000);
                const targetVectorDist = Math.sqrt(Math.pow(targetVector.top, 2) + Math.pow(targetVector.left, 2));
                const radarRadius = radarDiameter/2;
                if(targetVectorDist > radarRadius){
                    const targeVectorAngle = Math.atan2(targetVector.left, targetVector.top);
                    targetVector.top = Math.cos(targeVectorAngle) * (radarRadius-radarBorderWidth);
                    targetVector.left = Math.sin(targeVectorAngle) * (radarRadius-radarBorderWidth);
                }

                let targetStyle = {
                  top: targetVector.top+radarRadius-targetDiameter/2-radarBorderWidth,
                  left: targetVector.left+radarRadius-targetDiameter/2-radarBorderWidth,
                }

                return (<View key={index} style={[styles.target, targetStyle, {transform:[{rotate: `-${rotate}deg`}]}]}>
                  <Text style={{fontSize: targetDiameter/2}}>{index}: {dist}</Text>
                </View>);
              })
            }
          </View>
          <Text style={[styles.corner, styles.northCorner, {transform:[{rotate: `-${rotate}deg`}]}]}>N</Text>
          <Text style={[styles.corner, styles.southCorner, {transform:[{rotate: `-${rotate}deg`}]}]}>S</Text>
          <Text style={[styles.corner, styles.westCorner, {transform:[{rotate: `-${rotate}deg`}]}]}>W</Text>
          <Text style={[styles.corner, styles.eastCorner, {transform:[{rotate: `-${rotate}deg`}]}]}>E</Text>
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
    borderWidth: radarBorderWidth,
    borderColor: '#0f0',
    backgroundColor: '#0a5',
    borderRadius: radarDiameter/2
  },
  userPoint: {
    position: 'absolute',
    top: height/2,
    left: width/2-userPointDiameter/2,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: userPointDiameter/2,
    borderRightWidth: userPointDiameter/2,
    borderBottomWidth: userPointDiameter,
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
  },
  target: {
    position: 'absolute',
    flex: 1,
    justifyContent: 'center',
    // alignItems: 'center',
    paddingLeft: targetDiameter/4,
    width: targetDiameter*3,
    height: targetDiameter,
    borderRadius: targetDiameter/2,
    backgroundColor: '#0f0'
  }
});

AppRegistry.registerComponent('GeoQuest', () => GeoQuest);
