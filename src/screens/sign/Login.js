import React, {useState} from 'react';
import {StyleSheet, View, Text, TouchableOpacity, Dimensions, KeyboardAvoidingView} from 'react-native';
import Icon from '../../utils/Icon';
import { connect } from 'react-redux';
import {useTheme} from '@react-navigation/native';
import Font from '../../utils/Font';
import { DotIndicator } from 'react-native-indicators';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import LinearGradient from 'react-native-linear-gradient';
import Globals from '../../utils/Globals';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import messaging from '@react-native-firebase/messaging';
import DeviceInfo from 'react-native-device-info';
import { convertFaDigitToEn } from '../../utils/ConvertFaDigitToEn';
import { phoneDigitSeperator } from '../../utils/PhoneDigitSeprator';
import ButtonGradient from '../../components/ButtonGradient';
import TextInput from '../../components/inuts/TextInput';

const width = Dimensions.get('window').width;
function Login(props){
    const {colors} = useTheme().colors;
    const [phone, setPhone] = useState('')
    const [secureText, setSecureText] = useState(true)
    const [loading, setLoading] = useState(false)
    const [loadingWithOtp, setLoadingWithOtp] = useState('')
    const [focus, setFocus] = useState('')

    const focusTextInput = (key)=>{
        setFocus(key)
    }

    const changePhone = (text)=>{
        setPhone(text)
    }
    const loginWithOtp = async() => {
        if(phone.length < 13){
            Toast.show({
                type: 'warning',
                text1: "شماره موبایل خود را به صورت صحیح وارد کنید."
            })
        } else {
            setLoading(false)
            setLoadingWithOtp(true)
            await axios({
                url:'/',
                method:'post',
                data: {
                    query : `
                    query requestLoginRealEstateOnlyOtp($phone : String!){
                        requestLoginRealEstateOnlyOtp(phone : $phone) {
                            status,
                            message,
                            minuts,
                            seconds
                        }
                    }
                    `,
                    variables : {
                        "phone" : phone.replaceAll(' ', ''),
                    }
                }
            }).then((response)=>{
                setLoadingWithOtp(false)
                if(response.data?.data == null){
                    Toast.show({
                        type: 'error',
                        text1: response.data.errors[0].data[0].message
                    })
                } else {
                    const data = response.data.data?.requestLoginRealEstateOnlyOtp
                    if(data?.status == 200) {
                        const minutes = data?.minuts;
                        const seconds = data?.seconds;
                        props.navigation.navigate('OTP', {phone: phone.replaceAll(' ', ''), minutes: minutes, seconds: seconds})
                    } else {
                        Toast.show({
                            type: 'error',
                            text1: 'مشکلی پیش آمد دوباره تلاش کنید'
                        })
                    }
                }
            }).catch((error)=>{
                setLoadingWithOtp(false)
            })
        }
    }
    const navigateToRequestRegister = () =>{
        props.navigation.navigate('RequestRegister')
    }
    return(
        <View style={[styles.container, {backgroundColor:colors.background}]}>
                <View style={styles.container2}>
                    <KeyboardAvoidingView behavior='position' enabled keyboardVerticalOffset={50}>
                    <Text style={{fontFamily:Font.black, fontSize:30, color:colors.test_2.color, alignSelf:'center'}}>{"ورود به بازی"}</Text>
                    <View style={{marginTop:100, width:width}}>
                        <TextInput
                            title={"شماره موبایل"}
                            placeholder={"شماره موبایل"}
                            value={phoneDigitSeperator(phone)}
                            maxLength={13}
                            onChangeText={changePhone}
                            keyboardType={'numeric'}
                        />
                    </View>
                    <TouchableOpacity activeOpacity={0.7} onPress={loginWithOtp} style={{marginTop:30}}>
                        
                    </TouchableOpacity>
                </KeyboardAvoidingView>
                </View>
        </View>
    )
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    container2: {
        alignItems:'center',
        justifyContent:'center',
        height:Dimensions.get('window').height - 55
    },
    loginBtn:{
        width:width - 60,
        height:50,
        alignSelf:'center',
        justifyContent:'center',
        alignItems:'center',
        borderRadius:5,
    },
    loginBtnTxt: {
        fontFamily:Font.medium,
        fontSize:14
    },
    loginTxt: {
        fontFamily:Font.medium,
        fontSize:12,
    },
    requstRegister: {
        fontFamily:Font.medium,
        fontSize:14,
    },
});
export default Login
