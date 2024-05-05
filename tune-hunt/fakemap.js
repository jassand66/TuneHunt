import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Alert, Button } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Image } from 'react-native';
import { encode as base64Encode } from 'base-64';
import axios from 'axios';

function AlbumMarker({ albumArtUrl, size }) {
  return (
    <View style={styles.markerContainer}>
      <Image
        source={require('./frame.png')}
        style={{
          width: size,
          height: size,
          position: 'absolute',
          zIndex: 2,
          resizeMode: 'contain',
        }}
      />
      {albumArtUrl && (
        <Image
          source={{ uri: albumArtUrl }}
          style={{
            position: 'absolute',
            width: size * 0.5,
            height: size * 0.5,
            zIndex: 1,
            bottom: 0,
            transform: [{ translateY: size * 0.06 }],
          }}
        />
      )}
    </View>
  );
}

export default function App() {
  const [region, setRegion] = useState({
    latitude: undefined,
    longitude: undefined,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const spotifyCredentials = {
    clientId: 'c4fff062898b43b9b21a13d318a1f44b',
    clientSecret: '2a8dbcdf36ae49eabc5b4675a3b00733'
  };
  const [userLocation, setUserLocation] = useState(null);
  const [randomPoints, setRandomPoints] = useState([]);
  const [albumArts, setAlbumArts] = useState([]);
  const mapRef = useRef(null);
  const [markerStyle, setMarkerStyle] = useState({
    width: 200,
    height: 200,
  });
  useEffect(() => {
    const fetchData = async () => {
      await getLocationPermission();
      const accessToken = await authenticateSpotify();
      if (accessToken) {
        fetchRandomAlbums(accessToken, 5);  // Fetch 5 random albums
      }
    };
    fetchData();
  }, []);
  useEffect(() => {
    const newSize = calculateMarkerSize(region.latitudeDelta);
    setMarkerStyle({
      width: newSize,
      height: newSize,
    });
    console.log(`Adjusted size: ${newSize} for delta: ${region.latitudeDelta}`); // Log to verify new sizes
  }, [region.latitudeDelta]);

  async function fetchRandomAlbums(accessToken, count) {
    try {
      const response = await axios.get('https://api.spotify.com/v1/browse/new-releases', {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      const albums = response.data.albums.items;
      const randomAlbums = albums.sort(() => 0.5 - Math.random()).slice(0, count);
      const albumImages = randomAlbums.map(album => album.images[0].url);
      setAlbumArts(albumImages);
    } catch (error) {
      console.error('Failed to fetch album data', error);
    }
  }
  const calculateMarkerSize = (latitudeDelta) => {
    const minSize = 10; // Minimum size of the marker
    const maxSize = 200; // Maximum size of the marker
    const minDelta = 0.0001; // Adjusted for a more sensitive zoom reaction
  const maxDelta = 0.1; 
  
  const scale = Math.log(maxDelta / latitudeDelta) / Math.log(maxDelta / minDelta);
  let size = minSize + scale * (maxSize - minSize);
  size = Math.max(minSize, Math.min(size, maxSize)); // Clamp size to be between minSize and maxSize
  return size;
  };
  const authenticateSpotify = async () => {
    const credentials = base64Encode(`${spotifyCredentials.clientId}:${spotifyCredentials.clientSecret}`);
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${credentials}`
    };
    try {
      const response = await axios.post('https://accounts.spotify.com/api/token', new URLSearchParams({ 'grant_type': 'client_credentials' }), { headers });
      return response.data.access_token;
    } catch (error) {
      console.error('Spotify Authentication failed', error);
      return null;
    }
  };
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
  async function getLocationPermission() {
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
    setRandomPoints(generateRandomPoints(location.coords, 530, 5));
  }

  return (
    <View style={styles.container}>
      {region.latitude !== undefined && region.longitude !== undefined && (
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={region}
          onRegionChangeComplete={setRegion}
          minZoomLevel={16}
          showsUserLocation={true}
        >

           {randomPoints.map((point, index) => (
    <Marker key={index} coordinate={point} title={`Random Point ${index + 1}`}>
        <AlbumMarker albumArtUrl={albumArts[index]} size={markerStyle.width} />
    </Marker>
))}
        </MapView>
      )}
    </View>
  );
}

// Add your styles here

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
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
  randomMarkerImage: {
    width: 200, // Set the width of the image
    height: 200, // Set the height of the image
    resizeMode: 'contain' // Cover is generally a good resize mode for markers
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});