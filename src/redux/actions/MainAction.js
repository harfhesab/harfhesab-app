import {
  HIDE_SPLASH,
  LOGIN_OPERATION,
} from '../types/MainType';

export const hideSplash = () => {
  return{
    type : HIDE_SPLASH
  }
}
export const loginOperation = (data) => {
  return{
    type : LOGIN_OPERATION,
    payload : data
  }
}
