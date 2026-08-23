import React, {useMemo, useState, useEffect, useRef} from 'react';
import {StyleSheet, View, Text, Dimensions, TouchableOpacity, SafeAreaView, FlatList, ImageBackground, NativeModules, Linking} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AlertHelper from '../../../components/alert/AlertHelper';
import { useDispatch, useSelector } from "react-redux";
import { useQuery, useRealm } from '../../../realm';
import useAppTheme from '../../../hooks/theme/useAppTheme';
import Font from '../../../utils/Font';
import ScreenLoading from '../../../components/screen-loading/ScreenLoading';
import GeneralHeader from '../../../components/header/GeneralHeader';
import Icon from '../../../utils/Icon';
import { BSON } from 'realm';
import { useIsFocused } from '@react-navigation/native';
import UserPackageItem from '../../../components/card/package-game-card/UserPackageItem';
import { UserPackage } from '../../../realm/schemas/user/UserPackageSchema';
import { Package } from '../../../realm/schemas/package-game/PackageSchema';
import { IS_TABLET_CONDITION, STATUS_BAR_HEIGHT } from '../../../utils/constants/constants';
import SubscriptionPlanItem from '../../../components/card/general/SubscriptionPlanItem';
import { getAllSubscriptionPlansList } from '../../../realm/repositories/user/subscription-plan-repository';
import SimpleBorderText from '../../../components/text-components/SimpleBorderText';
import { CAFE_BAZAAR_RSA_KEY, MYKET_RSA_KEY, TARGET_STORE } from '../../../utils/constants/build-config';
import FullScreenLoadingHelper from '../../../components/full-screen-loading/FullScreenLoadingHelper';
import { showToast } from '../../../components/custom-toast/ToastRef';
import axios from 'axios';
import { updateSubscriptionStatus } from '../../../redux/slices/subscriptionSlice';
import { toGregorian, toJalaali} from 'jalaali-js';
import TimerUIThread from '../../../components/timer/TimerUIThread';

const usePaymentHook = TARGET_STORE == "cafebazaar"?
    require('@cafebazaar/react-native-poolakey').useBazaar
    :TARGET_STORE == "myket"?
    require('iab-myket-reactnative/src/index').useMyket
    :null

const { ImmersiveMode } = NativeModules;
const numColumns = IS_TABLET_CONDITION ? 4 : 2
function SubscriptionPlans(props){
    const { width, height } = ImmersiveMode.isImmersiveModeActive()? Dimensions.get('screen'): Dimensions.get('window');
    const { subscriptionExpiration, activeSubscription} = useSelector((state) => state.subscription);
    const { loginType } = useSelector((state) => state.account);
    const realm = useRealm();
    const isFocused = useIsFocused();
    const colors = useAppTheme()
    const dispatch = useDispatch();
    const data = getAllSubscriptionPlansList(realm)
    const bazaar = TARGET_STORE == "cafebazaar"&&usePaymentHook(CAFE_BAZAAR_RSA_KEY);
    const myket = TARGET_STORE == "myket"&&usePaymentHook(MYKET_RSA_KEY)



    useEffect(()=>{
        connectStore()
        return () => {
            disconnectStore()
        };
    },[])

    const connectStore = ()=>{
        if(TARGET_STORE == "cafebazaar"){
            bazaar.connect()
        } else if(TARGET_STORE == "myket"){
            myket.connect()
        }
    }
    const disconnectStore = ()=>{
        if(TARGET_STORE == "cafebazaar"){
            bazaar.disconnect()
        } else if(TARGET_STORE == "myket"){
            myket.disconnect()
        }
    }
    

    const clickItem = async(item)=>{
        if(loginType == "registered") {
            FullScreenLoadingHelper.showLoading({
                title:"در حال اتصال..."
            })
            let data = {
                query : `
                    mutation userRequestsToPurchaseSubscription(
                        $target_store : String!,
                        $plan : ID!,
                    ){
                        userRequestsToPurchaseSubscription(
                            target_store : $target_store,
                            plan : $plan,
                        ) {
                            _id,
                            product_id,
                            status,
                            message,
                            gateway,
                            url
                        }
                    }
                `,
                variables : {
                    "target_store" : TARGET_STORE,
                    "plan" : item._id
                }
            }
            await axios({
                url:'/',
                method:'post',
                data: data,
            }).then(async(response)=>{
                FullScreenLoadingHelper.hideLoading()
                if(response?.data?.data?.userRequestsToPurchaseSubscription?.status == 200){
                    const data = response?.data?.data.userRequestsToPurchaseSubscription
                    const productId = data?.product_id
                    const orderId = data?._id
                    if(data.gateway == "cafebazaar_gateway"){
                        cafebazaarPaymentGateway({productId, orderId})
                    } else if(data.gateway == "myket_gateway"){
                        myketPaymentGateway({productId, orderId})
                    } else if(data.gateway == "direct_gateway"){
                        const gatewayUrl = data?.url
                        directPaymentGateway(gatewayUrl)
                    }
                } else {
                    showToast({
                        title: "مشکلی پیش آمد",
                        message: response?.data?.errors[0]?.data[0]?.message??"اتصال به درگاه پرداخت میسر نبود. دوباره تلاش کنید." ,
                        type: "error",
                        animationType: "slide",
                        position: "top",
                    });
                }
            }).catch((error)=>{
                FullScreenLoadingHelper.hideLoading()
                showToast({
                    title: "مشکلی پیش آمد",
                    message: "اتصال به درگاه پرداخت میسر نبود. دوباره تلاش کنید." ,
                    type: "error",
                    animationType: "slide",
                    position: "top",
                });
            })
        } else {
            showToast({
                title:"ورود به حساب کاربری",
                message: "برای خرید اشتراک ابتدا وارد حساب کاربری خود شوید.",
                type: 'info',
                animationType: 'slide',
                position: 'top'
            });
            props.navigation.navigate('LoginToAccount')
        }
    }

    const purchaseSubscriptionApplyCredit = async({gateway, purchaseToken, orderId, orderIdWrong, purchaseResult})=>{
        FullScreenLoadingHelper.showLoading({
            title:"فعال سازی اشتراک..."
        })
        let data = {
            query : `
                mutation purchaseSubscriptionUpdateStatusAndApplyCredit(
                    $gateway : String!,
                    $order_id : ID!,
                    $order_id_wrong : ID,
                    $purchase_token : String!,
                ){
                    purchaseSubscriptionUpdateStatusAndApplyCredit(
                        gateway : $gateway,
                        order_id : $order_id,
                        order_id_wrong : $order_id_wrong,
                        purchase_token : $purchase_token,
                    ) {
                        status,
                        message,
                        gateway,
                        number,
                        user_subscription_status{active_subscription, subscription_expiration}
                    }
                }
              `,
            variables : {
                "gateway" : gateway,
                "order_id" : orderId,
                "order_id_wrong" : orderIdWrong,
                "purchase_token" : purchaseToken
            }
        }
        await axios({
            url:'/',
            method:'post',
            data: data,
        }).then(async(response)=>{
            FullScreenLoadingHelper.hideLoading()
            if(response?.data?.data?.purchaseSubscriptionUpdateStatusAndApplyCredit?.status == 200){
                const data = response?.data?.data?.purchaseSubscriptionUpdateStatusAndApplyCredit
                const gateway = data?.gateway
                const numberDay = data?.number 
                const userSubscriptionStatus = data?.user_subscription_status
                if(data.gateway == "cafebazaar_gateway"){
                    cafebazaarConsumePurchaseAndAndApplyCredit({purchaseToken, numberDay, userSubscriptionStatus})
                } else if(data.gateway == "myket_gateway"){
                    myketConsumePurchaseAndAndApplyCredit({purchaseResult, numberDay, userSubscriptionStatus})
                }
            } else {
                showToast({
                    title: "مشکلی پیش آمد",
                    message: response?.data?.errors[0]?.data[0]?.message??"مشکلی پیش آمد. دوباره تلاش کنید.",
                    type: "error",
                    animationType: "slide",
                    position: "top",
                });
            }
        }).catch((error)=>{
            FullScreenLoadingHelper.hideLoading()
            showToast({
                title: "مشکلی پیش آمد",
                message: "مشکلی پیش آمد. دوباره تلاش کنید.",
                type: "error",
                animationType: "slide",
                position: "top",
            });
        })
    }
    
    const directPaymentGateway = (gatewayUrl)=>{
        Linking.openURL(gatewayUrl)
    }

    const cafebazaarPaymentGateway = async({productId, orderId})=>{
        const purchaseResult = await bazaar.purchaseProduct(productId, orderId)
        const developerPayload = purchaseResult?.developerPayload
        if(purchaseResult && purchaseResult?.purchaseToken && purchaseResult?.purchaseState == 0 && developerPayload == orderId){
            const purchaseToken = purchaseResult?.purchaseToken
            const gateway = "cafebazaar_gateway"
            purchaseSubscriptionApplyCredit({gateway, purchaseToken, orderId})
        } else {
            const purchaseToken = purchaseResult?.purchaseToken
            const gateway = "cafebazaar_gateway"
            purchaseSubscriptionApplyCredit({gateway, purchaseToken, orderId: developerPayload, orderIdWrong:orderId})
        }
    }
    const cafebazaarConsumePurchaseAndAndApplyCredit = async({purchaseToken, numberDay, userSubscriptionStatus})=>{
        try {
            await bazaar.consumePurchase(purchaseToken)
            const activeSubscription = userSubscriptionStatus?.active_subscription;
            const subscriptionExpiration = userSubscriptionStatus?.subscription_expiration;
            if(activeSubscription == true){
                dispatch(updateSubscriptionStatus({activeSubscription, subscriptionExpiration}))
                showToast({
                    title: "خرید اشتراک با موفقیت انجام شد",
                    message: `اشتراک ${numberDay} روزه با موفقیت برای حساب کاربری شما فعال شد.`,
                    type: "success",
                    animationType: "slide",
                    position: "top",
                    duration: 8000
                });
                return true;
            }
        } catch (error) {
            return false;
        }
    }

    const myketPaymentGateway = async({productId, orderId})=>{
        const purchaseResult = await myket.purchaseProduct(productId, orderId)
        const developerPayload = purchaseResult?.developerPayload
        if(purchaseResult && purchaseResult?.token && purchaseResult?.purchaseState == 0 && developerPayload == orderId){
            const purchaseToken = purchaseResult?.token
            const gateway = "myket_gateway"
            purchaseSubscriptionApplyCredit({gateway, purchaseToken, orderId, purchaseResult})
        } else {
            const purchaseToken = purchaseResult?.token
            const gateway = "myket_gateway"
            purchaseSubscriptionApplyCredit({gateway, purchaseToken, orderId: developerPayload, orderIdWrong:orderId, purchaseResult})
        }
    }

    const myketConsumePurchaseAndAndApplyCredit = async({purchaseResult, numberDay, userSubscriptionStatus})=>{
        try {
            const consume = await myket.consumePurchase(purchaseResult)
            if(consume?.purchaseState == 0){
                const activeSubscription = userSubscriptionStatus?.active_subscription;
                const subscriptionExpiration = userSubscriptionStatus?.subscription_expiration;
                if(activeSubscription == true){
                    dispatch(updateSubscriptionStatus({activeSubscription, subscriptionExpiration}))
                    showToast({
                        title: "خرید اشتراک با موفقیت انجام شد",
                        message: `اشتراک ${numberDay} روزه با موفقیت برای حساب کاربری شما فعال شد.`,
                        type: "success",
                        animationType: "slide",
                        position: "top",
                        duration: 8000
                    });
                    return true;
                }
            }
        } catch (error) {
            return false;
        }
    }

    const renderItem = ({item, index})=>{
        return(
            <SubscriptionPlanItem
                _id={item._id}
                click={()=>clickItem(item)}
                productId={item.product_id}
                title={item.title}
                badge={item.badge}
                image={item.icon_image}
                duration={item.duration}
                price={item.price}
                active={item.active}
            />
        )
    }
    const memoizedValue = useMemo(() => renderItem, [data]);
    const keyExtractor = (item,index)=>index.toString()
    
    const ListEmptyComponent = ()=>(
        <View style={{flex:1, alignItems:'center', justifyContent:'center'}}>
            <ScreenLoading
                loading={false}
                getError={false}
                noItem={true}
                tryAgain={()=>{}}
            />
        </View>
    )
    const ListHeaderComponent = ()=>{
        if(activeSubscription == true){
            const date = new Date(subscriptionExpiration);
            const { jy, jm, jd } = toJalaali(
                date.getFullYear(),
                date.getMonth() + 1,
                date.getDate()
            );
            const shamsiDate = `${jy}/${jm.toString().padStart(2, '0')}/${jd.toString().padStart(2, '0')}`;
            const hours = new Date(subscriptionExpiration).getHours().toString().padStart(2, '0')
            const minutes = new Date(subscriptionExpiration).getMinutes().toString().padStart(2, '0')
            const clock = `${hours}:${minutes}`
            //=================================
            const now = new Date().getTime()
            const until = new Date(subscriptionExpiration).getTime()
            const val1 = until - now
            const b1 = Math.trunc(val1 / 86400000)
            const day = Math.max(0, b1)
            const val2 = val1 - (day * 86400000)
            const b2 = Math.trunc(val2 / 3600000)
            const hour = Math.max(0, b2)
            const val3 = val2 - (hour * 3600000)
            const b3 = Math.trunc(val3 / 60000)
            const minute = Math.max(0, b3)
            const val4 = val3 - (minute * 60000)
            const b4 = Math.trunc(val4 / 1000)
            const second = Math.max(0, b4)
            return(
                <View style={{width:"100%", alignItems:'center', direction:'rtl'}}>
                    <View style={{width:width - 60, backgroundColor:`#00000090`, paddingVertical:20, borderRadius:20, gap:20, alignItems:'center'}}>
                        <View>
                            <Text style={{fontFamily:Font.bakh_regular, fontSize:13, lineHeight:27, color:colors.text.a1, width:width*0.75, textAlign:'justify'}}>
                                {`با داشتن اشتراک فعال روی حساب کاربری‌تان، می‌توانید بیشتر بسته‌های داستانی بازی را به صورت رایگان دریافت کرده و به تمام آیتم‌های بازی‌های آنلاین دسترسی داشته باشید.`}
                            </Text>
                            <Text style={{fontFamily:Font.bakh_regular, fontSize:13, lineHeight:27, color:colors.text.a1, width:width*0.75, textAlign:'justify'}}>{"برای این حساب کاربری، تا تاریخ "}<Text style={{color:colors.primary.a1}}>{shamsiDate}</Text>{" تا ساعت "}<Text style={{color:colors.primary.a1}}>{clock}</Text>{" اشتراک فعال می‌باشد."}</Text>
                        </View>
                        <ImageBackground
                            source={require("../../../assets/image/frame_stage_info.png")}
                            style={{ width: width*0.75, height: width*0.29, alignItems:'center', justifyContent:'center'}}
                            imageStyle={{ resizeMode: "stretch" }}
                            resizeMode="stretch"
                        >
                            <View style={{width:"100%", alignItems:'center', justifyContent:'center'}}>
                                <TimerUIThread
                                    style={{fontSize: 25, fontFamily: Font.black, color: colors.primary.a3}}
                                    titleStyle={{fontFamily: Font.bakh_semi_bold, color: `${colors.primary.a3}99`}}
                                    seconds={second}
                                    minutes={minute}
                                    hours={hour}
                                    days={day}
                                />
                            </View>
                        </ImageBackground>
                    </View>
                </View>
            )
        } else {
            return(
                <View style={{width:"100%", alignItems:'center', direction:'rtl'}}>
                    <View style={{width:width - 60, backgroundColor:`#00000080`, paddingVertical:20, borderRadius:20, gap:20, alignItems:'center'}}>
                        <Text style={{fontFamily:Font.bakh_regular, fontSize:13, lineHeight:27, color:colors.text.a1, width:width*0.75, textAlign:'justify'}}>
                                {`با داشتن اشتراک فعال روی حساب کاربری‌تان، می‌توانید بیشتر بسته‌های داستانی بازی را به صورت رایگان دریافت کرده و به تمام آیتم‌های بازی‌های آنلاین دسترسی داشته باشید.`}
                        </Text>
                    </View>
                </View>
            )
        }
    }
    return(
        <View style={{flex:1, backgroundColor:colors.background.a2, paddingTop:ImmersiveMode.isImmersiveModeActive()?STATUS_BAR_HEIGHT:0}}>
            <GeneralHeader
                back={true}
                subscriptionInfo={true}
            />
            <View style={[styles.container, {backgroundColor:colors.background.a1}]}>
                <ImageBackground
                    source={require("../../../assets/image/frame_list.png")}
                    style={{ width: width - 20, height:ImmersiveMode.isImmersiveModeActive()?height-(115 + STATUS_BAR_HEIGHT):height-115, paddingTop:"3.2%", paddingBottom:"4.1%"}}
                    imageStyle={{ resizeMode: "stretch" }}
                    resizeMode="stretch"
                >
                    <View style={{width:"100%", height:"100%", borderRadius:69, overflow:'hidden'}}>
                        <FlatList
                            showsVerticalScrollIndicator={false}
                            keyExtractor={keyExtractor}
                            ListHeaderComponent={ListHeaderComponent}
                            renderItem={memoizedValue}
                            numColumns={numColumns}
                            data={data}
                            onEndReachedThreshold={0.5}
                            removeClippedSubviews={Platform.OS == 'ios' ? false : true}
                            columnWrapperStyle={{justifyContent:'space-between', gap:15}}
                            style={{width:"100%", paddingHorizontal:20}}
                            contentContainerStyle={{direction:'ltr', rowGap:15, paddingTop:35, paddingBottom:50, justifyContent:'space-between'}}
                        />
                    </View>
                </ImageBackground>
                <View style={{alignSelf:'center', position:'absolute', top:10}}>
                    <ImageBackground
                        source={require("../../../assets/image/header_title_frame.png")}
                        style={{ width: width - 100, height: 60, alignItems:'center', justifyContent:'center', paddingBottom:15}}
                        imageStyle={{ resizeMode: "stretch" }}
                        resizeMode="stretch"
                    >
                        <SimpleBorderText
                            text={"خرید اشتراک"}
                            width={width - 100}
                            height={20*1.6}
                            fontSize={20}
                            textColor={colors.primary.a5}
                            borderColor={"#4d2719"}
                        />
                    </ImageBackground>
                </View>
            </View>
        </View>
    )
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent:'flex-end',
      paddingBottom:10
    }
});
export default SubscriptionPlans;