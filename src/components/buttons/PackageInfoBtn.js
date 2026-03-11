import React, {memo} from "react";
import { Text, TouchableOpacity, ImageBackground, NativeModules} from 'react-native';
import Font from "../../utils/Font";
import ImageComponent from "../image-components/ImageComponent";
import { navigate } from "../../main/navigationService";

const { ImmersiveMode } = NativeModules;
function PackageInfoBtn({packageId, packageIcon}){
    const packageInfoClick = ()=>{
        ImmersiveMode.exitImmersiveMode()
        navigate("PackageInformation", {_id:packageId});
    }
    return(
        <TouchableOpacity activeOpacity={0.7} onPress={packageInfoClick}>
            <ImageBackground
                source={require("../../assets/image/free_button.png")}
                style={{ width: 40, height: 40, justifyContent: "center", alignItems: "center", paddingStart:1, paddingBottom:1}}
                imageStyle={{ resizeMode: "stretch" }}
                resizeMode="stretch"
            >
                <ImageComponent
                    uri={packageIcon}
                    width={33}
                    height={33}
                    resizeMode="cover"
                    borderRadius={15}
                />
            </ImageBackground>
            <ImageBackground
                source={require("../../assets/image/frame_badge.png")}
                style={{ width: 30, height: 18, justifyContent: "center", alignItems: "center", position:'absolute', top:-5, alignSelf:'center' }}
                imageStyle={{ resizeMode: "stretch" }}
                resizeMode="stretch"
            >
                <Text numberOfLines={1} style={{color:"#FFF", fontFamily:Font.medium, fontSize:6}}>{"بستهٔ بازی"}</Text>
            </ImageBackground>
        </TouchableOpacity>
    )
}

export default memo(PackageInfoBtn);
