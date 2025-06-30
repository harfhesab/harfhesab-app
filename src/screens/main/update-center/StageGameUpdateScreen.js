import React, {useState, useEffect} from 'react';
import {StyleSheet, View, Text, Dimensions, TouchableOpacity, SafeAreaView} from 'react-native';
import {useTheme} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import GeneralHeader from '../../../components/header/GeneralHeader';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import ScreenLoading from '../../../components/screen-loading/ScreenLoading';
import { MaterialIndicator} from 'react-native-indicators';
import Icon from '../../../utils/Icon';
import Font from '../../../utils/Font';
import BannerText from '../../../components/BannerText';
import ButtonGradient from '../../../components/buttons/ButtonGradient';
import { setDataCheck, setStatus } from '../../../redux/slices/stageGameDownloadSlice';
import { useRealm } from '../../../realm';
import { startUpdateStageGameContentTask } from '../../../utils/background-task/StageGameContentTask';

const {width, height} = Dimensions.get("window")
function StageGameUpdateScreen(props){
    const {colors} = useTheme().colors;
    const dispatch = useDispatch();
    const state = useSelector((state) => state.stageGameDownload);
    const realm = useRealm();
    const { status, isDownloading, getError, dataCheck, downloadFinished } = useSelector((state) => state.stageGameDownload);
    const { versionCreatedContent, versionUpdatedContent, versionDeletedContent } = useSelector((state) => state.stageGamePersist);
    const [firstCheckLoading, setFirstCheckLoading] = useState(true)
    const [firstCheckGetError, setFirstCheckGetError] = useState(false)
    const updateMessage = status == "up-to-date"?
    "محتوای جدیدی برای بروزرسانی بازی مرحله‌ای یافت نشد."
    :status == "need-update"?
    `محتوای جدیدی برای بروزرسانی بازی مرحله‌ای یافت شد. توجه کنید بروزرسانی محتوا ممکن است لحظاتی طول بکشد.`
    :status == "force-update"&&
    `محتوای جدیدی برای بروزرسانی بازی مرحله‌ای یافت شد. توجه کنید بروزرسانی محتوا ممکن است لحظاتی طول بکشد.\nدریافت این بروزرسانی اجباری است.`

    useEffect(() => {
        if(isDownloading == false && status !== "need-update" || status !== "force-update"){
            firstCheck()
        } else {
            setFirstCheckLoading(false)
            setFirstCheckGetError(false)
        }
    }, []);
    const firstCheck = async() => {
        await axios({
            url:'/',
            method:'post',
            data: {
                query : `
                    query checkStageGameContentVersion(
                        $version_created : Int!,
                        $version_updated : Int!,
                        $version_deleted : Int!,
                    ){
                        checkStageGameContentVersion(
                            version_created : $version_created,
                            version_updated : $version_updated,
                            version_deleted : $version_deleted,
                        ) {
                            version_created,
                            version_updated,
                            version_deleted,
                            force_version_created,
                            force_version_updated,
                            force_version_deleted,
                        }
                    }
                `,
                variables : {
                    "version_created" : versionCreatedContent,
                    "version_updated" : versionUpdatedContent,
                    "version_deleted" : versionDeletedContent
                }
            }
        }).then((response)=>{
            const data = response.data?.data?.checkStageGameContentVersion
            if(data){
                dispatch(setDataCheck({data:data}))
                if(data?.force_version_created > versionCreatedContent || data?.force_version_updated > versionUpdatedContent || data?.force_version_deleted > versionDeletedContent) {
                    dispatch(setStatus({status: "force-update"}))
                } else if(data?.version_created > versionCreatedContent || data?.version_updated > versionUpdatedContent || data?.version_deleted > versionDeletedContent){
                    dispatch(setStatus({status: "need-update"}))
                } else {
                    dispatch(setStatus({status: "up-to-date"}))
                }
                setFirstCheckLoading(false)
            } else {
                setFirstCheckGetError(true)
            }
        }).catch((err)=>{
            setFirstCheckGetError(true)
        })
    }
    const tryAgainFirstCheck = ()=>{
        setFirstCheckLoading(true)
        setFirstCheckGetError(false)
        firstCheck()
    }
    const downloadUpdates = async()=>{
        const color = colors.primary.a1
        const versionContent = { versionCreatedContent, versionUpdatedContent, versionDeletedContent }
        await startUpdateStageGameContentTask({ dispatch, realm, state, versionContent, color });
    }
    
    return(
        <SafeAreaView>
            <LinearGradient colors={colors.background_gradient} style={{width:width, height:height}}>
                <View style={styles.container}>
                    <GeneralHeader
                        back={true}
                        title={"بروزرسانی محتوای بازی مرحله‌ای"}
                    />
                    {
                        firstCheckLoading?
                        <ScreenLoading
                            loading={firstCheckLoading}
                            getError={firstCheckGetError}
                            noItem={false}
                            LoadingComponent={()=>(
                                <MaterialIndicator color={colors.text.a2} size={100} trackWidth={2}/>
                            )}
                            tryAgain={tryAgainFirstCheck}
                        />
                        :
                        <View style={{flex:1}}>
                            {
                                status == "up-to-date"?
                                <View style={{width:'100%', height:'100%', alignItems:'center', justifyContent:'center', gap:50}}>
                                    <Icon name={"tooltip-check"} type={"MaterialCommunityIcons"} style={{fontSize:150, color:colors.primary.a1}}/>
                                    <BannerText
                                        text1={"بروزرسانی جدیدی یافت نشد!"}
                                        text2={updateMessage}
                                        width={width-60}
                                        height={180}
                                        iconName={"sticker-check"}
                                        iconType={"MaterialCommunityIcons"}
                                        iconRepeat={true}
                                    />
                                </View>
                                :
                                (status == "need-update" || status == "force-update")?
                                (<View style={{flex:1, alignItems:'center', justifyContent:'space-between', paddingTop:20, paddingBottom:100}}>
                                    <View style={{width:'100%', alignItems:'center', gap:20}}>
                                        <Icon name={"tooltip-plus"} type={"MaterialCommunityIcons"} style={{fontSize:70, color:colors.primary.a1}}/>
                                        <BannerText
                                            text1={"بروزرسانی جدیدی یافت شد!"}
                                            text2={updateMessage}
                                            textAlignText2={'justify'}
                                            alignItemsText2={'flex-start'}
                                            width={width-60}
                                            height={230}
                                            iconName={"sticker-alert"}
                                            iconType={"MaterialCommunityIcons"}
                                            iconRepeat={true}
                                        />
                                    </View>
                                    <View>
                                        <ButtonGradient
                                            height={65}
                                            width={width - 60}
                                            text={getError == true?"تلاش مجدد برای دریافت بروزرسانی":"دریافت بروزرسانی"}
                                            onPress={downloadUpdates}
                                            loading={isDownloading}
                                            textSize={getError == true?12:18}
                                            borderRadius={10}
                                        />
                                    </View>
                                </View>)
                                :(status == "" && downloadFinished == true)&&
                                (<View style={{flex:1, alignItems:'center', justifyContent:'space-between', paddingTop:20, paddingBottom:100}}>
                                    <View style={{width:'100%', alignItems:'center', gap:20}}>
                                        <Icon name={"tooltip-check"} type={"MaterialCommunityIcons"} style={{fontSize:70, color:colors.primary.a1}}/>
                                        <BannerText
                                            text1={"بروزرسانی با موفقیت انجام شد!"}
                                            text2={`بروز رسانی محتوای بازی مرحله‌ای با موفقیت بارگیری و ذخیره شد.\nشما میتوانید بازی مرحله‌ای را حتی بدون اتصال به شبکه اینترنت نیز بازی کنید.`}
                                            textAlignText2={'justify'}
                                            alignItemsText2={'flex-start'}
                                            width={width-60}
                                            height={230}
                                            iconName={"sticker-check"}
                                            iconType={"MaterialCommunityIcons"}
                                            iconRepeat={true}
                                        />
                                    </View>
                                </View>)
                            }
                        </View>
                    }
                </View>
            </LinearGradient>
        </SafeAreaView>
    )
}
const styles = StyleSheet.create({
    container: {
        flex:1
    }
});
export default StageGameUpdateScreen;