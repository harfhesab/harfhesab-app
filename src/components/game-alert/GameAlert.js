import React, { useState, useImperativeHandle, memo } from 'react';
import { View, Dimensions, TouchableOpacity, Text, ScrollView, I18nManager, Image} from 'react-native';
import Modal from "react-native-modal";
import Font from '../../utils/Font';
import Icon from '../../utils/Icon';
import ButtonGradient from '../buttons/ButtonGradient';
import LinearGradient from 'react-native-linear-gradient';
import LottieView from 'lottie-react-native';
import useAppTheme from '../../hooks/theme/useAppTheme';
import AdsButton from '../buttons/AdsButton';
import MultiLineTextGradientSvg from '../text-components/MultiLineTextGradientSvg';
import { increaseNumberCoins } from '../../redux/slices/coinSlice';
import { useDispatch } from "react-redux";

const {width, height} = Dimensions.get('window');
const GameAlert = React.forwardRef((props, ref)=>{
    const colors = useAppTheme();
    const dispatch = useDispatch();
    const contentWidth = width-50;
    const [visible, setVisible] = useState(false)
    const [cancelable, setCancelable] = useState(false)
    const [type, setType] = useState("success")
    const [buttons, setButtons] = useState(null)
    const [title, setTitle] = useState(null)
    const [admiration, setAdmiration] = useState(null)
    const [description, setDescription] = useState(null)
    const [completedSentences, setCompletedSentences] = useState(null)
    const [reward, setReward] = useState(null)
    


    const open = (dialog)=>{
        setVisible(true)
        setTimeout(()=>{
            {dialog?.title&&setTitle(dialog?.title)}
            {dialog?.admiration&&setAdmiration(dialog?.admiration)}
            {dialog?.description&&setDescription(dialog?.description)}
            {dialog?.completedSentences&&setCompletedSentences(dialog?.completedSentences)}
            {dialog?.options?.cancelable&&setCancelable(dialog?.options?.cancelable)}
            {dialog?.options?.type&&setType(dialog.options.type)}
            {dialog?.buttons?.length>0&&setButtons(dialog?.buttons)}
            if(dialog.options?.reward){
                setReward(dialog.options?.reward)
                dispatch(increaseNumberCoins({number:dialog.options?.reward}))
            }
        }, 200)
    }
    const close = () => {
        setVisible(false)
        setTimeout(() => {
            setCancelable(false)
            setType("success")
            setButtons(null)
            setTitle(null)
            setAdmiration(null)
            setDescription(null)
            setCompletedSentences(null)
            setReward(null)
        }, 400)
    }
    useImperativeHandle(ref, ()=>({
        open
    }))
    return(
        <Modal
                animationIn={'fadeIn'}
                animationOut={'fadeOut'}
                backdropOpacity={0.2}
                isVisible={visible}
                onBackdropPress={()=>{
                    if(cancelable == true){
                        close()
                    }
                }}
                useNativeDriverForBackdrop={true}
                onBackButtonPress={()=>{
                    if(cancelable == true){
                        close()
                    }
                }}
            >
                <View style={{direction:I18nManager.isRTL?'rtl':'ltr', flex: 1, alignItems: "center", justifyContent: "center"}}>
                    <View style={{width: contentWidth, backgroundColor:colors.alert_component.background, borderRadius: 15, alignItems: "center"}}>
                        {
                            title&&
                            <View style={{flexDirection:'row', alignItems:'center', width:"100%", justifyContent:reward?'space-between':'center', paddingHorizontal:15, paddingVertical:10, backgroundColor:`${colors.primary.a1}20`, borderTopStartRadius:15, borderTopEndRadius:15}}>
                                <Text style={{fontFamily:Font.iran_yekan_black_fa, fontSize:20, color:colors.text.a1}}>{title}</Text>
                                {
                                    reward&&
                                    <View style={{flexDirection:'row', alignItems:'center', justifyContent:'center', gap:5}}>
                                        <Image
                                            style={{width:20, height:20}}
                                            source={require('../../assets/image/coin.png')}
                                        />
                                        <Text style={{fontSize:20, fontFamily:Font.iran_yekan_black_fa, color:colors.text.a1}}>{`${reward}+`}</Text>
                                    </View>
                                }
                            </View>
                        }
                        <View style={{width:contentWidth, alignItems:'center', paddingTop:20}}>
                            <LottieView
                                style={{width:contentWidth, height: 150}}
                                source={type === 'success' ?
                                    require('../../assets/lottie/successful.json')
                                    :type === 'unlocked' &&
                                    require('../../assets/lottie/unlocked.json')
                                }
                                autoPlay
                                loop={false}
                            />
                        </View>
                        <View style={{ maxHeight: 400, justifyContent: 'center', alignItems: 'center', paddingVertical: 15, paddingHorizontal:15, width:contentWidth}}>
                            <ScrollView
                                style={{ flexGrow: 0 }}
                                contentContainerStyle={{width:"100%", alignItems:'center'}}
                            >
                                {admiration?.length > 0&&<Text style={{fontFamily:Font.bakh_bold, fontSize:18, color:colors.text.a2, textAlign:'center'}}>{admiration}</Text>}
                                {description?.length > 0&&<Text style={{fontFamily:Font.bakh_regular, fontSize:14, color:colors.text.a3, textAlign:'center', marginTop:5}}>{description}</Text>}
                                {
                                    completedSentences?.length > 0&&
                                    <View style={{width:"100%", alignItems:'center', gap:10, paddingVertical:30}}>
                                        {
                                            completedSentences.map((item, index)=>(
                                                <MultiLineTextGradientSvg
                                                    key={index.toString()}
                                                    text={item}
                                                    fontFamily={Font.iran_yekan_extra_bold}
                                                    glowBlur={10}
                                                    glowColor={'#FFFFFF90'}
                                                    glowShadow={true}
                                                    fontSize={18}
                                                    shadowBlur={5}
                                                    dropShadow={true}
                                                    shadowColor={'#00000095'}
                                                    colors={['#ffc107', '#ff9800', '#ff5722']}
                                                />
                                            ))
                                        }
                                    </View>
                                }
                            </ScrollView>
                        </View>
                        {
                            (buttons && buttons.length > 0)&&
                            <View style={{width:"100%", flexDirection:'row', alignItems:'center', justifyContent:'center', gap:10, paddingVertical:10, paddingHorizontal:10, backgroundColor:`${colors.primary.a1}20`, borderBottomEndRadius:15, borderBottomStartRadius:15}}>
                                {
                                    buttons.map((item, index)=>(
                                        
                                        (item?.type == "bold")?
                                        (<ButtonGradient
                                            key={index.toString()}
                                            text={item.text}
                                            height={55}
                                            width={(buttons.length > 1?contentWidth-210:contentWidth-30)}
                                            loading={false}
                                            onPress={()=>{
                                                item.onPress()
                                                close()
                                            }}
                                            borderRadius={10}
                                            fontFamily={Font.bakh_extra_bold}
                                            textSize={22}
                                        />)
                                        :(item?.type == "ads")&&
                                        (<AdsButton
                                            key={index.toString()}
                                            width={180}
                                            fontFamily={Font.bakh_extra_bold}
                                            reward={item?.reward}
                                        />)
                                    ))
                                }
                            </View>
                        }
                    </View>
                </View>
            </Modal>
    )
})
export default memo(GameAlert)