import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Alert, Button, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
// import Icon from 'react-native-vector-icons/FontAwesome';
import Icon from 'react-native-vector-icons/Ionicons';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MapScreen from './MapScreen';  // Import your MapScreen
import ProfilePage from './ProfilePage';  // Import your ProfilePage
import Library from './Library';  // Import your Library

const Stack = createNativeStackNavigator(); // This line creates the Stack navigator

// function generateRandomPoints(center, radius, count) {
//   const points = [];
//   for (let i = 0; i < count; i++) {
//     const y0 = center.latitude;
//     const x0 = center.longitude;
//     const rd = radius / 111300; // about 111300 meters in one degree

//     const u = Math.random();
//     const v = Math.random();
//     const w = rd * Math.sqrt(u);
//     const t = 2 * Math.PI * v;
//     const x = w * Math.cos(t);
//     const y = w * Math.sin(t);
    
//     const newLat = y + y0;
//     const newLon = x + x0;

//     points.push({ latitude: newLat, longitude: newLon });
//   }
//   return points;
// }


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

      // const randomLocations = generateRandomPoints(location.coords, 11200, 2500); 
      const randomLocations = generateRandomPoints(location.coords, 530, 5); 
      setRandomPoints(randomLocations);
    } catch (error) {
      Alert.alert('Error', 'Failed to get location');
    }
  }

  const onRegionChangeComplete = (newRegion) => {
    setRegion(newRegion);  // Update region when user changes the map region
  };

  
  // const onRegionChangeComplete = async (newRegion) => {
  //   setRegion(newRegion);  // Update region when user changes the map region
  
  //   // Check if the region change is significant enough to warrant new points generation
  //   // This prevents excessive updates
  //   if (Math.abs(newRegion.latitude - region.latitude) > newRegion.latitudeDelta / 2 ||
  //       Math.abs(newRegion.longitude - region.longitude) > newRegion.longitudeDelta / 2) {
  //     const randomLocations = generateRandomPoints({
  //       latitude: newRegion.latitude,
  //       longitude: newRegion.longitude
  //     }, 530, 5);  // You can adjust the radius and count as needed
  //     setRandomPoints(randomLocations);
  //   }
  // };

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
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Map"
        screenOptions={{
          headerStyle: {
            backgroundColor: 'black', // Set the background color of the navigation bar to black
          },
          headerTintColor: 'white', // Set the text color of the navigation bar to white
        }}>
        <Stack.Screen name="Map" component={MapScreen} />
        {/* <Stack.Screen name="ProfilePage" component={ProfilePage} /> */}
        <Stack.Screen name="Library" component={Library} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}


<Stack.Navigator
          initialRouteName="Map"
          screenOptions={{
            headerStyle: {
              backgroundColor: 'black', // Set the background color of the navigation bar to black
            },
            headerTintColor: 'white', // Set the text color of the navigation bar to white
          }}
        >
          <Stack.Screen name="Map" component={MapScreen} />
          <Stack.Screen name="ProfilePage" component={ProfilePage} />
          <Stack.Screen name="Library" component={Library} />
        </Stack.Navigator>