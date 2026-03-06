import React, {useState, useEffect} from 'react';
import {StyleSheet, View, Text, Dimensions, TouchableOpacity, SafeAreaView, ScrollView, TouchableNativeFeedback} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../redux/store/RootReducer';
import { changeName, login, logout } from '../../../redux/slices/accountSlice';
import useAppTheme from '../../../hooks/theme/useAppTheme';
import GeneralHeader from '../../../components/header/GeneralHeader';
import Icon from '../../../utils/Icon';
import Font from '../../../utils/Font';
import SimpleItem from '../../../components/list-view-items/SimpleItem';
import Border from '../../../components/Border';
import ButtonGradient from '../../../components/buttons/ButtonGradient';
import LinearGradient from 'react-native-linear-gradient';
import ScreenLoading from '../../../components/screen-loading/ScreenLoading';
import InputText from '../../../components/inputs/InputText';
import BottomDrawer from '../../../components/bottom-drawer/BottomDrawer';
import BottomDrawerHelper from '../../../components/bottom-drawer/BottomDrawerHelper';
import axios from 'axios';
import { increaseNumberCoins } from '../../../redux/slices/coinSlice';
import Calendar from '../../../components/calendar/Calendar';
import CalendarHelper from '../../../components/calendar/CalendarHelper';
import { toGregorian, toJalaali} from 'jalaali-js';
import AlertHelper from '../../../components/alert/AlertHelper';
import { showToast } from '../../../components/custom-toast/ToastRef';

const {width, height} = Dimensions.get("window")
function AccountManagement(props){
    const colors = useAppTheme()
    const dispatch = useDispatch();
    const { numberCoins } = useSelector((state) => state.coins);
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [gender, setGender] = useState(null)
    const [birthday, setBirthday] = useState(null)
    const [showDatePicker, setShowDatePicker] = useState(false)
    const [loading, setLoading] = useState(false)
    const [loading2, setLoading2] = useState(false)
    const [getError, setGetError] = useState(false)
    const genderList = [
        {_id:0, text1:"آقا", type:"male"},
        {_id:1, text1:"خانم", type:"female"},
        {_id:2, text1:"تعیین نشده", type:"not-specified"},
    ]
    

    useEffect(()=>{
        getData()
    }, [])
    
    const getData = async()=>{
        await axios({
            url:'/',
            method:'post',
            data: {
                query : `
                    query getUserAccountInformation(
                        $_id : ID
                    ){
                        getUserAccountInformation(
                            _id : $_id,
                        ) {
                            first_name,
                            last_name,
                            gender,
                            birthday,
                        }
                    }
                `,
                variables : {
                    "_id" : null,
                }
            }
        }).then(async(response)=>{
            const dataReceived = response.data.data?.getUserAccountInformation
            if(dataReceived){
                setFirstName(dataReceived?.first_name??"")
                setLastName(dataReceived?.last_name??"")
                if(dataReceived?.first_name || dataReceived?.last_name){
                    const name = [ dataReceived?.first_name, dataReceived?.last_name ].filter(Boolean).join(' ')
                    dispatch(changeName({name: name}))
                }
                if(dataReceived?.gender){
                    const genderItem = genderList.find((i)=>i.type == dataReceived?.gender)
                    if(genderItem){
                        setGender(genderItem)
                    }
                }
                if(dataReceived?.birthday){
                    const date = new Date(dataReceived?.birthday);
                    const { jy, jm, jd } = toJalaali(
                        date.getFullYear(),
                        date.getMonth() + 1,
                        date.getDate()
                    );
                    const shamsiDate = `${jy}/${jm.toString().padStart(2, '0')}/${jd.toString().padStart(2, '0')}`;
                    setBirthday(shamsiDate)
                }
            }
            setLoading(false)
        }).catch((e)=>{
            setLoading(true)
            setGetError(true)
        })
    }

    const tryAgain = ()=>{
        setLoading(true)
        setGetError(false)
        getData()
    }

    const changeGender = ()=>{
        BottomDrawerHelper.showBottomDrawer({
            title:"جنسیت کاربر",
            list:genderList,
            buttons:[
                {
                    text:"انتخاب جنسیت",
                    onPress:(res)=>{
                        setGender(genderList[res?.radio])
                    },
                    type:"bold"
                }
            ],
            options:{
                listType: "radio-button",
                radioSelected: gender?._id??null
            }
        })
    }
    
    const callBackCalendar = (date)=>{
        setBirthday(date)
    }
    const changeBirthday = ()=>{
        CalendarHelper.open({
            callBack:{
                callBackCalendar:(date)=>callBackCalendar(date)
            },
        })
    }

    const confirmInformation = async()=>{
        let convertBirthday = undefined
        const test = new Date()
        if(birthday){
            const shamsiDate = birthday;
            const [jy, jm, jd] = shamsiDate.split('/').map(Number);
            const { gy, gm, gd } = toGregorian(jy, jm, jd);
            convertBirthday = new Date(gy, gm - 1, gd);
        }
        setLoading2(true)
        await axios({
            url:'/',
            method:'post',
            data: {
                query : `
                mutation savingUserAccountInformationByUser(
                        $first_name : String,
                        $last_name : String,
                        $gender : String,
                        $birthday : Date,
                        $number_coins : Int,
                    ){
                    savingUserAccountInformationByUser(
                        first_name : $first_name,
                        last_name : $last_name,
                        gender : $gender,
                        birthday : $birthday,
                        number_coins : $number_coins
                    ) {
                        status,
                        message,
                        reward,
                        number,
                    }
                }
                `,
                variables : {
                    "first_name" : firstName.trim()?.length > 0?firstName:undefined,
                    "last_name" : lastName.trim()?.length > 0?lastName:undefined,
                    "gender" : gender?.type??undefined,
                    "birthday" : convertBirthday,
                    "number_coins" : numberCoins
                }
            }
        }).then((response)=>{
            setLoading2(false)
            const data = response.data.data?.savingUserAccountInformationByUser
            if(data?.status == 200){
                const btn = [
                    {
                        text: "متوجه شدم",
                        onPress: () => {
                            props.navigation.goBack()
                        },
                        type:'bold'
                    },
                ]
                if(data?.reward !== true){
                    btn.push({
                        text: "تکمیل اطلاعات",
                        onPress: () => {},
                        type:'border'
                    })
                }
                AlertHelper.showAlert({
                    body: data?.message??"اطلاعات حساب کاربری با موفقیت ذخیره شد.",
                    buttons: btn,
                    options : {
                        type: 'success',
                        cancelable: true
                    },
                });
                if(data?.reward == true){
                    dispatch(increaseNumberCoins({number:data?.number}))
                }
                if(firstName.trim()?.length > 0 || lastName.trim()?.length > 0){
                    const name = [ firstName, lastName ].filter(Boolean).join(' ')
                    dispatch(changeName({name: name}))
                }
            }
        }).catch((error)=>{
            showToast({
                title: "خطا در ثبت اطلاعات",
                message: "مشکلی پیش آمد، پس از اطمینان از اتصال دستگاه خود به اینترنت دوباره تلاش کنید.",
                type: "error",
                animationType: "slide",
                position: "top",
                duration:7000
            });
            setLoading2(false)
        })
    }

    return(
        <View style={{flex:1, backgroundColor:colors.background.a1}}>
            <GeneralHeader
                coin={true}
                title={"مدیریت حساب کاربری"}
                back={true}
            />
            <View style={{flex:1, alignItems:'center'}}>
                {
                    loading == true?
                    <View style={{flex:1, width:"100%", alignItems:'center', justifyContent:'center'}}>
                        <ScreenLoading
                            loading={loading}
                            getError={getError}
                            noItem={false}
                            tryAgain={tryAgain}
                        />
                    </View>
                    :
                    <ScrollView>
                        <View style={{marginTop:20, width:width, paddingHorizontal:20}}>
                            <InputText
                                title={"نام"}
                                placeholder={"نام"}
                                value={firstName}
                                maxLength={100}
                                height={60}
                                onChangeText={(text)=>setFirstName(text)}
                                borderWidth={1}
                                fontSize={16}
                                borderRadius={10}
                                clearText={()=>setFirstName("")}
                            />
                        </View>
                        <View style={{marginTop:20, width:width, paddingHorizontal:20}}>
                            <InputText
                                title={"نام خانوادگی"}
                                placeholder={"نام خانوادگی"}
                                value={lastName}
                                maxLength={100}
                                height={60}
                                onChangeText={(text)=>setLastName(text)}
                                borderWidth={1}
                                fontSize={16}
                                borderRadius={10}
                                clearText={()=>setLastName("")}
                            />
                        </View>
                        <View style={{marginTop:20, width:width, paddingHorizontal:20}}>
                            <Text style={{fontFamily:Font.medium, fontSize:14, color:colors.text.a1, marginBottom:5}}>{"جنسیت"}</Text>
                            <TouchableOpacity activeOpacity={0.7} onPress={changeGender} style={{backgroundColor:`${colors.primary.a1}25`, width:"100%", height:65, borderColor:colors.border.a1, borderWidth:1, alignItems:'flex-start', justifyContent:'center', paddingHorizontal:10, borderRadius:10}}>
                                <Text style={{fontFamily:Font.medium, fontSize:16, color:gender?colors.text.a1:colors.text.a6}}>{!gender?"جنسیت":gender.text1}</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{marginTop:20, width:width, paddingHorizontal:20}}>
                            <Text style={{fontFamily:Font.medium, fontSize:14, color:colors.text.a1, marginBottom:5}}>{"تاریخ تولد"}</Text>
                            <TouchableOpacity activeOpacity={0.7} onPress={changeBirthday} style={{backgroundColor:`${colors.primary.a1}25`, width:"100%", height:65, borderColor:colors.border.a1, borderWidth:1, alignItems:'flex-start', justifyContent:'center', paddingHorizontal:10, borderRadius:10}}>
                                <Text style={{fontFamily:Font.medium, fontSize:16, color:birthday?colors.text.a1:colors.text.a6}}>{!birthday?"تاریخ تولد":birthday}</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                }
                {
                    !loading&&
                    <View style={{width:width, height:70, backgroundColor:colors.header.background, alignItems:'center', justifyContent:'center'}}>
                        <ButtonGradient
                            text={"ثبت اطلاعات"}
                            height={55}
                            borderRadius={10}
                            width={width-40}
                            loading={loading2}
                            onPress={confirmInformation}
                            textSize={14}
                        />
                    </View>
                }
            </View>
            <BottomDrawer ref = {Ref => {BottomDrawerHelper.setRef(Ref)}}/>
            <Calendar ref = {Ref => {CalendarHelper.setRef(Ref)}}/>
        </View>
    )
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
    },
});

export default AccountManagement;