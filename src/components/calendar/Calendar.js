import React, { useState, useImperativeHandle, memo } from 'react';
import {StyleSheet, View, Dimensions, TouchableOpacity, ScrollView} from 'react-native';
import Modal from "react-native-modal";
import Font from '../../utils/Font';
import Toast from 'react-native-toast-message';
import ButtonGradient from '../buttons/ButtonGradient';
import ButtonBorder from '../buttons/ButtonBorder';
import useAppTheme from '../../hooks/theme/useAppTheme';

const {width, height} = Dimensions.get('window');
const Calendar = React.forwardRef((props, ref)=>{
    const maxHeight = height*0.75 - 160;
    const colors = useAppTheme();
    const [visible, setVisible] = useState(false)
    const [date, setDate] = useState(null)
    const [callBack, setCallBackC] = useState(null)

    const open = (options)=>{
        setVisible(true)
        if(options){
            setCallBackC(options.callBack)
        }
    }
    const close = () => {
        setVisible(false)
        const time = setTimeout(()=>{
            setCallBackC(null)
            clearTimeout(time)
        }, 200)
    }
    useImperativeHandle(ref, ()=>({
        open
    }))
    const onDateChange = (date)=>{
        setDate(date)
    }
    const selectDate = ()=>{
        if(!date){
            Toast.show({
                text1:'هیچ تاریخی انتخاب نکرده‌اید',
                type:'error',
            })
        } else {
            callBack.callBackCalendar(date)
            close()
        }
    }
    return(
        <Modal
            swipeDirection={['down']}
            swipeThreshold={180}
            animationIn="slideInUp"
            animationOut="slideOutDown"
            animationInTiming={400}
            animationOutTiming={400}
            backdropOpacity={0.7}
            isVisible={visible}
            onBackdropPress={close}
            useNativeDriverForBackdrop={true}
            onBackButtonPress={close}
            onSwipeComplete={close}
            style={{justifyContent:'flex-end', alignItems:'center', margin: 0}}
        >
            <TouchableOpacity activeOpacity={1} style={[styles.modalContainer, {backgroundColor:colors.bottom_drawer.background}]}>
                <View>
                    <View style={{width:width * 0.25, height:4, backgroundColor:colors.border.a1, marginTop:30, marginBottom:15, alignSelf:'center', borderRadius:2}}/>                  
                    
                </View>
                <ScrollView style={{maxHeight:maxHeight}}>
                    
                </ScrollView>
                <View style={{width:width, alignItems:'center', flexDirection:'row', justifyContent:'space-between', paddingHorizontal:15, paddingBottom:10, paddingTop:10, height:70, borderTopColor:colors.border, borderTopWidth:0.3, zIndex:1000, backgroundColor:colors.background2}}>
                        <ButtonBorder
                            text={'لغو'}
                            onPress={close}
                            loading={false}
                            textSize={14}
                            width={width/2 - 20}
                            height={50}
                            borderRadius={5}
                        />
                        <ButtonGradient
                            text={'انتخاب تاریخ'}
                            onPress={selectDate}
                            loading={false}
                            textSize={14}
                            width={width/2 - 20}
                            height={50}
                            borderRadius={5}
                        />
                </View>
            </TouchableOpacity>   
        </Modal>
    )
})
const styles = StyleSheet.create({
    modalContainer:{
      width:width,
      borderRadius:5,
      alignSelf:'center',
      verticalAlign:'flex-end',
      borderTopLeftRadius:20,
      borderTopRightRadius:20,
    },
});
export default memo(Calendar)