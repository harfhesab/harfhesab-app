import React, {useState} from 'react';
import {StyleSheet, View, Text, Dimensions, KeyboardAvoidingView, SafeAreaView} from 'react-native';
import Icon from '../../utils/Icon';
import Font from '../../utils/Font';
import { DotIndicator } from 'react-native-indicators';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import LinearGradient from 'react-native-linear-gradient';
import ButtonGradient from '../../components/buttons/ButtonGradient';
import InputText from '../../components/inputs/InputText';
import useAppTheme from '../../hooks/theme/useAppTheme';
import DeviceInfo from 'react-native-device-info';
import { useSelector, useDispatch } from 'react-redux';
import Globals from '../../utils/Globals';
import { updateConstantsVersion } from '../../redux/slices/constantsSlice';
import { updateNumberCoins } from '../../redux/slices/coinSlice';
import ButtonBorder from '../../components/buttons/ButtonBorder';
import { loginAsGuest } from '../../redux/slices/accountSlice';

const {width, height} = Dimensions.get('window');
function SignIn(props){
    const colors = useAppTheme()
    const dispatch = useDispatch();
    const { constants_version } = useSelector((state) => state.constants);
    const [loading, setLoading] = useState(false)

    const login =() =>{
        props.navigation.navigate("Login")
    }
    const loginAsGuestOperation = async() => {
        setLoading(true)
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
                mutation loginAsGuestByUser(
                    $constants_version : Int,
                    $firebase_token : String,
                    $app_version : String,
                    $os : String,
                    $os_version : String,
                    $device_brand : String,
                    $device_name : String,
                    $device_model : String,
                    $unique_id : String,
                    $install_source : String,
                    $build_type : String,
                ){
                    loginAsGuestByUser(
                        constants_version : $constants_version,
                        firebase_token : $firebase_token,
                        app_version : $app_version,
                        os : $os,
                        os_version : $os_version,
                        device_brand : $device_brand,
                        device_name : $device_name,
                        device_model : $device_model,
                        unique_id : $unique_id,
                        install_source : $install_source,
                        build_type : $build_type,
                    ) {
                        status,
                        message,
                        token,
                        user{number_coins},
                        application_constants{
                            constants_version,
                            coins_for_get_help_word_to_slot_stage_game,
                            coins_for_get_help_word_to_slot_package_game,
                            coins_for_get_help_letter_connecting_stage_game,
                            coins_for_get_help_letter_connecting_package_game,
                            coins_reward_from_play_video_ads_current_stage,
                            coins_reward_from_play_video_ads_previous_stage,
                            coins_reward_from_stage_completed_stage_game,
                            coins_reward_from_season_completed_stage_game,
                            coins_reward_from_stage_completed_package_game,
                            coins_reward_from_season_completed_package_game,
                        }
                    }
                }
                `,
                variables : {
                    "constants_version" : constants_version,
                    "firebase_token" : "",
                    "app_version" : app_version,
                    "os" : os,
                    "os_version" : os_version,
                    "device_brand" : device_brand,
                    "device_name" : device_name,
                    "device_model" : device_model,
                    "unique_id" : unique_id,
                    "install_source" : Globals.install_source,
                    "build_type" : Globals.build_type
                }
            }
        }).then(async(response)=>{
                console.log(response)
            setLoading(false)
            const data = response?.data?.data?.loginAsGuestByUser
            if(data?.status == 200) {
                const token = data?.token
                const firstName = data?.user?.firstName ?? null
                const lastName = data?.user?.lastName ?? null
                if(data?.application_constants){
                    const variables = data.application_constants
                    dispatch(updateConstantsVersion(variables))
                }
                const numberCoins = data?.user?.number_coins
                if(typeof numberCoins === "number"){
                    dispatch(updateNumberCoins({number:numberCoins}))
                }
                dispatch(loginAsGuest({token}))
                axios.defaults.headers.post['token'] = token;
                Toast.show({
                    type: "success",
                    text1 : "ورود به عنوان میهمان",
                    text2 : "ورود به عنوان میهمان با موفقیت انجام شد."
                })
            } else {
                Toast.show({
                    type: "error",
                    text1 : "خطا در ورود",
                    text2: response?.data?.errors[0]?.data[0]?.message??'مشکلی پیش آمد دوباره تلاش کنید.',
                    visibilityTime: 6000
                })
            }
        }).catch((error)=>{
                console.log(error)
            setLoading(false)
            Toast.show({
                type: "error",
                text1 : "خطا در ورود",
                text2: 'مشکلی پیش آمد دوباره تلاش کنید.',
                visibilityTime: 6000
            })
        })
    }
    return(
        <SafeAreaView>
            <LinearGradient colors={colors.background_gradient} style={{width:width, height:height}}>
                <View style={styles.container}>
                    <View style={styles.container2}>
                        <Text style={{fontFamily:Font.black, fontSize:30, color:colors.text.a1, alignSelf:'center'}}>{"ورود به بازی"}</Text>
                        <View style={{gap:15}}>
                            <View style={{width:width, alignItems:'center'}}>
                                <ButtonGradient
                                    height={65}
                                    width={width - 40}
                                    text={"ورود به حساب یا ثبت نام"}
                                    onPress={login}
                                    loading={false}
                                    textSize={16}
                                    borderRadius={10}
                                />
                            </View>
                            <View style={{width:width, alignItems:'center'}}>
                                <ButtonBorder
                                    text={"ورود به عنوان میهمان"}
                                    height={65}
                                    width={width - 40}
                                    loading={loading}
                                    onPress={loginAsGuestOperation}
                                    borderRadius={10}
                                    textSize={16}
                                />
                            </View>
                        </View>
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
        flex:1,
        alignItems:'center',
        justifyContent:'space-around',
    },
});
export default SignIn
