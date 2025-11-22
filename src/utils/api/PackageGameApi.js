import axios from "axios";
import { InteractionManager } from 'react-native';
import AlertHelper from "../../components/alert/AlertHelper";
import { createManyPackageSeasons } from "../../realm/repositories/package-game/package-season.repository";
import { createManyPackageStages } from "../../realm/repositories/package-game/package-stage.repository";
import { createPackage } from "../../realm/repositories/package-game/package.repository";
import { changeCompletionStatusUserPackage, createUserPackage } from "../../realm/repositories/user/user-package-game-progress.repository";
import { updateNumberCoins } from "../../redux/slices/coinSlice";
import { endProgressLoading, setDownloadEnded, setGetError, setIsDownloading, setIsDownloadingFailed, setVersionCreatedPage } from "../../redux/slices/packageGameDownloadSlice";

export const setPackageGameForUser = async({ dispatch, realm, packageId, packageInfo, numberCoins, userPackageInfo, status, selectedAccessType }) => {
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
                dispatch(setIsDownloading({packageId, userPackageId:data?._id, dataCheck}))
                const page = 1
                getNewVersionCreatedPackageGameContentForFirst({page, realm, dispatch, versionContent:dataCheck, packageId, userPackageId:data?._id})
            } else {
                dispatch(setIsDownloadingFailed({packageId, userPackageId:data?._id, dataCheck}))
            }
        } else {
            dispatch(endProgressLoading())
            AlertHelper.showAlert({
                body: data?.message??"مشکلی پیش آمد. دوباره تلاش کنید.",
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
        dispatch(setIsDownloading({packageId, userPackageId:userPackageInfo?._id, dataCheck}))
        const page = 1
        getNewVersionCreatedPackageGameContentForFirst({page, realm, dispatch, versionContent:dataCheck, packageId, userPackageId:userPackageInfo?._id})
    } else {
        dispatch(setIsDownloadingFailed({packageId, userPackageId:userPackageInfo?._id, dataCheck}))
    }
}

export const redownloadContentPackageGameForUser = async({ dispatch, realm, packageId, packageInfo, userPackageInfo }) =>{
    const packagDocument = createPackage(realm, packageInfo)
    const dataCheck = {
        version_created : userPackageInfo.version_created,
        version_updated : userPackageInfo.version_updated,
        version_deleted : userPackageInfo.version_deleted,
    }
    if(packagDocument == true ){
        dispatch(setIsDownloading({packageId, userPackageId:userPackageInfo?._id, dataCheck}))
        const page = 1
        getNewVersionCreatedPackageGameContentForFirst({page, realm, dispatch, versionContent:dataCheck, packageId, userPackageId:userPackageInfo?._id})
    } else {
        dispatch(setIsDownloadingFailed({packageId, userPackageId:userPackageInfo?._id, dataCheck}))
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
                    $page : Int!,
                    $version_created : Int!,
                ){
                    getNewVersionCreatedPackageGameContent(
                        package : $package,
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
                "page" : page,
                "version_created" : 0,
            }
        }
    }).then((response)=>{
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
            if (!result) {
                dispatch(setGetError());
            } else {
                if(data?.hasNextPage == true) {
                    const page = data?.nextPage
                    dispatch(setVersionCreatedPage({page}))
                    getNewVersionCreatedPackageGameContentForFirst({page, realm, dispatch})
                } else {
                    const newVersionContent = {versionCreatedContent:versionContent.version_created, versionUpdatedContent:versionContent.version_updated, versionDeletedContent:versionContent.version_deleted}
                    dispatch(setDownloadEnded())
                    const completionStatus = true
                    changeCompletionStatusUserPackage(realm, userPackageId, completionStatus)
                    upgradePackageGameContentVersion({newVersionContent, userPackageId})
                }
            }
        } else {
            dispatch(setGetError());
        }
    }).catch((err)=>{
        dispatch(setGetError())
    })
}
export const upgradePackageGameContentVersion = async({newVersionContent, userPackageId}) => {
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
        showSuccessAlertForDownloaded()
    }).catch((err)=>{
        showSuccessAlertForDownloaded()
    })
}
const showSuccessAlertForDownloaded = ()=>{
    AlertHelper.showAlert({
        body: "بروزرسانی محتوای بستهٔ بازی با موفقیت انجام شد!",
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
