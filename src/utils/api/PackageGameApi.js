import axios from "axios";
import { InteractionManager } from 'react-native';
import AlertHelper from "../../components/alert/AlertHelper";
import { createManyPackageSeasons, deleteManyPackageSeasons, updateManyPackageSeasons } from "../../realm/repositories/package-game/package-season.repository";
import { createManyPackageStages, deleteManyPackageStages, updateManyPackageStages } from "../../realm/repositories/package-game/package-stage.repository";
import { createPackage, updatePreviousPackage } from "../../realm/repositories/package-game/package.repository";
import { changeCompletionStatusUserPackage, createUserPackage, updateUserPackageVersions } from "../../realm/repositories/user/user-package-game-progress.repository";
import { updateNumberCoins } from "../../redux/slices/coinSlice";
import {
    endProgressLoading,
    setDownloadEnded,
    setGetError,
    setIsDownloading,
    setIsDownloadingFailed,
    setVersionCreatedDownloded,
    setVersionCreatedPage,
    setVersionDeletedDownloded,
    setVersionDeletedPage,
    setVersionUpdatedDownloded,
    setVersionUpdatedPage,
    startProgressLoading
} from "../../redux/slices/packageGameDownloadSlice";
import { startSetPackageGameForUserAndGetIt } from "../background-task/PackageGameContentTask";
import { store } from "../../redux/store/Store";
import Globals from "../Globals";
import { preloadImages } from "../ImagePreloader";
const BASE_URL = Globals.uri;

export const setPackageGameForUser = async({ dispatch, realm, packageId, packageInfo, numberCoins, userPackageInfo, status, selectedAccessType, color }) => {
    await axios({
        url:'/',
        method:'post',
        data: {
            query : `
                mutation setPackageGameForUser(
                    $package : ID!,
                    $user_package_status : String!,
                    $selected_access_type : String!,
                    $user_number_coins : Int,
                ){
                    setPackageGameForUser(
                        package : $package,
                        user_package_status : $user_package_status,
                        selected_access_type : $selected_access_type,
                        user_number_coins : $user_number_coins,
                    ) {
                        _id,
                        number,
                        status,
                        message
                    }
                }
            `,
            variables : {
                "package" : packageId,
                "user_package_status" : status,
                "selected_access_type" : selectedAccessType,
                "user_number_coins" : numberCoins,
            }
        }
    }).then((response)=>{
        const data = response.data?.data?.setPackageGameForUser
        if(data?.status == 200 && data?._id){
            if(selectedAccessType == "coin-payment" && typeof data?.number === "number"){
                dispatch(updateNumberCoins({number:data.number}))
            }
            const packagDocument = createPackage(realm, packageInfo)
            userPackageInfo._id = data?._id
            const userPackagDocument = createUserPackage(realm, userPackageInfo)
            const dataCheck = {
                version_created : userPackageInfo.version_created,
                version_updated : userPackageInfo.version_updated,
                version_deleted : userPackageInfo.version_deleted,
            }
            if(packagDocument == true && userPackagDocument == true){
                dispatch(setIsDownloading({packageId, userPackageId:data?._id}))
                const page = 1
                getNewVersionCreatedPackageGameContentForFirst({page, realm, dispatch, versionContent:dataCheck, packageId, userPackageId:data?._id})
            } else {
                dispatch(setIsDownloadingFailed({packageId, userPackageId:data?._id}))
            }
        } else {
            dispatch(endProgressLoading())
            AlertHelper.showAlert({
                body: data?.message??"مشکلی پیش آمد. دوباره تلاش کنید.",
                buttons: [
                    {
                        text: 'تلاش مجدد',
                        onPress: async() => {
                            dispatch(startProgressLoading({packageId, contentSyncState:"initial-sync"}))
                            await startSetPackageGameForUserAndGetIt({ dispatch, realm, packageId:packageParamId, packageInfo, numberCoins, userPackageInfo, status, selectedAccessType, color });
                        },
                        type:'bold'
                    },
                    {
                        text: 'لغو',
                        onPress: () => {},
                        type:'border'
                    },
                ],
                options : {
                    type: 'warning',
                    cancelable: true,
                    bodyAlign:'center',
                    textAlign:'center'
                },
            });
        }
    }).catch((err)=>{
        dispatch(endProgressLoading())
        AlertHelper.showAlert({
            body: "مشکلی پیش آمد. دوباره تلاش کنید.",
            buttons: [
                {
                    text: 'تلاش مجدد',
                    onPress: () => {
                        setPackageGameForUser({ dispatch, realm, packageId, packageInfo, userPackageInfo, status, selectedAccessType })
                    },
                    type:'bold'
                },
                {
                    text: 'لغو',
                    onPress: () => {},
                    type:'border'
                },
            ],
            options : {
                type: 'warning',
                cancelable: true,
                bodyAlign:'center',
                textAlign:'center'
            },
        });
    })
}
export const recreatePackageGameForUser = async({ dispatch, realm, packageId, packageInfo, userPackageInfo }) =>{
    const packagDocument = createPackage(realm, packageInfo)
    const userPackagDocument = createUserPackage(realm, userPackageInfo)
    const dataCheck = {
        version_created : userPackageInfo.version_created,
        version_updated : userPackageInfo.version_updated,
        version_deleted : userPackageInfo.version_deleted,
    }
    if(packagDocument == true && userPackagDocument == true){
        dispatch(setIsDownloading({packageId, userPackageId:userPackageInfo?._id}))
        const page = 1
        getNewVersionCreatedPackageGameContentForFirst({page, realm, dispatch, versionContent:dataCheck, packageId, userPackageId:userPackageInfo?._id})
    } else {
        dispatch(setIsDownloadingFailed({packageId, userPackageId:userPackageInfo?._id}))
    }
}
const getNewVersionCreatedPackageGameContentForFirst = async ({page, realm, dispatch, versionContent, packageId, userPackageId})=>{
    await axios({
        url:'/',
        method:'post',
        data: {
            query : `
                query getNewVersionCreatedPackageGameContent(
                    $package : ID!,
                    $user_package : ID!,
                    $page : Int!,
                    $version_created : Int!,
                ){
                    getNewVersionCreatedPackageGameContent(
                        package : $package,
                        user_package : $user_package,
                        page : $page,
                        version_created : $version_created,
                    ) {
                        season{
                            _id,
                            package,
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
                            package,
                            season,
                            language_ref,
                            stage_number_in_package,
                            stage_number_in_season,
                            is_visible,
                            is_active,
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
                "package" : packageId,
                "user_package" : userPackageId,
                "page" : page,
                "version_created" : 0,
            }
        }
    }).then(async(response)=>{
        const data = response.data?.data?.getNewVersionCreatedPackageGameContent;
        if (data) {
            const seasonList = data?.season ?? [];
            const stageList = data?.stage ?? [];
            let result = true;
            if (seasonList.length > 0) {
                const res = createManyPackageSeasons(realm, seasonList);
                if (!res) result = false;
            }
            if (stageList.length > 0) {
                const res = createManyPackageStages(realm, stageList);
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
            const allUrls = Array.from(
                new Set([ ...seasonUrls, ...stageUrls])
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
                    dispatch(setVersionCreatedPage({page}))
                    getNewVersionCreatedPackageGameContentForFirst({page, realm, dispatch, versionContent, packageId, userPackageId})
                } else {
                    const newVersionContent = {versionCreatedContent:versionContent.version_created, versionUpdatedContent:versionContent.version_updated, versionDeletedContent:versionContent.version_deleted}
                    const completionStatus = true
                    changeCompletionStatusUserPackage(realm, userPackageId, completionStatus)
                    const firstGetContent = true
                    upgradePackageGameContentVersion({dispatch, newVersionContent, userPackageId, firstGetContent})
                }
            }
        } else {
            dispatch(setGetError());
        }
    }).catch((err)=>{
        dispatch(setGetError())
    })
}
// ================================================================================================================
// ================================================================================================================
// ================================================================================================================
export const updatePackageGameContent = ({ dispatch, realm, userPackageInfo, newVersions, packageInfo, color }) => {
    const reduxState = store.getState().packageGameDownload
    const {
        version_created,
        version_updated,
        version_deleted,
    } = newVersions;

    const {
        packageId,
        userPackageId,
        versionCreatedContent,
        versionUpdatedContent,
        versionDeletedContent,
    } = userPackageInfo;

    dispatch(setIsDownloading({packageId, userPackageId}))

    const {
        versionCreatedPage,
        versionUpdatedPage,
        versionDeletedPage,
        versionCreatedDownloded,
        versionUpdatedDownloded,
        versionDeletedDownloded,
    } = reduxState;

    if(version_created > versionCreatedContent && versionCreatedDownloded == false){
        const page = versionCreatedPage
        getNewVersionCreatedPackageGameContent({ page, dispatch, realm, userPackageInfo, newVersions, packageInfo, color })
    } else if(version_updated > versionUpdatedContent && versionUpdatedDownloded == false){
        const page = versionUpdatedPage
        getNewVersionUpdatedPackageGameContent({ page, dispatch, realm, userPackageInfo, newVersions, packageInfo, color })
    } else if(version_deleted > versionDeletedContent && versionDeletedDownloded == false){
        const page = versionDeletedPage
        getNewVersionDeletedPackageGameContent({ page, dispatch, realm, userPackageInfo, newVersions, packageInfo, color })
    }
}
const getNewVersionCreatedPackageGameContent = async ({ page, dispatch, realm, userPackageInfo, newVersions, packageInfo, color })=>{
    
    const reduxState = store.getState().packageGameDownload

    const {
        version_created,
        version_updated,
        version_deleted,
    } = newVersions;

    const {
        packageId,
        userPackageId,
        versionCreatedContent,
        versionUpdatedContent,
        versionDeletedContent,
    } = userPackageInfo;

    const {
        versionCreatedPage,
        versionUpdatedPage,
        versionDeletedPage,
        versionCreatedDownloded,
        versionUpdatedDownloded,
        versionDeletedDownloded,
    } = reduxState;

    await axios({
        url:'/',
        method:'post',
        data: {
            query : `
                query getNewVersionCreatedPackageGameContent(
                    $package : ID!,
                    $user_package : ID!,
                    $page : Int!,
                    $version_created : Int!,
                ){
                    getNewVersionCreatedPackageGameContent(
                        package : $package,
                        user_package : $user_package,
                        page : $page,
                        version_created : $version_created,
                    ) {
                        season{
                            _id,
                            package,
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
                            package,
                            season,
                            language_ref,
                            stage_number_in_package,
                            stage_number_in_season,
                            is_visible,
                            is_active,
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
                "package" : packageId,
                "user_package" : userPackageId,
                "page" : page,
                "version_created" : versionCreatedContent,
            }
        }
    }).then(async(response)=>{
        const data = response.data?.data?.getNewVersionCreatedPackageGameContent;
        if (data) {
            const seasonList = data?.season ?? [];
            const stageList = data?.stage ?? [];
            let result = true;
            if (seasonList.length > 0) {
                const res = createManyPackageSeasons(realm, seasonList);
                if (!res) result = false;
            }
            if (stageList.length > 0) {
                const res = createManyPackageStages(realm, stageList);
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
            const allUrls = Array.from(
                new Set([ ...seasonUrls, ...stageUrls])
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
                    dispatch(setVersionCreatedPage({page}))
                    getNewVersionCreatedPackageGameContent({ page, dispatch, realm, userPackageInfo, newVersions, packageInfo, color })
                } else {
                    dispatch(setVersionCreatedDownloded({downloaded:true}))
                    if(version_updated > versionUpdatedContent && versionUpdatedDownloded == false){
                        const page = versionUpdatedPage
                        getNewVersionUpdatedPackageGameContent({ page, dispatch, realm, userPackageInfo, newVersions, packageInfo, color })
                    } else if(version_deleted > versionDeletedContent && versionDeletedDownloded == false){
                        const page = versionDeletedPage
                        getNewVersionDeletedPackageGameContent({ page, dispatch, realm, userPackageInfo, newVersions, packageInfo, color })
                    } else {
                        const firstGetContent = false
                        const newVersionContent = {versionCreatedContent:version_created, versionUpdatedContent:version_updated, versionDeletedContent:version_deleted}
                        const userPackage = userPackageId
                        const packageDoc = updatePreviousPackage(realm, packageId, packageInfo)
                        const userPackageDoc = updateUserPackageVersions(realm, userPackage, version_created, version_updated, version_deleted)
                        if(packageDoc == true && userPackageDoc == true){
                            upgradePackageGameContentVersion({dispatch, newVersionContent, userPackageId, firstGetContent})
                        } else {
                            dispatch(setGetError());
                        }
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
const getNewVersionUpdatedPackageGameContent = async ({ page, dispatch, realm, userPackageInfo, newVersions, packageInfo, color })=>{
    
    const reduxState = store.getState().packageGameDownload

    const {
        version_created,
        version_updated,
        version_deleted,
    } = newVersions;

    const {
        packageId,
        userPackageId,
        versionCreatedContent,
        versionUpdatedContent,
        versionDeletedContent,
    } = userPackageInfo;

    const {
        versionCreatedPage,
        versionUpdatedPage,
        versionDeletedPage,
        versionCreatedDownloded,
        versionUpdatedDownloded,
        versionDeletedDownloded,
    } = reduxState;
    
    await axios({
        url:'/',
        method:'post',
        data: {
            query : `
                query getNewVersionUpdatedPackageGameContent(
                    $package : ID!,
                    $user_package : ID!,
                    $page : Int!,
                    $version_updated : Int!,
                ){
                    getNewVersionUpdatedPackageGameContent(
                        package : $package,
                        user_package : $user_package,
                        page : $page,
                        version_updated : $version_updated,
                    ) {
                        season{
                            _id,
                            package,
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
                            package,
                            season,
                            language_ref,
                            stage_number_in_package,
                            stage_number_in_season,
                            is_visible,
                            is_active,
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
                "package" : packageId,
                "user_package" : userPackageId,
                "page" : page,
                "version_updated" : versionUpdatedContent,
            }
        }
    }).then(async(response)=>{
        const data = response.data?.data?.getNewVersionUpdatedPackageGameContent;
        if (data) {
            const seasonList = data?.season ?? [];
            const stageList = data?.stage ?? [];
            let result = true;
            if (seasonList.length > 0) {
                const res = updateManyPackageSeasons(realm, seasonList);
                if (!res) result = false;
            }
            if (stageList.length > 0) {
                const res = updateManyPackageStages(realm, stageList);
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
            const allUrls = Array.from(
                new Set([ ...seasonUrls, ...stageUrls])
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
                    getNewVersionUpdatedPackageGameContent({ page, dispatch, realm, userPackageInfo, newVersions, packageInfo, color })
                } else {
                    dispatch(setVersionUpdatedDownloded({downloaded:true}))
                    if(version_deleted > versionDeletedContent && versionDeletedDownloded == false){
                        const page = versionDeletedPage
                        getNewVersionDeletedPackageGameContent({ page, dispatch, realm, userPackageInfo, newVersions, packageInfo, color })
                    } else {
                        const firstGetContent = false
                        const newVersionContent = {versionCreatedContent:version_created, versionUpdatedContent:version_updated, versionDeletedContent:version_deleted}
                        const userPackage = userPackageId
                        const packageDoc = updatePreviousPackage(realm, packageId, packageInfo)
                        const userPackageDoc = updateUserPackageVersions(realm, userPackage, version_created, version_updated, version_deleted)
                        if(packageDoc == true && userPackageDoc == true){
                            upgradePackageGameContentVersion({dispatch, newVersionContent, userPackageId, firstGetContent})
                        } else {
                            dispatch(setGetError());
                        }
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
const getNewVersionDeletedPackageGameContent = async ({ page, dispatch, realm, userPackageInfo, newVersions, packageInfo, color })=>{
    
    const reduxState = store.getState().packageGameDownload

    const {
        version_created,
        version_updated,
        version_deleted,
    } = newVersions;

    const {
        packageId,
        userPackageId,
        versionCreatedContent,
        versionUpdatedContent,
        versionDeletedContent,
    } = userPackageInfo;

    const {
        versionCreatedPage,
        versionUpdatedPage,
        versionDeletedPage,
        versionCreatedDownloded,
        versionUpdatedDownloded,
        versionDeletedDownloded,
    } = reduxState;
    
    await axios({
        url:'/',
        method:'post',
        data: {
            query : `
                query getNewVersionDeletedPackageGameContent(
                    $package : ID!,
                    $user_package : ID!,
                    $page : Int!,
                    $version_deleted : Int!,
                ){
                    getNewVersionDeletedPackageGameContent(
                        package : $package,
                        user_package : $user_package,
                        page : $page,
                        version_deleted : $version_deleted,
                    ) {
                        season{
                            _id,
                        },
                        stage{
                            _id,
                        },
                        hasNextPage,
                        nextPage
                    }
                }
            `,
            variables : {
                "package" : packageId,
                "user_package" : userPackageId,
                "page" : page,
                "version_deleted" : versionDeletedContent,
            }
        }
    }).then((response)=>{
        const data = response.data?.data?.getNewVersionDeletedPackageGameContent;
        if (data) {
            const seasonList = data?.season ?? [];
            const stageList = data?.stage ?? [];
            let result = true;
            if (seasonList.length > 0) {
                const res = deleteManyPackageSeasons(realm, seasonList);
                if (!res) result = false;
            }
            if (stageList.length > 0) {
                const res = deleteManyPackageStages(realm, stageList);
                if (!res) result = false;
            }
            if (!result) {
                dispatch(setGetError());
            } else {
                if(data?.hasNextPage == true) {
                    const page = data?.nextPage
                    dispatch(setVersionDeletedPage({ page: page}))
                    getNewVersionDeletedPackageGameContent({ page, dispatch, realm, userPackageInfo, newVersions, packageInfo, color })
                } else {
                    dispatch(setVersionDeletedDownloded({downloaded:true}))
                    const firstGetContent = false
                    const newVersionContent = {versionCreatedContent:version_created, versionUpdatedContent:version_updated, versionDeletedContent:version_deleted}
                    const userPackage = userPackageId
                    const packageDoc = updatePreviousPackage(realm, packageId, packageInfo)
                    const userPackageDoc = updateUserPackageVersions(realm, userPackage, version_created, version_updated, version_deleted)
                    if(packageDoc == true && userPackageDoc == true){
                        upgradePackageGameContentVersion({dispatch, newVersionContent, userPackageId, firstGetContent})
                    } else {
                        dispatch(setGetError());
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
// ================================================================================================================
// ================================================================================================================
// ================================================================================================================
export const upgradePackageGameContentVersion = async({dispatch, newVersionContent, userPackageId, firstGetContent}) => {
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
                mutation upgradePackageGameContentVersion(
                    $user_package : ID!,
                    $version_created : Int!,
                    $version_updated : Int!,
                    $version_deleted : Int!,
                ){
                    upgradePackageGameContentVersion(
                        user_package : $user_package,
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
                "user_package" : userPackageId,
                "version_created" : versionCreatedContent,
                "version_updated" : versionUpdatedContent,
                "version_deleted" : versionDeletedContent
            }
        }
    }).then((response)=>{
        dispatch(setDownloadEnded())
        showSuccessAlertForDownloaded(firstGetContent)
    }).catch((err)=>{
        dispatch(setDownloadEnded())
        showSuccessAlertForDownloaded(firstGetContent)
    })
}
const showSuccessAlertForDownloaded = (firstGetContent)=>{
    AlertHelper.showAlert({
        body:firstGetContent == true?"بستهٔ بازی با موفقیت دریافت شد.":"محتوای بستهٔ بازی با موفقیت بروزرسانی شد.",
        buttons: [
            {
                text: "متوجه شدم",
                onPress: () => {},
                type:'bold'
            },
        ],
        options : {
            type: 'success',
            cancelable: true
        },
    });
}