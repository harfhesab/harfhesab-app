import React, { useState, useImperativeHandle, memo, useMemo } from 'react';
import {StyleSheet, View, Dimensions, TouchableOpacity, Text, ImageBackground, FlatList, Platform} from 'react-native';
import Modal from "react-native-modal";
import Font from '../../utils/Font';
import Toast from 'react-native-toast-message';
import ButtonGradient from '../buttons/ButtonGradient';
import ButtonBorder from '../buttons/ButtonBorder';
import useAppTheme from '../../hooks/theme/useAppTheme';
import { IS_TABLET_CONDITION } from '../../utils/constants/constants';
import { colors } from '../../hooks/theme/colors';
import Border from '../Border';

const {width, height} = Dimensions.get('window');
const ITEM_SIZE = IS_TABLET_CONDITION?(width-105)/6:(width - 100)/4
const Calendar = React.forwardRef((props, ref)=>{
    const maxHeight = height - 250;
    const colors = useAppTheme();
    const [visible, setVisible] = useState(false)
    const [date, setDate] = useState(null)
    const [callBack, setCallBackC] = useState(null)
    const [current, setCurrent] = useState("year") // year | mounth | day
    const title = current == "year"?"انتخاب سال تولد":current == "mounth"?"انتخاب ماه تولد":current == "day"?"انتخاب روز تولد":""
    const years = Array.from({ length: 105 }, (_, i) => 1404 - i);
    const mounth = [
        {}
    ]


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
    const renderItem = ({item, index})=>{
        return(
            <TouchableOpacity activeOpacity={0.75} key={index.toString()} style={styles.box}>
                <ImageBackground
                    source={require("../../assets/image/circle_red_frame.png")}
                    style={{ width: ITEM_SIZE, height: ITEM_SIZE, alignItems:'center', justifyContent:'center'}}
                    imageStyle={{ resizeMode: "stretch" }}
                    resizeMode="stretch"
                >
                    <Text style={styles.text}>{item}</Text>
                </ImageBackground>
                <ImageBackground
                    source={require("../../assets/image/frame_badge.png")}
                    style={{ width: ITEM_SIZE*0.6, height: ITEM_SIZE*0.3, justifyContent: "center", alignItems: "center", position:'absolute', top:-2, alignSelf:'center' }}
                    imageStyle={{ resizeMode: "stretch" }}
                    resizeMode="stretch"
                >
                    <Text numberOfLines={1} style={{color:"#FFF", fontFamily:Font.medium, fontSize:10}}>{"سال"}</Text>
                </ImageBackground>
            </TouchableOpacity>
        )
    }
    const memoizedValue = useMemo(() => renderItem, [years]);
    const keyExtractor = (item,index)=>index.toString()
    return(
        <Modal
            swipeDirection={null}
            swipeThreshold={180}
            animationIn="slideInUp"
            animationOut="slideOutDown"
            animationInTiming={400}
            animationOutTiming={400}
            backdropOpacity={0.7}
            isVisible={visible}
            onBackdropPress={close}
            useNativeDriverForBackdrop={true}
            propagateSwipe={true}
            onBackButtonPress={close}
            onSwipeComplete={close}
            style={{justifyContent:'flex-end', alignItems:'center', margin: 0}}
        >
            <View activeOpacity={1} style={[styles.modalContainer, {backgroundColor:colors.bottom_drawer.background}]}>
                <View>
                    <View style={{width:width * 0.25, height:4, backgroundColor:colors.border.a1, marginTop:30, marginBottom:10, alignSelf:'center', borderRadius:2}}/>                  
                    <Text style={{fontFamily:Font.medium, fontSize:14, color:colors.text.a1, textAlign:'center'}}>{title}</Text>
                     <Border
                        height={0.5}
                        top={15}
                        color={colors.border.a1}
                    />
                </View>
                <FlatList
                    keyExtractor={keyExtractor}
                    data={years}
                    numColumns={IS_TABLET_CONDITION?6:4}
                    renderItem={memoizedValue}
                    onEndReachedThreshold={0.5}
                    removeClippedSubviews={Platform.OS == 'ios' ? false : true}
                    contentContainerStyle={styles.container}
                    style={{maxHeight:maxHeight, paddingHorizontal:20}}
                    columnWrapperStyle={{justifyContent:'space-between', gap:20}}
                />
                <View style={{width:width, alignItems:'center', flexDirection:'row', justifyContent:'space-between', paddingHorizontal:15, paddingBottom:10, paddingTop:10, height:75, borderTopColor:colors.border, borderTopWidth:0.3, zIndex:1000, backgroundColor:colors.background2}}>
                        <ButtonBorder
                            text={'لغو'}
                            onPress={close}
                            loading={false}
                            textSize={14}
                            width={width/2 - 20}
                            height={55}
                            borderRadius={10}
                        />
                        <ButtonGradient
                            text={'انتخاب تاریخ'}
                            onPress={selectDate}
                            loading={false}
                            textSize={14}
                            width={width/2 - 20}
                            height={55}
                            borderRadius={10}
                        />
                </View>
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
        borderTopLeftRadius:20,
        borderTopRightRadius:20,
    },
    container: {
        rowGap:15,
        paddingVertical:20,
    },
    box: {
        alignItems: "center",
        justifyContent: "center",
    },
    text: {
        fontSize: 14,
        fontFamily:Font.black,
        color:colors.text.a2
    },
});
export default memo(Calendar)