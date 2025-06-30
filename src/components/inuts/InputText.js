import React, {memo, useState, useEffect} from 'react';
import {View, Text, TouchableOpacity, TextInput, ActivityIndicator} from 'react-native';
import Font from '../../utils/Font';
import { DotIndicator, UIActivityIndicator } from 'react-native-indicators';
import LinearGradient from 'react-native-linear-gradient';
import Icon from '../../utils/Icon';
import {useTheme} from '@react-navigation/native';

function InputText({
        value,
        onChangeText,
        maxLength,
        placeholder,
        placeholderTextColor,
        keyboardType,
        fontFamily,
        fontSize,
        clearText,
        multiline,
        numberOfLines,
        autoFocus,
        secureTextEntry,
        onSubmitEditing,
        returnKeyType,
        borderWidth,
        borderRadius,
        checkValue,
        height,
        maxHeight,
        search,
        loading,
        title,
        required
    }){
    const {colors} = useTheme().colors;
    const [focused, setFocused] = useState(false)
    const [checkValueState, setCheckValueState] = useState(checkValue)
    const [secureTextEntryState, setSecureTextEntryState] = useState(secureTextEntry)

    useEffect(()=>{
        if(checkValue) {
            setCheckValueState(checkValue)
        }
    }, [checkValue])


    return(
        <View style={{width:"100%"}}>
            {
                title&&(
                <View style={{with:"100%", alignItems:"flex-start", paddingBottom:5}}>
                    <Text style={{fontFamily:Font.medium, fontSize:14, color:focused == true?colors.primary.a1:colors.text.a1}}>{title}{required==true&&(<Text style={{color:colors.alert.a1}}>{" * "}</Text>)}</Text>
                </View>
                )
            }
            <View style={{backgroundColor:`${colors.primary.a1}40`, width:"100%", flexDirection:'row', alignItems:'center', borderWidth:borderWidth??1, borderRadius:borderRadius??5, borderColor:focused == true?colors.primary.a1:checkValueState == true?colors.alert.a1:colors.border.a1, paddingHorizontal:10}}>
                <TextInput
                    placeholder={placeholder}
                    placeholderTextColor={placeholderTextColor??colors.text.a5}
                    onFocus={()=>{
                        setFocused(true)
                        setCheckValueState(false)
                    }}
                    onBlur={()=>setFocused(false)}
                    selectionColor={colors.rgb.a1}
                    cursorColor={colors.primary.a1}
                    value={value}
                    onChangeText={onChangeText}
                    maxLength={maxLength}
                    multiline={multiline}
                    numberOfLines={numberOfLines??1}
                    autoFocus={autoFocus}
                    secureTextEntry={secureTextEntryState}
                    keyboardType={keyboardType??"default"}
                    returnKeyType={returnKeyType??"default"}
                    onSubmitEditing={onSubmitEditing}
                    style={{
                        flex:1,
                        color:colors.text.a1,
                        fontFamily:fontFamily??Font.medium,
                        fontSize:fontSize??16,
                        alignSelf:'center',
                        height:height??65,
                        maxHeight:maxHeight,
                        paddingHorizontal:5,
                    }}
                />
                {(clearText && !search && value.length > 0)&&(
                    <TouchableOpacity activeOpacity={0.6} onPress={clearText} style={{width:40, alignItems:'center'}}>
                        <Icon name={"delete"} type={"Feather"} style={{fontSize:25, color:colors.text.a5}}/>
                    </TouchableOpacity>
                )}
                {secureTextEntry&&(
                    <TouchableOpacity activeOpacity={0.6} onPress={()=>setSecureTextEntryState(prev => !prev)} style={{width:30, alignItems:'center'}}>
                        <Icon name={secureTextEntryState == true?"eye":"eye-off"} type={"Feather"} style={{fontSize:20, color:colors.text.a2}}/>
                    </TouchableOpacity>
                )}
                {search&&(
                    <View style={{width:30, alignItems:'center'}}>
                        {
                            loading?(
                            <ActivityIndicator size={22} color={colors.primary.a1} />
                            ):(value?.length > 0 && clearText)?(
                                <TouchableOpacity activeOpacity={0.6} onPress={clearText} style={{width:30, alignItems:'center'}}>
                                    <Icon name={"delete"} type={"Feather"} style={{fontSize:20, color:colors.text.a2}}/>
                                </TouchableOpacity>
                            ):(<Icon name={"search"} type={"Feather"} style={{color:colors.text.a5, fontSize:20}}/>)
                        }
                    </View>
                )}
            </View>
        </View>
    )
}
export default memo(InputText);