import axios from "axios";
import { InteractionManager } from 'react-native';
import Toast from "react-native-toast-message";
import { setDownloadFinished, setVersionCreatedDownloded, setVersionCreatedPage } from "../../redux/slices/packageGameDownloadSlice";
import AlertHelper from "../../components/alert/AlertHelper";
import { createManyPackageSeasons } from "../../realm/repositories/package-game/package-season.repository";
import { createManyPackageStages } from "../../realm/repositories/package-game/package-stage.repository";

export const setPackageGameForUser = async({ dispatch, realm, package, status, selectedAccessType }) => {
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
                mutation setPackageGameForUser(
                    $package : ID!,
                    $user_package_status : String!,
                    $selected_access_type : String!
                ){
                    setPackageGameForUser(
                        package : $package,
                        user_package_status : $user_package_status,
                        selected_access_type : $selected_access_type,
                    ) {
                        status,
                        message
                    }
                }
            `,
            variables : {
                "package" : package,
                "user_package_status" : status,
                "selected_access_type" : selectedAccessType
            }
        }
    }).then((response)=>{
        const data = response.data?.data?.setPackageGameForUser
        if(data?.status == 200){
            
        } else {
            AlertHelper.showAlert({
                body: data?.message??"مشکلی پیش آمد. دوباره تلاش کنید.",
                buttons: [
                    {
                        text: 'تلاش مجدد',
                        onPress: () => {
                            setPackageGameForUser({dispatch, realm, package, status})
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
        AlertHelper.showAlert({
            body: "مشکلی پیش آمد. دوباره تلاش کنید.",
            buttons: [
                {
                    text: 'تلاش مجدد',
                    onPress: () => {
                        setPackageGameForUser({dispatch, realm, package, status})
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
const getNewVersionCreatedPackageGameContentForFirst = async ({page, dispatch, realm, state, versionContent})=>{
    const {
        dataCheck,
        packageId,
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
                            badg,
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
                    dispatch(setVersionCreatedPage({ page: page}))
                    getNewVersionCreatedPackageGameContentForFirst({page, dispatch, realm, state, versionContent})
                } else {
                    dispatch(setVersionCreatedDownloded({downloaded:true}))
                    const newVersionContent = {versionCreatedContent:version_created, versionUpdatedContent:version_updated, versionDeletedContent:version_deleted}
                    dispatch(setDownloadFinished())
                    // dispatch(changeVersionContent(newVersionContent)) // به جای این فانکشن باید ورژن های مربوط به پکیج را آپدیت کنیم
                    upgradePackageGameContentVersion({newVersionContent, packageId})
                }
            }
        } else {
            dispatch(setGetError());
        }
    }).catch((err)=>{
        dispatch(setGetError())
    })
}
export const upgradePackageGameContentVersion = async({newVersionContent, packageId}) => {
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
                    $package : ID!,
                    $version_created : Int!,
                    $version_updated : Int!,
                    $version_deleted : Int!,
                ){
                    upgradePackageGameContentVersion(
                        package : $package,
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
                "package" : packageId,
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
