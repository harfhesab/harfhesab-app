import React, {useMemo, useState, useEffect} from 'react';
import {Platform, StyleSheet, View, Text, Dimensions, TouchableOpacity, SafeAreaView, FlatList} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AlertHelper from '../../../components/alert/AlertHelper';
import { checkStageGameContentVersion } from '../../../utils/api/StageGameApi';
import { useDispatch, useSelector } from "react-redux";
import { useRealm } from '../../../realm';
import { getStageSeasonsByLanguage } from '../../../realm/repositories/stage-game/stage-season.repository';
import BottomDrawer from '../../../components/bottom-drawer/BottomDrawer';
import BottomDrawerHelper from '../../../components/bottom-drawer/BottomDrawerHelper';
import { getAllLanguages } from '../../../realm/repositories/general/language.repository';
import { changeStageGameLanguage } from '../../../redux/slices/stageGamePersistSlice';
import useAppTheme from '../../../hooks/theme/useAppTheme';
import Font from '../../../utils/Font';
import TextSkia from '../../../components/text-components/TextSkia';
import ScreenLoading from '../../../components/screen-loading/ScreenLoading';
import StageGameSeason from '../../../components/card/stage-game-card/StageGameSeason';

const {width, height} = Dimensions.get("window")
function StageGameSeason(props){
    const colors = useAppTheme()
    const realm = useRealm();
    const [loading, setLoading] = useState(true)
    const [getError, setGetError] = useState(false)
    const [noItem, setNoItem] = useState(false)
    const [info, setInfo] = useState(null)
    const [data, setData] = useState([])

    useEffect(() => {
        startFirst()
    }, []);
    const getData = async (selected)=>{
        const id = props?.route?.params?.season
        const season = getStageSeasonById(realm, id)
        const stages = getStagesBySeasonId(realm, id)
        if(season && season.length > 0 && stages && stages.length > 0){
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

    const listHeaderComponent = ()=>{
        return(
            <View>

            </View>
        )
    }

    const renderItem = ({item, index})=>{
        return(
            <View>

            </View>
        )
    }
    const memoizedValue = useMemo(() => renderItem, [data]);
    const keyExtractor = (item,index)=>index.toString()
    const FLATLIST_PADDING_TOP = 15
    return(
        <SafeAreaView>
            <LinearGradient colors={colors.background_gradient} style={{width:width, height:height}}>
                <View style={styles.container}>
                    {
                        loading == true?
                        <ScreenLoading
                            loading={loading}
                            getError={getError}
                            noItem={noItem}
                            tryAgain={tryAgain}
                        />
                        :
                        <FlatList
                            showsVerticalScrollIndicator={false}
                            keyExtractor={keyExtractor}
                            initialNumToRender={10}
                            contentContainerStyle={{rowGap:25, paddingTop:FLATLIST_PADDING_TOP, paddingBottom:90}}
                            ListHeaderComponent={listHeaderComponent}
                            renderItem={memoizedValue}
                            data={data}
                            onEndReachedThreshold={0.5}
                            removeClippedSubviews={Platform.OS == 'ios' ? false : true}
                            getItemLayout={(data, index) => ({
                                length: 475,
                                offset: FLATLIST_PADDING_TOP + 475 * index,  // 15 پدینگ بالای کل لیست
                                index,
                            })}
                        />
                    }
                </View>
            </LinearGradient>
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
export default StageGameSeason;