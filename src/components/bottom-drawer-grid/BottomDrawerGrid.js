import React, { useState, useImperativeHandle, memo, useRef } from 'react';
import { View, Dimensions, TouchableOpacity, Text, StyleSheet, NativeModules, ScrollView} from 'react-native';
import Modal from 'react-native-modal';
import Font from '../../utils/Font';
import Icon from '../../utils/Icon';
import ButtonBorder from '../buttons/ButtonBorder';
import ButtonGradient from '../buttons/ButtonGradient';
import Border from '../Border';
import useAppTheme from '../../hooks/theme/useAppTheme';
import { IS_TABLET_CONDITION } from '../../utils/constants/constants';
import GridItem from '../list-view-items/GridItem';
import Toast from '../custom-toast/Toast';

const { ImmersiveMode } = NativeModules;
const BottomDrawerGrid = React.forwardRef((props, ref)=>{
    const { width, height } = ImmersiveMode.isImmersiveModeActive()? Dimensions.get('screen'): Dimensions.get('window');
    const localToastRef = useRef(null);
    const colors = useAppTheme();
    const maxHeight = height*0.9 - 160;
    const gridSize = IS_TABLET_CONDITION?(width-75)/4:(width-45)/2
    const [visible, setVisible] = useState(false)
    const [cancelable, setCancelable] = useState(true)
    const [title, setTitle] = useState(null)
    const [buttons, setButtons] = useState(null)
    const [buttonsLoading, setButtonsLoading] = useState(null)
    const [list, setList] = useState([])
    const [numberSelectable, setNumberSelectable] = useState(1)
    const [extendedState, setExtendedState] = useState({
        _id: [],
        text1: [],
    });
    const [selectRequired, setSelectRequired] = useState(false)
    


    const open = (dialog)=>{
        setVisible(true)
        const time = setTimeout(()=>{
            setTitle(dialog?.title??null)
            setCancelable(dialog?.options?.cancelable??true)
            setButtons(dialog?.buttons??null)
            setList(dialog?.list??[])
            setNumberSelectable(dialog?.options?.numberSelectable)
            dialog?.options?.previousSelected&&setExtendedState(dialog?.options?.previousSelected)
            setSelectRequired(dialog?.options?.setSelectRequired??false)
        }, 200)
    }
    const close = () => {
            setVisible(false)
            const time = setTimeout(()=>{
                setCancelable(true)
                setTitle(null)
                setButtons(null)
                setButtonsLoading(null)
                setList([])
                setExtendedState({
                    _id: [],
                    text1: [],
                })
                setNumberSelectable(1)
                setSelectRequired(false)
            }, 400)
    }
    useImperativeHandle(ref, ()=>({
        open,
        close
    }))

    const deletedItem = (item) => {
        if(numberSelectable > 1){
            const index = extendedState._id.findIndex((i) => i == item._id);
            extendedState._id.splice(index, 1);
            extendedState.text1.splice(index, 1);
            setExtendedState({ ...extendedState });
        }
    };
    const selectedItem = (item) => {
        if (numberSelectable == 1) {
            const _id = item._id;
            const text1 = item.text1;
            setExtendedState({
                _id: [_id],
                text1: [text1],
            });
        } else {
            if (extendedState._id.length < numberSelectable) {
                const _id = item._id;
                const text1 = item.text1;
                extendedState._id.push(_id);
                extendedState.text1.push(text1);
                setExtendedState({ ...extendedState });
            } else {
                return false;
            }
        }
        item?.onPress?.()
    };

    return(
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
            deviceHeight={height}
            statusBarTranslucent={ImmersiveMode.isImmersiveModeActive()?true:false}
            coverScreen={true}
        >
            <Toast ref={localToastRef} defaultPosition="top" />
            <View style={[styles.modalContainer, {width:width, backgroundColor:colors.bottom_drawer.background}]}>
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
                <ScrollView
                    style={{maxHeight:maxHeight}}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={{flexDirection:'row', flexWrap:'wrap', justifyContent:'space-between', paddingHorizontal:15, rowGap:15, paddingBottom:30}}>
                        {list.map((item, index) => (
                            <GridItem
                                key={index.toString()}
                                title={item?.text1}
                                description={item?.text2??undefined}
                                disabled={item?.disabled == true?true:false}
                                onPress={()=>{
                                    if(item?.disabled == true){
                                        item?.onPress?.()
                                        if(item?.disabledToastTitle || item?.disabledToastMessage){
                                            localToastRef.current.show({
                                                title: item?.disabledToastTitle??"",
                                                message: item?.disabledToastMessage??"",
                                                type: "info",
                                                animationType: "slide",
                                                position: "top",
                                                duration: 6000
                                            });
                                        }
                                    }
                                }}
                                height={item?.height??gridSize+40}
                                width={item?.width??gridSize}
                                image={item?.image}
                                blank_background={item?.blank_background??undefined}
                                localImage={item?.localImage??false}
                                selectedItem={()=>selectedItem(item)}
                                deletedItem={()=>deletedItem(item)}
                                disabledDeleteItem={numberSelectable == 1?true:false}
                                selected={extendedState._id.find((i) => i == item._id) ? true : false}
                                iconName={item?.iconName??'layers'}
                                iconType={item?.iconType??'Ionicons'}
                                badge={item?.badge}
                            />
                        ))}
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
                                        if((selectRequired && extendedState._id.length == 0) || (item.selectRequired == true && extendedState._id.length == 0)){
                                            null
                                        } else {
                                            item.onPress({ data: extendedState })
                                            if(item.loading == true){
                                                setButtonsLoading(index)
                                            } else {
                                                close()
                                            }
                                        }
                                    }}
                                    borderRadius={item?.borderRadius??10}
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
                                    height={item?.height??55}
                                    width={item?.width??(buttons.length > 1?(width/2) - 25:width-40)}
                                    loading={(item?.loading == true && buttonsLoading == index)?true:false}
                                    onPress={()=>{
                                        if((selectRequired && extendedState._id.length == 0) || (item.selectRequired == true && extendedState._id.length == 0)){
                                            null
                                        } else {
                                            item.onPress({ data: extendedState })
                                            if(item.loading == true){
                                                setButtonsLoading(index)
                                            } else {
                                                close()
                                            }
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
      borderRadius:5,
      alignSelf:'center',
      verticalAlign:'flex-end',
      borderTopLeftRadius:30,
      borderTopRightRadius:30,
    },
});
export default memo(BottomDrawerGrid)