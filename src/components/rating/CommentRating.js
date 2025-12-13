import React, { useState, useEffect} from 'react';
import {View, Text, TouchableNativeFeedback, Dimensions, TouchableOpacity} from 'react-native';
import Icon from '../../utils/Icon';
import Font from '../../utils/Font';
import GradeNumber from './GradeNumber';
import { convertDate } from '../../utils/ConvertDate';
import axios from 'axios';
import Globals from '../../utils/Globals';
import useAppTheme from '../../hooks/theme/useAppTheme';
import { showToast } from '../custom-toast/ToastRef';
import AlertBottomDrawerHelper from '../alert-bottom-drawer/AlertBottomDrawerHelper';
import { vibrate } from '../../utils/vibrationManager';

const width = Dimensions.get('window').width
function CommentRating({_id, name, grade, date, comment, likeNumbers, disLikeNumbers, likedIt, disLikedIt}){
    const colors = useAppTheme();
    const [likeNumber, setLikeNumber] = useState(likeNumbers?likeNumbers:0)
    const [disLikeNumber, setDisLikeNumber] = useState(disLikeNumbers?disLikeNumbers:0)
    const [liked, setLiked] = useState(likedIt?likedIt:false)
    const [disLiked, setDisLiked] = useState(disLikedIt?disLikedIt:false)

    useEffect( () => {
        if(likeNumbers) {
            setLikeNumber(likeNumbers)
        }
    }, [likeNumbers])
    useEffect( () => {
        if(disLikeNumbers) {
            setDisLikeNumber(disLikeNumbers)
        }
    }, [disLikeNumbers])
    

    const like = ()=>{
        vibrate()
        if(liked == false){
            setLiked(true)
            setLikeNumber((p)=> p + 1)
            if(disLiked == true){
                setDisLiked(false)
                setDisLikeNumber((p)=> p - 1)
            }
            const time = setTimeout(()=>{
                operationLike()
                clearTimeout(time)
            }, 100)
        }
    }
    const operationLike = async()=>{
        let data = {
            query : `
                mutation setLikeRatingPackageGameByUser($rating : ID!){
                    setLikeRatingPackageGameByUser(rating : $rating) {
                        status,
                        message
                    }
                }
              `,
            variables : {
                "rating" : _id,
            }
        }
        await axios({
            url:'/',
            method:'post',
            data: data,
        }).then(async(response)=>{
            if(response.data?.data?.setLikeRatingPackageGameByUser?.status == 200){
                null
            } else {
                setLiked(false)
                setLikeNumber((p)=> p - 1)
            }
        }).catch((error)=>{
            setLiked(false)
            setLikeNumber((p)=> p - 1)
        })
    }
    const disLike = ()=>{
        vibrate()
        if(disLiked == false) {
            setDisLiked(true)
            setDisLikeNumber((p)=> p + 1)
            if(liked == true){
                setLiked(false)
                setLikeNumber((p)=> p - 1)
            }
            const time = setTimeout(()=>{
                operationDisLike()
                clearTimeout(time)
            }, 100)
        }
    }
    const operationDisLike = async()=>{
        let data = {
            query : `
                mutation setDisLikeRatingPackageGameByUser($rating : ID!){
                    setDisLikeRatingPackageGameByUser(rating : $rating) {
                        status,
                        message
                    }
                }
              `,
            variables : {
                "rating" : _id,
            }
        }
        await axios({
            url:'/',
            method:'post',
            data: data,
        }).then(async(response)=>{
            if(response.data?.data?.setDisLikeRatingPackageGameByUser?.status == 200){
                null
            } else {
                setDisLiked(false)
                setDisLikeNumber((p)=> p - 1)
            }
        }).catch((error)=>{
            setDisLiked(false)
            setDisLikeNumber((p)=> p - 1)
        })
    }
    const reportModal = ()=>{
        const msg = [
            {
                text:"آیا محتوای این نظر نسبت به بستهٔ بازی، نامناسب است؟",
                style:{ maxWidth:width-30, fontFamily:Font.medium, fontSize:14, color:colors.text.a2, alignSelf:'flex-start', textAlign:'justify', lineHeight:24},
            }
        ]
        AlertBottomDrawerHelper.showAlert({
            title:"ثبت گزارش بازخورد نامناسب",
            message: msg,
            buttons:[
                {
                    onPress : ()=>{
                       reportRating()
                    },
                    text: "ثبت گزارش",
                    loading: true,
                    stayOpen: true,
                    type: "bold",
                },
                {
                    onPress : ()=>{},
                    text: 'لغو',
                    loading: false,
                    stayOpen: false,
                    type: "border",
                },
            ],
            options:{
                cancelable: true,
                icon:{
                    Icon:()=>(
                        <Icon name={"report"} type={"MaterialIcons"} style={{fontSize:100, color:colors.alert.a1}}/>
                    )
                }
            }
        })
    }
    const reportRating = async() =>{
        let data = {
            query : `
                mutation setReportCommentRatingPackageGameByUser($rating : ID!){
                    setReportCommentRatingPackageGameByUser(rating : $rating) {
                        status,
                        message
                    }
                }
              `,
            variables : {
                "rating" : _id,
            }
        }
        await axios({
            url:'/',
            method:'post',
            data: data,
        }).then(async(response)=>{
            AlertBottomDrawerHelper.hideAlert()
            if(response.data?.data.setReportCommentRatingPackageGameByUser.status == 200){
                showToast({
                    title: "ثبت گزارش",
                    message: "از ثبت گزارش شما سپاس گذاریم.",
                    type: "success",
                    animationType: "slide",
                    position: "top",
                });
            } else {
                showToast({
                    title: "مشکلی پیش آمد",
                    message: "مشکلی در ثبت گزارش پیش آمد. لطفا دوباره تلاش کنید.",
                    type: "error",
                    animationType: "slide",
                    position: "top",
                });
            }
        }).catch((error)=>{
            AlertBottomDrawerHelper.hideAlert()
            showToast({
                title: "مشکلی پیش آمد",
                message: "مشکلی در ثبت گزارش پیش آمد. لطفا دوباره تلاش کنید.",
                type: "error",
                animationType: "slide",
                position: "top",
            });
        })
    }
    return (
        <View style={{width:width, flexDirection:'column', marginVertical:30}}>
            <View style={{flexDirection:'row', alignItems:'center', width:'100%', justifyContent:'space-between'}}>
                <View style={{flexDirection:'row', alignItems:'center', justifyContent:'flex-start', marginStart:15}}>
                    <Icon name={'person'} type={'Ionicons'} style={{color:colors.text.a6, fontSize:40}}/>
                    <View style={{flexDirection:'column', alignItems:'flex-start', marginStart:5}}>
                        <Text style={{fontFamily:Font.medium, fontSize:12, color:colors.text.a5}}>{name?name:'کاربر بی‌زبون'}</Text>
                        <GradeNumber
                            size={12}
                            grade={grade}
                        />
                    </View>
                </View>
                <View style={{flexDirection:'row', alignItems:'center', marginEnd:2}}>
                    <Text style={{fontFamily:Font.medium, fontSize:12, color:colors.text.a6, marginEnd:10}}>{convertDate(date)}</Text>
                    <TouchableNativeFeedback onPress={reportModal} background={TouchableNativeFeedback.Ripple(colors.border.a1,false)}>
                        <View pointerEvents='box-only' style={{justifyContent:'center', alignItems:'center', padding:10}}>
                            <Icon name={'dots-three-vertical'} type={'Entypo'} style={{color:colors.text.a5, fontSize:15}}/>
                        </View>
                    </TouchableNativeFeedback>
                </View>
            </View>
            <View style={{marginVertical:15, paddingHorizontal:15}}>
                <Text style={{fontFamily:Font.medium, fontSize:14, color:colors.text.a5}}>{comment}</Text>
            </View>
            <View style={{flexDirection:'row', alignItems:'center', width:'100%', justifyContent:'flex-start', paddingHorizontal:15, gap:30}}>
                <View style={{flexDirection:'row', alignItems:'center', gap:5}}>
                    {
                        liked == true?
                        <TouchableOpacity>
                            <Icon name={'like1'} type={'AntDesign'}  style={{color:colors.primary.a1, fontSize:25}}/>
                        </TouchableOpacity>
                        :
                        <TouchableOpacity onPress={like}>
                            <Icon name={'like2'} type={'AntDesign'}  style={{color:colors.text.a4, fontSize:25}}/>
                        </TouchableOpacity>
                    }
                    <Text style={{fontFamily:Font.black, fontSize:11, color:colors.text.a5}}>{likeNumber}</Text>
                </View>
                <View style={{flexDirection:'row', alignItems:'center', gap:5}}>
                    {
                        disLiked == true?
                        <TouchableOpacity>
                            <Icon name={'dislike1'} type={'AntDesign'}  style={{color:colors.alert.a1, fontSize:25}}/>
                        </TouchableOpacity>
                        :
                        <TouchableOpacity onPress={disLike}>
                            <Icon name={'dislike2'} type={'AntDesign'}  style={{color:colors.text.a4, fontSize:25}}/>
                        </TouchableOpacity>
                    }
                    <Text style={{fontFamily:Font.black, fontSize:11, color:colors.text.a5}}>{disLikeNumber}</Text>
                </View>
            </View>
        </View>
    );
};
const areEqual = (prevProps, nextProps) => {
    if (prevProps._id !== nextProps._id) return false;
    if (prevProps.likeNumbers !== nextProps.likeNumbers) return false;
    if (prevProps.disLikeNumbers !== nextProps.disLikeNumbers) return false;
    if (prevProps.grade !== nextProps.grade) return false;
    if (prevProps.date !== nextProps.date) return false;
    if (prevProps.comment !== nextProps.comment) return false;
    return true;
};
export default React.memo(CommentRating, areEqual)