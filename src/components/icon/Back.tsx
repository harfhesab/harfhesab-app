import React from "react";
import {TouchableOpacity} from 'react-native';
import { goBack } from "../../main/navigationService";
import LocalImageComponent from "../image-components/LocalImageComponent";

type BackProps = {
  size?: number;
} 
const Back: React.FC<BackProps> = ({
  size = 40,
}) => {
    const click = ()=>{
        goBack()
    }
    return(
        <TouchableOpacity onPress={click} activeOpacity={0.85}>
            <LocalImageComponent
                path={require("../../assets/image/back.png")}
                width={size}
                height={size}
                resizeMode={'cover'}
                blank_background
            />
        </TouchableOpacity>
    )
}
export default Back;