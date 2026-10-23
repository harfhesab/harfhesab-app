import axios from "axios";
import { Dimensions, InteractionManager, View } from 'react-native';
import { goBack, navigate } from "../../main/navigationService";
import AlertHelper from "../../components/alert/AlertHelper";
import { changeVersionContent, changeWordGameForceUpdate } from "../../redux/slices/wordGamePersistSlice";
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
} from "../../redux/slices/wordGameDownloadSlice";
import { createManyWordGameStages, updateManyWordGameStages, deleteManyWordGameStages } from "../../realm/repositories/word-game/word-game-stage.repository";
import { createManyWordGameSeasons, updateManyWordGameSeasons, deleteManyWordGameSeasons } from "../../realm/repositories/word-game/word-game-season.repository";
import { createManyLanguages, updateManyLanguages, deleteManyLanguages } from "../../realm/repositories/general/language.repository";
import { preloadImages } from "../ImagePreloader";
import Globals from "../Globals";
import AlertBottomDrawerHelper from "../../components/alert-bottom-drawer/AlertBottomDrawerHelper";
import LocalImageComponent from "../../components/image-components/LocalImageComponent";
import { colors } from "../../hooks/theme/colors";
import Font from "../Font";
const BASE_URL = Globals.uri;

export const checkWordGameContentVersion = async({ dispatch, realm, state, versionContent }) => {
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
                        query checkWordGameContentVersion(
                            $version_created : Int!,
                            $version_updated : Int!,
                            $version_deleted : Int!,
                        ){
                            checkWordGameContentVersion(
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
                const data = response.data?.data?.checkWordGameContentVersion
                if(data){
                    dispatch(setDataCheck({data:data}))
                    if(data?.force_version_created > versionCreatedContent || data?.force_version_updated > versionUpdatedContent || data?.force_version_deleted > versionDeletedContent) {
                        dispatch(setStatus({status: "force-update"}))
                        const forceUpdate = true
                        dispatch(changeWordGameForceUpdate({forceUpdate}))
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
export const updateWordGameContent = ({ dispatch, realm, state, versionContent }) => {
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
                getNewVersionCreatedWordGameContent({page, dispatch, realm, state, versionContent})
            } else if(version_updated > versionUpdatedContent && versionUpdatedDownloded == false){
                const page = versionUpdatedPage
                getNewVersionUpdatedWordGameContent({page, dispatch, realm, state, versionContent})
            } else if(version_deleted > versionDeletedContent && versionDeletedDownloded == false){
                const page = versionDeletedPage
                getNewVersionDeletedWordGameContent({page, dispatch, realm, state, versionContent})
            }
        } else if(version_created > versionCreatedContent && versionCreatedDownloded == false){
            const page = versionCreatedPage
            getNewVersionCreatedWordGameContentForFirst({page, dispatch, realm, state, versionContent})
        }
    // });
}
const getNewVersionCreatedWordGameContent = async ({page, dispatch, realm, state, versionContent})=>{
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
                query getNewVersionCreatedWordGameContent(
                    $page : Int!,
                    $version_created : Int!,
                ){
                    getNewVersionCreatedWordGameContent(
                        page : $page,
                        version_created : $version_created,
                    ) {
                        season{
                            _id,
                            title,
                            description,
                            language_ref,
                            media{path, file_type, duration, order, type},
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
                            letters,
                            words,
                            hidden_words,
                            media{path, file_type, duration, order},
                            voice{path, file_type, duration, order},
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
                            stage_game_active,
                            word_game,
                            word_game_active,
                            package_game,
                            package_game_active,
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
        const data = response.data?.data?.getNewVersionCreatedWordGameContent;
        if (data) {
            const seasonList = data?.season ?? [];
            const stageList = data?.stage ?? [];
            const languageList = data?.language ?? [];
            let result = true;
            if (seasonList.length > 0) {
                const res = createManyWordGameSeasons(realm, seasonList);
                if (!res) result = false;
            }
            if (stageList.length > 0) {
                const res = createManyWordGameStages(realm, stageList);
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
                    getNewVersionCreatedWordGameContent({page, dispatch, realm, state, versionContent})
                } else {
                    dispatch(setVersionCreatedDownloded({downloaded:true}))
                    if(version_updated > versionUpdatedContent && versionUpdatedDownloded == false){
                        const page = versionUpdatedPage
                        getNewVersionUpdatedWordGameContent({page, dispatch, realm, state, versionContent})
                    } else if(version_deleted > versionDeletedContent && versionDeletedDownloded == false){
                        const page = versionDeletedPage
                        getNewVersionDeletedWordGameContent({page, dispatch, realm, state, versionContent})
                    } else {
                        const newVersionContent = {versionCreatedContent:version_created, versionUpdatedContent:version_updated, versionDeletedContent:version_deleted}
                        upgradeWordGameContentVersion({dispatch, newVersionContent})
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
const getNewVersionUpdatedWordGameContent = async ({page, dispatch, realm, state, versionContent})=>{
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
                query getNewVersionUpdatedWordGameContent(
                    $page : Int!,
                    $version_updated : Int!,
                ){
                    getNewVersionUpdatedWordGameContent(
                        page : $page,
                        version_updated : $version_updated,
                    ) {
                        season{
                            _id,
                            title,
                            description,
                            language_ref,
                            media{path, file_type, duration, order, type},
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
                            letters,
                            words,
                            hidden_words,
                            media{path, file_type, duration, order},
                            voice{path, file_type, duration, order},
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
                            stage_game_active,
                            word_game,
                            word_game_active,
                            package_game,
                            package_game_active,
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
        const data = response.data?.data?.getNewVersionUpdatedWordGameContent;
        if (data) {
            const seasonList = data?.season ?? [];
            const stageList = data?.stage ?? [];
            const languageList = data?.language ?? [];
            let result = true;
            if (seasonList.length > 0) {
                const res = updateManyWordGameSeasons(realm, seasonList);
                if (!res) result = false;
            }
            if (stageList.length > 0) {
                const res = updateManyWordGameStages(realm, stageList);
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
                    getNewVersionUpdatedWordGameContent({page, dispatch, realm, state, versionContent})
                } else {
                    dispatch(setVersionUpdatedDownloded({downloaded:true}))
                    if(version_deleted > versionDeletedContent && versionDeletedDownloded == false){
                        const page = versionDeletedPage
                        getNewVersionDeletedWordGameContent({page, dispatch, realm, state, versionContent})
                    } else {
                        const newVersionContent = {versionCreatedContent:version_created, versionUpdatedContent:version_updated, versionDeletedContent:version_deleted}
                        upgradeWordGameContentVersion({dispatch, newVersionContent})
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
const getNewVersionDeletedWordGameContent = async ({page, dispatch, realm, state, versionContent})=>{
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
                query getNewVersionDeletedWordGameContent(
                    $page : Int!,
                    $version_deleted : Int!,
                ){
                    getNewVersionDeletedWordGameContent(
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
        const data = response.data?.data?.getNewVersionDeletedWordGameContent;
        if (data) {
            const seasonList = data?.season ?? [];
            const stageList = data?.stage ?? [];
            const languageList = data?.language ?? [];
            let result = true;
            if (seasonList.length > 0) {
                const res = deleteManyWordGameSeasons(realm, seasonList);
                if (!res) result = false;
            }
            if (stageList.length > 0) {
                const res = deleteManyWordGameStages(realm, stageList);
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
                    getNewVersionDeletedWordGameContent({page, dispatch, realm, state, versionContent})
                } else {
                    dispatch(setVersionDeletedDownloded({downloaded:true}))
                    const newVersionContent = {versionCreatedContent:version_created, versionUpdatedContent:version_updated, versionDeletedContent:version_deleted}
                    upgradeWordGameContentVersion({dispatch, newVersionContent})
                }
            }
        } else {
            dispatch(setGetError());
        }
    }).catch((err)=>{
        dispatch(setGetError())
    })
}
const getNewVersionCreatedWordGameContentForFirst = async ({page, dispatch, realm, state, versionContent})=>{
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
                query getNewVersionCreatedWordGameContent(
                    $page : Int!,
                    $version_created : Int!,
                ){
                    getNewVersionCreatedWordGameContent(
                        page : $page,
                        version_created : $version_created,
                    ) {
                        season{
                            _id,
                            title,
                            description,
                            language_ref,
                            media{path, file_type, duration, order, type},
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
                            letters,
                            words,
                            hidden_words,
                            media{path, file_type, duration, order},
                            voice{path, file_type, duration, order},
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
                            stage_game_active,
                            word_game,
                            word_game_active,
                            package_game,
                            package_game_active,
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
        const data = response.data?.data?.getNewVersionCreatedWordGameContent;
        if (data) {
            const seasonList = data?.season ?? [];
            const stageList = data?.stage ?? [];
            const languageList = data?.language ?? [];
            let result = true;
            if (seasonList.length > 0) {
                const res = createManyWordGameSeasons(realm, seasonList);
                if (!res) result = false;
            }
            if (stageList.length > 0) {
                const res = createManyWordGameStages(realm, stageList);
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
                    getNewVersionCreatedWordGameContentForFirst({page, dispatch, realm, state, versionContent})
                } else {
                    dispatch(setVersionCreatedDownloded({downloaded:true}))
                    const newVersionContent = {versionCreatedContent:version_created, versionUpdatedContent:version_updated, versionDeletedContent:version_deleted}
                    const firstGetContent = true
                    upgradeWordGameContentVersion({dispatch, newVersionContent, firstGetContent})
                }
            }
        } else {
            dispatch(setGetError());
        }
    }).catch((err)=>{
        dispatch(setGetError())
    })
}
export const upgradeWordGameContentVersion = async({dispatch, newVersionContent, firstGetContent}) => {
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
                mutation upgradeWordGameContentVersion(
                    $version_created : Int!,
                    $version_updated : Int!,
                    $version_deleted : Int!,
                ){
                    upgradeWordGameContentVersion(
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
        body:firstGetContent==true?"محتوای بازی خان کلمات با موفقیت دریافت شد!":"بروزرسانی محتوای بازی خان کلمات با موفقیت انجام شد!",
        buttons: [
            {
                text: "شروع بازی",
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
                navigate("WordGameUpdateScreen")
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
            text:"بروزرسانی محتوای بازی خان کلمات!",
            style:{ maxWidth:width-30, fontFamily:Font.bakh_bold, fontSize:20, color:colors.alert.a1, alignSelf:'flex-start', textAlign:'justify', lineHeight:30},
        },
        {
            text:"یک بروزرسانی برای محتوای بازی خان کلمات یافت شد. می‌توانید برای دریافت آن اقدام کنید.",
            style:{ maxWidth:width-30, fontFamily:Font.bakh_semi_bold, fontSize:14, color:colors.text.a6, alignSelf:'flex-start', textAlign:'justify', lineHeight:28},
        },
        {
            text:"توجه کنید هنگام بروزرسانی محتوای بازی، از اتصال دستگاه خود به اینترنت مطمئن شوید.",
            style:{ maxWidth:width-30, fontFamily:Font.bakh_semi_bold, fontSize:14, color:colors.text.a6, alignSelf:'flex-start', textAlign:'justify', lineHeight:28},
        },
    ]
    AlertBottomDrawerHelper.showAlert({
        title:"بروزرسانی بازی خان کلمات",
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
                props.navigation.navigate("WordGameUpdateScreen")
            },
            text: "دریافت بروزرسانی",
            loading: false,
            type: "bold",
        },
    ]
    const msg = [
        {
            text:"بروزرسانی محتوای بازی خان کلمات!",
            style:{ maxWidth:width-30, fontFamily:Font.bakh_bold, fontSize:20, color:colors.alert.a1, alignSelf:'flex-start', textAlign:'justify', lineHeight:30},
        },
        {
            text:"یک بروزرسانی اجباری برای محتوای بازی خان کلمات یافت شد. برای دریافت آن اقدام کنید.",
            style:{ maxWidth:width-30, fontFamily:Font.bakh_semi_bold, fontSize:14, color:colors.text.a6, alignSelf:'flex-start', textAlign:'justify', lineHeight:28},
        },
        {
            text:"توجه کنید هنگام بروزرسانی محتوای بازی، از اتصال دستگاه خود به اینترنت مطمئن شوید.",
            style:{ maxWidth:width-30, fontFamily:Font.bakh_semi_bold, fontSize:14, color:colors.text.a6, alignSelf:'flex-start', textAlign:'justify', lineHeight:28},
        },
    ]
    AlertBottomDrawerHelper.showAlert({
        title:"بروزرسانی بازی خان کلمات",
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
