import React from "react";
import {ImageBackground, TouchableOpacity} from 'react-native';
import { popTo } from "../../main/navigationService";
import Icon from "../../utils/Icon";
import { colors } from "../../hooks/theme/colors";

type BackProps = {
  size?: number;
  route: string;
} 
const Home: React.FC<BackProps> = ({
  size = 44,
  route = "Home"
}) => {
    const click = ()=>{
        popTo(route)
    }
    return(
        <TouchableOpacity onPress={click} activeOpacity={0.85}>
            <ImageBackground
                source={require("../../assets/image/icon-box.png")}
                style={{ width: size, height: size, justifyContent: "center", alignItems: "center", paddingBottom:4 }}
                imageStyle={{ resizeMode: "stretch" }}
                resizeMode="stretch"
            >
                <Icon name={"house"} type={"FontAwesome6"} style={{fontSize:20, color:colors.primary.a3}}/>
            </ImageBackground>
        </TouchableOpacity>
    )
}
export default Home;