import React from 'react';
import {StyleSheet} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import MapView, {Polyline, Marker} from 'react-native-maps';
import bbox from '@turf/bbox';
import {lineString} from '@turf/helpers';
import MapboxPolyline from '@mapbox/polyline';
import TraceLogger from './TraceLogger';
import {Icon} from 'react-native-elements';

function mapbound(curr, ODpins) {
  let arr = [];
  let region = {
    latitude: 0,
    longitude: 0,
    latitudeDelta: 0,
    longitudeDelta: 0,
  };
  if (curr && curr.latitude) {
    arr.push([curr.longitude, curr.latitude]);
  }
  Object.keys(ODpins).map((k) => {
    const one = ODpins[k];
    if (one.latitude) {
      arr.push([one.longitude, one.latitude]);
    }
  });
  if (arr.length < 2) return null;
  const line = lineString(arr);
  const mbox = bbox(line);
  const latDelta = mbox[3] - mbox[1];
  const lonDelta = mbox[2] - mbox[0];
  /*
  type Region {
    latitude: Number,
    longitude: Number,
    latitudeDelta: Number,
    longitudeDelta: Number,
  }
  */
  region = {
    latitude: (mbox[3] + mbox[1]) / 2,
    longitude: (mbox[2] + mbox[0]) / 2,
    latitudeDelta: latDelta * 1.5,
    longitudeDelta: lonDelta * 1.5,
  };
  return region;
}

function polyline2direction(polyline) {
  if (!polyline) return [];
  return MapboxPolyline.decode(polyline).map((ltln) => ({
    latitude: ltln[0],
    longitude: ltln[1],
  }));
}

export default function Map({pins, trip, handleGeoInfo, coords, drivers}) {
  let mapHandler = React.useRef(null);
  let watchID = React.useRef(null);
  const [region, setRegion] = React.useState({
    latitude: 13.7385,
    longitude: 100.5706,
    latitudeDelta: 0.0222,
    longitudeDelta: 0.0221,
  });
  const [traces, setTraces] = React.useState([]);
  const [log, setLog] = React.useState([]);
  const [geo, setGeo] = React.useState({
    initialPosition: 'unknown',
    lastPosition: 'unknown',
    error: null,
  });
  const {step} = trip;
  const isActive =
    trip.traces !== undefined && !['done', 'over'].includes(step);

  // React.useEffect(() => {
  //   // Fetch the token from storage then navigate to our appropriate place
  //   const bootstrapAsync = () => {
  //     Geolocation.getCurrentPosition(
  //       position => {
  //         console.log('new position: ', position);
  //         const initialPosition = position;
  //         const x = { initialPosition, lastPosition: initialPosition, error: null }
  //         setGeo(x);
  //         handleGeoInfo(x)
  //       },
  //       error => {
  //         console.log('error: ', JSON.stringify(error));
  //         // Alert.alert('Error', JSON.stringify(error))
  //         const x = { ...geo, error }
  //         setGeo(x);
  //         handleGeoInfo(x)
  //       },
  //       { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 },
  //     );
  //     watchID = Geolocation.watchPosition(position => {
  //       const lastPosition = position;
  //       // console.log('last position: ', typeof lastPosition, lastPosition);
  //       const x = { ...geo, lastPosition }
  //       setGeo(x);
  //       handleGeoInfo(x)
  //     });
  //   };

  //   handleGeoInfo(geo)
  //   if (isActive)
  //     bootstrapAsync();

  //   return () => {
  //     if (watchID !== null) {
  //       Geolocation.clearWatch(watchID);
  //     }
  //   };
  // }, [isActive]);

  // React.useEffect(() => {
  //   const mb = mapbound(geo.lastPosition.coords, pins);
  //   if (mb) mapHandler.animateToRegion(mb, 500);
  // }, [pins, geo]);

  // React.useEffect(() => {
  //   const ts = trip.traces
  //   if (ts && ts.length > 0) {
  //     // console.log('tssss:', ts[0])
  //     setTraces(ts.map(i => (
  //       { latitude: i['point']['coordinates'][1], longitude: i['point']['coordinates'][0], }
  //     )))
  //   }
  // }, [trip]);
  return (
    <>
      <MapView
        style={styles.map}
        initialRegion={region}
        ref={(map) => {
          mapHandler = map;
        }}>
        {/* {Object.keys(pins).map(k => {
          if (pins[k].latitude) {
            return (
              <Marker
                key={`p-${k}`}
                pinColor={k === 'origin' ? 'red' : 'green'}
                title={pins[k].title}
                description={k}
                coordinate={pins[k]}
              />
            );
          }
        })} */}
        {/* {geo.lastPosition !== 'unknown' && (
          <Marker
            key={'pin-you'}
            title={'You'}
            pinColor={'blue'}
            description={'Your current position'}
            coordinate={geo.lastPosition.coords}
          />
        )} */}
        <Marker
          key={'start_location'}
          coordinate={{longitude: 100.572538842281, latitude: 13.7447328859144}}
          // color={'#006400'}
        >
          <Icon
            reverse
            size={12}
            name="home-outline"
            color={'#006400'}
            type="ionicon"
          />
        </Marker>
        {Object.keys(coords).map(
          (v) =>
            drivers[v] && (
              <Marker
                key={`marker_${v}`}
                coordinate={{
                  longitude: coords[v]?.longitude ?? 0,
                  latitude: coords[v]?.latitude ?? 0,
                }}>
                <Icon
                  reverse
                  size={12}
                  name="car-outline"
                  color={drivers[v] ?? '#00008b'}
                  type="ionicon"
                />
              </Marker>
            ),
        )}
        {/* {traces.length > 0 && (
          <Polyline
            coordinates={traces}
            strokeColor="#000" // fallback for when `strokeColors` is not supported by the map-provider
            strokeColors={[
              '#7F0000',
              '#00000000', // no color, creates a "long" gradient between the previous and next coordinate
              '#B24112',
              '#E5845C',
              '#238C23',
              '#7F0000',
            ]}
            strokeWidth={2}
          />
        )} */}

        {/* <GeoIndicator position={geo.lastPosition} error={geo.error} /> */}
        {/* <TraceLogger
          tripID={trip.id}
          tripState={trip.step}
          position={geo.lastPosition}
        />
        {trip.polyline && (
          <Polyline
            coordinates={polyline2direction(trip.polyline)}
            strokeWidth={6}
            strokeColor={'#3333dd88'}
          />
        )} */}
      </MapView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 10,
  },
  map: {
    height: '100%',
    width: '100%',
    marginVertical: 0,
  },
});
