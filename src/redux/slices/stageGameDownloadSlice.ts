import { createSlice, PayloadAction } from '@reduxjs/toolkit';


interface StageGameDownloadState {
    status: string; // up-to-date | need-update | force-update
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

const initialState: StageGameDownloadState = {
    status: "", // up-to-date | need-update | force-update
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

const stageGameDownloadSlice = createSlice({
    name: 'stageGameDownloadSlice',
    initialState,
    reducers: {
        setStatus: (state, action: PayloadAction<{ status: string; }>) =>{
            state.status = action.payload.status
        },
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
            state.status = "";
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
  setStatus,
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
} = stageGameDownloadSlice.actions;
export default stageGameDownloadSlice.reducer;