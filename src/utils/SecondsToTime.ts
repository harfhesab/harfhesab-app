export function secondsToTime(
    time: string = '',
  ): string {
    if (time) {
        return ~~(parseInt(time) / 60) + ":" + (parseInt(time) % 60 < 10 ? "0" : "")
        + parseInt(time) % 60;
    }
    return '';
}