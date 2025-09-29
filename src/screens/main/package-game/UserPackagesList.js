import React, {useMemo, useState, useEffect, useRef} from 'react';
import {StyleSheet, View, Text, Dimensions, TouchableOpacity, SafeAreaView, FlatList} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AlertHelper from '../../../components/alert/AlertHelper';
import { useDispatch, useSelector } from "react-redux";
import { useQuery, useRealm } from '../../../realm';
import useAppTheme from '../../../hooks/theme/useAppTheme';
import Font from '../../../utils/Font';
import TextSkia from '../../../components/text-components/TextSkia';
import ScreenLoading from '../../../components/screen-loading/ScreenLoading';
import GeneralHeader from '../../../components/header/GeneralHeader';
import Icon from '../../../utils/Icon';
import { BSON } from 'realm';
import { useIsFocused } from '@react-navigation/native';
import UserPackageItem from '../../../components/card/package-game-card/UserPackageItem';
import { UserPackage } from '../../../realm/schemas/user/UserPackageSchema';
import { Package } from '../../../realm/schemas/package-game/PackageSchema';

const {width, height} = Dimensions.get("window")
function useUserPackage() {
  const allUserPackage = useQuery(UserPackage);
  const allPackage = useQuery(Package);

  // داده ترکیب‌ شده
  const data = useMemo(() => {
    return allUserPackage.map(userPkg => {
      const packag = allPackage.find(p => 
        p._id.toHexString() === userPkg.package_ref.toHexString()
      );

      return {
        ...userPkg.toJSON(), // یا مستقیم خود userPkg هم میشه
        packag, // پکیج مربوطه
      };
    });
  }, [allUserPackage, allPackage]);

  return data;
}

function UserPackagesList(props){
    const isFocused = useIsFocused();
    const colors = useAppTheme()
    const state = useSelector((state) => state.stageGameDownload);
    const dispatch = useDispatch();
    const realm = useRealm();
    const [loading, setLoading] = useState(true)
    const data = useUserPackage()

    useEffect(() => {
        setTimeout(()=>{
            setLoading(false)
        }, 300)
    }, []);

    const renderItem = ({item, index})=>{
        return(
            <UserPackageItem
                _id={item._id}
                packageId={item.packag._id}
                title={item.packag.title}
                image={item.packag.icon_image}
            />
        )
    }
    const memoizedValue = useMemo(() => renderItem, [data]);
    const keyExtractor = (item,index)=>index.toString()
    

    
    const ListEmptyComponent = ()=>{
        <View style={{flex:1, alignItems:'center', justifyContent:'center'}}>
            <ScreenLoading
                loading={false}
                getError={false}
                noItem={true}
                tryAgain={()=>{}}
            />
        </View>
    }
    return(
        <View style={{flex:1, backgroundColor:colors.background.a1}}>
            <GeneralHeader
                paddingHorizontal={15}
                back={true}
                height={60}
                coin={true}
                title={"بسته‌های من"}
            />
            <View style={styles.container}>
                <FlatList
                    showsVerticalScrollIndicator={false}
                    keyExtractor={keyExtractor}
                    contentContainerStyle={{alignItems:'center'}}
                    renderItem={memoizedValue}
                    data={data}
                    onEndReachedThreshold={0.5}
                    removeClippedSubviews={Platform.OS == 'ios' ? false : true}
                    style={{width:width, paddingHorizontal:15}}
                />
            </View>
            {
                loading == true&&
                <View style={{width:"100%", height:"100%", backgroundColor:colors.background.a1, alignItems:'center', justifyContent:'center', position:'absolute'}}>
                    <ScreenLoading
                        loading={true}
                        getError={false}
                        noItem={false}
                        tryAgain={()=>{}}
                    />
                </View>
            }
        </View>
    )
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
    }
});
export default UserPackagesList;