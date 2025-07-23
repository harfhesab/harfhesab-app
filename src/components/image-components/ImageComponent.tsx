import React, { useState } from 'react';
import { View, StyleSheet, ImageStyle, StyleProp } from 'react-native';
import FastImage, { FastImageProps, ResizeMode } from '@d11/react-native-fast-image';
import Globals from '../../utils/Globals';
import Icon from '../../utils/Icon';
import useAppTheme from '../../hooks/theme/useAppTheme';

const BASE_URL = Globals.uri;

type SmartImageProps = {
  uri: string;
  width?: number;
  height?: number;
  resizeMode?: keyof typeof FastImage.resizeMode;
  baseUrl?: boolean;
  placeholderIcon?: any;
  style?: StyleProp<ImageStyle>;
  onLoad?: () => void;
  onError?: () => void;
} & Omit<FastImageProps, 'onLoad' | 'onError'>;

const SmartImage: React.FC<SmartImageProps> = ({
  uri,
  width = 100,
  height = 100,
  resizeMode = 'cover',
  baseUrl = true,
  placeholderIcon = require('../assets/image-placeholder.png'),
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
    <View style={[{ width, height }, styles.container, style]}>
      {!loaded && !error && (
        <Icon name={"image"} type={"Ionicons"} style={{fontSize:40, color:colors.text.a1}}/>
      )}

      <FastImage
        style={{ width, height }}
        source={{
          uri: fullUri,
          priority: FastImage.priority.normal,
          cache: FastImage.cacheControl.web,
        }}
        resizeMode={FastImage.resizeMode[resizeMode] as ResizeMode}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'relative',
  },
});

export default SmartImage;
