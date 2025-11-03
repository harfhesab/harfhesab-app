import React, {useState, useEffect} from 'react';
import {StyleSheet, View, Text, Dimensions, TouchableOpacity, SafeAreaView, ScrollView, TouchableNativeFeedback, ImageBackground} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../redux/store/RootReducer';
import { login, logout } from '../../../redux/slices/accountSlice';
import useAppTheme from '../../../hooks/theme/useAppTheme';
import GeneralHeader from '../../../components/header/GeneralHeader';
import Icon from '../../../utils/Icon';
import Font from '../../../utils/Font';
import SimpleItem from '../../../components/list-view-items/SimpleItem';
import Border from '../../../components/Border';
import ButtonGradient from '../../../components/buttons/ButtonGradient';
import LinearGradient from 'react-native-linear-gradient';
import SimpleBorderText from '../../../components/text-components/SimpleBorderText';

const {width, height} = Dimensions.get("window")
function Account(props){
    const colors = useAppTheme()
    const { loginType, name, phone } = useSelector((state) => state.account);
    const [loading, setLoading] = useState(true)
    const [getError, setGetError] = useState(false)

    const tryAgain = ()=>{
        setLoading(true)
        setGetError(false)
        getData()
    }

    const AccountOptions = [
        {
            title: "خرید سکه",
            image_icon: require('../../../assets/image/coin.png'),
            icon_size: 35,
            arrow: true,
            onPress:()=>{props.navigation.navigate("CoinPlans")}
        },
        {
            title: "اشتراک بازی",
            image_icon: require('../../../assets/image/diamond.png'),
            icon_size: 35,
            arrow: true,
            onPress:()=>{props.navigation.navigate("SubscriptionPlans")}
        },
        {
            title: "بسته‌های بازی من",
            image_icon: require('../../../assets/image/my-package.png'),
            icon_size: 30,
            arrow: true,
            onPress:()=>{props.navigation.navigate("UserPackagesList")}
        },
        {
            title: "دریافت سکه رایگان",
            image_icon: require('../../../assets/image/coin.png'),
            icon_size: 35,
            arrow: true,
            onPress:()=>{}
        },
        {
            title: "بروزرسانی بازی مرحله‌ای",
            image_icon: require('../../../assets/image/download.png'),
            icon_size: 25,
            image_width: 18,
            arrow: true,
            onPress:()=>{props.navigation.navigate("StageGameUpdateScreen")}
        },
        {
            title: "تنظیمات",
            image_icon: require('../../../assets/image/setting_yellow.png'),
            arrow: true,
            onPress:()=>{}
        },
        {
            title: "خروج از حساب کاربری",
            title_color: colors.primary.a1,
            icon_name: "sign-out",
            icon_type: "FontAwesome",
            icon_color: colors.primary.a1,
            arrow: false,
            onPress:()=>{}
        }
    ]
    
    const account = ()=>{
        return(
            <View style={{width:width, alignItems:'center', paddingVertical:10}}>
                <ImageBackground
                    source={require("../../../assets/image/horizontal_frame2.png")}
                    style={{ width: width - 20, height: 135}}
                    imageStyle={{ resizeMode: "stretch" }}
                    resizeMode="stretch"
                >
                    <View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between', width:"100%", height:"100%", paddingHorizontal:"6%"}}>
                        <ImageBackground
                                source={require("../../../assets/image/circle_button.png")}
                                style={{ width:100, height: 100, alignItems:'center', justifyContent:'center', paddingBottom:3}}
                                imageStyle={{ resizeMode: "stretch" }}
                                resizeMode="stretch"
                            >
                            <Icon name={"person"} type={"Ionicons"} style={{fontSize:50, color:"#ffc107"}}/>
                        </ImageBackground>
                        <View style={{flexDirection:'column', alignItems:'flex-end', gap:10}}>
                            <View style={{ flexDirection:'column', alignItems:'flex-end'}}>
                                <Text style={{fontFamily:Font.black, fontSize:12, color:colors.text.a1}}>{name}</Text>
                                <Text style={{fontFamily:Font.medium, fontSize:12, color:colors.text.a1}}>{loginType == "registered" ? phone : "کاربر میهمان"}</Text>
                            </View>
                            <TouchableOpacity 
                                onPress={()=>{
                                    if(loginType == "registered"){
                                        props.navigation.navigate("AccountManagement")
                                    }else{
                                        props.navigation.navigate("LoginToAccount")
                                    }
                                }} 
                                activeOpacity={0.8} 
                                style={{ alignSelf:'center', justifyContent:'center'}}
                            >
                                <ImageBackground
                                    source={require("../../../assets/image/button_2.png")}
                                    style={{ width: 135, height: 40, alignItems:'center', justifyContent:'center'}}
                                    imageStyle={{ resizeMode: "stretch" }}
                                    resizeMode="stretch"
                                >
                                    <SimpleBorderText
                                        text={loginType == "registered"?"مدیریت حساب":"ورود به حساب"}
                                        width={140}
                                        height={14*1.6}
                                        fontSize={14}
                                        textColor={"#FFFFFF"}
                                        borderColor={"#311b92"}
                                        borderWidth={2.5}
                                    />
                                </ImageBackground>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ImageBackground>
            </View>
        )
    }
    const accountttt = ()=>{
        return(
            <View style={{width:width, alignItems:'center', paddingVertical:15}}>
                {
                    loginType == "guest"?
                    <LinearGradient colors={['#1b0b6395', '#311b9295', '#512da895']} style={{width:width-30, borderRadius:15}}>
                        <View style={{ width:width-30, borderWidth:1, borderColor:colors.border.a1, borderRadius:15, paddingHorizontal:10, paddingVertical:15, gap:20}}>
                            <View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between', width:"100%"}}>
                                <View style={{ flexDirection:'row', alignItems:'center', gap:10}}>
                                    <View style={{alignItems:'center', justifyContent:'center', padding:10, borderColor:colors.border.a1, borderWidth:0.5, borderRadius:50, backgroundColor:`${colors.primary.a1}25`}}>
                                        <Icon name={"person"} type={"Ionicons"} style={{fontSize:25, color:colors.text.a5}}/>
                                    </View>
                                    <View style={{ flexDirection:'column', alignItems:'flex-start'}}>
                                        <Text style={{fontFamily:Font.medium, fontSize:12, color:colors.text.a1}}>{"کاربر میهمان"}</Text>
                                        <Text style={{fontFamily:Font.black, fontSize:10, color:colors.text.a1}}>{name}</Text>
                                    </View>
                                </View>
                                <ButtonGradient
                                    text={"ورود به حساب"}
                                    textSize={13}
                                    onPress={()=>{props.navigation.navigate("LoginToAccount")}}
                                    width={120}
                                    height={35}
                                    borderRadius={20}
                                />
                            </View>
                            <Text style={{fontFamily:Font.medium, fontSize:12, color:colors.text.a5, lineHeight:24, textAlign:'justify'}}>{"با ورود به حساب کاربری خود، اطلاعات و پیشرفت بازی‌هایتان را ثبت و قابل بازیابی کنید."}</Text>
                        </View>
                    </LinearGradient>
                    :loginType == "registered" &&
                    <LinearGradient colors={['#1b0b6399', '#311b9299', '#512da899']}  style={{width:width-30, borderRadius:15}}>
                        <View style={{ width:width-30, borderWidth:1, borderColor:colors.border.a1, borderRadius:15, paddingHorizontal:10, paddingVertical:15, gap:20}}>
                            <View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between', width:"100%"}}>
                                <View style={{ flexDirection:'row', alignItems:'center', gap:10}}>
                                    <View style={{alignItems:'center', justifyContent:'center', padding:10, borderColor:colors.border.a1, borderWidth:0.5, borderRadius:50, backgroundColor:`${colors.primary.a1}25`}}>
                                        <Icon name={"person"} type={"Ionicons"} style={{fontSize:25, color:colors.text.a5}}/>
                                    </View>
                                    <View style={{ flexDirection:'column', alignItems:'flex-start'}}>
                                        <Text style={{fontFamily:Font.black, fontSize:12, color:colors.text.a1}}>{name}</Text>
                                        <Text style={{fontFamily:Font.medium, fontSize:10, color:colors.text.a1}}>{phone}</Text>
                                    </View>
                                </View>
                                <ButtonGradient
                                    text={"مدیریت حساب"}
                                    textSize={13}
                                    onPress={()=>{props.navigation.navigate("AccountManagement")}}
                                    width={120}
                                    height={35}
                                    borderRadius={20}
                                />
                            </View>
                        </View>
                    </LinearGradient>
                }
            </View>
        )
    }
    
    return(
        <View style={{flex:1, backgroundColor:colors.background.a1}}>
            <GeneralHeader
                paddingHorizontal={10}
                height={60}
                coin={true}
            />
            <View style={{flex:1, alignItems:'center'}}>
                
                {account()}
                <ImageBackground
                    source={require("../../../assets/image/menu_frame.png")}
                    style={{ width: width - 20, height: height-295, paddingVertical:"3.5%"}}
                    imageStyle={{ resizeMode: "stretch" }}
                    resizeMode="stretch"
                >
                    <View style={{borderRadius:"10%", overflow:'hidden', width:width-40, alignItems:'center', alignSelf:'center'}}>
                        <ScrollView 
                            contentContainerStyle={{alignItems:'center', paddingVertical:5, gap:10}} 
                            showsVerticalScrollIndicator={false}
                        >
                            
                            {
                                AccountOptions.map((item, index)=>(
                                    <View key={index.toString()}>
                                        <SimpleItem
                                            title={item.title}
                                            title_color={item?.title_color}
                                            arrow={item.arrow}
                                            icon_name={item?.icon_name}
                                            icon_type={item?.icon_type}
                                            image_icon={item?.image_icon}
                                            icon_size={item.icon_size}
                                            click={item.onPress}
                                            image_width={item?.image_width}
                                            image_height={item?.image_height}
                                            icon_color={item?.icon_color}
                                        />
                                    </View>
                                ))
                            }
                        </ScrollView>
                    </View>
                </ImageBackground>
            </View>
        </View>
    )
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
    },
});

export default Account;