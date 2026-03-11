import AlertBottomDrawerHelper from "../../components/alert-bottom-drawer/AlertBottomDrawerHelper";
import SimpleBorderText from "../../components/text-components/SimpleBorderText";
import { colors } from "../../hooks/theme/colors";
import { seenConnectingLetterGuide, seenUnknownWordGuide, seenWordToSlotGuide } from "../../redux/slices/settingSlice";
import Font from "../Font";
import Globals from "../Globals";
import Icon from "../Icon";
import {StyleSheet, View, Text, Dimensions, TouchableOpacity, SafeAreaView, FlatList, ImageBackground} from 'react-native';


export const showFirstGuide = async()=>{
    const msg = [
        {
            text:"درود",
        },
        {
            text:`به بازی ${Globals.game_name_fa} خوش آمدید.\nاین بازی، یک پلتفرم مبتنی بر محتوای متن، جمله و کلمه میباشد.\nمفهوم اصلی بازی این است که، کلمات مختلف یک جملهٔ مشخص، بهم ریخته و هر کلمه روی یک کارت نوشته شده است، باید کارت‌ها به ترتیب کنار هم قرار داده شود تا آن جمله ساخته شود. `,
        },
        {
            text:`آن جملهٔ مشخص میتواند یک جملهٔ ساده، یک ضرب المثل، یک بیت یا مصرع از یک شعر، یا یک نقل و قول یا هر نوع متنی باشد.`,
        },
        {
            text:`روی بعضی از کارت‌ها به جای یک کلمه یک علامت سوال وجود دارد. باید قبل از کنار هم چیدن کارت ها برای ساختن جمله، ابتدا کلمهٔ مربوط به آن کارت را از بین چندین حرف، در یک محیط دیگر کشف کرد.`,
        },
        {
            text:`هر مرحله از بازی شامل یک یا چند جمله است.`,
        },
        {
            text:`در بخش بازی مرحله‌ای، زبان های مختلفی وجود دارد.\nدر هر زبان، مراحل مختلف باید به ترتیب فصل‌های مختلف آن زبان طی شوند. در واقع هر زبان فصل‌های مختلفی با موضوعلات متنوع دارد.`,
        },
        {
            text:`در بخش بسته‌های بازی، هر بسته در واقع یک داستان یا یک شعر یا متن به خصوص هست که جملات یا ابیات یا متون مختلف آن، در مراحل مختلف بازی به ترتیب آورده شده است که باید مراحل را به ترتیب فصل‌های آن بستهٔ بازی طی کرد.`,
        },
        {
            text:`در بین کارت هایی که روی هر کدام از آن‌ها یک کلمه یا عبارت نوشته شده است، روی بعضی از کارت‌ها یک علامت سوال وجود دارد. این یعنی کلمهٔ مربوط به آن کارت نامعلوم است و باید ابتدا آن کلمه کشف شود.`,
        },
        {
            text:`در چالش‌های کشف کلمه، تعدادی حرف وجود دارد که باید از بین آن حروف یک کلمهٔ اصلی نامعلوم و تعدادی کلمه اضافه پیدا شود تا هر چالش تکمیل شود.\nلازم به ذکر است کلماتی که باید پیدا شوند، در هر زبان، فقط کلماتی از آن زبان میباشند.`,
        },
    ]
}

export const showWordToSlotGuide = async({dispatch, currentWords, sentence})=>{
    const msg = [
        {
            text:`هدف این بخش بازی تشخیص جملهٔ صحیحی است که با ترکیب کلمات و عبارت‌های روی کارت‌ها باید ایجاد شود. توجه کنید فقط یک جملهٔ به خصوص مد نظر است.`,
            style:{ fontFamily:Font.medium, fontSize:13, color:colors.text.a1, alignSelf:'flex-start', textAlign:'justify', lineHeight:24},
        },
        {
            text:`در این مرحله تعداد ${currentWords.length} کارت به شکل بهم ریخته و معلق هستند.\nاین کارت‌ها را به ترتیب درون خانه‌های خالی شماره 1 تا ${currentWords.length} قرار دهید تا جملهٔ  "${sentence}"  ایجاد شود.`,
            style:{ fontFamily:Font.medium, fontSize:13, color:colors.text.a1, alignSelf:'flex-start', textAlign:'justify', lineHeight:24},
        },
        {
            text:`* برای جابجایی و قرار دادن کارت‌ها در خانه‌های خالی، روی هر کارت لمس کرده و روی صفحه بکشید و در جایی که میخواهید آن را رها کنید.`,
            style:{ fontFamily:Font.medium, fontSize:13, color:colors.primary.a6, alignSelf:'flex-start', textAlign:'justify', lineHeight:24},
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
                                        <Text style={{fontFamily:Font.black, fontSize:12, color:"#FFFFFF50"}}>{index+1}</Text>
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
                                            style={{ width: 52, height: 40, alignItems:'center', justifyContent:'center' }}
                                        >
                                            {
                                            (item.unknown_word)?
                                            <View>
                                                <Icon name={"question"} type={"Fontisto"} style={{color:"#CC0000", fontSize:30}}/>
                                            </View>
                                            :
                                            <SimpleBorderText
                                                text={item?.word}
                                                width={52}
                                                height={40}
                                                fontSize={12}
                                                borderWidth={1}
                                                textColor="#662d86"
                                                borderColor="#FFFFFF"
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
            text:`در بین کارت‌های بازی، کارتی که روی آن علامت سوال است دارای کلمه‌ای نامعلوم است. قبل از مرتب کردن کارت‌ها، آن را فشار داده و کلمه‌ی مربوط به آن را کشف کنید.`,
            style:{ fontFamily:Font.medium, fontSize:13, color:colors.text.a1, alignSelf:'flex-start', textAlign:'justify', lineHeight:24},
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
                                <Icon name={"question"} type={"Fontisto"} style={{color:"#CC0000", fontSize:30}}/>
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
            text:`هدف این بخش بازی کشف یک کلمهٔ اصلی است که برای ایجاد جملهٔ مورد نظر در بخش قبلی لازم بود. برای تکمیل چالش باید تعدادی کلمه اضافه نیز با ترکیب حروف موجود بسازید.`,
            style:{ fontFamily:Font.medium, fontSize:13, color:colors.text.a1, alignSelf:'flex-start', textAlign:'justify', lineHeight:24},
        },
        {
            text:`در این چالش کشف کلمه، تعداد ${letters?.length} حرف وجود دارد که باید با ترکیب این حروف یک کلمه اصلی  "${word}"  ${additionalWords?.length > 0?`و ${additionalWords?.length} کلمه اضافهٔ  "${additionalWords.join("، ")}" `:""} ساخته شود.`,
            style:{ fontFamily:Font.medium, fontSize:13, color:colors.text.a1, alignSelf:'flex-start', textAlign:'justify', lineHeight:24},
        },
        {
            text:`برای ساختن و ایجاد یک کلمه، حروف معلق و در حال حرکت را به ترتیب فشار دهید. زمان برای فشار دادن حرف بعدی چند ثانیه است. یعنی بعد از اینکه آخرین حرف را فشار دادید، فقط به اندازهٔ پر شدن نوار وضعیت فرصت دارید تا حرف بعدی را فشار دهید.`,
            style:{ fontFamily:Font.medium, fontSize:13, color:colors.text.a1, alignSelf:'flex-start', textAlign:'justify', lineHeight:24},
        },
        {
            text:`* دو حرف  "آ"  و  "ا"  هر دو یکی هستند. اگر برای ساخت یک کلمه نیاز به حرف  "آ"  بود از  "ا"  استفاده کنید.`,
            style:{ fontFamily:Font.medium, fontSize:13, color:colors.primary.a6, alignSelf:'flex-start', textAlign:'justify', lineHeight:24},
        },
        {
            text:`* کلماتی که باید ساخته شوند در هر زبان فقط کلمات مربوط  به آن زبان هستند. برای مثال اگر زبان مرحله‌ای ترکی بود کلماتی که باید ایجاد شوند نیز همه کلمات ترکی هستند.`,
            style:{ fontFamily:Font.medium, fontSize:13, color:colors.primary.a6, alignSelf:'flex-start', textAlign:'justify', lineHeight:24},
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
                                        <SimpleBorderText
                                            text={item}
                                            width={50}
                                            height={50}
                                            fontSize={25}
                                            borderWidth={1}
                                            textColor="#512da8"
                                            borderColor="#FFFFFF"
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