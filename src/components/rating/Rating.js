import React, {useState} from 'react';
import {StyleSheet, StatusBar, View, Text, Dimensions, TouchableOpacity, TextInput, ToastAndroid} from 'react-native';
import {useTheme} from '@react-navigation/native';
import Icon from '../../utils/Icon';
import Font from '../../utils/Font';
import Globals from '../../utils/Globals';
import ButtonBorder from '../ButtonBorder';
import ButtonLinear from '../ButtonLinear';
import Modal from "react-native-modal";
import {connect} from 'react-redux';
import Toast from 'react-native-toast-message';
import axios from 'axios';

const width = Dimensions.get('window').width;
const Rating = (props) => {
    const colors = useTheme().colors;
    const [defaultRating, setDefaultRating] = useState(props.defaultRating)
    const [modalVisible, setModalVisible] = useState(false)
    const [comment, setComment] = useState(props.comment)
    const [focus, setFocus] = useState(false)
    const [loading, setLoading] = useState(false)
    const [edit, setEdit] = useState(props.edit)

    const setRatingRecordForConsultant = async()=>{
        if(props.signIn == true) {
            let data = {
                query : `
                    mutation setRecordRatingForConsultant($_id : ID, $consultant : ID, $grade : Int, $comment : String){
                        setRecordRatingForConsultant(_id : $_id,  consultant : $consultant, grade : $grade, comment : $comment) {
                            status,
                            message
                        }
                    }
                  `,
                variables : {
                    "_id" : props.previous,
                    "consultant" : props.consultant,
                    "grade" : defaultRating,
                    "comment" : comment.trim() !== ''?comment:null
                }
            }
            await axios({
                url:'/',
                method:'post',
                data: data,
            }).then(async(response)=>{
                if(response.data?.data == null){
                    ToastAndroid.showWithGravity(response.data.errors[0].data[0].message, ToastAndroid.SHORT,ToastAndroid.BOTTOM)
                } else {
                    ToastAndroid.showWithGravity(response.data.data.setRecordRatingForConsultant.message, ToastAndroid.SHORT,ToastAndroid.BOTTOM)
                    props.successOperation()
                    setFocus(false)
                    setModalVisible(false)
                    setEdit(true)
                }
                setLoading(false)
            }).catch((error)=>{
                ToastAndroid.showWithGravity('مشکلی پیش آمد دوباره تلاش کند', ToastAndroid.SHORT,ToastAndroid.BOTTOM)
                setLoading(false)
            })
        } else {
            ToastAndroid.showWithGravity('برای استفاده از همهٔ امکانات و سرویس‌های منوملک ابتدا وارد حساب کاربری خود شوید.', ToastAndroid.SHORT,ToastAndroid.BOTTOM)
            props.navigation.navigate('Login')
        }
    }
    const setRatingRecordForRealEstate = async()=>{
        if(props.signIn == true) {
            let data = {
                query : `
                    mutation setRecordRatingForAgency($_id : ID, $agency : ID, $grade : Int, $comment : String){
                        setRecordRatingForAgency(_id : $_id,  agency : $agency, grade : $grade, comment : $comment) {
                            status,
                            message
                        }
                    }
                  `,
                variables : {
                    "_id" : props.previous,
                    "agency" : props.agency,
                    "grade" : defaultRating,
                    "comment" : comment.trim() !== ''?comment:null
                }
            }
            await axios({
                url:'/',
                method:'post',
                data: data,
            }).then(async(response)=>{
                if(response.data?.data == null){
                    ToastAndroid.showWithGravity(response.data.errors[0].data[0].message, ToastAndroid.SHORT,ToastAndroid.BOTTOM)
                } else {
                    ToastAndroid.showWithGravity(response.data.data.setRecordRatingForAgency.message, ToastAndroid.SHORT,ToastAndroid.BOTTOM)
                    props.successOperation()
                    setFocus(false)
                    setModalVisible(false)
                    setEdit(true)
                }
                setLoading(false)
            }).catch((error)=>{
                ToastAndroid.showWithGravity('مشکلی پیش آمد دوباره تلاش کند', ToastAndroid.SHORT,ToastAndroid.BOTTOM)
                setLoading(false)
            })
        } else {
            ToastAndroid.showWithGravity('برای استفاده از همهٔ امکانات و سرویس‌های منوملک ابتدا وارد حساب کاربری خود شوید.', ToastAndroid.SHORT,ToastAndroid.BOTTOM)
            props.navigation.navigate('Login')
        }
    }
    const setRating = ()=>{
        if(defaultRating == 0){
            ToastAndroid.showWithGravity('ثبت یک امتیاز از 1 تا 5 الزامی است', ToastAndroid.SHORT,ToastAndroid.BOTTOM)
        } else {
            setLoading(true)
            if(props.type == 'cn'){
                setRatingRecordForConsultant()
            } else if(props.type == 'real_estate'){
                setRatingRecordForRealEstate()
            }
        }
    }
    const changeComment = (text)=>{
        setComment(text)
    }
    const openDrawer = ()=>{
        if(props.signIn == true) {
            setModalVisible(true)
        } else {
            Toast.show({
                type:'info',
                text1:'برای استفاده از همهٔ امکانات و سرویس‌های منوملک ابتدا وارد حساب کاربری خود شوید.',
                visibilityTime:5000
            })
            props.navigation.navigate('Login')
        }
    }
    const setScoreWithRating = async(i)=>{
        if(props.signIn == true) {
            await setDefaultRating(i)
            const time = setTimeout(()=>{
                setModalVisible(true)
                clearTimeout(time)
            }, 50)
        } else {
            Toast.show({
                type:'info',
                text1:'برای استفاده از همهٔ امکانات و سرویس‌های منوملک ابتدا وارد حساب کاربری خود شوید.',
                visibilityTime:5000
            })
            props.navigation.navigate('Login')
        }
    }
    const ratingBarRender = (i)=>{
        return(
          <View key={i} style={{flexDirection:'column', alignItems:'center', marginHorizontal:5}}>
            <TouchableOpacity onPress={()=>setScoreWithRating(i)} activeOpacity={0.3} style={{alignItems:'center', justifyContent:'center', width:35}}>
                {
                    (i <= defaultRating)?
                    <Icon name='star' type='AntDesign' style={{fontSize:35, color:Globals.data.configs.colors.primary_gradient_end}} />
                    :
                    <View style={{alignItems:'center', justifyContent:'center'}}>
                      <Icon name='star' type='AntDesign' style={{fontSize:35, color:`${Globals.data.configs.colors.primary_gradient_end}20`}} />
                      <Icon name='staro' type='AntDesign' style={{fontSize:35, color:`${Globals.data.configs.colors.primary_gradient_end}99`, position:'absolute'}} />
                    </View>
                }
            </TouchableOpacity> 
            <Text style={{color:colors.text5, fontFamily:Font.medium, fontSize:12}}>{i}</Text>

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
        }
    }
    const drawer = ()=>{
        return(
            <Modal 
                isVisible={modalVisible}
                swipeDirection={['down']}
                swipeThreshold={100}
                backdropOpacity={0.7}
                onBackButtonPress={closeDrawer}
                onSwipeComplete={closeDrawer}
                onBackdropPress={closeDrawer}
                useNativeDriverForBackdrop={true}
                style={{justifyContent:'flex-end', alignItems:'center', margin: 0}}
            >
                <StatusBar backgroundColor={props.darkMode?"#000000":"#00000005"} barStyle={"light-content"}/>
                <View style={[styles.modalContainer, {backgroundColor:colors.background2}]}>
                    <View style={{borderWidth:1, borderRadius:5, borderStyle:'dashed', borderColor:colors.text4, alignItems:'center', width:width-40, alignSelf:'center', backgroundColor:colors.background5, marginTop:10}}>
                        <View style={styles.starContent}>
                            {ratingBar}
                        </View>
                    </View>
                    <TextInput
                        placeholder={"نظر و بازخورد خود را بنویسید..."}
                        placeholderTextColor={colors.text5}
                        underlineColorAndroid={'transparent'}
                        multiline={true}
                        numberOfLines={6}
                        maxLength={400}
                        autoFocus={true}
                        onFocus={()=>{setFocus(true)}}
                        onBlur={()=>{setFocus(false)}}
                        onChangeText={changeComment}
                        selectionColor={Globals.data.configs.colors.rgba1}
                        cursorColor={colors.color}
                        value={comment}
                        autoCapitalize={'none'}
                        style={{width:width-40, fontFamily:Font.medium, fontSize:14, paddingHorizontal:10, alignSelf:'center', color:colors.text, borderWidth:1, borderColor:focus == true?colors.color:colors.border, borderRadius:5, textAlignVertical:'top', backgroundColor:colors.background5, maxHeight:120, marginTop:15}}
                    />
                    <View style={{width:width - 40, alignItems:'flex-end', alignSelf:'center'}}>
                        <Text style={{color:colors.text6, fontFamily:Font.medium, fontSize:14}}>{`${comment.length}/400`}</Text>
                    </View>
                    <View style={{width:width, alignItems:'center', marginTop:5}}>
                        <ButtonLinear
                            text={edit == true?'ویرایش نظر و امتیاز':'ثبت نظر و امتیاز'}
                            onPress={setRating}
                            loading={loading}
                            textSize={14}
                            width={width - 40}
                            height={50}
                            borderRadius={5}
                        />
                    </View>
                </View>
            </Modal>
        )
    }
    return (
        <View style={[styles.container, {backgroundColor:colors.background5, borderColor:colors.text4}]}>
            <Text style={{color:colors.text5, fontFamily:Font.medium, fontSize:12, textAlign:"center"}}>{props.title}</Text>
            <View style={styles.starContent}>
                {ratingBar}
            </View>
            <ButtonBorder
                text={edit == true?'ویرایش نظر و امتیاز':'ثبت نظر و امتیاز'}
                onPress={openDrawer}
                loading={false}
                textSize={12}
                width={210}
                height={35}
                borderRadius={5}
            />
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
        borderWidth:2,
        borderRadius:15,
        borderStyle:'dashed',
        paddingBottom:15,
        paddingTop:10,
        paddingHorizontal:10,
        marginVertical:10
    },
    starContent:{
        width:width-40,
        alignSelf:'center',
        flexDirection:'row-reverse',
        alignItems:'center',
        justifyContent:'center',
        marginVertical:10
    },
    modalContainer:{
        width:width,
        alignSelf:'center',
        verticalAlign:'flex-end',
        borderTopLeftRadius:20,
        borderTopRightRadius:20,
        paddingVertical:20
    },
})
const mapStateToProps = (state) => {
    return {
        signIn: state.main.signIn,
        darkMode: state.main.darkMode,
    }
}
export default connect(mapStateToProps)(React.memo(Rating))