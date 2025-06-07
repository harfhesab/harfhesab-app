export function convertDate(
    history: Date = new Date,
  ): string {
    if (history) {
        const ms = new Date().getTime() - new Date(history).getTime()
        if(ms <= 60000){
            const time = ms / 1000
            const fixed = Math.trunc(time)
            return(
                `${fixed} ثانیه قبل`
            )
        } else if(ms <= 3600000){
            const time = ms / 60000
            const fixed = Math.trunc(time)
            return(
                `${fixed} دقیقه قبل`
            )
        } else if(ms <= 86400000){
            const time = ms / 3600000
            const fixed = Math.trunc(time)
            return(
                `${fixed} ساعت قبل`
            )
        } else if(ms <= 2592000000){
            const time = ms / 86400000
            const fixed = Math.trunc(time)
            return(
                `${fixed} روز قبل`
            )
        } else if(ms <= 31536000000){
            const time = ms / 2592000000
            const fixed = Math.trunc(time)
            return(
                `${fixed} ماه قبل`
            )
        } else {
            const time = ms / 31536000000
            const fixed = Math.trunc(time)
            return(
                `${fixed} سال قبل`
            )
        }
    }
    return '';
}