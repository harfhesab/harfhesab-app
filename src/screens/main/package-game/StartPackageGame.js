import React, {useMemo, useState, useEffect, useRef} from 'react';
import {StyleSheet, View, Text, Dimensions, TouchableOpacity, SafeAreaView, FlatList, NativeModules, StatusBar, ImageBackground} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AlertHelper from '../../../components/alert/AlertHelper';
import { checkStageGameContentVersion } from '../../../utils/api/StageGameApi';
import { useDispatch, useSelector } from "react-redux";
import { useQuery, useObject } from '../../../realm';
import { getStageSeasonsByLanguage } from '../../../realm/repositories/stage-game/stage-season.repository';
import useAppTheme from '../../../hooks/theme/useAppTheme';
import Font from '../../../utils/Font';
import TextSkia from '../../../components/text-components/TextSkia';
import ScreenLoading from '../../../components/screen-loading/ScreenLoading';
import { IS_TABLET_CONDITION, STATUS_BAR_HEIGHT } from '../../../utils/constants/constants';
import GeneralHeader from '../../../components/header/GeneralHeader';
import Icon from '../../../utils/Icon';
import { getCurrentLanguageLastStageAndLastSeason } from '../../../realm/repositories/user/user-stage-game-progress.repository';
import { updateCurrentLanguageLastStageAndLastSeason } from '../../../redux/slices/stageGameSlice';
import { BSON } from 'realm';
import { useIsFocused } from '@react-navigation/native';
import BottomDrawerGridHelper from '../../../components/bottom-drawer-grid/BottomDrawerGridHelper';
import BottomDrawerGrid from '../../../components/bottom-drawer-grid/BottomDrawerGrid';
import PackageGameSeasonCard, { PACKAGE_GAME_SEASON_CARD_HEIGHT, PACKAGE_GAME_SEASON_CARD_MARGIN, HEADER_HEIGHT, PACKAGE_GAME_CARD_WIDTH } from '../../../components/card/package-game-card/PackageGameSeasonCard';
import { PackageSeason } from '../../../realm/schemas/package-game/PackageSeasonSchema';
import { Package } from '../../../realm/schemas/package-game/PackageSchema';
import { UserPackage } from '../../../realm/schemas/user/UserPackageSchema';
import ImageComponent from '../../../components/image-components/ImageComponent';
import PackageHeader from '../../../components/header/PackageHeader';
import SimpleBorderText from '../../../components/text-components/SimpleBorderText';
import PackageGameSeasonFirstCard from '../../../components/card/package-game-card/PackageGameSeasonFirstCard';

const {width, height} = Dimensions.get("window")
const FLATLIST_PADDING_VERTICAL = 15
const itemHeight = PACKAGE_GAME_SEASON_CARD_HEIGHT
const rowGap = 25
const numColumns = IS_TABLET_CONDITION ? 2 : 1
const snapInterval = itemHeight + rowGap
function useUserPackageGameData({ _id, packageId }) {
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
      .filtered("package == $0 AND is_visible == true", validPackageId)
      .sorted("season_number");
  }, [allSeasons, validPackageId]);
  return { seasons, packageInfo, userPackage };
}

const { ImmersiveMode } = NativeModules;
function StartPackageGame(props){
    const isFocused = useIsFocused();
    const colors = useAppTheme()
    const dispatch = useDispatch();
    const flatListRef = useRef(null);
    const [activeIndexes, setActiveIndexes] = useState([]);
    const _id = props?.route?.params?._id
    const packageId = props?.route?.params?.packageId
    const {seasons, packageInfo, userPackage} = useUserPackageGameData({_id, packageId})
    const lastSeasonNumber = userPackage?.last_season_number || 1;
    const lastStageNumber = userPackage?.last_stage_number
    const [loading, setLoading] = useState(true)
    const [noItem, setNoItem] = useState(false)

    useEffect(()=>{
        if(seasons.length > 0){
            setLoading(false)
            setNoItem(false)
        } else {
            setTimeout(()=>{
                setNoItem(true)
            }, 3000)
        }
    }, [seasons])

    useEffect(() => {
        ImmersiveMode.enterImmersiveMode();
        return () => {
            ImmersiveMode.exitImmersiveMode();
        };
    }, []);


    const renderItem = ({item, index})=>{
        return(
            <PackageGameSeasonCard
                ended={item.season_number < lastSeasonNumber?true:false}
                lock={item.season_number > lastSeasonNumber?true:false}
                progress={item.season_number == lastSeasonNumber?lastStageNumber - item.stage_number_from:null }
                currentScroll={activeIndexes.includes(index)}
                title={item.title}
                description={item.description}
                image={item.media[0].path}
                isActive={item.is_active}
                numberStage={item.number_stage}
                seasonNumber={item.season_number}
                stageNumberFrom={item.stage_number_from}
                stageNumberTo={item.stage_number_to}
                onPress={()=>{
                    if(item.season_number > lastSeasonNumber)return
                    props.navigation.navigate("StagesStageGameSeason", {season:item._id.toString(), seasonName:item.title.toString()})
                }}
                packageName={packageInfo?.title}
            />
        )
    }
    const memoizedValue = useMemo(() => renderItem, [seasons, activeIndexes, lastSeasonNumber]);
    const keyExtractor = (item,index)=>index.toString()


  
    const ListEmptyComponent = ()=>{
        <View style={{flex:1, alignItems:'center', justifyContent:'center'}}>
            <ScreenLoading
                loading={loading}
                getError={false}
                noItem={noItem}
                tryAgain={()=>{}}
            />
        </View>
    }
    const ListHeaderComponent = useMemo(()=>(
        <View style={{width:width, alignItems:'center'}}>
            <PackageGameSeasonFirstCard
                title={packageInfo?.title}
                image={packageInfo?.banner_image}
                numberStage={packageInfo?.number_stage}
                numberSeason={packageInfo?.number_season}
                lastStageNumber={lastStageNumber??0}
                onPress={()=>{
                    
                }}
            />
        </View>
    ), [])

    return(
        <View style={{flex:1, backgroundColor:colors.background.a1}}>
            <StatusBar translucent={true} hidden={true} />
            <PackageHeader
                packageIcon={packageInfo?.icon_image}
                title={packageInfo?.title}
            />
            <View style={styles.container}>
                <FlatList
                    ref={flatListRef}
                    key={_id}
                    showsVerticalScrollIndicator={false}
                    keyExtractor={keyExtractor}
                    initialNumToRender={3}
                    windowSize={5}
                    initialScrollIndex={
                        seasons?.length > 0
                        ? Math.min(Math.max(0, lastSeasonNumber - 1), seasons.length - 1)
                        : 0
                    }
                    ListHeaderComponent={ListHeaderComponent}
                    maxToRenderPerBatch={3}
                    contentContainerStyle={{alignItems:'center', rowGap:rowGap, paddingBottom:125, paddingTop:FLATLIST_PADDING_VERTICAL}}
                    renderItem={memoizedValue}
                    data={seasons}
                    numColumns={numColumns}
                    onEndReachedThreshold={0.5}
                    removeClippedSubviews={Platform.OS == 'ios' ? false : true}
                    style={{width:width, paddingHorizontal:PACKAGE_GAME_SEASON_CARD_MARGIN}}
                    getItemLayout={(data, index) => {
                        const row = Math.floor(index / numColumns); // هر ردیف
                        return {
                            length: itemHeight,
                            offset: FLATLIST_PADDING_VERTICAL + row * snapInterval,
                            index,
                        };
                    }}
                    snapToInterval={snapInterval} // ارتفاع هر ردیف
                    snapToAlignment="start"       // آیتم از بالا چفت شود
                    decelerationRate="fast"       // سرعت کاهش سریع برای اسنپ بهتر
                    disableIntervalMomentum={true} // محدود کردن اسکرول به فقط یک interval در هر سوایپ
                    bounces={true}                // فنری بودن مانند iOS
                    ListEmptyComponent={ListEmptyComponent}
                    extraData={{ activeIndexes, lastSeasonNumber }}
                    onScrollToIndexFailed={(info) => {
                        flatListRef.current?.scrollToIndex({
                            index: Math.max(0, seasons.length - 1),
                            animated: false,
                            viewOffset: FLATLIST_PADDING_VERTICAL,
                        });
                    }}
                    onMomentumScrollEnd={(e) => {
                        if (numColumns === 1) {
                            const offsetY = e.nativeEvent.contentOffset.y;
                            const currentRow = Math.round(offsetY / snapInterval);
                            const firstIndex = currentRow * numColumns;
                            setActiveIndexes([firstIndex - 1]);
                        } else {
                            const offsetY = e.nativeEvent.contentOffset.y;
                            const currentRow = Math.round(offsetY / snapInterval);
                            const firstIndex = currentRow * numColumns;
                            const secondIndex = firstIndex + 1;
                            setActiveIndexes([firstIndex - 1, secondIndex - 1]);
                        }
                    }}
                />
            </View>
            <BottomDrawerGrid ref = {Ref => {BottomDrawerGridHelper.setRef(Ref)}}/>
        </View>
    )
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
    }
});
export default StartPackageGame;