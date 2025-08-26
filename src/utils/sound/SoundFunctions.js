import SoundPlayer from "./SoundPlayer";


export const tabScreenSoundInOnClisk = async (volume=0.8) => {
    try {
        const player = await SoundPlayer.create('tab.wav', false, false, volume);
        player.play((success) => {
            if (success) {
                player.release();
            }
        });
    } catch (e) {
        null
    }
};

export const onStartDragWordToSlotCard = async (volume=0.8) => {
    try {
        const player = await SoundPlayer.create('pop.wav', false, false, volume);
        player.play((success) => {
            if (success) {
                player.release();
            }
        });
    } catch (e) {
        null
    }
};

export const onDropWordToSlotCardInFloating = async (volume=0.8) => {
    try {
        const player = await SoundPlayer.create('btn.wav', false, false, volume);
        player.play((success) => {
            if (success) {
                player.release();
            }
        });
    } catch (e) {
        null
    }
};

export const onDropWordToSlotCardInSlot = async (volume=0.8) => {
    try {
        const player = await SoundPlayer.create('click.wav', false, false, volume);
        player.play((success) => {
            if (success) {
                player.release();
            }
        });
    } catch (e) {
        null
    }
};