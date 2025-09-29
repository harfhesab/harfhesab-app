import React, { memo, useState } from 'react';
import { View, StyleSheet, ImageStyle, StyleProp, Image } from 'react-native';
import FastImage, { FastImageProps, ResizeMode } from '@d11/react-native-fast-image';
import Globals from '../../utils/Globals';
import useAppTheme from '../../hooks/theme/useAppTheme';
import MovementGradientLayer from '../backgroun-layer/MovementGradientLayer';
import { WaveIndicator } from 'react-native-indicators';
import Icon from '../../utils/Icon';

const BASE_URL = Globals.uri;

type ImageComponentProps = {
  uri: string;
  width?: number;
  height?: number;
  borderRadius?: number;
  resizeMode?: keyof typeof FastImage.resizeMode;
  baseUrl?: boolean;
  style?: StyleProp<ImageStyle>;
  onLoad?: () => void;
  onError?: () => void;
  placeHolder?: boolean;
  iconType?: string;
  iconName?: string;
  iconSize?: number;
} & Omit<FastImageProps, 'onLoad' | 'onError'>;

const ImageComponent: React.FC<ImageComponentProps> = ({
  uri,
  width = 100,
  height = 100,
  borderRadius = 5,
  resizeMode = "cover",
  baseUrl = true,
  style = {},
  onLoad,
  onError,
  placeHolder = true,
  iconType,
  iconName,
  iconSize,
  ...props
}) => {
  const colors = useAppTheme()
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const fullUri = baseUrl === false ? uri : BASE_URL + uri;

  const handleLoad = () => {
    setLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setError(true);
    onError?.();
  };

  const WIDTH = width > height?height:width
  const PLACE_HOLDER_WIDTH = WIDTH - 80 > 200?200:WIDTH-80

  return (
    <View style={[{ width, height, borderRadius, backgroundColor:colors.primary.a2 }, styles.container, style]}>
      {(error && !loaded && placeHolder == true) &&(
        <MovementGradientLayer height={height} width={width} borderRadius={borderRadius}>
          <View style={{width, height, alignItems:'center', justifyContent:'center'}}>
              {
                (iconName && iconSize) ?(
                  <Icon name={iconName} type={iconType} style={{fontSize:iconSize, color:colors.border.a2}}/>
                )
                :
                <>
                  <Image
                    source={require('../../assets/image/image-place-holder.png')}
                    style={{ width: PLACE_HOLDER_WIDTH, height: PLACE_HOLDER_WIDTH, borderRadius }}
                  />
                  <View style={{ position: 'absolute', width: PLACE_HOLDER_WIDTH, height: PLACE_HOLDER_WIDTH, alignItems: 'center', justifyContent: 'center' }}>
                    <WaveIndicator
                      color={"#FFFFFF65"}
                      size={PLACE_HOLDER_WIDTH}
                      count={2}
                      waveMode="outline"
                    />
                  </View>
                </>
              }
          </View>
        </MovementGradientLayer>
      )}

      {!error &&  (
        <FastImage
          style={{ width, height, borderRadius }}
          source={{
            uri: fullUri,
            priority: FastImage.priority.high,
            cache: FastImage.cacheControl.immutable,
          }}
          defaultSource={require('../../assets/image/image-place-holder.png')}
          resizeMode={FastImage.resizeMode[resizeMode] as ResizeMode}
          onLoad={handleLoad}
          onError={handleError}
          {...props}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center'
  },
});

export default memo(ImageComponent);
