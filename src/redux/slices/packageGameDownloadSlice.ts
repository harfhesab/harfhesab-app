import { createSlice, PayloadAction } from '@reduxjs/toolkit';


interface PackageGameDownloadState {
    progressLoading: boolean;
    packageId: string | null;
    userPackageId: string | null;
    status : string | null;
    contentSyncState : "initial-sync" | "delta-sync" | null;
    lastPackageSyncingId: string | null;
    versionCreatedPage: number;
    versionUpdatedPage: number;
    versionDeletedPage: number;
    versionCreatedDownloded: boolean;
    versionUpdatedDownloded: boolean;
    versionDeletedDownloded: boolean;
}

const initialState: PackageGameDownloadState = {
    progressLoading : false,
    packageId : null,
    userPackageId : null,
    status : null,
    contentSyncState : null,
    lastPackageSyncingId : null,
    versionCreatedPage: 1,
    versionUpdatedPage: 1,
    versionDeletedPage: 1,
    versionCreatedDownloded: false,
    versionUpdatedDownloded: false,
    versionDeletedDownloded: false,
};

const packageGameDownloadSlice = createSlice({
    name: 'packageGameDownload',
    initialState,
    reducers: {
        startProgressLoading: (state, action: PayloadAction<{ packageId: string; contentSyncState: "initial-sync" | "delta-sync" | null;}>) =>{
            state.progressLoading = true;
            state.packageId = action.payload.packageId;
            state.lastPackageSyncingId = action.payload.packageId;
            state.contentSyncState = action.payload.contentSyncState;
        },
        endProgressLoading: (state) =>{
            state.progressLoading = false;
            state.packageId = null;
        },
        setIsDownloading: (state, action: PayloadAction<{  packageId: string; userPackageId: string}>) =>{
            state.packageId = action.payload.packageId;
            state.lastPackageSyncingId = action.payload.packageId;
            state.userPackageId = action.payload.userPackageId;
            state.status = "downloading";
            state.progressLoading = true;
        },
        setIsDownloadingFailed: (state, action: PayloadAction<{packageId: string; userPackageId: string}>) =>{
            state.packageId = action.payload.packageId;
            state.userPackageId = action.payload.userPackageId;
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
            state.versionCreatedPage = 1;
            state.versionUpdatedPage = 1;
            state.versionDeletedPage = 1;
            state.status = "downloaded";
        },
        clearDownloadHistory: (state) =>{
            state.progressLoading = false;
            state.packageId = null;
            state.userPackageId = null;
            state.versionCreatedPage = 1;
            state.versionUpdatedPage = 1;
            state.versionDeletedPage = 1;
            state.status = null;
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
  startProgressLoading,
  endProgressLoading,
  setIsDownloading,
  setIsDownloadingFailed,
  setGetError,
  setVersionCreatedPage,
  setVersionUpdatedPage,
  setVersionDeletedPage,
  setDownloadEnded,
  clearDownloadHistory,
  setVersionCreatedDownloded,
  setVersionUpdatedDownloded,
  setVersionDeletedDownloded,
} = packageGameDownloadSlice.actions;
export default packageGameDownloadSlice.reducer;