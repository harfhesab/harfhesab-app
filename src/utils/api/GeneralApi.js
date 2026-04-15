import axios from "axios";
import { InteractionManager } from 'react-native';
import { navigate } from "../../main/navigationService";
import AlertMessageInAppHelper from "../../components/alert-message-in-app/AlertMessageInAppHelper";


export const getAllNewMessageInAppForUser = async() => {
    InteractionManager.runAfterInteractions(() => {
        const run = async ()=>{
            await axios({
                url:'/',
                method:'post',
                data: {
                    query : `
                        query getAllNewMessageInAppForUser(
                            $_id : ID,
                        ){
                            getAllNewMessageInAppForUser(
                                _id : $_id,
                            ) {
                                publicList{
                                    _id,
                                    title,
                                    body,
                                    link,
                                    package{_id, title, icon_image},
                                    free_coin_plan{_id, title, icon_image, number_coin},
                                    free_subscription_plan{_id, title, icon_image, duration},
                                    createdAt,
                                },
                                privateList{
                                    _id,
                                    title,
                                    body,
                                    link,
                                    package{_id, title, icon_image},
                                    free_coin_plan{_id, title, icon_image, number_coin},
                                    free_subscription_plan{_id, title, icon_image, duration},
                                    createdAt,
                                },
                            }
                        }
                    `,
                    variables : {
                        "_id" : null,
                    }
                }
            }).then((response)=>{
                const res = response.data?.data?.getAllNewMessageInAppForUser
                if(res){
                    res.publicList.map((item)=>(
                        item.type = "public"
                    ))
                    res.privateList.map((item)=>(
                        item.type = "private"
                    ))
                    const data = [...res.publicList, ...res.privateList].sort(function(a, b){return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()})
                    if(data?.length > 0){
                        AlertMessageInAppHelper.showAlert(data)
                    }
                }
            }).catch((err)=>{
                null
            })
        }
        run();
    });
}