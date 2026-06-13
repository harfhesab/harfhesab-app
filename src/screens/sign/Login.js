import React, {useState, useEffect} from 'react';
import {StyleSheet, View, Text, Dimensions, KeyboardAvoidingView, SafeAreaView} from 'react-native';
import Icon from '../../utils/Icon';
import Font from '../../utils/Font';
import { DotIndicator } from 'react-native-indicators';
import axios from 'axios';
import LinearGradient from 'react-native-linear-gradient';
import ButtonGradient from '../../components/buttons/ButtonGradient';
import InputText from '../../components/inputs/InputText';
import { getHash } from 'react-native-otp-verify';
import useAppTheme from '../../hooks/theme/useAppTheme';
import { showToast } from '../../components/custom-toast/ToastRef';


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
            showToast({
                title: "خطا در ورود",
                message: text,
                type: "error",
                animationType: "slide",
                position: "top",
                duration: 6000
            });
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
                    showToast({
                        title: "خطا در ورود",
                        message: response.data?.errors[0]?.data[0]?.message??'مشکلی پیش آمد دوباره تلاش کنید.',
                        type: "error",
                        animationType: "slide",
                        position: "top",
                    });
                } else {
                    const data = response.data.data?.requestOtpForUserLogin
                    if(data?.status == 200) {
                        const minutes = data?.minutes;
                        const seconds = data?.seconds;
                        showToast({
                            message: data?.message??"کد تایید ارسال شد.",
                            type: "success",
                            animationType: "slide",
                            position: "top",
                        });
                        props.navigation.navigate('VerifyWithOTP', {phone: phone, minutes: minutes, seconds: seconds})
                    } else {
                        showToast({
                            title: "خطا در ورود",
                            message: 'مشکلی پیش آمد دوباره تلاش کنید.',
                            type: "error",
                            animationType: "slide",
                            position: "top",
                        });
                    }
                }
            }).catch((error)=>{
                showToast({
                    title: "خطا در ورود",
                    message: 'مشکلی پیش آمد دوباره تلاش کنید.',
                    type: "error",
                    animationType: "slide",
                    position: "top",
                });
                setLoading(false)
            })
        }
    }
    return(
        <View style={[styles.container, {backgroundColor:colors.background.a1}]}>
            <View style={styles.container2}>
                <KeyboardAvoidingView behavior='position' enabled keyboardVerticalOffset={50}>
                    <Text style={{fontFamily:Font.bakh_bold, fontSize:20, color:colors.text.a1, textAlign:'center'}}>{"ورود به دوکلام"}</Text>
                    <View style={{gap:15}}>
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
                                height={60}
                                borderRadius={10}
                                clearText={()=>setPhone("")}
                                onSubmitEditing={loginWithOtp}
                            />
                        </View>
                        <View style={{width:width, alignItems:'center'}}>
                            <ButtonGradient
                                height={60}
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
        
    )
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    container2: {
        flex:1,
        alignItems:'center',
        justifyContent:'space-around',
    },
});
export default Login
