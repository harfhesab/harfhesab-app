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

const {width, height} = Dimensions.get("window")
function PackageInformation(props){
    const realm = useRealm();
    const colors = useAppTheme()
    const [data, setData] = useState(null)
    const [localData, setLocalData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [getError, setGetError] = useState(false)
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
        }).catch((e)=>{
            setGetError(true)
        })
    }
    const tryAgain = ()=>{
        setLoading(true)
        setGetError(false)
        getData()
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
                        <View style={{flexDirection:'row', alignItems:'center', paddingHorizontal:15, paddingTop:20}}>
                            <ButtonGradient
                                text={data?.user_package_status?.button_text}
                                textSize={14}
                                onPress={()=>{}}
                                width={width - 30}
                                height={50}
                                borderRadius={5}
                            />
                        </View>
                    </ScrollView>
                }
            </View>
        </View>
    )
}
const InfoBox = ({title, value, width})=>{
    const colors = useAppTheme()
    return(
        <View style={{flexDirection:'column', alignItems:'center', justifyContent:'center', gap:5, width:width, paddingVertical:10, backgroundColor:"#00101299", borderRadius:10, borderColor:colors.border.a1, borderWidth:1}}>
            <Text style={{fontFamily:Font.medium, fontSize:12, color:colors.text.a2}}>{value}</Text>
            <Text style={{fontFamily:Font.medium, fontSize:8, color:colors.text.a5}}>{title}</Text>
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