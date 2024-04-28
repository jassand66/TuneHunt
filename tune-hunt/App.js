import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Alert,  View, Image, Text, Button } from 'react-native';
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

import axios from 'axios';
import { encode as base64Encode } from 'base-64';
export default function App() {
    const spotifyCredentials = {
    clientId: 'c4fff062898b43b9b21a13d318a1f44b',
    clientSecret: '2a8dbcdf36ae49eabc5b4675a3b00733'
  };

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

  const [albumArt, setAlbumArt] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      await getLocationPermission();
      console.log(region.latitude, region.longitude);
    };
    fetchData();
    authenticateSpotify().then(fetchRandomAlbum);
  }, []);
  const authenticateSpotify = async () => {
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
  
    // Correctly encode Client ID and Client Secret using base-64 library
    const credentials = base64Encode(`${spotifyCredentials.clientId}:${spotifyCredentials.clientSecret}`);
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${credentials}`
    };
  
    try {
      const response = await axios.post('https://accounts.spotify.com/api/token', params, { headers });
      return response.data.access_token;
    } catch (error) {
      console.error('Spotify Authentication failed', error);
      return null;
    }
  };
  const fetchRandomAlbum = async (accessToken) => {
    try {
      const response = await axios.get('https://api.spotify.com/v1/browse/new-releases', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      const albums = response.data.albums.items;
      const randomAlbum = albums[Math.floor(Math.random() * albums.length)];
      setAlbumArt(randomAlbum.images[0].url);
    } catch (error) {
      console.error('Failed to fetch album data', error);
    }
  };

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
      <View style={styles.container}>
      {albumArt ? (
        <Image source={{ uri: albumArt }} style={styles.albumArt} resizeMode="cover" />
      ) : (
        <Text>Loading...</Text>
      )}
    </View>
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
  albumArt: {
    width: 300,
    height: 300, // Make sure these dimensions are set
  }
});
