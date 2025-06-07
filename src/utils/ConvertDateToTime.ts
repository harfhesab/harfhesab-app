export function convertDateToTime(
    history: Date = new Date,
  ): string {
    if (history) {
        let a1 = new Date(history).getHours()
        let a2 = a1<10?`0${a1}`:a1
        let a3 = new Date(history).getMinutes()
        let a4 = a3<10?`0${a3}`:a3
        return(
            `${a2}:${a4}`
        )        
    }
    return '';
}