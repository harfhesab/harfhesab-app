import React from 'react';
import Animated, { useAnimatedProps } from 'react-native-reanimated';
import Svg, { Rect } from 'react-native-svg';
import { useLetters } from '../../context/LettersContext';
import { BOUNDARY_WIDTH } from '../../constants/constants';
import { ImageBackground, TouchableOpacity, View } from 'react-native';
import Icon from '../../../../utils/Icon';
import useAppTheme from '../../../../hooks/theme/useAppTheme';

const AnimatedRect = Animated.createAnimatedComponent(Rect);

const SelectionProgressCircle = () => {
  const colors = useAppTheme();
  const { selectionProgressRN, manualDeselectAll, manualStartProgressTimer } = useLetters();
  const animatedProps = useAnimatedProps(() => ({
    width: selectionProgressRN.value * (BOUNDARY_WIDTH - 72), // عرض نوار با progress تغییر می‌کنه
  }));

  return (
    <View style={{ width: BOUNDARY_WIDTH, height: 30, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <TouchableOpacity activeOpacity={0.7} onPress={manualStartProgressTimer} style={{width:30, height:30, alignItems:'center', justifyContent:'center'}}>
        <ImageBackground
            source={require("../../../../assets/image/free_button.png")}
            style={{ width: 30, height: 30, alignItems:'center', justifyContent:'center'}}
            imageStyle={{ resizeMode: "stretch" }}
            resizeMode="stretch"
        >
          <Icon name="refresh-ccw" type={"Feather"} style={{ fontSize:18, color:colors.primary.a5 }} />
        </ImageBackground>
      </TouchableOpacity>
      <Svg width={BOUNDARY_WIDTH - 68} height={17}>
        <Rect
          x={1}
          y={1}
          width={BOUNDARY_WIDTH - 70}
          height={15}
          fill="transparent"
          stroke="#fcb90090"
          strokeWidth={1}
          rx={5}
          ry={5}
        />
        <AnimatedRect
          x={2}
          y={2}
          height={13}
          fill="#40bf4250"
          rx={5}
          ry={5}
          animatedProps={animatedProps}
        />
      </Svg>
      <TouchableOpacity activeOpacity={0.7} onPress={manualDeselectAll} style={{width:30, height:30, alignItems:'center', justifyContent:'center'}}>
        <ImageBackground
            source={require("../../../../assets/image/free_button.png")}
            style={{ width: 30, height: 30, alignItems:'center', justifyContent:'center'}}
            imageStyle={{ resizeMode: "stretch" }}
            resizeMode="stretch"
        >
          <Icon name="refresh-cw" type={"Feather"} style={{ fontSize:18, color:colors.primary.a5 }} />
        </ImageBackground>
      </TouchableOpacity>
    </View>
    
  );
};

export default React.memo(SelectionProgressCircle);