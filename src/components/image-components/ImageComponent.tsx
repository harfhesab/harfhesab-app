import React, { useState } from 'react';
import { View, StyleSheet, ImageStyle, StyleProp, Image } from 'react-native';
import FastImage, { FastImageProps, ResizeMode } from '@d11/react-native-fast-image';
import Globals from '../../utils/Globals';
import Icon from '../../utils/Icon';
import useAppTheme from '../../hooks/theme/useAppTheme';

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

  return (
    <View style={[{ width, height, borderRadius }, styles.container, style]}>
      {!loaded && !error && (
        <Image
          source={require('../../assets/image/image-place-holder.png')}
          style={{ width, height, borderRadius }}
        />
      )}

      {!error && (
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
  },
});

export default ImageComponent;
