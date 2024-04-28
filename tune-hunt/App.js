import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Alert, Button } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

function generateRandomPoints(center, radius, count) {
  const points = [];
  for (let i = 0; i < count; i++) {
    const y0 = center.latitude;
    const x0 = center.longitude;
    const rd = radius / 111300; // about 111300 meters in one degree

    const u = Math.random();
    const v = Math.random();
    const w = rd * Math.sqrt(u);
    const t = 2 * Math.PI * v;
    const x = w * Math.cos(t);
    const y = w * Math.sin(t);
    
    const newLat = y + y0;
    const newLon = x + x0;

    points.push({ latitude: newLat, longitude: newLon });
  }
  return points;
}


export default function App() {
    const [region, setRegion] = useState({
      latitude: undefined,
      longitude: undefined,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
      // latitudeDelta: minLatitudeDelta,
      // longitudeDelta: minLatitudeDelta,
    });
  const [userLocation, setUserLocation] = useState(null);
  const [randomPoints, setRandomPoints] = useState([]);
  const mapRef = useRef(null);  // useRef to create a reference to the MapView


  useEffect(() => {
    const fetchData = async () => {
      await getLocationPermission();
      console.log(region.latitude, region.longitude);
    };
    fetchData();
  }, []);

  async function getLocationPermission() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Permission to access location was denied');
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.001,
        longitudeDelta: 0.001
      });
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      // const randomLocations = generateRandomPoints(location.coords, 11200, 2000); 
      const randomLocations = generateRandomPoints(location.coords, 530, 5); 
      setRandomPoints(randomLocations);
    } catch (error) {
      Alert.alert('Error', 'Failed to get location');
    }
  }

  const onRegionChangeComplete = (newRegion) => {
    setRegion(newRegion);  // Update region when user changes the map region
  };

  const resetMapView = () => {
    if (mapRef.current && userLocation) {
      mapRef.current.animateToRegion({
        ...userLocation,
        latitudeDelta: 0.001,
        longitudeDelta: 0.001
      }, 1000); // Smooth transition to user location over 1000 ms
    }
  };

  return (
    <View style={styles.container}>
      {region.latitude !== undefined && region.longitude !== undefined && (
        <MapView
          style={styles.map}
          initialRegion={region}
          onRegionChangeComplete={onRegionChangeComplete}
          minZoomLevel={16} 
        >
          {userLocation && (
            <Marker
            coordinate={userLocation}
            title="Your Location"
          >
            <View style={styles.marker}>
              <View style={styles.innerMarker} />
            </View>
          </Marker>
          )}
          {randomPoints.map((point, index) => (
          <Marker
            key={index}
            coordinate={point}
            title={`Random Point ${index + 1}`}
          >
            <View style={styles.randomMarker} />
          </Marker>
        ))}
        </MapView>
      )}
      <Button title="Reset Map" onPress={resetMapView} style={styles.resetButton} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'coral',
  },
  mapContainer: {
    width: '100%',
    height: '100%',
    position: 'relative', // This allows absolute positioning within the container
  },
  map: {
    width: '100%',
    height: '92%',
  },
  marker: {
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'blue',
    borderWidth: 2,
    borderColor: 'white',
  },
  randomMarker: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'black',
  },  
});
