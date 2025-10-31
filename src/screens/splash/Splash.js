import React, { useEffect, useState } from 'react';
import { View, Dimensions, Linking} from 'react-native';
import axios from 'axios';
import Font from '../../utils/Font';
import { useDispatch, useSelector } from 'react-redux';
import useAppTheme from '../../hooks/theme/useAppTheme';
import LocalImageComponent from '../../components/image-components/LocalImageComponent';
import { colors } from '../../hooks/theme/colors';
import LoadingBar from '../../components/screen-loading/LoadingBar';
import DeviceInfo from 'react-native-device-info';
import Globals from '../../utils/Globals';
import { changeSubscriptionPlansVersion, updateSubscriptionStatus } from '../../redux/slices/subscriptionSlice';
import { updateConstantsVersion } from '../../redux/slices/constantsSlice';
import { useRealm } from '../../realm';
import { createCoinPlansList } from '../../realm/repositories/user/coin-plan-repository';
import { changeCoinPlansVersion } from '../../redux/slices/coinSlice';
import { hideSplash } from '../../redux/slices/mainSlice';
import { createSubscriptionPlansList } from '../../realm/repositories/user/subscription-plan-repository';
import AlertBottomDrawerHelper from '../../components/alert-bottom-drawer/AlertBottomDrawerHelper';
import Icon from '../../utils/Icon';

const { width } = Dimensions.get("window");
function Splash(props){
    const dispatch = useDispatch();
    const realm = useRealm();
    const [appIsReady, setAppIsReady] = useState(false)
    const { token, isLoggedIn } = useSelector((state) => state.account);
    const { constants_version } = useSelector((state) => state.constants);
    const { numberCoins, coinPlansVersion } = useSelector((state) => state.coins);
    const { subscriptionPlansVersion } = useSelector((state) => state.subscription);
    
    useEffect(()=>{
        startUpCheck()
    }, [])

    const startUpCheck = ()=>{
        if(isLoggedIn == true && token){
            necessaryCheckAtStart()
        } else {
            setAppIsReady(true)
        }
    }

    const necessaryCheckAtStart = async()=>{
        const app_version = await DeviceInfo.getVersion()
        const app_build_number = await DeviceInfo.getBuildNumber()
        await axios({
            url:'/',
            method:'post',
            data: {
                query : `
                mutation necessaryCheckAtStartGameApplication(
                    $constants_version : Int,
                    $app_version : String,
                    $app_build_number : Int,
                    $install_source : String,
                    $build_type : String,
                    $coin_plans_version : Int,
                    $subscription_plans_version : Int,
                    $number_coins : Int,
                ){
                    necessaryCheckAtStartGameApplication(
                        constants_version : $constants_version,
                        app_version : $app_version,
                        app_build_number : $app_build_number,
                        install_source : $install_source,
                        build_type : $build_type,
                        coin_plans_version : $coin_plans_version,
                        subscription_plans_version : $subscription_plans_version,
                        number_coins : $number_coins,
                    ) {
                        status,
                        message,
                        user_subscription_status{active_subscription, subscription_expiration}
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
                        app_version_update_alert{
                            force_update,
                            update_link,
                            last_version,
                            update_message
                        }
                    }
                }
                `,
                variables : {
                    "constants_version" : constants_version,
                    "app_version" : app_version,
                    "app_build_number" : Number(app_build_number),
                    "install_source" : Globals.install_source,
                    "build_type" : Globals.build_type,
                    "coin_plans_version" : coinPlansVersion,
                    "subscription_plans_version" : subscriptionPlansVersion,
                    "number_coins" : numberCoins,
                }
            }
        }).then(async(response)=>{
            const data = response?.data?.data?.necessaryCheckAtStartGameApplication
            if(data?.status == 200) {
                if(data?.user_subscription_status){
                    const activeSubscription = data.user_subscription_status?.active_subscription;
                    const subscriptionExpiration = data.user_subscription_status?.subscription_expiration;
                    dispatch(updateSubscriptionStatus({activeSubscription, subscriptionExpiration}))
                }
                if(data?.game_constants){
                    const variables = data.game_constants
                    dispatch(updateConstantsVersion(variables))
                }
                if(data?.coin_plans?.length > 0){
                    const dataList = data.coin_plans
                    const newCoinPlans = createCoinPlansList(realm, dataList)
                    if(newCoinPlans == true){
                        const newCoinPlansVersion = data?.coin_plans_new_version
                        if(newCoinPlansVersion > 0){
                            dispatch(changeCoinPlansVersion({version:newCoinPlansVersion}))
                        }
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
                    }
                }
                if(data?.app_version_update_alert){
                    const force = data?.app_version_update_alert?.force_update
                    const link = data?.app_version_update_alert?.update_link
                    const version = data?.app_version_update_alert?.last_version
                    const message = data?.app_version_update_alert?.update_message
                    showUpdateAlert({force, link, version, message})
                } else {
                    setAppIsReady(true)
                }
            } else {
                setAppIsReady(true)
            }
        }).catch(()=>{
            setAppIsReady(true)
        })
    }

    const showUpdateAlert = ({force, link, version, message})=>{
        const btn = [
            {
                onPress : ()=>{
                    Linking.openURL(link)
                },
                text: "دریافت بازی",
                loading: false,
                stayOpen: true,
                type: "bold",
            },
        ]
        if(!force){
            btn.push({
                onPress : ()=>{
                    setAppIsReady(true)
                },
                text: "بعدا یاد آوری کن",
                loading: false,
                type: "border",
            })
        }
        const msg = message.map((item)=>({
            text:item,
            style:{ maxWidth:width-65, fontFamily:Font.medium, fontSize:14, color:colors.text.a2, alignSelf:'flex-start', textAlign:'justify', lineHeight:24},
            Icon:()=>(
                <Icon name={"message-reply-text-outline"} type={"MaterialCommunityIcons"} style={{fontSize:20, color:colors.text.a2}}/>
            )
        }))
        AlertBottomDrawerHelper.showAlert({
            title:"بروز رسانی بازی",
            message: msg,
            buttons:btn,
            options:{
                cancelable: false,
                icon:{
                    Icon:()=>(
                        <Icon name={"logo-android"} type={"Ionicons"} style={{fontSize:80, color:colors.primary.a1}}/>
                    )
                }
            }
        })
    }

    const hideSplashAndStartApp = ()=>{
        dispatch(hideSplash())
    }

    return(
        <View style={{flex:1, backgroundColor:colors.background.a1, alignItems:'center', justifyContent:'space-between'}}>
            <View style={{flex:1, alignItems:'center', justifyContent:'center'}}>
                <LocalImageComponent
                    path={require('../../assets/image/icon.png')}
                    width={100}
                    height={100}
                    resizeMode={'cover'}
                    blank_background={true}
                />
            </View>
            <View style={{paddingBottom:50}}>
                <LoadingBar 
                    barColor={colors.primary.a1}
                    width={width-40}
                    height={10}
                    barWidthStart={0.25}
                    barWidthEnd={0.85}
                    isComplete={appIsReady}
                    onComplete={hideSplashAndStartApp}
                />
            </View>
        </View>
    )
}
export default Splash;