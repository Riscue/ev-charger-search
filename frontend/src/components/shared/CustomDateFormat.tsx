import React from "react";
import {Typography} from "@mui/material";
import dayjs from "dayjs";

export default function CustomDateFormat({value, dateOnly = false}: {
    value: Date | number | undefined | null;
    dateOnly?: boolean;
}) {
    if (value === undefined || value === null) {
        return null
    }

    function getFormat(): string {
        return dateOnly ? 'DD MMMM YYYY' : 'DD MMMM YYYY HH:mm';
    }

    function formatDate(time: number | Date): string {
        if (typeof time === 'number') {
            if (isNaN(time) || time === 0) {
                return ''
            } else {
                return dayjs(time).format(getFormat());
            }
        } else {
            return dayjs(time).format(getFormat());
        }
    }

    return <Typography component="span">{formatDate(value)}</Typography>
}

