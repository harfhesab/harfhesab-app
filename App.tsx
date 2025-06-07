import React from 'react';
import { Provider } from "react-redux";
import { store } from './src/redux/store/Store';
import Main from './src/main/Main';
import {I18nManager } from 'react-native';

function App(): React.JSX.Element {
  I18nManager.forceRTL(true)
  return (
    <Provider store={store}> 
      <Main/>
    </Provider>
  );
}

export default App;
