import React, { memo } from 'react';
import {StyleSheet, View, Dimensions, ImageBackground} from 'react-native';
import FastImage from '@d11/react-native-fast-image';
import ImageZoom from 'react-native-image-pan-zoom';
import GeneralHeader from '../../components/header/GeneralHeader';
import { useStatusBarHeight } from '../../hooks/useStatusBarHeight';


const {width, height} = Dimensions.get('screen');
function ImageScreen(props){
    const STATUS_BAR_HEIGHT = useStatusBarHeight()
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
        <View style={{width:width, position:'absolute', top:STATUS_BAR_HEIGHT}}>
            <GeneralHeader
                back={true}
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