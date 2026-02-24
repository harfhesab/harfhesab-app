import React, {useMemo, useState, useEffect, useRef} from 'react';
import {StyleSheet, View, Text, Dimensions, TouchableOpacity, SafeAreaView, FlatList, ImageBackground, NativeModules, Linking} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AlertHelper from '../../../components/alert/AlertHelper';
import { useDispatch, useSelector } from "react-redux";
import { useQuery, useRealm } from '../../../realm';
import useAppTheme from '../../../hooks/theme/useAppTheme';
import Font from '../../../utils/Font';
import TextSkia from '../../../components/text-components/TextSkia';
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
import { CAFE_BAZAAR_RSA_KEY, TARGET_STORE } from '../../../utils/constants/build-config';
import FullScreenLoadingHelper from '../../../components/full-screen-loading/FullScreenLoadingHelper';
import { showToast } from '../../../components/custom-toast/ToastRef';
import axios from 'axios';

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
    const state = useSelector((state) => state.stageGameDownload);
    const dispatch = useDispatch();
    const data = getAllCoinPlansList(realm)
    const bazaar = TARGET_STORE == "cafebazaar"&&usePaymentHook(CAFE_BAZAAR_RSA_KEY);
    const [orderId, setOrderId] = useState(null)



    useEffect(()=>{
        connectStore()
        return () => {
            disconnectStore()
        };
    },[])

    const connectStore = ()=>{
        if(TARGET_STORE == "cafebazaar"){
            bazaar.connect()
        }
    }
    const disconnectStore = ()=>{
        if(TARGET_STORE == "cafebazaar"){
            bazaar.disconnect()
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
                setOrderId(data?._id)
                const productId = data?.product_id
                if(data.gateway == "cafebazaar_gateway"){
                    cafebazaarPaymentGateway(productId)
                } else if(data.gateway == "myket_gateway"){
                    mayketPaymentGateway(productId)
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
    
    const directPaymentGateway = (gatewayUrl)=>{
        Linking.openURL(gatewayUrl)
    }

    const cafebazaarPaymentGateway = async(productId)=>{
        console.log("0000000000")
        const purchaseResult = await bazaar.purchaseProduct("dokalam-coin-test")
        console.log("1111111111", purchaseResult)
        if(purchaseResult && purchaseResult?.purchaseToken && purchaseResult?.purchaseState == 0){
            const token = purchaseResult?.purchaseToken
            await bazaar.consumePurchase(token)
        }
    }

    const mayketPaymentGateway = (productId)=>{
        
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
                paddingHorizontal={10}
                back={true}
                height={60}
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
                        borderWidth={2}
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