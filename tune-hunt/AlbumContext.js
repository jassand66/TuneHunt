// AlbumContext.js
import React, { createContext, useState, useContext } from 'react';

const AlbumContext = createContext();

export const useAlbums = () => useContext(AlbumContext);

export const AlbumProvider = ({ children }) => {

    // keeps track of all the albums
    const [albums, setAlbums] = useState([
        // Initial albums data...
    ]);

    const addAlbum = (newAlbum) => {
        const albumKey = `${newAlbum.title.toLowerCase()}|${newAlbum.artist.toLowerCase()}`;
        const exists = albums.some(album => `${album.title.toLowerCase()}|${album.artist.toLowerCase()}` === albumKey);
        if (!exists) {
            setAlbums([...albums, newAlbum]);
        } else {
            console.log('Album already exists in the library.');
        }
    };

    return (
        <AlbumContext.Provider value={{ albums, addAlbum }}>
            {children}
        </AlbumContext.Provider>
    );
};
