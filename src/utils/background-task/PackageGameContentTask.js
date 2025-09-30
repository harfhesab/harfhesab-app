import BackgroundService from 'react-native-background-actions';
import { redownloadContentPackageGameForUser, setPackageGameForUser } from '../api/PackageGameApi';

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

const veryIntensiveTask1 = async (taskDataArguments) => {
    const { dispatch, realm, packageId, packageInfo, numberCoins, userPackageInfo, status, selectedAccessType } = taskDataArguments;
    try {
        await setPackageGameForUser({ dispatch, realm, packageId, packageInfo, numberCoins, userPackageInfo, status, selectedAccessType });
    } catch (e) {
        null
    }
};

export const startSetPackageGameForUserAndGetIt = async ({ dispatch, realm, packageId, packageInfo, numberCoins, userPackageInfo, status, selectedAccessType, color }) => {
    if (!BackgroundService.isRunning()) {
        await BackgroundService.start(veryIntensiveTask1, {
            ...options,
            color:color,
            parameters: { dispatch, realm, packageId, packageInfo, numberCoins, userPackageInfo, status, selectedAccessType },
        });
    }
};

// ===============================================================================================================================================

const veryIntensiveTask2 = async (taskDataArguments) => {
    const { dispatch, realm, packageId, packageInfo, userPackageInfo } = taskDataArguments;
    try {
        await recreatePackageGameForUser({ dispatch, realm, packageId, packageInfo, userPackageInfo });
    } catch (e) {
        null
    }
};

export const recreateAndDownloadContentUserPackage = async ({ dispatch, realm, packageId, packageInfo, userPackageInfo, color }) => {
    if (!BackgroundService.isRunning()) {
        await BackgroundService.start(veryIntensiveTask2, {
            ...options,
            color:color,
            parameters: { dispatch, realm, packageId, packageInfo, userPackageInfo },
        });
    }
};

// ===============================================================================================================================================

const veryIntensiveTask3 = async (taskDataArguments) => {
    const { dispatch, realm, packageId, packageInfo, userPackageInfo } = taskDataArguments;
    try {
        await redownloadContentPackageGameForUser({ dispatch, realm, packageId, packageInfo, userPackageInfo });
    } catch (e) {
        null
    }
};

export const redownloadContentUserPackage = async ({ dispatch, realm, packageId, packageInfo, userPackageInfo, color }) => {
    if (!BackgroundService.isRunning()) {
        await BackgroundService.start(veryIntensiveTask3, {
            ...options,
            color:color,
            parameters: { dispatch, realm, packageId, packageInfo, userPackageInfo },
        });
    }
};

// ===============================================================================================================================================

export const stopSetPackageGameForUser = async () => {
    if (BackgroundService.isRunning()) {
        await BackgroundService.stop();
    }
};

