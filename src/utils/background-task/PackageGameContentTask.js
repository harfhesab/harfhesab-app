import BackgroundService from 'react-native-background-actions';
import { recreatePackageGameForUser, setPackageGameForUser, updatePackageGameContent } from '../api/PackageGameApi';

const options = {
    taskName: 'دریافت محتوا',
    taskTitle: 'در حال دریافت محتوای بستهٔ بازی',
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

const veryIntensiveTask1 = async (taskDataArguments) => {
    const { dispatch, realm, packageId, packageInfo, numberCoins, userPackageInfo, status, selectedAccessType, color } = taskDataArguments;
    try {
        await setPackageGameForUser({ dispatch, realm, packageId, packageInfo, numberCoins, userPackageInfo, status, selectedAccessType, color });
    } catch (e) {
        null
    }
};

export const startSetPackageGameForUserAndGetIt = async ({ dispatch, realm, packageId, packageInfo, numberCoins, userPackageInfo, status, selectedAccessType, color }) => {
    if (!BackgroundService.isRunning()) {
        await BackgroundService.start(veryIntensiveTask1, {
            ...options,
            color:color,
            parameters: { dispatch, realm, packageId, packageInfo, numberCoins, userPackageInfo, status, selectedAccessType, color },
        });
    }
};

// ===============================================================================================================================================
// ===============================================================================================================================================
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
// ===============================================================================================================================================
// ===============================================================================================================================================

const veryIntensiveTask3 = async (taskDataArguments) => {
    const { dispatch, realm, userPackageInfo, newVersions, packageInfo, color } = taskDataArguments;
    try {
        await updatePackageGameContent({ dispatch, realm, userPackageInfo, newVersions, packageInfo, color });
    } catch (e) {
        null
    }
};

export const startUpdatePackageGameContent = async ({ dispatch, realm, userPackageInfo, newVersions, packageInfo, color }) => {
    if (!BackgroundService.isRunning()) {
        await BackgroundService.start(veryIntensiveTask3, {
            ...options,
            color:color,
            parameters: { dispatch, realm, userPackageInfo, newVersions, packageInfo, color },
        });
    }
};

// ===============================================================================================================================================
// ===============================================================================================================================================
// ===============================================================================================================================================

export const stopSetPackageGameForUser = async () => {
    if (BackgroundService.isRunning()) {
        await BackgroundService.stop();
    }
};

