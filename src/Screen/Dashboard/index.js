import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {useRoute} from '@react-navigation/native';

const Dashboard = () => {
  const route = useRoute();
  const data = route.params.persent;
  return (
    <View style={styles.page}>
      <Text>{data}% face similarity</Text>
    </View>
  );
};

export default Dashboard;

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  txt: {fontSize: 17, fontWeight: '600', color: 'black'},
});
