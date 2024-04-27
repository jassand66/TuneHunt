import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';

const GridPage = () => {
  const data = [
    { key: '1', name: 'Item 1' },
    { key: '2', name: 'Item 2' },
    { key: '3', name: 'Item 3' },
    // Add more items as needed
  ];

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.itemText}>{item.name}</Text>
    </View>
  );

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={item => item.key}
      numColumns={3} // Set the number of columns here
      contentContainerStyle={styles.container}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    marginTop: 20,
  },
  item: {
    flex: 1,
    margin: 10,
    height: 120, // Specify the height
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9c2ff', // Example background color
  },
  itemText: {
    fontSize: 16,
    color: '#000',
  },
});

export default GridPage;
