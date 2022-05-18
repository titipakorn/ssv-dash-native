import React, {useState, useEffect} from 'react';
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';
import Map from './Map';
import OverlayComponent from './OverlayComponent';
import VehicleOverlay from './VehicleOverlay';
import Queue from './Queue';
const faye = require('faye');
var client = new faye.Client('https://ssv-one.10z.dev/faye/faye');

export default function Dashboard() {
  const [drivers, setDriver] = useState({});
  const [locationDrivers, setLocationDriver] = useState({});
  const [driverState, setDriverState] = useState({});
  const [geo, setGeo] = useState({
    initialPosition: 'unknown',
    lastPosition: 'unknown',
    error: null,
  });
  useEffect(() => {
    client.subscribe(`/driver_locations`, function (message) {
      const {
        driver,
        coords: {latitude, longitude},
        timestamp,
      } = message;
      setDriver({driver, latitude, longitude, timestamp});
    });
  }, []);
  useEffect(() => {
    if ('driver' in drivers) {
      const {driver, latitude, longitude, timestamp} = drivers;
      setLocationDriver({
        ...locationDrivers,
        [driver]: {latitude, longitude, timestamp},
      });
    }
  }, [drivers]);
  return (
    <View style={styles.container}>
      <View style={styles.side}>
        <Queue />
      </View>
      <View style={styles.map}>
        <OverlayComponent
          behind={
            <Map
              pins={[]}
              trip={{}}
              coords={locationDrivers}
              drivers={driverState}
              handleGeoInfo={setGeo}
            />
          }
          front={<VehicleOverlay setDriverState={setDriverState} />}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: 'pink',
  },
  side: {
    flex: 3,
    backgroundColor: '#dedede',
  },
  map: {
    flex: 8,
    backgroundColor: 'blue',
  },
});
