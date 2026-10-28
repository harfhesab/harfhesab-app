// src/features/onboarding/showWelcomeDialog.js
import { Text, View } from 'react-native';
import AlertBottomDrawerHelper from '../../components/alert-bottom-drawer/AlertBottomDrawerHelper';
import Font from '../../utils/Font';
import LocalImageComponent from '../../components/image-components/LocalImageComponent';
import GlassVeil from '../../components/home-parts/components/GlassVeil';
import { reset } from '../../main/navigationService';

export default function showWelcomeDialog({width, colors}) {
    AlertBottomDrawerHelper.showAlert({
        title: 'راهنمای شروع بازی',
        message: [
            {
                text: 'برای شروع، بخش «خان کلمات» رو امتحان کن؛ با حروف کلمه بساز و در هر فصل یک خان رو شکست بده!',
                style: {maxWidth: width - 40, fontFamily: Font.bakh_bold, fontSize: 16, color: colors.primary.a3, alignSelf: 'flex-start', textAlign: 'justify', lineHeight: 30},
            },
        ],
        buttons: [
            {
                onPress: ()=>{
                    reset(
                        [
                            {name: 'Home'},
                            {name: 'WordGame'},
                            {name: 'WordGameUpdateScreen'},
                        ]
                    )
                },
                text: 'شروع بازی',
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
                                path={require('../../assets/image/home-word-game.png')}
                                width={70}
                                height={70}
                                resizeMode="stretch"
                                blank_background
                                borderRadius={10}
                                style={{borderColor:colors.primary.a5, borderWidth:1.5}}
                            />
                            <Text style={{fontFamily: Font.bakh_bold, fontSize: 16, color: colors.primary.a5}}>{'بازی خان کلمات'}</Text>
                        </View>
                        <View
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: 10,
                            }}
                        >
                            {[
                                {
                                    image: require('../../assets/image/home-stage-game.png'),
                                    title: 'جمله‌چین',
                                },
                                {
                                    image: require('../../assets/image/home-package-game.png'),
                                    title: 'داستان‌چین',
                                },
                                {
                                    image: require('../../assets/image/home-harf-akhar.png'),
                                    title: 'حرف آخر',
                                },
                                {
                                    image: require('../../assets/image/home-hafez-fal.png'),
                                    title: 'فال حافظ',
                                },
                                {
                                    image: require('../../assets/image/home-english-teach.png'),
                                    title: 'زبان انگلیسی',
                                },
                            ].map(item => (
                                <View
                                    key={item.title}
                                    style={{
                                        width: 52,
                                        height: 52,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        position: 'relative',
                                    }}
                                >
                                    {/* محتوای آیتم */}
                                    <View
                                        style={{
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: 4,
                                        }}
                                    >
                                        <LocalImageComponent
                                            path={item.image}
                                            width={24}
                                            height={24}
                                            resizeMode="stretch"
                                            blank_background
                                        />

                                        <Text
                                            numberOfLines={1}
                                            style={{
                                                fontFamily: Font.bakh_semi_bold,
                                                fontSize: 8,
                                                color: colors.text.a2,
                                                textAlign: 'center',
                                            }}
                                        >
                                            {item.title}
                                        </Text>
                                    </View>

                                    {/* لایه شیشه‌ای */}
                                    <GlassVeil
                                        width={52}
                                        height={52}
                                        radius={8}
                                    />
                                </View>
                            ))}
                        </View>
                    </View>
                )
            }
        },
    });
}