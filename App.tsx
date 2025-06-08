import React from 'react';
import { Provider } from "react-redux";
import { store, persistor } from './src/redux/store/Store';
import { PersistGate } from 'redux-persist/integration/react';
import Main from './src/main/Main';
import {I18nManager } from 'react-native';
import Splash from './src/components/splash/Splash'

function App(): React.JSX.Element {
  I18nManager.forceRTL(true)
  return (
    <Provider store={store}> 
      <PersistGate loading={<Splash/>} persistor={persistor}>
        <Main/>
      </PersistGate>
    </Provider>
  );
}

export default App;