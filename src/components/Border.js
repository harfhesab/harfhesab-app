import React from 'react';
import {StyleSheet, View, Text, Dimensions} from 'react-native';
import useAppTheme from '../hooks/theme/useAppTheme';

function Border({top=0, bottom=0, height=1, horizontal=undefined, start=undefined, end=undefined, width="100%", color}){
    const colors = useAppTheme();

    return(
        <View style={[styles.container, {marginTop:top, marginBottom:bottom, width:width, paddingHorizontal:horizontal, paddingStart:start, paddingEnd:end}]}>
            <View style={{height:0, borderTopWidth:height, width:"100%", alignSelf:'center', borderTopColor:color??colors.border.a1}}/>
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