export function convertMount(
    month: string = '',
  ): string {
    if(month) {
        if(month == '1' || month == '01'){
            return 'فروردین'
        } else if(month == '2' || month == '02'){
            return 'اردیبهشت'
        } else if(month == '3' || month == '03'){
            return 'خرداد'
        } else if(month == '4' || month == '04'){
            return 'تیر'
        } else if(month == '5' || month == '05'){
            return 'مرداد'
        } else if(month == '6' || month == '06'){
            return 'شهریور'
        } else if(month == '7' || month == '07'){
            return 'مهر'
        } else if(month == '8' || month == '08'){
            return 'آبان'
        } else if(month == '9' || month == '09'){
            return 'آذر'
        } else if(month == '10'){
            return 'دی'
        } else if(month == '11'){
            return 'بهمن'
        } else if(month == '12'){
            return 'اسفند'
        }
    }
    return '';
}