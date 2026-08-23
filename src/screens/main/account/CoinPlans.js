import React, {useMemo, useState, useEffect, useRef} from 'react';
import {StyleSheet, View, Text, Dimensions, TouchableOpacity, SafeAreaView, FlatList, ImageBackground, NativeModules, Linking} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AlertHelper from '../../../components/alert/AlertHelper';
import { useDispatch } from "react-redux";
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
import CoinPlanItem from '../../../components/card/general/CoinPlanItem';
import { getAllCoinPlansList } from '../../../realm/repositories/user/coin-plan-repository';
import { IS_TABLET_CONDITION, STATUS_BAR_HEIGHT } from '../../../utils/constants/constants';
import Globals from '../../../utils/Globals';
import SimpleBorderText from '../../../components/text-components/SimpleBorderText';
import { CAFE_BAZAAR_RSA_KEY, MYKET_RSA_KEY, TARGET_STORE } from '../../../utils/constants/build-config';
import FullScreenLoadingHelper from '../../../components/full-screen-loading/FullScreenLoadingHelper';
import { showToast } from '../../../components/custom-toast/ToastRef';
import axios from 'axios';
import { increaseNumberCoins } from '../../../redux/slices/coinSlice';

const usePaymentHook = TARGET_STORE == "cafebazaar"?
    require('@cafebazaar/react-native-poolakey').useBazaar
    :TARGET_STORE == "myket"?
    require('iab-myket-reactnative/src/index').useMyket
    :null

const { ImmersiveMode } = NativeModules;
const numColumns = IS_TABLET_CONDITION ? 4 : 2
function CoinPlans(props){
    const { width, height } = ImmersiveMode.isImmersiveModeActive()? Dimensions.get('screen'): Dimensions.get('window');
    const realm = useRealm();
    const isFocused = useIsFocused();
    const colors = useAppTheme()
    const dispatch = useDispatch();
    const data = getAllCoinPlansList(realm)
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
        FullScreenLoadingHelper.showLoading({
            title:"در حال اتصال..."
        })
        let data = {
            query : `
                mutation userRequestsToPurchasePackOfCoins(
                    $target_store : String!,
                    $plan : ID!,
                ){
                    userRequestsToPurchasePackOfCoins(
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
            if(response?.data?.data?.userRequestsToPurchasePackOfCoins?.status == 200){
                const data = response?.data?.data.userRequestsToPurchasePackOfCoins
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
    }

    const purchaseCoinApplyCredit = async({gateway, purchaseToken, orderId, orderIdWrong, purchaseResult})=>{
        FullScreenLoadingHelper.showLoading({
            title:"افزایش سکه..."
        })
        let data = {
            query : `
                mutation purchasePackOfCoinUpdateStatusAndApplyCredit(
                    $gateway : String!,
                    $order_id : ID!,
                    $order_id_wrong : ID,
                    $purchase_token : String!,
                ){
                    purchasePackOfCoinUpdateStatusAndApplyCredit(
                        gateway : $gateway,
                        order_id : $order_id,
                        order_id_wrong : $order_id_wrong,
                        purchase_token : $purchase_token,
                    ) {
                        status,
                        message,
                        gateway,
                        number
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
            if(response?.data?.data?.purchasePackOfCoinUpdateStatusAndApplyCredit?.status == 200){
                const data = response?.data?.data?.purchasePackOfCoinUpdateStatusAndApplyCredit
                const gateway = data?.gateway
                const numberCoin = data?.number
                if(data.gateway == "cafebazaar_gateway"){
                    cafebazaarConsumePurchaseAndAndApplyCredit({purchaseToken, numberCoin})
                } else if(data.gateway == "myket_gateway"){
                    myketConsumePurchaseAndAndApplyCredit({purchaseResult, numberCoin})
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
            purchaseCoinApplyCredit({gateway, purchaseToken, orderId})
        } else {
            const purchaseToken = purchaseResult?.purchaseToken
            const gateway = "cafebazaar_gateway"
            purchaseCoinApplyCredit({gateway, purchaseToken, orderId: developerPayload, orderIdWrong:orderId})
        }
    }
    const cafebazaarConsumePurchaseAndAndApplyCredit = async({purchaseToken, numberCoin})=>{
        try {
            await bazaar.consumePurchase(purchaseToken)
            dispatch(increaseNumberCoins({number: numberCoin}))
            showToast({
                title: "خرید سکه با موفقیت انجام شد",
                message: `تعداد ${numberCoin} سکه با موفقیت به حساب کاربری شما افزوده شد.`,
                type: "success",
                animationType: "slide",
                position: "top",
                duration: 7000
            });
            return true;
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
            purchaseCoinApplyCredit({gateway, purchaseToken, orderId, purchaseResult})
        } else {
            const purchaseToken = purchaseResult?.token
            const gateway = "myket_gateway"
            purchaseCoinApplyCredit({gateway, purchaseToken, orderId: developerPayload, orderIdWrong:orderId, purchaseResult})
        }
    }

    const myketConsumePurchaseAndAndApplyCredit = async({purchaseResult, numberCoin})=>{
        try {
            const consume = await myket.consumePurchase(purchaseResult)
            if(consume?.purchaseState == 0){
                dispatch(increaseNumberCoins({number: numberCoin}))
                showToast({
                    title: "خرید سکه با موفقیت انجام شد",
                    message: `تعداد ${numberCoin} سکه با موفقیت به حساب کاربری شما افزوده شد.`,
                    type: "success",
                    animationType: "slide",
                    position: "top",
                    duration: 7000
                });
                return true;
            }
        } catch (error) {
            return false;
        }
    }

    const renderItem = ({item, index})=>{
        return(
            <CoinPlanItem
                _id={item._id}
                click={()=>clickItem(item)}
                productId={item.product_id}
                title={item.title}
                badge={item.badge}
                image={item.icon_image}
                numberCoin={item.number_coin}
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
    return(
        <View style={{flex:1, backgroundColor:colors.background.a2, paddingTop:ImmersiveMode.isImmersiveModeActive()?STATUS_BAR_HEIGHT:0}}>
            <GeneralHeader
                back={true}
                coin={true}
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
                        text={"خرید سکه"}
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
export default CoinPlans;