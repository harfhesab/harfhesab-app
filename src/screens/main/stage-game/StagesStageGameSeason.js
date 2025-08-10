import React, {useMemo, useState, useEffect} from 'react';
import {Platform, StyleSheet, View, Text, Dimensions, TouchableOpacity, SafeAreaView, FlatList, I18nManager} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AlertHelper from '../../../components/alert/AlertHelper';
import { checkStageGameContentVersion } from '../../../utils/api/StageGameApi';
import { useDispatch, useSelector } from "react-redux";
import { useRealm } from '../../../realm';
import { getStageSeasonById } from '../../../realm/repositories/stage-game/stage-season.repository';
import BottomDrawer from '../../../components/bottom-drawer/BottomDrawer';
import BottomDrawerHelper from '../../../components/bottom-drawer/BottomDrawerHelper';
import { getAllLanguages } from '../../../realm/repositories/general/language.repository';
import { changeStageGameLanguage } from '../../../redux/slices/stageGamePersistSlice';
import useAppTheme from '../../../hooks/theme/useAppTheme';
import Font from '../../../utils/Font';
import TextSkia from '../../../components/text-components/TextSkia';
import ScreenLoading from '../../../components/screen-loading/ScreenLoading';
import StageGameSeason from '../../../components/card/stage-game-card/StageGameSeason';
import MediaSwiper from '../../../components/swiper/MediaSwiper';
import StageNumber, { STAGE_CARD_MARGIN, LIST_STAGE_CARD_NUMBER_COLUMN, STAGE_CARD_SIZE } from '../../../components/card/general/StageNumber';
import { getStagesBySeasonId } from '../../../realm/repositories/stage-game/stage.repository';
import GalaxyTwinkle from '../../../components/backgroun-layer/GalaxyTwinkle';

const {width, height} = Dimensions.get("window")
function StagesStageGameSeason(props){
    const colors = useAppTheme()
    const realm = useRealm();
    const [loading, setLoading] = useState(true)
    const [getError, setGetError] = useState(false)
    const [noItem, setNoItem] = useState(false)
    const [info, setInfo] = useState(null)
    const [data, setData] = useState([])

    useEffect(() => {
        getData()
    }, []);
    const getData = async (selected)=>{
        const id = props?.route?.params?.season
        const season = getStageSeasonById(realm, id)
        const stages = getStagesBySeasonId(realm, id)
        if(season && stages?.length > 0){
            setInfo(season)
            setData(stages)
            setLoading(false)
        } else if(seasons?.length == 0){
            setNoItem(true)
        } else {
            setGetError(true)
        }
    }
    const tryAgain = ()=>{
        setLoading(true)
        setGetError(false)
        getData()
    }

    const LIST_HEADER_COMPONENT_HEIGHT = info?.media?.length > 0?200:0

    const listHeaderComponent = ()=>{
        return(
            info?.media?.length > 0&&
            <View style={{height:LIST_HEADER_COMPONENT_HEIGHT, width:width-30, alignItems:'center', marginBottom:30}}>
                <MediaSwiper
                    items={info?.media.concat(info?.media)}
                    width={width-30}
                /> 
            </View>
        )
    }

    const renderItem = ({item, index})=>{
        return(
            <StageNumber
                currently={index == 1?true:false}
                lock={index > 1?true:false}
                number={index +  1}
                onPress={()=>{props.navigation.navigate("WordToSlotStageGame")}}
            />
        )
    }
    const memoizedValue = useMemo(() => renderItem, [data]);
    const keyExtractor = (item,index)=>index.toString()
    const FLATLIST_PADDING_TOP = 15
    return(
        <SafeAreaView>
            {
                loading == true?
                <LinearGradient colors={colors.background_gradient} style={{width:width, height:height}}>
                    <View style={styles.container}>
                        <ScreenLoading
                            loading={loading}
                            getError={getError}
                            noItem={noItem}
                            tryAgain={tryAgain}
                        />
                    </View>
                </LinearGradient>
                :
                <GalaxyTwinkle style={{ width: width, height: height }}>
                    <View style={styles.container}>
                        <FlatList
                            showsVerticalScrollIndicator={false}
                            keyExtractor={keyExtractor}
                            initialNumToRender={20}
                            ListHeaderComponent={listHeaderComponent}
                            contentContainerStyle={{direction:'ltr'}}
                            renderItem={memoizedValue}
                            data={data}
                            style={{paddingHorizontal:15}}
                            numColumns={LIST_STAGE_CARD_NUMBER_COLUMN}
                            onEndReachedThreshold={0.5}
                            removeClippedSubviews={Platform.OS == 'ios' ? false : true}
                            getItemLayout={(data, index) => ({
                                length: STAGE_CARD_SIZE + (STAGE_CARD_MARGIN*2),
                                offset: FLATLIST_PADDING_TOP + (STAGE_CARD_MARGIN*2) + LIST_HEADER_COMPONENT_HEIGHT + (STAGE_CARD_SIZE* index),  // 15 پدینگ بالای کل لیست
                                index,
                            })}
                        />
                    </View>
                </GalaxyTwinkle>
            }
            <BottomDrawer ref = {Ref => {BottomDrawerHelper.setRef(Ref)}}/>
        </SafeAreaView>
    )
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
    }
});
export default StagesStageGameSeason;