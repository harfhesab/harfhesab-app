import React from 'react';
import { Provider } from "react-redux";
import { store, persistor } from './src/redux/store/Store';
import { PersistGate } from 'redux-persist/integration/react';
import Main from './src/main/Main';
import { RealmProviderWrapper } from './src/realm/RealmProviderWrapper';
import axios from 'axios';
import Globals from './src/utils/Globals';
import { SkiaFontProvider } from './src/context/SkiaFontProvider';
import { ProvidersLoader } from './src/components/loader/ProvidersLoader';


axios.defaults.baseURL = Globals.baseURL;
axios.defaults.headers.post['Accept'] = 'application/json';
axios.defaults.headers.post['client'] = 'user';
function App(): React.JSX.Element {
  
  return (
    <RealmProviderWrapper>
      <Provider store={store}> 
        <PersistGate loading={<ProvidersLoader />} persistor={persistor}>
          <SkiaFontProvider>
            <Main/>
          </SkiaFontProvider>
        </PersistGate>
      </Provider>
    </RealmProviderWrapper>
  );
}

export default App;