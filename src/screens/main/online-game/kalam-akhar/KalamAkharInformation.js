import React, {useState, useEffect} from 'react';
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
import { useSelector } from 'react-redux';



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
const {width, height} = Dimensions.get("screen")
const itemWidth = IS_TABLET_CONDITION?width*0.7:width - 30
function KalamAkharInformation(props){
    const colors = useAppTheme()
    const { numberCoins } = useSelector((state) => state.coins);
    const [data, setData] = useState(null)
    const [progress, setProgress] = useState(null)
    const [loading, setLoading] = useState(true)
    const [getError, setGetError] = useState(false)
    const [timer, setTimer] = useState(null)
    const [loading2, setLoading2] = useState(false)
    const challengeParamId = props?.route?.params?._id

    const cardImageBackground = data?.subscription_required == true?
        require("../../../../assets/image/kalam-akhar-card-2.png"):
        require("../../../../assets/image/kalam-akhar-card-1.png")

    const cardImageButton = data?.subscription_required == true?
        require("../../../../assets/image/circle_blue.png"):
        require("../../../../assets/image/circle_red.png")


    useEffect(()=>{
        getData()
    }, [])
    const getData = async()=>{
        await axios({
            url:'/',
            method:'post',
            data: {
                query : `
                    query getKalamAkharChallengeInformationAndUserStatus(
                        $_id : ID!,
                    ){
                        getKalamAkharChallengeInformationAndUserStatus(
                            _id : $_id,
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
                                start_date
                                end_date
                                order
                                media{path, file_type, order}
                                voice{path}
                                stage_hint
                                language_info{name}
                                is_active
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
                        seconds
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
            setLoading2(false)
            const data = response.data.data?.startNewSessionForKalamAkharChallenge
            if(data?.status == 200){
                
            }
        }).catch((error)=>{
            setLoading2(false)
        })
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
                                            (data?.reward_coins || data?.reward_subscription)&&
                                            <View style={{width:itemWidth - 60, paddingTop:10, paddingBottom:5, backgroundColor:`${colors.primary.a2}60`, borderRadius:10, alignItems:'center', gap:10, marginTop:data?.media?.length > 0?0:30}}>
                                                <Text style={{fontSize:12, fontFamily:Font.bakh_bold, color:colors.primary.a5, lineHeight:17}}>{"جایزهٔ چالش"}</Text>
                                                <View style={{flexDirection:'row', alignItems:'center', justifyContent:(data?.reward_coins && data?.reward_subscription)?'space-evenly':'center', width:"100%"}}>
                                                    {
                                                        data?.reward_coins&&
                                                        <View style={{flexDirection:'row', alignItems:'center', gap:3}}>
                                                            <Image
                                                                style={{height:20, width:20}}
                                                                source={require('../../../../assets/image/coin.png')}
                                                            />
                                                            <Text style={{color:colors.primary.a7, fontFamily:Font.bakh_extra_bold, fontSize:20}}>{priceDigitSeperator(data?.reward_coins)}</Text>
                                                        </View> 
                                                    }
                                                    {
                                                        data?.reward_subscription&&
                                                        <View style={{flexDirection:'row', alignItems:'center', gap:3}}>
                                                            <Image
                                                                style={{height:20, width:20}}
                                                                source={require('../../../../assets/image/diamond.png')}
                                                            />
                                                            <Text style={{color:colors.primary.a7, fontFamily:Font.bakh_extra_bold, fontSize:20}}>{`${data?.reward_subscription} روز`}</Text>
                                                        </View> 
                                                    }
                                                </View>
                                            </View>
                                        }
                                    </View>
                                    <View style={{width:"100%"}}>
                                        <View style={{flexDirection:'row', alignItems:'center', width:"100%", justifyContent:'space-between', paddingHorizontal:30, paddingBottom:15}}>
                                            <View style={{alignItems:'center', gap:10}}>
                                                <View style={{flexDirection:'row', alignItems:'center'}}>
                                                    <View style={{backgroundColor:`${colors.primary.a2}30`, paddingHorizontal:10, paddingVertical:3, borderRadius:15, borderColor:colors.primary.a2, borderWidth:1, borderStyle:'dashed'}}>
                                                        {
                                                            progress?
                                                            <View>

                                                            </View>
                                                            :data?.entry_fee_coins > 0?
                                                            <View style={{flexDirection:'row', alignItems:'center', gap:5}}>
                                                                <Text style={{fontFamily:Font.bakh_semi_bold, color:colors.primary.a2, fontSize:12}}>{`پرداخت ${data?.entry_fee_coins}`}</Text>
                                                                <Image
                                                                    style={{height:12, width:12}}
                                                                    source={require('../../../../assets/image/coin.png')}
                                                                />
                                                            </View>
                                                            :
                                                            <View style={{flexDirection:'row', alignItems:'center', gap:5}}>
                                                                <Text style={{fontFamily:Font.bakh_semi_bold, color:colors.primary.a2, fontSize:12}}>{"رایگان"}</Text>
                                                            </View>
                                                        }
                                                    </View>

                                                </View>
                                                <TouchableOpacity onPress={startChallenge} disabled={(progress && progress?.can_resume !== true)?true:false} activeOpacity={0.7} style={{ alignItems:'center', justifyContent:'center', marginStart:"3%"}}>
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
                                                                <DynamicProSkiaText 
                                                                    text={(progress && progress?.can_resume !== true)?`پایان!`:(progress && progress?.can_resume == true)?`ادامهٔ\nچالش`:`شروع\nچالش`}
                                                                    textColor={colors.primary.a3} 
                                                                    borderColor={colors.primary.a7} 
                                                                    borderWidth={1}
                                                                    fontSize={20}
                                                                />
                                                            }
                                                        </View>
                                                    </ImageBackground>
                                                </TouchableOpacity>
                                            </View>
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
    centerFlex: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom:60 },
});
export default KalamAkharInformation;