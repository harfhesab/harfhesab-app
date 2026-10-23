import { goBack, popTo } from "../../../main/navigationService";
import GameAlertHelper from "../../game-alert/GameAlertHelper";
import { harfAkharChallengeTimeIsOverSound, successfulCompletionOfConnectingLetterSound } from "../../../utils/sound/SoundFunctions";
import { store } from "../../../redux/store/Store";



export const unknownWordCompletedInHarfAkharChallenge = async()=>{
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
export const harfAkharChallengeTimeIsOverInConnectingLetters = ()=>{
    const state = store.getState()
    harfAkharChallengeTimeIsOverSound()
    GameAlertHelper.showAlertGame({
        title:`پایان زمان بازی`,
        description: "متأسفانه زمان مجاز شما برای تکمیل چالش به پایان رسید.",
        buttons: [
            {
                text: 'ادامه',
                onPress: () => {
                    popTo("HarfAkharBottomTab")
                },
                type:'bold'
            },
            {
                type:'ads',
                reward: state.constants.free_coin_view_ads,
                adsPosition: "harf_akhar_challenge"
            }
        ],
        options : {
            lottie: 'sand-clock',
            cancelable: false,
            isRewardDisabled: true
        },
    });
}