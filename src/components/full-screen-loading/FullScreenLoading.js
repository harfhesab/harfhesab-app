import React, { useState, useImperativeHandle, memo, useRef } from 'react';
import { View, Dimensions, Text, StyleSheet, NativeModules} from 'react-native';
import Modal from "react-native-modal";
import Font from '../../utils/Font';
import { DotIndicator } from 'react-native-indicators';

const { ImmersiveMode } = NativeModules;

const FullScreenLoading = React.forwardRef((props, ref)=>{
    const { width, height } = ImmersiveMode.isImmersiveModeActive()
        ? Dimensions.get('screen')
        : Dimensions.get('window');

    const [visible, setVisible] = useState(false)
    const [cancelable, setCancelable] = useState(true)
    const [title, setTitle] = useState(null)

    const autoCloseTimer = useRef(null)

    const open = (dialog)=>{
        setVisible(true)
        if (autoCloseTimer.current) {
            clearTimeout(autoCloseTimer.current)
        }
        autoCloseTimer.current = setTimeout(()=>{
            close()
        }, 90000)

        setTimeout(()=>{
            setTitle(dialog?.title ?? null)
            setCancelable(dialog?.cancelable ?? false)
        }, 200)
    }

    const close = () => {
        setVisible(false)
        if (autoCloseTimer.current) {
            clearTimeout(autoCloseTimer.current)
            autoCloseTimer.current = null
        }
        setTimeout(()=>{
            setCancelable(false)
            setTitle(null)
        }, 200)
    }

    useImperativeHandle(ref, ()=>({
        open,
        close
    }))
    
    return(
        visible === true &&
        <Modal
            animationIn={'fadeIn'}
            animationOut={'fadeOut'}
            backdropOpacity={0.85}
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
            style={{justifyContent:'center', alignItems:'center', margin: 0}}
            deviceHeight={height}
            statusBarTranslucent={ImmersiveMode.isImmersiveModeActive() ? true : false}
            coverScreen={true}
        >
            <View style={styles.modalContainer}>
                {title && (
                    <Text style={{fontFamily:Font.medium, fontSize:14, color:"#999999"}}>
                        {title}
                    </Text>
                )}
                <View style={{width:'100%', height:60, alignItems:'center', justifyContent:'center'}}>
                    <DotIndicator color={"#F1F1F1"} count={3} size={12}/>
                </View>
            </View>   
        </Modal>
    )
})

const styles = StyleSheet.create({
    modalContainer:{
        flex:1,
        alignItems:'center',
        justifyContent:'center',
    },
});

export default memo(FullScreenLoading)