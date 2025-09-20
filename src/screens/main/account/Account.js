import React, {useState, useEffect} from 'react';
import {StyleSheet, View, Text, Dimensions, TouchableOpacity, SafeAreaView, ScrollView, TouchableNativeFeedback} from 'react-native';
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

const {width, height} = Dimensions.get("window")
function Account(props){
    const colors = useAppTheme()
    const { loginType } = useSelector((state) => state.account);
    const [loading, setLoading] = useState(true)
    const [getError, setGetError] = useState(false)

    const tryAgain = ()=>{
        setLoading(true)
        setGetError(false)
        getData()
    }

    const GuestAccountOptions = [
        {
            title: "خرید سکه",
            image_icon: require('../../../assets/image/coin.png'),
            icon_size: 25,
            icon_backgroun_color:"#388e3c99",
            arrow: true,
            onPress:()=>{}
        },
        {
            title: "اشتراک بازی",
            icon_name: "diamond-outline",
            icon_type: "Ionicons",
            icon_size: 25,
            icon_backgroun_color:"#fcb90099",
            arrow: true,
            onPress:()=>{}
        },
        {
            title: "بسته‌های بازی من",
            icon_name: "grid-outline",
            icon_type: "Ionicons",
            icon_size: 25,
            icon_backgroun_color:"#ff730099",
            arrow: true,
            onPress:()=>{}
        },
        {
            title: "دریافت سکه رایگان",
            image_icon: require('../../../assets/image/coin.png'),
            icon_size: 25,
            icon_backgroun_color:"#673ab799",
            arrow: true,
            onPress:()=>{}
        },
        {
            title: "بروزرسانی بازی مرحله‌ای",
            icon_name: "game-controller-outline",
            icon_type: "Ionicons",
            icon_size: 25,
            icon_backgroun_color:"#2196f399",
            arrow: true,
            onPress:()=>{props.navigation.navigate("StageGameUpdateScreen")}
        },
        {
            title: "تنظیمات",
            icon_name: "settings-outline",
            icon_type: "Ionicons",
            icon_size: 25,
            icon_backgroun_color:"#00968899",
            arrow: true,
            onPress:()=>{}
        },
    ]
    const RegisteredAccountOptions = [
        {
            title: "خرید سکه",
            image_icon: require('../../../assets/image/coin.png'),
            icon_size: 25,
            icon_backgroun_color:"#388e3c99",
            arrow: true,
            onPress:()=>{}
        },
        {
            title: "اشتراک بازی",
            icon_name: "diamond-outline",
            icon_type: "Ionicons",
            icon_size: 25,
            icon_backgroun_color:"#fcb90099",
            arrow: true,
            onPress:()=>{}
        },
        {
            title: "بسته‌های بازی من",
            icon_name: "grid-outline",
            icon_type: "Ionicons",
            icon_size: 25,
            icon_backgroun_color:"#ff730099",
            arrow: true,
            onPress:()=>{}
        },
        {
            title: "دریافت سکه رایگان",
            image_icon: require('../../../assets/image/coin.png'),
            icon_size: 25,
            icon_backgroun_color:"#673ab799",
            arrow: true,
            onPress:()=>{}
        },
        {
            title: "بروزرسانی بازی مرحله‌ای",
            icon_name: "game-controller-outline",
            icon_type: "Ionicons",
            icon_size: 25,
            icon_backgroun_color:"#2196f399",
            arrow: true,
            onPress:()=>{props.navigation.navigate("StageGameUpdateScreen")}
        },
        {
            title: "تنظیمات",
            icon_name: "settings-outline",
            icon_type: "Ionicons",
            icon_size: 25,
            icon_backgroun_color:"#00968899",
            arrow: true,
            onPress:()=>{}
        },
        {
            title: "خروج از حساب کاربری",
            title_color: colors.alert.a1,
            icon_name: "log-out-outline",
            icon_type: "Ionicons",
            icon_size: 25,
            icon_backgroun_color:"#b8000099",
            arrow: false,
            onPress:()=>{}
        }
    ]
    const AccountOptions = loginType == "guest"?GuestAccountOptions:loginType == "registered"?RegisteredAccountOptions:[]
    const account = ()=>{
        return(
            <View style={{width:width, alignItems:'center', paddingVertical:15}}>
                {
                    loginType == "guest"?
                    <LinearGradient colors={['#1b0b6395', '#311b9295', '#512da895']} style={{width:width-30, borderRadius:15}}>
                        <View style={{ width:width-30, borderWidth:1, borderColor:colors.border.a1, borderRadius:15, paddingHorizontal:10, paddingVertical:15, gap:20}}>
                            <View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between', width:"100%"}}>
                                <View style={{ flexDirection:'row', alignItems:'center', gap:10}}>
                                    <View style={{alignItems:'center', justifyContent:'center', padding:10, borderColor:colors.border.a1, borderWidth:0.5, borderRadius:50, backgroundColor:`${colors.primary.a1}40`}}>
                                        <Icon name={"person"} type={"Ionicons"} style={{fontSize:25, color:colors.text.a5}}/>
                                    </View>
                                    <View style={{ flexDirection:'column', alignItems:'flex-start'}}>
                                        <Text style={{fontFamily:Font.medium, fontSize:14, color:colors.text.a1}}>{"کاربر میهمان"}</Text>
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
                                    <View style={{alignItems:'center', justifyContent:'center', padding:10, borderColor:colors.border.a1, borderWidth:0.5, borderRadius:50, backgroundColor:`${colors.primary.a1}40`}}>
                                        <Icon name={"person"} type={"Ionicons"} style={{fontSize:25, color:colors.text.a5}}/>
                                    </View>
                                    <View style={{ flexDirection:'column', alignItems:'flex-start'}}>
                                        <Text style={{fontFamily:Font.medium, fontSize:14, color:colors.text.a1}}>{"کامران ربیعی"}</Text>
                                        <Text style={{fontFamily:Font.medium, fontSize:10, color:colors.text.a1}}>{"09353845285"}</Text>
                                    </View>
                                </View>
                                <ButtonGradient
                                    text={"مدیریت حساب"}
                                    textSize={13}
                                    onPress={()=>{}}
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
                paddingHorizontal={15}
                height={60}
                coin={true}
            />
            <View style={{flex:1, alignItems:'center'}}>
                <ScrollView>
                    {account()}
                    {
                        AccountOptions.map((item, index)=>(
                            <View key={index.toString()}>
                                <SimpleItem
                                    iconBackColor={item.icon_backgroun_color}
                                    title={item.title}
                                    titleColor={item?.title_color??colors.text.a2}
                                    arrow={item.arrow}
                                    height={55}
                                    horizontal={15}
                                    icon_name={item?.icon_name}
                                    icon_type={item?.icon_type}
                                    image_icon={item?.image_icon}
                                    icon_size={item.icon_size}
                                    textSize={14}
                                    click={item.onPress}
                                />
                                <Border
                                    height={0.5}
                                    end={15}
                                    start={60}
                                    color={colors.border.a1}
                                />
                            </View>
                        ))
                    }
                </ScrollView>
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