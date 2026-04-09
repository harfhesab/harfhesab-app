import React, { memo, useState } from "react";
import { View, TouchableOpacity, StyleSheet, Text, Dimensions, Linking } from "react-native";
import { navigate } from "../../../main/navigationService";
import Icon from "../../../utils/Icon";
import Font from "../../../utils/Font";
import useAppTheme from "../../../hooks/theme/useAppTheme";
import ImageComponent from "../../image-components/ImageComponent";
import { convertDate } from "../../../utils/ConvertDate";
import ButtonBorder from "../../buttons/ButtonBorder";
import LocalImageComponent from "../../image-components/LocalImageComponent";
import axios from "axios";
import { showToast } from "../../custom-toast/ToastRef";
import { useDispatch } from 'react-redux';
import { AppDispatch } from "../../../redux/store/Store";
import { increaseNumberCoins } from "../../../redux/slices/coinSlice";
import { updateSubscriptionStatus } from "../../../redux/slices/subscriptionSlice";

interface PackageProps {
    _id : string;
    title : string;
    icon_image : string;
}
interface Props {
  _id: string;
  title: string;
  body: string;
  link: string;
  packageInfo: PackageProps;
  freeCoinPlan : any;
  freeSubscriptionPlan : any;
  createdAt : Date;
}
const width = Dimensions.get('window').width
function NotificationCard({
    _id,
    title,
    body,
    link,
    packageInfo,
    freeCoinPlan,
    freeSubscriptionPlan,
    createdAt,
}: Props) {
    const colors = useAppTheme()
    const dispatch = useDispatch<AppDispatch>();
    const [loading1, setLoading1] = useState(false)
    const [loading2, setLoading2] = useState(false)

    const openLink = ()=>{
      Linking.openURL(link)
    }
    const openPackage = ()=>{
      if(packageInfo._id){
        navigate("PackageInformation", {_id:packageInfo._id})
      }
    }

    const getFreeCoin = async()=>{
      setLoading1(true)
      let data = {
          query : `
              mutation getFreeCoinByUser($plan : ID!){
                  getFreeCoinByUser(plan : $plan) {
                      status,
                      message,
                      number
                  }
              }
            `,
          variables : {
              "plan" : freeCoinPlan._id,
          }
      }
      await axios({
          url:'/',
          method:'post',
          data: data,
      }).then(async(response)=>{
          setLoading1(false)
          const data = response.data?.data?.getFreeCoinByUser
          if(data?.status == 200){
              const numberCoin = data?.number?data.number:freeCoinPlan.number_coin
              dispatch(increaseNumberCoins({number: numberCoin}))
              showToast({
                  title: `دریافت سکه`,
                  message: data?.message??`تعداد ${numberCoin} سکه با موفقیت به حساب کاربری شما اضافه شد.`,
                  type: "success",
                  animationType: "slide",
                  position: "top",
                  duration: 6000
              });
          } else {
              showToast({
                  title: `خطا در دریافت سکه`,
                  message: response?.data?.errors[0]?.data[0]?.message??"مشکلی در افزودن سکه پیش آمد.",
                  type: "error",
                  animationType: "slide",
                  position: "top",
                  duration: 6000
              });
          }
      }).catch((error)=>{
          setLoading1(false)
          showToast({
              title: `خطا در دریافت سکه`,
              message: "مشکلی در افزودن سکه پیش آمد.",
              type: "error",
              animationType: "slide",
              position: "top",
          });
      })
    }
    const getFreeSubscription = async()=>{
      setLoading2(true)
      let data = {
          query : `
              mutation getFreeSubscriptionByUser($plan : ID!){
                  getFreeSubscriptionByUser(plan : $plan) {
                      status,
                      message,
                      number,
                      user_subscription_status{active_subscription, subscription_expiration}
                  }
              }
            `,
          variables : {
              "plan" : freeSubscriptionPlan._id,
          }
      }
      await axios({
          url:'/',
          method:'post',
          data: data,
      }).then(async(response)=>{
          setLoading2(false)
          const data = response.data?.data?.getFreeSubscriptionByUser
          if(data?.status == 200){
              const activeSubscription = data?.user_subscription_status?.active_subscription;
              const subscriptionExpiration = data?.user_subscription_status?.subscription_expiration;
              const numberDay = data?.number?data.number:freeSubscriptionPlan.duration
              if(activeSubscription == true){
                  dispatch(updateSubscriptionStatus({activeSubscription, subscriptionExpiration}))
                  showToast({
                      title: `دریافت اشتراک`,
                      message: `اشتراک ${numberDay} روزه با موفقیت برای حساب کاربری شما فعال شد.`,
                      type: "success",
                      animationType: "slide",
                      position: "top",
                      duration: 6000
                  });
              }
          } else {
              showToast({
                  title: `خطا در دریافت اشتراک`,
                  message: response?.data?.errors[0]?.data[0]?.message??"مشکلی در فعال سازی اشتراک پیش آمد.",
                  type: "error",
                  animationType: "slide",
                  position: "top",
                  duration: 6000
              });
          }
      }).catch((error)=>{
          setLoading2(false)
          showToast({
              title: `خطا در دریافت اشتراک`,
              message: "مشکلی در فعال سازی اشتراک پیش آمد.",
              type: "error",
              animationType: "slide",
              position: "top",
          });
      })
    }

    return (
      <View style={{width:width-55, borderRadius:15, backgroundColor:colors.primary.a7, paddingHorizontal:10, paddingTop:30, paddingBottom:10, shadowColor:"#000000", elevation:2}}>
          <Text style={{fontFamily:Font.bold, fontSize:17, color:colors.text.a2, lineHeight:32}}>{title}</Text>
          <Text style={{fontFamily:Font.medium, fontSize:14, color:colors.text.a3, lineHeight:27, marginTop:20}}>{body}</Text>
          {
            (freeCoinPlan && freeCoinPlan?.number_coin > 0)&&
            <View style={{paddingVertical:20, gap:10, backgroundColor:"#00000085", borderRadius:10, paddingHorizontal:10, marginTop:15}}>
              <View style={{flexDirection:'row', alignItems:'center', gap:8}}>
                <View style={{width:50, height:50, alignItems:'center', justifyContent:'center', backgroundColor:colors.primary.a2, borderRadius:10, borderWidth:1, borderColor:colors.primary.a3}}>
                    {
                        freeCoinPlan?.icon_image?
                        <ImageComponent
                            uri={freeCoinPlan?.icon_image}
                            width={48}
                            height={48}
                            resizeMode="cover"
                            borderRadius={10}
                            blank_background={true}
                        />
                        :
                        <LocalImageComponent
                            path={require('../../../assets/image/coin.png')}
                            width={35}
                            height={35}
                            resizeMode={'stretch'}
                            blank_background={true}
                        />
                    }
                </View>
                <View style={{alignItems:'flex-start'}}>
                  <Text numberOfLines={2} style={{fontFamily:Font.medium, fontSize:12, color:colors.text.a1, lineHeight:20, width: width-155 }}>{freeCoinPlan.title}</Text>
                  <Text numberOfLines={1} style={{fontFamily:Font.medium, fontSize:10, color:colors.primary.a3, lineHeight:18}}>{`${freeCoinPlan.number_coin} سکه`}</Text>
                </View>
              </View>
              <ButtonBorder
                  text={`دریافت ${freeCoinPlan.number_coin} سکه رایگان`}
                  height={55}
                  width={width - 95}
                  loading={loading1}
                  onPress={getFreeCoin}
                  borderRadius={10}
                  textSize={14}
                  textColor={colors.primary.a1}
                  borderColor={colors.primary.a6}
              />
            </View>
          }
          {
            (freeSubscriptionPlan && freeSubscriptionPlan?.duration > 0)&&
            <View style={{paddingVertical:20, gap:10, backgroundColor:"#00000085", borderRadius:10, paddingHorizontal:10, marginTop:15}}>
              <View style={{flexDirection:'row', alignItems:'center', gap:8}}>
                <View style={{width:50, height:50, alignItems:'center', justifyContent:'center', backgroundColor:colors.primary.a2, borderRadius:10, borderWidth:1, borderColor:colors.primary.a3}}>
                    {
                        freeSubscriptionPlan?.icon_image?
                        <ImageComponent
                            uri={freeSubscriptionPlan?.icon_image}
                            width={48}
                            height={48}
                            resizeMode="cover"
                            borderRadius={10}
                            blank_background={true}
                        />
                        :
                        <LocalImageComponent
                            path={require('../../../assets/image/diamond.png')}
                            width={35}
                            height={35}
                            resizeMode={'stretch'}
                            blank_background={true}
                        />
                    }
                </View>
                <View style={{alignItems:'flex-start'}}>
                  <Text numberOfLines={2} style={{fontFamily:Font.medium, fontSize:12, color:colors.text.a1, lineHeight:20, width: width-155 }}>{freeSubscriptionPlan.title}</Text>
                  <Text numberOfLines={1} style={{fontFamily:Font.medium, fontSize:10, color:colors.primary.a6, lineHeight:18}}>{`${freeSubscriptionPlan.duration} روز اشتراک`}</Text>
                </View>
              </View>
              <ButtonBorder
                  text={`دریافت ${freeSubscriptionPlan.duration} روز اشتراک رایگان`}
                  height={55}
                  width={width - 95}
                  loading={loading2}
                  onPress={getFreeSubscription}
                  borderRadius={10}
                  textSize={14}
                  textColor={colors.primary.a1}
                  borderColor={colors.primary.a6}
              />
            </View>
          }
          {
            packageInfo&&
            <TouchableOpacity activeOpacity={0.6} onPress={openPackage} style={{marginTop:20}}>
              <View style={{flexDirection:'row', alignItems:'center', gap:8}}>
                <View style={{width:50, height:50, alignItems:'center', justifyContent:'center', backgroundColor:colors.primary.a2, borderRadius:10, borderWidth:1, borderColor:colors.primary.a3}}>
                    {
                        packageInfo?.icon_image?
                        <ImageComponent
                            uri={packageInfo?.icon_image}
                            width={48}
                            height={48}
                            resizeMode="cover"
                            borderRadius={10}
                            blank_background={true}
                        />
                        :
                        <Icon name={'camera-off'} type={'Feather'} style={{fontSize:30, color:colors.text.a5}}/>
                    }
                </View>
                <Text style={{fontFamily:Font.medium, fontSize:14, color:colors.text.a1, lineHeight:30, width: width-135}}>{packageInfo.title}</Text>
              </View>
            </TouchableOpacity>
          }
          {
            (link && link.length>7)&&
            <View style={{width:"100%", alignItems:'flex-end', marginTop:20}}>
              <TouchableOpacity activeOpacity={0.6} onPress={openLink}>
                <Text style={{fontFamily:Font.medium, color:colors.primary.a6, fontSize:14}}>{link}</Text>
              </TouchableOpacity>
            </View>
          }
          <View style={{width:"100%", alignItems:'flex-end', marginTop:15}}>
            <Text style={{fontFamily:Font.medium, fontSize:10, color:colors.text.a5}}>{convertDate(createdAt)}</Text>
          </View>
      </View>
    );
}



export default memo(NotificationCard);
