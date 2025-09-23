import BackgroundService from 'react-native-background-actions';
import { updateStageGameContent } from '../api/StageGameApi';

const options = {
    taskName: 'دریافت محتوا',
    taskTitle: 'در حال دریافت محتوای بستهٔ بازی',
    taskDesc: 'لطفاً تا پایان عملیات صبر کنید...',
    taskIcon: {
        name: 'ic_launcher', // آیکون از mipmap/ic_launcher.png
        type: 'mipmap',
    },
    parameters: {
        delay: 60000,
    },
};

const veryIntensiveTask = async (taskDataArguments) => {
    const { dispatch, realm, package, status } = taskDataArguments;
    try {
        await setPackageGameForUser({ dispatch, realm, package, status });
    } catch (e) {
        null
    }
};

export const startSetPackageGameForUser = async ({ dispatch, realm, package, status, color }) => {
    if (!BackgroundService.isRunning()) {
        await BackgroundService.start(veryIntensiveTask, {
            ...options,
            color:color,
            parameters: { dispatch, realm, package, status },
        });
    }
};

export const stopSetPackageGameForUser = async () => {
    if (BackgroundService.isRunning()) {
        await BackgroundService.stop();
    }
};
