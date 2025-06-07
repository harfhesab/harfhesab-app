import {
    HIDE_SPLASH,
    LOGIN_OPERATION,
    CHANGE_THEME
} from '../types/MainType';

const initialState = {
    theme: "t1",
    showSplash: true,
    logined: false
}

export default function appReducer(state = initialState, action) {
    switch (action.type) {
        case HIDE_SPLASH: {
            return {
                ...state,
                showSplash: false,
            }
        }
        case LOGIN_OPERATION: {
            return {
                ...state,
                logined: action.payload
            }
        }
        case CHANGE_THEME: {
            return {
                ...state,
                theme: action.payload
            }
        }
      default:
      return state
    }
}
