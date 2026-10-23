import React, { memo, useCallback, useMemo } from 'react';
import { Dimensions, ImageBackground, View } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import useAppTheme from '../../hooks/theme/useAppTheme';
import ImageComponent from '../image-components/ImageComponent';
import { IS_TABLET_CONDITION } from '../../utils/constants/constants';
import SimpleBorderText from '../text-components/SimpleBorderText';
import { navigate } from '../../main/navigationService';
import Globals from '../../utils/Globals';
import CustomSwiper from './CustomSwiper';
import LockedGlassOverlay from '../LockedGlassOverlay';
import LivingImage from './LivingImage';
import { EffectKind, parseEffect } from './effectThemes';
import CardBadge from '../home-parts/components/CardBadge';

export interface items {
    path: string;
    order?: number;
    file_type?: string;
    duration?: string;
    type?: string;
    lock?: boolean;
}

interface SeasonMediaSwiperProps {
    items?: items[];
    title?: string;
    badge?: string;
    height: number;
    frameWidth?: number;
    /** 1-based: initialSlide = 3 means the 3rd item. Default: 1 (first item). */
    initialSlide?: number;
    autoPlay?: boolean;
    autoPlayInterval?: number;
    /** Opacity of the glass over locked items (0..1). Default 0.8. */
    lockGlassOpacity?: number;
    /**
     * Living-image mood for the pictures: 'leaves' | 'petals' | 'sunlight' | 'fireflies'.
     * An item's own `type` (same values) overrides it. Leave undefined for plain still images.
     */
    effect?: EffectKind;
    /** Turn all living-image effects off (e.g. for low-end devices). Default true. */
    liveEffects?: boolean;
    /** Particle count multiplier, e.g. 0.5 on weak devices. Default 1. */
    effectDensity?: number;
}

const screenWidth = Dimensions.get('screen').width;
const MEDIA_RADIUS = 18;

function SeasonMediaSwiper({
    items,
    title,
    badge,
    height,
    frameWidth,
    initialSlide = 1,
    autoPlay = false,
    autoPlayInterval = 4000,
    lockGlassOpacity = 0.8,
    effect,
    liveEffects = true,
    effectDensity = 1,
}: SeasonMediaSwiperProps) {
    const colors = useAppTheme();

    const bannerWidth = frameWidth ? frameWidth : IS_TABLET_CONDITION ? 460 : screenWidth - 20;
    const mediaWidth = bannerWidth * 0.94;
    const mediaHeight = height * 0.85;
    const titleWidth = bannerWidth * 0.7;

    // Sort by `order` when it exists (stable sort: items without order keep their position).
    const data = useMemo(
        () => (items ? [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) : []),
        [items],
    );

    const initialIndex = Math.max(initialSlide - 1, 0);

    const onClickItem = useCallback((item: items) => {
        const BASE_URL = Globals.uri;
        navigate('ImageScreen', { uri: `${BASE_URL}${item?.path}` });
    }, []);

    const renderItem = useCallback(
        ({ item, index, isActive }: { item: items; index: number; isActive: boolean }) => {
            // Locked: Skia draws the (blurred) image itself under the glass, so no ImageComponent here.
            if (item.lock) {
                return (
                    <LockedGlassOverlay
                        width={mediaWidth}
                        height={mediaHeight}
                        radius={MEDIA_RADIUS}
                        imageUri={`${Globals.uri}${item?.path}`}
                        glassOpacity={lockGlassOpacity}
                        animate={isActive}
                    />
                );
            }
            const image = (
                <View>
                    <ImageComponent
                        uri={item?.path}
                        width={mediaWidth}
                        height={mediaHeight}
                        resizeMode="cover"
                        borderRadius={MEDIA_RADIUS}
                    />
                </View>
            );

            const itemEffect = parseEffect(item.type) ?? effect;
            if (!liveEffects || !itemEffect) return image;

            return (
                <LivingImage
                    width={mediaWidth}
                    height={mediaHeight}
                    radius={MEDIA_RADIUS}
                    effect={itemEffect}
                    seed={index}
                    active={isActive}
                    density={effectDensity}
                >
                    {image}
                </LivingImage>
            );
        },
        [mediaWidth, mediaHeight, onClickItem, lockGlassOpacity, effect, liveEffects, effectDensity],
    );

    const keyExtractor = useCallback((item: items, index: number) => `${item.path}-${index}`, []);

    return (
        <View style={{ width: screenWidth, alignItems: 'center' }}>
            <ImageBackground
                source={require('../../assets/image/horizontal_frame.png')}
                style={{
                    width: bannerWidth,
                    height,
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingTop: 3,
                }}
                imageStyle={{ resizeMode: 'stretch' }}
                resizeMode="stretch"
            >
                <MaskedView
                    style={{
                        width: mediaWidth,
                        height: mediaHeight,
                        alignSelf: 'center',
                        borderRadius: MEDIA_RADIUS,
                    }}
                    maskElement={
                        <View
                            style={{
                                backgroundColor: 'black',
                                width: mediaWidth,
                                height: mediaHeight,
                                borderRadius: MEDIA_RADIUS,
                            }}
                        />
                    }
                >
                    {data.length > 0 && (
                        <CustomSwiper<items>
                            data={data}
                            renderItem={renderItem}
                            keyExtractor={keyExtractor}
                            width={mediaWidth}
                            height={mediaHeight}
                            initialIndex={initialIndex}
                            autoPlay={autoPlay}
                            autoPlayInterval={autoPlayInterval}
                            activeDotColor={colors.primary.a3}
                            dotColor="#ffffff99"
                        />
                    )}
                </MaskedView>
                {
                    (badge && badge?.length > 0)&&
                    <View pointerEvents='none' style={{position:'absolute', width:"100%", height:"100%"}}>
                        <CardBadge label={badge} style={{bottom:20, end:20}}/>
                    </View>
                }
            </ImageBackground>

            {!!title && (
                <View style={{ position: 'absolute' }}>
                    <ImageBackground
                        source={require('../../assets/image/frame_stage_title.png')}
                        style={{
                            width: titleWidth,
                            height: titleWidth / 5,
                            justifyContent: 'center',
                            alignItems: 'center',
                            top: -titleWidth / 10,
                            paddingBottom: 2,
                        }}
                        imageStyle={{ resizeMode: 'stretch' }}
                        resizeMode="stretch"
                    >
                        <SimpleBorderText text={title} width={titleWidth} height={16 * 1.6} fontSize={16} />
                    </ImageBackground>
                </View>
            )}
        </View>
    );
}

export default memo(SeasonMediaSwiper);