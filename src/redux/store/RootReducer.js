import { combineReducers } from 'redux';
import mainReducer from '../redusers/MainReducer';

const rootReducer = combineReducers({
  main: mainReducer,
})
export default rootReducer;
