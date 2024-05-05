import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, TextInput, FlatList, Dimensions, Modal, Button } from 'react-native';
import { useAlbums } from './AlbumContext';
import { Linking } from 'react-native';

const Library = () => {
    const [searchText, setSearchText] = useState('');
    const { albums } = useAlbums();

    const filteredAlbums = albums.filter(album => {
        const artistMatch = album.artist.toLowerCase().includes(searchText.toLowerCase());
        const titleMatch = album.title.toLowerCase().includes(searchText.toLowerCase());
        return artistMatch || titleMatch;
    });

    const openSpotifyLink = (url) => {
        if (!url) {
            console.error("No URL provided to openSpotifyLink");
            return; // Exit the function if the URL is undefined or empty
        }
        Linking.canOpenURL(url).then(supported => {
            if (supported) {
                Linking.openURL(url);
            } else {
                console.error("Don't know how to open URI: " + url);
            }
        }).catch(err => console.error('An error occurred', err));
    };

    const renderItem = ({ item }) => {
        return (
            <View style={styles.albumContainer}>
                <Image source={{ uri: item.coverURL }} style={styles.albumCover} onError={(e) => console.error('Image load error:', e.nativeEvent.error)} />
                <Text style={styles.albumTitle}>{item.title}</Text>
                <Text style={styles.artistName}>{item.artist}</Text>
                <TouchableOpacity onPress={() => openSpotifyLink(item.spotifyLink)}>
                    <View style={styles.surroundButton}>
                        <Image source={require('./spotify.png')} style={styles.spotifyButton} />
                    </View>
                </TouchableOpacity>
            </View>
        );
    };
    

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
        // alignItems: 'center',
        flexDirection: 'row', // Set direction to row
        flexWrap: 'wrap', // Allow items to wrap to the next line
        justifyContent: 'space-between',
    },
    albumContainer: {
        // width: '30%',
        // margin: 5, // Adjusted margin for proper spacing
        marginLeft: 5,
        marginRight: 5,
        marginBottom: 15,
        alignItems: 'center',
    },
    albumCover: {
        // width: (Dimensions.get('window').width - 20 * 3) / 3, // Calculate width inline
        // height: (Dimensions.get('window').width - 20 * 3) / 3,
        width: 100,
        aspectRatio: 1,
        marginBottom: 5, // Added margin to separate cover from captions
    },
    albumTitle: {
        textAlign: 'center',
        fontWeight: 'bold',
        color: 'white',
        width: (Dimensions.get('window').width - 20 * 3) / 3,
    },
    artistName: {
        textAlign: 'center',
        color: 'white',
        width: (Dimensions.get('window').width - 20 * 3) / 3,
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