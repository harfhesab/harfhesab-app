import React, { useState, useImperativeHandle, memo, useMemo } from 'react';
import {StyleSheet, View, Dimensions, TouchableOpacity, Text, ImageBackground, FlatList, Platform} from 'react-native';
import Modal from 'react-native-modal';
import Font from '../../utils/Font';
import ButtonGradient from '../buttons/ButtonGradient';
import ButtonBorder from '../buttons/ButtonBorder';
import useAppTheme from '../../hooks/theme/useAppTheme';
import { IS_TABLET_CONDITION } from '../../utils/constants/constants';
import { colors } from '../../hooks/theme/colors';
import Border from '../Border';
import LocalImageComponent from '../image-components/LocalImageComponent';

const {width, height} = Dimensions.get('window');
const ITEM_SIZE = IS_TABLET_CONDITION?(width-105)/6:(width - 100)/4
const Calendar = React.forwardRef((props, ref)=>{
    const maxHeight = height*0.55;
    const colors = useAppTheme();
    const [visible, setVisible] = useState(false)
    const [date, setDate] = useState(null)
    const [callBack, setCallBackC] = useState(null)
    const [current, setCurrent] = useState("year") // year | mounth | day
    const title = current == "year"?"انتخاب سال تولد":current == "mounth"?"انتخاب ماه تولد":current == "day"?"انتخاب روز تولد":""
    const [yearSelected, setYearSelected] = useState(null)
    const [mounthSelected, setMounthSelected] = useState(null)
    const [daySelected, setDaySelected] = useState(null)
    const years = Array.from({ length: 105 }, (_, i) => 1404 - i);
    const mounths = [
        {name: "فروردین", number:"01", numberDays: 31},
        {name: "اردیبهشت", number:"02", numberDays: 31},
        {name: "خرداد", number:"03", numberDays: 31},
        {name: "تیر", number:"04", numberDays: 31},
        {name: "مرداد", number:"05", numberDays: 31},
        {name: "شهریور", number:"06", numberDays: 31},
        {name: "مهر", number:"07", numberDays: 30},
        {name: "آبان", number:"08", numberDays: 30},
        {name: "آذر", number:"09", numberDays: 30},
        {name: "دی", number:"10", numberDays: 30},
        {name: "بهمن", number:"11", numberDays: 30},
        {name: "اسفند", number:"12", numberDays: 29},
    ]
    const [days, setDays] = useState([]);
    const data = current == "year"?years:current == "mounth"?mounths:current == "day"?days:[]


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
            setYearSelected(null)
            setMounthSelected(null)
            setDaySelected(null)
            setCurrent("year")
            clearTimeout(time)
        }, 200)
    }
    useImperativeHandle(ref, ()=>({
        open
    }))
    const onDateChange = (date)=>{
        setDate(date)
    }
    const selectItem = (item)=>{
        if(current == "year"){
            setYearSelected(item)
            setCurrent("mounth")
        } else if(current == "mounth"){
            setMounthSelected(item.number)
            setDays(Array.from({ length: item?.numberDays }, (_, i) => 1 + i))
            setCurrent("day")
        } else if(current == "day"){
            const dayNewFormat = item < 10?`0${item}`:item
            setDaySelected(dayNewFormat)
            const totalSelect = `${yearSelected}/${mounthSelected}/${dayNewFormat}`
            callBack.callBackCalendar(totalSelect)
            close()
        }
    }
    const renderItem = ({item, index})=>{
        return(
            <TouchableOpacity onPress={()=>selectItem(item)} activeOpacity={0.75} key={index.toString()} style={styles.box}>
                <ImageBackground
                    source={require("../../assets/image/circle_red_frame.png")}
                    style={{ width: ITEM_SIZE, height: ITEM_SIZE, alignItems:'center', justifyContent:'center'}}
                    imageStyle={{ resizeMode: "stretch" }}
                    resizeMode="stretch"
                >
                    <Text style={[styles.text, {fontSize:current == "mounth"?12:14}]}>{current == "year"?item:current == "mounth"?item?.name:current == "day"?item:""}</Text>
                </ImageBackground>
                <ImageBackground
                    source={require("../../assets/image/frame_badge.png")}
                    style={{ width: ITEM_SIZE*0.6, height: ITEM_SIZE*0.3, justifyContent: "center", alignItems: "center", position:'absolute', top:-2, alignSelf:'center' }}
                    imageStyle={{ resizeMode: "stretch" }}
                    resizeMode="stretch"
                >
                    <Text numberOfLines={1} style={{color:"#FFF", fontFamily:Font.medium, fontSize:10}}>{current == "year"?"سال":current == "mounth"?"ماه":current == "day"?"روز":""}</Text>
                </ImageBackground>
            </TouchableOpacity>
        )
    }
    const memoizedValue = useMemo(() => renderItem, [data]);
    const keyExtractor = (item,index)=>index.toString()
    return(
        <Modal
            swipeThreshold={200}
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
                    <View style={{width:width, flexDirection:'row', alignItems:'flex-start', justifyContent:'space-between', paddingHorizontal:15, paddingTop:15}}>
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={()=>{
                                if(current == "day"){
                                    setCurrent("mounth")
                                } else if(current == "mounth"){
                                    setCurrent("year")
                                } else {
                                    close()
                                }
                            }}
                        >
                            <LocalImageComponent
                                path={require('../../assets/image/back.png')}
                                width={35}
                                height={35}
                                resizeMode={'stretch'}
                                blank_background={true}
                            />
                        </TouchableOpacity>
                        <ImageBackground
                            source={require("../../assets/image/frame_title.png")}
                            style={{ width: 180, height: 35, alignItems:'center', justifyContent:'center', marginTop:20}}
                            imageStyle={{ resizeMode: "stretch" }}
                            resizeMode="stretch"
                        >
                            <Text style={{fontFamily:Font.medium, fontSize:12, color:colors.text.a1}}>{title}</Text>
                        </ImageBackground>
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={close}
                        >
                            <LocalImageComponent
                                path={require('../../assets/image/close.png')}
                                width={35}
                                height={35}
                                resizeMode={'stretch'}
                                blank_background={true}
                            />
                        </TouchableOpacity>
                    </View>
                    
                     <Border
                        height={0.5}
                        top={15}
                        color={colors.border.a1}
                    />
                </View>
                <FlatList
                    keyExtractor={keyExtractor}
                    data={data}
                    numColumns={IS_TABLET_CONDITION?6:4}
                    renderItem={memoizedValue}
                    onEndReachedThreshold={0.5}
                    removeClippedSubviews={Platform.OS == 'ios' ? false : true}
                    contentContainerStyle={styles.container}
                    style={{height:maxHeight, paddingHorizontal:20}}
                    columnWrapperStyle={{justifyContent:'space-between', gap:20}}
                />
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
        fontFamily:Font.black,
        color:colors.text.a2
    },
});
export default memo(Calendar)