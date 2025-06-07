import React from "react";
import {View} from 'react-native';
import {useTheme} from '@react-navigation/native';

function RadioButton(props){
    const colors = useTheme().colors;
    
    return(
        <View pointerEvents={"none"} style={{borderRadius:props.size/2, borderWidth:1.5, borderColor:props.color, alignItems:'center', justifyContent:'center', width:props.size, height:props.size, backgroundColor:colors.background4}}>
            {
                props.selected == true?
                <View style={{width:props.size-10, height:props.size-10, borderRadius:(props.size-10)/2, backgroundColor:props.color }}/>
                :null
            }
        </View>
    )
}
export default (React.memo(RadioButton))