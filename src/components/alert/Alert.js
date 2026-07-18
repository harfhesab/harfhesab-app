import React, { useState, useImperativeHandle, memo } from 'react';
import { View, Dimensions, TouchableOpacity, Text, ScrollView} from 'react-native';
import Modal from "react-native-modal";
import Font from '../../utils/Font';
import Icon from '../../utils/Icon';
import ButtonBorder from '../buttons/ButtonBorder';
import ButtonGradient from '../buttons/ButtonGradient';
import LinearGradient from 'react-native-linear-gradient';
import LottieView from 'lottie-react-native';
import useAppTheme from '../../hooks/theme/useAppTheme';

const {width, height} = Dimensions.get('window');
const Alert = React.forwardRef((props, ref)=>{
    const colors = useAppTheme();
    const contentWidth = width-60;
    const [visible, setVisible] = useState(false)
    const [cancelable, setCancelable] = useState(true)
    const [type, setType] = useState("info")
    const [buttons, setButtons] = useState(null)
    const [iconName, setIconName] = useState(null)
    const [iconType, setIconType] = useState(null)
    const [iconColor, setIconColor] = useState(null)
    const [body, setBody] = useState("")
    const [bodyAlign, setBodyAlign] = useState(null)
    const [textAlign, setTextAlign] = useState(null)
    const [lineHeight, setlineHeight] = useState(null)
    const [bodyTextSize, setBodyTextSize] = useState(null)
    const [bodyFontFamily, setBodyFontFamily] = useState(null)
    


    const open = (dialog)=>{
        setVisible(true)
        setCancelable(dialog?.options?.cancelable??true)
        setType(dialog?.options?.type??"info")
        setButtons(dialog?.buttons??null)
        setIconName(dialog?.options?.iconName??null)
        setIconType(dialog?.options?.iconType??null)
        setIconColor(dialog?.options?.iconColor??null)
        setBody(dialog?.body??"")
        setBodyAlign(dialog?.options?.bodyAlign??null)
        setTextAlign(dialog?.options?.textAlign??null)
        setlineHeight(dialog?.options?.lineHeight??null)
        setBodyTextSize(dialog?.options?.bodyTextSize??null)
        setBodyFontFamily(dialog?.options?.bodyFontFamily??null)
    }
    const close = () => {
        setVisible(false)
        const time = (()=>{
            setCancelable(true)
            setType("info")
            setButtons(null)
            setIconName(null)
            setIconType(null)
            setIconColor(null)
            setBody("")
            setBodyAlign(null)
            setTextAlign(null)
            setlineHeight(null)
            setBodyTextSize(null)
            setBodyFontFamily(null)
        }, 400)
    }
    useImperativeHandle(ref, ()=>({
        open
    }))
    if (!visible) return null;
    return(
        <Modal
                animationIn={'fadeIn'}
                animationOut={'fadeOut'}
                backdropOpacity={0.7}
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
                <View style={{flex: 1, alignItems: "center", justifyContent: "center", padding: 40}}>
                    <View style={{width: contentWidth, margin: 20, backgroundColor:colors.alert_component.background, borderRadius: 10, alignItems: "center"}}>
                        <View
                            style={{width: contentWidth, height: 80, borderRadius: 10, borderTopRightRadius: 10, shadowColor: colors.shadow.a1, shadowOffset: { height: 1, width: 1 }, shadowOpacity: 1, shadowRadius: 2, elevation: 5}}>
                            <LinearGradient
                                style={{width: contentWidth, height: 80, borderRadius: 10, borderTopRightRadius: 10}}
                                colors={colors.alert_component[type]}
                            />
                        </View>
                        <View
                            style={{width: 100, height: 100, borderRadius: 50, backgroundColor: colors.alert_component.background, marginTop: 10, alignItems: "center", justifyContent: "center", position: 'absolute', shadowColor: colors.shadow.a1, shadowOffset: { height: 1, width: 1 }, shadowOpacity: 1, shadowRadius: 2, elevation: 5, borderWidth:3, borderColor:colors.border.a1}}
                        >
                            {
                                (iconName && iconType)?
                                (<Icon name={iconName} type={iconType} style={{fontSize:40, color:iconColor??colors.text.a2}}/>)
                                :
                                (<LottieView
                                    style={{width: 100, height: 100}}
                                    source={type === 'success' ?
                                        require('../../assets/lottie/success.json')
                                        :
                                        type === 'error' ?
                                            require('../../assets/lottie/alert.json')
                                            :
                                            type === 'info' ?
                                                require('../../assets/lottie/info.json')
                                                :
                                                type === 'warning' ?
                                                    require('../../assets/lottie/warn.json')
                                                    :
                                                    type === 'question' ?
                                                        require('../../assets/lottie/question.json')
                                                        :
                                                        require('../../assets/lottie/info.json')
                                    }
                                    autoPlay
                                    loop={false}
                                />)
                               
                            }
                        </View>
                        <View style={{ maxHeight: 300, justifyContent: 'center', alignItems: 'center', paddingVertical: 15, paddingHorizontal:15, marginTop: 15, width:contentWidth}}>
                            <ScrollView
                                style={{ flexGrow: 0 }}
                                contentContainerStyle={{width:"100%", alignItems:bodyAlign??'center'}}
                            >
                                <Text style={{fontSize:bodyTextSize??14, fontFamily:bodyFontFamily??Font.medium, color:colors.text.a2, textAlign:textAlign??'center', marginVertical:10, lineHeight:lineHeight??32}}>{body}</Text>
                            </ScrollView>
                        </View>
                        {
                            (buttons && buttons.length > 0)&&
                            <View style={{width:"100%", flexDirection:'row', alignItems:'center', justifyContent:!buttons[0]?.type?"flex-end":'center', gap:!buttons[0]?.type?30:10, marginBottom:15, paddingHorizontal:15}}>
                                {
                                    buttons.map((item, index)=>(
                                        (item?.type == "border")?
                                        (<ButtonBorder
                                            key={index.toString()}
                                            text={item.text}
                                            height={item?.height??40}
                                            width={item?.width??(buttons.length > 1?(contentWidth/2) - 20:(contentWidth/2)+20)}
                                            loading={false}
                                            onPress={()=>{
                                                item.onPress()
                                                close()
                                            }}
                                            borderRadius={item?.borderRadius??5}
                                            textSize={item?.textSize??14}
                                            borderColor={item?.color??undefined}
                                        />)
                                        :(item?.type == "bold")?
                                        (<ButtonGradient
                                            key={index.toString()}
                                            text={item.text}
                                            height={item?.height??40}
                                            width={item?.width??(buttons.length > 1?(contentWidth/2) - 20:(contentWidth/2)+20)}
                                            loading={false}
                                            onPress={()=>{
                                                item.onPress()
                                                close()
                                            }}
                                            borderRadius={item?.borderRadius??5}
                                            textSize={item?.textSize??14}
                                        />)
                                        :
                                        (<TouchableOpacity
                                            key={index.toString()}
                                            activeOpacity={0.6}
                                            onPress={()=>{
                                                item.onPress()
                                                close()
                                            }}
                                            style={{alignItems:'center', justifyContent:'center'}}
                                        >
                                            <Text style={{fontFamily:Font.bold, fontSize:item?.textSize??16, color:item?.color??colors.primary.a1, textAlign:'center'}}>{item.text}</Text>
                                        </TouchableOpacity>)
                                    ))
                                }
                            </View>
                        }
                    </View>
                </View>
            </Modal>
    )
})
export default memo(Alert)