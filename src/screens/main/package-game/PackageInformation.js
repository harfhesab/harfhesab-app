import React, {useState, useEffect} from 'react';
import {StyleSheet, View, Text, Dimensions, TouchableOpacity, ScrollView} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import useAppTheme from '../../../hooks/theme/useAppTheme';
import GeneralHeader from '../../../components/header/GeneralHeader';
import ImageComponent from '../../../components/image-components/ImageComponent';
import { IS_TABLET_CONDITION } from '../../../utils/constants/constants';

const {width, height} = Dimensions.get("window")
function PackageInformation(props){
    const colors = useAppTheme()
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [getError, setGetError] = useState(false)

    useEffect(()=>{
        getData()
    }, [])
    const getData = async()=>{
        await axios({
            url:'/',
            method:'post',
            data: {
                query : `
                    query getPackageInformation(
                        $_id : ID,
                    ){
                        getPackageInformation(
                            _id : $_id,
                        ) {
                            _id,
                            title,
                            description,
                            subject,
                            badg,
                            language_ref{name},
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
                        }
                    }
                `,
                variables : {
                    "_id" : props?.route?.params?._id,
                }
            }
        }).then(async(response)=>{
            const data = response.data.data?.getPackageInformation
            if(data){
                setData(data)
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
        <View style={{flex:1}}>
            <GeneralHeader
                title={"بسته‌های بازی"}
                height={60}
                coin={true}
            />
            <LinearGradient colors={colors.background_gradient} style={{width:width, height:height}}>
                <View style={styles.container}>
                    {
                        loading?
                        <ScreenLoading
                            loading={loading}
                            getError={getError}
                            noItem={noItem}
                            tryAgain={tryAgain}
                        />
                        :
                        <ScrollView>
                            <View style={{width:width, alignItems:'center'}}>
                                <ImageComponent
                                    uri={data?.banner_image}
                                    width={IS_TABLET_CONDITION?500:width}
                                    height={IS_TABLET_CONDITION?225:width * 0.45}
                                    resizeMode="cover"
                                    borderRadius={0}
                                />
                            </View>
                            <View style={{width:width, alignItems:'center', position:'absolute'}}>
                                <ImageComponent
                                    uri={data?.icon_image}
                                    width={IS_TABLET_CONDITION?400/3:(width - 100) / 3}
                                    height={IS_TABLET_CONDITION?400/3:(width - 100) / 3}
                                    resizeMode="cover"
                                    borderRadius={0}
                                />
                            </View>
                            <View style={{width:width, alignItems:'center'}}>
                                <Text>{data?.title}</Text>
                            </View>
                        </ScrollView>
                    }
                </View>
            </LinearGradient>
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