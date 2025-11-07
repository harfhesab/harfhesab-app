import React from 'react';
import {StyleSheet, View, Dimensions, ScrollView, ImageBackground} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import useAppTheme from '../../../hooks/theme/useAppTheme';
import GeneralHeader from '../../../components/header/GeneralHeader';
import Icon from '../../../utils/Icon';
import Font from '../../../utils/Font';
import SimpleItem from '../../../components/list-view-items/SimpleItem';

function FreeCoin(props){
    const dispatch = useDispatch();
    const { width, height } = Dimensions.get('window');
    const colors = useAppTheme()
    const { loginType, name, phone } = useSelector((state) => state.account);
    const { sound, music, vibration } = useSelector((state) => state.setting);

    
    
    return(
        <View style={{flex:1, backgroundColor:colors.background.a1}}>
            <GeneralHeader
                paddingHorizontal={10}
                height={60}
                coin={true}
                back={true}
                title={"دریافت سکه رایگان"}
            />
            <View style={{flex:1, alignItems:'center', justifyContent:'center'}}>
                <ImageBackground
                    source={require("../../../assets/image/menu_frame_full.png")}
                    style={{ width: width - 20, height:height-80, paddingVertical:"3.5%"}}
                    imageStyle={{ resizeMode: "stretch" }}
                    resizeMode="stretch"
                >
                    <View style={{borderRadius:"10%", overflow:'hidden', width:width-40, alignItems:'center', alignSelf:'center'}}>
                        <ScrollView 
                            contentContainerStyle={{alignItems:'center', paddingVertical:5, gap:10}} 
                            showsVerticalScrollIndicator={false}
                        >
                            <SimpleItem
                                title={"تکمیل اطلاعات حساب"}
                                arrow={false}
                                value={""}
                                icon_name={"person"}
                                icon_type={"Ionicons"}
                                icon_size={25}
                                click={()=>{}}
                            />
                            <SimpleItem
                                title={"مشاهده تبلیغ"}
                                arrow={false}
                                value={""}
                                icon_name={"person"}
                                icon_type={"Ionicons"}
                                icon_size={25}
                                click={()=>{}}
                            />
                            <SimpleItem
                                title={"دنبال کردن صفحه اینستاگرام"}
                                arrow={false}
                                value={""}
                                icon_name={"person"}
                                icon_type={"Ionicons"}
                                icon_size={25}
                                click={()=>{}}
                            />
                            <SimpleItem
                                title={"دنبال کردن کانال تلگرام"}
                                arrow={false}
                                value={""}
                                icon_name={"person"}
                                icon_type={"Ionicons"}
                                icon_size={25}
                                click={()=>{}}
                            />
                        </ScrollView>
                    </View>
                </ImageBackground>
            </View>
        </View>
    )
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
    },
});

export default FreeCoin;