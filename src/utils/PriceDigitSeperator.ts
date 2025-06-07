export function priceDigitSeperator(
  price: string = '',
  round: boolean = true,
): string {
  if (price) {
    if (round === true) {
      return Math.floor(parseFloat(price))
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  return '';
}