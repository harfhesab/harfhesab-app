import React, { useState, useEffect} from 'react';
import {View, Text, TouchableNativeFeedback, Dimensions, TouchableOpacity} from 'react-native';
import Icon from '../../utils/Icon';
import Font from '../../utils/Font';
import GradeNumber from './GradeNumber';
import { convertDate } from '../../utils/ConvertDate';
import Toast from 'react-native-toast-message';
import axios from 'axios';
import BottomDrawer from '../bottomDrawer/BottomDrawerHelper';
import ModalInput from '../modalInput/ModalInputHelper';
import FastImage from 'react-native-fast-image';
import Globals from '../../utils/Globals';
import useAppTheme from '../../hooks/theme/useAppTheme';

const width = Dimensions.get('window').width
function CommentRating({_id, name, grade, date, comment, likeNumbers, disLikeNumbers, likedIt, disLikedIt, answerNumbers, user}){
    const colors = useAppTheme();
    const [likeNumber, setLikeNumber] = useState(likeNumbers?likeNumbers:0)
    const [disLikeNumber, setDisLikeNumber] = useState(disLikeNumbers?disLikeNumbers:0)
    const [liked, setLiked] = useState(likedIt?likedIt:false)
    const [disLiked, setDisLiked] = useState(disLikedIt?disLikedIt:false)
    const [answerNumber, setAnswerNumber] = useState(answerNumbers?answerNumbers:0)

    useEffect( () => {
        if(answerNumbers) {
            setAnswerNumber(answerNumbers)
        }
    }, [answerNumbers])
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
                mutation userLikeRatingItem($_id : ID!){
                    userLikeRatingItem(_id : $_id) {
                        status,
                        message
                    }
                }
              `,
            variables : {
                "_id" : _id,
            }
        }
        await axios({
            url:'/',
            method:'post',
            data: data,
        }).then(async(response)=>{
            if(response.data?.data == null){
                setLiked(false)
                setLikeNumber((p)=> p - 1)
            }
        }).catch((error)=>{
            Toast.show({
                type: 'toast',
                text1: 'مشکلی پیش آمد دوباره تلاش کند'
            })
            setLiked(false)
            setLikeNumber((p)=> p - 1)
        })
    }
    const disLike = ()=>{
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
                mutation userDisLikeRatingItem($_id : ID!){
                    userDisLikeRatingItem(_id : $_id) {
                        status,
                        message
                    }
                }
              `,
            variables : {
                "_id" : _id,
            }
        }
        await axios({
            url:'/',
            method:'post',
            data: data,
        }).then(async(response)=>{
            if(response.data?.data == null){
                setDisLiked(false)
                setDisLikeNumber((p)=> p - 1)
            }
        }).catch((error)=>{
            Toast.show({
                type: 'toast',
                text1: 'مشکلی پیش آمد دوباره تلاش کند'
            })
            setDisLiked(false)
            setDisLikeNumber((p)=> p - 1)
        })
    }
    const reportModal = ()=>{
        BottomDrawer.showDrawer({
            title: 'ثبت گزارش بازخورد نامناسب و نامرتبط',
            btn:{
                text: 'ثبت گزارش',
                onPress: () => {reportRating()},
                load: true,
            },
            options : {
                cancelable: true,
                closed: false,
            },
        })
    }
    const reportRating = async() =>{
        let data = {
            query : `
                mutation userSetReportRating($_id : ID!){
                    userSetReportRating(_id : $_id) {
                        status,
                        message
                    }
                }
              `,
            variables : {
                "_id" : _id,
            }
        }
        await axios({
            url:'/',
            method:'post',
            data: data,
        }).then(async(response)=>{
            BottomDrawer.hideDrawer()
            if(response.data?.data.userSetReportRating.status == 200){
                Toast.show({
                    type: 'toast',
                    text1: 'از بازخورد شما سپاس گذاریم'
                })
            } else {
                Toast.show({
                    type: 'toast',
                    text1: 'مشکلی پیش آمد دوباره تلاش کند'
                })
            }
        }).catch((error)=>{
            BottomDrawer.hideDrawer()
            Toast.show({
                type: 'toast',
                text1: 'مشکلی پیش آمد دوباره تلاش کند'
            })
        })
    }
    const setAnswerForRating = ()=>{
        ModalInput.showInput({
            title: 'ارسال پاسخ',
            description: "پاسخ خود را بنویسید",
            buttons: [
                {
                    text: 'تایید',
                    onPress: (call) => {
                        operationAnswerRating(call)
                    },
                },
                {
                    text: 'انصراف',
                    onPress: () => {},
                },
            ],
            options : {
                value: null,
                keyboardType: 'default',
                placeholder: "پاسخ خود را بنویسید...",
                multiline: true,
                numberOfLines: 4,
                maxLength: 300,
            },
        })
    }
    const operationAnswerRating = async(call)=>{
        let data = {
            query : `
                mutation userSetAnswerForRating($_id : ID!, $answer : String!){
                    userSetAnswerForRating(_id : $_id, answer : $answer) {
                        status,
                        message
                    }
                }
              `,
            variables : {
                "_id" : _id,
                "answer" : call
            }
        }
        await axios({
            url:'/',
            method:'post',
            data: data,
        }).then(async(response)=>{
            if(response.data?.data.userSetAnswerForRating.status == 200){
                Toast.show({
                    type: 'toast',
                    text1: 'پاسخ شما ارسال شد. پس از تایید نمایش داده میشود.'
                })
            } else {
                Toast.show({
                    type: 'toast',
                    text1: 'مشکلی پیش آمد دوباره تلاش کند'
                })
            }
        }).catch(()=>{
            Toast.show({
                type: 'toast',
                text1: 'مشکلی پیش آمد دوباره تلاش کند'
            })
        })
    }
    return (
        <View style={{width:width, flexDirection:'column', marginVertical:40}}>
            <View style={{flexDirection:'row', alignItems:'center', width:'100%', justifyContent:'space-between'}}>
                <View style={{flexDirection:'row', alignItems:'center', justifyContent:'flex-start', marginStart:15}}>
                    <Icon name={'person'} type={'Ionicons'} style={{color:colors.primary.a1, fontSize:30}}/>
                    <View style={{flexDirection:'column', alignItems:'flex-start', marginStart:5}}>
                        <Text style={{fontFamily:Font.medium, fontSize:12, color:colors.text.a4}}>{name?name:'کاربر منوملک'}</Text>
                        <GradeNumber
                            size={12}
                            grade={grade}
                        />
                    </View>
                </View>
                <View style={{flexDirection:'row', alignItems:'center', marginEnd:2}}>
                    <Text style={{fontFamily:Font.medium, fontSize:12, color:colors.text.a4, marginEnd:10}}>{convertDate(date)}</Text>
                    <TouchableNativeFeedback onPress={reportModal} background={TouchableNativeFeedback.Ripple(colors.border.a1,false)}>
                        <View pointerEvents='box-only' style={{justifyContent:'center', alignItems:'center', padding:10}}>
                            <Icon name={'dots-three-vertical'} type={'Entypo'} style={{color:colors.text.a5, fontSize:15}}/>
                        </View>
                    </TouchableNativeFeedback>
                </View>
            </View>
            <View style={{marginVertical:15, paddingHorizontal:15}}>
                {
                    user&&
                    <View style={{flexDirection:'row', alignItems:'center'}}>
                        {
                            user?.avatar_img?
                            <FastImage
                                style={{width:15, height:15, borderRadius:3}}
                                source={{
                                    uri: `${Globals.uri}${user.avatar_img}`,
                                    priority: FastImage.priority.normal,
                                }}
                                resizeMode={FastImage.resizeMode.cover}
                            />
                            :
                            <Icon name='user-tie' type='FontAwesome5' style={{color:colors.text.a4, fontSize:13}}/>
                        }
                        <Text style={{color:colors.text.a4, fontFamily:Font.medium, fontSize:11, marginStart:5}}>{`${user.f_name} ${user.l_name}`}</Text>
                    </View>
                }
                <Text style={{fontFamily:Font.medium, fontSize:14, color:colors.text.a5}}>{comment}</Text>
            </View>
            <View style={{flexDirection:'row', alignItems:'center', width:'100%', justifyContent:'space-between', paddingHorizontal:15}}>
                <View style={{flexDirection:'row', alignItems:'center', justifyContent:'flex-start'}}>
                    <View style={{flexDirection:'row', alignItems:'center'}}>
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
                        <Text style={{fontFamily:Font.black, fontSize:11, color:colors.text.a5, marginStart:5}}>{likeNumber}</Text>
                    </View>
                    <View style={{flexDirection:'row', alignItems:'center', marginStart:15}}>
                        {
                            disLiked == true?
                            <TouchableOpacity>
                                <Icon name={'dislike1'} type={'AntDesign'}  style={{color:colors.primary.a1, fontSize:25}}/>
                            </TouchableOpacity>
                            :
                            <TouchableOpacity onPress={disLike}>
                                <Icon name={'dislike2'} type={'AntDesign'}  style={{color:colors.text.a4, fontSize:25}}/>
                            </TouchableOpacity>
                        }
                        <Text style={{fontFamily:Font.black, fontSize:11, color:colors.text.a5, marginStart:5}}>{disLikeNumber}</Text>
                    </View>
                </View>
                <View style={{flexDirection:'row', alignItems:'center'}}>
                    {
                        answerNumber > 0&&
                        <TouchableOpacity style={{flexDirection:'row', alignItems:'center', marginEnd:25}}>
                            <Text style={{fontFamily:Font.medium, fontSize:11, color:colors.text.a4}}>{`مشاهده (${answerNumber}) پاسخ`}</Text>
                        </TouchableOpacity>
                    }
                    <TouchableOpacity onPress={setAnswerForRating} style={{flexDirection:'row', alignItems:'center'}}>
                        <Text style={{fontFamily:Font.medium, fontSize:11, color:colors.text.a4, marginEnd:5}}>{'ارسال پاسخ'}</Text>
                        <Icon name={'reply'} type={'Entypo'}  style={{color:colors.text.a4, fontSize:20}}/>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};
const areEqual = (prevProps, nextProps) => {
    if (prevProps._id !== nextProps._id) return false;
    if (prevProps.likeNumbers !== nextProps.likeNumbers) return false;
    if (prevProps.disLikeNumbers !== nextProps.disLikeNumbers) return false;
    if (prevProps.answerNumbers !== nextProps.answerNumbers) return false;
    if (prevProps.grade !== nextProps.grade) return false;
    if (prevProps.date !== nextProps.date) return false;
    if (prevProps.comment !== nextProps.comment) return false;
    return true;
};
export default React.memo(CommentRating, areEqual)