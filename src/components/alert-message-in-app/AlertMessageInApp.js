import React, { useState, useImperativeHandle, memo, useRef } from 'react';
import { View, Dimensions, Text, ScrollView, StyleSheet, NativeModules, Linking, TouchableOpacity} from 'react-native';
import Modal from "react-native-modal";
import Font from '../../utils/Font';
import Icon from '../../utils/Icon';
import ButtonBorder from '../buttons/ButtonBorder';
import ButtonGradient from '../buttons/ButtonGradient';
import Border from '../Border';
import useAppTheme from '../../hooks/theme/useAppTheme';
import { IS_TABLET_CONDITION } from '../../utils/constants/constants';
import ImageComponent from '../image-components/ImageComponent';
import LocalImageComponent from '../image-components/LocalImageComponent';
import { useDispatch } from 'react-redux';
import Toast from '../custom-toast/Toast';
import { increaseNumberCoins } from '../../redux/slices/coinSlice';
import { updateSubscriptionStatus } from '../../redux/slices/subscriptionSlice';
import axios from 'axios';
import { navigate } from '../../main/navigationService';


const { ImmersiveMode } = NativeModules;
const AlertMessageInApp = React.forwardRef((props, ref)=>{
    const { width, height } = ImmersiveMode.isImmersiveModeActive()? Dimensions.get('screen'): Dimensions.get('window');
    const colors = useAppTheme();
    const localToastRef = useRef(null);
    const maxHeight = height*0.7;
    const [visible, setVisible] = useState(false)
    const [data, setData] = useState([])
    const [dataIndex, setDataIndex] = useState(0)
    const currentData = data?.length > 0? data[dataIndex]:null

    const dispatch = useDispatch();
    const [loading1, setLoading1] = useState(false)
    const [loading2, setLoading2] = useState(false)
    

    

    const open = (dialog)=>{
        setVisible(true)
        const time = setTimeout(()=>{
            setData(dialog??[])
        }, 200)
    }
    const close = () => {
        setVisible(false)
        const time = setTimeout(()=>{
            setData([])
            setDataIndex(0)
        }, 400)
    }
    useImperativeHandle(ref, ()=>({
        open,
        close
    }))



    const next = ()=>{
        if(data?.length > dataIndex + 1){
            setVisible(false)
            setDataIndex(i=>i+1)
            setTimeout(()=>{
                setVisible(true)
            }, 500)
        } else {
            close()
        }
        if(currentData?.type == "public"){
            const tryNumber = 1
            seenPublicMessageInApp(tryNumber)
        } else if(currentData?.type == "private"){
            const tryNumber = 1
            seenPrivateMessageInApp(tryNumber)
        }
    }

    const openLink = ()=>{
        Linking.openURL(currentData?.link)
    }
    const openPackage = ()=>{
        if(currentData?.package._id){
            if(currentData?.type == "public"){
                const tryNumber = 1
                seenPublicMessageInApp(tryNumber)
            } else if(currentData?.type == "private"){
                const tryNumber = 1
                seenPrivateMessageInApp(tryNumber)
            }
            navigate("PackageInformation", {_id:currentData?.package._id})
            close()
        }
    }

    const getFreeCoin = async()=>{
        setLoading1(true)
        let data = {
            query : `
                mutation getFreeCoinByUser($plan : ID!){
                    getFreeCoinByUser(plan : $plan) {
                        status,
                        message,
                        number
                    }
                }
            `,
            variables : {
                "plan" : currentData?.free_coin_plan._id,
            }
        }
        await axios({
            url:'/',
            method:'post',
            data: data,
        }).then(async(response)=>{
            setLoading1(false)
            const data = response.data?.data?.getFreeCoinByUser
            if(data?.status == 200){
                const numberCoin = data?.number?data.number:currentData?.free_coin_plan.number_coin
                dispatch(increaseNumberCoins({number: numberCoin}))
                localToastRef.current.show({
                    title: `دریافت سکه`,
                    message: data?.message??`تعداد ${numberCoin} سکه با موفقیت به حساب کاربری شما اضافه شد.`,
                    type: "success",
                    animationType: "slide",
                    position: "top",
                    duration: 6000
                });
            } else {
                localToastRef.current.show({
                    title: `خطا در دریافت سکه`,
                    message: response?.data?.errors[0]?.data[0]?.message??"مشکلی در افزودن سکه پیش آمد.",
                    type: "error",
                    animationType: "slide",
                    position: "top",
                    duration: 6000
                });
            }
        }).catch((error)=>{
            setLoading1(false)
            localToastRef.current.show({
                title: `خطا در دریافت سکه`,
                message: "مشکلی در افزودن سکه پیش آمد.",
                type: "error",
                animationType: "slide",
                position: "top",
            });
        })
    }
    const getFreeSubscription = async()=>{
        setLoading2(true)
        let data = {
            query : `
                mutation getFreeSubscriptionByUser($plan : ID!){
                    getFreeSubscriptionByUser(plan : $plan) {
                        status,
                        message,
                        number,
                        user_subscription_status{active_subscription, subscription_expiration}
                    }
                }
            `,
            variables : {
                "plan" : currentData?.free_subscription_plan._id,
            }
        }
        await axios({
            url:'/',
            method:'post',
            data: data,
        }).then(async(response)=>{
            setLoading2(false)
            const data = response.data?.data?.getFreeSubscriptionByUser
            if(data?.status == 200){
                const activeSubscription = data?.user_subscription_status?.active_subscription;
                const subscriptionExpiration = data?.user_subscription_status?.subscription_expiration;
                const numberDay = data?.number?data.number:currentData?.free_subscription_plan.duration
                if(activeSubscription == true){
                    dispatch(updateSubscriptionStatus({activeSubscription, subscriptionExpiration}))
                    localToastRef.current.show({
                        title: `دریافت اشتراک`,
                        message: `اشتراک ${numberDay} روزه با موفقیت برای حساب کاربری شما فعال شد.`,
                        type: "success",
                        animationType: "slide",
                        position: "top",
                        duration: 6000
                    });
                }
            } else {
                localToastRef.current.show({
                    title: `خطا در دریافت اشتراک`,
                    message: response?.data?.errors[0]?.data[0]?.message??"مشکلی در فعال سازی اشتراک پیش آمد.",
                    type: "error",
                    animationType: "slide",
                    position: "top",
                    duration: 6000
                });
            }
        }).catch((error)=>{
            setLoading2(false)
            localToastRef.current.show({
                title: `خطا در دریافت اشتراک`,
                message: "مشکلی در فعال سازی اشتراک پیش آمد.",
                type: "error",
                animationType: "slide",
                position: "top",
            });
        })
    }

    const seenPublicMessageInApp = async(tryNumber)=>{
        let data = {
            query : `
                mutation seenPublicMessageInAppByUser($_id : ID!){
                    seenPublicMessageInAppByUser(_id : $_id) {
                        status,
                        message
                    }
                }
              `,
            variables : {
                "_id" : currentData._id,
            }
        }
        await axios({
            url:'/',
            method:'post',
            data: data,
        }).then(async(response)=>{
            if(response.data?.data?.seenPublicMessageInAppByUser?.status == 200){
                null
            } else {
                if(tryNumber < 6){
                    const number = tryNumber + 1
                    seenPublicMessageInApp(number)
                }
            }
        }).catch(()=>{
            if(tryNumber < 6){
                const number = tryNumber + 1
                seenPublicMessageInApp(number)
            }
        })
    }
    const seenPrivateMessageInApp = async(tryNumber)=>{
        let data = {
            query : `
                mutation seenPrivateMessageInAppByUser($_id : ID!){
                    seenPrivateMessageInAppByUser(_id : $_id) {
                        status,
                        message
                    }
                }
              `,
            variables : {
                "_id" : currentData._id,
            }
        }
        await axios({
            url:'/',
            method:'post',
            data: data,
        }).then(async(response)=>{
            if(response.data?.data?.seenPrivateMessageInAppByUser?.status == 200){
                null
            } else {
                if(tryNumber < 6){
                    const number = tryNumber + 1
                    seenPrivateMessageInApp(number)
                }
            }
        }).catch(()=>{
            if(tryNumber < 6){
                const number = tryNumber + 1
                seenPrivateMessageInApp(number)
            }
        })
    }
    if (!visible) return null;
    return(
        <Modal
            swipeDirection={null}
            animationIn="slideInUp"
            animationOut="slideOutDown"
            animationInTiming={500}
            animationOutTiming={500}
            backdropOpacity={0.7}
            isVisible={visible}
            useNativeDriverForBackdrop={true}
            onBackButtonPress={next}
            style={{justifyContent:'flex-end', alignItems:'center', margin: 0}}
            deviceHeight={height}
            statusBarTranslucent={ImmersiveMode.isImmersiveModeActive()?true:false}
            coverScreen={true}
        >
            <Toast ref={localToastRef} defaultPosition="top" />
            <View style={[styles.modalContainer, {backgroundColor:colors.bottom_drawer.background, width:width}]}>
                <View>
                    <View style={{width:width * 0.25, height:4, backgroundColor:colors.border.a1, marginTop:30, marginBottom:5, alignSelf:'center', borderRadius:2}}/>                  
                </View>
                <ScrollView
                    style={{maxHeight:maxHeight}}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={{flexDirection:'column', paddingHorizontal:15, gap:15, paddingTop:15, paddingBottom:30}}>
                        <Text style={{fontFamily:Font.bold, fontSize:17, color:colors.text.a2, lineHeight:32}}>{currentData?.title}</Text>
                        <Text style={{fontFamily:Font.medium, fontSize:14, color:colors.text.a3, lineHeight:27, marginTop:20}}>{currentData?.body}</Text>
                        {
                        (currentData?.free_coin_plan && currentData?.free_coin_plan?.number_coin > 0)&&
                        <View style={{paddingVertical:20, gap:10, backgroundColor:"#00000085", borderRadius:10, paddingHorizontal:10, marginTop:15}}>
                            <View style={{flexDirection:'row', alignItems:'center', gap:8}}>
                            <View style={{width:50, height:50, alignItems:'center', justifyContent:'center', backgroundColor:colors.primary.a2, borderRadius:10, borderWidth:1, borderColor:colors.primary.a3}}>
                                {
                                    currentData?.free_coin_plan?.icon_image?
                                    <ImageComponent
                                        uri={currentData?.free_coin_plan?.icon_image}
                                        width={48}
                                        height={48}
                                        resizeMode="cover"
                                        borderRadius={10}
                                        blank_background={true}
                                    />
                                    :
                                    <LocalImageComponent
                                        path={require('../../assets/image/coin.png')}
                                        width={35}
                                        height={35}
                                        resizeMode={'stretch'}
                                        blank_background={true}
                                    />
                                }
                            </View>
                            <View style={{alignItems:'flex-start'}}>
                                <Text numberOfLines={2} style={{fontFamily:Font.medium, fontSize:12, color:colors.text.a1, lineHeight:20, width: width-110 }}>{currentData?.free_coin_plan.title}</Text>
                                <Text numberOfLines={1} style={{fontFamily:Font.medium, fontSize:10, color:colors.primary.a3, lineHeight:18}}>{`${currentData?.free_coin_plan.number_coin} سکه`}</Text>
                            </View>
                            </View>
                            <ButtonBorder
                                text={`دریافت ${currentData?.free_coin_plan.number_coin} سکه رایگان`}
                                height={55}
                                width={width - 50}
                                loading={loading1}
                                onPress={getFreeCoin}
                                borderRadius={10}
                                textSize={14}
                                textColor={colors.primary.a1}
                                borderColor={colors.primary.a6}
                            />
                        </View>
                        }
                        {
                        (currentData?.free_subscription_plan && currentData?.free_subscription_plan?.duration > 0)&&
                        <View style={{paddingVertical:20, gap:10, backgroundColor:"#00000085", borderRadius:10, paddingHorizontal:10, marginTop:15}}>
                            <View style={{flexDirection:'row', alignItems:'center', gap:8}}>
                            <View style={{width:50, height:50, alignItems:'center', justifyContent:'center', backgroundColor:colors.primary.a2, borderRadius:10, borderWidth:1, borderColor:colors.primary.a3}}>
                                {
                                    currentData?.free_subscription_plan?.icon_image?
                                    <ImageComponent
                                        uri={currentData?.free_subscription_plan?.icon_image}
                                        width={48}
                                        height={48}
                                        resizeMode="cover"
                                        borderRadius={10}
                                        blank_background={true}
                                    />
                                    :
                                    <LocalImageComponent
                                        path={require('../../assets/image/diamond.png')}
                                        width={35}
                                        height={35}
                                        resizeMode={'stretch'}
                                        blank_background={true}
                                    />
                                }
                            </View>
                            <View style={{alignItems:'flex-start'}}>
                                <Text numberOfLines={2} style={{fontFamily:Font.medium, fontSize:12, color:colors.text.a1, lineHeight:20, width: width-110 }}>{currentData?.free_subscription_plan?.title}</Text>
                                <Text numberOfLines={1} style={{fontFamily:Font.medium, fontSize:10, color:colors.primary.a6, lineHeight:18}}>{`${currentData?.free_subscription_plan.duration} روز اشتراک`}</Text>
                            </View>
                            </View>
                            <ButtonBorder
                                text={`دریافت ${currentData?.free_subscription_plan.duration} روز اشتراک رایگان`}
                                height={55}
                                width={width - 50}
                                loading={loading2}
                                onPress={getFreeSubscription}
                                borderRadius={10}
                                textSize={14}
                                textColor={colors.primary.a1}
                                borderColor={colors.primary.a6}
                            />
                        </View>
                        }
                        {
                        currentData?.package&&
                        <TouchableOpacity activeOpacity={0.6} onPress={openPackage} style={{marginTop:20}}>
                            <View style={{flexDirection:'row', alignItems:'center', gap:8}}>
                            <View style={{width:50, height:50, alignItems:'center', justifyContent:'center', backgroundColor:colors.primary.a2, borderRadius:10, borderWidth:1, borderColor:colors.primary.a3}}>
                                {
                                    currentData?.package?.icon_image?
                                    <ImageComponent
                                        uri={currentData?.package?.icon_image}
                                        width={48}
                                        height={48}
                                        resizeMode="cover"
                                        borderRadius={10}
                                        blank_background={true}
                                    />
                                    :
                                    <Icon name={'camera-off'} type={'Feather'} style={{fontSize:30, color:colors.text.a5}}/>
                                }
                            </View>
                            <Text style={{fontFamily:Font.medium, fontSize:14, color:colors.text.a1, lineHeight:30, width: width-135}}>{currentData?.package.title}</Text>
                            </View>
                        </TouchableOpacity>
                        }
                        {
                        (currentData?.link && currentData?.link.length>7)&&
                        <View style={{width:"100%", alignItems:'flex-end', marginTop:20}}>
                            <TouchableOpacity activeOpacity={0.6} onPress={openLink}>
                                <Text style={{fontFamily:Font.medium, color:colors.primary.a6, fontSize:14}}>{currentData?.link}</Text>
                            </TouchableOpacity>
                        </View>
                        }
                    </View>
                </ScrollView>
                <View style={{width:width, backgroundColor:"#33333385", borderTopColor:colors.border.a1, borderTopWidth:1, paddingVertical:15, alignItems:'flex-end', paddingHorizontal:15}}>
                    <ButtonGradient
                        text={"متوجه شدم"}
                        height={55}
                        width={(width/2) - 20}
                        loading={false}
                        onPress={next}
                        borderRadius={10}
                        textSize={16}
                    />
                </View>
            </View>   
        </Modal>
    )
})
const styles = StyleSheet.create({
    modalContainer:{
      borderRadius:5,
      alignSelf:'center',
      verticalAlign:'flex-end',
      borderTopLeftRadius:30,
      borderTopRightRadius:30,
    },
});
export default memo(AlertMessageInApp)