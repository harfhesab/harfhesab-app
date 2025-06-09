import React from 'react';
import { ActivityIndicator, View, Text } from 'react-native';
import Font from '../../utils/Font';

export const DatabaseLoader = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor:"#333" }}>
    <ActivityIndicator size="large" color={"#FFF"}/>
    <Text style={{ marginTop: 16, fontFamily:Font.medium, color:"#FFF" }}>در حال اتصال به پایگاه داده...</Text>
  </View>
);