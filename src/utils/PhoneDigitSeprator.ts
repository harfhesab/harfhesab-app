export function phoneDigitSeperator(
    phone: string = '',
): string {
    if (phone) {
        let cleaned = ('' + phone).replace(/\D/g, '');
        let match1 = cleaned.match(/^(\d{4})(\d{1})$/);
        let match2 = cleaned.match(/^(\d{4})(\d{3})(\d{1})$/);
        let match3 = cleaned.match(/^(\d{4})(\d{3})(\d{4})$/);
        if (match1) {
            return  match1[1] + ' ' + match1[2]
        } else if(match2){
            return  match2[1] + ' ' + match2[2] + ' ' + match2[3]
        } else if(match3){
            return  match3[1] + ' ' + match3[2] + ' ' + match3[3]
        } else {
            return phone
        }
    }
    return '';
}