import React, {useState, useCallback} from 'react';
import {StyleSheet, View, Text, Dimensions, TouchableOpacity, ScrollView, TouchableNativeFeedback, StatusBar, ImageBackground, Image, ActivityIndicator} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useAppTheme from '../../../../hooks/theme/useAppTheme';
import GeneralHeader from '../../../../components/header/GeneralHeader';
import ScreenLoading from '../../../../components/screen-loading/ScreenLoading';
import DynamicProSkiaText from '../../../../components/text-components/DynamicProSkiaText';
import { IS_TABLET_CONDITION, STATUS_BAR_HEIGHT } from '../../../../utils/constants/constants';
import GalaxyTwinkle from '../../../../components/particles/GalaxyTwinkle';
import { WaveIndicator } from 'react-native-indicators';
import axios from 'axios';
import Font from '../../../../utils/Font';
import { priceDigitSeperator } from '../../../../utils/PriceDigitSeperator';
import SeasonMediaSwiper from '../../../../components/swiper/SeasonMediaSwiper';
import TimerUIThread from '../../../../components/timer/TimerUIThread';
import { useDispatch, useSelector } from 'react-redux';
import { useRealm } from '../../../../realm';
import { createKalamAkharChallenge } from '../../../../realm/repositories/kalam-akhar/kalam-akhar-challenge.repository';
import Icon from '../../../../utils/Icon';
import { showToast } from '../../../../components/custom-toast/ToastRef';
import { reduceNumberCoins } from '../../../../redux/slices/coinSlice';
import { useFocusEffect } from '@react-navigation/native';



const calculateTimeRemaining = (endDate, serverNow) => {
    const diff = new Date(endDate).getTime() - new Date(serverNow).getTime();
    if (diff <= 0 || isNaN(diff)) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
    return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60)
    };
};
function secondsToTimeObject(totalSeconds) {
    totalSeconds = Math.max(0, Math.floor(totalSeconds));
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return {
        days: days > 0 ? days : undefined,
        hours: days > 0 ? hours : (hours > 0 ? hours : undefined),
        minutes,
        seconds
    };
}
const {width, height} = Dimensions.get("screen")
const itemWidth = IS_TABLET_CONDITION?width*0.7:width - 30
function KalamAkharInformation(props){
    const dispatch = useDispatch();
    const colors = useAppTheme()
    const realm = useRealm();
    const { numberCoins } = useSelector((state) => state.coins);
    const [data, setData] = useState(null)
    const [progress, setProgress] = useState(null)
    const [loading, setLoading] = useState(true)
    const [getError, setGetError] = useState(false)
    const [timer, setTimer] = useState(null)
    const [loading2, setLoading2] = useState(false)
    const challengeParamId = props?.route?.params?._id
    const timeLimit = data?.time_limit > 0?secondsToTimeObject(data?.time_limit):null;
    const remainingTime =  progress?.remaining_time_seconds > 0?secondsToTimeObject(progress?.remaining_time_seconds):null;

    const cardImageBackground = data?.subscription_required == true?
        require("../../../../assets/image/kalam-akhar-card-2.png"):
        require("../../../../assets/image/kalam-akhar-card-1.png")

    const cardImageButton = data?.subscription_required == true?
        require("../../../../assets/image/circle_blue.png"):
        require("../../../../assets/image/circle_red.png")

    useFocusEffect(
        useCallback(() => {
            getData();
            return () => {
                setLoading(true)
                setLoading2(false)
            };
        }, [])
    );
    const getData = async()=>{
        await axios({
            url:'/',
            method:'post',
            data: {
                query : `
                    query getKalamAkharChallengeInformationAndUserStatus(
                        $_id : ID!
                    ){
                        getKalamAkharChallengeInformationAndUserStatus(
                            _id : $_id
                        ) {
                            kalam_akhar_challenge{
                                _id
                                title
                                description
                                time_limit
                                entry_fee_coins
                                subscription_required
                                reward_coins
                                reward_subscription
                                end_date
                                media{path file_type order}
                                language_info{name}
                            }
                            user_progress{
                                session
                                has_started
                                has_completed
                                can_resume
                                remaining_time_seconds
                                message
                            }
                            server_now
                        }
                    }
                `,
                variables : {
                    "_id" : challengeParamId,
                }
            }
        }).then(async(response)=>{
            const dataReceived = response.data.data?.getKalamAkharChallengeInformationAndUserStatus
            if(dataReceived){
                setData(dataReceived?.kalam_akhar_challenge)
                if(dataReceived?.user_progress)setProgress(dataReceived?.user_progress)
                setLoading(false)
            }
            const endDate = dataReceived?.kalam_akhar_challenge?.end_date
            const serverNow = dataReceived?.server_now
            if(endDate && serverNow)setTimer(calculateTimeRemaining(endDate, serverNow))
        }).catch((e)=>{
            setGetError(true)
        })
    }
    const tryAgain = ()=>{
        setLoading(true)
        setGetError(false)
        getData()
    }
    const startChallengeCheck = ()=>{
        if(progress && progress?.can_resume !== true){
            showToast({
                title: "پایان!",
                message: progress?.has_completed == true?"این چالش با موفقیت به پایان رسیده است!":"زمان بازی برای ادامه تمام شده است!",
                type: "error",
                animationType: "slide",
                position: "top",
                duration: 4000
            });
        } else if(!progress && numberCoins < data?.entry_fee_coins) {
            showToast({
                title: `شروع این چالش نیاز به پرداخت ${data?.entry_fee_coins} سکه می‌باشد!`,
                message: "",
                type: "error",
                animationType: "slide",
                position: "top",
                duration: 4000
            });
        } else {
            startChallenge()
        }
    }
    const startChallenge = async()=>{
        setLoading2(true)
        await axios({
            url:'/',
            method:'post',
            data: {
                query : `
                mutation startNewSessionForKalamAkharChallenge(
                        $challenge: ID!
                        $session: ID
                        $user_number_coins: Int!
                    ){
                    startNewSessionForKalamAkharChallenge(
                        challenge : $challenge
                        session : $session
                        user_number_coins : $user_number_coins
                    ) {
                        _id
                        status
                        message
                        remaining_time_seconds
                        kalam_akhar_challenge{
                            parts{
                                _id
                                sentence
                                sentence_hint
                                sentence_display
                                words{
                                    _id
                                    word
                                    word_hint
                                    unknown_word
                                    letters
                                    additional_words
                                    hidden_words
                                    order
                                }
                                order
                            }
                            voice{path}
                            stage_hint
                            language_ref
                        }
                    }
                }
                `,
                variables : {
                    "challenge" : challengeParamId,
                    "session" : (progress && progress?.session)?progress.session:undefined,
                    "user_number_coins" : numberCoins || 0,
                }
            }
        }).then((response)=>{
            const receivedData = response.data.data?.startNewSessionForKalamAkharChallenge
            if(receivedData?.status == 200){
                const expiration = data?.time_limit?data.time_limit*2:7200
                const remainingTimeSeconds = receivedData?.remaining_time_seconds?receivedData.remaining_time_seconds:data?.time_limit?data.time_limit:null
                const documentData = {
                    ...data,
                    ...receivedData.kalam_akhar_challenge
                }
                const res = createKalamAkharChallenge(
                    realm,
                    documentData,
                    expiration,
                    remainingTimeSeconds
                )
                if(receivedData?._id && res == true){
                    if(!progress){
                        const entryFeeCoins = data?.entry_fee_coins
                        if(typeof entryFeeCoins == "number" && entryFeeCoins > 0 && numberCoins >= entryFeeCoins){
                            dispatch(reduceNumberCoins({number:entryFeeCoins}))
                            props.navigation.navigate("WordToSlotKalamAkhar", {challenge:challengeParamId, session:receivedData?._id})
                            setProgress({
                                session: receivedData?._id,
                                remaining_time_seconds: data?.time_limit?data.time_limit:undefined
                            });
                        } else if(!entryFeeCoins || entryFeeCoins == 0) {
                            props.navigation.navigate("WordToSlotKalamAkhar", {challenge:challengeParamId, session:receivedData?._id})
                            setProgress({
                                session: receivedData?._id,
                                remaining_time_seconds: data?.time_limit?data.time_limit:undefined
                            });

                        }
                    } else {
                        props.navigation.navigate("WordToSlotKalamAkhar", {challenge:challengeParamId, session:receivedData?._id})
                    }
                }
            } else {
                setLoading2(false)
            }
        }).catch((error)=>{
            showToast({
                title: "مشکلی پیش آمد.",
                message: "در شروع بازی مشکلی پیش آمد. اینترنت خود را بررسی کرده و دوباره تلاش کنید.",
                type: "error",
                animationType: "slide",
                position: "top",
                duration: 4000
            });
            setLoading2(false)
        })
    }
    const finishRemainingTimeSeconds = ()=>{
        setProgress(prev => {
            if (!prev || !('can_resume' in prev)) {
                return prev;
            }

            return {
                ...prev,
                can_resume: false,
            };
        });
    }
    return(
        <SafeAreaView style={{flex:1, backgroundColor:"#120426"}}>
            <StatusBar translucent={true} hidden={true} />
            <GalaxyTwinkle >
                <View style={{ paddingTop:STATUS_BAR_HEIGHT}}>
                    <GeneralHeader
                        backgroundColor={'transparent'}
                        back={true}
                        coin={true}
                        subscription={true}
                        shadowColor={'transparent'}
                        borderBottomColor={'transparent'}
                        borderBottomWidth={0}
                        height={60}
                    />
                </View>
                <View style={styles.container}>
                    {
                        loading?
                        <View style={styles.centerFlex}>
                            <ScreenLoading
                                loading={loading}
                                getError={getError}
                                noItem={false}
                                tryAgain={tryAgain}
                                LoadingComponent={()=>{
                                    return(
                                        <WaveIndicator
                                            color={`#FFFFFF`}
                                            size={width/2}
                                            count={1}
                                            waveMode="fill"
                                        />
                                    )
                                }}
                            />
                        </View>
                        :
                        <View style={{flex:1, alignItems:'center', justifyContent:'center'}}>
                            <ImageBackground
                                source={require("../../../../assets/image/screen-paper.png")}
                                style={{ width: itemWidth, height: height - (STATUS_BAR_HEIGHT + 90), marginEnd:"2%"}}
                                imageStyle={{ resizeMode: "stretch", opacity: 0.85 }}
                                resizeMode="stretch"
                            >
                                <View style={{flexDirection:'column', alignItems:'center', justifyContent:'space-between', width:"100%", height:"100%"}}>
                                    
                                    <View style={{width:"100%", alignItems:'center', paddingTop:20, gap:5}}>
                                        <ImageBackground
                                            source={require("../../../../assets/image/title-kalam-akhar.png")}
                                            style={{ width: itemWidth*0.65, height: itemWidth*0.15}}
                                            imageStyle={{ resizeMode: "stretch" }}
                                            resizeMode="stretch"
                                        >
                                            <View style={{ alignItems:'center', justifyContent:"center", width:"100%", height:"100%"}}>
                                                <DynamicProSkiaText 
                                                    text={data?.title}
                                                    textColor={colors.primary.a9} 
                                                    borderColor={"#FFFFFF"} 
                                                    borderWidth={1}
                                                    fontSize={20}
                                                />
                                            </View>
                                        </ImageBackground>
                                        {
                                            data?.subscription_required == true&&
                                            <View style={{position:'absolute', width:itemWidth*0.65, alignItems:'flex-end', top:itemWidth*0.03}}>
                                                <Image
                                                    style={{height:35, width:35}}
                                                    source={require('../../../../assets/image/diamond.png')}
                                                />
                                            </View>
                                        }
                                        {
                                            data?.media?.length > 0&&
                                            <SeasonMediaSwiper
                                                items={data?.media}
                                                height={(itemWidth - 30)/1.85}
                                                frameWidth={itemWidth - 60}
                                            />
                                        }
                                        {data?.description&&<Text style={{fontSize:12, fontFamily:Font.bakh_bold, color:colors.primary.a7, width:itemWidth - 60, marginTop:data?.media?.length > 0?0:30}}>{data?.description}</Text>}
                                        {progress?.message&&<View style={{width:itemWidth - 60, paddingHorizontal:10, paddingVertical:5, backgroundColor:`${colors.primary.a8}99`, borderRadius:5, marginTop:data?.media?.length > 0?0:30}}>
                                            <Text style={{fontSize:10, fontFamily:Font.bakh_semi_bold, color:colors.primary.a5, lineHeight:17}}>{progress?.message}</Text>
                                        </View>}
                                        {
                                            (data?.language_info?.name || data?.reward_coins || data?.reward_subscription || data?.subscription_required || data?.entry_fee_coins || data?.time_limit)&&
                                            <View style={{width:itemWidth - 60, paddingTop:10, paddingBottom:5, backgroundColor:`${colors.primary.a6}70`, borderRadius:10, alignItems:'center', gap:5, marginTop:data?.media?.length > 0?0:30}}>
                                                {
                                                    (data?.reward_coins || data?.reward_subscription)&&
                                                    <View style={{width:"100%", flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:10}}>
                                                        <Text style={{fontSize:12, fontFamily:Font.bakh_semi_bold, color:colors.primary.a7}}>{"جایزهٔ چالش"}</Text>
                                                        <View style={{flexDirection:'row', alignItems:'center', justifyContent:"center", gap:10}}>
                                                            {
                                                                data?.reward_subscription&&
                                                                <View style={{flexDirection:'row', alignItems:'center', gap:3}}>
                                                                    <Image
                                                                        style={{height:14, width:14}}
                                                                        source={require('../../../../assets/image/diamond.png')}
                                                                    />
                                                                    <Text style={{color:"#035c05", fontFamily:Font.bakh_bold, fontSize:14}}>{`${data?.reward_subscription}+ روز`}</Text>
                                                                </View> 
                                                            }
                                                            {
                                                                data?.reward_coins&&
                                                                <View style={{flexDirection:'row', alignItems:'center', gap:3}}>
                                                                    <Image
                                                                        style={{height:14, width:14}}
                                                                        source={require('../../../../assets/image/coin.png')}
                                                                    />
                                                                    <Text style={{color:"#035c05", fontFamily:Font.bakh_bold, fontSize:14}}>{`${priceDigitSeperator(data?.reward_coins)}`}</Text>
                                                                </View> 
                                                            }
                                                        </View>
                                                    </View>
                                                }
                                                {
                                                    (data?.subscription_required || data?.entry_fee_coins)&&
                                                    <View style={{width:"100%", flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:10}}>
                                                        <Text style={{fontSize:12, fontFamily:Font.bakh_semi_bold, color:colors.primary.a7}}>{"ورودی چالش"}</Text>
                                                        <View style={{flexDirection:'row', alignItems:'center', justifyContent:"center", gap:10}}>
                                                            {
                                                                data?.subscription_required&&
                                                                <View style={{flexDirection:'row', alignItems:'center', gap:3}}>
                                                                    <Text style={{color:colors.primary.a7, fontFamily:Font.bakh_semi_bold, fontSize:14}}>(<Image
                                                                        style={{height:14, width:14}}
                                                                        source={require('../../../../assets/image/diamond.png')}
                                                                    />با اشتراک)</Text>
                                                                    
                                                                </View> 
                                                            }
                                                            {
                                                                data?.entry_fee_coins&&
                                                                <View style={{flexDirection:'row', alignItems:'center', gap:3}}>
                                                                    <Image
                                                                        style={{height:14, width:14}}
                                                                        source={require('../../../../assets/image/coin.png')}
                                                                    />
                                                                    <Text style={{color:"#aa0000", fontFamily:Font.bakh_bold, fontSize:14}}>{`${priceDigitSeperator(data?.entry_fee_coins)}`}</Text>
                                                                </View> 
                                                            }
                                                        </View>
                                                    </View>
                                                }
                                                {
                                                    data?.time_limit&&
                                                    <View style={{width:"100%", flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:10}}>
                                                        <Text style={{fontSize:12, fontFamily:Font.bakh_semi_bold, color:colors.primary.a7}}>{"زمان بازی"}</Text>
                                                        <View style={{flexDirection:'row', alignItems:'center', justifyContent:"center", gap:3}}>
                                                            <Icon name={"stopwatch"} type={"Entypo"} style={{color:colors.primary.a7, fontSize:14}}/>
                                                            <Text style={{fontSize: 14, fontFamily: Font.bakh_bold, color: colors.primary.a7}}>{`${timeLimit?.hours?`${timeLimit.hours}:`:""}${String(timeLimit?.minutes).padStart(2, '0')}:${String(timeLimit?.seconds).padStart(2, '0')}`}</Text>
                                                        </View>
                                                    </View>
                                                }
                                                {
                                                    data?.language_info?.name&&
                                                    <View style={{width:"100%", flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:10}}>
                                                        <Text style={{fontSize:12, fontFamily:Font.bakh_semi_bold, color:colors.primary.a7}}>{"زبان محتوا"}</Text>
                                                        <View style={{flexDirection:'row', alignItems:'center', justifyContent:"center", gap:5}}>
                                                            <Text style={{fontSize: 14, fontFamily: Font.bakh_bold, color: colors.primary.a7}}>{data?.language_info?.name}</Text>
                                                        </View>
                                                    </View>
                                                }
                                            </View>
                                        }
                                    </View>


                                    

                                    <View style={{width:"100%"}}>
                                        <View style={{flexDirection:'row', alignItems:'center', width:"100%", justifyContent:'space-between', paddingHorizontal:30, paddingBottom:30}}>

                                            <TouchableOpacity onPress={startChallengeCheck} activeOpacity={0.7} style={{ alignItems:'center', justifyContent:'center'}}>
                                                <ImageBackground
                                                    source={cardImageButton}
                                                    style={{ width:110, height:110, alignItems:'center', justifyContent:'center' }}
                                                    imageStyle={{ resizeMode: "stretch", opacity:(progress && progress?.can_resume !== true)?0.4:1 }}
                                                    resizeMode="stretch"
                                                >
                                                    <View style={{ alignItems:'center', justifyContent:'center', height:"100%", width:"100%"}}>
                                                        {
                                                            loading2 == true?
                                                            <ActivityIndicator color={colors.primary.a5} size={'large'}/>
                                                            :
                                                            <View style={{width:"100%", alignItems:'center', gap:5}}>
                                                                <DynamicProSkiaText 
                                                                    text={(progress && progress?.can_resume !== true)?`پایان!`:(progress && progress?.can_resume == true)?`ادامه`:`شروع`}
                                                                    textColor={colors.primary.a3} 
                                                                    borderColor={colors.primary.a7} 
                                                                    borderWidth={1}
                                                                    fontSize={22}
                                                                />
                                                                {
                                                                    (progress && progress?.can_resume == true && remainingTime)&&
                                                                    <TimerUIThread
                                                                        style={{fontSize: 12, fontFamily: Font.black, color: colors.primary.a5}}
                                                                        seconds={remainingTime?.seconds}
                                                                        minutes={remainingTime?.minutes}
                                                                        hours={remainingTime?.hours}
                                                                        days={remainingTime?.days}
                                                                        separator={":"}
                                                                        hideTitle={true}
                                                                        onFinish={finishRemainingTimeSeconds}
                                                                    />
                                                                }
                                                            </View>
                                                        }
                                                    </View>
                                                </ImageBackground>
                                            </TouchableOpacity>

                                            {
                                                timer&&
                                                <View style={{alignItems:'center'}}>
                                                    <Text style={{fontFamily:Font.bakh_bold, color:colors.primary.a7, fontSize:8}}>{"پایان این چالش"}</Text>
                                                    <View style={{ backgroundColor:`${colors.primary.a7}90`, borderRadius:10, alignItems:'center', justifyContent:'center', paddingHorizontal:10, paddingVertical:5}}>
                                                        <TimerUIThread
                                                            style={{fontSize: 12, fontFamily: Font.black, color: colors.primary.a5}}
                                                            titleStyle={{fontSize:8, fontFamily: Font.medium, color: `${colors.primary.a5}99`}}
                                                            seconds={timer?.seconds}
                                                            minutes={timer?.minutes}
                                                            hours={timer?.hours}
                                                            days={timer?.days}
                                                            onFinish={finishRemainingTimeSeconds}
                                                        />
                                                    </View>
                                                </View>
                                            }
                                        </View>
                                    </View>
                                </View>
                            </ImageBackground>
                        </View>
                    }
                </View>
            </GalaxyTwinkle>
        </SafeAreaView>
    )
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
    },
    centerFlex: { flex: 1, width:width, alignItems: 'center', justifyContent: 'center', paddingBottom:60 },
});
export default KalamAkharInformation;