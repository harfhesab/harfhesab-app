import React, {useMemo, useState, useEffect, useRef, useCallback} from 'react';
import {StyleSheet, View, Text, Dimensions, TouchableOpacity, FlatList, ImageBackground, Platform} from 'react-native';
import {useDispatch, useSelector, useStore, shallowEqual} from 'react-redux';
import {useIsFocused} from '@react-navigation/native';
import {BSON} from 'realm';
import {useQuery, useRealm} from '../../../realm';
import {StageSeason} from '../../../realm/schemas/stage-game/StageSeasonSchema';
import {getAllLanguages} from '../../../realm/repositories/general/language.repository';
import {getCurrentLanguageLastStageAndLastSeason} from '../../../realm/repositories/user/user-stage-game-progress.repository';
import {checkStageGameContentVersion} from '../../../utils/api/StageGameApi';
import {changeStageGameLanguage} from '../../../redux/slices/stageGamePersistSlice';
import {updateCurrentLanguageLastStageAndLastSeason} from '../../../redux/slices/stageGameSlice';
import useAppTheme from '../../../hooks/theme/useAppTheme';
import Font from '../../../utils/Font';
import Icon from '../../../utils/Icon';
import {IS_TABLET_CONDITION} from '../../../utils/constants/constants';
import {useSeasonListStageGameMusic} from '../../../utils/sound/MusicFunctions';
import ScreenLoading from '../../../components/screen-loading/ScreenLoading';
import StageGameSeasonCard, {
    STAGE_GAME_SEASON_CARD_HEIGHT,
    STAGE_GAME_SEASON_CARD_MARGIN,
} from '../../../components/card/stage-game-card/StageGameSeasonCard';
import GeneralHeader from '../../../components/header/GeneralHeader';
import BottomDrawerGridHelper from '../../../components/bottom-drawer-grid/BottomDrawerGridHelper';
import BottomDrawerGrid from '../../../components/bottom-drawer-grid/BottomDrawerGrid';
import AlertBottomDrawerHelper from '../../../components/alert-bottom-drawer/AlertBottomDrawerHelper';
import LocalImageComponent from '../../../components/image-components/LocalImageComponent';

/* ═════════════ ثابت‌ها ═════════════ */
const {width, height} = Dimensions.get('screen');
const FLATLIST_PADDING_VERTICAL = 15;
const itemHeight = STAGE_GAME_SEASON_CARD_HEIGHT;
const rowGap = 25;
const numColumns = IS_TABLET_CONDITION ? 2 : 1;
const snapInterval = itemHeight + rowGap;
const STAGE_NOT_FOUND_NAV_DELAY = 400; // مکث قبل از رفتن به صفحه‌ی بروزرسانی

// آیتم‌هایی که حداقل ۹۰٪ شان دیده شود «دیده‌شده» حساب می‌شوند (ثابت تا FlatList هشدار تغییر ندهد)
const VIEWABILITY_CONFIG = {itemVisiblePercentThreshold: 90};
const IMAGE_BG_STYLE = {resizeMode: 'stretch'};
const REMOVE_CLIPPED_SUBVIEWS = Platform.OS !== 'ios';

/* ═════════════ توابع کمکی (بیرون از کامپوننت تا هر رندر ساخته نشوند) ═════════════ */
const getSafeScrollIndex = (itemIndex, itemsCount) => {
    if (itemsCount <= 0) return undefined;
    const totalRows = Math.ceil(itemsCount / numColumns);
    const row = Math.floor(Math.max(0, itemIndex) / numColumns);
    return Math.min(row, totalRows - 1);
};

const getItemLayout = (_data, index) => {
    const row = Math.floor(index / numColumns);
    return {
        length: itemHeight,
        offset: row * snapInterval,
        index,
    };
};

const keyExtractor = (_item, index) => index.toString();

function useStageSeasonsByLanguage(languageId) {
    const all = useQuery(StageSeason);
    return useMemo(() => {
        if (!languageId) return [];
        try {
            const id = typeof languageId === 'string' ? new BSON.ObjectId(languageId) : languageId;
            return all.filtered('language_ref == $0 AND is_visible == true', id).sorted('season_number');
        } catch (e) {
            return [];
        }
    }, [all, languageId]);
}

/* ═════════════ کامپوننت‌های ثابت (بیرون از صفحه تا هر رندر remount نشوند) ═════════════ */
const UpdateAlertIcon = () => (
    <View style={styles.alertIconBox}>
        <LocalImageComponent
            path={require('../../../assets/image/download.png')}
            width={40}
            height={40}
            resizeMode={'stretch'}
            blank_background={true}
        />
    </View>
);

const ListEmptyComponent = () => (
    <View style={styles.emptyBox}>
        <ScreenLoading loading={false} getError={false} noItem={true} tryAgain={() => {}} />
    </View>
);

/* ═════════════ صفحه ═════════════ */
function StageGame(props) {
    useSeasonListStageGameMusic();

    const {navigation} = props;
    const isFocused = useIsFocused();
    const colors = useAppTheme();
    const dispatch = useDispatch();
    const reduxStore = useStore();
    const realm = useRealm();

    const flatListRef = useRef(null);
    const navTimerRef = useRef(null);
    const [activeIndexes, setActiveIndexes] = useState([]);
    const [loading, setLoading] = useState(true);

    // فقط فیلدهای لازم انتخاب می‌شوند تا با تغییر بقیه‌ی فیلدهای اسلایس، صفحه رندر نشود
    const {
        stageGameLanguage,
        stageGameLanguageName,
        forceUpdate,
        versionCreatedContent,
        versionUpdatedContent,
        versionDeletedContent,
    } = useSelector(s => {
        const p = s.stageGamePersist;
        return {
            stageGameLanguage: p.stageGameLanguage,
            stageGameLanguageName: p.stageGameLanguageName,
            forceUpdate: p.forceUpdate,
            versionCreatedContent: p.versionCreatedContent,
            versionUpdatedContent: p.versionUpdatedContent,
            versionDeletedContent: p.versionDeletedContent,
        };
    }, shallowEqual);

    const {lastSeasonNumber, lastStageNumber} = useSelector(
        s => ({lastSeasonNumber: s.stageGame.lastSeasonNumber, lastStageNumber: s.stageGame.lastStageNumber}),
        shallowEqual,
    );

    const data = useStageSeasonsByLanguage(stageGameLanguage);

    /* ───────── عملیات ───────── */
    const getProgressOperation = async () => {
        try {
            const progress = await getCurrentLanguageLastStageAndLastSeason(realm, stageGameLanguage);
            await dispatch(
                updateCurrentLanguageLastStageAndLastSeason({
                    lastStage: progress?.last_stage,
                    lastStageNumber: progress?.last_stage_number,
                    lastSeason: progress?.last_season,
                    lastSeasonNumber: progress?.last_season_number,
                }),
            );
        } catch (e) {}
    };

    const stageNotFoundAlert = () => {
        clearTimeout(navTimerRef.current);
        navTimerRef.current = setTimeout(() => {
            if (navigation.isFocused()) {
                navigation.navigate('StageGameUpdateScreen');
            }
        }, STAGE_NOT_FOUND_NAV_DELAY);
    };

    const forceUpdateAlert = () => {
        const bodyStyle = {
            maxWidth: width - 30,
            fontFamily: Font.bakh_semi_bold,
            fontSize: 14,
            color: colors.text.a6,
            alignSelf: 'flex-start',
            textAlign: 'justify',
            lineHeight: 28,
        };
        AlertBottomDrawerHelper.showAlert({
            title: 'بروزرسانی بازی جمله‌چین',
            message: [
                {
                    text: 'بروزرسانی محتوای بازی جمله‌چین!',
                    style: {
                        maxWidth: width - 30,
                        fontFamily: Font.bakh_bold,
                        fontSize: 20,
                        color: colors.alert.a1,
                        alignSelf: 'flex-start',
                        textAlign: 'justify',
                        lineHeight: 30,
                    },
                },
                {
                    text: 'یک بروزرسانی اجباری برای مراحل بازی جمله‌چین یافت شد. برای دریافت آن اقدام کن.',
                    style: bodyStyle,
                },
                {
                    text: 'توجه کن هنگام بروزرسانی مراحل بازی، مطمئن شو دستگاهت به اینترنت وصله.',
                    style: bodyStyle,
                },
            ],
            buttons: [
                {
                    onPress: () => {
                        navigation.navigate('StageGameUpdateScreen');
                    },
                    text: 'دریافت بروزرسانی',
                    loading: false,
                    type: 'bold',
                },
            ],
            options: {
                cancelable: false,
                icon: {Icon: UpdateAlertIcon},
            },
        });
    };

    const getLanguages = useCallback(() => {
        const languages = getAllLanguages(realm);
        const buttons = [
            {
                onPress: ({data: selectedData}) => {
                    dispatch(
                        changeStageGameLanguage({
                            language: selectedData._id[0].toString(),
                            languageName: selectedData.text1[0].toString(),
                        }),
                    );
                },
                text: 'انتخاب زبان',
                loading: false,
                type: 'bold',
                selectRequired: true,
            },
        ];
        if (stageGameLanguage) {
            buttons.push({
                onPress: () => {},
                text: 'لغو',
                loading: false,
                type: 'border',
                selectRequired: false,
            });
        }
        const previousSelected = stageGameLanguage
            ? {_id: [stageGameLanguage], text1: [stageGameLanguageName]}
            : undefined;

        BottomDrawerGridHelper.showBottomDrawer({
            title: 'زبان بازی جمله‌چین را انتخاب کن.',
            list: languages.map(item => {
                const disabled = item.is_active == false;
                return {
                    _id: item._id,
                    text1: item.name,
                    image: item.icon_image,
                    badge: item?.badge,
                    disabled,
                    disabledToastTitle: disabled ? 'زبان مورد نظر غیر فعال است' : null,
                    disabledToastMessage: disabled
                        ? `در حال حاضر زبان "${item?.name}" در بخش بازی جمله‌چین فعال نمی‌باشد.`
                        : null,
                };
            }),
            buttons,
            options: {
                numberSelectable: 1,
                previousSelected,
                cancelable: !!stageGameLanguage,
                selectRequired: !stageGameLanguage,
            },
        });
    }, [realm, dispatch, stageGameLanguage, stageGameLanguageName]);

    const startFirst = () => {
        if (versionCreatedContent == 0) {
            stageNotFoundAlert();
        } else if (forceUpdate == true) {
            forceUpdateAlert();
        } else if (!stageGameLanguage) {
            getLanguages();
        } else {
            checkStageGameContentVersion({
                dispatch,
                realm,
                // وضعیت دانلود در لحظه‌ی نیاز خوانده می‌شود؛ صفحه با هر تغییر پیشرفت دانلود دوباره رندر نمی‌شود
                state: reduxStore.getState().stageGameDownload,
                versionContent: {versionCreatedContent, versionUpdatedContent, versionDeletedContent},
            });
        }
    };

    /* ───────── افکت‌ها ───────── */
    useEffect(() => {
        if (isFocused) {
            startFirst();
        }
        // با رفتن از صفحه یا بسته شدن آن، تایمر رفتن به صفحه‌ی بروزرسانی لغو می‌شود
        return () => clearTimeout(navTimerRef.current);
        // عمداً فقط به isFocused وابسته است (مثل قبل: هر بار که صفحه فوکوس می‌گیرد)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isFocused]);

    useEffect(() => {
        getProgressOperation();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stageGameLanguage]);

    useEffect(() => {
        setLoading(true);
        const t = setTimeout(() => {
            setLoading(false);
        }, 300);

        const rowIndex = getSafeScrollIndex(lastSeasonNumber - 1, data.length);
        if (rowIndex !== undefined) {
            try {
                flatListRef.current?.scrollToIndex({
                    index: rowIndex,
                    animated: false,
                    viewOffset: FLATLIST_PADDING_VERTICAL,
                });
            } catch (e) {}
        }
        return () => clearTimeout(t);
    }, [stageGameLanguage, lastSeasonNumber, data.length]);

    /* ───────── لیست ───────── */
    const renderItem = useCallback(
        ({item, index}) => (
            <StageGameSeasonCard
                type={'stage-game'}
                ended={item.season_number < lastSeasonNumber}
                lock={item.season_number > lastSeasonNumber}
                progress={
                    item.season_number == lastSeasonNumber && lastStageNumber > 0
                        ? lastStageNumber - item.stage_number_from
                        : null
                }
                currentScroll={activeIndexes.includes(index)}
                title={item.title}
                description={item.description}
                image={item.media?.[0]?.path}
                isActive={item.is_active}
                numberStage={item.number_stage}
                seasonNumber={item.season_number}
                stageNumberFrom={item.stage_number_from}
                stageNumberTo={item.stage_number_to}
                onPress={() => {
                    if (item.season_number > lastSeasonNumber) return;
                    navigation.navigate('StagesStageGameSeason', {
                        season: item._id.toString(),
                        seasonName: item.title.toString(),
                    });
                }}
                languageName={stageGameLanguageName}
            />
        ),
        [activeIndexes, lastSeasonNumber, lastStageNumber, stageGameLanguageName, navigation],
    );

    const extraData = useMemo(
        () => ({activeIndexes, lastSeasonNumber, lastStageNumber}),
        [activeIndexes, lastSeasonNumber, lastStageNumber],
    );

    // باید هویت ثابت داشته باشد (FlatList تغییرش را در حین اجرا نمی‌پذیرد)
    const onViewableItemsChanged = useCallback(({viewableItems}) => {
        if (!viewableItems || viewableItems.length === 0) return;
        const firstVisible = viewableItems[0].index;
        if (firstVisible == null) return;
        // موبایل: فقط یک آیتم فعال؛ تبلت: همه‌ی آیتم‌های ردیف
        const rowStart = Math.floor(firstVisible / numColumns) * numColumns;
        const next = Array.from({length: numColumns}, (_, i) => rowStart + i);
        setActiveIndexes(prev =>
            prev.length === next.length && prev.every((v, i) => v === next[i]) ? prev : next,
        );
    }, []);

    const onScrollToIndexFailed = useCallback(() => {
        const rowIndex = getSafeScrollIndex(data.length - 1, data.length);
        if (rowIndex !== undefined) {
            try {
                flatListRef.current?.scrollToIndex({
                    index: rowIndex,
                    animated: false,
                    viewOffset: FLATLIST_PADDING_VERTICAL,
                });
            } catch (e) {}
        }
    }, [data.length]);

    /* ───────── هدر ───────── */
    const headerRightComponent = useCallback(() => {
        if (!stageGameLanguage) return null;
        return (
            <View style={styles.headerRightBox}>
                <TouchableOpacity activeOpacity={0.85} onPress={getLanguages}>
                    <ImageBackground
                        source={require('../../../assets/image/rtl_thumb_frame.png')}
                        style={styles.headerLangFrame}
                        imageStyle={IMAGE_BG_STYLE}
                        resizeMode="stretch">
                        <View style={styles.headerLangRow}>
                            <Icon name={'layers'} type={'Ionicons'} style={{fontSize: 20, color: colors.primary.a3}} />
                            <View style={styles.headerLangNameBox}>
                                <Text style={[styles.headerLangText, {color: colors.text.a2}]}>
                                    {`${stageGameLanguageName}`}
                                </Text>
                            </View>
                        </View>
                    </ImageBackground>
                </TouchableOpacity>
            </View>
        );
    }, [stageGameLanguage, stageGameLanguageName, getLanguages, colors.primary.a3, colors.text.a2]);

    /* ───────── رندر ───────── */
    return (
        <View style={{flex: 1, backgroundColor: colors.background.a1}}>
            <GeneralHeader home={true} coin={true} RightComponent={headerRightComponent} />
            <View style={styles.container}>
                <FlatList
                    ref={flatListRef}
                    key={stageGameLanguage}
                    showsVerticalScrollIndicator={false}
                    keyExtractor={keyExtractor}
                    initialNumToRender={3}
                    windowSize={5}
                    initialScrollIndex={getSafeScrollIndex(lastSeasonNumber - 1, data.length) ?? 0}
                    maxToRenderPerBatch={3}
                    contentContainerStyle={styles.listContent}
                    renderItem={renderItem}
                    data={data}
                    numColumns={numColumns}
                    onEndReachedThreshold={0.5}
                    removeClippedSubviews={REMOVE_CLIPPED_SUBVIEWS}
                    style={styles.list}
                    getItemLayout={getItemLayout}
                    snapToInterval={snapInterval} // ارتفاع هر ردیف
                    snapToAlignment="start" // آیتم از بالا چفت شود
                    decelerationRate="fast" // سرعت کاهش سریع برای اسنپ بهتر
                    disableIntervalMomentum={true} // محدود کردن اسکرول به فقط یک interval در هر سوایپ
                    disableScrollViewPanResponder={true}
                    bounces={true} // فنری بودن مانند iOS
                    viewabilityConfig={VIEWABILITY_CONFIG}
                    onViewableItemsChanged={onViewableItemsChanged}
                    ListEmptyComponent={ListEmptyComponent}
                    extraData={extraData}
                    onScrollToIndexFailed={onScrollToIndexFailed}
                />
            </View>
            {loading === true && (
                <View style={[styles.loadingOverlay, {backgroundColor: colors.background.a1}]}>
                    <ScreenLoading loading={true} getError={false} noItem={false} tryAgain={() => {}} />
                </View>
            )}
            <BottomDrawerGrid
                ref={Ref => {
                    BottomDrawerGridHelper.setRef(Ref);
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
    },
    list: {
        width: width,
        paddingHorizontal: STAGE_GAME_SEASON_CARD_MARGIN,
    },
    listContent: {
        alignItems: 'center',
        rowGap: rowGap,
        paddingTop: FLATLIST_PADDING_VERTICAL,
        paddingBottom: 45,
    },
    alertIconBox: {
        width: width,
        alignItems: 'center',
    },
    emptyBox: {
        height: height - 200,
        width: width,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingOverlay: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
    },
    headerRightBox: {
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerLangFrame: {
        width: 115,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerLangRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        height: '100%',
        paddingStart: 9,
        paddingBottom: 2,
    },
    headerLangNameBox: {
        width: 85,
        alignItems: 'center',
    },
    headerLangText: {
        fontFamily: Font.bakh_bold,
        fontSize: 12,
    },
});

export default StageGame;