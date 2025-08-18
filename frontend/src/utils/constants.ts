export const ONE_SECOND = 1000;
export const ONE_MINUTE = 60 * ONE_SECOND;
export const ONE_HOUR = 60 * ONE_MINUTE;
export const ONE_DAY = 24 * ONE_HOUR;
export const ONE_WEEK = 7 * ONE_DAY;

declare module 'axios' {
    export interface AxiosRequestConfig {
        raw?: boolean;
        throw?: boolean;
    }
}

declare module '@mui/material/Typography' {
    interface TypographyPropsVariantOverrides {
        navlink: true;
    }
}

declare module '@mui/material/Button' {
    interface ButtonPropsSizeOverrides {
        table: true;
    }
}
