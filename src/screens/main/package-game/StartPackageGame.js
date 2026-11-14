import React, {useMemo, useState, useEffect, useRef, useCallback} from 'react';
import {StyleSheet, View, Dimensions, FlatList, Platform} from 'react-native';
import {useQuery, useObject} from '../../../realm';
import useAppTheme from '../../../hooks/theme/useAppTheme';
import ScreenLoading from '../../../components/screen-loading/ScreenLoading';
import {IS_TABLET_CONDITION} from '../../../utils/constants/constants';
import {BSON} from 'realm';
import BottomDrawerGridHelper from '../../../components/bottom-drawer-grid/BottomDrawerGridHelper';
import BottomDrawerGrid from '../../../components/bottom-drawer-grid/BottomDrawerGrid';
import PackageGameSeasonCard, {
    PACKAGE_GAME_SEASON_CARD_HEIGHT,
    PACKAGE_GAME_SEASON_CARD_MARGIN,
} from '../../../components/card/package-game-card/PackageGameSeasonCard';
import {PackageSeason} from '../../../realm/schemas/package-game/PackageSeasonSchema';
import {Package} from '../../../realm/schemas/package-game/PackageSchema';
import {UserPackage} from '../../../realm/schemas/user/UserPackageSchema';
import PackageHeader from '../../../components/header/PackageHeader';
import PackageGameSeasonFirstCard from '../../../components/card/package-game-card/PackageGameSeasonFirstCard';
import {useSeasonListPackageGameMusic} from '../../../utils/sound/MusicFunctions';

/* ═════════════ ثابت‌ها ═════════════ */
const {width} = Dimensions.get('screen');
const FLATLIST_PADDING_VERTICAL = 15;
const itemHeight = PACKAGE_GAME_SEASON_CARD_HEIGHT;
const rowGap = 25;
const numColumns = IS_TABLET_CONDITION ? 2 : 1;
const snapInterval = itemHeight + rowGap;
const REMOVE_CLIPPED_SUBVIEWS = Platform.OS !== 'ios';
// آیتم‌هایی که حداقل ۹۰٪ شان دیده شود «دیده‌شده» حساب می‌شوند (باید ثابت باشد)
const VIEWABILITY_CONFIG = {itemVisiblePercentThreshold: 90};

/* ═════════════ توابع کمکی (بیرون از کامپوننت تا هر رندر ساخته نشوند) ═════════════ */
// ارتفاع ListHeaderComponent معادل یک ردیف (snapInterval) فرض شده است
const getItemLayout = (_data, index) => {
    const row = Math.floor(index / numColumns);
    return {
        length: itemHeight,
        offset: snapInterval + row * snapInterval,
        index,
    };
};

const keyExtractor = (_item, index) => index.toString();

function useUserPackageGameData({_id, packageId}) {
    const allSeasons = useQuery(PackageSeason);
    const validPackageId = useMemo(() => {
        try {
            return packageId ? new BSON.ObjectId(packageId) : null;
        } catch {
            return null;
        }
    }, [packageId]);

    const validUserPackageId = useMemo(() => {
        try {
            return _id ? new BSON.ObjectId(_id) : null;
        } catch {
            return null;
        }
    }, [_id]);
    const packageInfo = useObject(Package, validPackageId);
    const userPackage = useObject(UserPackage, validUserPackageId);
    const seasons = useMemo(() => {
        if (!validPackageId) return [];
        return allSeasons
            .filtered('package == $0 AND is_visible == true', validPackageId)
            .sorted('season_number');
    }, [allSeasons, validPackageId]);
    return {seasons, packageInfo, userPackage};
}

/* ═════════════ صفحه ═════════════ */
function StartPackageGame(props) {
    useSeasonListPackageGameMusic();

    const {navigation} = props;
    const colors = useAppTheme();
    const flatListRef = useRef(null);
    const [activeIndexes, setActiveIndexes] = useState([]);
    const _id = props?.route?.params?._id;
    const packageId = props?.route?.params?.packageId;
    const {seasons, packageInfo, userPackage} = useUserPackageGameData({_id, packageId});
    const lastSeasonNumber = userPackage?.last_season_number ?? 0;
    const lastStageNumber = userPackage?.last_stage_number ?? 0;
    const endedGame = userPackage?.ended_game;
    const [loading, setLoading] = useState(true);
    const [noItem, setNoItem] = useState(false);

    const seasonsCount = seasons.length;

    useEffect(() => {
        if (seasonsCount > 0) {
            setLoading(false);
            setNoItem(false);
            return undefined;
        }
        // تایمر با خروج از صفحه یا تغییر seasons لغو می‌شود
        const t = setTimeout(() => {
            setNoItem(true);
        }, 3000);
        return () => clearTimeout(t);
    }, [seasonsCount]);

    useEffect(() => {
        if (lastSeasonNumber == 1) {
            if (seasonsCount > 0) {
                flatListRef.current?.scrollToIndex({
                    index: 0,
                    animated: true,
                    viewOffset: FLATLIST_PADDING_VERTICAL,
                });
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lastSeasonNumber]);

    /* ───────── لیست ───────── */
    const renderItem = useCallback(
        ({item, index}) => (
            <PackageGameSeasonCard
                ended={
                    endedGame && lastStageNumber == packageInfo?.number_stage
                        ? true
                        : item.season_number < lastSeasonNumber
                        ? true
                        : false
                }
                lock={item.season_number > lastSeasonNumber && item.season_number > 1 ? true : false}
                progress={
                    item.season_number == lastSeasonNumber && lastStageNumber > 0
                        ? lastStageNumber - item.stage_number_from
                        : null
                }
                currentScroll={activeIndexes.includes(index)}
                title={item.title}
                badge={item?.badge}
                description={item.description}
                image={item.media?.[0]?.path}
                isActive={item.is_active}
                numberStage={item.number_stage}
                seasonNumber={item.season_number}
                stageNumberFrom={item.stage_number_from}
                stageNumberTo={item.stage_number_to}
                onPress={() => {
                    if (item.season_number > lastSeasonNumber && item.season_number > 1) return;
                    navigation.navigate('StagesPackageGameSeason', {
                        season: item._id.toString(),
                        userPackageId: _id,
                        seasonName: item.title.toString(),
                        packageName: packageInfo?.title.toString(),
                        packageIcon: packageInfo?.icon_image,
                    });
                }}
                packageName={packageInfo?.title}
            />
        ),
        [activeIndexes, lastSeasonNumber, lastStageNumber, endedGame, packageInfo, _id, navigation],
    );

    // آبجکت extraData فقط وقتی مقدارها عوض شوند ساخته می‌شود
    const extraData = useMemo(
        () => ({activeIndexes, lastSeasonNumber, lastStageNumber, endedGame}),
        [activeIndexes, lastSeasonNumber, lastStageNumber, endedGame],
    );

    // المان (نه تابع) تا هر رندر نوع کامپوننت جدید ساخته نشود و remount نشود
    const listEmptyComponent = useMemo(
        () => (
            <View style={styles.emptyBox}>
                <ScreenLoading loading={loading} getError={false} noItem={noItem} tryAgain={() => {}} />
            </View>
        ),
        [loading, noItem],
    );

    const startPackage = useCallback(() => {
        const targetIndex = Math.max(0, lastSeasonNumber - 1);
        if (targetIndex < seasonsCount) {
            flatListRef.current?.scrollToIndex({
                index: targetIndex,
                animated: true,
                viewOffset: FLATLIST_PADDING_VERTICAL,
            });
        }
    }, [lastSeasonNumber, seasonsCount]);

    const listHeaderComponent = useMemo(
        () => (
            <View style={styles.headerBox}>
                <PackageGameSeasonFirstCard
                    title={packageInfo?.title}
                    image={packageInfo?.banner_image}
                    numberStage={packageInfo?.number_stage}
                    numberSeason={packageInfo?.number_season}
                    progress={
                        endedGame && lastStageNumber == packageInfo?.number_stage
                            ? packageInfo?.number_stage
                            : lastStageNumber
                            ? lastStageNumber - 1
                            : 0
                    }
                    startPackage={startPackage}
                />
            </View>
        ),
        [
            packageInfo?.title,
            packageInfo?.banner_image,
            packageInfo?.number_stage,
            packageInfo?.number_season,
            endedGame,
            lastStageNumber,
            startPackage,
        ],
    );

    const onScrollToIndexFailed = useCallback(() => {
        flatListRef.current?.scrollToIndex({
            index: Math.max(0, seasonsCount - 1),
            animated: false,
            viewOffset: FLATLIST_PADDING_VERTICAL,
        });
    }, [seasonsCount]);

    // باید هویت ثابت داشته باشد (FlatList تغییرش را در حین اجرا نمی‌پذیرد)
    const onViewableItemsChanged = useCallback(({viewableItems}) => {
        if (!viewableItems || viewableItems.length === 0) return;
        const firstVisible = viewableItems[0].index;
        if (firstVisible == null) return;
        // موبایل: فقط یک آیتم فعال؛ تبلت: همه‌ی آیتم‌های ردیف
        const rowStart = Math.floor(firstVisible / numColumns) * numColumns;
        const next = Array.from({length: numColumns}, (_, i) => rowStart + i);
        // اگر ردیف فعال عوض نشده، state تغییر نکند تا رندر اضافه نشود
        setActiveIndexes(prev =>
            prev.length === next.length && prev.every((v, i) => v === next[i]) ? prev : next,
        );
    }, []);

    const initialScrollIndex =
        seasonsCount > 0 ? Math.min(Math.max(0, lastSeasonNumber - 1), seasonsCount - 1) : 0;

    /* ───────── رندر ───────── */
    return (
        <View style={{flex: 1, backgroundColor: colors.background.a1}}>
            <PackageHeader
                packageIcon={packageInfo?.icon_image}
                title={packageInfo?.title}
                packageId={packageId}
            />
            <View style={styles.container}>
                <FlatList
                    ref={flatListRef}
                    key={_id}
                    showsVerticalScrollIndicator={false}
                    keyExtractor={keyExtractor}
                    initialNumToRender={3}
                    windowSize={5}
                    initialScrollIndex={initialScrollIndex}
                    ListHeaderComponent={listHeaderComponent}
                    maxToRenderPerBatch={3}
                    contentContainerStyle={styles.listContent}
                    renderItem={renderItem}
                    data={seasons}
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
                    ListEmptyComponent={listEmptyComponent}
                    extraData={extraData}
                    onScrollToIndexFailed={onScrollToIndexFailed}
                    viewabilityConfig={VIEWABILITY_CONFIG}
                    onViewableItemsChanged={onViewableItemsChanged}
                />
            </View>
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
        paddingHorizontal: PACKAGE_GAME_SEASON_CARD_MARGIN,
    },
    listContent: {
        alignItems: 'center',
        rowGap: rowGap,
        paddingBottom: 125,
        paddingTop: FLATLIST_PADDING_VERTICAL,
    },
    headerBox: {
        width: width,
        alignItems: 'center',
    },
    emptyBox: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default StartPackageGame;