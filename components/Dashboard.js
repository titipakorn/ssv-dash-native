import React from 'react';
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';
import Map from './Map';
import OverlayComponent from './OverlayComponent';
import VehicleOverlay from './VehicleOverlay';
import Queue from './Queue';

export default function Dashboard() {
  const [geo, setGeo] = React.useState({
    initialPosition: 'unknown',
    lastPosition: 'unknown',
    error: null,
  });

  return (
    <View style={styles.container}>
      <View style={styles.side}>
        <Queue />
      </View>
      <View style={styles.map}>
        <OverlayComponent
          behind={<Map pins={[]} trip={{}} handleGeoInfo={setGeo} />}
          front={<VehicleOverlay />}
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
