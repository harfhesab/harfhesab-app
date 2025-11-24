import React, {useState, useEffect} from 'react';
import {StyleSheet, View, Text, Dimensions, TouchableOpacity, ScrollView, TouchableNativeFeedback, StatusBar} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import useAppTheme from '../../../hooks/theme/useAppTheme';
import GeneralHeader from '../../../components/header/GeneralHeader';
import ImageComponent from '../../../components/image-components/ImageComponent';
import { IS_TABLET_CONDITION } from '../../../utils/constants/constants';
import ScreenLoading from '../../../components/screen-loading/ScreenLoading';
import axios from 'axios';
import Font from '../../../utils/Font';
import { checkExistUserPackageWithPakcageId } from '../../../realm/repositories/user/user-package-game-progress.repository';
import { useRealm } from '../../../realm';
import ButtonGradient from '../../../components/buttons/ButtonGradient';
import ButtonBorder from '../../../components/buttons/ButtonBorder';
import RatingInfo from '../../../components/rating/RatingInfo';
import BottomDrawerGrid from '../../../components/bottom-drawer-grid/BottomDrawerGrid';
import BottomDrawerGridHelper from '../../../components/bottom-drawer-grid/BottomDrawerGridHelper';
import { useDispatch, useSelector } from 'react-redux';
import AlertHelper from '../../../components/alert/AlertHelper';
import { recreateAndDownloadContentUserPackage, redownloadContentUserPackage, startSetPackageGameForUserAndGetIt } from '../../../utils/background-task/PackageGameContentTask';
import { startProgressLoading } from '../../../redux/slices/packageGameDownloadSlice';
import { updateNumberCoins } from '../../../redux/slices/coinSlice';
import Icon from '../../../utils/Icon';
import Rating from '../../../components/rating/Rating';
import { showToast } from '../../../components/custom-toast/ToastRef';
import CommentRating from '../../../components/rating/CommentRating';
import Border from '../../../components/Border';

const {width, height} = Dimensions.get("window")
const gridSize = IS_TABLET_CONDITION?(width-75)/4:(width-45)/2
const SEASON_ITEM_WIDTH = IS_TABLET_CONDITION? (width-60)/3 : (width - 45)/2
function PackageInformation(props){
    const realm = useRealm();
    const colors = useAppTheme()
    const dispatch = useDispatch();
    const [data, setData] = useState(null)
    const [localData, setLocalData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [getError, setGetError] = useState(false)
    const [checkUpdate, setCheckUpdate] = useState(null)
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null)
    const packageParamId = props?.route?.params?._id
    const { numberCoins } = useSelector((state) => state.coins);
    const { packageId, userPackageId, status, progressLoading } = useSelector((state) => state.packageGameDownload);

    useEffect(()=>{
        getData()
    }, [])
    const getData = async()=>{
        const checkExist = await checkExistUserPackageWithPakcageId(realm, packageParamId)
        setLocalData(checkExist)
        await axios({
            url:'/',
            method:'post',
            data: {
                query : `
                    query getPackageInformationAndUserPackageStatus(
                        $_id : ID!,
                        $user_package : ID,
                        $user_package_completed : Boolean
                    ){
                        getPackageInformationAndUserPackageStatus(
                            _id : $_id,
                            user_package : $user_package,
                            user_package_completed : $user_package_completed
                        ) {
                            package{
                                _id,
                                title,
                                description,
                                subject,
                                badge,
                                language_ref,
                                language_info{name},
                                icon_image,
                                banner_image,
                                free,
                                free_with_subscription,
                                price,
                                testable,
                                number_stage,
                                number_season,
                                doc_version_created,
                                doc_version_updated,
                                doc_version_deleted,
                                version_created,
                                version_updated,
                                version_deleted,
                                force_version_created,
                                force_version_updated,
                                force_version_deleted,
                                rating_number,
                                rating_average,
                                rating_info,
                                rating_some{
                                    _id,
                                    user{name},
                                    grade,
                                    comment,
                                    like,
                                    dis_like,
                                    me_set_like,
                                    me_set_dis_like,
                                    createdAt,
                                },
                                me_previous_rating{
                                    _id,
                                    grade,
                                    comment,
                                },
                                rating_reward,
                                seasons{title, first_media{path}},
                            },
                            user_package_status{
                                status,
                                button_text,
                                user_package_id,
                                access_type,
                                number_coin_paid,
                                activation_date,
                                last_season,
                                last_season_number,
                                last_stage,
                                last_stage_number,
                            }
                        }
                    }
                `,
                variables : {
                    "_id" : packageParamId,
                    "user_package" : checkExist?.user_package?._id??null,
                    "user_package_completed" : checkExist?.user_package?.content_completed??false
                }
            }
        }).then(async(response)=>{
            const data = response.data.data?.getPackageInformationAndUserPackageStatus
            if(data){
                setData(data)
                setLoading(false)
            }
            if(checkExist?.user_package?._id){
                if(checkExist.user_package?.version_created < data?.package?.force_version_created || checkExist.user_package?.version_updated < data?.package?.force_version_updated || checkExist.user_package?.version_deleted < data?.package?.force_version_deleted){
                    setCheckUpdate("force-update")
                } else if(checkExist.user_package?.version_created < data?.package?.version_created || checkExist.user_package?.version_updated < data?.package?.version_updated || checkExist.user_package?.version_deleted < data?.package?.version_deleted){
                    setCheckUpdate("need-update")
                }
            }
        }).catch((e)=>{
            setGetError(true)
        })
    }
    const tryAgain = ()=>{
        setLoading(true)
        setGetError(false)
        getData()
    }
    const onClickGetPackage = ()=>{
        if(data?.user_package_status.status == "get-free"){
            const accessType = "free"
            const numberCoinPaid = undefined
            getForFirst(accessType, numberCoinPaid)
        } else if(data?.user_package_status.status == "get-subscription"){
            getPackageWithSubscription()
        } else if(data?.user_package_status.status == "get-coin-payment"){
            getPackageWithCoinPayment()
        } else if(data?.user_package_status.status == "subscription-renewal-or-coin-payment"){
            subscriptionRenewalOrCoinPayment()
        } else if(data?.user_package_status.status == "redownload-content"){
            const accessType = data.user_package_status.access_type
            const numberCoinPaid = data.user_package_status.number_coin_paid
            const activationDate = data.user_package_status.activation_date
            redownloadContent(accessType, numberCoinPaid, activationDate)
        } else if(data?.user_package_status.status == "recreate-and-download-content"){
            const accessType = data.user_package_status.access_type
            const numberCoinPaid = data.user_package_status.number_coin_paid
            const activationDate = data.user_package_status.activation_date
            recreateAndDownloadContent(accessType, numberCoinPaid, activationDate)
        } else if(data?.user_package_status.status == "start-game"){
            props.navigation.navigate("StartPackageGame", {_id:localData?.user_package._id.toHexString(), packageId:localData?.package._id.toHexString() })
        }
    }
    const subscriptionRenewalOrCoinPayment = ()=>{
        const previousSelected = {
            _id:["1"],
            text1:[`پرداخت ${data?.package?.price} سکه`]
        }
        BottomDrawerGridHelper.showBottomDrawer({
            title:data?.user_package_status?.button_text,
            list:[
                {
                    _id: "1",
                    text1: `پرداخت ${data?.package?.price} سکه`,
                    text2: `دسترسی دائمی به بستهٔ بازی بعد از تمدید`,
                    image: require('../../../assets/image/coin.png'),
                    localImage: true,
                    height:gridSize + 80,
                    width:gridSize,
                    blank_background: true,
                },
                {
                    _id: "2",
                    text1: "دریافت رایگان با داشتن اشتراک",
                    text2: `دریافت رایگان بسته‌های بازی با داشتن اشتراک فعال`,
                    image: require('../../../assets/image/diamond.png'),
                    localImage: true,
                    disabled:true,
                    height:gridSize + 80,
                    width:gridSize,
                    blank_background: true,
                    onPress : ()=>{
                        props.navigation.navigate("SubscriptionPlans")
                        BottomDrawerGridHelper.hideBottomDrawer()
                    }
                }
            ],
            buttons:[
                {
                    onPress : ({data})=>{
                        if(data._id[0] == "1"){
                            coinPayment()
                        }
                    },
                    text: "پرداخت سکه",
                    loading: true,
                    type: "bold",
                    selectRequired:true
                },
            ],
            options:{
                numberSelectable: 1,
                previousSelected:previousSelected,
                cancelable: true,
                selectRequired: true,
            }
        })
    }
    const coinPayment = async()=>{
        if(data?.package?.price > numberCoins){
            AlertHelper.showAlert({
                body: "تعداد سکهٔ شما برای پرداخت این بستهٔ بازی کافی نمیباشد.",
                buttons: [
                    {
                        text: "افزایش سکه",
                        onPress: () => {
                            props.navigation.navigate("CoinPlans")
                        },
                        type:'bold'
                    },
                    {
                        text: 'لغو',
                        onPress: () => {},
                        type:'border'
                    },
                ],
                options : {
                    type: 'warning',
                    cancelable: true,
                    bodyAlign:'center',
                    textAlign:'center'
                },
            });
        } else {
            coinPaymentOperation()
        }
    }
    const coinPaymentOperation = async()=>{
        const accessType = "coin-payment"
        const numberCoinPaid = data?.package?.price
        const activationDate = data.user_package_status.activation_date
        await axios({
            url:'/',
            method:'post',
            data: {
                query : `
                    mutation coinPaymentToPreviousUserPackageGame(
                        $package : ID!,
                        $user_package : ID,
                        $user_number_coins : Int,
                    ){
                        coinPaymentToPreviousUserPackageGame(
                            package : $package
                            user_package : $user_package,
                            user_number_coins : $user_number_coins,
                        ) {
                            status,
                            message,
                            number
                        }
                    }
                `,
                variables : {
                    "package" : packageParamId,
                    "user_package" : packageId,
                    "user_number_coins" : numberCoins
                }
            }
        }).then((response)=>{
            const data = response.data?.data?.coinPaymentToPreviousUserPackageGame
            if(data?.status == 200){
                BottomDrawerGridHelper.hideBottomDrawer()
                if(typeof data?.number === "number"){
                    dispatch(updateNumberCoins({number:data.number}))
                }
                if(localData?.user_package?._id && localData?.user_package?.content_completed){
                    setData(prev => ({
                        ...(prev || {}),
                        user_package_status: {
                            ...(prev?.user_package_status || {}),
                            status: "start-game",
                            button_text: "شروع بازی",
                        },
                    }));
                } else {
                    if(localData?.user_package?._id){
                        setData(prev => ({
                            ...(prev || {}),
                            user_package_status: {
                                ...(prev?.user_package_status || {}),
                                status: "redownload-content",
                                button_text: "دانلود مجدد محتوا",
                            },
                        }));
                        redownloadContent(accessType, numberCoinPaid, activationDate)
                    } else {
                        setData(prev => ({
                            ...(prev || {}),
                            user_package_status: {
                                ...(prev?.user_package_status || {}),
                                status: "recreate-and-download-content",
                                button_text: "دانلود مجدد محتوا",
                            },
                        }));
                        recreateAndDownloadContent(accessType, numberCoinPaid, activationDate)
                    }
                }
            } else {
                BottomDrawerGridHelper.hideBottomDrawer()
                showToast({
                    title: "خطا در پرداخت سکه",
                    message: response.data?.data?.message??"مشکلی در پرداخت سکه پیش آمد. دوباره تلاش کنید.",
                    type: "error",
                    animationType: "slide",
                    position: "top",
                });
            }
        }).catch((err)=>{
            BottomDrawerGridHelper.hideBottomDrawer()
            showToast({
                title: "خطا در پرداخت سکه",
                message: "مشکلی در پرداخت سکه پیش آمد. دوباره تلاش کنید.",
                type: "error",
                animationType: "slide",
                position: "top",
            });
        })
    }
    const getPackageWithSubscription = ()=>{
        const packagePrice = data?.package?.price
        const previousSelected = selectedPaymentMethod?{
            _id:[selectedPaymentMethod?._id],
            text1:[selectedPaymentMethod?.text1]
        }:{
            _id:["1"],
            text1:["دریافت رایگان"]
        }
        BottomDrawerGridHelper.showBottomDrawer({
            title:"دریافت بستهٔ بازی",
            list:[
                {
                    _id: "1",
                    text1: "دریافت رایگان بازی",
                    text2: `تا زمان فعال بودن اشتراک، به بستهٔ بازی دسترسی خواهید داشت`,
                    image: require('../../../assets/image/diamond.png'),
                    localImage: true,
                    height:gridSize + 80,
                    width:gridSize,
                    blank_background: true,
                    onPress : ()=>{
                        setSelectedPaymentMethod({_id:"1", text1:"دریافت رایگان"})
                    }
                },
                {
                    _id: "2",
                    text1: `پرداخت ${packagePrice} سکه`,
                    text2: `با یکبار پرداخت سکه، به شکل دائمی به بستهٔ بازی دسترسی خواهید داشت`,
                    image: require('../../../assets/image/coin.png'),
                    localImage: true,
                    height:gridSize + 80,
                    width:gridSize,
                    blank_background: true,
                    onPress : ()=>{
                        setSelectedPaymentMethod({_id:"2", text1:`پرداخت ${packagePrice} سکه`})
                    }
                },
            ],
            buttons:[
                {
                    onPress : ({data})=>{
                        if(data._id[0] == "1"){
                            const accessType = "subscription"
                            const numberCoinPaid = undefined
                            getForFirst(accessType, numberCoinPaid)
                        } else if(data._id[0] == "2"){
                            const accessType = "coin-payment"
                            const numberCoinPaid = packagePrice
                            getForFirst(accessType, numberCoinPaid)
                        }
                    },
                    text: data?.user_package_status?.button_text,
                    loading: false,
                    type: "bold",
                    selectRequired:true
                },
            ],
            options:{
                numberSelectable: 1,
                previousSelected:previousSelected,
                cancelable: true,
                selectRequired: true,
            }
        })
    }
    const getPackageWithCoinPayment = ()=>{
        const packagePrice = data?.package?.price
        const previousSelected = selectedPaymentMethod?{
            _id:[selectedPaymentMethod?._id],
            text1:[selectedPaymentMethod?.text1]
        }:{
            _id:["1"],
            text1:[`پرداخت ${packagePrice} سکه`]
        }
        BottomDrawerGridHelper.showBottomDrawer({
            title:"دریافت بستهٔ بازی",
            list:[
                {
                    _id: "1",
                    text1: `پرداخت ${packagePrice} سکه`,
                    text2: `دسترسی دائمی به بستهٔ بازی بعد از دریافت بازی`,
                    image: require('../../../assets/image/coin.png'),
                    localImage: true,
                    height:gridSize + 80,
                    width:gridSize,
                    blank_background: true,
                    onPress : ()=>{
                        setSelectedPaymentMethod({_id:"1", text1:`پرداخت ${packagePrice} سکه`})
                    }
                },
                {
                    _id: "2",
                    text1: "دریافت رایگان با داشتن اشتراک",
                    text2: `دریافت رایگان بسته‌های بازی با داشتن اشتراک فعال`,
                    image: require('../../../assets/image/diamond.png'),
                    localImage: true,
                    disabled:true,
                    height:gridSize + 80,
                    width:gridSize,
                    blank_background: true,
                    onPress : ()=>{
                        props.navigation.navigate("SubscriptionPlans")
                        BottomDrawerGridHelper.hideBottomDrawer()
                    }
                }
            ],
            buttons:[
                {
                    onPress : ({data})=>{
                        if(data._id[0] == "1"){
                            const accessType = "coin-payment"
                            const numberCoinPaid = packagePrice
                            getForFirst(accessType, numberCoinPaid)
                        }
                    },
                    text: data?.user_package_status?.button_text,
                    loading: false,
                    type: "bold",
                    selectRequired:true
                },
            ],
            options:{
                numberSelectable: 1,
                previousSelected:previousSelected,
                cancelable: true,
                selectRequired: true,
            }
        })
    }
    const getForFirst = async(accessType, numberCoinPaid)=>{
        if(accessType == "coin-payment" && data?.package?.price > numberCoins){
            AlertHelper.showAlert({
                body: "تعداد سکهٔ شما برای فعال سازی این بستهٔ بازی کافی نمیباشد.",
                buttons: [
                    {
                        text: "افزایش سکه",
                        onPress: () => {
                            props.navigation.navigate("CoinPlans")
                        },
                        type:'bold'
                    },
                    {
                        text: 'لغو',
                        onPress: () => {},
                        type:'border'
                    },
                ],
                options : {
                    type: 'warning',
                    cancelable: true,
                    bodyAlign:'center',
                    textAlign:'center'
                },
            });
        } else {
            const color = colors.primary.a1
            const status = data?.user_package_status.status
            const selectedAccessType = accessType
            const packageInfo = {
                _id : data.package._id,
                title : data.package.title,
                description : data.package.description,
                subject : data.package.subject,
                badge : data.package.badge,
                language_ref : data.package.language_ref,
                icon_image : data.package.icon_image,
                banner_image : data.package.banner_image,
                free : data.package.free,
                free_with_subscription : data.package.free_with_subscription,
                price : data.package.price,
                testable : data.package.testable,
                number_stage : data.package.number_stage,
                number_season : data.package.number_season,
                version_created : data.package.doc_version_created,
                version_updated : data.package.doc_version_updated,
                version_deleted : data.package.doc_version_deleted,
            }
            const userPackageInfo = {
                package_ref : packageParamId,
                access_type : selectedAccessType,
                number_coin_paid : numberCoinPaid,
                activation_date : new Date(),
                version_created : data.package.version_created,
                version_updated : data.package.version_updated,
                version_deleted : data.package.version_deleted,
            }
            dispatch(startProgressLoading())
            await startSetPackageGameForUserAndGetIt({ dispatch, realm, packageId:packageParamId, packageInfo, numberCoins, userPackageInfo, status, selectedAccessType, color });
        }
    }
    const recreateAndDownloadContent = async(accessType, numberCoinPaid, activationDate)=>{
        const color = colors.primary.a1
        const packageInfo = {
            _id : data.package._id,
            title : data.package.title,
            description : data.package.description,
            subject : data.package.subject,
            badge : data.package.badge,
            language_ref : data.package.language_ref,
            icon_image : data.package.icon_image,
            banner_image : data.package.banner_image,
            free : data.package.free,
            free_with_subscription : data.package.free_with_subscription,
            price : data.package.price,
            testable : data.package.testable,
            number_stage : data.package.number_stage,
            number_season : data.package.number_season,
            version_created : data.package.doc_version_created,
            version_updated : data.package.doc_version_updated,
            version_deleted : data.package.doc_version_deleted,
        }
        const userPackageInfo = {
            _id : data?.user_package_status?.user_package_id,
            package_ref : packageParamId,
            access_type : accessType,
            number_coin_paid : numberCoinPaid,
            activation_date : activationDate,
            version_created : data.package.version_created,
            version_updated : data.package.version_updated,
            version_deleted : data.package.version_deleted,
            last_season : data?.user_package_status?.last_season,
            last_season_number : data?.user_package_status?.last_season_number,
            last_stage : data?.user_package_status?.last_stage,
            last_stage_number : data?.user_package_status?.last_stage_number,
        }
        await recreateAndDownloadContentUserPackage({ dispatch, realm, packageId:packageParamId, packageInfo, userPackageInfo, color })
    }
    const redownloadContent = async(accessType, numberCoinPaid, activationDate)=>{
        const color = colors.primary.a1
        const packageInfo = {
            _id : data.package._id,
            title : data.package.title,
            description : data.package.description,
            subject : data.package.subject,
            badge : data.package.badge,
            language_ref : data.package.language_ref,
            icon_image : data.package.icon_image,
            banner_image : data.package.banner_image,
            free : data.package.free,
            free_with_subscription : data.package.free_with_subscription,
            price : data.package.price,
            testable : data.package.testable,
            number_stage : data.package.number_stage,
            number_season : data.package.number_season,
            version_created : data.package.doc_version_created,
            version_updated : data.package.doc_version_updated,
            version_deleted : data.package.doc_version_deleted,
        }
        const userPackageInfo = {
            _id : data?.user_package_status?.user_package_id,
            package_ref : packageParamId,
            access_type : accessType,
            number_coin_paid : numberCoinPaid,
            activation_date : activationDate,
            version_created : data.package.version_created,
            version_updated : data.package.version_updated,
            version_deleted : data.package.version_deleted,
            last_season : data?.user_package_status?.last_season,
            last_season_number : data?.user_package_status?.last_season_number,
            last_stage : data?.user_package_status?.last_stage,
            last_stage_number : data?.user_package_status?.last_stage_number,
        }
        await redownloadContentUserPackage({ dispatch, realm, packageId:packageParamId, packageInfo, userPackageInfo, color })
    }
    const viewAllPackageRating = ()=>{
        props.navigation.navigate("ViewAllPackageRating",{
            _id:packageParamId,
            title:data?.package?.title,
            rating_average:data?.package?.rating_average,
            rating_info:data?.package?.rating_info,
            rating_number:data?.package?.rating_number
        })
    }
    
    return(
        <SafeAreaView style={{flex:1}}>
        <View style={{flex:1, backgroundColor:colors.background.a1}}>
            <GeneralHeader
                height={60}
                coin={true}
                back={true}
            />
            <View style={styles.container}>
                {
                    loading?
                    <ScreenLoading
                        loading={loading}
                        getError={getError}
                        noItem={false}
                        tryAgain={tryAgain}
                    />
                    :
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom:50}}>
                        <View style={{width:width, alignItems:'center'}}>
                            <ImageComponent
                                uri={data?.package?.banner_image}
                                width={IS_TABLET_CONDITION?500:width}
                                height={IS_TABLET_CONDITION?300:width * 0.6}
                                resizeMode="cover"
                                borderRadius={0}
                            />
                        </View>
                        <View style={{width:width, flexDirection:'row', alignItems:'center', justifyContent:'flex-start', marginTop:15, gap:10, paddingHorizontal:15}}>
                            <View style={{borderWidth:1, borderColor:colors.border.a1, borderRadius:15, backgroundColor:colors.border.a1}}>
                                <ImageComponent
                                    uri={data?.package?.icon_image}
                                    width={60}
                                    height={60}
                                    resizeMode="cover"
                                    borderRadius={13}
                                />
                            </View>
                            <View style={{flexDirection:'column', alignItems:'flex-start', gap:5}}>
                                <Text style={{fontFamily:Font.medium, fontSize:16, color:colors.text.a1}}>{data?.package?.title}</Text>
                                <Text style={{fontFamily:Font.medium, fontSize:10, color:colors.text.a5}}>{data?.package?.subject}</Text>
                            </View>
                        </View>
                        <View style={{flexDirection:'row', alignItems:'center', paddingHorizontal:15, paddingTop:20, gap:5}}>
                            <InfoBox
                                title="تعداد فصل‌ها"
                                value={`${data?.package?.number_season} فصل`}
                                width={(width - 45)/4}
                            />
                            <InfoBox
                                title="تعداد مراحل"
                                value={`${data?.package?.number_stage} مرحله`}
                                width={(width - 45)/4}
                            />
                            <InfoBox
                                title="زبان"
                                value={data?.package?.language_info?.name}
                                width={(width - 45)/4}
                            />
                            <InfoBox
                                title="قیمت"
                                value={`${data?.package?.price} سکه`}
                                width={(width - 45)/4}
                            />
                        </View>
                        <View style={{width:width, flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:15, paddingTop:20}}>
                            {
                                (checkUpdate !== "force-update")&&
                                <ButtonGradient
                                    text={data?.user_package_status?.button_text}
                                    textSize={14}
                                    onPress={onClickGetPackage}
                                    width={checkUpdate == "need-update" ?width/2 - 20:width - 30}
                                    height={50}
                                    loading={checkUpdate == "need-update"?false:progressLoading}
                                />
                            }
                            {
                                (checkUpdate == "need-update" || checkUpdate =="force-update")&&
                                <ButtonBorder
                                    text={"بروزرسانی محتوا"}
                                    height={50}
                                    width={checkUpdate == "force-update" ?width - 30:width/2 - 20}
                                    loading={progressLoading}
                                    onPress={()=>{}}
                                    textSize={14}
                                />
                            }
                        </View>
                        {
                            data?.package.description?.length>0&&
                            <View style={{width:width, paddingHorizontal:15, marginTop:30}}>
                                <Text style={{fontFamily:Font.medium, color:colors.text.a2, fontSize:16, lineHeight:30}}>{"دربارهٔ بستهٔ بازی"}</Text>
                                <Text style={{fontFamily:Font.medium, color:colors.text.a5, fontSize:14, textAlign:'justify', lineHeight:26}}>{data?.package.description}</Text>
                            </View>
                        }
                        <View style={{width:width, paddingTop:30}}>
                            {
                                (
                                    data?.user_package_status.status == "subscription-renewal-or-coin-payment" ||
                                    data?.user_package_status.status == "redownload-content" ||
                                    data?.user_package_status.status == "recreate-and-download-content" ||
                                    data?.user_package_status.status == "start-game"
                                ) && 
                                <Rating
                                    packageId={packageParamId}
                                    successOperation={getData}
                                    edit={data?.package?.me_previous_rating?true:false}
                                    previous={data?.package?.me_previous_rating?._id}
                                    defaultRating={data?.package?.me_previous_rating?.grade??0}
                                    comment={data?.package?.me_previous_rating?.comment??""}
                                    ratingReward={data?.package?.rating_reward??0}
                                />
                            }
                            <View style={{marginTop:10}}>
                                <TouchableNativeFeedback onPress={viewAllPackageRating} background={TouchableNativeFeedback.Ripple(colors.border.a1,false)}>
                                    <View style={{width:width, height:55, flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:15 }}>
                                        <Text style={{fontFamily:Font.medium, color:colors.text.a1, fontSize:14}}>{"نظرات و امتیازها"}</Text>
                                        <View style={{flexDirection:"row", alignItems:"center", gap:8}}>
                                            <Text style={{fontSize:14, color:colors.primary.a1, fontFamily:Font.medium}}>{"بیشتر"}</Text>
                                            <Icon name={'angle-left'} type={'FontAwesome'} style={{color:colors.primary.a1, fontSize:25}}/>
                                        </View>
                                    </View>
                                </TouchableNativeFeedback>
                                <TouchableNativeFeedback onPress={viewAllPackageRating} background={TouchableNativeFeedback.Ripple(colors.border.a1,false)}>
                                    <View style={{paddingVertical:10}}>
                                        <RatingInfo
                                            rating_average={data?.package?.rating_average}
                                            rating_info={data?.package?.rating_info}
                                            reviews={data?.package?.rating_number}
                                        />
                                    </View>
                                </TouchableNativeFeedback>
                            </View>
                            {
                                data?.package?.rating_some?.length > 0 &&
                                    data?.package?.rating_some.map((item, index)=>(
                                        <View key={index.toString()}>
                                            <CommentRating
                                                _id={item?._id}
                                                name={item?.user?.name}
                                                grade={item?.grade}
                                                date={item?.createdAt}
                                                comment={item?.comment}
                                                likeNumbers={item?.like}
                                                disLikeNumbers={item?.dis_like}
                                                likedIt={item?.me_set_like}
                                                disLikedIt={item?.me_set_dis_like}
                                            />
                                            {
                                                index < data?.package?.rating_some?.length - 1&&
                                                <Border
                                                    height={1}
                                                    horizontal={15}
                                                    top={0}
                                                    bottom={0}
                                                />
                                            }
                                        </View>
                                ))
                            }
                            <View style={{width:width, alignItems:'center'}}> 
                                {
                                    data?.package?.rating_some?.length > 0&&
                                    <ButtonBorder
                                        text={"همهٔ نظرات"}
                                        height={50}
                                        width={width-30}
                                        loading={false}
                                        onPress={viewAllPackageRating}
                                        textSize={14}
                                        textColor={colors.text.a2}
                                        borderColor={colors.border.a1}
                                    />
                                }
                            </View>
                        </View>
                        {
                            data?.package?.seasons?.length > 0&&
                            <View style={{width:width, marginTop:30, paddingHorizontal:15}}>
                                <Text style={{fontFamily:Font.medium, color:colors.text.a1, fontSize:16, lineHeight:50}}>{"فصل‌های بستهٔ بازی"}</Text>
                                <View style={{width:width, flexDirection:'row', flexWrap:'wrap', rowGap:30, columnGap:15, justifyContent:'flex-start'}}>
                                    {
                                        data?.package?.seasons.map((item, index)=>(
                                            <View key={index.toString()}>
                                                <ImageComponent
                                                    uri={item?.first_media?.path}
                                                    width={SEASON_ITEM_WIDTH}
                                                    height={SEASON_ITEM_WIDTH * 0.6}
                                                    resizeMode="cover"
                                                    borderRadius={10}
                                                />
                                                <Text style={{fontFamily:Font.medium, fontSize:12, color:colors.text.a3, lineHeight:20}}>{item.title}</Text>
                                            </View>
                                        ))
                                    }
                                </View>
                            </View>
                        }
                    </ScrollView>
                }
            </View>
            <BottomDrawerGrid ref = {Ref => {BottomDrawerGridHelper.setRef(Ref)}}/>
        </View>
        </SafeAreaView>
    )
}
const InfoBox = ({title, value, width})=>{
    const colors = useAppTheme()
    return(
        <View style={{flexDirection:'column', alignItems:'center', justifyContent:'center', gap:5, width:width, paddingVertical:10, backgroundColor:`${colors.background.a2}90`, borderRadius:10, borderColor:colors.border.a2, borderWidth:0.5}}>
            <Text style={{fontFamily:Font.medium, fontSize:12, color:colors.text.a2}}>{value}</Text>
            <Text style={{fontFamily:Font.medium, fontSize:8, color:colors.text.a6}}>{title}</Text>
        </View>
    )
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
    },
});
export default PackageInformation;