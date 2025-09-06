import axios from "axios";
import { goBack } from "../../../main/navigationService";
import GameAlertHelper from "../../game-alert/GameAlertHelper";
import { successfulCompletionOfConnectingLetterSound } from "../../../utils/sound/SoundFunctions";



export const unknownWordCompletedInStageGame = async()=>{
    GameAlertHelper.showAlertGame({
        title: "تعیین کلمه نامشخص",
        admiration: "درود بر شما!",
        description: `کلمه نامشخص با موفقیت ساخته شد.`,
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
            type: 'success',
            cancelable: false,
        },
    });
    setTimeout(()=>{
        successfulCompletionOfConnectingLetterSound()
    }, 1000)
}