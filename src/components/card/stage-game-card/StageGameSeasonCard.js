import React, { memo } from 'react';
import {
  View,
  Text,
  Dimensions,
  StyleSheet,
} from 'react-native';
import Icon from '../../../utils/Icon';
import Font from '../../../utils/Font';
import ImageComponent from '../../image-components/ImageComponent';
import MultiLineTextGradientSvg from '../../text-components/MultiLineTextGradientSvg';
import ButtonImgSrc from '../../buttons/ButtonImgSrc';
import LockedSeasonAnimation from '../../LockedSeasonAnimation';
import { IS_TABLET_CONDITION } from '../../../utils/constants/constants';
import { tabScreenSoundInOnClick } from '../../../utils/sound/SoundFunctions';
import useAppTheme from '../../../hooks/theme/useAppTheme';

const { width, height } = Dimensions.get('window');

export const STAGE_GAME_SEASON_CARD_MARGIN = 10;
export const STAGE_GAME_SEASON_CARD_HEIGHT = height - 185;
const STAGE_GAME_CARD_WIDTH = IS_TABLET_CONDITION
  ? (width - (STAGE_GAME_SEASON_CARD_MARGIN * 3)) / 2
  : width - (STAGE_GAME_SEASON_CARD_MARGIN * 2);

function StageGameSeasonCard({
  lock,
  currentScroll,
  title,
  description,
  image,
  seasonNumber,
  stageNumberFrom,
  stageNumberTo,
  numberStage,
  isActive,
  onPress,
}) {
  const colors = useAppTheme();

  const onClick = async () => {
    if (!lock) {
      tabScreenSoundInOnClick();
      onPress();
    }
  };

  return (
    <View style={{
      width: STAGE_GAME_CARD_WIDTH,
      height: STAGE_GAME_SEASON_CARD_HEIGHT,
      backgroundColor: '#120426',
      shadowColor: '#000',
      elevation: 5,
      borderRadius: 15,
      borderWidth: 1.5,
      borderColor: colors.border.a1,
      overflow: 'hidden',
      alignItems:'center'
    }}>
      <View style={{ flex: 1, position: 'relative' }}>
        <CardContent
          lock={lock}
          title={title}
          image={image}
          seasonNumber={seasonNumber}
          stageNumberFrom={stageNumberFrom}
          stageNumberTo={stageNumberTo}
          numberStage={numberStage}
          colors={colors}
          onClick={onClick}
        />
      </View>

      {lock === true && (
        <View style={{
          width: '100%',
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#83703d70',
          position: 'absolute',
          top: 0,
          left: 0,
        }}>
          <LockedSeasonAnimation animate={currentScroll} lockFontSize={STAGE_GAME_CARD_WIDTH / 2} />
        </View>
      )}
    </View>
  );
}

const CardContent = memo(({
  lock, title, image, seasonNumber, stageNumberFrom, stageNumberTo, numberStage, colors, onClick
}) => {
  return (
    <View style={{
      width: STAGE_GAME_CARD_WIDTH-3,
      height: STAGE_GAME_SEASON_CARD_HEIGHT,
      flexDirection: 'column',
      justifyContent: 'space-between',
    }}>
      <View style={{ width: '100%', alignItems: 'center' }}>
        <ImageComponent
          uri={image}
          width={STAGE_GAME_CARD_WIDTH-3}
          height={STAGE_GAME_CARD_WIDTH * 0.7}
          resizeMode={'cover'}
          borderRadius={13.5}
        />
        <View style={{ width: '100%', alignItems: 'center', paddingTop: 10, paddingHorizontal: 10 }}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            backgroundColor: `${colors.primary.a1}45`,
            paddingVertical: 15,
            paddingHorizontal: 10,
            borderRadius: 10,
            marginHorizontal: 10,
          }}>
            <Text style={{ color: colors.text.a1, fontFamily: Font.medium, fontSize: 15 }}>{`فصل ${seasonNumber}`}</Text>
            {lock == true ? (
              <Icon name={'download-cloud'} type={'Feather'} style={{ fontSize: 20, color: colors.text.a1 }} />
            ) : (
              <Text style={{ color: colors.text.a1, fontFamily: Font.medium, fontSize: 15 }}>{`${numberStage} مرحله ( ${stageNumberFrom} تا ${stageNumberTo} )`}</Text>
            )}
          </View>
        </View>
      </View>

      <View style={{ flex: 1, width: '100%', alignItems: 'flex-start', justifyContent: 'center', paddingHorizontal: 10 }}>
        <MultiLineTextGradientSvg
          text={title}
          fontFamily={Font.iran_yekan_black_fa}
          fontSize={30}
          borderColor={'#795548'}
          borderWidth={1}
          glowBlur={100}
          glowColor={'#FFFFFF'}
          glowShadow={true}
          colors={['#ffc107', '#ff9800', '#ff5722']}
          width={STAGE_GAME_CARD_WIDTH - 20} // دادم width تا اندازه‌گیری دقیق و cache بشه
        />
      </View>

      <View style={{ width: '100%', alignItems: 'flex-end', paddingBottom: 10, paddingEnd: 10 }}>
        <ButtonImgSrc
          onPress={onClick}
          fontSize={20}
          textWidth={100}
          text={lock == true ? undefined : 'شروع بازی'}
          height={50}
          width={180}
          iconName={lock == true ? 'shield-lock' : 'gamepad'}
          iconType={lock == true ? 'MaterialCommunityIcons' : 'FontAwesome5'}
          iconSize={35}
          iconColor={"#311b92"}
        />
      </View>
    </View>
  );
}, (p, n) => {
  // فقط وقتی داده‌های متن یا تصویر یا لاک عوض شد، rerender کن
  return (
    p.lock === n.lock &&
    p.title === n.title &&
    p.image === n.image &&
    p.seasonNumber === n.seasonNumber &&
    p.stageNumberFrom === n.stageNumberFrom &&
    p.stageNumberTo === n.stageNumberTo &&
    p.numberStage === n.numberStage
  );
});

export default memo(StageGameSeasonCard);
