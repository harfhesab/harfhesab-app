import React, {useState, useEffect} from 'react';
import {StyleSheet, View, Text, Dimensions, TouchableOpacity, SafeAreaView, ScrollView, TouchableNativeFeedback} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../redux/store/RootReducer';
import { login, logout } from '../../../redux/slices/accountSlice';
import LinearGradient from 'react-native-linear-gradient';
import useAppTheme from '../../../hooks/theme/useAppTheme';
import GeneralHeader from '../../../components/header/GeneralHeader';
import Icon from '../../../utils/Icon';
import Font from '../../../utils/Font';
import SimpleItem from '../../../components/list-view-items/SimpleItem';

const {width, height} = Dimensions.get("window")
function Account(props){
    const colors = useAppTheme()
    const [loading, setLoading] = useState(true)
    const [getError, setGetError] = useState(false)

    const tryAgain = ()=>{
        setLoading(true)
        setGetError(false)
        getData()
    }

    const AccountOptions = [
        {
            title: "دریافت سکه رایگان",
            image_icon: require('../../../assets/image/coin.png'),
            icon_size: 25,
            icon_backgroun_color:"#673ab799",
            arrow: true,
            onPress:()=>{}
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
    const account = ()=>{
        return(
            <View style={{width:width, alignItems:'center', paddingVertical:15}}>
                <TouchableNativeFeedback onPress={()=>{}} background={TouchableNativeFeedback.Ripple(colors.border.a1,false)}>
                    <View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between', width:width-30, borderWidth:1, borderColor:colors.border.a1, borderRadius:15, paddingHorizontal:10, paddingVertical:15}}>
                        <View style={{flexDirection:'row', alignItems:'center', gap:5}}>
                            <View style={{alignItems:'center', justifyContent:'center', padding:8, borderColor:colors.border.a1, borderWidth:0.5, borderRadius:50}}>
                                <Icon name={"person-outline"} type={"Ionicons"} style={{fontSize:25, color:colors.text.a2}}/>
                            </View>
                            <View style={{flexDirection:'column', alignItems:'flex-start'}}>
                                <Text>{}</Text>
                                <Text style={{fontFamily:Font.medium, fontSize:14, color:colors.text.a1}}>{"09353845285"}</Text>
                            </View>
                        </View>
                        <View>
                            <Text style={{fontFamily:Font.medium, fontSize:14, color:colors.primary.a1}}>{"مدیریت حساب"}</Text>
                        </View>
                    </View>
                </TouchableNativeFeedback>
            </View>
        )
    }
    
    return(
        <View>
            <GeneralHeader
                paddingHorizontal={15}
                height={60}
                coin={true}
            />
            <LinearGradient colors={colors.background_gradient} style={{width:width, height:height}}>
                <View style={styles.container}>
                    <ScrollView>
                        {account()}
                        {
                            AccountOptions.map((item, index)=>(
                                <SimpleItem
                                    key={index.toString()}
                                    iconBackColor={item.icon_backgroun_color}
                                    title={item.title}
                                    titleColor={item?.title_color??colors.text.a1}
                                    arrow={item.arrow}
                                    height={55}
                                    horizontal={15}
                                    icon_name={item?.icon_name}
                                    icon_type={item?.icon_type}
                                    image_icon={item?.image_icon}
                                    icon_size={item.icon_size}
                                    textSize={15}
                                    click={item.onPress}
                                />
                            ))
                        }
                    </ScrollView>
                </View>
            </LinearGradient>
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