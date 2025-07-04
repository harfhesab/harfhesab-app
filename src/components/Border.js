import React from 'react';
import {StyleSheet, View, Text, Dimensions} from 'react-native';
import {useTheme} from '@react-navigation/native';

function Border({top, bottom, height, horizontal, width, color}){
    const {colors} = useTheme().colors;
    const horizontalMargin = horizontal??0

    return(
        <View style={[styles.container, {marginTop:top??0, marginBottom:bottom??0, width:width??"100%", paddingHorizontal:horizontal??0}]}>
            <View style={{height:0, borderTopWidth:height??1.5, width:"100%", alignSelf:'center', borderTopColor:color??colors.border.a1}}/>
        </View>
    )
}
const styles = StyleSheet.create({
    container:{
        justifyContent:'center',
        alignItems:'center',
    },
})
export default Border;