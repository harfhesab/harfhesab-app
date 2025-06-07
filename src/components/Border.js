import React from 'react';
import {StyleSheet, View, Text, Dimensions} from 'react-native';
import {useTheme} from '@react-navigation/native';

const width = Dimensions.get('window').width;
function Border(props){
    const colors = useTheme().colors;

    return(
        <View style={[styles.container, {marginTop:props.top, marginBottom:props.bottom}]}>
            <View style={{height:0, borderTopWidth:props.height, width:width - props.horizontal * 2, alignSelf:'center', borderTopColor:colors.border}}/>
        </View>
    )
}
const styles = StyleSheet.create({
    container:{
        justifyContent:'center',
        alignItems:'center',
        width: width,
    },
})
export default Border;