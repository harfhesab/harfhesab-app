import React, { memo, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Dimensions, Image, ImageBackground } from 'react-native';
import Icon from '../../utils/Icon';
import Font from '../../utils/Font';
import useAppTheme from '../../hooks/theme/useAppTheme';
import Switch from '../Switch';

const width = Dimensions.get('window').width;

function SwitchItem({
  click,
  value: externalValue = false,
  title,
  title_color = "#ffc107",
  icon_name,
  icon_type,
  image_icon,
  image_width = 25,
  image_height = 25,
  icon_size = 25,
  icon_color = "#ffc107",
  disabled = false,
}) {
  const colors = useAppTheme();
  const [value, setValue] = useState(externalValue);

  const onToggle = useCallback((newVal) => {
    setValue(newVal);
    click?.(newVal);
  }, [click]);

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={disabled}
      onPress={() => onToggle(!value)}
    >
      <ImageBackground
        source={require("../../assets/image/simple_list_item.png")}
        style={{ width: width - 55, height: 70 }}
        imageStyle={{ resizeMode: "stretch" }}
        resizeMode="stretch"
      >
        <View
          style={{
            height: 70,
            width: "100%",
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 10,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <ImageBackground
              source={require("../../assets/image/circle_button.png")}
              style={{ width: 50, height: 50, alignItems: 'center', justifyContent: 'center', paddingBottom: 3 }}
              imageStyle={{ resizeMode: "stretch" }}
              resizeMode="stretch"
            >
              {icon_name && icon_type && (
                <Icon name={icon_name} type={icon_type} style={{ color: icon_color, fontSize: icon_size }} />
              )}
              {image_icon && <Image style={{ height: image_height, width: image_width }} source={image_icon} />}
              {value == false&&<Icon name={"block"} type={"MaterialIcons"} style={{ color: "#ff0000", fontSize: 35, position:'absolute',paddingBottom: 3 }} />}
            </ImageBackground>
            <Text style={{ fontSize: 15, color: title_color, fontFamily: Font.black }}>{title}</Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
            <Switch
              click={onToggle}
              width={80}
              value={value}
            />
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
}

export default memo(SwitchItem);
