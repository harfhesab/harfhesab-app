import React, { memo, useState } from 'react';
import { StyleProp, View } from 'react-native';
import FastImage, { FastImageProps, ResizeMode, ImageStyle } from '@d11/react-native-fast-image';
import Globals from '../../utils/Globals';
import { colors } from '../../hooks/theme/colors';

const BASE_URL = Globals.uri;

type ImageComponentProps = {
  uri: string;
  width?: number;
  height?: number;
  borderRadius?: number;
  resizeMode?: keyof typeof FastImage.resizeMode;
  baseUrl?: boolean;
  style?: StyleProp<ImageStyle>;
  blank_background?: boolean;
} & Omit<FastImageProps, 'onLoad' | 'onError' | 'source' | 'style'>;

const ImageComponent: React.FC<ImageComponentProps> = ({
  uri,
  width = 100,
  height = 100,
  borderRadius = 5,
  resizeMode = 'cover',
  baseUrl = true,
  style,
  blank_background,
  ...props
}) => {

  const fullUri = baseUrl === false ? uri : BASE_URL + uri;


  return (
    <View style={[{ width, height, borderRadius, backgroundColor:blank_background == true?"transparent":colors.primary.a2 }, style]}>
      <FastImage
        style={[
          {
            width,
            height,
            borderRadius,
            backgroundColor: 'transparent',
          },
          style,
        ]}
        source={{
          uri: fullUri,
          priority: FastImage.priority.high,
          cache: FastImage.cacheControl.immutable,
        }}
        resizeMode={FastImage.resizeMode[resizeMode] as ResizeMode}
        {...props}
      />
    </View>
  );
};

export default memo(ImageComponent);