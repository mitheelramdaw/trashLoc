import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import { getDistance } from 'geolib';

const MapScreen = () => {
  const [location, setLocation] = useState({
    latitude: -26.0331, //Default location be Paulshof hehe cause you be the CEO
    longitude: 28.0386,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [distanceToTruck, setDistanceToTruck] = useState<number | null>(null);

  // Simulated truck location
  const truckLocation = {
    latitude: -26.0347,
    longitude: 28.0561,
  };

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation({
        ...location,
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      const distance = getDistance(
        { latitude: currentLocation.coords.latitude, longitude: currentLocation.coords.longitude },
        truckLocation
      );
      setDistanceToTruck(distance);
    })();
  }, []);

  const formatDistance = (distance: number) => {
    if (distance >= 1000) {
      return `${(distance / 1000).toFixed(2)} kilometers`;
    }
    return `${distance} meters`;
  };

  return (
    <View style={styles.container}>
      {errorMsg ? (
        <Text style={styles.errorText}>{errorMsg}</Text>
      ) : (
        <>
          <MapView
            style={styles.map}
            region={location}
            showsUserLocation={true}
          >
            {/* Marker for user's location */}
            <Marker
              coordinate={{ latitude: location.latitude, longitude: location.longitude }}
              title="Your Location"
              description="This is where you are"
            />

            {/* Marker for garbage truck */}
            <Marker coordinate={truckLocation}>
              {/* Custom view for emoji */}
              <View style={styles.emojiMarker}>
                <Text style={styles.emoji}>🚛</Text>
              </View>
              <Callout>
                <Text>Garbage Truck</Text>
              </Callout>
            </Marker>
          </MapView>
          {distanceToTruck !== null && (
            <Text style={styles.distanceText}>
              🚛 Garbage truck is {formatDistance(distanceToTruck)} away {/* Distance of truck */}
            </Text>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    margin: 10,
  },
  distanceText: {
    position: 'absolute',
    bottom: 20,
    //  For distance banner on bottom
    // top: 25,
    backgroundColor: 'black',
    padding: 10,
    borderRadius: 20,
    fontSize: 16,
    textAlign: 'center',
    color:'white',
  },
  emojiMarker: {
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 32, // Adjust the size of the emoji
  },
});

export default MapScreen;
