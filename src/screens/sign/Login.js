import React, { useState, useRef } from 'react';
import {StyleSheet, View, TextInput, Text, Dimensions, TouchableOpacity} from 'react-native';
import { connect } from 'react-redux';
import {useTheme} from '@react-navigation/native';
import Font from '../../utils/Font';
import Globals from '../../utils/Globals';
import ButtonLinear from '../../components/ButtonLinear';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import {loginOperation} from '../../redux/actions/MainAction';
import Icon from '../../utils/Icon';

const {width} = Dimensions.get("window")
function Login(props){
    const {colors} = useTheme().colors;
    const [phone, setPhone] = useState("")
    const [focus, setFocus] = useState('')
    const [loading, setLoading] = useState(false)
    const phoneRef = useRef()
    

    const focusTextInput = (key)=>{
        setFocus(key)
    }
    const changePhone = (text)=>{
        setPhone(text)
    }
    const loginRequest = ()=>{
        props.loginOperation(true)
    }
    

    return(
        <View style={styles.container}>
            <View style={{flex:1, flexDirection:'column', justifyContent:'space-between', alignItems:'center'}}>
                    <View style={{width:width, marginTop:80, alignItems:'center'}}>
                        <Text style={{fontFamily:Font.bold, color:colors.text_white_1, fontSize:25, marginTop:40}}>{"ورود به بازی"}</Text>
                    </View>
                    <View style={{width:width-40, marginBottom:80, gap:20}}>
                        <View style={{ width:"100%"}}>
                            <Text style={{fontFamily:Font.medium, color:colors.text4, fontSize:14, textAlign:'justify', marginTop:2}}>{"برای ورود به بازی شماره موبایل خود را وارد کنید"}</Text>
                            <TextInput
                                ref={phoneRef}
                                placeholder={"شماره موبایل"}
                                placeholderTextColor={colors.text5}
                                onFocus={()=>focusTextInput('1')}
                                onBlur={()=>{setFocus('')}}
                                selectionColor={Globals.data.configs.colors.rgba1}
                                cursorColor={colors.color}
                                value={phone}
                                maxLength={11}
                                onSubmitEditing={loginRequest}
                                onChangeText={changePhone}
                                keyboardType={"numeric"}
                                style={{width:"100%", marginTop:2, fontSize:18, textAlignVertical:'center', color:colors.text, fontFamily:Font.en_medium,  alignSelf:'center', height:65, borderRadius:5, borderWidth:2, borderColor:focus == '1'?colors.color:colors.border, paddingHorizontal:15}}
                            />
                        </View>
                        <View style={{width:'100%', alignItems:'center'}}>
                            <ButtonLinear
                                text={'ورود به بازی'}
                                onPress={loginRequest}
                                loading={loading}
                                textSize={16}
                                width={width-40}
                                height={65}
                                borderRadius={5}
                            />
                        </View>
                    </View>
            </View>
        </View>
    )
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
    },
});
const mapDispatchToProps = (dispatch) => {
    return {
        loginOperation: (data) => dispatch(loginOperation(data)),
    }
}
export default connect(null, mapDispatchToProps)(Login)
