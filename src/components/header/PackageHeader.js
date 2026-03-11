import React, {memo} from "react";
import { View, Dimensions,} from 'react-native';
import useAppTheme from "../../hooks/theme/useAppTheme";
import NumberCoins from "../coin/NumberCoins";
import Back from "../icon/Back";
import Setting from "../icon/Setting";
import { STATUS_BAR_HEIGHT } from "../../utils/constants/constants";
import { navigate } from "../../main/navigationService";
import PackageInfoBtn from "../buttons/PackageInfoBtn";

const {width} = Dimensions.get('screen');
function PackageHeader({height=65, paddingHorizontal=12, back=true, coin=true, title, setting=true, packageIcon, packageId}){
    const colors = useAppTheme();
    return(
        <View style={{backgroundColor:colors.header.background, paddingTop:STATUS_BAR_HEIGHT}}>
            <View style={{backgroundColor:colors.header.background, shadowColor:colors.shadow.a2, elevation:5, height:height, width:width, flexDirection:'row', alignItems:'center', paddingHorizontal:paddingHorizontal, justifyContent:'space-between', zIndex:1000}}>
                <View style={{height:"100%", flexDirection:'row', alignItems:'center', justifyContent:'flex-start', gap:10}}>
                    {
                        back&&
                        <Back/>
                        
                    }
                    {
                        (packageIcon && packageId)&&
                        <PackageInfoBtn
                            packageId={packageId}
                            packageIcon={packageIcon}
                        />
                    }
                </View>
                <View style={{height:"100%", flexDirection:'row', alignItems:'center', gap:7}}>
                    {
                        coin&&
                        <NumberCoins/>
                    }
                    {
                        setting&&
                        <Setting/>
                    }
                </View>
            </View>
        </View>
    )
}

export default memo(PackageHeader);
