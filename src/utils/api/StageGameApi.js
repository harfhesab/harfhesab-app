import axios from "axios";
import { Dimensions, InteractionManager, View } from 'react-native';
import { goBack, navigate } from "../../main/navigationService";
import AlertHelper from "../../components/alert/AlertHelper";
import { changeVersionContent, changeStageGameForceUpdate } from "../../redux/slices/stageGamePersistSlice";
import { 
    setIsDownloading,
    setDataCheck,
    setStatus,
    setGetError,
    setVersionCreatedPage,
    setVersionUpdatedPage,
    setVersionDeletedPage,
    setDownloadFinished,
    setVersionCreatedDownloded,
    setVersionUpdatedDownloded,
    setVersionDeletedDownloded,
} from "../../redux/slices/stageGameDownloadSlice";
import { createManyStages, updateManyStages, deleteManyStages } from "../../realm/repositories/stage-game/stage.repository";
import { createManyStageSeasons, updateManyStageSeasons, deleteManyStageSeasons } from "../../realm/repositories/stage-game/stage-season.repository";
import { createManyLanguages, updateManyLanguages, deleteManyLanguages } from "../../realm/repositories/general/language.repository";
import { preloadImages } from "../ImagePreloader";
import Globals from "../Globals";
import AlertBottomDrawerHelper from "../../components/alert-bottom-drawer/AlertBottomDrawerHelper";
import LocalImageComponent from "../../components/image-components/LocalImageComponent";
import { colors } from "../../hooks/theme/colors";
import Font from "../Font";
const BASE_URL = Globals.uri;

export const checkStageGameContentVersion = async({ dispatch, realm, state, versionContent }) => {
    // InteractionManager.runAfterInteractions(() => {
    //     const run = async ()=>{
            const {
                versionCreatedContent,
                versionUpdatedContent,
                versionDeletedContent,
            } = versionContent;
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
                        const forceUpdate = true
                        dispatch(changeStageGameForceUpdate({forceUpdate}))
                        forceUpdateAlert()
                    } else if(data?.version_created > versionCreatedContent || data?.version_updated > versionUpdatedContent || data?.version_deleted > versionDeletedContent){
                        dispatch(setStatus({status: "need-update"}))
                        showUpdateAlert()
                    } else {
                        dispatch(setStatus({status: "up-to-date"}))
                    }
                }
            }).catch((err)=>{
                null
            })
    //     }
    //     run();
    // });
}
export const updateStageGameContent = ({ dispatch, realm, state, versionContent }) => {
    // InteractionManager.runAfterInteractions(() => {
        dispatch(setIsDownloading())
        const {
            dataCheck,
            versionCreatedPage,
            versionUpdatedPage,
            versionDeletedPage,
            versionCreatedDownloded,
            versionUpdatedDownloded,
            versionDeletedDownloded,
        } = state;
        const {
            versionCreatedContent,
            versionUpdatedContent,
            versionDeletedContent,
        } = versionContent;
        const {
            version_created,
            version_updated,
            version_deleted,
        } = dataCheck;

        if(versionCreatedContent > 0){
            if(version_created > versionCreatedContent && versionCreatedDownloded == false){
                const page = versionCreatedPage
                getNewVersionCreatedStageGameContent({page, dispatch, realm, state, versionContent})
            } else if(version_updated > versionUpdatedContent && versionUpdatedDownloded == false){
                const page = versionUpdatedPage
                getNewVersionUpdatedStageGameContent({page, dispatch, realm, state, versionContent})
            } else if(version_deleted > versionDeletedContent && versionDeletedDownloded == false){
                const page = versionDeletedPage
                getNewVersionDeletedStageGameContent({page, dispatch, realm, state, versionContent})
            }
        } else if(version_created > versionCreatedContent && versionCreatedDownloded == false){
            const page = versionCreatedPage
            getNewVersionCreatedStageGameContentForFirst({page, dispatch, realm, state, versionContent})
        }
    // });
}
const getNewVersionCreatedStageGameContent = async ({page, dispatch, realm, state, versionContent})=>{
    const {
        dataCheck,
        versionCreatedPage,
        versionUpdatedPage,
        versionDeletedPage,
        versionCreatedDownloded,
        versionUpdatedDownloded,
        versionDeletedDownloded,
    } = state;
    const {
        versionCreatedContent,
        versionUpdatedContent,
        versionDeletedContent,
    } = versionContent;
    const {
        version_created,
        version_updated,
        version_deleted,
    } = dataCheck;
    await axios({
        url:'/',
        method:'post',
        data: {
            query : `
                query getNewVersionCreatedStageGameContent(
                    $page : Int!,
                    $version_created : Int!,
                ){
                    getNewVersionCreatedStageGameContent(
                        page : $page,
                        version_created : $version_created,
                    ) {
                        season{
                            _id,
                            title,
                            description,
                            language_ref,
                            media{path, file_type, duration, order},
                            music{path, file_type, duration, order},
                            badge,
                            season_number,
                            stage_number_from,
                            stage_number_to,
                            number_stage,
                            is_visible,
                            is_active,
                            version_created,
                            version_updated,
                            version_deleted,
                        },
                        stage{
                            _id,
                            parts{
                                _id,
                                sentence,
                                sentence_hint,
                                sentence_display,
                                words{
                                    _id,
                                    word,
                                    word_hint,
                                    unknown_word,
                                    letters,
                                    additional_words,
                                    hidden_words,
                                    order
                                },
                                order
                            },
                            media{path, file_type, duration, order},
                            voice{path, file_type, duration, order},
                            stage_hint,
                            season,
                            language_ref,
                            stage_number_in_language,
                            stage_number_in_season,
                            is_visible,
                            is_active,
                            version_created,
                            version_updated,
                            version_deleted,
                        },
                        language{
                            _id,
                            name,
                            badge,
                            icon_image,
                            code,
                            stage_game,
                            package_game,
                            rtl,
                            ltr,
                            is_visible,
                            is_active,
                            order,
                            version_created,
                            version_updated,
                            version_deleted,
                        },
                        hasNextPage,
                        nextPage
                    }
                }
            `,
            variables : {
                "page" : page,
                "version_created" : versionCreatedContent,
            }
        }
    }).then(async(response)=>{
        const data = response.data?.data?.getNewVersionCreatedStageGameContent;
        if (data) {
            const seasonList = data?.season ?? [];
            const stageList = data?.stage ?? [];
            const languageList = data?.language ?? [];
            let result = true;
            if (seasonList.length > 0) {
                const res = createManyStageSeasons(realm, seasonList);
                if (!res) result = false;
            }
            if (stageList.length > 0) {
                const res = createManyStages(realm, stageList);
                if (!res) result = false;
            }
            if (languageList.length > 0) {
                const res = createManyLanguages(realm, languageList);
                if (!res) result = false;
            }
            const seasonUrls = Array.from(
                new Set(seasonList.flatMap((season) =>
                        Array.isArray(season.media)
                        ? season.media
                            .map((m) =>
                                m?.path ? `${BASE_URL}${m.path}` : null
                            )
                            .filter(Boolean)
                        : []
                    )
                )
            );
            const stageUrls = Array.from(
                new Set(stageList.flatMap((stage) =>
                        Array.isArray(stage.media)
                        ? stage.media
                            .map((m) =>
                                m?.path ? `${BASE_URL}${m.path}` : null
                            )
                            .filter(Boolean)
                        : []
                    )
                )
            );
            const languageUrls = Array.from(
                new Set(
                languageList
                    .map((lang) =>
                    lang?.icon_image ? `${BASE_URL}${lang.icon_image}` : null
                    )
                    .filter(Boolean)
                )
            );
            const allUrls = Array.from(
                new Set([ ...seasonUrls, ...stageUrls, ...languageUrls])
            );
            await preloadImages(allUrls, {
                batchSize: 8,
                delayBetweenBatches: 100,
            });
            if (!result) {
                dispatch(setGetError());
            } else {
                if(data?.hasNextPage == true) {
                    const page = data?.nextPage
                    dispatch(setVersionCreatedPage({ page: page}))
                    getNewVersionCreatedStageGameContent({page, dispatch, realm, state, versionContent})
                } else {
                    dispatch(setVersionCreatedDownloded({downloaded:true}))
                    if(version_updated > versionUpdatedContent && versionUpdatedDownloded == false){
                        const page = versionUpdatedPage
                        getNewVersionUpdatedStageGameContent({page, dispatch, realm, state, versionContent})
                    } else if(version_deleted > versionDeletedContent && versionDeletedDownloded == false){
                        const page = versionDeletedPage
                        getNewVersionDeletedStageGameContent({page, dispatch, realm, state, versionContent})
                    } else {
                        const newVersionContent = {versionCreatedContent:version_created, versionUpdatedContent:version_updated, versionDeletedContent:version_deleted}
                        upgradeStageGameContentVersion({dispatch, newVersionContent})
                    }
                }
            }
        } else {
            dispatch(setGetError());
        }
    }).catch((err)=>{
        dispatch(setGetError());
    })
}
const getNewVersionUpdatedStageGameContent = async ({page, dispatch, realm, state, versionContent})=>{
    const {
        dataCheck,
        versionCreatedPage,
        versionUpdatedPage,
        versionDeletedPage,
        versionCreatedDownloded,
        versionUpdatedDownloded,
        versionDeletedDownloded,
    } = state;
    const {
        versionCreatedContent,
        versionUpdatedContent,
        versionDeletedContent,
    } = versionContent;
    const {
        version_created,
        version_updated,
        version_deleted,
    } = dataCheck;
    await axios({
        url:'/',
        method:'post',
        data: {
            query : `
                query getNewVersionUpdatedStageGameContent(
                    $page : Int!,
                    $version_updated : Int!,
                ){
                    getNewVersionUpdatedStageGameContent(
                        page : $page,
                        version_updated : $version_updated,
                    ) {
                        season{
                            _id,
                            title,
                            description,
                            language_ref,
                            media{path, file_type, duration, order},
                            music{path, file_type, duration, order},
                            badge,
                            season_number,
                            stage_number_from,
                            stage_number_to,
                            number_stage,
                            is_visible,
                            is_active,
                            version_created,
                            version_updated,
                            version_deleted,
                        },
                        stage{
                            _id,
                            parts{
                                _id,
                                sentence,
                                sentence_hint,
                                sentence_display,
                                words{
                                    _id,
                                    word,
                                    word_hint,
                                    unknown_word,
                                    letters,
                                    additional_words,
                                    hidden_words,
                                    order
                                },
                                order
                            },
                            media{path, file_type, duration, order},
                            voice{path, file_type, duration, order},
                            stage_hint,
                            season,
                            language_ref,
                            stage_number_in_language,
                            stage_number_in_season,
                            is_visible,
                            is_active,
                            version_created,
                            version_updated,
                            version_deleted,
                        },
                        language{
                            _id,
                            name,
                            badge,
                            icon_image,
                            code,
                            stage_game,
                            package_game,
                            rtl,
                            ltr,
                            is_visible,
                            is_active,
                            order,
                            version_created,
                            version_updated,
                            version_deleted,
                        },
                        hasNextPage,
                        nextPage
                    }
                }
            `,
            variables : {
                "page" : page,
                "version_updated" : versionUpdatedContent,
            }
        }
    }).then(async(response)=>{
        const data = response.data?.data?.getNewVersionUpdatedStageGameContent;
        if (data) {
            const seasonList = data?.season ?? [];
            const stageList = data?.stage ?? [];
            const languageList = data?.language ?? [];
            let result = true;
            if (seasonList.length > 0) {
                const res = updateManyStageSeasons(realm, seasonList);
                if (!res) result = false;
            }
            if (stageList.length > 0) {
                const res = updateManyStages(realm, stageList);
                if (!res) result = false;
            }
            if (languageList.length > 0) {
                const res = updateManyLanguages(realm, languageList);
                if (!res) result = false;
            }
            const seasonUrls = Array.from(
                new Set(seasonList.flatMap((season) =>
                        Array.isArray(season.media)
                        ? season.media
                            .map((m) =>
                                m?.path ? `${BASE_URL}${m.path}` : null
                            )
                            .filter(Boolean)
                        : []
                    )
                )
            );
            const stageUrls = Array.from(
                new Set(stageList.flatMap((stage) =>
                        Array.isArray(stage.media)
                        ? stage.media
                            .map((m) =>
                                m?.path ? `${BASE_URL}${m.path}` : null
                            )
                            .filter(Boolean)
                        : []
                    )
                )
            );
            const languageUrls = Array.from(
                new Set(
                languageList
                    .map((lang) =>
                    lang?.icon_image ? `${BASE_URL}${lang.icon_image}` : null
                    )
                    .filter(Boolean)
                )
            );
            const allUrls = Array.from(
                new Set([ ...seasonUrls, ...stageUrls, ...languageUrls])
            );
            await preloadImages(allUrls, {
                batchSize: 8,
                delayBetweenBatches: 100,
            });
            if (!result) {
                dispatch(setGetError());
            } else {
                if(data?.hasNextPage == true) {
                    const page = data?.nextPage
                    dispatch(setVersionUpdatedPage({ page: page}))
                    getNewVersionUpdatedStageGameContent({page, dispatch, realm, state, versionContent})
                } else {
                    dispatch(setVersionUpdatedDownloded({downloaded:true}))
                    if(version_deleted > versionDeletedContent && versionDeletedDownloded == false){
                        const page = versionDeletedPage
                        getNewVersionDeletedStageGameContent({page, dispatch, realm, state, versionContent})
                    } else {
                        const newVersionContent = {versionCreatedContent:version_created, versionUpdatedContent:version_updated, versionDeletedContent:version_deleted}
                        upgradeStageGameContentVersion({dispatch, newVersionContent})
                    }
                }
            }
        } else {
            dispatch(setGetError());
        }
    }).catch((err)=>{
        dispatch(setGetError())
    })
}
const getNewVersionDeletedStageGameContent = async ({page, dispatch, realm, state, versionContent})=>{
    const {
        dataCheck,
        versionCreatedPage,
        versionUpdatedPage,
        versionDeletedPage,
        versionCreatedDownloded,
        versionUpdatedDownloded,
        versionDeletedDownloded,
    } = state;
    const {
        versionCreatedContent,
        versionUpdatedContent,
        versionDeletedContent,
    } = versionContent;
    const {
        version_created,
        version_updated,
        version_deleted,
    } = dataCheck;
    await axios({
        url:'/',
        method:'post',
        data: {
            query : `
                query getNewVersionDeletedStageGameContent(
                    $page : Int!,
                    $version_deleted : Int!,
                ){
                    getNewVersionDeletedStageGameContent(
                        page : $page,
                        version_deleted : $version_deleted,
                    ) {
                        season{
                            _id,
                        },
                        stage{
                            _id,
                        },
                        language{
                            _id,
                        },
                        hasNextPage,
                        nextPage
                    }
                }
            `,
            variables : {
                "page" : page,
                "version_deleted" : versionDeletedContent,
            }
        }
    }).then((response)=>{
        const data = response.data?.data?.getNewVersionDeletedStageGameContent;
        if (data) {
            const seasonList = data?.season ?? [];
            const stageList = data?.stage ?? [];
            const languageList = data?.language ?? [];
            let result = true;
            if (seasonList.length > 0) {
                const res = deleteManyStageSeasons(realm, seasonList);
                if (!res) result = false;
            }
            if (stageList.length > 0) {
                const res = deleteManyStages(realm, stageList);
                if (!res) result = false;
            }
            if (languageList.length > 0) {
                const res = deleteManyLanguages(realm, languageList);
                if (!res) result = false;
            }
            if (!result) {
                dispatch(setGetError());
            } else {
                if(data?.hasNextPage == true) {
                    const page = data?.nextPage
                    dispatch(setVersionDeletedPage({ page: page}))
                    getNewVersionDeletedStageGameContent({page, dispatch, realm, state, versionContent})
                } else {
                    dispatch(setVersionDeletedDownloded({downloaded:true}))
                    const newVersionContent = {versionCreatedContent:version_created, versionUpdatedContent:version_updated, versionDeletedContent:version_deleted}
                    upgradeStageGameContentVersion({dispatch, newVersionContent})
                }
            }
        } else {
            dispatch(setGetError());
        }
    }).catch((err)=>{
        dispatch(setGetError())
    })
}
const getNewVersionCreatedStageGameContentForFirst = async ({page, dispatch, realm, state, versionContent})=>{
    const {
        dataCheck,
        versionCreatedPage,
        versionUpdatedPage,
        versionDeletedPage,
        versionCreatedDownloded,
        versionUpdatedDownloded,
        versionDeletedDownloded,
    } = state;
    const {
        versionCreatedContent,
        versionUpdatedContent,
        versionDeletedContent,
    } = versionContent;
    const {
        version_created,
        version_updated,
        version_deleted,
    } = dataCheck;
    await axios({
        url:'/',
        method:'post',
        data: {
            query : `
                query getNewVersionCreatedStageGameContent(
                    $page : Int!,
                    $version_created : Int!,
                ){
                    getNewVersionCreatedStageGameContent(
                        page : $page,
                        version_created : $version_created,
                    ) {
                        season{
                            _id,
                            title,
                            description,
                            language_ref,
                            media{path, file_type, duration, order},
                            music{path, file_type, duration, order},
                            badge,
                            season_number,
                            stage_number_from,
                            stage_number_to,
                            number_stage,
                            is_visible,
                            is_active,
                            version_created,
                            version_updated,
                            version_deleted,
                        },
                        stage{
                            _id,
                            parts{
                                _id,
                                sentence,
                                sentence_hint,
                                sentence_display,
                                words{
                                    _id,
                                    word,
                                    word_hint,
                                    unknown_word,
                                    letters,
                                    additional_words,
                                    hidden_words,
                                    order
                                },
                                order
                            },
                            media{path, file_type, duration, order},
                            voice{path, file_type, duration, order},
                            stage_hint,
                            season,
                            language_ref,
                            stage_number_in_language,
                            stage_number_in_season,
                            is_visible,
                            is_active,
                            version_created,
                            version_updated,
                            version_deleted,
                        },
                        language{
                            _id,
                            name,
                            badge,
                            icon_image,
                            code,
                            stage_game,
                            package_game,
                            rtl,
                            ltr,
                            is_visible,
                            is_active,
                            order,
                            version_created,
                            version_updated,
                            version_deleted,
                        },
                        hasNextPage,
                        nextPage
                    }
                }
            `,
            variables : {
                "page" : page,
                "version_created" : versionCreatedContent,
            }
        }
    }).then(async(response)=>{
        const data = response.data?.data?.getNewVersionCreatedStageGameContent;
        if (data) {
            const seasonList = data?.season ?? [];
            const stageList = data?.stage ?? [];
            const languageList = data?.language ?? [];
            let result = true;
            if (seasonList.length > 0) {
                const res = createManyStageSeasons(realm, seasonList);
                if (!res) result = false;
            }
            if (stageList.length > 0) {
                const res = createManyStages(realm, stageList);
                if (!res) result = false;
            }
            if (languageList.length > 0) {
                const res = createManyLanguages(realm, languageList);
                if (!res) result = false;
            }
            const seasonUrls = Array.from(
                new Set(seasonList.flatMap((season) =>
                        Array.isArray(season.media)
                        ? season.media
                            .map((m) =>
                                m?.path ? `${BASE_URL}${m.path}` : null
                            )
                            .filter(Boolean)
                        : []
                    )
                )
            );
            const stageUrls = Array.from(
                new Set(stageList.flatMap((stage) =>
                        Array.isArray(stage.media)
                        ? stage.media
                            .map((m) =>
                                m?.path ? `${BASE_URL}${m.path}` : null
                            )
                            .filter(Boolean)
                        : []
                    )
                )
            );
            const languageUrls = Array.from(
                new Set(
                languageList
                    .map((lang) =>
                    lang?.icon_image ? `${BASE_URL}${lang.icon_image}` : null
                    )
                    .filter(Boolean)
                )
            );
            const allUrls = Array.from(
                new Set([ ...seasonUrls, ...stageUrls, ...languageUrls])
            );
            await preloadImages(allUrls, {
                batchSize: 8,
                delayBetweenBatches: 100,
            });
            if (!result) {
                dispatch(setGetError());
            } else {
                if(data?.hasNextPage == true) {
                    const page = data?.nextPage
                    dispatch(setVersionCreatedPage({ page: page}))
                    getNewVersionCreatedStageGameContentForFirst({page, dispatch, realm, state, versionContent})
                } else {
                    dispatch(setVersionCreatedDownloded({downloaded:true}))
                    const newVersionContent = {versionCreatedContent:version_created, versionUpdatedContent:version_updated, versionDeletedContent:version_deleted}
                    const firstGetContent = true
                    upgradeStageGameContentVersion({dispatch, newVersionContent, firstGetContent})
                }
            }
        } else {
            dispatch(setGetError());
        }
    }).catch((err)=>{
        dispatch(setGetError())
    })
}
export const upgradeStageGameContentVersion = async({dispatch, newVersionContent, firstGetContent}) => {
    const {
        versionCreatedContent,
        versionUpdatedContent,
        versionDeletedContent,
    } = newVersionContent;
    await axios({
        url:'/',
        method:'post',
        data: {
            query : `
                mutation upgradeStageGameContentVersion(
                    $version_created : Int!,
                    $version_updated : Int!,
                    $version_deleted : Int!,
                ){
                    upgradeStageGameContentVersion(
                        version_created : $version_created,
                        version_updated : $version_updated,
                        version_deleted : $version_deleted,
                    ) {
                        status,
                        message
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
        dispatch(setDownloadFinished())
        dispatch(changeVersionContent(newVersionContent))
        showSuccessAlertForDownloaded(firstGetContent)
    }).catch((err)=>{
        dispatch(setDownloadFinished())
        dispatch(changeVersionContent(newVersionContent))
        showSuccessAlertForDownloaded(firstGetContent)
    })
}
const showSuccessAlertForDownloaded = (firstGetContent)=>{
    AlertHelper.showAlert({
        body:firstGetContent==true?"محتوای بازی مرحله‌ای با موفقیت دریافت شد!":"بروزرسانی محتوای بازی مرحله‌ای با موفقیت انجام شد!",
        buttons: [
            {
                text: "متوجه شدم",
                onPress: () => {
                    goBack()
                },
                type:'bold'
            },
        ],
        options : {
            type: 'success',
            cancelable: true
        },
    });
}
const showUpdateAlert = ()=>{
    const {width} = Dimensions.get("window");
    const btn = [
        {
            onPress : ()=>{
                navigate("StageGameUpdateScreen")
            },
            text: "دریافت بروزرسانی",
            loading: false,
            type: "bold",
        },
        {
            onPress : ()=>{
                
            },
            text: "لغو",
            loading: false,
            type: "border",
        },
    ]
    const msg = [
        {
            text:"بروزرسانی محتوای بازی مرحله‌ای!",
            style:{ maxWidth:width-30, fontFamily:Font.bold, fontSize:20, color:colors.alert.a1, alignSelf:'flex-start', textAlign:'justify', lineHeight:30},
        },
        {
            text:"یک بروزرسانی برای محتوای بازی مرحله‌ای یافت شد. می‌توانید برای دریافت آن اقدام کنید.",
            style:{ maxWidth:width-30, fontFamily:Font.medium, fontSize:14, color:colors.text.a6, alignSelf:'flex-start', textAlign:'justify', lineHeight:28},
        },
        {
            text:"توجه کنید هنگام بروزرسانی محتوای بازی، از اتصال دستگاه خود به اینترنت مطمئن شوید.",
            style:{ maxWidth:width-30, fontFamily:Font.medium, fontSize:14, color:colors.text.a6, alignSelf:'flex-start', textAlign:'justify', lineHeight:28},
        },
    ]
    AlertBottomDrawerHelper.showAlert({
        title:"بروزرسانی بازی مرحله‌ای",
        message: msg,
        buttons:btn,
        options:{
            cancelable: true,
            icon:{
                Icon:()=>(
                    <View style={{width:width, alignItems:'center'}}>
                        <LocalImageComponent
                            path={require('../../assets/image/download.png')}
                            width={40}
                            height={40}
                            resizeMode={'stretch'}
                            blank_background={true}
                        />
                    </View>
                )
            }
        }
    })
}
const forceUpdateAlert = ()=>{
    const {width} = Dimensions.get("window");
    const btn = [
        {
            onPress : ()=>{
                props.navigation.navigate("StageGameUpdateScreen")
            },
            text: "دریافت بروزرسانی",
            loading: false,
            type: "bold",
        },
    ]
    const msg = [
        {
            text:"بروزرسانی محتوای بازی مرحله‌ای!",
            style:{ maxWidth:width-30, fontFamily:Font.bold, fontSize:20, color:colors.alert.a1, alignSelf:'flex-start', textAlign:'justify', lineHeight:30},
        },
        {
            text:"یک بروزرسانی اجباری برای محتوای بازی مرحله‌ای یافت شد. برای دریافت آن اقدام کنید.",
            style:{ maxWidth:width-30, fontFamily:Font.medium, fontSize:14, color:colors.text.a6, alignSelf:'flex-start', textAlign:'justify', lineHeight:28},
        },
        {
            text:"توجه کنید هنگام بروزرسانی محتوای بازی، از اتصال دستگاه خود به اینترنت مطمئن شوید.",
            style:{ maxWidth:width-30, fontFamily:Font.medium, fontSize:14, color:colors.text.a6, alignSelf:'flex-start', textAlign:'justify', lineHeight:28},
        },
    ]
    AlertBottomDrawerHelper.showAlert({
        title:"بروزرسانی بازی مرحله‌ای",
        message: msg,
        buttons:btn,
        options:{
            cancelable: false,
            icon:{
                Icon:()=>(
                    <View style={{width:width, alignItems:'center'}}>
                        <LocalImageComponent
                            path={require('../../assets/image/download.png')}
                            width={40}
                            height={40}
                            resizeMode={'stretch'}
                            blank_background={true}
                        />
                    </View>
                )
            }
        }
    })
}
