import React, {useState, useEffect} from 'react';
import {StyleSheet, View, Text, Dimensions, TouchableOpacity, ScrollView} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import useAppTheme from '../../../hooks/theme/useAppTheme';
import GeneralHeader from '../../../components/header/GeneralHeader';
import ImageComponent from '../../../components/image-components/ImageComponent';
import { IS_TABLET_CONDITION } from '../../../utils/constants/constants';
import ScreenLoading from '../../../components/screen-loading/ScreenLoading';
import axios from 'axios';
import Font from '../../../utils/Font';
import { checkExistUserPackageWithPakcageId } from '../../../realm/repositories/user/user-package-game-progress.repository';
import { useRealm } from '../../../realm';
import ButtonGradient from '../../../components/buttons/ButtonGradient';
import ButtonBorder from '../../../components/buttons/ButtonBorder';
import RatingInfo from '../../../components/rating/RatingInfo';

const {width, height} = Dimensions.get("window")
function PackageInformation(props){
    const realm = useRealm();
    const colors = useAppTheme()
    const [data, setData] = useState(null)
    const [localData, setLocalData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [getError, setGetError] = useState(false)
    const [checkUpdate, setCheckUpdate] = useState(null)
    const packageId = props?.route?.params?._id

    useEffect(()=>{
        getData()
    }, [])
    const getData = async()=>{
        const checkExist = await checkExistUserPackageWithPakcageId(realm, packageId)
        setLocalData(checkExist)
        await axios({
            url:'/',
            method:'post',
            data: {
                query : `
                    query getPackageInformationAndUserPackageStatus(
                        $_id : ID!,
                        $user_package : ID,
                    ){
                        getPackageInformationAndUserPackageStatus(
                            _id : $_id,
                            user_package : $user_package,
                        ) {
                            package{
                                _id,
                                title,
                                description,
                                subject,
                                badg,
                                language_info{name},
                                icon_image,
                                banner_image,
                                free,
                                free_with_subscription,
                                price,
                                testable,
                                number_stage,
                                number_season,
                                version_created,
                                version_updated,
                                version_deleted,
                                force_version_created,
                                force_version_updated,
                                force_version_deleted,
                                rating_number,
                                rating_average,
                                rating_info,
                                rating_some{
                                    _id,
                                    user{name},
                                    grade,
                                    comment,
                                    like,
                                    dis_like,
                                    me_set_like,
                                    me_set_dis_like,
                                    answers,
                                    createdAt,
                                },
                                seasons{title, first_media{path}},
                            },
                            user_package_status{
                                status,
                                button_text
                            }
                        }
                    }
                `,
                variables : {
                    "_id" : packageId,
                    "user_package" : checkExist?.user_package?._id??null,
                }
            }
        }).then(async(response)=>{
            const data = response.data.data?.getPackageInformationAndUserPackageStatus
            if(data){
                setData(data)
                setLoading(false)
            }
            if(checkExist?.user_package?._id){
                if(checkExist.user_package?.version_created < data.force_version_created || checkExist.user_package?.version_updated < data.force_version_updated || checkExist.user_package?.version_deleted < data.force_version_deleted){
                    setCheckUpdate("OPTIONAL_UPDATE")
                } else if(checkExist.user_package?.version_created < data.version_created || checkExist.user_package?.version_updated < data.version_updated || checkExist.user_package?.version_deleted < data.version_deleted){
                    setCheckUpdate("FORCED_UPDATE")
                }
            }
        }).catch((e)=>{
            setGetError(true)
        })
    }
    const tryAgain = ()=>{
        setLoading(true)
        setGetError(false)
        getData()
    }
    const onClickGetPackage = ()=>{
        if(data?.user_package_status.status == "get-free"){
            getForFirst()
        } else if(data?.user_package_status.status == "get-subscription"){
            getForFirst()
        } else if(data?.user_package_status.status == "get-coin-payment"){
            getForFirst()
        } else if(data?.user_package_status.status == "subscription-renewal-or-coin-payment"){
            
        } else if(data?.user_package_status.status == "redownload-content"){
            
        } else if(data?.user_package_status.status == "start-game"){
            
        }
    }
    
    const getForFirst = async()=>{
        const color = colors.primary.a1
        const status = data?.user_package_status.status
        const selectedAccessType = 
        await startSetPackageGameForUserAndGetIt({ dispatch, realm, state, status, selectedAccessType, color });
    }
    
    return(
        <View style={{flex:1, backgroundColor:colors.background.a1}}>
            <GeneralHeader
                height={60}
                coin={true}
                back={true}
            />
            <View style={styles.container}>
                {
                    loading?
                    <ScreenLoading
                        loading={loading}
                        getError={getError}
                        noItem={false}
                        tryAgain={tryAgain}
                    />
                    :
                    <ScrollView>
                        <View style={{width:width, alignItems:'center'}}>
                            <ImageComponent
                                uri={data?.package?.banner_image}
                                width={IS_TABLET_CONDITION?500:width}
                                height={IS_TABLET_CONDITION?225:width * 0.45}
                                resizeMode="cover"
                                borderRadius={0}
                            />
                        </View>
                        <View style={{width:width, flexDirection:'row', alignItems:'center', justifyContent:'flex-start', marginTop:15, gap:10, paddingHorizontal:15}}>
                            <View style={{borderWidth:1, borderColor:colors.border.a1, borderRadius:15, backgroundColor:colors.border.a1}}>
                                <ImageComponent
                                    uri={data?.package?.icon_image}
                                    width={60}
                                    height={60}
                                    resizeMode="cover"
                                    borderRadius={13}
                                />
                            </View>
                            <View style={{flexDirection:'column', alignItems:'flex-start', gap:5}}>
                                <Text style={{fontFamily:Font.medium, fontSize:16, color:colors.text.a1}}>{data?.package?.title}</Text>
                                <Text style={{fontFamily:Font.medium, fontSize:10, color:colors.text.a5}}>{data?.package?.subject}</Text>
                            </View>
                        </View>
                        <View style={{flexDirection:'row', alignItems:'center', paddingHorizontal:15, paddingTop:20, gap:5}}>
                            <InfoBox
                                title="تعداد فصل‌ها"
                                value={`${data?.package?.number_season} فصل`}
                                width={(width - 45)/4}
                            />
                            <InfoBox
                                title="تعداد مراحل"
                                value={`${data?.package?.number_stage} مرحله`}
                                width={(width - 45)/4}
                            />
                            <InfoBox
                                title="زبان"
                                value={data?.package?.language_info?.name}
                                width={(width - 45)/4}
                            />
                            <InfoBox
                                title="قیمت"
                                value={`${data?.package?.price} سکه`}
                                width={(width - 45)/4}
                            />
                        </View>
                        <View style={{width:width, flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:15, paddingTop:20}}>
                            <ButtonGradient
                                text={data?.user_package_status?.button_text}
                                textSize={14}
                                onPress={onClickGetPackage}
                                width={checkUpdate == "OPTIONAL_UPDATE" || checkUpdate =="FORCED_UPDATE"?width/2 - 20:width - 30}
                                height={50}
                                borderRadius={5}
                            />
                            {
                                (checkUpdate == "OPTIONAL_UPDATE" || checkUpdate =="FORCED_UPDATE")&&
                                <ButtonBorder
                                    text={"بروزرسانی محتوا"}
                                    height={50}
                                    width={width/2 - 20}
                                    loading={false}
                                    onPress={()=>{}}
                                    borderRadius={5}
                                    textSize={14}
                                />
                            }
                        </View>
                        <RatingInfo
                            rating_average={data?.package?.rating_average}
                            rating_info={data?.package?.rating_info}
                            reviews={data?.package?.rating_number}
                        />
                    </ScrollView>
                }
            </View>
        </View>
    )
}
const InfoBox = ({title, value, width})=>{
    const colors = useAppTheme()
    return(
        <View style={{flexDirection:'column', alignItems:'center', justifyContent:'center', gap:5, width:width, paddingVertical:10, backgroundColor:`${colors.background.a2}90`, borderRadius:10, borderColor:colors.border.a2, borderWidth:0.5}}>
            <Text style={{fontFamily:Font.medium, fontSize:12, color:colors.text.a2}}>{value}</Text>
            <Text style={{fontFamily:Font.medium, fontSize:8, color:colors.text.a6}}>{title}</Text>
        </View>
    )
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
    },
});
export default PackageInformation;