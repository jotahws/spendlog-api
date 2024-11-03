export const formatNumber = (value: string): number | undefined => {
    const num = Number(value);
    return isNaN(num) ? undefined : num;
};

export const formatDate = (dateString: string): Date => {
    const regex = /^\d{8}$/;
    if (!regex.test(dateString)) {
        return new Date();
    }

    const year = Number(dateString.slice(0, 4));
    const month = Number(dateString.slice(4, 6)) - 1;
    const day = Number(dateString.slice(6, 8));

    const date = new Date(year, month, day);
    if (
        date.getFullYear() !== year ||
        date.getMonth() !== month ||
        date.getDate() !== day
    ) {
        return new Date();
    }

    return date;
};
