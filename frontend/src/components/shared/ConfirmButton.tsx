import React, {ReactElement} from "react";
import Button from "@mui/material/Button";
import {OverridableStringUnion} from "@mui/types";
import {ButtonPropsColorOverrides} from "@mui/material/Button/Button";
import {SxProps} from "@mui/system";
import {Theme} from "@mui/material/styles";

export default function ConfirmButton({
                                          action,
                                          children = "Onayla",
                                          confirm = true,
                                          message = "Emin misiniz?",
                                          color = "inherit",
                                          sx = {},
                                      }: {
    action: Function;
    children?: (string | number | ReactElement) | (string | number | ReactElement)[];
    confirm?: boolean;
    message?: string;
    color?: OverridableStringUnion<'inherit' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning', ButtonPropsColorOverrides>;
    sx?: SxProps<Theme>;
}) {
    function handleAction() {
        if (confirm) {
            if (window.confirm(message)) {
                action();
            }
        } else {
            action();
        }
    }

    return (
        <Button
            sx={{p: 1, ...sx}}
            variant="contained"
            size="table"
            color={color || "error"}
            onClick={() => handleAction()}
        >
            {children}
        </Button>
    );
}
