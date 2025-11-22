import React, { useState, useImperativeHandle, memo } from 'react';
import { View, Dimensions, Text, ScrollView, StyleSheet} from 'react-native';
import Modal from "react-native-modal";
import Font from '../../utils/Font';
import Icon from '../../utils/Icon';
import ButtonBorder from '../buttons/ButtonBorder';
import ButtonGradient from '../buttons/ButtonGradient';
import Border from '../Border';
import useAppTheme from '../../hooks/theme/useAppTheme';
import { IS_TABLET_CONDITION } from '../../utils/constants/constants';


const {width, height} = Dimensions.get('window');
const AlertBottomDrawer = React.forwardRef((props, ref)=>{
    const colors = useAppTheme();
    const maxHeight = height*0.9 - 160;
    const [visible, setVisible] = useState(false)
    const [cancelable, setCancelable] = useState(true)
    const [title, setTitle] = useState(null)
    const [message, setMessage] = useState([])
    const [buttons, setButtons] = useState(null)
    const [buttonsLoading, setButtonsLoading] = useState(null)
    const [icon, setIcon] = useState(null)
    


    const open = (dialog)=>{
        setVisible(true)
        const time = setTimeout(()=>{
            setTitle(dialog?.title??null)
            setMessage(dialog?.message??[])
            setCancelable(dialog?.options?.cancelable??true)
            setButtons(dialog?.buttons??null)
            setIcon(dialog?.options?.icon??null)
        }, 200)
    }
    const close = () => {
            setVisible(false)
            const time = setTimeout(()=>{
                setCancelable(true)
                setTitle(null)
                setMessage([])
                setButtons(null)
                setButtonsLoading(null)
            }, 400)
    }
    useImperativeHandle(ref, ()=>({
        open,
        close
    }))
    
    return(
        visible == true&&
        <Modal
            swipeDirection={cancelable == true?['down']:null}
            swipeThreshold={180}
            animationIn="slideInUp"
            animationOut="slideOutDown"
            animationInTiming={400}
            animationOutTiming={400}
            backdropOpacity={0.7}
            isVisible={visible}
            onBackdropPress={()=>{
                if(cancelable){
                    close()
                }
            }}
            useNativeDriverForBackdrop={true}
            onBackButtonPress={()=>{
                if(cancelable){
                    close()
                }
            }}
            onSwipeComplete={()=>{
                if(cancelable){
                    close()
                }
            }}
            style={{justifyContent:'flex-end', alignItems:'center', margin: 0}}
        >
            <View style={[styles.modalContainer, {backgroundColor:colors.bottom_drawer.background}]}>
                <View>
                    <View style={{width:width * 0.25, height:4, backgroundColor:colors.border.a1, marginTop:30, marginBottom:5, alignSelf:'center', borderRadius:2}}/>                  
                    {
                        (title && title.length > 0)&&
                        <View style={{width:width, marginBottom:40, alignItems:'center', gap:20}}>
                            <Text style={{fontFamily:Font.medium, fontSize:12, textAlign:'center', color:colors.bottom_drawer.text2, marginHorizontal:20}}>{title}</Text>
                            {icon&&<icon.Icon/>}
                        </View>
                    }
                </View>
                <ScrollView
                    style={{maxHeight:maxHeight}}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={{flexDirection:'column', paddingHorizontal:15, gap:15, paddingTop:15, paddingBottom:30}}>
                        {
                            message?.length > 0&&message.map((item, index)=>(
                                <View key={index.toString()} style={{flexDirection:'row', alignItems:'flex-start', width:"100%", gap:10}}>
                                    {item.Icon&&<item.Icon/>}
                                    <Text style={item?.style??{fontFamily:Font.medium, fontSize:14, color:colors.text.a2, alignSelf:'center', textAlign:'center', lineHeight:20}}>{item.text}</Text>
                                </View>
                            ))
                        }
                    </View>
                </ScrollView>
                {
                    (buttons && buttons.length > 0)&&
                    <View style={{width:"100%", flexDirection:'row', backgroundColor:"#33333385", borderTopColor:colors.border.a1, borderTopWidth:1, paddingVertical:15, alignItems:'center', justifyContent:buttons?.length > 1?"space-between":"center", paddingHorizontal:buttons.length>1?15:20, gap:10}}>
                        {
                            buttons.map((item, index)=>(
                                (item?.type == "border")?
                                (<ButtonBorder
                                    key={index.toString()}
                                    text={item.text}
                                    text2={item?.text2??undefined}
                                    height={item?.height??55}
                                    width={item?.width??(buttons.length > 1?(width/2) - 20:width-40)}
                                    loading={(item?.loading == true && buttonsLoading == index)?true:false}
                                    onPress={()=>{
                                        item.onPress()
                                        if(item.loading == true){
                                            setButtonsLoading(index)
                                        } else if(!item?.stayOpen){
                                            close()
                                        }
                                    }}
                                    borderRadius={item?.borderRadius??10}
                                    textSize={item?.textSize??14}
                                    borderColor={item?.color??colors.alert.a1}
                                    iconName={item?.iconName??undefined}
                                    iconType={item?.iconType??undefined}
                                    iconSize={item?.iconSize??undefined}
                                    justifyContent={item?.justifyContent??undefined}
                                    flexDirection={item?.flexDirection??undefined}
                                />)
                                :(item?.type == "bold")&&
                                (<ButtonGradient
                                    key={index.toString()}
                                    text={item.text}
                                    text2={item?.text2??undefined}
                                    height={item?.height??55}
                                    width={item?.width??(buttons.length > 1?(width/2) - 25:width-40)}
                                    loading={(item?.loading == true && buttonsLoading == index)?true:false}
                                    onPress={()=>{
                                        item.onPress()
                                        if(item.loading == true){
                                            setButtonsLoading(index)
                                        } else if(!item?.stayOpen){
                                            close()
                                        }
                                    }}
                                    borderRadius={item?.borderRadius??10}
                                    textSize={item?.textSize??16}
                                    backgorundGradinte={item?.color??undefined}
                                    iconName={item?.iconName??undefined}
                                    iconType={item?.iconType??undefined}
                                    iconSize={item?.iconSize??undefined}
                                    justifyContent={item?.justifyContent??undefined}
                                    flexDirection={item?.flexDirection??undefined}
                                />)
                            ))
                        }
                    </View>
                }
            </View>   
        </Modal>
    )
})
const styles = StyleSheet.create({
    modalContainer:{
      width:width,
      borderRadius:5,
      alignSelf:'center',
      verticalAlign:'flex-end',
      borderTopLeftRadius:30,
      borderTopRightRadius:30,
    },
});
export default memo(AlertBottomDrawer)