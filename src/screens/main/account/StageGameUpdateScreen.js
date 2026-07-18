import React, {useState, useEffect} from 'react';
import {StyleSheet, View, Text, Dimensions, TouchableOpacity, SafeAreaView} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import GeneralHeader from '../../../components/header/GeneralHeader';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import ScreenLoading from '../../../components/screen-loading/ScreenLoading';
import { MaterialIndicator} from 'react-native-indicators';
import Icon from '../../../utils/Icon';
import Font from '../../../utils/Font';
import ButtonGradient from '../../../components/buttons/ButtonGradient';
import { setDataCheck, setStatus } from '../../../redux/slices/stageGameDownloadSlice';
import { useRealm } from '../../../realm';
import { startUpdateStageGameContentTask } from '../../../utils/background-task/StageGameContentTask';
import useAppTheme from '../../../hooks/theme/useAppTheme';
import LoadingBar from '../../../components/screen-loading/LoadingBar';

const {width, height} = Dimensions.get("window")
function StageGameUpdateScreen(props){
    const colors = useAppTheme()
    const dispatch = useDispatch();
    const state = useSelector((state) => state.stageGameDownload);
    const realm = useRealm();
    const { status, isDownloading, getError, dataCheck, downloadFinished } = useSelector((state) => state.stageGameDownload);
    const { versionCreatedContent, versionUpdatedContent, versionDeletedContent } = useSelector((state) => state.stageGamePersist);
    const [firstCheckLoading, setFirstCheckLoading] = useState(true)
    const [firstCheckGetError, setFirstCheckGetError] = useState(false)
    const title = (status == "need-update" || status == "force-update")?"محتوای جدیدی برای دریافت موجود است!":"محتوای بازی به آخرین نسخه بروز است!"

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
        if(status == "need-update" || status == "force-update"){
            const color = colors.primary.a1
            const versionContent = { versionCreatedContent, versionUpdatedContent, versionDeletedContent }
            await startUpdateStageGameContentTask({ dispatch, realm, state, versionContent, color });
        } else {
            props.navigation.navigate("BottomTab")
        }
    }
    
    return(
        <View style={[styles.container, {backgroundColor:colors.background.a1}]}>
            <GeneralHeader
                back={true}
                title={"دریافت محتوای بازی مرحله‌ای"}
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
                <View style={{flex:1, flexDirection:'column', justifyContent:'space-between'}}>
                    <View style={{flex:1, paddingHorizontal:30}}>
                        <View style={{width:'100%', height:'100%', alignItems:'center', justifyContent:'center', gap:10}}>
                            <Text style={{fontFamily:Font.bold, color:(status == "need-update" || status == "force-update")?colors.alert.a1:colors.primary.a6, fontSize:16, lineHeight:32, textAlign:'center'}}>{title}</Text>
                            {
                                status == "force-update"&&
                                <Text style={{fontFamily:Font.medium, color:colors.border.a1, fontSize:12, textAlign:'center', marginTop:30}}>{"دریافت این بروزرسانی اجباری است."}</Text>
                            }
                            {
                                (status == "need-update" || status == "force-update")&&
                                <Text style={{fontFamily:Font.medium, color:colors.text.a5, fontSize:12, textAlign:'center', lineHeight:24}}>{"توجه کنید، هنگام دریافت اطلاعات و داده‌های بازی در همین صفحه بمانید و از اتصال دستگاه خود به اینترنت مطمعن شوید."}</Text>
                            }
                        </View>
                    </View>
                    <View style={{height:120, flexDirection:'column', justifyContent:isDownloading?'space-between':'flex-end', alignItems:'center'}}>
                        {
                            (isDownloading == true)&&
                            <LoadingBar 
                                barColor={colors.primary.a1}
                                width={width-40}
                                height={10}
                                barWidthStart={0.25}
                                barWidthEnd={0.85}
                                isComplete={false}
                                onComplete={()=>{}}
                            />
                        }
                        <View style={{width:width, alignItems:'center', paddingVertical:15, backgroundColor:colors.background.a2, borderTopColor:colors.border.a1, borderTopWidth:0.3}}>
                            <ButtonGradient
                                height={60}
                                width={width - 30}
                                text={isDownloading == true?"در حال بارگیری":(status == "force-update" || status == "need-update")?"دریافت مراحل بازی":"شروع بازی"}
                                onPress={downloadUpdates}
                                loading={isDownloading}
                                textSize={16}
                                borderRadius={10}
                            />
                        </View>
                    </View>
                </View>
            }
        </View>
    )
}
const styles = StyleSheet.create({
    container: {
        flex:1
    }
});
export default StageGameUpdateScreen;