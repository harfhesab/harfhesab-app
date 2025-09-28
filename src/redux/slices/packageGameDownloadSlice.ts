import { createSlice, PayloadAction } from '@reduxjs/toolkit';


interface PackageGameDownloadState {
    packageId: string | null;
    isDownloading : boolean;
    getError : boolean;
    dataCheck: any;
    versionCreatedPage: number;
    versionUpdatedPage: number;
    versionDeletedPage: number;
    versionCreatedDownloded: boolean;
    versionUpdatedDownloded: boolean;
    versionDeletedDownloded: boolean;
    downloadFinished: boolean;
    downloadFinishedDate: Date | null;
}

const initialState: PackageGameDownloadState = {
    packageId : null,
    isDownloading : false,
    getError:false,
    dataCheck:null,
    versionCreatedPage: 1,
    versionUpdatedPage: 1,
    versionDeletedPage: 1,
    versionCreatedDownloded: false,
    versionUpdatedDownloded: false,
    versionDeletedDownloded: false,
    downloadFinished : false,
    downloadFinishedDate : null
};

const packageGameDownloadSlice = createSlice({
    name: 'packageGameDownloadSlice',
    initialState,
    reducers: {
        setDataCheck: (state, action: PayloadAction<{ data: any; }>) =>{
            state.dataCheck = action.payload.data
        },
        setIsDownloading: (state) =>{
            state.isDownloading = true;
            state.getError = false;
            state.downloadFinished = false;
        },
        setGetError: (state) =>{
            state.getError = true;
            state.isDownloading = false;
        },
        setVersionCreatedPage: (state, action: PayloadAction<{ page: number; }>) =>{
            state.versionCreatedPage = action.payload.page
        },
        setVersionUpdatedPage: (state, action: PayloadAction<{ page: number; }>) =>{
            state.versionUpdatedPage = action.payload.page
        },
        setVersionDeletedPage: (state, action: PayloadAction<{ page: number; }>) =>{
            state.versionDeletedPage = action.payload.page
        },
        setDownloadFinished: (state) =>{
            state.getError = false;
            state.versionCreatedPage = 1;
            state.versionUpdatedPage = 1;
            state.versionDeletedPage = 1;
            state.versionCreatedDownloded = false;
            state.versionUpdatedDownloded = false;
            state.versionDeletedDownloded = false;
            state.downloadFinished = true;
            state.isDownloading = false;
            state.downloadFinishedDate = new Date();
        },
        setVersionCreatedDownloded: (state, action: PayloadAction<{ downloaded: boolean; }>) =>{
            state.versionCreatedDownloded = action.payload.downloaded
        },
        setVersionUpdatedDownloded: (state, action: PayloadAction<{ downloaded: boolean; }>) =>{
            state.versionUpdatedDownloded = action.payload.downloaded
        },
        setVersionDeletedDownloded: (state, action: PayloadAction<{ downloaded: boolean; }>) =>{
            state.versionDeletedDownloded = action.payload.downloaded
        },
    },
});

export const {
  setDataCheck,
  setIsDownloading,
  setGetError,
  setVersionCreatedPage,
  setVersionUpdatedPage,
  setVersionDeletedPage,
  setDownloadFinished,
  setVersionCreatedDownloded,
  setVersionUpdatedDownloded,
  setVersionDeletedDownloded,
} = packageGameDownloadSlice.actions;
export default packageGameDownloadSlice.reducer;