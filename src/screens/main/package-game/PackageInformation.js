import React, {useState, useEffect} from 'react';
import {StyleSheet, View, Text, Dimensions, TouchableOpacity, ScrollView} from 'react-native';
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
import Toast from 'react-native-toast-message';
import { updateNumberCoins } from '../../../redux/slices/coinSlice';

const {width, height} = Dimensions.get("window")
const gridSize = IS_TABLET_CONDITION?(width-75)/4:(width-45)/2
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
                                badg,
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
                                    answers,
                                    createdAt,
                                },
                                seasons{title, first_media{path}},
                            },
                            user_package_status{
                                status,
                                button_text,
                                user_package_id,
                                access_type
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
                if(checkExist.user_package?.version_created < data.force_version_created || checkExist.user_package?.version_updated < data.force_version_updated || checkExist.user_package?.version_deleted < data.force_version_deleted){
                    setCheckUpdate("need-update")
                } else if(checkExist.user_package?.version_created < data.version_created || checkExist.user_package?.version_updated < data.version_updated || checkExist.user_package?.version_deleted < data.version_deleted){
                    setCheckUpdate("force-update")
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
            getForFirst(accessType)
        } else if(data?.user_package_status.status == "get-subscription"){
            getPackageWithSubscription()
        } else if(data?.user_package_status.status == "get-coin-payment"){
            getPackageWithCoinPayment()
        } else if(data?.user_package_status.status == "subscription-renewal-or-coin-payment"){
            subscriptionRenewalOrCoinPayment()
        } else if(data?.user_package_status.status == "redownload-content"){
            redownloadContent()
        } else if(data?.user_package_status.status == "recreate-and-download-content"){
            const accessType = data.user_package_status.access_type
            recreateAndDownloadContent(accessType)
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
                        redownloadContent()
                    } else {
                        setData(prev => ({
                            ...(prev || {}),
                            user_package_status: {
                                ...(prev?.user_package_status || {}),
                                status: "recreate-and-download-content",
                                button_text: "دانلود مجدد محتوا",
                            },
                        }));
                        const accessType = "coin-payment"
                        recreateAndDownloadContent(accessType)
                    }
                }
            } else {
                BottomDrawerGridHelper.hideBottomDrawer()
                Toast.show({
                    type: "error",
                    text1 : "خطا در پرداخت سکه",
                    text2: response.data?.data?.message??"مشکلی در پرداخت سکه پیش آمد. دوباره تلاش کنید.",
                })
            }
        }).catch((err)=>{
            BottomDrawerGridHelper.hideBottomDrawer()
            Toast.show({
                type: "error",
                text1 : "خطا در پرداخت سکه",
                text2: "مشکلی در پرداخت سکه پیش آمد. دوباره تلاش کنید.",
            })
        })
    }

    const getPackageWithSubscription = ()=>{
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
                    text1: `پرداخت ${data?.package?.price} سکه`,
                    text2: `با یکبار پرداخت سکه، به شکل دائمی به بستهٔ بازی دسترسی خواهید داشت`,
                    image: require('../../../assets/image/coin.png'),
                    localImage: true,
                    height:gridSize + 80,
                    width:gridSize,
                    blank_background: true,
                    onPress : ()=>{
                        setSelectedPaymentMethod({_id:"2", text1:`پرداخت ${data?.package?.price} سکه`})
                    }
                },
            ],
            buttons:[
                {
                    onPress : ({data})=>{
                        if(data._id[0] == "1"){
                            const accessType = "subscription"
                            getForFirst(accessType)
                        } else if(data._id[0] == "2"){
                            const accessType = "coin-payment"
                            getForFirst(accessType)
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
        const previousSelected = selectedPaymentMethod?{
            _id:[selectedPaymentMethod?._id],
            text1:[selectedPaymentMethod?.text1]
        }:{
            _id:["1"],
            text1:[`پرداخت ${data?.package?.price} سکه`]
        }
        BottomDrawerGridHelper.showBottomDrawer({
            title:"دریافت بستهٔ بازی",
            list:[
                {
                    _id: "1",
                    text1: `پرداخت ${data?.package?.price} سکه`,
                    text2: `دسترسی دائمی به بستهٔ بازی بعد از دریافت بازی`,
                    image: require('../../../assets/image/coin.png'),
                    localImage: true,
                    height:gridSize + 80,
                    width:gridSize,
                    blank_background: true,
                    onPress : ()=>{
                        setSelectedPaymentMethod({_id:"1", text1:`پرداخت ${data?.package?.price} سکه`})
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
                            getForFirst(accessType)
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
    
    const getForFirst = async(accessType)=>{
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
            console.log("PPPPPPPPPPPPPP000000000000000000")
            const color = colors.primary.a1
            const status = data?.user_package_status.status
            const selectedAccessType = accessType
            const packageInfo = {
                _id : data.package._id,
                title : data.package.title,
                description : data.package.description,
                subject : data.package.subject,
                badg : data.package.badg,
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
            console.log("PPPPPPPPPPPPPP11111111111111111111")
            const userPackageInfo = {
                package_ref : packageParamId,
                access_type : selectedAccessType,
                version_created : data.package.version_created,
                version_updated : data.package.version_updated,
                version_deleted : data.package.version_deleted,
            }
            console.log("PPPPPPPPPPPPPP2222222222222222222")
            dispatch(startProgressLoading())
            console.log("PPPPPPPPPPPPPP333333333333333333333333")
            await startSetPackageGameForUserAndGetIt({ dispatch, realm, packageId:packageParamId, packageInfo, numberCoins, userPackageInfo, status, selectedAccessType, color });
        }
    }
    const recreateAndDownloadContent = async(accessType)=>{
        console.log("11111111111111")
        const color = colors.primary.a1
        console.log("222222222222222")
        const packageInfo = {
            _id : data.package._id,
            title : data.package.title,
            description : data.package.description,
            subject : data.package.subject,
            badg : data.package.badg,
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
        console.log("3333333333333333")
        const userPackageInfo = {
            _id : data?.user_package_status?.user_package_id,
            package_ref : packageParamId,
            access_type : accessType,
            version_created : data.package.version_created,
            version_updated : data.package.version_updated,
            version_deleted : data.package.version_deleted,
        }
        console.log("4444444444444444")
        await recreateAndDownloadContentUserPackage({ dispatch, realm, packageId:packageParamId, packageInfo, userPackageInfo, color })
    }
    const redownloadContent = async()=>{
        const color = colors.primary.a1
        const packageInfo = {
            _id : data.package._id,
            title : data.package.title,
            description : data.package.description,
            subject : data.package.subject,
            badg : data.package.badg,
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
            access_type : selectedAccessType,
            version_created : data.package.version_created,
            version_updated : data.package.version_updated,
            version_deleted : data.package.version_deleted,
        }
        await redownloadContentUserPackage({ dispatch, realm, packageId:packageParamId, packageInfo, userPackageInfo, color })
    }
    
    return(
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
                    <ScrollView>
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
                            <ButtonGradient
                                text={data?.user_package_status?.button_text}
                                textSize={14}
                                onPress={onClickGetPackage}
                                width={checkUpdate == "need-update" || checkUpdate =="force-update"?width/2 - 20:width - 30}
                                height={50}
                                borderRadius={5}
                                loading={checkUpdate == "need-update" || checkUpdate =="force-update"?false:progressLoading}
                            />
                            {
                                (checkUpdate == "need-update" || checkUpdate =="force-update")&&
                                <ButtonBorder
                                    text={"بروزرسانی محتوا"}
                                    height={50}
                                    width={width/2 - 20}
                                    loading={progressLoading}
                                    onPress={()=>{}}
                                    borderRadius={5}
                                    textSize={14}
                                />
                            }
                        </View>
                        <RatingInfo
                            rating_average={data?.package?.rating_average}
                            rating_info={data?.package?.rating_info}
                            reviews={data?.package?.rating_number}
                        />
                        {
                            data?.seasons?.length > 0&&
                            <View style={{width:width, flexDirection:'row', flexWrap:'wrap'}}>
                                {
                                    data?.seasons.map((item, index)=>(
                                        <View key={index.toString()}>
                                            <ImageComponent
                                                uri={item?.first_media?.path}
                                                width={width/2 - 20}
                                                height={100}
                                                resizeMode="cover"
                                                borderRadius={10}
                                            />
                                            <Text style={{fontFamily:Font.medium, fontSize:14, color:colors.text.a3}}>{item.title}</Text>
                                        </View>
                                    ))
                                }
                            </View>
                        }
                    </ScrollView>
                }
            </View>
            <BottomDrawerGrid ref = {Ref => {BottomDrawerGridHelper.setRef(Ref)}}/>
        </View>
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