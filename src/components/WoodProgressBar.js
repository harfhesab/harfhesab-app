import React from 'react';
import {StyleSheet, View, Text, Dimensions} from 'react-native';
import {
  ImageBackground,
} from 'react-native';
import useAppTheme from '../hooks/theme/useAppTheme';
import LocalImageComponent from './image-components/LocalImageComponent';
import LinearGradient from 'react-native-linear-gradient';
import Font from '../utils/Font';


function WoodProgressBar({progressWidth, progress, maxValue, showValue=true}){
    const colors = useAppTheme();

    const progressPercent = progress*100/maxValue

    return(
        <ImageBackground
            source={require("../assets/image/wood_progress_bar.png")}
            style={{ width: progressWidth, height: progressWidth/8.55, alignItems:'center', justifyContent:'center'}}
            imageStyle={{ resizeMode: "stretch" }}
            resizeMode="stretch"
        >
            <View style={{alignItems:'flex-end', width:'100%', height:'100%', justifyContent:"center", paddingHorizontal:"2.3%", paddingBottom:"1%"}}>

                {
                    progressPercent>0?
                    <LinearGradient colors={["#03a9f4", "#1a237e"]} style={{overflow:'visible', width:`${progressPercent}%`, height:"56%", borderRadius:20}}>
                        <View style={{overflow:'visible', height:"100%", width:"100%", alignItems:'flex-start', justifyContent:'center' }}>
                            <View style={{left:progressPercent < 10?-progressWidth/12:progressPercent < 20?-progressWidth/20:0  }}>
                                <LocalImageComponent
                                    path={require('../assets/image/progres_thumb_blue.png')}
                                    width={progressWidth/8.55}
                                    height={progressWidth/8.55}
                                    resizeMode={'stretch'}
                                    blank_background={true}
                                />
                            </View>
                        </View>
                    </LinearGradient>
                    :
                    <LocalImageComponent
                        path={require('../assets/image/progres_thumb_red.png')}
                        width={progressWidth/8.55}
                        height={progressWidth/8.55}
                        resizeMode={'stretch'}
                        blank_background={true}
                    />
                }
            </View>
            {showValue&&
                <View style={{width:"100%", height:"100%", alignItems:progressPercent < 70?"flex-start":"flex-end", justifyContent:'center', paddingHorizontal:30, position:'absolute', paddingBottom:"1%"}}>
                    <Text style={{fontFamily:Font.medium, color:colors.text.a1, fontSize:12}}>{`${maxValue} / ${progress}`}</Text>
                </View>
            }
        </ImageBackground>
    )
}
export default WoodProgressBar;