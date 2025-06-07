import React from 'react';
import {Text, View, TouchableOpacity} from 'react-native';
import Font from '../utils/Font';
import { DotIndicator } from 'react-native-indicators';
import {useTheme} from '@react-navigation/native';

function ButtonBorder(props){
    const colors = useTheme().colors;
    return(
        <TouchableOpacity activeOpacity={0.7} onPress={props.onPress} style={{borderRadius:props.borderRadius, width:props.width, height:props.height, alignItems:'center', justifyContent:'center', borderColor:props?.color || colors.color, borderWidth:1}}>
            {
                props.loading == true?
                <DotIndicator color={colors.color} count={3} size={7}/>
                :
                props?.icon?
                <View style={{flexDirection:'row', alignItems:'center', width:'100%', justifyContent:'space-between', paddingHorizontal:10}}>
                    <Text style={{fontFamily:Font.medium, fontSize:props.textSize, color:props?.color || colors.color, textAlign:'center'}}>{props.text}</Text>
                    <props.icon/>
                </View>
                :
                <Text style={{fontFamily:Font.medium, fontSize:props.textSize, color:props?.color || colors.color, textAlign:'center'}}>{props.text}</Text>
            }
        </TouchableOpacity>
    )
}
export default React.memo(ButtonBorder);

{/* <ButtonBorder
    text={}
    onPress={}
    loading={}
    textSize={}
    width={}
    height={}
    borderRadius={}
/> */}