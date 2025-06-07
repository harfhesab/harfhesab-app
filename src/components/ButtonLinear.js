import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import Font from '../utils/Font';
import { DotIndicator } from 'react-native-indicators';
import LinearGradient from 'react-native-linear-gradient';
import Globals from '../utils/Globals';

function ButtonLinear(props){
    return(
        <TouchableOpacity disabled={props.loading} activeOpacity={0.7} onPress={props.onPress}>
            <LinearGradient colors={[Globals.data.configs.colors.primary_gradient_start, Globals.data.configs.colors.primary_gradient_end]} style={{borderRadius:props.borderRadius, width:props.width, height:props.height}}>
                <View style={{borderRadius:props.borderRadius, width:props.width, height:props.height, alignItems:'center', justifyContent:'center'}}>
                    {
                        props.loading == true?
                        <DotIndicator color={Globals.data.configs.colors.white} count={3} size={7}/>
                        :
                        props?.icon?
                        <View style={{flexDirection:'row', alignItems:'center', width:'100%', justifyContent:'space-between', paddingHorizontal:10}}>
                            <Text style={{fontFamily:Font.medium, fontSize:props.textSize, color:Globals.data.configs.colors.white, textAlign:'center'}}>{props.text}</Text>
                            <props.icon/>
                        </View>
                        :
                        <View>
                            <Text style={{fontFamily:props.fontFamily || Font.medium, fontSize:props.textSize, color:Globals.data.configs.colors.white, textAlign:'center'}}>{props.text}</Text>
                            {
                                props?.text2&&
                                <Text style={{fontFamily:props.fontFamily || Font.medium, fontSize:12, color:Globals.data.configs.colors.white, textAlign:'center'}}>{props.text2}</Text>
                            }
                        </View>
                    }
                </View>
            </LinearGradient>
        </TouchableOpacity>
    )
}
export default React.memo(ButtonLinear);

{/* <ButtonLinear
    text={}
    onPress={}
    loading={}
    textSize={}
    width={}
    height={}
    borderRadius={}
/> */}