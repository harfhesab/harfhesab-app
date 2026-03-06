import React from 'react';
import {StyleSheet, View, Dimensions, ScrollView, ImageBackground, NativeModules} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import useAppTheme from '../../../hooks/theme/useAppTheme';
import GeneralHeader from '../../../components/header/GeneralHeader';
import { STATUS_BAR_HEIGHT } from '../../../utils/constants/constants';
import SwitchItem from '../../../components/list-view-items/SwitchItem';
import { changeMusicGame, changeSoundGame, changeVibrationGame } from '../../../redux/slices/settingSlice';

const { ImmersiveMode } = NativeModules;
function Setting(props){
    const dispatch = useDispatch();
    const { width, height } = ImmersiveMode.isImmersiveModeActive()? Dimensions.get('screen'): Dimensions.get('window');
    const colors = useAppTheme()
    const { sound, music, vibration } = useSelector((state) => state.setting);

    
    
    return(
        <View style={{flex:1, backgroundColor:colors.background.a2, paddingTop:ImmersiveMode.isImmersiveModeActive()?STATUS_BAR_HEIGHT:0}}>
            <GeneralHeader
                coin={true}
                back={true}
                title={"تنظیمات"}
            />
            <View style={{flex:1, alignItems:'center', justifyContent:'center', backgroundColor:colors.background.a1}}>
                

                <ImageBackground
                    source={require("../../../assets/image/menu_frame_full.png")}
                    style={{ width: width - 20, height:ImmersiveMode.isImmersiveModeActive()?height-(80 + STATUS_BAR_HEIGHT):height-80, paddingVertical:"3.5%"}}
                    imageStyle={{ resizeMode: "stretch" }}
                    resizeMode="stretch"
                >
                    <View style={{borderRadius:"10%", overflow:'hidden', width:width-40, alignItems:'center', alignSelf:'center'}}>
                        <ScrollView 
                            contentContainerStyle={{alignItems:'center', paddingVertical:5, gap:10}} 
                            showsVerticalScrollIndicator={false}
                        >
                            <SwitchItem
                                title={"صدای بازی"}
                                icon_name={"volume-high"}
                                icon_type={"MaterialCommunityIcons"}
                                icon_size={30}
                                value={sound}
                                click={()=>{
                                    dispatch(changeSoundGame({sound:!sound}))
                                }}
                            />
                            <SwitchItem
                                title={"آهنگ بازی"}
                                icon_name={"music"}
                                icon_type={"FontAwesome6"}
                                icon_size={20}
                                value={music}
                                click={()=>{
                                    dispatch(changeMusicGame({music:!music}))
                                }}
                            />
                            <SwitchItem
                                title={"لرزش بازی (ویبره)"}
                                icon_name={"volume-vibrate"}
                                icon_type={"MaterialCommunityIcons"}
                                icon_size={30}
                                value={vibration}
                                click={()=>{
                                    dispatch(changeVibrationGame({vibration:!vibration}))
                                }}
                            />
                        </ScrollView>
                    </View>
                </ImageBackground>
            </View>
        </View>
    )
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
    },
});

export default Setting;