export const NumberUtils = {
    formatMoney(i: number | undefined, decimal = 2): string {
        if (i === undefined || i === null || isNaN(i)) {
            return undefined;
        }

        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
            minimumFractionDigits: decimal,
            maximumFractionDigits: decimal
        }).format(i);
    },
}
