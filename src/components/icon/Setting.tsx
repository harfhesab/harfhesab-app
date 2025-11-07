import React from "react";
import {TouchableOpacity} from 'react-native';
import LocalImageComponent from "../image-components/LocalImageComponent";
import { navigate } from "../../main/navigationService";

type SettingProps = {
  size?: number;
} 
const Setting: React.FC<SettingProps> = ({
  size = 40,
}) => {
    const click = ()=>{
        navigate("Setting")
    }
    return(
        <TouchableOpacity onPress={click} activeOpacity={0.85}>
            <LocalImageComponent
                path={require("../../assets/image/setting.png")}
                width={size}
                height={size}
                resizeMode={'cover'}
                blank_background
            />
        </TouchableOpacity>
    )
}
export default Setting;