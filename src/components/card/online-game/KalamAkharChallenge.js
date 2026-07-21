import React, {memo} from 'react';
import {View, Text, TouchableOpacity, Dimensions, ImageBackground, Image} from 'react-native';
import Icon from '../../../utils/Icon';
import Font from '../../../utils/Font';
import FastImage from '@d11/react-native-fast-image';
import Globals from '../../../utils/Globals';
import useAppTheme from '../../../hooks/theme/useAppTheme';
import ImageComponent from '../../image-components/ImageComponent';
import { IS_TABLET_CONDITION } from '../../../utils/constants/constants';
import { navigate } from '../../../main/navigationService';
import { showToast } from '../../custom-toast/ToastRef';
import DynamicProSkiaText from '../../text-components/DynamicProSkiaText';
import { priceDigitSeperator } from '../../../utils/PriceDigitSeperator';
import { useSelector } from 'react-redux';
import BottomDrawerGridHelper from '../../bottom-drawer-grid/BottomDrawerGridHelper';
import AlertBottomDrawerHelper from '../../alert-bottom-drawer/AlertBottomDrawerHelper';

const {width} = Dimensions.get('screen')
const itemWidth = IS_TABLET_CONDITION?(width - 80)/3:(width - 60)/2
const gridSize = IS_TABLET_CONDITION?(width-75)/4:(width-45)/2
function KalamAkharChallenge({
    _id,
    title,
    entry_fee_coins,
    subscription_required,
    reward_coins,
    reward_subscription,
    is_active
}){
    const colors = useAppTheme();
    const { numberCoins } = useSelector((state) => state.coins);
    const { activeSubscription } = useSelector((state) => state.subscription);

    const cardImageBackground = subscription_required == true?
        require("../../../assets/image/kalam-akhar-card-2.png"):
        require("../../../assets/image/kalam-akhar-card-1.png")

    const cardImageTitle = subscription_required == true?
        require("../../../assets/image/kalam-akhar-title-2.png"):
        require("../../../assets/image/kalam-akhar-title-1.png")

    const cardImageButton = subscription_required == true?
        require("../../../assets/image/circle_blue.png"):
        require("../../../assets/image/circle_red.png")

    const click = ()=>{
        if(is_active == true){
            if(subscription_required == true && activeSubscription !== true){
                const btn = [
                    {
                        onPress : ()=>{
                            navigate("SubscriptionPlans")
                        },
                        text: "خرید اشتراک",
                        type: "bold",
                    },
                    {
                        onPress : ()=>{},
                        text: "لغو",
                        type: "border",
                    },
                ]
                AlertBottomDrawerHelper.showAlert({
                    title:"شروع این چالش نیاز به اشتراک فعال دارد!",
                    buttons:btn,
                    options:{
                        cancelable: true,
                        icon:{
                            Icon:()=>(
                                <Image
                                    style={{height:gridSize, width:gridSize}}
                                    source={require('../../../assets/image/diamond.png')}
                                />
                            )
                        }
                    }
                })
            } else if(entry_fee_coins && entry_fee_coins > numberCoins){
                const previousSelected = {
                    _id:["2"],
                    text1:["دریافت سکه رایگان"]
                }
                BottomDrawerGridHelper.showBottomDrawer({
                    title:`شروع این چالش نیاز به پرداخت ${entry_fee_coins} سکه می‌باشد!`,
                    list:[
                        {
                            _id: "1",
                            text1: "خرید سکه",
                            image: require('../../../assets/image/coin.png'),
                            localImage: true,
                            height:gridSize + 40,
                            width:gridSize,
                            blank_background: true,
                            onPress : ()=>{}
                        },
                        {
                            _id: "2",
                            text1: "دریافت سکه رایگان",
                            image: require('../../../assets/image/coin.png'),
                            localImage: true,
                            height:gridSize + 40,
                            width:gridSize,
                            blank_background: true,
                            onPress : ()=>{}
                        }
                    ],
                    buttons:[
                        {
                            onPress : ({data})=>{
                                if(data._id[0] == "1"){
                                    navigate("CoinPlans")
                                } else if(data._id[0] == "2"){
                                    navigate("FreeCoin")
                                }
                            },
                            text: "افزایش سکه",
                            loading: false,
                            type: "bold",
                            selectRequired:true
                        },
                        {
                            onPress : ({data})=>{},
                            text: "لغو",
                            loading: false,
                            type: "border",
                        },
                    ],
                    options:{
                        numberSelectable: 1,
                        previousSelected:previousSelected,
                        cancelable: true,
                        selectRequired: true,
                    }
                })
            } else {
                navigate("KalamAkharInformation", {_id:_id})
            }
        } else {
            showToast({
                title: "این آیتم غیر فعال است.",
                message: "در حال حاضر این چالش کلام‌آخر غیر فعال است.",
                type: "info",
                animationType: "slide",
                position: "top",
                duration: 6000
            });
        }
    }
    return (
        <TouchableOpacity onPress={click} activeOpacity={0.85} style={{alignItems:'center'}}>
            <ImageBackground
                source={cardImageBackground}
                style={{ width: itemWidth, height: itemWidth*1.25}}
                imageStyle={{ resizeMode: "stretch", opacity: 0.75 }}
                resizeMode="stretch"
            >
                <View style={{flexDirection:'column', alignItems:'center', justifyContent:'space-between', width:"100%", height:"100%", paddingTop:'14%', paddingBottom:'8%'}}>
                    <View style={{flexDirection:'column', alignItems:'center', width:"100%", gap:3}}>
                        <ImageBackground
                            source={cardImageTitle}
                            style={{ width: itemWidth*0.77, height: itemWidth*0.25}}
                            imageStyle={{ resizeMode: "stretch" }}
                            resizeMode="stretch"
                        >
                            <View style={{ alignItems:'center', justifyContent:"center", width:"100%", height:"100%"}}>
                                <Text style={{color:colors.primary.a8, fontFamily:Font.bakh_black, fontSize:title.length > 14?itemWidth*0.08:title.length > 13?itemWidth*0.085:itemWidth*0.09}}>{title}</Text>
                            </View>
                        </ImageBackground>
                    </View>
                    {
                        (reward_coins || reward_subscription)&&
                        <ImageBackground
                            source={require("../../../assets/image/paper.png")}
                            style={{ width:itemWidth*0.72, height:itemWidth*0.4, alignItems:'center', justifyContent:'center', marginStart:"3%" }}
                            imageStyle={{ resizeMode: "stretch" }}
                            resizeMode="stretch"
                        >
                            <View style={{width:"100%", height:"100%", paddingVertical:1, flexDirection:'column', alignItems:'center', justifyContent:'space-between', paddingHorizontal:"12%", paddingVertical:"5%"}}>
                                <Text style={{color:colors.primary.a8, fontFamily:Font.bakh_bold, fontSize:itemWidth*0.05}}>{"جایزه"}</Text>
                                <View style={{flexDirection:'row', alignItems:'center', justifyContent:(reward_coins && reward_subscription)?'space-between':'center', width:"100%"}}>
                                {
                                    reward_coins&&
                                    <View style={{flexDirection:'column', alignItems:'center'}}>
                                        <Text style={{color:colors.primary.a7, fontFamily:Font.bakh_extra_bold, fontSize:itemWidth*0.08}}>{priceDigitSeperator(reward_coins)}</Text>
                                        <Image
                                            style={{height:itemWidth*0.1, width:itemWidth*0.1}}
                                            source={require('../../../assets/image/coin.png')}
                                        />
                                    </View> 
                                }
                                {
                                    reward_subscription&&
                                    <View style={{flexDirection:'column', alignItems:'center'}}>
                                        <Text style={{color:colors.primary.a7, fontFamily:Font.bakh_extra_bold, fontSize:itemWidth*0.08}}>{`${reward_subscription} روز`}</Text>
                                        <Image
                                            style={{height:itemWidth*0.1, width:itemWidth*0.1}}
                                            source={require('../../../assets/image/diamond.png')}
                                        />
                                    </View> 
                                }
                                </View> 
                            </View>
                        </ImageBackground>
                    }
                    <View>
                        
                        
                        <TouchableOpacity onPress={click} activeOpacity={0.7} style={{ alignItems:'center', justifyContent:'center', marginStart:"3%"}}>
                            <ImageBackground
                                source={cardImageButton}
                                style={{ width:itemWidth*0.4, height:itemWidth*0.4, alignItems:'center', justifyContent:'center' }}
                                imageStyle={{ resizeMode: "stretch" }}
                                resizeMode="stretch"
                            >
                                <View style={{ alignItems:'center', justifyContent:'center', height:"100%"}}>
                                    <DynamicProSkiaText 
                                        text={"شروع"}
                                        textColor={colors.primary.a3} 
                                        borderColor={colors.primary.a7} 
                                        borderWidth={1}
                                        fontSize={entry_fee_coins && entry_fee_coins>0?itemWidth*0.075:itemWidth*0.085}
                                    />
                                    {
                                        (entry_fee_coins && entry_fee_coins>0)&&
                                        <View style={{flexDirection:'row', alignItems:'center', justifyContent:'center', gap:2}}>
                                            <Text style={{color:colors.primary.a5, fontFamily:Font.bakh_bold, fontSize:itemWidth*0.06}}>{priceDigitSeperator(entry_fee_coins)}</Text>
                                            <Image
                                                style={{height:itemWidth*0.06, width:itemWidth*0.06}}
                                                source={require('../../../assets/image/coin.png')}
                                            />
                                        </View> 
                                    }
                                </View>
                            </ImageBackground>
                        </TouchableOpacity>
                    </View>
                </View>
            </ImageBackground>
        </TouchableOpacity>
    );
};
const areEqual = (prevProps, nextProps) => {
    return (
        prevProps._id === nextProps._id &&
        prevProps.title === nextProps.title &&
        prevProps.entry_fee_coins === nextProps.entry_fee_coins &&
        prevProps.subscription_required === nextProps.subscription_required &&
        prevProps.reward_coins === nextProps.reward_coins &&
        prevProps.reward_subscription === nextProps.reward_subscription
    );
};

export default memo(KalamAkharChallenge, areEqual);