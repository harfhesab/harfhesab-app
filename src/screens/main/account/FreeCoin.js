import React from 'react';
import {StyleSheet, View, Dimensions, ScrollView, ImageBackground} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import useAppTheme from '../../../hooks/theme/useAppTheme';
import GeneralHeader from '../../../components/header/GeneralHeader';
import Icon from '../../../utils/Icon';
import Font from '../../../utils/Font';
import SimpleItem from '../../../components/list-view-items/SimpleItem';
import LocalImageComponent from '../../../components/image-components/LocalImageComponent';

function FreeCoin(props){
    const dispatch = useDispatch();
    const { width, height } = Dimensions.get('window');
    const colors = useAppTheme()
    const { free_coin_completed_account_info, free_coin_follow_instagram, free_coin_View_ads, free_coin_first_rating_in_store } = useSelector((state) => state.constants);

    const coinComponent = ()=>(
        <LocalImageComponent
            path={require("../../../assets/image/coin.png")}
            width={20}
            height={20}
            resizeMode="stretch"
            blank_background
        />
    )
    
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
                                value={`${free_coin_completed_account_info}`}
                                icon_name={"person"}
                                icon_type={"Ionicons"}
                                icon_size={25}
                                click={()=>{}}
                                ValueComponent={coinComponent}
                            />
                            <SimpleItem
                                title={"مشاهده تبلیغ"}
                                arrow={false}
                                value={`${free_coin_View_ads}`}
                                icon_name={"video"}
                                icon_type={"Entypo"}
                                icon_size={25}
                                click={()=>{}}
                                ValueComponent={coinComponent}
                            />
                            <SimpleItem
                                title={"دنبال کردن اینستاگرام"}
                                arrow={false}
                                value={`${free_coin_follow_instagram}`}
                                icon_name={"instagram"}
                                icon_type={"Entypo"}
                                icon_size={25}
                                click={()=>{}}
                                ValueComponent={coinComponent}
                            />
                            <SimpleItem
                                title={"ثبت بازخورد از بازی"}
                                arrow={false}
                                value={`${free_coin_first_rating_in_store}`}
                                icon_name={"star-half-alt"}
                                icon_type={"FontAwesome5"}
                                icon_size={25}
                                click={()=>{}}
                                ValueComponent={coinComponent}
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