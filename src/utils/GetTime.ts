export function getTime(
    history: Date = new Date,
  ): string {
    if (history) {
        const h = new Date(history).getHours()
        const hours = h < 10?`0${h}`:h
        const m = new Date(history).getMinutes()
        const minutes = m < 10?`0${m}`:m
        const s = new Date(history).getSeconds()
        const seconds = s < 10?`0${s}`:s
        return `${hours}:${minutes}:${seconds}`
    }
    return '';
}