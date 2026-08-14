import React from "react";
import {TouchableOpacity} from 'react-native';
import { popTo } from "../../main/navigationService";
import LocalImageComponent from "../image-components/LocalImageComponent";

type BackProps = {
  size?: number;
  route: string;
} 
const Home: React.FC<BackProps> = ({
  size = 40,
  route
}) => {
    const click = ()=>{
        popTo(route)
    }
    return(
        <TouchableOpacity onPress={click} activeOpacity={0.85}>
            <LocalImageComponent
                path={require("../../assets/image/home.png")}
                width={size}
                height={size}
                resizeMode={'cover'}
                blank_background
            />
        </TouchableOpacity>
    )
}
export default Home;