// import { useSelector } from 'react-redux';
// import { RootState } from '../../redux/store/RootReducer';
import themes, { ThemeColors, ThemeKey } from './colors';

const useAppTheme = (): ThemeColors => {
  // const theme = useSelector((state: RootState) => state.setting.theme) as ThemeKey;
  return themes.t1.colors as typeof themes.t1.colors;
};

export default useAppTheme;