import React, { useState, useImperativeHandle, memo, useCallback } from 'react';
import { View, Dimensions, Text, ScrollView, StyleSheet, NativeModules } from 'react-native';
import Modal from '../custom-modal/Modal';
import Font from '../../utils/Font';
import Icon from '../../utils/Icon';
import ButtonBorder from '../buttons/ButtonBorder';
import ButtonGradient from '../buttons/ButtonGradient';
import useAppTheme from '../../hooks/theme/useAppTheme';

const { ImmersiveMode } = NativeModules;

const AlertBottomDrawer = React.forwardRef((props, ref) => {
    const isImmersive = ImmersiveMode.isImmersiveModeActive?.() ?? false;
    const { width, height } = isImmersive ? Dimensions.get('screen') : Dimensions.get('window');
    
    const colors = useAppTheme();
    const maxHeight = height * 0.5;

    const [visible, setVisible] = useState(false);
    const [data, setData] = useState({
        cancelable: true,
        title: null,
        message: [],
        buttons: null,
        buttonsLoading: null,
        icon: null
    });

    const open = useCallback((dialog) => {
        setVisible(true);
        setTimeout(() => {
            setData({
                title: dialog?.title ?? null,
                message: dialog?.message ?? [],
                cancelable: dialog?.options?.cancelable ?? true,
                buttons: dialog?.buttons ?? null,
                buttonsLoading: null,
                icon: dialog?.options?.icon ?? null
            });
        }, 200);
    }, []);

    const close = useCallback(() => {
        setVisible(false);
        setTimeout(() => {
            setData({
                cancelable: true,
                title: null,
                message: [],
                buttons: null,
                buttonsLoading: null,
                icon: null
            });
        }, 400);
    }, []);

    useImperativeHandle(ref, () => ({
        open,
        close
    }), [open, close]);

    const handleDismiss = useCallback(() => {
        if (data.cancelable) {
            close();
        }
    }, [data.cancelable, close]);

    return (
        <Modal
            swipeDirection={data.cancelable ? ['down'] : null}
            swipeThreshold={180}
            animationIn="slideInUp"
            animationOut="slideOutDown"
            animationInTiming={400}
            animationOutTiming={400}
            backdropOpacity={0.7}
            isVisible={visible}
            onBackdropPress={handleDismiss}
            useNativeDriverForBackdrop={true}
            onBackButtonPress={handleDismiss}
            onSwipeComplete={handleDismiss}
            style={styles.modalWrapper}
            deviceHeight={height}
            statusBarTranslucent={isImmersive}
            coverScreen={true}
        >
            <View style={[styles.modalContainer, { backgroundColor: colors.bottom_drawer.background, width: width }]}>
                <View>
                    <View style={[styles.indicator, { backgroundColor: colors.border.a1 }]} />
                    
                    {!!data.title && (
                        <View style={[styles.titleContainer, { width: width }]}>
                            <Text style={[styles.titleText, { color: colors.bottom_drawer.text2 }]}>{data.title}</Text>
                            {data.icon && <data.icon.Icon />}
                        </View>
                    )}
                </View>

                <ScrollView
                    style={{ maxHeight: maxHeight }}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.scrollContent}>
                        {data.message?.length > 0 && data.message.map((item, index) => (
                            <View key={index.toString()} style={styles.messageRow}>
                                {item.Icon && <item.Icon />}
                                <Text style={item?.style ?? [styles.defaultMessageText, { color: colors.text.a2 }]}>
                                    {item.text}
                                </Text>
                            </View>
                        ))}
                    </View>
                </ScrollView>

                {data.buttons?.length > 0 && (
                    <View style={[
                        styles.buttonsContainer, 
                        { 
                            borderTopColor: colors.border.a1, 
                            justifyContent: data.buttons.length > 1 ? "space-between" : "center" 
                        }
                    ]}>
                        {data.buttons.map((item, index) => {
                            const isBorder = item?.type === "border";
                            const isGradient = item?.type === "bold";

                            if (!isBorder && !isGradient) return null;

                            const ButtonComponent = isBorder ? ButtonBorder : ButtonGradient;
                            const defaultWidth = data.buttons.length > 1 ? (width / 2) - (isBorder ? 20 : 25) : width - (isBorder ? 40 : 30);

                            return (
                                <ButtonComponent
                                    key={index.toString()}
                                    text={item.text}
                                    text2={item?.text2 ?? undefined}
                                    height={item?.height ?? 55}
                                    width={item?.width ?? defaultWidth}
                                    loading={(item?.loading === true && data.buttonsLoading === index)}
                                    onPress={() => {
                                        item.onPress();
                                        if (item.loading === true) {
                                            setData(prev => ({ ...prev, buttonsLoading: index }));
                                        } else if (!item?.stayOpen) {
                                            close();
                                        }
                                    }}
                                    borderRadius={item?.borderRadius ?? 10}
                                    textSize={item?.textSize ?? (isBorder ? 14 : 16)}
                                    textColor={isBorder ? (item?.color ?? undefined) : undefined}
                                    borderColor={isBorder ? (item?.color ?? undefined) : undefined}
                                    backgorundGradinte={isGradient ? (item?.color ?? undefined) : undefined}
                                    iconName={item?.iconName ?? undefined}
                                    iconType={item?.iconType ?? undefined}
                                    iconSize={item?.iconSize ?? undefined}
                                    justifyContent={item?.justifyContent ?? undefined}
                                    flexDirection={item?.flexDirection ?? undefined}
                                />
                            );
                        })}
                    </View>
                )}
            </View>
        </Modal>
    );
});

const styles = StyleSheet.create({
    modalWrapper: {
        justifyContent: 'flex-end',
        alignItems: 'center',
        margin: 0
    },
    modalContainer: {
        borderRadius: 5,
        alignSelf: 'center',
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        overflow: 'hidden'
    },
    indicator: {
        width: 4,
        height: 4,
        marginTop: 30,
        marginBottom: 5,
        alignSelf: 'center',
        borderRadius: 2,
        transform: [{ scaleX: 25 }] 
    },
    titleContainer: {
        marginBottom: 40,
        alignItems: 'center',
        gap: 20
    },
    titleText: {
        fontFamily: Font.medium,
        fontSize: 12,
        textAlign: 'center',
        marginHorizontal: 20
    },
    scrollContent: {
        flexDirection: 'column',
        paddingHorizontal: 15,
        gap: 15,
        paddingTop: 15,
        paddingBottom: 30
    },
    messageRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        width: "100%",
        gap: 10
    },
    defaultMessageText: {
        fontFamily: Font.medium,
        fontSize: 14,
        alignSelf: 'center',
        textAlign: 'center',
        lineHeight: 20
    },
    buttonsContainer: {
        width: "100%",
        flexDirection: 'row',
        backgroundColor: "#33333385",
        borderTopWidth: 1,
        paddingVertical: 15,
        alignItems: 'center',
        paddingHorizontal: 15,
        gap: 10
    }
});

export default memo(AlertBottomDrawer);