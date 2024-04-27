import React, { useState } from 'react';
import { View, TextInput, StyleSheet, FlatList } from 'react-native';

// Component for each grid item
const GridItem = ({ item }) => {
  return (
    <View style={styles.gridItem}>
      {/* Render your grid item here */}
    </View>
  );
};

// Component for the grid
const GridPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [data, setData] = useState(/* Your data source */);

  const renderItem = ({ item }) => <GridItem item={item} />;

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Search..."
        onChangeText={setSearchQuery}
        value={searchQuery}
      />
      <FlatList
        data={data}
        renderItem={renderItem}
        numColumns={3}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  searchBar: {
    height: 40,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  gridItem: {
    flex: 1,
    margin: 5,
    backgroundColor: 'lightgray',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default GridPage;
