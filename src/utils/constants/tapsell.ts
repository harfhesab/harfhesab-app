export const tapsell = {
    position:{
        get_free_coin:{
            zone_id : "69edfa8d6e643f52b818436d",
        },
        stage_game_completed_word:{
            zone_id : "6a1e0d3b0277c864bb892a2a",
        },
        stage_game_completed_stage:{
            zone_id : "6a1e0d730277c864bb892a2b",
        },
        package_game_completed_word:{
            zone_id : "6a1e0dea62158d268e955ee2",
        },
        package_game_completed_stage:{
            zone_id : "6a1e0e0962158d268e955ee3",
        },
        kalam_akhar_challenge:{
            zone_id : "6a73d8bca2648a6350550e9a",
        }
    }
}
export type AdsPosition = keyof typeof tapsell.position;