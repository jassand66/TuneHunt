import React, { useEffect, useState } from 'react';
import { StyleSheet, Alert,  View, Image, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
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
  });
  const [userLocation, setUserLocation] = useState(null);
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
        latitudeDelta: 0.005,
        longitudeDelta: 0.005
      });
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to get location');
    }
  }

  return (
    <View style={styles.container}>
      {region.latitude !== undefined && region.longitude !== undefined && (
        <MapView
          style={styles.map}
          initialRegion={region}
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
        </MapView>
      )}
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
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    width: '100%',
    height: '100%',
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
  albumArt: {
    width: 300,
    height: 300, // Make sure these dimensions are set
  }
});
