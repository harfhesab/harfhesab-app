import React, { memo, useState, useEffect } from 'react';
import { StyleProp, View } from 'react-native';
import FastImage, { FastImageProps, ResizeMode, ImageStyle } from '@d11/react-native-fast-image';
import Globals from '../../utils/Globals';
import Icon from '../../utils/Icon';
import useAppTheme from '../../hooks/theme/useAppTheme';

const BASE_URL = Globals.uri;

type AdvancedImageComponentProps = {
  uri: string;
  width?: number;
  height?: number;
  borderRadius?: number;
  resizeMode?: keyof typeof FastImage.resizeMode;
  baseUrl?: boolean;
  style?: StyleProp<ImageStyle>;
  blank_background?: boolean;
  placeHolderImage?: any;
  iconType?: string;
  iconName?: string;
  iconSize?: number;
  iconColor?: string;
} & Omit<FastImageProps, 'onLoad' | 'onError' | 'source' | 'style'>;

const AdvancedImageComponent: React.FC<AdvancedImageComponentProps> = ({
  uri,
  width = 100,
  height = 100,
  borderRadius = 5,
  resizeMode = 'cover',
  baseUrl = true,
  style,
  blank_background,
  placeHolderImage,
  iconType,
  iconName,
  iconSize,
  iconColor,
  ...props
}) => {
  const colors = useAppTheme();
  const [error, setError] = useState(false);

  const fullUri = baseUrl === false ? uri : BASE_URL + uri;

  useEffect(() => {
    setError(false);
  }, [uri]);

  const handleError = () => {
    setError(true);
  };

  return (
    <View
      style={[
        {
          width,
          height,
          borderRadius,
          overflow: 'hidden',
          backgroundColor: blank_background === true ? 'transparent' : colors.primary.a2,
        },
        style,
      ]}
    >
      {error ? (
        iconName && iconType ? (
          <View style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={iconName} type={iconType} style={{ fontSize: iconSize, color: iconColor ?? colors.border.a2 }} />
          </View>
        ) : (
          <FastImage
            style={{ position: 'absolute', width: '100%', height: '100%', borderRadius }}
            source={placeHolderImage}
            resizeMode={FastImage.resizeMode[resizeMode] as ResizeMode}
          />
        )
      ) : (
        <FastImage
          style={{ position: 'absolute', width: '100%', height: '100%', borderRadius }}
          source={{
            uri: fullUri,
            priority: FastImage.priority.high,
            cache: FastImage.cacheControl.immutable,
          }}
          resizeMode={FastImage.resizeMode[resizeMode] as ResizeMode}
          onError={handleError}
          {...props}
        />
      )}
    </View>
  );
};

export default memo(AdvancedImageComponent);