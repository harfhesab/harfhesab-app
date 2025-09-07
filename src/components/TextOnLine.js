import React from 'react';
import {StyleSheet, View, Text, Dimensions} from 'react-native';
import useAppTheme from '../hooks/theme/useAppTheme';

const width = Dimensions.get('window').width;
function TextOnLine(props){
    const colors = useAppTheme();

    return(
        <View style={[styles.container, {marginTop:props.top, marginBottom:props.bottom}]}>
            <View style={{height:props.height, width:width - props.horizontal * 2, alignSelf:'center', backgroundColor:colors.border.a1}}/>
            <View style={{position:'absolute', alignItems:props.align, width:width - props.horizontal * 2, alignSelf:'center'}}>
                <Text style={props.style}>{props.text}</Text>
            </View>
        </View>
    )
}
const styles = StyleSheet.create({
    container:{
        justifyContent:'center',
        width: width,
    },
})
export default TextOnLine;

{/* <TextOnLine 
        text={'نام آژانس'} 
        align={'center'}
        height={1}
        horizontal={20}
        top={20}
        bottom={5}
        style={[styles.textOnLineStyle, {color:colors.text4, backgroundColor:colors.background}]}
    />*/}