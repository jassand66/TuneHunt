import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Alert, Button, Text, TouchableOpacity, Image, Animated } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import IconF from 'react-native-vector-icons/FontAwesome';
import Icon from 'react-native-vector-icons/Ionicons';
import IconM from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import { encode as base64Encode } from 'base-64';
import { geolib, getDistance } from 'geolib';


function AlbumMarker({ albumArtUrl, size }) {
  return (
    <View style={styles.markerContainer}>
    {/* <TouchableOpacity style={styles.markerContainer} onPress={() => console.log("hi")} > */}
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
      {/* </TouchableOpacity> */}
    </View>
  );
}

const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }]
  },
  // Add more styles as needed
];

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
  
  function MapScreen({ navigation }) {
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
    const [showPopup, setShowPopup] = useState(false);
    const [popupMessage, setPopupMessage] = useState('');
    const [fadeAnim] = useState(new Animated.Value(0));  // Initial value for opacity: 0
    const [markersInRange, setMarkersInRange] = useState(new Array(randomPoints.length).fill(false));

    const handleMarkerPress = (albumUrl, userLocation, markerLocation, index) => {
      const distance = getDistance(
        { latitude: userLocation.latitude, longitude: userLocation.longitude },
        { latitude: markerLocation.latitude, longitude: markerLocation.longitude }
      );

      const newMarkersInRange = [...markersInRange];
      newMarkersInRange[index] = distance <= 1000;
      setMarkersInRange(newMarkersInRange);
    
      if (distance <= 1000) { // remember to change above too
        console.log(`Album selected: ${albumUrl}`);
        Alert.alert('Album Selected', `You selected the album: ${albumUrl}`);
      } else {
        setPopupMessage('Not in range, get closer');
        setShowPopup(true);
        Animated.timing(
          fadeAnim, // The animated value to drive
          {
            toValue: 1, // Animate to opacity: 1 (opaque)
            duration: 500, // Make the animation last for 500ms
            useNativeDriver: true, // Use native driver for better performance
          }
        ).start(() => {
          setTimeout(() => {
            Animated.timing(fadeAnim, {
              toValue: 0, // Animate to opacity: 0 (transparent)
              duration: 500, // Fade out duration
              useNativeDriver: true,
            }).start();
          }, 3000); // Start fading out after the popup has been visible for 3 seconds
        });
      }
    };    

    useEffect(() => {
      const fetchData = async () => {
        await getLocationPermission();
        const accessToken = await authenticateSpotify();
        if (accessToken) {
          fetchRandomAlbums(accessToken, 10);  // Fetch 5 random albums
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
  
        const randomLocations = generateRandomPoints(location.coords, 530, 10); 
        setRandomPoints(randomLocations);
      } catch (error) {
        Alert.alert('Error', 'Failed to get location');
      }
    }
  
    const onRegionChangeComplete = (newRegion) => {
      setRegion(newRegion);
    };

    const handleGoToProfilePage = () => {
      navigation.navigate('ProfilePage'); // Navigate to the ProfilePage screen
    };

    const handleGoToTunesLibrary = () => {
      navigation.navigate('Library'); // Navigate to the Library screen
    };
  
    const resetMapView = () => {
      if (mapRef.current && userLocation) {
        mapRef.current.animateToRegion({
          ...userLocation,
          latitudeDelta: 0.001,
          longitudeDelta: 0.001
        }, 1000);
      } else {
        console.log('MapView or user location is not available.');
      }
    };
  
    return (
      <View style={styles.container}>
        {region.latitude !== undefined && region.longitude !== undefined && (
          <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={styles.map}
            userInterfaceStyle = 'dark'
            showsUserLocation = "true"
            followsUserLocation = "true"

            initialRegion={region}
            onRegionChangeComplete={onRegionChangeComplete}
            minZoomLevel={16} 
            customMapStyle={darkMapStyle}
          >
            {/* {userLocation && (
              <Marker
              coordinate={userLocation}
              title="Your Location"
            >
              <View style={styles.marker}>
                <View style={styles.innerMarker} />
              </View>
            </Marker>
            )} */}

            {/* old good one, new one below works too */}
            {/* {randomPoints.map((point, index) => (
            <Marker key={index} coordinate={point} title={`Random Point ${index + 1}`}>
              <TouchableOpacity onPress={() => handleMarkerPress(albumArts[index], userLocation, point)} style={{ padding: 30, borderWidth: 1, borderColor: 'transparent' }} >
                <AlbumMarker albumArtUrl={albumArts[index]} size={markerStyle.width} />
              </TouchableOpacity>
            </Marker>
          ))} */}

            {randomPoints.map((point, index) => (
              <Marker
                key={index}
                coordinate={point}
                title={markersInRange[index] ? `Random Point ${index + 1}` : undefined}
              >
                <TouchableOpacity onPress={() => handleMarkerPress(albumArts[index], userLocation, point, index)} style={{ padding: 30, borderWidth: 1, borderColor: 'transparent' }} >
                  <AlbumMarker albumArtUrl={albumArts[index]} size={markerStyle.width} />
                </TouchableOpacity>
              </Marker>
            ))}

          </MapView>
          <View style={{ flexDirection: 'row', justifyContent: 'space-evenly'}}>
            <TouchableOpacity style={styles.button} onPress={resetMapView}>
              <Icon name="navigate" size={30} color="white" />
            </TouchableOpacity>
            {/* <TouchableOpacity style={styles.button} onPress={handleGoToProfilePage}>
              <IconF name="user-circle-o" size={30} color="white" />
            </TouchableOpacity> */}
            <TouchableOpacity style={styles.button} onPress={handleGoToTunesLibrary}>
              <IconM name="my-library-music" size={30} color="white" />
            </TouchableOpacity>
          </View>
          </View>
        )}
        {showPopup && (
          // <View style={styles.popup}>
          //   <Text style={styles.popupText}>{popupMessage}</Text>
          // </View>
          <Animated.View style={[styles.popup, { opacity: fadeAnim }]}>
            <Text style={styles.popupText}>{popupMessage}</Text>
          </Animated.View>
        )}
      </View>
    );
  }

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'black',
    },
    mapContainer: {
      width: '100%',
      height: '100%',
      position: 'relative', // This allows absolute positioning within the container
    },
    map: {
      width: '100%',
      height: '86%',
    },
    // marker: {
    //   backgroundColor: 'transparent',
    //   alignItems: 'center',
    //   justifyContent: 'center',
    // },
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
    resetButton: {
      color: 'white',
      position: 'absolute',
      width: 10,
      height: 10,
      borderRadius: 5,
      marginStart: 100,
      // alignItems: 'center',
      // justifyContent: 'center'
    },
    button: {
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 30,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 15,
      // marginEnd: 50,
      borderWidth: 1,
      borderColor: 'white',
    },
    buttonText: {
      color: 'white',
      // fontWeight: 'bold',
      fontSize: 16,
    },
    markerContainer: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    popup: {
      position: 'absolute',
      bottom: 150, // Adjust based on your layout
      alignSelf: 'center',
      backgroundColor: 'pink',
      padding: 10,
      borderRadius: 10,
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    popupText: {
      color: 'black',
    },
  });
  
  // export default function App() {
  //   return (
  //     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
  //       <Icon name="navigate" size={30} color="#4F8EF7" />
  //       <Text>Is the icon showing above?</Text>
  //     </View>
  //   );
  // };
  
  export default MapScreen;
