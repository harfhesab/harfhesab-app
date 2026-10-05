// src/features/onboarding/showDownloadDialog.js
import { Text, View } from 'react-native';
import AlertBottomDrawerHelper from '../../components/alert-bottom-drawer/AlertBottomDrawerHelper';
import Font from '../../utils/Font';
import LocalImageComponent from '../../components/image-components/LocalImageComponent';
import GlassVeil from '../../components/home-parts/components/GlassVeil';
import { reset } from '../../main/navigationService';

export default function showDownloadDialog({width, colors}) {
    AlertBottomDrawerHelper.showAlert({
        title: 'راهنمای شروع بازی',
        message: [
            {
                text: 'برای ادامه، دریافت مراحل بازی مرحله‌ای الزامی است.',
                style: {maxWidth: width - 40, fontFamily: Font.bakh_bold, fontSize: 16, color: colors.primary.a3, alignSelf: 'flex-start', textAlign: 'justify', lineHeight: 30},
            },
            {
                text: '*دریافت مراحل فقط چند ثانیه طول می‌کشد.',
                style: {maxWidth: width - 40, fontFamily: Font.bakh_light, fontSize: 12, color: colors.text.a2, alignSelf: 'flex-start', textAlign: 'justify', lineHeight: 25},
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
                        {/* بازی مرحله‌ای */}
                        <View
                            style={{ alignItems: 'center', gap: 8}}>
                            <LocalImageComponent
                                path={require('../../assets/image/home-stage-game.png')}
                                width={90}
                                height={90}
                                resizeMode="stretch"
                                blank_background
                                borderRadius={10}
                                style={{borderColor:colors.primary.a5, borderWidth:1.5}}
                            />
                            <Text style={{fontFamily: Font.bakh_bold, fontSize: 20, color: colors.primary.a5}}>{'بازی مرحله‌ای'}</Text>
                        </View>
                        {/* سایر بخش‌ها */}
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
                                    image: require('../../assets/image/home-package-game.png'),
                                    title: 'بازی داستانی',
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