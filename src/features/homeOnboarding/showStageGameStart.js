// src/features/onboarding/showStageGameStart.js
import { Text, View, Dimensions } from 'react-native';
import AlertBottomDrawerHelper from '../../components/alert-bottom-drawer/AlertBottomDrawerHelper';
import Font from '../../utils/Font';
import LocalImageComponent from '../../components/image-components/LocalImageComponent';
import GlassVeil from '../../components/home-parts/components/GlassVeil';
import { reset } from '../../main/navigationService';
import { colors } from '../../hooks/theme/colors';
import { store } from '../../redux/store/Store';

export default function showStageGameStart() {
    const {width} = Dimensions.get("screen");
    const state = store.getState()
    const version = state.stageGamePersist.versionCreatedContent
    if(version < 1){
        AlertBottomDrawerHelper.showAlert({
            title: 'ادامهٔ بازی',
            message: [
                {
                    text: 'با بخش «خان کلمات» آشنا شدی!',
                    style: {maxWidth: width - 40, fontFamily: Font.bakh_semi_bold, fontSize: 14, color: colors.primary.a3, alignSelf: 'flex-start', textAlign: 'justify', lineHeight: 30},
                },
                {
                    text: 'حالا وقتشه «جمله‌چین» رو هم امتحان کنی؛ کلمه‌ها رو کنار هم بچین و جمله بساز.',
                    style: {maxWidth: width - 40, fontFamily: Font.bakh_semi_bold, fontSize: 14, color: colors.primary.a3, alignSelf: 'flex-start', textAlign: 'justify', lineHeight: 30},
                },
                {
                    text: 'در ادامه لازم نیست بخش‌ها رو به ترتیب پیش ببری؛ می‌تونی هر کدوم رو که دوست داری بازی کنی.',
                    style: {maxWidth: width - 40, fontFamily: Font.bakh_semi_bold, fontSize: 14, color: colors.primary.a3, alignSelf: 'flex-start', textAlign: 'justify', lineHeight: 30},
                },
            ],
            buttons: [
                {
                    onPress: ()=>{
                        reset(
                            [
                                {name: 'Home'},
                                {name: 'StageGame'},
                                {name: 'StageGameUpdateScreen'},
                            ]
                        )
                    },
                    text: 'ادامه',
                    loading: false,
                    type: 'bold'
                },
            ],
            options: {
                cancelable: false,
                icon:{
                    Icon:()=>(
                        <View style={{ width: '100%', alignItems: 'center', justifyContent: 'center', gap: 30}}>
                            <View
                                style={{ alignItems: 'center', gap: 8}}>
                                <LocalImageComponent
                                    path={require('../../assets/image/home-stage-game.png')}
                                    width={70}
                                    height={70}
                                    resizeMode="stretch"
                                    blank_background
                                    borderRadius={10}
                                    style={{borderColor:colors.primary.a5, borderWidth:1.5}}
                                />
                                <Text style={{fontFamily: Font.bakh_bold, fontSize: 16, color: colors.primary.a5}}>{'بازی جمله‌چین'}</Text>
                            </View>
                        </View>
                    )
                }
            },
        });
    }
}