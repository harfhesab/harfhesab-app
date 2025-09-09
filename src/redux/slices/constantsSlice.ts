import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ConstantsState {
    constants_version : number;
    coins_for_get_help_word_to_slot_stage_game : number;
    coins_for_get_help_word_to_slot_package_game : number;
    coins_for_get_help_letter_connecting_stage_game : number;
    coins_for_get_help_letter_connecting_package_game : number;
    coins_reward_from_play_video_ads_current_stage : number;
    coins_reward_from_play_video_ads_previous_stage : number;
    coins_reward_from_stage_completed_stage_game : number;
    coins_reward_from_season_completed_stage_game : number;
    coins_reward_from_stage_completed_package_game : number;
    coins_reward_from_season_completed_package_game : number;
}
// ==============================================================================================
// ==============================================================================================
// با هر بار تغییر ثابت ها باید آن را با سرور سینک کرده و ورژن را نیز افزایش دهیم
const initialState: ConstantsState = {
    constants_version : 1,
    coins_for_get_help_word_to_slot_stage_game : 30,
    coins_for_get_help_word_to_slot_package_game : 30,
    coins_for_get_help_letter_connecting_stage_game : 20,
    coins_for_get_help_letter_connecting_package_game : 20,
    coins_reward_from_play_video_ads_current_stage : 12,
    coins_reward_from_play_video_ads_previous_stage : 7,
    coins_reward_from_stage_completed_stage_game : 10,
    coins_reward_from_season_completed_stage_game : 20,
    coins_reward_from_stage_completed_package_game : 10,
    coins_reward_from_season_completed_package_game : 20,
};

const constantsSlice = createSlice({
  name: 'constants',
  initialState,
  reducers: {
    updateConstantsVersion(
      state,
      action: PayloadAction<ConstantsState>
    ) {
      state.constants_version = action.payload.constants_version;
      state.coins_for_get_help_word_to_slot_stage_game = action.payload.coins_for_get_help_word_to_slot_stage_game;
      state.coins_for_get_help_word_to_slot_package_game = action.payload.coins_for_get_help_word_to_slot_package_game;
      state.coins_for_get_help_letter_connecting_stage_game = action.payload.coins_for_get_help_letter_connecting_stage_game;
      state.coins_for_get_help_letter_connecting_package_game = action.payload.coins_for_get_help_letter_connecting_package_game;
      state.coins_reward_from_play_video_ads_current_stage = action.payload.coins_reward_from_play_video_ads_current_stage;
      state.coins_reward_from_play_video_ads_previous_stage = action.payload.coins_reward_from_play_video_ads_previous_stage;
      state.coins_reward_from_stage_completed_stage_game = action.payload.coins_reward_from_stage_completed_stage_game;
      state.coins_reward_from_season_completed_stage_game = action.payload.coins_reward_from_season_completed_stage_game;
      state.coins_reward_from_stage_completed_package_game = action.payload.coins_reward_from_stage_completed_package_game;
      state.coins_reward_from_season_completed_package_game = action.payload.coins_reward_from_season_completed_package_game;
    },
  },
});

export const { updateConstantsVersion} = constantsSlice.actions;

export default constantsSlice.reducer;