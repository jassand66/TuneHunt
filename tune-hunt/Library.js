import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, TextInput, FlatList, Dimensions, Modal, Button } from 'react-native';
import { BlurView } from 'expo-blur';

const Library = () => {
    const [searchText, setSearchText] = useState('');
    const [selectedAlbum, setSelectedAlbum] = useState(null); 
    const [modalVisible, setModalVisible] = useState(false); 

    const albumsData = [
        { id: 1, title: 'Currents', artist: 'Tame Impala', coverURL: require('./albumLibrary/Currents__Tame-Impala.jpeg') },
        { id: 3, title: 'Flower Boy', artist: 'Tyler The Creator', coverURL: require('./albumLibrary/Flower-Boy__Tyler_The_Creator.jpeg') },
        { id: 4, title: 'Goat', artist: 'Diljit Dosanj', coverURL: require('./albumLibrary/Goat_Diljit.jpeg') },
        { id: 5, title: 'Lemonade', artist: 'Beyonce', coverURL: require('./albumLibrary/Lemonade__Beyonce.jpeg') },
        { id: 6, title: 'Lets Start Here', artist: 'Lil Yachty', coverURL: require('./albumLibrary/Lets-Start-Here__LilYachty.jpeg') },
    ];

    const windowWidth = Dimensions.get('window').width;
    const numColumns = 3;
    //const albumCoverWidth = (windowWidth - 20 * numColumns) / numColumns;

    const filteredAlbums = albumsData.filter(album => {
        const artistMatch = album.artist.toLowerCase().includes(searchText.toLowerCase());
        const titleMatch = album.title.toLowerCase().includes(searchText.toLowerCase());
        return artistMatch || titleMatch;
    });

    const handleAlbumPress = (album) => {
        setSelectedAlbum(album);
        setModalVisible(true);
    };

    const renderItem = ({ item }) => (
        // <TouchableOpacity onPress={() => handleAlbumPress(item)}>
            <View style={styles.albumContainer}>
                <Image source={item.coverURL} style={styles.albumCover} />
                <Text style={styles.albumTitle}>{item.title}</Text>
                <Text style={styles.artistName}>{item.artist}</Text>
                <TouchableOpacity>
                  <View style={styles.surroundButton}>
                  <Image source={require('./spotify.png')} style={styles.spotifyButton} />
                  </View>
                </TouchableOpacity>
                {/* <Button title="Spotify" style={styles.spotifyButton} onPress={() => {
                    // Implement navigation to Spotify with selected album
                }} /> */}
            </View>
        // </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.searchInput}
                placeholder="Search by artist or album..."
                placeholderTextColor="white"
                value={searchText}
                onChangeText={text => setSearchText(text)}
            />
            <FlatList
                data={filteredAlbums}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
                numColumns={3}
                contentContainerStyle={styles.albumList}
            />
            {/* <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            > */}
                {/* <BlurView style={StyleSheet.absoluteFill} blurType="light" blurAmount={10}> */}
                    {/* <View style={styles.modalContainer}> */}
                        {/* <Text style={styles.albumTitle}>{selectedAlbum?.title}</Text> */}
                        {/* <Text style={styles.artistName}>{selectedAlbum?.artist}</Text> */}
                        {/* <TextInput
                            style={styles.dateInput}
                            placeholder="Enter date..."
                        /> */}
                        {/* <Button title="Go to Spotify" onPress={() => {
                            // Implement navigation to Spotify with selected album
                        }} /> */}
                        {/* <Button title="Close" onPress={() => setModalVisible(false)} /> */}
                    {/* </View> */}
                {/* </BlurView> */}
            {/* </Modal> */}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // backgroundColor: '#fff',
        backgroundColor: 'black',
        padding: 10,
    },
    searchInput: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 10,
        
    },
    albumList: {
        alignItems: 'center',
    },
    albumContainer: {
        margin: 5, // Adjusted margin for proper spacing
        alignItems: 'center',
    },
    albumCover: {
        width: (Dimensions.get('window').width - 20 * 3) / 3, // Calculate width inline
        height: (Dimensions.get('window').width - 20 * 3) / 3,
        marginBottom: 5, // Added margin to separate cover from captions
    },
    albumTitle: {
        textAlign: 'center',
        fontWeight: 'bold',
        color: 'white',
    },
    artistName: {
        textAlign: 'center',
        color: 'white',
    },
    modalContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.7)', // White background color
        padding: 20, // Adjust padding as needed
        alignItems: 'center',
        justifyContent: 'center',
        width: Dimensions.get('window').width / 2, // Set width to half of the screen width
        height: Dimensions.get('window').width / 2, // Set height to half of the screen width
        alignSelf: 'center', // Center horizontally
        marginTop: (Dimensions.get('window').height - (Dimensions.get('window').width / 2)) / 2, // Center vertically
        borderRadius: 15,
    },
    dateInput: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 10,
        width: '100%',
    },
    spotifyButton: {
        width: 90,
        height: 30,
        resizeMode: 'contain',

    },
    surroundButton: {
        backgroundColor: 'black',
        borderRadius: 30,
        padding: 5,
        marginTop: 10,
        borderWidth: 1,
        borderColor: 'white',
    }
});

export default Library;