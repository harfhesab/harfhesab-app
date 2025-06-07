import React, { useState, useImperativeHandle, useRef } from 'react';
import {StyleSheet, View, Dimensions, TouchableOpacity, StatusBar, Text} from 'react-native';
import {useTheme} from '@react-navigation/native';
import Modal from "react-native-modal";
import {connect} from 'react-redux';
import ButtonBorder from '../ButtonBorder';
import LinearGradient from 'react-native-linear-gradient';
import Globals from '../../utils/Globals';
import LottieView from 'lottie-react-native';
import ButtonLinear from '../ButtonLinear';
import Font from '../../utils/Font';
import * as Progress from 'react-native-progress';
import BackgroundTimer from 'react-native-background-timer';
// import {refreshCart} from "../../redux/actions/KioskAccountAction";
import { useNavigation } from '@react-navigation/native';

const {width} = Dimensions.get('window');
const time = Globals.data.configs.shwow_alert_touch_time
const TouchAlert = React.forwardRef((props, ref)=>{
    const colors = useTheme().colors;
    const [visible, setVisible] = useState(false)
    const [second, setSecond] = useState(time)
    const intervalRef = useRef(null);
    const navigation = useNavigation();

    const onTimerEnd = ()=>{
        setVisible(false)
        const closeTimer = setTimeout(()=>{
            // props.refreshCart()
            if (intervalRef.current) {
                BackgroundTimer.clearInterval(intervalRef.current);
            }
            setSecond(time)
            navigation.navigate('Home');
            clearTimeout(closeTimer)
        }, 300)
    }
    const open = ()=>{
        setVisible(true)
        const id = BackgroundTimer.setInterval(() => {
            setSecond((prevSecond) => {
                if (prevSecond > 0) {
                    return prevSecond - 1;
                } else {
                    onTimerEnd();
                    return prevSecond;
                }
            });
        }, 1000)
        intervalRef.current = id;
    }
    const close = () => {
        setVisible(false)
        const closeTimer = setTimeout(()=>{
            if (intervalRef.current) {
                BackgroundTimer.clearInterval(intervalRef.current);
            }
            setSecond(time)
            clearTimeout(closeTimer)
        }, 300)
    }
    useImperativeHandle(ref, ()=>({
        open
    }))
    return(
        <Modal 
            animationIn={'fadeIn'}
            animationOut={'fadeOut'}
            backdropOpacity={0.75}
            onBackButtonPress={close}
            onSwipeComplete={close}
            isVisible={visible}
            onBackdropPress={close}
            style={{alignItems:'center'}}
        >
            <StatusBar backgroundColor={props.darkMode?"#000000":"#00000005"} barStyle={"light-content"}/>
            <View style={[styles.modalContainer, {backgroundColor:colors.background, borderRadius:15}]}>
                <View style={{width:'100%', alignItems: "center", justifyContent: "center"}}>
                    <View style={{width: "100%", backgroundColor:colors.background, borderRadius: 15, alignItems: "center"}}>
                        <View style={{width: "100%", height: 100, backgroundColor: colors.background3, borderTopLeftRadius: 15, borderTopRightRadius: 15, shadowColor: '#00000070', elevation: 5}}>
                            <LinearGradient
                                style={{width: '100%',
                                    height: 100,
                                    borderTopLeftRadius: 15,
                                    borderTopRightRadius: 15,
                                }}
                                colors={[
                                    Globals.data.configs.colors.primary_gradient_start,
                                    Globals.data.configs.colors.primary_gradient_end,
                                ]}
                            />
                        </View>
                        <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: props.darkMode == true?'#222222':'#F6F9FC', marginTop: 20, alignItems: "center", justifyContent: "center", position: 'absolute', elevation: 5, borderWidth:3, borderColor:Globals.data.configs.colors.primary_gradient_start}}>
                            <LottieView
                                source={require('../../assets/lottie/warn.json')}
                                autoPlay
                                loop={false}
                            />
                        </View>
                    </View>
                </View>
                <View style={{width:'100%'}}>
                    <View style={{width:'100%', paddingHorizontal:15, paddingTop:30, paddingBottom:20}}>
                        <Text style={{fontFamily:Font.medium, fontSize:15, color:colors.text, textAlign:'center'}}>{"با توجه به این‌ که مدتی از ادامهٔ عملیات خرید گذشته است به زودی سبد خرید خالی و عملیات خرید دوباره از سر گرفته می‌شود."}</Text>
                    </View>
                    <View style={{width:'100%', alignItems:'center', paddingBottom:20}}>
                        <Progress.Circle
                            progress={(((time-second)*100)/time)/100}
                            indeterminateAnimationDuration={time*1000}
                            size={150}
                            indeterminate={false}
                            thickness={6}
                            showsText={true}
                            formatText={()=>{
                                return(
                                    second
                                )
                            }}
                            strokeCap={"round"}
                            color={colors.green}
                            borderWidth={1}
                            borderColor={Globals.data.configs.colors.red}
                            textStyle={{fontFamily:Font.black, color:colors.green, fontSize:60}}
                        />
                    </View>
                    <View style={{width:'100%', flexDirection:'row', alignItems:'center', justifyContent:"center", paddingHorizontal:15, paddingVertical:15, gap:15}}>
                        <ButtonBorder
                            text={"لغو و ادامه"}
                            onPress={close}
                            loading={false}
                            textSize={14}
                            width={width*0.32}
                            height={40}
                            borderRadius={5}
                        />
                        <ButtonLinear
                            text={"تأیید و شروع مجدد"}
                            onPress={onTimerEnd}
                            loading={false}
                            textSize={14}
                            width={width*0.32}
                            height={40}
                            borderRadius={5}
                        />
                    </View>
                </View>
            </View>
        </Modal>
    )
})
const styles = StyleSheet.create({
    modalContainer:{
        alignItems:'center',
        flexDirection:'column',
        justifyContent:'space-between',
        width:width*0.75,
    },
})
const mapStateToProps = (state) => {
    return {
        darkMode: state.main.darkMode,
    }
}
const mapDispatchToProps = (dispatch) => {
    return {
        // refreshCart: () => dispatch(refreshCart()),
    }
}
export default connect(mapStateToProps, mapDispatchToProps, null, {forwardRef:true})(TouchAlert)