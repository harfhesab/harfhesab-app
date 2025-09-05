import SoundPlayer from "./SoundPlayer";


export const tabScreenSoundInOnClick = async (volume=0.8) => {
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

// ===================================================================================================================
// ============================= Word To Slot ========================================================================
// ===================================================================================================================

export const onStartDragWordToSlotCardSound = async (volume=0.8) => {
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

export const dropWordToSlotCardInFloatingSound = async (volume=1) => {
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

export const dropWordToSlotCardInSlotSound = async (volume=1) => {
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

export const successfulCompletionOfStageSound = async (volume=1) => {
    try {
        const player = await SoundPlayer.create('success_1.wav', false, false, volume);
        const player2 = await SoundPlayer.create('coins.wav', false, false, volume);
        player.play((success) => {
            if (success) {
                player.release();
                player2.play((success) => {
                    if (success) {
                        player2.release();
                        
                    }
                });
            }
        });
    } catch (e) {
        null
    }
};

export const typingSentenceSucccessSound = async (volume=1) => {
    try {
        const player = await SoundPlayer.create('connected_1.wav', false, false, volume);
        player.play((success) => {
            if (success) {
                player.release();
            }
        });
    } catch (e) {
        null
    }
};

export const typingSentenceErrorSound = async (volume=1) => {
    try {
        const player = await SoundPlayer.create('connected_2.wav', false, false, volume);
        player.play((success) => {
            if (success) {
                player.release();
            }
        });
    } catch (e) {
        null
    }
};

// ===================================================================================================================
// ============================== Connecting Letter ==================================================================
// ===================================================================================================================

export const connectingLetterSucccessSound = async (volume=1) => {
    try {
        const player = await SoundPlayer.create('connected_1.wav', false, false, volume);
        player.play((success) => {
            if (success) {
                player.release();
            }
        });
    } catch (e) {
        null
    }
};

export const connectingLetterDuplicateSound = async (volume=1) => {
    try {
        const player = await SoundPlayer.create('notification.wav', false, false, volume);
        player.play((success) => {
            if (success) {
                player.release();
            }
        });
    } catch (e) {
        null
    }
};

export const connectingLetterErrorSound = async (volume=1) => {
    try {
        const player = await SoundPlayer.create('connected_2.wav', false, false, volume);
        player.play((success) => {
            if (success) {
                player.release();
            }
        });
    } catch (e) {
        null
    }
};

export const selectCardSoundInLettersConnecting = async (volume=1) => {
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

export const deselectCardSoundInLettersConnecting = async (volume=0.8) => {
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

export const successfulCompletionOfConnectingLetterSound = async (volume=1) => {
    try {
        const player = await SoundPlayer.create('success_1.wav', false, false, volume);
        const player2 = await SoundPlayer.create('coins.wav', false, false, volume);
        player.play((success) => {
            if (success) {
                player.release();
                player2.play((success) => {
                    if (success) {
                        player2.release();
                        
                    }
                });
            }
        });
    } catch (e) {
        null
    }
};

// ===================================================================================================================
// ============================= Coin Sound ==========================================================================
// ===================================================================================================================
export const coinCountUpdateSound = async (volume=0.4) => {
    try {
        const player = await SoundPlayer.create('coin.wav', false, false, volume);
        player.play((success) => {
            if (success) {
                player.release();
            }
        });
    } catch (e) {
        null
    }
};