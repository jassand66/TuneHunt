import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const ProfilePage = () => {
  // Hardcoded values
  const profilePictureURL = require('./profile.jpg'); // Assuming profile.jpeg is in the same directory
  const displayName = 'John Doe';
  const username = '@johndoe';

  const navigation = useNavigation(); // Using useNavigation hook to access navigation object

  const handleGoToTunesLibrary = () => {
    navigation.navigate('Library'); // Navigate to the TunesLibrary screen
  };

  return (
    <View style={styles.container}>
      <Image source={profilePictureURL} style={styles.profilePicture} />
      <Text style={styles.displayName}>{displayName}</Text>
      <Text style={styles.username}>{username}</Text>

      {/* Button to navigate to Tunes Library */}
      <TouchableOpacity style={styles.button} onPress={handleGoToTunesLibrary}>
        <Text style={styles.buttonText}>Go to Library</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'top',
    padding: 20,
    backgroundColor: 'black',
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  displayName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    color: 'white',
  },
  username: {
    fontSize: 16,
    marginBottom: 20,
    color: 'white',
  },
  button: {
    // backgroundColor: '#007bff',
    // paddingVertical: 10,
    // paddingHorizontal: 20,
    // borderRadius: 5,
    backgroundColor: 'black',
    borderRadius: 30,
    padding: 15,
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'white',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ProfilePage;