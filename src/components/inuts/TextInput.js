import React, {memo, useState} from 'react';
import {View, Text, TouchableOpacity, TextInput} from 'react-native';
import Font from '../utils/Font';
import { DotIndicator, UIActivityIndicator } from 'react-native-indicators';
import LinearGradient from 'react-native-linear-gradient';
import Icon from '../../utils/Icon';

function TextInput({value, onChangeText, maxLength, placeholder, placeholderTextColor, keyboardType, fontFamily, fontSize, clearText}){
    const {colors} = useTheme().colors;
    const [focused, setFocused] = useState(false)

    return(
        <View style={{width:"100%", flexDirection:'row', alignItems:'center'}}>
            <TextInput
                placeholder={placeholder}
                placeholderTextColor={placeholderTextColor??colors.text.a5}
                onFocus={()=>setFocused(true)}
                onBlur={()=>setFocused(false)}
                selectionColor={colors.rgb.a1}
                cursorColor={colors.primary.a1}
                value={value}
                onChangeText={onChangeText}
                maxLength={maxLength}
                keyboardType={keyboardType??"default"}
                style={{width:"", color:colors.text.a1, fontFamily:fontFamily??Font.medium, fontSize:fontSize??14, alignSelf:'center', height:50, backgroundColor:colors.background4, borderRadius:5, borderWidth:1, borderColor:focus == '1'?colors.color:colors.border, paddingHorizontal:15}}
            />
            {
                clearText&&
                <TouchableOpacity activeOpacity={0.6} onPress={clearText}>
                    <Icon name={"delete"} type={"Feather"} style={{fontSize:20, color:colors.text.a2}}/>
                </TouchableOpacity>
            }
        </View>
    )
}
export default memo(TextInput);