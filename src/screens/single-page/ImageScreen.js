import React, { memo } from 'react';
import {StyleSheet, View, Dimensions, NativeModules, ImageBackground} from 'react-native';
import FastImage from '@d11/react-native-fast-image';
import ImageZoom from 'react-native-image-pan-zoom';
import GeneralHeader from '../../components/header/GeneralHeader';
import { STATUS_BAR_HEIGHT } from '../../utils/constants/constants';

const { ImmersiveMode } = NativeModules;
function ImageScreen(props){
    const { width, height } = ImmersiveMode.isImmersiveModeActive()? Dimensions.get('screen'): Dimensions.get('window');
    const {params} = props.route;
    const goBack = ()=>{
        props.navigation.goBack()
    }
    return (
        <ImageBackground
            source={require("../../assets/image/background.png")}
            style={{ width: width, height: height}}
            imageStyle={{ resizeMode: "cover" }}
            resizeMode="cover"
        >
        <View style={[styles.content, {width:width, height:height}]}>
            <ImageZoom 
                useNativeDriver={true}
                swipeDownThreshold={height * 0.3}
                enableSwipeDown={true}
                onSwipeDown={goBack}
                cropWidth={width}
                cropHeight={height}
                imageWidth={width}
                imageHeight={height}
            >
            <FastImage
                style={{ width: width, height: height }}
                source={{
                    uri: params.uri,
                    priority: FastImage.priority.high,
                    cache: FastImage.cacheControl.immutable,
                }}
                resizeMode={FastImage.resizeMode.contain}
            />
            </ImageZoom>
        </View>
        <View style={{width:width, position:'absolute', top:ImmersiveMode.isImmersiveModeActive()?STATUS_BAR_HEIGHT:0}}>
            <GeneralHeader
                paddingHorizontal={10}
                back={true}
                height={60}
                coin={true}
                backgroundColor='transparent'
                hideShadow={true}
                shadowColor='transparent'
                borderBottomWidth={0}
                borderBottomColor='transparent'
            />
        </View>
        </ImageBackground>
    );
};
const styles = StyleSheet.create({
    content:{
        flex:1,
        alignItems:'center',
        justifyContent:'center',
    }
})
export default ImageScreen