import { goBack } from "../../../main/navigationService";
import GameAlertHelper from "../../game-alert/GameAlertHelper";
import { successfulCompletionOfConnectingLetterSound } from "../../../utils/sound/SoundFunctions";



export const unknownWordCompletedInKalamAkharChallenge = async()=>{
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
        ],
        options : {
            lottie: 'success',
            cancelable: false,
        },
    });
    setTimeout(()=>{
        successfulCompletionOfConnectingLetterSound()
    }, 1000)
}