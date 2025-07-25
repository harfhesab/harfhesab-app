import React, { useState, useImperativeHandle, memo } from 'react';
import { View, Dimensions, TouchableOpacity, Text, ScrollView, StyleSheet} from 'react-native';
import Modal from "react-native-modal";
import Font from '../../utils/Font';
import Toast from 'react-native-toast-message';
import Icon from '../../utils/Icon';
import ButtonBorder from '../buttons/ButtonBorder';
import ButtonGradient from '../buttons/ButtonGradient';
import LinearGradient from 'react-native-linear-gradient';
import LottieView from 'lottie-react-native';
import Border from '../Border';
import CheckBoxItem from '../list-view-items/CheckBoxItem';
import SimpleCenterItem from '../list-view-items/SimpleCenterItem';
import ArrowItem from '../list-view-items/ArrowItem';
import RadioButtonItem from '../list-view-items/RadioButtonItem';
import useAppTheme from '../../hooks/theme/useAppTheme';

const {width, height} = Dimensions.get('window');
const BottomDrawer = React.forwardRef((props, ref)=>{
    const colors = useAppTheme();
    const maxHeight = height*0.9 - 160;
    const [visible, setVisible] = useState(false)
    const [cancelable, setCancelable] = useState(true)
    const [title, setTitle] = useState(null)
    const [buttons, setButtons] = useState(null)
    const [buttonsLoading, setButtonsLoading] = useState(null)
    const [list, setList] = useState([])
    const [listType, setListType] = useState("simple") // radio-button | check-box | arrow | simple
    const [listItemHeight, setListItemHeight] = useState(60)
    const [listItemColor, setListItemColor] = useState(null)
    const [listItemCheckBoxSize, setListItemCheckBoxSize] = useState(null)
    const [listItemRadioButtonSize, setListItemRadioButtonSize] = useState(null)
    const [radioSelected, setRadioSelected] = useState(null)
    const [selectRequired, setSelectRequired] = useState(false)
    


    const open = (dialog)=>{
        setVisible(true)
        setTitle(dialog?.title??null)
        setCancelable(dialog?.options?.cancelable??true)
        setButtons(dialog?.buttons??null)
        setList(dialog?.list??[])
        setListType(dialog?.options?.listType??"simple")
        setListItemHeight(dialog?.options?.listItemHeight??60)
        setListItemColor(dialog?.options?.listItemColor??null)
        setListItemCheckBoxSize(dialog?.options?.listItemCheckBoxSize??null)
        setRadioSelected(dialog?.options?.radioSelected??null)
        setSelectRequired(dialog?.options?.selectRequired??false)
    }
    const close = () => {
        setVisible(false)
        const time = setTimeout(()=>{
            setCancelable(true)
            setTitle(null)
            setButtons(null)
            setButtonsLoading(null)
            setList([])
            setListType("simple")
            setListItemHeight(60)
            setListItemColor(null)
            setListItemCheckBoxSize(null)
            setListItemRadioButtonSize(null)
            setRadioSelected(null)
            clearTimeout(time)
        }, 500)
    }
    useImperativeHandle(ref, ()=>({
        open,
        close
    }))
    const renderArrowItems = ({item, index})=>{
        return(
            <ArrowItem
                key={index?.toString()}
                arrowColor={item?.arrowColor??undefined}
                arrowSize={item?.arrowSize??undefined}
                arrowText={item?.arrowText??undefined}
                arrowTextSize={item?.arrowTextSize??undefined}
                disabled={item?.disabled??undefined}
                fontFamilyText1={item?.fontFamilyText1??undefined}
                fontFamilyText2={item?.fontFamilyText2??undefined}
                fontSizeText1={item?.fontSizeText1??undefined}
                fontSizeText2={item?.fontSizeText2??undefined}
                height={listItemHeight}
                iconColor={item?.iconColor??undefined}
                iconName={item?.iconName??undefined}
                iconSize={item?.iconSize??undefined}
                iconType={item?.iconType??undefined}
                imageLocal={item?.imageLocal??undefined}
                imageSize={item?.imageSize??undefined}
                imageUrl={item?.imageUrl??undefined}
                onPress={item?.onPress}
                paddingHorizontal={20}
                showArrow={item?.showArrow??true}
                text1={item?.text1??undefined}
                text2={item?.text2??undefined}
                width={width}
            />
        )
    }
    const renderSimpleItem = ({item, index})=>{
        return(
            <SimpleCenterItem 
                key={index?.toString()}
                text1={item?.text1}
                colorText1={listItemColor??undefined}
                disabled={item?.disabled??undefined}
                fontFamilyText1={item?.fontFamilyText1??undefined}
                fontSizeText1={item?.fontSizeText1??undefined}
                height={listItemHeight}
                onPress={item?.onPress}
                paddingHorizontal={20}
                width={width}
            />
        )
    }
    const renderCheckBoxItem = ({item, index})=>{
        return(
            <CheckBoxItem
                check={item?.checked == true?true:false}
                checkBoxSize={listItemCheckBoxSize??undefined}
                key={index?.toString()}
                disabled={item?.disabled??undefined}
                fontFamilyText1={item?.fontFamilyText1??undefined}
                fontFamilyText2={item?.fontFamilyText2??undefined}
                fontSizeText1={item?.fontSizeText1??undefined}
                fontSizeText2={item?.fontSizeText2??undefined}
                height={listItemHeight}
                iconColor={item?.iconColor??undefined}
                iconName={item?.iconName??undefined}
                iconSize={item?.iconSize??undefined}
                iconType={item?.iconType??undefined}
                imageLocal={item?.imageLocal??undefined}
                imageSize={item?.imageSize??undefined}
                imageUrl={item?.imageUrl??undefined}
                onPress={()=>{
                    setList(prevList => {
                        const newList = [...prevList];
                        const item = { ...newList[index] };
                        item.checked = item.hasOwnProperty('checked') ? !item.checked : true;
                        newList[index] = item;
                        return newList;
                    });
                    item?.onPress?.()
                }}
                paddingHorizontal={20}
                showArrow={item?.showArrow??true}
                text1={item?.text1??undefined}
                text2={item?.text2??undefined}
                width={width}
            />
        )
    }
    const renderRadioButtonItem = ({item, index})=>{
        return(
            <RadioButtonItem
                selected={radioSelected == index?true:false}
                radioButtonSize={listItemRadioButtonSize??undefined}
                key={index?.toString()}
                disabled={item?.disabled??undefined}
                fontFamilyText1={item?.fontFamilyText1??undefined}
                fontFamilyText2={item?.fontFamilyText2??undefined}
                fontSizeText1={item?.fontSizeText1??undefined}
                fontSizeText2={item?.fontSizeText2??undefined}
                height={listItemHeight}
                iconColor={item?.iconColor??undefined}
                iconName={item?.iconName??undefined}
                iconSize={item?.iconSize??undefined}
                iconType={item?.iconType??undefined}
                imageLocal={item?.imageLocal??undefined}
                imageSize={item?.imageSize??undefined}
                imageUrl={item?.imageUrl??undefined}
                onPress={()=>{
                    setRadioSelected(index)
                    item?.onPress?.()
                }}
                paddingHorizontal={20}
                showArrow={item?.showArrow??true}
                text1={item?.text1??undefined}
                text2={item?.text2??undefined}
                width={width}
            />
        )
    }
    return(
        <Modal
            swipeDirection={cancelable == true?['down']:null}
            swipeThreshold={180}
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
            onSwipeComplete={()=>{
                if(cancelable == true){
                    close()
                }
            }}
            style={{justifyContent:'flex-end', alignItems:'center', margin: 0}}
        >
            <TouchableOpacity activeOpacity={1} style={[styles.modalContainer, {backgroundColor:colors.bottom_drawer.background}]}>
                <View>
                    <View style={{width:width * 0.25, height:4, backgroundColor:colors.border.a1, marginTop:30, marginBottom:15, alignSelf:'center', borderRadius:2}}/>                  
                    {
                        (title && title.length > 0)&&
                        <View style={{width:width, marginBottom:15}}>
                            <Text style={{fontFamily:Font.medium, fontSize:14, textAlign:'center', color:colors.bottom_drawer.text2, marginHorizontal:20}}>{title}</Text>
                            <Border
                                height={0.5}
                                top={15}
                                color={colors.border.a2}
                            />
                        </View>
                    }
                </View>
                <ScrollView style={{maxHeight:maxHeight}}>
                    {
                        list?.length>0&&list.map((item, index)=>(
                            (item?.type == "arrow")?
                            (renderArrowItems({item, index}))
                            :(item?.type == "radio-button")?
                            (renderRadioButtonItem({item, index}))
                            :(item?.type == "check-box")?
                            (renderCheckBoxItem({item, index}))
                            :(item?.type == "simple")?
                            (renderSimpleItem({item, index}))
                            :(listType == "arrow")?
                            (renderArrowItems({item, index}))
                            :(listType == "radio-button")?
                            (renderRadioButtonItem({item, index}))
                            :(listType == "check-box")?
                            (renderCheckBoxItem({item, index}))
                            :
                            (renderSimpleItem({item, index}))
                        ))
                    }
                </ScrollView>
                {
                    (buttons && buttons.length > 0)&&
                    <View style={{width:"100%", flexDirection:'row', alignItems:'center', justifyContent:buttons?.length > 1?"space-between":"center", marginVertical:20, paddingHorizontal:20, gap:10}}>
                        {
                            buttons.map((item, index)=>(
                                (item?.type == "border")?
                                (<ButtonBorder
                                    key={index.toString()}
                                    text={item.text}
                                    text2={item?.text2??undefined}
                                    height={item?.height??60}
                                    width={item?.width??(buttons.length > 1?(width/2) - 20:width-40)}
                                    loading={(item?.loading == true && buttonsLoading == index)?true:false}
                                    onPress={()=>{
                                        item.onPress()
                                        if(item.loading == true){
                                            setButtonsLoading(index)
                                        } else {
                                            close()
                                        }
                                    }}
                                    borderRadius={item?.borderRadius??5}
                                    textSize={item?.textSize??14}
                                    borderColor={item?.color??undefined}
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
                                    height={item?.height??60}
                                    width={item?.width??(buttons.length > 1?(width/2) - 25:width-40)}
                                    loading={(item?.loading == true && buttonsLoading == index)?true:false}
                                    onPress={()=>{
                                        let obj = {}
                                        const radio = typeof radioSelected === 'number'?{radio:radioSelected}:false
                                        const value = list.reduce((acc, item, index) => {
                                            if (item?.checked === true) {
                                                acc.push(index);
                                            }
                                            return acc;
                                        }, []);
                                        const check = value.length > 0 ? {check:value} : false;
                                        Object.assign(obj, radio&&radio, check&&check)
                                        if((selectRequired && listType == "radio-button" && typeof radioSelected !== 'number') || (selectRequired && listType == "check-box" && value.length == 0)){
                                            null
                                        } else {
                                            item.onPress(obj)
                                            if(item.loading == true){
                                                setButtonsLoading(index)
                                            } else {
                                                close()
                                            }
                                        }
                                    }}
                                    borderRadius={item?.borderRadius??5}
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
export default memo(BottomDrawer)