import React from 'react';
import { Dimensions, Text, View } from 'react-native';
import LocalImageComponent from '../image-components/LocalImageComponent';
import { colors } from '../../hooks/theme/colors';
import { WaveIndicator } from 'react-native-indicators';


const { width } = Dimensions.get("window");
export const DatabaseLoader = () => (
    <View style={{flex:1, backgroundColor:colors.background.a1, alignItems:'center', justifyContent:'space-between'}}>
        <View style={{flex:1, alignItems:'center', justifyContent:'center'}}>
            <View style={{width:"100%", alignItems:'center', gap:20}}>
                <LocalImageComponent
                    path={require('../../assets/image/icon.png')}
                    width={50}
                    height={50}
                    resizeMode={'cover'}
                    blank_background={true}
                    borderRadius={20}
                />
                <View style={{position:"absolute", alignItems:'center', justifyContent:'center', width:"100%", height:"100%", zIndex:3000}}>
                    <WaveIndicator
                        color={`#4fc3f7`}
                        size={150}
                        count={1}
                        waveMode="fill"
                    />
                </View>
            </View>
        </View>
    </View>
);