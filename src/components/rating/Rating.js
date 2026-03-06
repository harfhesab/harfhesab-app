import React, {useRef, useState} from 'react';
import {StyleSheet, View, Text, Dimensions, TouchableOpacity, ToastAndroid, ImageBackground, Image} from 'react-native';
import Icon from '../../utils/Icon';
import Font from '../../utils/Font';
import Globals from '../../utils/Globals';
import ButtonBorder from '../buttons/ButtonBorder';
import Modal from "react-native-modal";
import { useDispatch, useSelector} from 'react-redux';
import axios from 'axios';
import ButtonGradient from '../buttons/ButtonGradient';
import InputText from '../inputs/InputText';
import useAppTheme from '../../hooks/theme/useAppTheme';
import { navigate } from '../../main/navigationService';
import LocalImageComponent from '../image-components/LocalImageComponent';
import Toast from '../custom-toast/Toast';
import { DotIndicator } from 'react-native-indicators';
import { showToast } from '../custom-toast/ToastRef';
import { increaseNumberCoins, reduceNumberCoins } from '../../redux/slices/coinSlice';
import { vibrate } from '../../utils/vibrationManager';

const width = Dimensions.get('window').width;
const Rating = ({
    defaultRating:defaultRatingProps,
    comment:commentProps,
    edit:editProps,
    previous,
    successOperation,
    packageId,
    ratingReward=0
}) => {
    const colors = useAppTheme()
    const dispatch = useDispatch();
    const localToastRef = useRef(null);
    const { loginType } = useSelector((state) => state.account);
    const [defaultRatingBackup, setDefaultRatingBackup] = useState(defaultRatingProps)
    const [defaultRating, setDefaultRating] = useState(defaultRatingProps)
    const [modalVisible, setModalVisible] = useState(false)
    const [commentBackup, setCommentBackup] = useState(commentProps)
    const [comment, setComment] = useState(commentProps)
    const [focus, setFocus] = useState(false)
    const [loading, setLoading] = useState(false)
    const [edit, setEdit] = useState(editProps)

    const setRatingRecordForPackage = async()=>{
        if(loginType == "registered") {
            let data = {
                query : `
                    mutation setRatingPackageGameByUser(
                        $previous : ID,
                        $package : ID!,
                        $grade : Int!,
                        $comment : String
                    ){
                        setRatingPackageGameByUser(
                            previous : $previous,
                            package : $package,
                            grade : $grade,
                            comment : $comment
                        ) {
                            status,
                            message,
                            reward,
                            remove_reward
                            number,
                        }
                    }
                `,
                variables : {
                    "previous" : previous,
                    "package" : packageId,
                    "grade" : defaultRating,
                    "comment" : comment.trim() !== ''?comment:undefined
                }
            }
            await axios({
                url:'/',
                method:'post',
                data: data,
            }).then(async(response)=>{
                const data = response?.data?.data?.setRatingPackageGameByUser
                if(data?.status == 200){
                    setDefaultRatingBackup(defaultRating)
                    setCommentBackup(comment)
                    successOperation()
                    setFocus(false)
                    setModalVisible(false)
                    setEdit(true)
                    showToast({
                        title:"ثبت امتیاز",
                        message: data?.message??"دادن امتیاز به بستهٔ بازی با موفقیت انجام شد.",
                        type: 'success',
                        animationType: 'slide',
                        position: 'top',
                        duration:(data?.reward == true || data?.remove_reward == true)?9000:6000
                    });
                    if(data?.reward == true){
                        dispatch(increaseNumberCoins({number:data?.number}))
                    }
                    if(data?.remove_reward == true){
                        dispatch(reduceNumberCoins({number:data?.number}))
                    }
                } else {
                    localToastRef.current.show({
                        title:"امتیاز ثبت نشد",
                        message: "مشکلی در ثبت امتیاز پیش آمد. دوباره تلاش کنید!",
                        type: 'error',
                        animationType: 'slide',
                        position: 'top'
                    });
                }
                setLoading(false)
            }).catch((error)=>{
                localToastRef.current.show({
                    title:"امتیاز ثبت نشد",
                    message: "مشکلی در ثبت امتیاز پیش آمد. دوباره تلاش کنید!",
                    type: 'error',
                    animationType: 'slide',
                    position: 'top'
                });
                setLoading(false)
            })
        } else {
            localToastRef.current.show({
                title:"ورود به حساب کاربری",
                message: "برای دادن امتیاز به بستهٔ بازی، باید وارد حساب کاربری خود شوید.",
                type: 'info',
                animationType: 'slide',
                position: 'top'
            });
            navigate('Login')
        }
    }
    const setRating = ()=>{
        if(defaultRating == 0){
            if (localToastRef.current) {
                localToastRef.current.show({
                    title: "انتخاب امتیاز",
                    message: "برای ثبت امتیاز، انتخاب یک امتیاز از 1 تا 5 اجباری است.",
                    type: 'error',
                    animationType: 'slide',
                    position: 'top',
                    duration:6000
                });
            }
        } else {
            setLoading(true)
            setRatingRecordForPackage()
        }
    }
    const openDrawer = ()=>{
        if(loginType == "registered") {
            setModalVisible(true)
        } else {
            if (localToastRef.current) {
                localToastRef.current.show({
                    message: "برای ثبت نظر و امتیاز  وارد حساب کاربری خود شوید.",
                    type: 'info',
                    animationType: 'slide', // تست حالت فید
                    position: 'top'
                });
            }
            navigate('LoginToAccount')
        }
    }
    const setScoreWithRating = async(i)=>{
        if(loginType == "registered") {
            await setDefaultRating(i)
            const time = setTimeout(()=>{
                setModalVisible(true)
                clearTimeout(time)
            }, 50)
        } else {
            if (localToastRef.current) {
                localToastRef.current.show({
                    message: "برای ثبت نظر و امتیاز  وارد حساب کاربری خود شوید.",
                    type: 'info',
                    animationType: 'slide', // تست حالت فید
                    position: 'top'
                });
            }
            navigate('LoginToAccount')
        }
    }
    const ratingBarRender = (i)=>{
        return(
          <View key={i} style={{flexDirection:'column', alignItems:'center'}}>
            <TouchableOpacity 
                onPress={()=>{
                    vibrate()
                    setScoreWithRating(i)
                }}
                activeOpacity={0.3}
                style={{alignItems:'center', justifyContent:'center', width:45}}
            >
                {
                    (i <= defaultRating)?
                    <Icon name='star' type='AntDesign' style={{fontSize:45, color:colors.primary.a3}} />
                    :
                    <View style={{alignItems:'center', justifyContent:'center'}}>
                      <Icon name='star' type='AntDesign' style={{fontSize:45, color:`${colors.primary.a3}25`}} />
                      <Icon name='staro' type='AntDesign' style={{fontSize:45, color:`${colors.primary.a3}99`, position:'absolute'}} />
                    </View>
                }
            </TouchableOpacity> 
            <Text style={{color:colors.primary.a3, fontFamily:Font.medium, fontSize:12}}>{i}</Text>

          </View>
        )
    }
    let ratingBar = [];
    for(let i = 1; i <= 5; i++) {
        ratingBar.push(ratingBarRender(i))
    }
    const closeDrawer = ()=>{
        if(loading == false){
            setModalVisible(false)
            setFocus(false)
            setDefaultRating(defaultRatingBackup)
            setComment(commentBackup)
        }
    }
    const drawer = ()=>{
        return(
            <Modal 
                isVisible={modalVisible}
                swipeThreshold={100}
                animationIn="slideInDown"
                animationOut="slideOutDown"
                backdropOpacity={0.7}
                onBackButtonPress={closeDrawer}
                onSwipeComplete={closeDrawer}
                onBackdropPress={closeDrawer}
                useNativeDriverForBackdrop={true}
                style={{justifyContent:'center', alignItems:'center'}}
            >
                <Toast ref={localToastRef} defaultPosition="top" />
                <View>
                    <ImageBackground
                            source={require("../../assets/image/frame_rating.png")}
                            style={{ width: width-20, height: (width-20)*0.9 }}
                            imageStyle={{ resizeMode: "stretch" }}
                            resizeMode="stretch"
                        >
                        <View style={[styles.modalContainer]}>
                            <View style={{alignItems:'center', width:"100%", alignSelf:'center', paddingTop:50}}>
                                <View style={styles.starContent}>
                                    {ratingBar}
                                </View>
                            </View>
                            <View style={{width:width - 60, alignSelf:'center'}}>
                                <InputText
                                    placeholder={"نظر خود را بنویسید"}
                                    value={comment}
                                    maxLength={400}
                                    onChangeText={(text)=>setComment(text)}
                                    borderWidth={1}
                                    fontSize={14}
                                    borderRadius={10}
                                    multiline={true}
                                    numberOfLines={6}
                                    maxHeight={300}
                                    height={80}
                                    textColor={colors.text.a4}
                                    color={colors.primary.a3}
                                    backgroundOpacity={25}
                                />
                                <View style={{width:"100%", alignItems:'flex-end'}}>
                                    <Text style={{color:colors.text.a5, fontFamily:Font.black, fontSize:10}}>{`${comment.length}/400`}</Text>
                                </View>
                            </View>
                            <View style={{width:"100%", alignItems:'center', justifyContent:'center', alignSelf:'center', bottom:-25}}>
                                <TouchableOpacity activeOpacity={0.9} onPress={setRating}>
                                    <ImageBackground
                                        source={require("../../assets/image/wood_blue_button.png")}
                                        style={{ width: 200, height: 70, alignItems:'center', justifyContent:'center', paddingBottom:5 }}
                                        imageStyle={{ resizeMode: "stretch" }}
                                        resizeMode="stretch"
                                    >
                                        {
                                            loading == true?
                                            <View style={{width:"100%", height:"100%", alignItems:"center", justifyContent:"center"}}>
                                                <DotIndicator color={colors.primary.a3} count={3} size={8}/>
                                            </View>
                                            :
                                            <Text style={{fontFamily:Font.black, fontSize:15, color:colors.primary.a3}}>{edit == true?'ویرایش نظر و امتیاز':'ثبت نظر و امتیاز'}</Text>
                                        }
                                    </ImageBackground>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ImageBackground>
                    <View style={{width:"100%", flexDirection:'row', alignItems:'flex-end', justifyContent:'center', gap:5, position:'absolute', top:-40}}>
                        <LocalImageComponent
                            path={require("../../assets/image/star.png")}
                            width={47.5}
                            height={50}
                            resizeMode="stretch"
                            blank_background
                            style={{marginBottom:6}}
                        />
                        <LocalImageComponent
                            path={require("../../assets/image/star.png")}
                            width={76}
                            height={80}
                            resizeMode="stretch"
                            blank_background
                        />
                        <LocalImageComponent
                            path={require("../../assets/image/star.png")}
                            width={47.5}
                            height={50}
                            resizeMode="stretch"
                            blank_background
                            style={{marginBottom:6}}
                        />
                    </View>
                    <View style={{position:'absolute'}}>
                        <TouchableOpacity activeOpacity={0.9} onPress={closeDrawer} style={{top:-10}}>
                            <ImageBackground
                                source={require("../../assets/image/circle_button2.png")}
                                style={{ width: 55, height: 55, alignItems:'center', justifyContent:'center', paddingBottom:5 }}
                                imageStyle={{ resizeMode: "stretch" }}
                                resizeMode="stretch"
                            >
                                <LocalImageComponent
                                    path={require("../../assets/image/close_in_wood.png")}
                                    width={20}
                                    height={20}
                                    resizeMode="stretch"
                                    blank_background
                                />
                            </ImageBackground>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        )
    }
    return (
        <View>
            <View style={[styles.container, {borderColor:colors.border.a2, backgroundColor:colors.background.a2}]}>
                <Text style={{color:colors.text.a6, fontFamily:Font.medium, fontSize:11, textAlign:'justify', lineHeight:20}}>{"با توجه به اینکه شما سابق این بستهٔ بازی را دریافت کرده‌اید می‌توانید نظر و بازخوردتان را نسبت به آن در قالب یک نظر و امتیاز ثبت کنید."}</Text>
                {
                    ((edit !== true || (edit == true && comment?.length == 0)) && ratingReward > 0)&&
                    <View style={{width:"100%", alignItems:'flex-start'}}>
                        <Text style={{color:colors.text.a6, fontFamily:Font.medium, fontSize:11, textAlign:'justify', lineHeight:20}}>{`با افزودن "نظرتان" در مورد محتوای این بستهٔ بازی ${ratingReward} سکه پاداش دریافت کنید.`}</Text>
                    </View>
                }
                <View style={[styles.starContent, {marginTop:10}]}>
                    {ratingBar}
                </View>
            </View>
            <View style={{width:width, alignItems:'center', marginTop:10}}>
                <ButtonBorder
                    text={edit == true?'ویرایش نظر و امتیاز':'ثبت نظر و امتیاز'}
                    onPress={openDrawer}
                    loading={false}
                    textSize={15}
                    width={width-30}
                    height={50}
                    borderWidth={0.5}
                    borderColor={colors.border.a1}
                    justifyContent={((edit !== true || (edit == true && comment?.length == 0)) && ratingReward > 0)?"space-between":"center"}
                    CustomContent={((edit !== true || (edit == true && comment?.length == 0)) && ratingReward > 0)?()=>{
                        return(
                            <View style={{flexDirection:'row', alignItems:'center', gap:5}}>
                                <Text style={{fontFamily:Font.medium, fontSize:14, color:colors.text.a1}}>{`${ratingReward} +`}</Text>
                                <Image
                                    style={{height:20, width:20}}
                                    source={require('../../assets/image/coin.png')}
                                />
                            </View>
                        )
                    }:null}
                />
            </View>
            {
                drawer()
            }
        </View>
    );
};
const styles = StyleSheet.create({
    container:{
        width:width-30,
        alignSelf:'center',
        flexDirection:'column',
        alignItems:'center',
        justifyContent:'center',
        borderWidth:0.5,
        borderRadius:8,
        padding:10,
    },
    starContent:{
        width:"100%",
        alignSelf:'center',
        flexDirection:'row-reverse',
        alignItems:'center',
        justifyContent:'center',
        gap:5
    },
    modalContainer:{
        width:"100%",
        height:"100%",
        alignSelf:'center',
        justifyContent:'space-between'
    },
})
export default React.memo(Rating)