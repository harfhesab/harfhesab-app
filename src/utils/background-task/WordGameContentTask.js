import BackgroundService from 'react-native-background-actions';
import { updateWordGameContent } from '../api/WordGameApi';

const options = {
    taskName: 'دریافت محتوا',
    taskTitle: 'در حال دریافت محتوای بازی خان کلمات',
    taskDesc: 'لطفاً تا پایان عملیات صبر کنید...',
    taskIcon: {
        name: 'ic_launcher',
        type: 'mipmap',
    },
    color: '#40bf42',
    foregroundServiceType: ['dataSync'],
};

const veryIntensiveTask = async (taskDataArguments) => {
    const { dispatch, realm, state, versionContent } = taskDataArguments;
    try {
        await updateWordGameContent({ dispatch, realm, state, versionContent });
    } catch (e) {
        null
    }
};

export const startUpdateWordGameContentTask = async ({ dispatch, realm, state, versionContent, color }) => {
    if (!BackgroundService.isRunning()) {
        await BackgroundService.start(veryIntensiveTask, {
            ...options,
            color:color,
            parameters: { dispatch, realm, state, versionContent },
        });
    }
};

export const stopUpdateWordGameContentTask = async () => {
    if (BackgroundService.isRunning()) {
        await BackgroundService.stop();
    }
};
