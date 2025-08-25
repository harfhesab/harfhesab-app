import React, { useState, useImperativeHandle, memo } from 'react';
import { View, Dimensions, TouchableOpacity, Text, ScrollView, I18nManager} from 'react-native';
import Modal from "react-native-modal";
import Font from '../../../../utils/Font';
import Toast from 'react-native-toast-message';
import Icon from '../../../../utils/Icon';
import ButtonGradient from '../../../buttons/ButtonGradient';
import LinearGradient from 'react-native-linear-gradient';
import LottieView from 'lottie-react-native';
import useAppTheme from '../../../../hooks/theme/useAppTheme';
import AdsButton from '../../../buttons/AdsButton';
import MultiLineTextGradientSvg from '../../../text-components/MultiLineTextGradientSvg';

const {width, height} = Dimensions.get('window');
const GameAlert = React.forwardRef((props, ref)=>{
    const colors = useAppTheme();
    const contentWidth = width-50;
    const [visible, setVisible] = useState(false)
    const [cancelable, setCancelable] = useState(false)
    const [type, setType] = useState("success")
    const [buttons, setButtons] = useState(null)
    const [title, setTitle] = useState(null)
    const [admiration, setAdmiration] = useState(null)
    const [description, setDescription] = useState(null)
    const [completedSentences, setCompletedSentences] = useState(null)
    


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
                            title?.length > 0&&
                            <View style={{alignItems:'center', width:"100%", justifyContent:'center', paddingHorizontal:20, paddingVertical:10, backgroundColor:`${colors.primary.a1}20`, borderTopStartRadius:15, borderTopEndRadius:15}}>
                                {title?.length > 0&&<Text style={{fontFamily:Font.bakh_extra_black, fontSize:22, color:colors.text.a1, textAlign:'center'}}>{title}</Text>}
                            </View>
                        }
                        <View style={{width:contentWidth, alignItems:'center'}}>
                            <LottieView
                                style={{width:contentWidth, height: 120}}
                                source={type === 'success' ?
                                    require('../../../../assets/lottie/successful.json')
                                    :type === 'warning' &&
                                    require('../../../../assets/lottie/warn.json')
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
                                {description?.length > 0&&<Text style={{fontFamily:Font.bakh_regular, fontSize:12, color:colors.text.a3, textAlign:'center'}}>{description}</Text>}
                                {
                                    completedSentences?.length > 0&&
                                    <View style={{width:"100%", alignItems:'center', gap:10, paddingVertical:60}}>
                                        {
                                            completedSentences.map((item, index)=>(
                                                <MultiLineTextGradientSvg
                                                    key={index.toString()}
                                                    text={item}
                                                    fontFamily={Font.bakh_black}
                                                    glowBlur={10}
                                                    glowColor={'#FFFFFF90'}
                                                    glowShadow={true}
                                                    fontSize={25}
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
const areEqual = (prevProps, nextProps) => {
  return true;
};
export default memo(GameAlert, areEqual)