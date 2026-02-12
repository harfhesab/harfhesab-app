import axios from "axios";
import { goBack } from "../../../main/navigationService";
import GameAlertHelper from "../../game-alert/GameAlertHelper";
import { successfulCompletionOfConnectingLetterSound } from "../../../utils/sound/SoundFunctions";



export const unknownWordCompletedInPackageGame = async()=>{
    GameAlertHelper.showAlertGame({
        title: "کشف واژهٔ نامعلوم",
        admiration: "احسنت، عالی بود!",
        description: `کلمه نامعلوم با موفقیت ساخته شد.`,
        buttons: [
            {
                text: 'ادامه',
                onPress: () => {
                    goBack()
                },
                type:'bold'
            },
            {
                onPress: () => {
                    goBack()
                },
                type:'ads',
                reward: 10
            }
        ],
        options : {
            type: 'completed-word',
            cancelable: false,
        },
    });
    setTimeout(()=>{
        successfulCompletionOfConnectingLetterSound()
    }, 1000)
}