import React from 'react';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Zocial from 'react-native-vector-icons/Zocial';
import Entypo from 'react-native-vector-icons/Entypo';
import Fontisto from 'react-native-vector-icons/Fontisto';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AntDesign from 'react-native-vector-icons/AntDesign';
import OcticonIcon from 'react-native-vector-icons/Octicons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import Foundation from 'react-native-vector-icons/Foundation';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const getIcon = type => {
  switch (type) {
    case 'Fontisto':
      return Fontisto;
    case 'MaterialIcons':
      return MaterialIcons;
    case 'EvilIcons':
      return EvilIcons;
    case 'Feather':
      return Feather;
    case 'AntDesign':
      return AntDesign;
    case 'SimpleLineIcons':
      return SimpleLineIcons;
    case 'Zocial':
      return Zocial;
    case 'Foundation':
      return Foundation;
    case 'FontAwesome5':
      return FontAwesome5;
    case 'FontAwesome6':
        return FontAwesome6;
    case 'FontAwesome':
      return FontAwesome;
    case 'Ionicons':
      return Ionicons;
    case 'MaterialCommunityIcons':
      return MaterialCommunityIcons;
    case 'Entypo':
      return Entypo;
    case 'octicon':
      return OcticonIcon;
    default:
      return FontAwesome;
  }
};

const Icon = ({
  type,
  ...props
}) => {
  const FontIcon = getIcon(type);
  return <FontIcon { ...props}/>;
};
export default Icon;