import React, {useState} from 'react';
import {StyleSheet, View, Text, TouchableOpacity, Dimensions, SafeAreaView} from 'react-native';
import { connect } from 'react-redux';
import {useTheme} from '@react-navigation/native';
import MyTransCall from '../../utils/translations/MyTrans';
import Font from '../../utils/Font';
import {setToken} from '../../../redux/actions/MainAction';
import { DotIndicator } from 'react-native-indicators';
import TimerShowOTP from '../../components/timer/TimerShowOTP';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import { phoneDigitSeperator } from '../../utils/PhoneDigitSeprator';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {
    CodeField,
    Cursor,
    useBlurOnFulfill,
    useClearByFocusCell,
} from 'react-native-confirmation-code-field';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import messaging from '@react-native-firebase/messaging';
import DeviceInfo from 'react-native-device-info';
  
  
const width = Dimensions.get('window').width;
const CELL_COUNT = 6;
function VerifyWithOTP(props){
    const [value, setValue] = useState('');
    const [loading, setLoading] = useState(false)
    const [newOtpLoading, setNewOtpLoading] = useState(false)
    const ref = useBlurOnFulfill({value, cellCount: CELL_COUNT});
    const [newOtp, setNewOtp] = useState(false)
    const [minutes, setMinutes] = useState(props.route.params?.minutes)
    const [seconds, setSeconds] = useState(props.route.params?.seconds)
    const [prop, getCellOnLayoutHandler] = useClearByFocusCell({
        value,
        setValue,
    });
    const colors = useTheme().colors;

    const endOfTime = ()=>{
        setNewOtp(true)
        setMinutes(0)
        setSeconds(0)
    }
    const requestNewOtp = ()=>{
        setValue('')
        setNewOtpLoading(true)
        axios({
            url:'/',
            method:'post',
            data: {
                query : `
                query requestNewOtpRealEstate($phone : String!){
                    requestNewOtpRealEstate(phone : $phone) {
                        status,
                        message,
                    }
                }
                `,
                variables : {
                    "phone" : props.route.params?.phone,
                }
            }
        }).then((response)=>{
            if(response.data?.data == null){
                Toast.show({
                    type: 'error',
                    text1: response.data.errors[0].data[0].message
                })
                setNewOtpLoading(false)
                setNewOtp(true)
            } else {
                if(response.data.data?.requestNewOtpRealEstate?.status == 200) {
                    Toast.show({
                        type: 'success',
                        text1: response.data.data?.requestNewOtpRealEstate?.message
                    })
                    setNewOtpLoading(false)
                    setNewOtp(false)
                    setMinutes(2)
                    setSeconds(0)
                }
            }
        }).catch((error)=>{
            setNewOtpLoading(false)
            setNewOtp(true)
        })
    }
    const login = async ()=>{
        if(newOtp == true) {
            Toast.show({
                type: 'error',
                text1: MyTransCall.translate('otp', 'otp_error_2')
            })
        } else if(value.length < 6) {
            Toast.show({
                type: 'error',
                text1: MyTransCall.translate('otp', 'otp_error_1')
            })
        } else {
            setLoading(true)
            const app_type = 'apk'
            // const firebase_token = await messaging().getToken()
            const os = await DeviceInfo.getSystemName()
            const os_version = await DeviceInfo.getSystemVersion()
            const device_brand = await DeviceInfo.getBrand()
            const device_name = await DeviceInfo.getDeviceName()
            const device_model = await DeviceInfo.getModel()
            const app_version = await DeviceInfo.getVersion()
            const unique_id = await DeviceInfo.getUniqueId()
            await axios({
                url:'/',
                method:'post',
                data: {
                    query : `
                    mutation consultantRequestLoginToCRMWithOTP(
                        $phone : String!,
                        $code : String!,
                        $app_type : String,
                        $firebase_token : String,
                        $os : String,
                        $os_version : String,
                        $device_brand : String,
                        $device_name : String,
                        $device_model : String,
                        $app_version : String,
                        $unique_id : String,
                    ){
                        consultantRequestLoginToCRMWithOTP(
                            phone : $phone,
                            code : $code,
                            app_type : $app_type,
                            firebase_token : $firebase_token,
                            os : $os,
                            os_version : $os_version,
                            device_brand : $device_brand,
                            device_name : $device_name,
                            device_model : $device_model,
                            app_version : $app_version,
                            unique_id : $unique_id,
                        ) {
                            status,
                            message,
                            token
                        }
                    }
                    `,
                    variables : {
                        "phone" : props.route.params?.phone,
                        "code" : value,
                        "app_type" : app_type,
                        "firebase_token" : "",
                        "os" : os,
                        "os_version" : os_version,
                        "device_brand" : device_brand,
                        "device_name" : device_name,
                        "device_model" : device_model,
                        "app_version" : app_version,
                        "unique_id" : unique_id,
                    }
                }
            }).then(async(response)=>{
                if(response.data?.data == null){
                    setLoading(false)
                    Toast.show({
                        type: 'error',
                        text1: response.data.errors[0].data[0].message
                    })
                } else {
                    const data = response.data.data?.consultantRequestLoginToCRMWithOTP
                    if(data?.status == 200) {
                        setLoading(false)
                        const token = data?.token;
                        await AsyncStorage.setItem('jwt', token)
                        axios.defaults.headers.post['token'] = token;
                        props.setToken(token)
                    }
                }
            }).catch(()=>{
                setLoading(false)
            })
        }
    }
    return(
        <View style={[styles.container, {backgroundColor:colors.background}]}>
            <View style={{alignItems:'center'}}>
            <MaterialCommunityIcons name={'tooltip-cellphone'} color={colors.text4} style={{fontSize:width * 0.2}}/>
            <Text style={{fontFamily:Font.black, color:colors.text2, fontSize:18, textAlign:'center', marginVertical:20}}>{MyTransCall.translate('otp', 'enter_verify')}</Text>
            <Text style={{fontFamily:Font.medium, color:colors.text4, fontSize:12, textAlign:'center'}}>{MyTransCall.translate('otp', 'send_otp')}</Text>
            <Text style={{textDecorationLine:'underline', fontFamily:Font.bold, color:colors.text4, fontSize:14, textAlign:'center', marginBottom:10}}>{phoneDigitSeperator(props.route.params?.phone || '')}</Text>
            <SafeAreaView >
                <CodeField
                    ref={ref}
                    {...prop}
                    // Use `caretHidden={false}` when users can't paste a text value, because context menu doesn't appear
                    value={value}
                    onChangeText={setValue}
                    cellCount={CELL_COUNT}
                    rootStyle={styles.codeFieldRoot}
                    autoFocus={true}
                    keyboardType="number-pad"
                    textContentType="oneTimeCode"
                    renderCell={({index, symbol, isFocused}) => (
                    <Text
                        key={index}
                        style={[styles.cell, {borderColor:isFocused?colors.color:colors.border, backgroundColor:colors.background4, color:colors.text}]}
                        onLayout={getCellOnLayoutHandler(index)}>
                        {symbol || (isFocused ? <Cursor /> : null)}
                    </Text>
                    )}
                />
            </SafeAreaView>
            </View>
            <View style={{width:'100%', alignItems:'center'}}>
                <View style={{width:'100%', height:50, alignItems:'center', justifyContent:'center'}}>
                {
                    newOtpLoading == true?
                    <DotIndicator color={colors.text} count={3} size={7}/>
                    :
                    newOtp == true?
                    <TouchableOpacity activeOpacity={0.5} onPress={requestNewOtp}>
                        <Text style={{fontFamily:Font.bold, color:colors.color, fontSize:12, textAlign:'center'}}>{MyTransCall.translate('otp', 'request_new')}</Text>
                    </TouchableOpacity>
                    :
                    <TimerShowOTP
                        minutes={minutes}
                        seconds={seconds}
                        endOfTime={endOfTime}
                    />
                }
                </View>
                <TouchableOpacity activeOpacity={0.5} onPress={login} style={[styles.btnStyle, {backgroundColor:colors.color}]}>
                    {
                        loading == true?
                        <DotIndicator color={colors.white} count={3} size={7}/>
                        :
                        <Text style={[styles.btnText, {color:colors.white}]}>{MyTransCall.translate('otp', 'login')}</Text>
                    }
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={0.5} style={{marginTop:10}} onPress={()=>{props.navigation.goBack()}}>
                    <Text style={{fontFamily:Font.bold, color:colors.color, fontSize:12, textAlign:'center'}}>{MyTransCall.translate('otp', 'change_phone')}</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems:'center',
        justifyContent:'space-evenly'
    },
    codeFieldRoot: {flexDirection:'row-reverse'},
    cell: {
        width: width * 0.1,
        height: width * 0.1,
        alignItems:'center',
        justifyContent:'center',
        fontSize: width * 0.06,
        fontFamily: Font.medium,
        borderWidth: 1,
        borderRadius: 5,
        margin:5,
        textAlignVertical: 'center',
        textAlign: 'center',
    },
    btnStyle: {
        width: width * 0.6 + 50,
        height:50,
        borderRadius:5,
        alignItems:'center',
        justifyContent:'center',
        marginTop:30
    },
    btnText: {
        fontFamily: Font.medium,
        fontSize: 14 
    }
});
export default VerifyWithOTP
