import React, { useEffect } from 'react';
import { View} from 'react-native';
import useAppTheme from '../../hooks/theme/useAppTheme';
import LocalImageComponent from '../image-components/LocalImageComponent';
import { colors } from '../../hooks/theme/colors';

function PersistGateLoader(props){

    return(
        <View style={{flex:1, backgroundColor:colors.background.a1, alignItems:'center', justifyContent:'center', paddingBottom:60}}>
            <LocalImageComponent
                path={require('../../assets/image/icon.png')}
                width={100}
                height={100}
                resizeMode={'cover'}
                blank_background={true}
            />
        </View>
    )
}
export default PersistGateLoader;