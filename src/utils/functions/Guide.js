import AlertBottomDrawerHelper from "../../components/alert-bottom-drawer/AlertBottomDrawerHelper";
import DynamicProSkiaText from "../../components/text-components/DynamicProSkiaText";
import { colors } from "../../hooks/theme/colors";
import { seenConnectingLetterGuide, seenUnknownWordGuide, seenWordGameGuide, seenWordToSlotGuide } from "../../redux/slices/settingSlice";
import Font from "../Font";
import Globals from "../Globals";
import Icon from "../Icon";
import {StyleSheet, View, Text, Dimensions, TouchableOpacity, SafeAreaView, FlatList, ImageBackground} from 'react-native';


export const showWordToSlotGuide = async({dispatch, currentWords, sentence})=>{
    const msg = [
        {
            text:"کارت‌های معلق را به‌ترتیب در خانه‌های خالی بچین تا جملهٔ صحیح ساخته شود.",
            style:{ fontFamily:Font.bakh_semi_bold, fontSize:14, color:colors.text.a1, alignSelf:'flex-start', textAlign:'justify', lineHeight:25},
        },
        {
            text:`با توجه به کلمات ${currentWords.length} کارت معلق، آن‌ها را به‌ترتیب در خانه‌های ۱ تا ${currentWords.length} بچین تا جملهٔ «${sentence}» ساخته شود.`,
            style:{ fontFamily:Font.bakh_semi_bold, fontSize:14, color:colors.text.a1, alignSelf:'flex-start', textAlign:'justify', lineHeight:25},
        },
        {
            text:"* کارت را لمس کن، روی صفحه بِکِش و در محل دلخواه رها کن.",
            style:{ fontFamily:Font.bakh_semi_bold, fontSize:12, color:colors.primary.a3, alignSelf:'flex-start', textAlign:'justify', lineHeight:24},
        },
    ]
    AlertBottomDrawerHelper.showAlert({
        title:"آموزش بازی",
        message: msg,
        buttons:[
            {
                onPress : ()=>{},
                text: "متوجه شدم",
                type: "bold",
            },
        ],
        options:{
            cancelable: false,
            icon:{
                Icon:()=>(
                    <View style={{flexDirection:'column', alignItems:'center', gap:10}}>
                        <View style={{flexDirection:'row', flexWrap:'wrap', alignItems:'center', justifyContent:'center', gap:5}}>
                            {
                                currentWords.map((_, index)=>(
                                    <View key={index.toString()} style={{width:39, height:30, borderColor:colors.primary.a1, backgroundColor:`${colors.primary.a1}30`, borderWidth:2, borderRadius:7, alignItems:'center', justifyContent:'center'}}>
                                        <Text style={{fontFamily:Font.black, fontSize:14, color:"#FFFFFF50"}}>{index+1}</Text>
                                    </View>
                                ))
                            }
                        </View>
                        <View style={{flexDirection:'row', flexWrap:'wrap', alignItems:'center', justifyContent:'center', gap:5}}>
                            {
                                currentWords.map((item, index)=>(
                                    <View key={index.toString()}>
                                        <ImageBackground
                                            source={require("../../assets/image/word-card.png")}
                                            resizeMode="stretch"
                                            style={{ width: 60, height: 46, alignItems:'center', justifyContent:'center' }}
                                        >
                                            {
                                            (item.unknown_word)?
                                            <View>
                                                <Icon name={"question"} type={"Fontisto"} style={{color:"#CC0000", fontSize:30}}/>
                                            </View>
                                            :
                                            <DynamicProSkiaText 
                                                text={item?.word}
                                                textColor={"#662d86"} 
                                                borderColor={"#FFFFFF"} 
                                                borderWidth={1}
                                                fontSize={14}
                                            />
                                            }
                                        </ImageBackground>
                                    </View>
                                ))
                            }
                        </View>
                    </View>
                )
            }
        }
    })
    dispatch(seenWordToSlotGuide())
}
export const showUnknownWordGuide = ({dispatch})=>{
    const msg = [
        {
            text:"کارت دارای علامت سؤال، کلمه‌ای نامعلوم دارد. پیش از مرتب‌کردن کارت‌ها، آن را لمس کن تا کلمه را در بخش دیگری کشف کنی.",
            style:{ fontFamily:Font.bakh_semi_bold, fontSize:14, color:colors.text.a1, alignSelf:'flex-start', textAlign:'justify', lineHeight:25},
        },
    ]
    AlertBottomDrawerHelper.showAlert({
        title:"آموزش بازی",
        message: msg,
        buttons:[
            {
                onPress : ()=>{},
                text: "متوجه شدم",
                type: "bold",
            },
        ],
        options:{
            cancelable: false,
            icon:{
                Icon:()=>(
                    <View>
                        <ImageBackground
                            source={require("../../assets/image/word-card.png")}
                            resizeMode="stretch"
                            style={{ width: 91, height: 70, alignItems:'center', justifyContent:'center' }}
                        >
                            <View style={{width:50, height:50, borderRadius:25, borderWidth:2, borderColor:"#CC0000", alignItems:'center', justifyContent:"center"}}>
                                <Icon name={"question"} type={"FontAwesome5"} style={{color:"#CC0000", fontSize:30}}/>
                            </View>
                        </ImageBackground>
                    </View>
                )
            }
        }
    })
    dispatch(seenUnknownWordGuide())
}

export const showConnectingLetterGuide = async({dispatch, letters, word, additionalWords})=>{
    const msg = [
        {
            text:`با ترکیب ${letters?.length} حرف، کلمهٔ اصلی «${word}»${additionalWords?.length > 0 ? ` و کلمات اضافهٔ «${additionalWords.join("، ")}»` : ""} را بساز.`,
            style:{ fontFamily:Font.bakh_semi_bold, fontSize:14, color:colors.text.a1, alignSelf:'flex-start', textAlign:'justify', lineHeight:25},
        },
        {
            text:"برای ساختن هر کلمه، حروف معلق را به‌ترتیب لمس کن. برای انتخاب حرف بعدی، زمان محدودی داری.",
            style:{ fontFamily:Font.bakh_semi_bold, fontSize:14, color:colors.text.a1, alignSelf:'flex-start', textAlign:'justify', lineHeight:25},
        },
        {
            text:"* حروف «آ» و «ا» در بازی یکسان‌اند؛ برای ساخت کلمات، از «ا» به‌جای «آ» استفاده کن.",
            style:{ fontFamily:Font.bakh_semi_bold, fontSize:12, color:colors.primary.a3, alignSelf:'flex-start', textAlign:'justify', lineHeight:24},
        },
        {
            text:"* کلمات هر مرحله باید به زبان همان مرحله باشند؛ مثلاً در جمله‌چین ترکی، باید کلمات ترکی بسازی.",
            style:{ fontFamily:Font.bakh_semi_bold, fontSize:12, color:colors.primary.a3, alignSelf:'flex-start', textAlign:'justify', lineHeight:24},
        },
    ]
    AlertBottomDrawerHelper.showAlert({
        title:"آموزش بازی",
        message: msg,
        buttons:[
            {
                onPress : ()=>{},
                text: "متوجه شدم",
                type: "bold",
            },
        ],
        options:{
            cancelable: false,
            icon:{
                Icon:()=>(
                    <View style={{flexDirection:'row', flexWrap:'wrap', alignItems:'center', justifyContent:'center', gap:5}}>
                        {
                            letters.map((item, index)=>(
                                <View key={index.toString()}>
                                    <ImageBackground
                                        source={require("../../assets/image/letter-card.png")}
                                        resizeMode="stretch"
                                        style={{ width: 50, height: 50, alignItems:'center', justifyContent:'center' }}
                                    >
                                        <DynamicProSkiaText 
                                            text={item}
                                            textColor={"#512da8"} 
                                            borderColor={"#FFFFFF"} 
                                            borderWidth={1}
                                            fontSize={25}
                                        />
                                    </ImageBackground>
                                </View>
                            ))
                        }
                    </View>
                )
            }
        }
    })
    dispatch(seenConnectingLetterGuide())
}
export const showWordGameGuide = async({dispatch, letters, words})=>{
    const msg = [
        {
            text:`با ترکیب این ${letters?.length} حرف، ${words.length} کلمهٔ «${words.join("، ")}» را بساز.`,
            style:{ fontFamily:Font.bakh_semi_bold, fontSize:14, color:colors.text.a1, alignSelf:'flex-start', textAlign:'justify', lineHeight:25},
        },
        {
            text:"برای ساختن هر کلمه، حروف معلق را به‌ترتیب لمس کن. برای انتخاب حرف بعدی، زمان محدودی داری.",
            style:{ fontFamily:Font.bakh_semi_bold, fontSize:14, color:colors.text.a1, alignSelf:'flex-start', textAlign:'justify', lineHeight:25},
        },
        {
            text:"* حروف «آ» و «ا» در بازی یکسان‌اند؛ برای ساخت کلمات، از «ا» به‌جای «آ» استفاده کن.",
            style:{ fontFamily:Font.bakh_semi_bold, fontSize:12, color:colors.primary.a3, alignSelf:'flex-start', textAlign:'justify', lineHeight:24},
        },
        {
            text:"* کلمات هر مرحله باید به زبان همان مرحله باشند؛ مثلاً در خان کلمات ترکی، باید کلمات ترکی بسازی.",
            style:{ fontFamily:Font.bakh_semi_bold, fontSize:12, color:colors.primary.a3, alignSelf:'flex-start', textAlign:'justify', lineHeight:24},
        },
    ]
    AlertBottomDrawerHelper.showAlert({
        title:"آموزش بازی خان کلمات",
        message: msg,
        buttons:[
            {
                onPress : ()=>{},
                text: "متوجه شدم",
                type: "bold",
            },
        ],
        options:{
            cancelable: false,
            icon:{
                Icon:()=>(
                    <View style={{flexDirection:'row', flexWrap:'wrap', alignItems:'center', justifyContent:'center', gap:5}}>
                        {
                            letters.map((item, index)=>(
                                <View key={index.toString()}>
                                    <ImageBackground
                                        source={require("../../assets/image/letter-card.png")}
                                        resizeMode="stretch"
                                        style={{ width: 50, height: 50, alignItems:'center', justifyContent:'center' }}
                                    >
                                        <DynamicProSkiaText 
                                            text={item}
                                            textColor={"#512da8"} 
                                            borderColor={"#FFFFFF"} 
                                            borderWidth={1}
                                            fontSize={25}
                                        />
                                    </ImageBackground>
                                </View>
                            ))
                        }
                    </View>
                )
            }
        }
    })
    dispatch(seenWordGameGuide())
}