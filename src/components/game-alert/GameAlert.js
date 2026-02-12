import React, { useState, useImperativeHandle, memo } from 'react';
import { View, Dimensions, TouchableOpacity, Text, ScrollView, I18nManager, Image, ImageBackground } from 'react-native';
import Modal from "react-native-modal";
import Font from '../../utils/Font';
import Icon from '../../utils/Icon';
import ButtonGradient from '../buttons/ButtonGradient';
import LinearGradient from 'react-native-linear-gradient';
import LottieView from 'lottie-react-native';
import useAppTheme from '../../hooks/theme/useAppTheme';
import AdsButton from '../buttons/AdsButton';
import MultiLineTextGradientSvg from '../text-components/MultiLineTextGradientSvg';
import { increaseNumberCoins } from '../../redux/slices/coinSlice';
import { useDispatch } from "react-redux";
import SimpleBorderText from '../text-components/SimpleBorderText';
import TextGradientSvg from '../text-components/TextGradientSvg';
import { IS_TABLET_CONDITION } from '../../utils/constants/constants';
import Border from '../Border';

const { width, height } = Dimensions.get('screen');
const GameAlert = React.forwardRef((props, ref) => {
    const colors = useAppTheme();
    const dispatch = useDispatch();
    const [visible, setVisible] = useState(false)
    const [cancelable, setCancelable] = useState(false)
    const [type, setType] = useState("")
    const [buttons, setButtons] = useState(null)
    const [title, setTitle] = useState(null)
    const [admiration, setAdmiration] = useState(null)
    const [description, setDescription] = useState(null)
    const [completedSentences, setCompletedSentences] = useState(null)
    const [stageHint, setStageHint] = useState(null)
    const [reward, setReward] = useState(null)
    const contentWidth = IS_TABLET_CONDITION ? 460 : width * 0.95;
    const contentHeight = type == "completed-stage" ? height * 0.7 : height * 0.6



    const open = (dialog) => {
        setVisible(true)
        setTimeout(() => {
            { dialog?.title && setTitle(dialog?.title) }
            { dialog?.admiration && setAdmiration(dialog?.admiration) }
            { dialog?.description && setDescription(dialog?.description) }
            { dialog?.completedSentences && setCompletedSentences(dialog?.completedSentences) }
            { dialog?.stageHint && setStageHint(dialog?.stageHint) }
            { dialog?.options?.cancelable && setCancelable(dialog?.options?.cancelable) }
            { dialog?.options?.type && setType(dialog.options.type) }
            { dialog?.buttons?.length > 0 && setButtons(dialog?.buttons) }
            if (dialog.options?.reward) {
                setReward(dialog.options?.reward)
                dispatch(increaseNumberCoins({ number: dialog.options?.reward }))
            }
        }, 200)
    }
    const close = () => {
        setVisible(false)
        setTimeout(() => {
            setCancelable(false)
            setType("")
            setButtons(null)
            setTitle(null)
            setAdmiration(null)
            setDescription(null)
            setCompletedSentences(null)
            setReward(null)
        }, 400)
    }
    useImperativeHandle(ref, () => ({
        open
    }))
    return (
        <Modal
            animationIn={'fadeIn'}
            animationOut={'fadeOut'}
            backdropOpacity={0.5}
            isVisible={visible}
            onBackdropPress={() => {
                if (cancelable == true) {
                    close()
                }
            }}
            deviceHeight={height}
            statusBarTranslucent={true}
            coverScreen={true}
            useNativeDriverForBackdrop={true}
            onBackButtonPress={() => {
                if (cancelable == true) {
                    close()
                }
            }}
        >
            <View style={{ direction: I18nManager.isRTL ? 'rtl' : 'ltr', alignItems: "center", justifyContent: "center" }}>
                <ImageBackground
                    source={require("../../assets/image/paper_frame.png")}
                    style={{ width: contentWidth, height: contentHeight, alignItems: 'center', justifyContent: 'center' }}
                    imageStyle={{ resizeMode: "stretch" }}
                    resizeMode="stretch"
                >
                    <View style={{ width: contentWidth, height: contentHeight, borderRadius: 15, alignItems: "center", justifyContent: 'space-between' }}>
                        <View style={{ width: contentWidth, alignItems: 'center' }}>
                            <View style={{ padding: type === 'completed-season' ? 40 : 0 }}>
                                <LottieView
                                    style={{ width: contentWidth, height: type === 'completed-season' ? height * 0.15 : height * 0.25 }}
                                    source={(type === 'completed-word' || type === 'completed-stage') ?
                                        require('../../assets/lottie/successful.json')
                                        : type === 'completed-season' &&
                                        require('../../assets/lottie/unlocked.json')
                                    }
                                    autoPlay
                                    loop={false}
                                />
                            </View>
                            {
                                reward &&
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: "#ae480060", borderRadius: 5, paddingHorizontal: 20, paddingVertical: 2, position: 'absolute', bottom: 0 }}>
                                    <Image
                                        style={{ width: 20, height: 20 }}
                                        source={require('../../assets/image/coin.png')}
                                    />
                                    <Text style={{ fontSize: 20, fontFamily: Font.iran_yekan_black_fa, color: colors.text.a1 }}>{`${reward}+`}</Text>
                                </View>
                            }
                        </View>
                        <View style={{ maxHeight: type == "completed-stage" ? height * 0.25 : height * 0.15, minHeight: height * 0.14, justifyContent: 'center', alignItems: 'center', width: contentWidth * 0.8, borderWidth: 1.5, borderColor: "#ae480095", borderRadius: 10, borderStyle: 'dashed', backgroundColor: "#ae480020" }}>
                            <ScrollView
                                style={{ flexGrow: 0 }}
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={{ width: "100%", alignItems: 'center', paddingVertical: 5 }}
                            >
                                {admiration?.length > 0 && <Text style={{ fontFamily: Font.black, fontSize: 18, color: "#333", textAlign: 'center' }}>{admiration}</Text>}
                                {description?.length > 0 && <Text style={{ fontFamily: Font.medium, fontSize: 12, color: "#555", textAlign: 'center', marginTop: 5 }}>{description}</Text>}
                                {
                                    completedSentences?.length > 0 &&
                                    <View style={{ width: "100%", alignItems: 'center', gap: 10, paddingBottom: 20, paddingTop: 10, paddingHorizontal: 5 }}>
                                        <Border
                                            color={"#ae480055"}
                                            height={2}
                                            width={contentWidth * 0.8 - 20}
                                            top={15}
                                            bottom={5}
                                        />
                                        {
                                            completedSentences.map((item, index) => (
                                                <View key={index.toString()} style={{ width: "100%", alignItems: "center" }}>
                                                    <Text style={{ fontFamily: Font.medium, fontSize: 15, color: "#333333", textAlign: 'center' }}>{item?.sentence}</Text>
                                                    {
                                                        item?.hint &&
                                                        <Text style={{ fontFamily: Font.medium, fontSize: 10, color: "#666666", textAlign: 'center' }}>{item?.hint}</Text>
                                                    }
                                                </View>
                                            ))
                                        }
                                        {
                                            stageHint?.length > 0 &&
                                            <View style={{ width: "100%", alignItems: 'flex-start', paddingHorizontal: 5 }}>
                                                <Text style={{ fontFamily: Font.medium, fontSize: 14, color: "#0099CC", textAlign: 'justify', marginTop: 20, lineHeight: 22 }}>{"اشاره‌ای به مرحله"}</Text>
                                                <Text style={{ fontFamily: Font.medium, fontSize: 14, color: "#333", textAlign: 'justify', lineHeight: 22 }}>{stageHint}</Text>
                                            </View>
                                        }
                                    </View>
                                }
                            </ScrollView>
                        </View>
                        {
                            (buttons && buttons.length > 0) &&
                            <View style={{ width: "100%", flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingBottom: type == "completed-stage" ? "16%" : "14%", paddingStart: 15 }}>
                                {
                                    buttons.map((item, index) => (

                                        (item?.type == "bold") ?
                                            (<TouchableOpacity
                                                key={index.toString()}
                                                activeOpacity={0.9}
                                                onPress={() => {
                                                    item.onPress()
                                                    close()
                                                }}
                                            >
                                                <ImageBackground
                                                    source={buttons.length > 1 ? require("../../assets/image/paper_frame_btn_green.png") : require("../../assets/image/paper_frame_long_btn_green.png")}
                                                    style={{ width: buttons.length > 1 ? contentWidth * 0.28 : 150, height: 55, alignItems: 'center', justifyContent: 'center', paddingBottom: 5 }}
                                                    imageStyle={{ resizeMode: "stretch" }}
                                                    resizeMode="stretch"
                                                >
                                                    <TextGradientSvg
                                                        text={item.text}
                                                        fontFamily={Font.bakh_extra_bold}
                                                        fontSize={18}
                                                        colors={["#FFFFFF", "#fff5c8"]}
                                                        shadowColor={"#00000090"}
                                                        shadowBlur={5}
                                                        dropShadow={true}
                                                        borderColor={"#000000"}
                                                        borderWidth={1}
                                                        glowBlur={100}
                                                        glowColor={'#fff5c8'}
                                                        glowShadow={true}
                                                    />
                                                </ImageBackground>
                                            </TouchableOpacity>)
                                            : (item?.type == "ads") &&
                                            (<AdsButton
                                                key={index.toString()}
                                                width={contentWidth * 0.5}
                                                reward={item?.reward}
                                            />)
                                    ))
                                }
                            </View>
                        }
                    </View>
                </ImageBackground>
                <View style={{ alignSelf: 'center', position: 'absolute', top: -40 }}>
                    <ImageBackground
                        source={require("../../assets/image/header_title_frame.png")}
                        style={{ width: contentWidth - 20, height: 70, alignItems: 'center', justifyContent: 'center', paddingBottom: 10 }}
                        imageStyle={{ resizeMode: "stretch" }}
                        resizeMode="stretch"
                    >
                        <SimpleBorderText
                            text={title}
                            width={contentWidth - 40}
                            height={22 * 1.6}
                            fontSize={22}
                            borderWidth={2}
                            textColor={colors.primary.a5}
                            borderColor={"#4d2719"}
                        />
                    </ImageBackground>
                </View>
            </View>
        </Modal>
    )
})
export default memo(GameAlert)