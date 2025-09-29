import { createSlice, PayloadAction } from '@reduxjs/toolkit';


interface PackageGameDownloadState {
    progressLoading: boolean;
    packageId: string | null;
    userPackageId: string | null;
    status : string | null;
    dataCheck: any;
    versionCreatedPage: number;
    versionUpdatedPage: number;
    versionDeletedPage: number;
}

const initialState: PackageGameDownloadState = {
    progressLoading : false,
    packageId : null,
    userPackageId : null,
    status : null,
    dataCheck:null,
    versionCreatedPage: 1,
    versionUpdatedPage: 1,
    versionDeletedPage: 1,
};

const packageGameDownloadSlice = createSlice({
    name: 'packageGameDownload',
    initialState,
    reducers: {
        startProgressLoading: (state) =>{
            state.progressLoading = true;
        },
        endProgressLoading: (state) =>{
            state.progressLoading = false;
        },
        setIsDownloading: (state, action: PayloadAction<{ dataCheck: any; packageId: string; userPackageId: string}>) =>{
            state.packageId = action.payload.packageId;
            state.userPackageId = action.payload.userPackageId;
            state.dataCheck = action.payload.dataCheck;
            state.status = "downloading";
            state.progressLoading = true;
        },
        setIsDownloadingFailed: (state, action: PayloadAction<{ dataCheck: any; packageId: string; userPackageId: string}>) =>{
            state.packageId = action.payload.packageId;
            state.userPackageId = action.payload.userPackageId;
            state.dataCheck = action.payload.dataCheck;
            state.status = "get-error";
            state.progressLoading = false;
        },
        setGetError: (state) =>{
            state.status = "get-error";
            state.progressLoading = false;
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
        setDownloadEnded: (state) =>{
            state.progressLoading = false;
            state.packageId = null;
            state.userPackageId = null;
            state.dataCheck = null;
            state.versionCreatedPage = 1;
            state.versionUpdatedPage = 1;
            state.versionDeletedPage = 1;
            state.status = "downloaded";
        },
        clearDownloadHistory: (state) =>{
            state.progressLoading = false;
            state.packageId = null;
            state.userPackageId = null;
            state.dataCheck = null;
            state.versionCreatedPage = 1;
            state.versionUpdatedPage = 1;
            state.versionDeletedPage = 1;
            state.status = null;
        },
    },
});

export const {
  startProgressLoading,
  endProgressLoading,
  setIsDownloading,
  setIsDownloadingFailed,
  setGetError,
  setVersionCreatedPage,
  setVersionUpdatedPage,
  setVersionDeletedPage,
  setDownloadEnded,
  clearDownloadHistory
} = packageGameDownloadSlice.actions;
export default packageGameDownloadSlice.reducer;