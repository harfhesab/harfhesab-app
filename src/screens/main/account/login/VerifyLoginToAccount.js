import React, {useState, useEffect} from 'react';
import {StyleSheet, View, Text, TouchableOpacity, Dimensions, SafeAreaView, ScrollView, KeyboardAvoidingView} from 'react-native';
import { connect } from 'react-redux';
import Font from '../../../../utils/Font';
import {setToken} from '../../../../redux/actions/MainAction';
import { DotIndicator } from 'react-native-indicators';
import TimerShowOTP from '../../../../components/timer/TimerShowOTP';
import axios from 'axios';
import { phoneDigitSeperator } from '../../../../utils/PhoneDigitSeprator';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import messaging from '@react-native-firebase/messaging';
import DeviceInfo from 'react-native-device-info';
import InputCodeField from '../../../../components/inputs/InputCodeField';
import ButtonGradient from '../../../../components/buttons/ButtonGradient';
import LinearGradient from 'react-native-linear-gradient';
import Icon from '../../../../utils/Icon';
import {
    getHash,
    startOtpListener,
    useOtpVerify,
} from 'react-native-otp-verify';
import { useSelector, useDispatch } from 'react-redux';
import { convertGuestToRegistered, login, updateSyncUserPackage } from '../../../../redux/slices/accountSlice';
import useAppTheme from '../../../../hooks/theme/useAppTheme';
import { updateNumberCoins } from '../../../../redux/slices/coinSlice';
import { useRealm } from '../../../../realm';
import { updateUserStageGameProgressInLogin } from '../../../../realm/repositories/user/user-stage-game-progress.repository';
import GeneralHeader from '../../../../components/header/GeneralHeader';
import { updateSubscriptionStatus } from '../../../../redux/slices/subscriptionSlice';
import { updateCurrentLanguageLastStageAndLastSeason } from '../../../../redux/slices/stageGameSlice';
import { deleteAllUserPackages } from '../../../../realm/repositories/user/user-package-game-progress.repository';
import { showToast } from '../../../../components/custom-toast/ToastRef';
import { updateNumberHiddenWords } from '../../../../redux/slices/hiddenWordSlice';
import { BUILD_TYPE, TARGET_STORE } from '../../../../utils/constants/build-config';
  
  
const {width, height} = Dimensions.get('window');
function VerifyLoginToAccount(props){
    const realm = useRealm();
    const dispatch = useDispatch();
    const colors = useAppTheme()
    const [value, setValue] = useState('');
    const [hash, setHash] = useState("")
    const [loading, setLoading] = useState(false)
    const [newOtpLoading, setNewOtpLoading] = useState(false)
    const [newOtp, setNewOtp] = useState(false)
    const [minutes, setMinutes] = useState(props.route.params?.minutes)
    const [seconds, setSeconds] = useState(props.route.params?.seconds)
    const { stopListener } = useOtpVerify({numberOfDigits: 6});
    const phone = props.route.params?.phone
    const { numberCoins } = useSelector((state) => state.coins);
    const { stageGameLanguage } = useSelector((state) => state.stageGamePersist);
    const { totalHiddenWords, newHiddenWords } = useSelector((state) => state.hiddenWords);


    const removeListener = ()=>{
        stopListener()
    }

    useEffect(() => {
        getHash().then(hash => {
            if(hash[0]?.length > 1){
                setHash(hash[0])
            }
        }).catch(console.log);
      
        startOtpListener(message => {
            const match = /(\d{6})/g.exec(message);
            if (match && match[1]) {
                const otp = match[1];
                setValue(otp);
                const time = setTimeout(()=>{
                    verifyWithOtp(otp)
                    clearTimeout(time)
                }, 500)
            }
        });
        return () => removeListener();
    }, []);

    const endOfTime = ()=>{
        setNewOtp(true)
        setMinutes(0)
        setSeconds(0)
    }
    const requestNewOtp = async ()=>{
        setValue('')
        setNewOtpLoading(true)
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
            setNewOtpLoading(false)
            if(!response.data?.data){
                showToast({
                    title: "خطا در ارسال کد",
                    message: response.data?.errors[0]?.data[0]?.message??'مشکلی پیش آمد دوباره تلاش کنید.',
                    type: "error",
                    animationType: "slide",
                    position: "top",
                    duration: 6000
                });
                setNewOtp(true)
            } else {
                const data = response.data.data?.requestOtpForUserLogin
                if(data?.status == 200) {
                    showToast({
                        message: data?.message??"کد تایید ارسال شد.",
                        type: "success",
                        animationType: "slide",
                        position: "top",
                    });
                    const minutes = data?.minutes;
                    const seconds = data?.seconds;
                    setMinutes(minutes)
                    setSeconds(seconds)
                    setNewOtp(false)
                }
            }
        }).catch((error)=>{
            showToast({
                title: "خطا در ارسال کد",
                message: 'مشکلی پیش آمد دوباره تلاش کنید.',
                type: "error",
                animationType: "slide",
                position: "top",
            });
            setNewOtpLoading(false)
            setNewOtp(true)
        })
    }
    const verifyUserLoginWithOTP = async (text)=>{
        const otp = text??value
        if(newOtp == true) {
            showToast({
                title: "خطای کد تایید",
                message: 'اعتبار کد تاییدی که برایتان ارسال شده، تمام شده است. لطفا مجدد درخواست کد تایید کنید.',
                type: "error",
                animationType: "slide",
                position: "top",
                duration:6000
            });
        } else if(otp.length < 6) {
            showToast({
                title: "خطای کد تایید",
                message: 'یک کد تایید 6 رقمی به شماره موبایلتان ارسال شده است. آن را به صورت صحیح وارد کنید.',
                type: "error",
                animationType: "slide",
                position: "top",
                duration:6000
            });
        } else {
            setLoading(true)
            // const firebase_token = await messaging().getToken()
            const os = await DeviceInfo.getSystemName()
            const os_version = await DeviceInfo.getSystemVersion()
            const device_brand = await DeviceInfo.getBrand()
            const device_name = await DeviceInfo.getDeviceName()
            const device_model = await DeviceInfo.getModel()
            const app_version = await DeviceInfo.getVersion()
            const app_build_number = await DeviceInfo.getBuildNumber()
            const unique_id = await DeviceInfo.getUniqueId()
            await axios({
                url:'/',
                method:'post',
                data: {
                    query : `
                    mutation verifyUserLoginWithOTPAndMergeGuestAndRegistered(
                        $phone : String!,
                        $code : String!,
                        $number_coins : Int,
                        $total_hidden_words : Int,
                        $new_hidden_words : Int,
                        $firebase_token : String,
                        $app_version : String,
                        $app_build_number : Int,
                        $os : String,
                        $os_version : String,
                        $device_brand : String,
                        $device_name : String,
                        $device_model : String,
                        $unique_id : String,
                        $target_store : String,
                        $build_type : String,
                    ){
                        verifyUserLoginWithOTPAndMergeGuestAndRegistered(
                            phone : $phone,
                            code : $code,
                            number_coins : $number_coins,
                            total_hidden_words : $total_hidden_words,
                            new_hidden_words : $new_hidden_words,
                            firebase_token : $firebase_token,
                            app_version : $app_version,
                            app_build_number : $app_build_number,
                            os : $os,
                            os_version : $os_version,
                            device_brand : $device_brand,
                            device_name : $device_name,
                            device_model : $device_model,
                            unique_id : $unique_id,
                            target_store : $target_store,
                            build_type : $build_type,
                        ) {
                            status,
                            message,
                            token,
                            user{name, number_coins, total_hidden_words, new_hidden_words, active_subscription, subscription_expiration},
                            user_stage_game_progress{stage_game{language_ref, last_season, last_season_number, last_stage, last_stage_number}},
                            command_to_remove_user_packages_in_client
                        }
                    }
                    `,
                    variables : {
                        "phone" : phone,
                        "code" : otp,
                        "number_coins" : numberCoins,
                        "total_hidden_words" : totalHiddenWords,
                        "new_hidden_words" : newHiddenWords,
                        "firebase_token" : "",
                        "app_version" : app_version,
                        "app_build_number" : Number(app_build_number),
                        "os" : os,
                        "os_version" : os_version,
                        "device_brand" : device_brand,
                        "device_name" : device_name,
                        "device_model" : device_model,
                        "unique_id" : unique_id,
                        "target_store" : TARGET_STORE,
                        "build_type" : BUILD_TYPE
                    }
                }
            }).then(async(response)=>{
                setLoading(false)
                const data = response?.data?.data?.verifyUserLoginWithOTPAndMergeGuestAndRegistered
                if(data?.status == 200) {
                    const name = data?.user?.name ?? null
                    const numberCoins = data?.user?.number_coins
                    const activeSubscription = data?.user?.active_subscription;
                    if(activeSubscription == true){
                        const subscriptionExpiration = data?.user?.subscription_expiration;
                        dispatch(updateSubscriptionStatus({activeSubscription, subscriptionExpiration}))
                    }
                    if(typeof numberCoins === "number"){
                        dispatch(updateNumberCoins({number:numberCoins}))
                    }
                    const totalHiddenWords = data?.user?.total_hidden_words
                    const newHiddenWords = data?.user?.new_hidden_words
                    if(totalHiddenWords > 0 || newHiddenWords > 0){
                        dispatch(updateNumberHiddenWords({newHiddenWords, totalHiddenWords}))
                    }
                    const progressData = data?.user_stage_game_progress?.stage_game
                    if(progressData?.length > 0){
                        updateUserStageGameProgressInLogin(realm, progressData)
                        const currentProgressItem = progressData.find((i)=>i.language_ref == stageGameLanguage)
                        if(currentProgressItem?.language_ref){
                            const currentProgressData = {
                                lastStage: currentProgressItem?.last_stage,
                                lastStageNumber: currentProgressItem?.last_stage_number,
                                lastSeason: currentProgressItem?.last_season,
                                lastSeasonNumber: currentProgressItem?.last_season_number  
                            }
                            await dispatch(updateCurrentLanguageLastStageAndLastSeason(currentProgressData))
                        }
                    }
                    dispatch(convertGuestToRegistered({ phone, name}))
                    showToast({
                        title: "ورود به حساب",
                        message: "ورود به حساب کاربری با موفقیت انجام شد.",
                        type: "success",
                        animationType: "slide",
                        position: "top",
                    });
                    dispatch(updateSyncUserPackage({sync:null}))
                    if(data?.command_to_remove_user_packages_in_client == true){
                        deleteAllUserPackages(realm)
                    }
                    props.navigation.goBack()
                    props.navigation.goBack()
                } else {
                    showToast({
                        title: "خطا در ورود",
                        message: response?.data?.errors[0]?.data[0]?.message??'مشکلی پیش آمد دوباره تلاش کنید.',
                        type: "error",
                        animationType: "slide",
                        position: "top",
                    });
                }
            }).catch(()=>{
                setLoading(false)
                showToast({
                    title: "خطا در ورود",
                    message: 'مشکلی پیش آمد دوباره تلاش کنید.',
                    type: "error",
                    animationType: "slide",
                    position: "top",
                });
            })
        }
    }
    return(
        <View style={{flex:1, backgroundColor:colors.background.a1}}>
            <GeneralHeader
                paddingHorizontal={10}
                height={60}
                back={true}
                title={"تایید شماره موبایل"}
            />
            <View style={styles.container}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={{justifyContent:"center", alignItems:'center', paddingTop:50}}>
                        <Icon name={'tooltip-cellphone'} type={"MaterialCommunityIcons"} style={{color:colors.text.a3, fontSize:100}}/>
                        <Text style={{fontFamily:Font.black, color:colors.text.a1, fontSize:18, textAlign:'center', marginVertical:10}}>{'کد تایید را وارد کنید'}</Text>
                        <Text style={{fontFamily:Font.medium, color:colors.text.a3, fontSize:12, textAlign:'center'}}>{'یک کد 6 رقمی به شماره‌ موبایل شما ارسال شد'}</Text>
                        <Text style={{textDecorationLine:'underline', fontFamily:Font.black, color:colors.text.a3, fontSize:16, textAlign:'center', marginBottom:30}}>{phoneDigitSeperator(phone || '')}</Text>
                        <InputCodeField
                            value={value}
                            setValue={(text)=>{
                                setValue(text)
                                if(text.length == 6){
                                    verifyUserLoginWithOTP(text)
                                }
                            }}
                            cellCount={6}
                            onSubmitEditing={verifyUserLoginWithOTP}
                        />
                    </View>
                </ScrollView>
                <View style={{justifyContent:"center", alignItems:'center', paddingBottom:50}}>
                    <View style={{width:width, flexDirection:'row', height:50, alignItems:'center', justifyContent:'space-between', paddingHorizontal:20}}>
                        <View>
                            {
                                newOtpLoading == true?
                                <DotIndicator color={colors.text.a1} count={3} size={7}/>
                                :
                                newOtp == true?
                                <TouchableOpacity activeOpacity={0.5} onPress={requestNewOtp}>
                                    <Text style={{fontFamily:Font.bold, color:colors.primary.a1, fontSize:14, textAlign:'center'}}>{'درخواست مجدد کد'}</Text>
                                </TouchableOpacity>
                                :
                                <TimerShowOTP
                                    minutes={minutes}
                                    seconds={seconds}
                                    endOfTime={endOfTime}
                                    fontSize={16}
                                    fontFamily={Font.black}
                                />
                            }
                        </View>
                        <TouchableOpacity activeOpacity={0.5} onPress={()=>{props.navigation.goBack()}}>
                            <Text style={{fontFamily:Font.bold, color:colors.primary.a1, fontSize:14, textAlign:'center'}}>{'تغییر شماره موبایل'}</Text>
                        </TouchableOpacity>
                    </View>
                    <ButtonGradient
                        height={65}
                        width={width - 40}
                        text={"ورود"}
                        onPress={verifyUserLoginWithOTP}
                        loading={loading}
                        textSize={18}
                        borderRadius={10}
                    />
                </View>
            </View>
        </View>
    )
}
const styles = StyleSheet.create({
    container: {
        flex:1,
        alignItems:'center',
        justifyContent:'space-between'
    },
});
export default VerifyLoginToAccount
