import React from 'react';
import { Provider } from "react-redux";
import { store, persistor } from './src/redux/store/Store';
import { PersistGate } from 'redux-persist/integration/react';
import Main from './src/main/Main';
import {I18nManager } from 'react-native';
import { RealmProviderWrapper } from './src/realm/RealmProviderWrapper';
import Splash from './src/components/splash/Splash';


I18nManager.forceRTL(true)
function App(): React.JSX.Element {
  
  return (
    <RealmProviderWrapper>
      <Provider store={store}> 
        <PersistGate loading={<Splash/>} persistor={persistor}>
          <Main/>
        </PersistGate>
      </Provider>
    </RealmProviderWrapper>
  );
}

export default App;