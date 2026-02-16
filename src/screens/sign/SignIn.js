import React, {useState} from 'react';
import {StyleSheet, View, Text, Dimensions, KeyboardAvoidingView, SafeAreaView} from 'react-native';
import Icon from '../../utils/Icon';
import Font from '../../utils/Font';
import { DotIndicator } from 'react-native-indicators';
import axios from 'axios';
import LinearGradient from 'react-native-linear-gradient';
import ButtonGradient from '../../components/buttons/ButtonGradient';
import InputText from '../../components/inputs/InputText';
import useAppTheme from '../../hooks/theme/useAppTheme';
import DeviceInfo from 'react-native-device-info';
import { useSelector, useDispatch } from 'react-redux';
import Globals from '../../utils/Globals';
import { updateConstantsVersion } from '../../redux/slices/constantsSlice';
import { changeCoinPlansVersion, updateNumberCoins } from '../../redux/slices/coinSlice';
import ButtonBorder from '../../components/buttons/ButtonBorder';
import { loginAsGuest } from '../../redux/slices/accountSlice';
import { createCoinPlansList } from '../../realm/repositories/user/coin-plan-repository';
import { createSubscriptionPlansList } from '../../realm/repositories/user/subscription-plan-repository';
import { changeSubscriptionPlansVersion } from '../../redux/slices/subscriptionSlice';
import { useRealm } from '../../realm';
import { preloadImages } from '../../utils/ImagePreloader';

const {width, height} = Dimensions.get('window');
function SignIn(props){
    const colors = useAppTheme()
    const dispatch = useDispatch();
    const realm = useRealm();
    const { constants_version } = useSelector((state) => state.constants);
    const { coinPlansVersion } = useSelector((state) => state.coins);
    const { subscriptionPlansVersion } = useSelector((state) => state.subscription);
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
        const app_build_number = await DeviceInfo.getBuildNumber()
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
                    $app_build_number : Int,
                    $os : String,
                    $os_version : String,
                    $device_brand : String,
                    $device_name : String,
                    $device_model : String,
                    $unique_id : String,
                    $install_source : String,
                    $build_type : String,
                    $coin_plans_version : Int,
                    $subscription_plans_version : Int,
                ){
                    loginAsGuestByUser(
                        constants_version : $constants_version,
                        firebase_token : $firebase_token,
                        app_version : $app_version,
                        app_build_number : $app_build_number,
                        os : $os,
                        os_version : $os_version,
                        device_brand : $device_brand,
                        device_name : $device_name,
                        device_model : $device_model,
                        unique_id : $unique_id,
                        install_source : $install_source,
                        build_type : $build_type,
                        coin_plans_version : $coin_plans_version,
                        subscription_plans_version : $subscription_plans_version,
                    ) {
                        status,
                        message,
                        token,
                        user{name, number_coins},
                        game_constants{
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
                            free_coin_completed_account_info,
                            free_coin_follow_instagram,
                            free_coin_View_ads,
                            free_coin_first_rating_in_store,
                        },
                        coin_plans{
                            _id,
                            product_id,
                            title,
                            description,
                            badge,
                            icon_image,
                            number_coin,
                            price,
                            discount_amount,
                            discount_percent,
                            order,
                            is_visible,
                            is_active,
                        },
                        coin_plans_new_version,
                        subscription_plans{
                            _id,
                            product_id,
                            title,
                            description,
                            badge,
                            icon_image,
                            duration,
                            price,
                            discount_amount,
                            discount_percent,
                            order,
                            is_visible,
                            is_active,
                        },
                        subscription_plans_new_version,
                    }
                }
                `,
                variables : {
                    "constants_version" : constants_version,
                    "firebase_token" : "",
                    "app_version" : app_version,
                    "app_build_number" : Number(app_build_number),
                    "os" : os,
                    "os_version" : os_version,
                    "device_brand" : device_brand,
                    "device_name" : device_name,
                    "device_model" : device_model,
                    "unique_id" : unique_id,
                    "install_source" : Globals.install_source,
                    "build_type" : Globals.build_type,
                    "coin_plans_version" : coinPlansVersion,
                    "subscription_plans_version" : subscriptionPlansVersion,
                }
            }
        }).then(async(response)=>{
            setLoading(false)
            const data = response?.data?.data?.loginAsGuestByUser
            if(data?.status == 200) {
                const token = data?.token
                const name = data?.user?.name ?? null
                if(data?.game_constants){
                    const variables = data.game_constants
                    dispatch(updateConstantsVersion(variables))
                }
                let preloadUrls = [];
                if(data?.coin_plans?.length > 0){
                    const dataList = data?.coin_plans || [];
                    const newCoinPlans = createCoinPlansList(realm, dataList)
                    if(newCoinPlans == true){
                        const newCoinPlansVersion = data?.coin_plans_new_version
                        if(newCoinPlansVersion > 0){
                            dispatch(changeCoinPlansVersion({version:newCoinPlansVersion}))
                        }
                        const coinUrls = dataList.map(plan => `${Globals.uri}${plan.icon_image}`).filter(url => typeof url === 'string' && url.length > 0);
                        preloadUrls.push(...coinUrls);
                    }
                }
                if(data?.subscription_plans?.length > 0){
                    const dataList = data.subscription_plans
                    const newSubscriptionPlans = createSubscriptionPlansList(realm, dataList)
                    if(newSubscriptionPlans == true){
                        const newSubscriptionPlansVersion = data?.subscription_plans_new_version
                        if(newSubscriptionPlansVersion > 0){
                            dispatch(changeSubscriptionPlansVersion({version:newSubscriptionPlansVersion}))
                        }
                        const subscriptionUrls = dataList.map(plan => `${Globals.uri}${plan.icon_image}`).filter(url => typeof url === 'string' && url.length > 0);
                        preloadUrls.push(...subscriptionUrls);
                    }
                }
                await preloadImages(preloadUrls, {
                    batchSize: 8,
                    delayBetweenBatches: 100,
                });
                const numberCoins = data?.user?.number_coins
                if(typeof numberCoins === "number"){
                    dispatch(updateNumberCoins({number:numberCoins}))
                }
                dispatch(loginAsGuest({token, name}))
                axios.defaults.headers.post['token'] = token;
                showToast({
                    title: "ورود به عنوان میهمان",
                    message: "ورود به عنوان میهمان با موفقیت انجام شد.",
                    type: "success",
                    animationType: "slide",
                    position: "top",
                });
            } else {
                showToast({
                    title: "خطا در ورود",
                    message: response?.data?.errors[0]?.data[0]?.message??'مشکلی پیش آمد دوباره تلاش کنید.',
                    type: "error",
                    animationType: "slide",
                    position: "top",
                });
            }
        }).catch((error)=>{
                console.log(error)
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
    return(
        <View style={[styles.container, {backgroundColor:colors.background.a1}]}>
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
