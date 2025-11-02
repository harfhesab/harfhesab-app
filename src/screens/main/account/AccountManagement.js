import React, {useState, useEffect} from 'react';
import {StyleSheet, View, Text, Dimensions, TouchableOpacity, SafeAreaView, ScrollView, TouchableNativeFeedback} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../redux/store/RootReducer';
import { login, logout } from '../../../redux/slices/accountSlice';
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

const {width, height} = Dimensions.get("window")
function AccountManagement(props){
    const colors = useAppTheme()
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [gender, setGender] = useState(null)
    const [birthday, setBirthday] = useState(null)
    const [loading, setLoading] = useState(false)
    const [getError, setGetError] = useState(false)
    const genderList = [
        {"male" : "آقا"},
        {"female" : "خانم"},
        {"not-specified" : "تعیین نشده"},
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
            console.log(response.data)
            const dataReceived = response.data.data?.getUserAccountInformation
            if(dataReceived){
                setFirstName(dataReceived?.first_name??"")
                setLastName(dataReceived?.last_name??"")
                setGender(dataReceived?.gender??null)
                setBirthday(dataReceived?.birthday??null)
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
            list:[

            ]
        })
    }

    return(
        <View style={{flex:1, backgroundColor:colors.background.a1}}>
            <GeneralHeader
                paddingHorizontal={10}
                height={60}
                coin={true}
                title={"مدیریت حساب کاربری"}
                back={true}
            />
            <View style={{flex:1, alignItems:'center'}}>
                {
                    loading == true?
                    <View style={{flex:1, alignItems:'center', justifyContent:'center'}}>
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
                                autoFocus={true}
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
                                autoFocus={true}
                                borderRadius={10}
                                clearText={()=>setLastName("")}
                            />
                        </View>
                        <View style={{marginTop:20, width:width, paddingHorizontal:20}}>
                            <Text style={{fontFamily:Font.medium, fontSize:14, color:colors.text.a1, marginBottom:5}}>{"جنسیت"}</Text>
                            <TouchableOpacity activeOpacity={0.7} onPress={changeGender} style={{backgroundColor:`${colors.primary.a1}25`, width:"100%", height:65, borderColor:colors.border.a1, borderWidth:1, alignItems:'flex-start', justifyContent:'center', paddingHorizontal:10, borderRadius:10}}>

                            </TouchableOpacity>
                        </View>
                        
                    </ScrollView>
                }
            </View>
            <BottomDrawer ref = {Ref => {BottomDrawerHelper.setRef(Ref)}}/>
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