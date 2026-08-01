import AlertBottomDrawerHelper from "../../components/alert-bottom-drawer/AlertBottomDrawerHelper";
import DynamicProSkiaText from "../../components/text-components/DynamicProSkiaText";
import { colors } from "../../hooks/theme/colors";
import { seenConnectingLetterGuide, seenUnknownWordGuide, seenWordToSlotGuide } from "../../redux/slices/settingSlice";
import Font from "../Font";
import Globals from "../Globals";
import Icon from "../Icon";
import {StyleSheet, View, Text, Dimensions, TouchableOpacity, SafeAreaView, FlatList, ImageBackground} from 'react-native';


export const showWordToSlotGuide = async({dispatch, currentWords, sentence})=>{
    const msg = [
        {
            text:"کارت‌های معلق را به ترتیب درست در خانه‌های خالی بچینید. باید با قرار دادن هر کارت در جای صحیح، جملهٔ صحیح هر مرحله را ایجاد کنید.",
            style:{ fontFamily:Font.bakh_semi_bold, fontSize:14, color:colors.text.a1, alignSelf:'flex-start', textAlign:'justify', lineHeight:25},
        },
        {
            text:`در این مرحله ${currentWords.length} کارت معلق وجود دارد. با توجه به کملهٔ هر کارت، آن را به ترتیب درون خانه‌های خالی شماره 1 تا ${currentWords.length} قرار دهید تا جملهٔ  "${sentence}"  ایجاد شود.`,
            style:{ fontFamily:Font.bakh_semi_bold, fontSize:14, color:colors.text.a1, alignSelf:'flex-start', textAlign:'justify', lineHeight:25},
        },
        {
            text:`* روی هر کارت لمس کرده و آن را و روی صفحه بکشید و در جایی که میخواهید رها کنید.`,
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
            text:`در بین کارت‌های بازی، کارتی که روی آن علامت سوال است دارای کلمه‌ای نامعلوم است. قبل از مرتب کردن کارت‌ها، آن را فشار داده و کملهٔ مربوط به آن را کشف کنید.`,
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
            text:`با ترکیب حروف معلق، یک کملهٔ اصلی (مخصوص جملهٔ بخش قبل) و چند کلمه اضافه بسازید.`,
            style:{ fontFamily:Font.bakh_semi_bold, fontSize:14, color:colors.text.a1, alignSelf:'flex-start', textAlign:'justify', lineHeight:25},
        },
        {
            text:`در اینجا تعداد ${letters?.length} حرف وجود دارد که باید یک کلمه اصلی  "${word}"  ${additionalWords?.length > 0?`و ${additionalWords?.length} کلمه اضافهٔ  "${additionalWords.join("، ")}" `:""} ساخته شود.`,
            style:{ fontFamily:Font.bakh_semi_bold, fontSize:14, color:colors.text.a1, alignSelf:'flex-start', textAlign:'justify', lineHeight:25},
        },
        {
            text:`برای ساختن هر کلمه، حروف معلق را به ترتیب فشار دهید. زمان برای فشار دادن حرف بعدی چند ثانیه است.`,
            style:{ fontFamily:Font.bakh_semi_bold, fontSize:14, color:colors.text.a1, alignSelf:'flex-start', textAlign:'justify', lineHeight:25},
        },
        {
            text:`* دو حرف  "آ"  و  "ا"  هر دو یکی هستند. اگر برای ساخت یک کلمه نیاز به حرف  "آ"  بود از  "ا"  استفاده کنید.`,
            style:{ fontFamily:Font.bakh_semi_bold, fontSize:12, color:colors.primary.a3, alignSelf:'flex-start', textAlign:'justify', lineHeight:24},
        },
        {
            text:`* در هر مرحله باید کلمات مربوط به زبان آن مرحله ساخته شود. برای مثال اگر زبان مرحله‌ای ترکی بود کلماتی که باید ایجاد شوند نیز همه کلمات ترکی هستند.`,
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