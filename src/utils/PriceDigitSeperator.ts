export function priceDigitSeperator(
    price: string | number = '',
    round: boolean = true,
): string {
    if (price === '' || price === null || price === undefined) {
      return '';
    }

    const numericPrice = Number(price);

    if (isNaN(numericPrice)) {
      return '';
    }

    const finalPrice = round ? Math.floor(numericPrice) : numericPrice;

    return finalPrice
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
