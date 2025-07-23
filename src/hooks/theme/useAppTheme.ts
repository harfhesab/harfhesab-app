// useAppTheme.ts
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store/RootReducer';
import themes, { ThemeColors, ThemeKey } from './colors';

const useAppTheme = (): ThemeColors => {
  const theme = useSelector((state: RootState) => state.ui.theme) as ThemeKey;
  return themes[theme].colors as typeof themes.t1.colors;
};

export default useAppTheme;