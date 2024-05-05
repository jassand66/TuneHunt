import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MapScreen from './MapScreen';  // Import your MapScreen
import ProfilePage from './ProfilePage';  // Import your ProfilePage
import Library from './Library';  // Import your Library
import { AlbumProvider } from './AlbumContext';

const Stack = createNativeStackNavigator(); // This line creates the Stack navigator

export default function App() {

  return (
    <AlbumProvider>
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
    </AlbumProvider>
  );
}
