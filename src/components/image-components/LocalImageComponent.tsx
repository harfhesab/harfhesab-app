import React, { memo } from 'react';
import { View, StyleSheet, ImageStyle, StyleProp } from 'react-native';
import FastImage, { FastImageProps, ResizeMode } from '@d11/react-native-fast-image';
import useAppTheme from '../../hooks/theme/useAppTheme';

type LocalImageComponentProps = {
  path: any;
  width?: number;
  height?: number;
  borderRadius?: number;
  resizeMode?: keyof typeof FastImage.resizeMode;
  style?: StyleProp<ImageStyle>;
};

const LocalImageComponent: React.FC<LocalImageComponentProps> = ({
  path,
  width = 100,
  height = 100,
  borderRadius = 5,
  resizeMode = "cover",
  style = {},
  ...props
}) => {
  const colors = useAppTheme()


  return (
    <View style={[{ width, height, borderRadius, backgroundColor:colors.primary.a2 }, styles.container, style]}>
      <FastImage
          style={{ width, height, borderRadius }}
          source={path}
          resizeMode={FastImage.resizeMode[resizeMode] as ResizeMode}
          {...props}
        />
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

export default memo(LocalImageComponent);
