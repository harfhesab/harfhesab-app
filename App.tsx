import React from 'react';
import { Provider } from "react-redux";
import { store, persistor } from './src/redux/store/Store';
import { PersistGate } from 'redux-persist/integration/react';
import Main from './src/main/Main';
// import {I18nManager } from 'react-native';
import { RealmProviderWrapper } from './src/realm/RealmProviderWrapper';
import PersistGateLoader from './src/components/loader/PersistGateLoader';
import axios from 'axios';
import Globals from './src/utils/Globals';


// I18nManager.forceRTL(true)

axios.defaults.baseURL = Globals.baseURL;
axios.defaults.headers.post['Accept'] = 'application/json';
axios.defaults.headers.post['client'] = 'user';
function App(): React.JSX.Element {
  
  return (
    <RealmProviderWrapper>
      <Provider store={store}> 
        <PersistGate loading={<PersistGateLoader/>} persistor={persistor}>
          <Main/>
        </PersistGate>
      </Provider>
    </RealmProviderWrapper>
  );
}

export default App;