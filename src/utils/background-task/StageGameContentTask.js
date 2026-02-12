import BackgroundService from 'react-native-background-actions';
import { updateStageGameContent } from '../api/StageGameApi';

const options = {
    taskName: 'دریافت محتوا',
    taskTitle: 'در حال دریافت محتوای بازی مرحله‌ای',
    taskDesc: 'لطفاً تا پایان عملیات صبر کنید...',
    taskIcon: {
        name: 'ic_launcher', // آیکون از mipmap/ic_launcher.png
        type: 'mipmap',
    },
    color: '#40bf42',
    // parameters: {
    //     delay: 60000,
    // },
};

const veryIntensiveTask = async (taskDataArguments) => {
    const { dispatch, realm, state, versionContent } = taskDataArguments;
    try {
        await updateStageGameContent({ dispatch, realm, state, versionContent });
    } catch (e) {
        null
    }
};

export const startUpdateStageGameContentTask = async ({ dispatch, realm, state, versionContent, color }) => {
    if (!BackgroundService.isRunning()) {
        await BackgroundService.start(veryIntensiveTask, {
            ...options,
            color:color,
            parameters: { dispatch, realm, state, versionContent },
        });
    }
};

export const stopUpdateStageGameContentTask = async () => {
    if (BackgroundService.isRunning()) {
        await BackgroundService.stop();
    }
};
