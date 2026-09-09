export const tapsell = {
    position:{
        get_free_coin:{
            zone_id : "6a9d5aff08ba9232b29e4486",
        },
        stage_game_completed_word:{
            zone_id : "6a9d5b38cb937e30a520e4e3",
        },
        stage_game_completed_stage:{
            zone_id : "6a9d5b4ccb937e30a520e4e4",
        },
        package_game_completed_word:{
            zone_id : "6a9d5b6f95d0ac48db76b7c5",
        },
        package_game_completed_stage:{
            zone_id : "6a9d5b7995d0ac48db76b7c6",
        },
        harf_akhar_challenge:{
            zone_id : "6a9d5b8619ebb37f83dd3d6d",
        }
    }
}
export type AdsPosition = keyof typeof tapsell.position;