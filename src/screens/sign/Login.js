import React, {useState, useEffect} from 'react';
import {StyleSheet, View, Text, Dimensions, KeyboardAvoidingView, SafeAreaView} from 'react-native';
import Icon from '../../utils/Icon';
import Font from '../../utils/Font';
import { DotIndicator } from 'react-native-indicators';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import LinearGradient from 'react-native-linear-gradient';
import ButtonGradient from '../../components/buttons/ButtonGradient';
import InputText from '../../components/inputs/InputText';
import { getHash } from 'react-native-otp-verify';
import useAppTheme from '../../hooks/theme/useAppTheme';


const {width, height} = Dimensions.get('window');
function Login(props){
    const colors = useAppTheme()
    const [phone, setPhone] = useState('')
    const [loading, setLoading] = useState(false)
    const [hash, setHash] = useState("")

    useEffect(()=>{
        getHash().then(hash => {
            if(hash[0]?.length > 1){
                setHash(hash[0])
            }
        }).catch(console.log);
    }, [])

    const loginWithOtp = async() => {
        if(phone.length < 11){
            const text = phone.length == 0?"شماره موبایل خود را وارد کنید.":"شماره موبایل خود را به صورت صحیح وارد کنید."
            Toast.show({
                type: "error",
                text1 : "خطا در ورود",
                text2: text,
                visibilityTime: 6000
            })
        } else {
            setLoading(true)
            await axios({
                url:'/',
                method:'post',
                data: {
                    query : `
                    mutation requestOtpForUserLogin($phone : String!, $hash_id : String){
                        requestOtpForUserLogin(phone : $phone, hash_id : $hash_id) {
                            status,
                            message,
                            seconds,
                            minutes,
                        }
                    }
                    `,
                    variables : {
                        "phone" : phone,
                        "hash_id" : hash
                    }
                }
            }).then((response)=>{
                setLoading(false)
                if(response.data?.data == null){
                    Toast.show({
                        type: "error",
                        text1 : "خطا در ورود",
                        text2: response.data?.errors[0]?.data[0]?.message??'مشکلی پیش آمد دوباره تلاش کنید.',
                    })
                } else {
                    const data = response.data.data?.requestOtpForUserLogin
                    if(data?.status == 200) {
                        const minutes = data?.minutes;
                        const seconds = data?.seconds;
                        Toast.show({
                            type: "success",
                            text1 : data?.message??"کد تایید ارسال شد.",
                        })
                        props.navigation.navigate('VerifyWithOTP', {phone: phone, minutes: minutes, seconds: seconds})
                    } else {
                        Toast.show({
                            type: "error",
                            text1 : "خطا در ورود",
                            text2: 'مشکلی پیش آمد دوباره تلاش کنید.',
                        })
                    }
                }
            }).catch((error)=>{
                Toast.show({
                    type: "error",
                    text1 : "خطا در ورود",
                    text2: 'مشکلی پیش آمد دوباره تلاش کنید.',
                })
                setLoading(false)
            })
        }
    }
    return(
        <SafeAreaView>
            <LinearGradient colors={colors.background_gradient} style={{width:width, height:height}}>
                <View style={styles.container}>
                    <View style={styles.container2}>
                        <KeyboardAvoidingView behavior='position' enabled keyboardVerticalOffset={50}>
                            <Text style={{fontFamily:Font.black, fontSize:30, color:colors.text.a1, alignSelf:'center'}}>{"ورود به بازی"}</Text>
                            <View style={{gap:10}}>
                                <View style={{marginTop:100, width:width, paddingHorizontal:20}}>
                                    <InputText
                                        title={"شماره موبایل"}
                                        placeholder={"شماره موبایل"}
                                        value={phone}
                                        maxLength={11}
                                        onChangeText={(text)=>setPhone(text)}
                                        keyboardType={'numeric'}
                                        borderWidth={1.5}
                                        fontSize={18}
                                        borderRadius={10}
                                        clearText={()=>setPhone("")}
                                        onSubmitEditing={loginWithOtp}
                                    />
                                </View>
                                <View style={{width:width, alignItems:'center'}}>
                                    <ButtonGradient
                                        height={65}
                                        width={width - 40}
                                        text={"ورود"}
                                        onPress={loginWithOtp}
                                        loading={loading}
                                        textSize={18}
                                        borderRadius={10}
                                    />
                                </View>
                            </View>
                        </KeyboardAvoidingView>
                    </View>
                </View>
            </LinearGradient>
        </SafeAreaView>
        
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
