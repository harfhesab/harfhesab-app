import React, { useState, useImperativeHandle, useRef, useMemo, useCallback } from 'react';
import {StyleSheet, View, Dimensions, TouchableOpacity, StatusBar, Text, FlatList, TouchableNativeFeedback, TextInput} from 'react-native';
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
import axios from 'axios';
import Toast from 'react-native-toast-message';
import ScreenLoading from '../ScreenLoading';
import CityItem from '../listViewItem/CityItem';
import Icon from '../../utils/Icon';
import Border from '../Border';

const {width, height} = Dimensions.get('window');
const CitySelect = React.forwardRef((props, ref)=>{
    const colors = useTheme().colors;
    const [visible, setVisible] = useState(false)
    const [data1, setData1] = useState([])
    const [data2, setData2] = useState([])
    const [data3, setData3] = useState([])
    const [loading1, setLoading1] = useState(true)
    const [loading2, setLoading2] = useState(true)
    const [notItem1, setNotItem1] = useState(false)
    const [notItem2, setNotItem2] = useState(false)
    const [getError1, setGetError1] = useState(false)
    const [getError2, setGetError2] = useState(false)
    const [screen, setScreen] = useState("province")
    const [provinceSelect, setProvinceSelect] = useState({_id:null, name: null})
    const [citySelect, setCitySelect] = useState(null)
    const [search, setSearch] = useState("")
    const [searchTimeout, setSearchTimeout] = useState(null);

    const changeSearch = (text)=>{
        setSearch(text)
        clearTimeout(searchTimeout);
        if(text.length > 1){
            setSearchTimeout(
                setTimeout(() => {
                    const newData = data2.filter(function (item) {
                        const itemData = item.title.trim().replaceAll("‌", "").replaceAll(" ", "").replaceAll("آ", "ا")
                        const textData = text.trim().replaceAll("‌", "").replaceAll(" ", "").replaceAll("آ", "ا");
                        return itemData.toString().indexOf(textData) > -1;
                    });
                    if(newData?.length > 0){
                        setData3(newData)
                    } else {
                        setData3([])
                    }
                }, 1000)
            );
        }
    }
    const onSubmitEditing = ()=>{
        if(search?.length > 0){
            const newData = data2.filter(function (item) {
                const itemData = item.title.trim().replaceAll("‌", "").replaceAll(" ", "").replaceAll("آ", "ا")
                const textData = search.trim().replaceAll("‌", "").replaceAll(" ", "").replaceAll("آ", "ا");
                return itemData.indexOf(textData) > -1;
            });
            if(newData?.length > 0){
                setData3(newData)
            } else {
                setData3([])
            }
        }
    }
    const setEmptyInput = ()=>{
        setData3([])
        setSearch("")
    }

    const open = (dialog)=>{
        setVisible(true)
        setCitySelect(dialog?.citySelect)
        if(dialog?.parent?._id){
            const _id = dialog?.parent?._id
            const name = dialog?.parent?.name
            setProvinceSelect({_id:_id, name:name})
            setScreen("city")
            getCity(_id)
        } else {
            getProvince()
            setScreen("province")
        }
    }
    const close = () => {
        setVisible(false)
        setData3([])
        setSearch("")
    }
    useImperativeHandle(ref, ()=>({
        open
    }))
    const getProvince = async() => {
        // const header = createApiKey(props.kioskApiKey, props.kioskApiSecret)
        // let cartID = {"X-Cart-Temp-Id": props.cartTempID}
        // Object.assign(header, cartID)
        // let config = {
        //     method: 'get',
        //     url: `${Globals.baseURL}/kiosk/api/v1/locations/states`,
        //     headers: header,
        // };
        // await axios.request(config)
        // .then(async(response) => {
        //     const data = response.data
        //     if(data?.status == 200){
        //         setLoading1(false)
        //         setData1(data.data)
        //     } else {
        //         setGetError1(true)
        //         Toast.show({
        //             text1:"مشکلی پیش آمد. دوباره تلاش کنید",
        //             type:'error'
        //         })
        //     }
        // })
        // .catch((err) => {
        //     setGetError1(true)
        //     Toast.show({
        //         text1:"مشکلی پیش آمد. دوباره تلاش کنید",
        //         type:'error'
        //     })
        // });
    }
    const getCity = async(_id) => {
        // const header = createApiKey(props.kioskApiKey, props.kioskApiSecret)
        // let cartID = {"X-Cart-Temp-Id": props.cartTempID}
        // Object.assign(header, cartID)
        // let config = {
        //     method: 'get',
        //     url: `${Globals.baseURL}/kiosk/api/v1/locations/${_id?_id:provinceSelect?._id}/cities`,
        //     headers: header,
        // };
        // await axios.request(config)
        // .then(async(response) => {
        //     const data = response.data
        //     if(data?.status == 200){
        //         setLoading2(false)
        //         setData2(data.data)
        //     } else {
        //         setGetError2(true)
        //         Toast.show({
        //             text1:"مشکلی پیش آمد. دوباره تلاش کنید",
        //             type:'error'
        //         })
        //     }
        // })
        // .catch((err) => {
        //     setGetError2(true)
        //     Toast.show({
        //         text1:"مشکلی پیش آمد. دوباره تلاش کنید",
        //         type:'error'
        //     })
        // });
    }
    const tryAgain = async()=>{
        if(screen == "province"){
            setLoading1(true)
            setGetError1(false)
            getProvince()
        } else {
            const _id = provinceSelect._id
            setLoading2(true)
            setGetError2(false)
            getCity(_id)
        }
    }
    const itemSeparatorComponent = ()=>{
        return(
            <Border
                height={1}
                horizontal={15}
                top={0}
                bottom={0}
            />
        )
    }
    const renderItem1 = useCallback(({item, index})=>(
        <CityItem
            key={`${index}_${item.title}`}
            title={item?.title}
            titleColor={colors.text}
            textSize={17}
            arrow={true}
            height={60}
            horizontal={20}
            click={()=>{
                if(item.id == provinceSelect._id && data2.length > 0){
                    setScreen("city")
                    setLoading2(false)
                    setGetError2(false)
                    setNotItem2(false)
                } else {
                    setLoading2(true)
                    setGetError2(false)
                    setNotItem2(false)
                    setScreen("city")
                    const _id = item.id
                    getCity(_id)
                    setProvinceSelect({_id:item.id, name:item.title})
                }
            }}
        />
    ), [])
    const renderItem2= useCallback(({item, index})=>(
        <CityItem
            key={`${index}_${item.title}`}
            title={item?.title}
            titleColor={colors.text}
            textSize={17}
            arrow={true}
            height={60}
            horizontal={20}
            click={()=>{
                const callback = {
                    province_id:provinceSelect._id,
                    province_name:provinceSelect.name,
                    city_id:item?.id,
                    city_name:item?.title
                }
                citySelect?.func(callback)
                close()
            }}
        />
    ), [citySelect, provinceSelect])
    const keyExtractor = (item,index)=>index.toString()
    const memoizedValue1 = useMemo(() => renderItem1, [data1]);
    const memoizedValue2 = useMemo(() => renderItem2, [search.length > 0?data3:data2]);
    return(
        <Modal 
            swipeDirection={['down']}
            swipeThreshold={180}
            backdropOpacity={0.55}
            onBackButtonPress={()=>{
                if(screen == "province"){
                    close()
                } else {
                    setScreen("province")
                    setLoading2(true)
                    setGetError2(false)
                    setNotItem2(false)
                    setData3([])
                    setSearch("")
                    if(data1.length == 0){
                        getProvince()
                    }
                }
            }}
            onSwipeComplete={close}
            isVisible={visible}
            onBackdropPress={close}
            useNativeDriverForBackdrop={true}
            style={{justifyContent:'flex-end', alignItems:'center', margin: 0}}
        >
            <StatusBar backgroundColor={props.darkMode?"#000000":"#00000005"} barStyle={"light-content"}/>
            <TouchableOpacity activeOpacity={1} style={[styles.modalContainer, {height:height*0.6, backgroundColor:colors.background, borderTopStartRadius:40, borderTopEndRadius:40}]}>
                {
                    ((screen == "province" && loading1 == true) || (screen == "city" && loading2 == true))?
                    <View style={{flex:1}}>
                        <ScreenLoading
                            getError={screen == "province"?getError1:getError2}
                            notItem={screen == "province"?notItem1:notItem2}
                            tryAgain={tryAgain}
                        />
                    </View>
                    :
                    <View style={{flex:1}}>
                        <View style={{width:width, alignItems:'center', backgroundColor:colors.background, elevation:3, shadowColor:"#000", borderTopStartRadius:40, borderTopEndRadius:40, borderBottomColor:colors.border, borderBottomWidth:2}}>
                            <View style={{width:width, height:screen == 'city'?70:80, flexDirection:'row', alignItems:'center', paddingHorizontal:15, columnGap:10}}>
                                <TouchableNativeFeedback
                                    onPress={()=>{
                                        if(screen == "province"){
                                            close()
                                        } else {
                                            setScreen("province")
                                            setSearch("")
                                            setData3([])
                                            setLoading2(true)
                                            setGetError2(false)
                                            setNotItem2(false)
                                            if(data1.length == 0){
                                                getProvince()
                                            }
                                        }
                                    }} 
                                    background={TouchableNativeFeedback.Ripple(colors.border,false)}
                                >
                                    <View pointerEvents='box-only' style={{justifyContent:'center', alignItems:'center', padding:5}}>
                                        <Icon name={screen=="province"?"x-circle":"arrow-right"} type='Feather' style={{color:colors.text4, fontSize:30}}/>
                                    </View>
                                </TouchableNativeFeedback>
                                <Text style={{fontFamily:Font.medium, fontSize:16, color:colors.text4}}>{screen=="province"?"لیست استان‌ها":`شهرهای استان ${provinceSelect.name}`}</Text>
                            </View>
                            {
                                screen == 'city'&&
                                <View style={{width:width - 30, flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom:5, backgroundColor:colors.background4, paddingHorizontal:15, borderWidth:1.5, borderRadius:35, borderColor:colors.border, alignSelf:'center'}}>
                                        <TextInput
                                            placeholder={`جستجوی شهرهای استان ${provinceSelect.name}`}
                                            placeholderTextColor={colors.text5}
                                            selectionColor={Globals.data.configs.colors.rgba1}
                                            cursorColor={colors.color}
                                            returnKeyType={'search'}
                                            value={search}
                                            enablesReturnKeyAutomatically={true}
                                            autoFocus={false}
                                            onChangeText={changeSearch}
                                            onSubmitEditing={onSubmitEditing}
                                            keyboardType={"default"}
                                            style={{width:width-95, fontSize:16, textAlignVertical:'center', color:colors.text, fontFamily:Font.medium, height:50}}
                                        />
                                        {
                                           search.length > 0?
                                            <TouchableNativeFeedback onPress={setEmptyInput} background={TouchableNativeFeedback.Ripple(colors.border,false)}>
                                                <View pointerEvents='box-only' style={{justifyContent:'center', alignItems:'center', padding:5}}>
                                                    <Icon name={"close"} type='MaterialCommunityIcons' style={{color:colors.text4, fontSize:25}}/>
                                                </View>
                                            </TouchableNativeFeedback>
                                            :
                                            <View style={{padding:5}}>
                                                <Icon name='search' type='Feather' style={{ fontSize:23, color:colors.text4}}/>
                                            </View>
                                        }
                                </View>
                            }
                        </View>
                        <FlatList
                            style={{flex:1}}
                            showsVerticalScrollIndicator={true}
                            data={screen == 'province'?data1:(search.length > 0 && data3.length > 0)?data3:data2}
                            keyExtractor={keyExtractor}
                            renderItem={screen == 'province'?memoizedValue1:memoizedValue2}
                            initialNumToRender={30}
                            ItemSeparatorComponent={itemSeparatorComponent}
                        />
                    </View>
                }
            </TouchableOpacity>
        </Modal>
    )
})
const styles = StyleSheet.create({
    modalContainer:{
        alignItems:'center',
        flexDirection:'column',
        justifyContent:'space-between',
        width:width,
    },
})
const mapStateToProps = (state) => {
    return {
        darkMode: state.main.darkMode,
        kioskApiKey: state.kioskAccount.kioskApiKey,
        kioskApiSecret: state.kioskAccount.kioskApiSecret,
    }
}
export default connect(mapStateToProps, null, null, {forwardRef:true})(CitySelect)