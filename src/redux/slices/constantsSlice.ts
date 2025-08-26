import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ConstantsState {
    constans_version : number;
    coins_for_word_to_slot_help_stage_game : number;
    coins_for_word_to_slot_help_package_game : number;
    coins_for_letter_connecting_help_stage_game : number;
    coins_for_letter_connecting_help_package_game : number;
    coins_received_from_displaying_video_ads_current_stage : number;
    coins_received_from_displaying_video_ads_previous_stage : number;
    
}

const initialState: ConstantsState = {
    constans_version : 1,
    coins_for_word_to_slot_help_stage_game : 30,
    coins_for_word_to_slot_help_package_game : 30,
    coins_for_letter_connecting_help_stage_game : 20,
    coins_for_letter_connecting_help_package_game : 20,
    coins_received_from_displaying_video_ads_current_stage : 12,
    coins_received_from_displaying_video_ads_previous_stage : 7,
};

const constantsSlice = createSlice({
  name: 'constants',
  initialState,
  reducers: {
    updateConstansVersion(
      state,
      action: PayloadAction<ConstantsState>
    ) {
      state.constans_version = action.payload.constans_version;
      state.coins_for_word_to_slot_help_stage_game = action.payload.coins_for_word_to_slot_help_stage_game;
      state.coins_for_word_to_slot_help_package_game = action.payload.coins_for_word_to_slot_help_package_game;
      state.coins_for_letter_connecting_help_stage_game = action.payload.coins_for_letter_connecting_help_stage_game;
      state.coins_for_letter_connecting_help_package_game = action.payload.coins_for_letter_connecting_help_package_game;
      state.coins_received_from_displaying_video_ads_current_stage = action.payload.coins_received_from_displaying_video_ads_current_stage;
      state.coins_received_from_displaying_video_ads_previous_stage = action.payload.coins_received_from_displaying_video_ads_previous_stage;
    },
  },
});

export const { updateConstansVersion} = constantsSlice.actions;

export default constantsSlice.reducer;