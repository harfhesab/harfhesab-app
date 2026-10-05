import React, {useState, useEffect} from 'react';
import {StyleSheet, View, Text, Dimensions, TouchableOpacity, SafeAreaView, Platform, PermissionsAndroid} from 'react-native';
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

// ---- فقط برای ظاهر (UI-only) ----
import Animated, {
    useSharedValue,
    useDerivedValue,
    withRepeat,
    withTiming,
    interpolate,
    Easing,
    FadeInDown,
    FadeIn,
} from 'react-native-reanimated';
import { Canvas, Circle, Path, BlurMask, Group } from '@shopify/react-native-skia';

const {width, height} = Dimensions.get("window")

/* ------------------------------------------------------------------ */
/*  پس‌زمینه‌ی متحرک: چند هاله‌ی نورانی که آرام شناورند                  */
/* ------------------------------------------------------------------ */
function GlowBackground({ colorA, colorB }) {
    const t = useSharedValue(0);
    useEffect(() => {
        t.value = withRepeat(
            withTiming(1, { duration: 7000, easing: Easing.inOut(Easing.sin) }),
            -1,
            true
        );
    }, []);

    const ax = useDerivedValue(() => interpolate(t.value, [0, 1], [width * 0.1, width * 0.45]));
    const ay = useDerivedValue(() => interpolate(t.value, [0, 1], [height * 0.18, height * 0.3]));
    const bx = useDerivedValue(() => interpolate(t.value, [0, 1], [width * 0.95, width * 0.55]));
    const by = useDerivedValue(() => interpolate(t.value, [0, 1], [height * 0.62, height * 0.5]));

    return (
        <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
            <Circle cx={ax} cy={ay} r={width * 0.5} color={colorA} opacity={0.16}>
                <BlurMask blur={70} style="normal" />
            </Circle>
            <Circle cx={bx} cy={by} r={width * 0.55} color={colorB} opacity={0.12}>
                <BlurMask blur={80} style="normal" />
            </Circle>
        </Canvas>
    );
}

/* ------------------------------------------------------------------ */
/*  نشان وسط صفحه: حلقه‌های موجی + آیکن (فلش دانلود / تیک)              */
/* ------------------------------------------------------------------ */
const BADGE = 240;
const C = BADGE / 2;

function StatusBadge({ color, needUpdate }) {
    const p = useSharedValue(0);
    useEffect(() => {
        p.value = withRepeat(
            withTiming(1, { duration: 2600, easing: Easing.out(Easing.quad) }),
            -1,
            false
        );
    }, []);

    const r1 = useDerivedValue(() => interpolate(p.value, [0, 1], [52, 112]));
    const o1 = useDerivedValue(() => interpolate(p.value, [0, 1], [0.55, 0]));
    const r2 = useDerivedValue(() => interpolate((p.value + 0.5) % 1, [0, 1], [52, 112]));
    const o2 = useDerivedValue(() => interpolate((p.value + 0.5) % 1, [0, 1], [0.55, 0]));

    return (
        <Canvas style={{ width: BADGE, height: BADGE }}>
            {/* حلقه‌های موجی */}
            <Circle cx={C} cy={C} r={r1} color={color} style="stroke" strokeWidth={2} opacity={o1} />
            <Circle cx={C} cy={C} r={r2} color={color} style="stroke" strokeWidth={2} opacity={o2} />

            {/* هاله‌ی پشت دیسک */}
            <Circle cx={C} cy={C} r={58} color={color} opacity={0.45}>
                <BlurMask blur={22} style="normal" />
            </Circle>

            {/* دیسک اصلی */}
            <Circle cx={C} cy={C} r={50} color={color} />
            <Circle cx={C} cy={C} r={50} color="white" style="stroke" strokeWidth={2} opacity={0.25} />
            <Circle cx={C} cy={C} r={38} color="white" style="stroke" strokeWidth={1} opacity={0.18} />

            {/* آیکن */}
            <Group>
                {needUpdate ? (
                    <>
                        <Path
                            path={`M ${C} ${C - 22} L ${C} ${C + 8}`}
                            color="white" style="stroke" strokeWidth={6} strokeCap="round"
                        />
                        <Path
                            path={`M ${C - 14} ${C - 6} L ${C} ${C + 10} L ${C + 14} ${C - 6}`}
                            color="white" style="stroke" strokeWidth={6} strokeCap="round" strokeJoin="round"
                        />
                        <Path
                            path={`M ${C - 18} ${C + 24} L ${C + 18} ${C + 24}`}
                            color="white" style="stroke" strokeWidth={6} strokeCap="round"
                        />
                    </>
                ) : (
                    <Path
                        path={`M ${C - 18} ${C + 1} L ${C - 5} ${C + 14} L ${C + 20} ${C - 14}`}
                        color="white" style="stroke" strokeWidth={7} strokeCap="round" strokeJoin="round"
                    />
                )}
            </Group>
        </Canvas>
    );
}

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

    const requestNotificationPermission = async () => {
        if (Platform.OS === 'android' && Platform.Version >= 33) {
            try {
                await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
                    {
                        title: 'نمایش وضعیت دانلود',
                        message: 'برای نمایش پیشرفت دریافت محتوای بازی روی نوار اعلان، به این اجازه نیاز داریم.',
                        buttonPositive: 'اجازه می‌دهم',
                        buttonNegative: 'فعلاً نه',
                    }
                );
            } catch (e) {
                null
            }
        }
    };

    const downloadUpdates = async () => {
        if (status == "need-update" || status == "force-update") {
            requestNotificationPermission();
            const color = colors.primary.a1
            const versionContent = { versionCreatedContent, versionUpdatedContent, versionDeletedContent }
            await startUpdateStageGameContentTask({ dispatch, realm, state, versionContent, color });
        } else {
            props.navigation.navigate("StageGame")
        }
    }

    // ---- فقط مقادیر نمایشی (بدون تغییر در منطق) ----
    const needUpdate = (status == "need-update" || status == "force-update")
    const accent = needUpdate ? colors.alert.a1 : colors.primary.a6

    return(
        <View style={[styles.container, {backgroundColor:colors.background.a1}]}>
            <GlowBackground colorA={colors.primary.a1} colorB={accent} />
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

                            <Animated.View entering={FadeIn.duration(600)} style={styles.badgeWrap}>
                                <StatusBadge color={accent} needUpdate={needUpdate} />
                            </Animated.View>

                            <Animated.View entering={FadeInDown.delay(150).duration(500)} style={{alignItems:'center', gap:10}}>
                                <Text style={{fontFamily:Font.bakh_bold, color:accent, fontSize:18, lineHeight:34, textAlign:'center'}}>{title}</Text>
                                {
                                    status == "force-update"&&
                                    <View style={[styles.pill, {borderColor:colors.alert.a1}]}>
                                        <View style={[styles.pillDot, {backgroundColor:colors.alert.a1}]} />
                                        <Text style={{fontFamily:Font.bakh_semi_bold, color:colors.border.a1, fontSize:12, textAlign:'center'}}>{"دریافت این بروزرسانی اجباری است."}</Text>
                                    </View>
                                }
                                {
                                    needUpdate&&
                                    <View style={[styles.noteBox, {backgroundColor:colors.background.a2, borderColor:colors.border.a1}]}>
                                        <View style={[styles.noteBar, {backgroundColor:colors.primary.a1}]} />
                                        <Text style={{flex:1, fontFamily:Font.bakh_semi_bold, color:colors.text.a5, fontSize:12, textAlign:'center', lineHeight:24}}>{"توجه کنید، هنگام دریافت اطلاعات و داده‌های بازی در همین صفحه بمانید و از اتصال دستگاه خود به اینترنت مطمئن شوید."}</Text>
                                    </View>
                                }
                            </Animated.View>
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
                        <View style={{width:width, alignItems:'center', paddingVertical:15, backgroundColor:colors.background.a2, borderTopColor:colors.border.a1, borderTopWidth:0.3, borderTopLeftRadius:22, borderTopRightRadius:22, elevation:12}}>
                            <ButtonGradient
                                height={60}
                                width={width - 30}
                                text={isDownloading == true?"در حال بارگیری":(status == "force-update" || status == "need-update")?"دریافت مراحل بازی":"شروع بازی"}
                                onPress={downloadUpdates}
                                loading={isDownloading}
                                textSize={16}
                                borderRadius={14}
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
    },
    badgeWrap: {
        width: BADGE,
        height: BADGE,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 6,
    },
    pill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        marginTop: 6,
    },
    pillDot: {
        width: 7,
        height: 7,
        borderRadius: 4,
    },
    noteBox: {
        flexDirection: 'row',
        alignItems: 'stretch',
        gap: 12,
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 14,
        borderWidth: 0.5,
        marginTop: 14,
        overflow: 'hidden',
    },
    noteBar: {
        width: 3,
        borderRadius: 2,
    },
});
export default StageGameUpdateScreen;