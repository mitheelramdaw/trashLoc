import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import { getDistance } from 'geolib';

const MapScreen = () => {
  const [location, setLocation] = useState({
    latitude: -26.0331, // Default location
    longitude: 28.0386,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [distanceToTruck, setDistanceToTruck] = useState<number | null>(null);

  // Simulated garbage truck location
  const [truckLocation, setTruckLocation] = useState({
    latitude: -26.0347,
    longitude: 28.0561,
  });

  // Simulate the truck moving by incrementing its latitude/longitude values
  useEffect(() => {
    const interval = setInterval(() => {
      setTruckLocation((prevLocation) => ({
        ...prevLocation,
        longitude: prevLocation.longitude - 0.0001, // Simulating truck movement
      }));
    }, 5000); // Move every 5 seconds

    return () => clearInterval(interval); // Clean up the interval on component unmount
  }, []);

  // Fetch the user's location
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

      // Calculate the distance to the truck
      const distance = getDistance(
        { latitude: currentLocation.coords.latitude, longitude: currentLocation.coords.longitude },
        truckLocation
      );
      setDistanceToTruck(distance);
    })();
  }, [truckLocation]);

  // Format distance to show in kilometers or meters
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
            region={{
              latitude: truckLocation.latitude, // Focus on truck's location
              longitude: truckLocation.longitude,
              latitudeDelta: 0.01, // Adjusted delta for zoom level
              longitudeDelta: 0.01,
            }}
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
              🚛 Garbage truck is {formatDistance(distanceToTruck)} away
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
    bottom: 20, // You can move this to top if you want
    backgroundColor: 'black',
    color: 'white',
    padding: 10,
    borderRadius: 20,
    fontSize: 16,
    textAlign: 'center',
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
