import React from "react";
import {ImageBackground, TouchableOpacity} from 'react-native';
import { navigate } from "../../main/navigationService";
import LocalImageComponent from "../image-components/LocalImageComponent";
import Icon from "../../utils/Icon";
import { colors } from "../../hooks/theme/colors";

type AccountProps = {
  size?: number;
} 
const Account: React.FC<AccountProps> = ({
  size = 44,
}) => {
    const click = ()=>{
        navigate("Account")
    }
    return(
        <TouchableOpacity onPress={click} activeOpacity={0.85}>
            <ImageBackground
                source={require("../../assets/image/icon-box.png")}
                style={{ width: size, height: size, justifyContent: "center", alignItems: "center", paddingBottom:4 }}
                imageStyle={{ resizeMode: "stretch" }}
                resizeMode="stretch"
            >
                <Icon name={"person"} type={"Ionicons"} style={{fontSize:23, color:colors.primary.a3}}/>
            </ImageBackground>
        </TouchableOpacity>
    )
}
export default Account;