import {alpha, Components, Theme} from '@mui/material/styles';
import {svgIconClasses} from '@mui/material/SvgIcon';
import {typographyClasses} from '@mui/material/Typography';
import {buttonBaseClasses} from '@mui/material/ButtonBase';
import {chipClasses} from '@mui/material/Chip';
import {iconButtonClasses} from '@mui/material/IconButton';
import {brand, gray, green, orange, red} from '../themePrimitives';

export const dataDisplayCustomizations: Components<Theme> = {
    MuiTypography: {
        styleOverrides: {
            root: ({theme}) => ({
                variants: [
                    {
                        props: {
                            variant: "hisse",
                        },
                        style: {
                            color: (theme.vars || theme).palette.text.primary,
                            fontWeight: 500,
                            position: 'relative',
                            textDecoration: 'none',
                            width: 'fit-content',
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                width: '100%',
                                height: '1px',
                                bottom: 0,
                                left: 0,
                                backgroundColor: (theme.vars || theme).palette.text.secondary,
                                opacity: 0.3,
                                transition: 'width 0.3s ease, opacity 0.3s ease',
                            },
                            '&:hover::before': {
                                width: 0,
                            },
                            '&:focus-visible': {
                                outline: `3px solid ${alpha(brand[500], 0.5)}`,
                                outlineOffset: '4px',
                                borderRadius: '2px',
                            },
                        },
                    },
                    {
                        props: {
                            variant: "navlink",
                        },
                        style: {
                            minWidth: "2rem",
                            height: '2.25rem',
                            padding: '8px 12px',
                            color: (theme.vars || theme).palette.text.primary,
                            fontWeight: 500,
                            position: 'relative',
                            textDecoration: 'none',
                            width: 'fit-content',
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                width: '100%',
                                height: '1px',
                                bottom: 0,
                                left: 0,
                                backgroundColor: (theme.vars || theme).palette.text.secondary,
                                opacity: 0.3,
                                transition: 'width 0.3s ease, opacity 0.3s ease',
                            },
                            '&:hover::before': {
                                width: 0,
                            },
                            '&:focus-visible': {
                                outline: `3px solid ${alpha(brand[500], 0.5)}`,
                                outlineOffset: '4px',
                                borderRadius: '2px',
                            },
                        },
                    },
                    {
                        props: {
                            variant: "navlink",
                            className: "active",
                        },
                        style: {
                            '&::before': {
                                height: '3px',
                                opacity: 0.8,
                            },
                            '&:hover::before': {
                                width: '100%',
                            },
                        }
                    },
                    {
                        props: {
                            variant: "navlink",
                            className: "admin",
                        },
                        style: {
                            '&::before': {
                                height: '2px',
                                backgroundColor: orange[400],
                            },
                        }
                    },
                    {
                        props: {color: 'zarar'},
                        style: {
                            fontWeight: 'bold',
                            color: 'red',
                            ...theme.applyStyles('dark', {
                                fontWeight: 'bold',
                                color: 'red',
                            }),
                        },
                    },
                    {
                        props: {color: 'kar'},
                        style: {
                            fontWeight: 'bold',
                            color: 'green',
                            ...theme.applyStyles('dark', {
                                fontWeight: 'bold',
                                color: 'green',
                            }),
                        },
                    },
                ]
            })
        }
    },
    MuiList: {
        styleOverrides: {
            root: {
                padding: '8px',
                display: 'flex',
                flexDirection: 'column',
                gap: 0,
            },
        },
    },
    MuiListItem: {
        styleOverrides: {
            root: ({theme}) => ({
                [`& .${svgIconClasses.root}`]: {
                    width: '1rem',
                    height: '1rem',
                    color: (theme.vars || theme).palette.text.secondary,
                },
                [`& .${typographyClasses.root}`]: {
                    fontWeight: 500,
                },
                [`& .${buttonBaseClasses.root}`]: {
                    display: 'flex',
                    gap: 8,
                    padding: '2px 8px',
                    borderRadius: (theme.vars || theme).shape.borderRadius,
                    opacity: 0.7,
                    '&.Mui-selected': {
                        opacity: 1,
                        backgroundColor: alpha(theme.palette.action.selected, 0.3),
                        [`& .${svgIconClasses.root}`]: {
                            color: (theme.vars || theme).palette.text.primary,
                        },
                        '&:focus-visible': {
                            backgroundColor: alpha(theme.palette.action.selected, 0.3),
                        },
                        '&:hover': {
                            backgroundColor: alpha(theme.palette.action.selected, 0.5),
                        },
                    },
                    '&:focus-visible': {
                        backgroundColor: 'transparent',
                    },
                },
            }),
        },
    },
    MuiListItemText: {
        styleOverrides: {
            primary: ({theme}) => ({
                fontSize: theme.typography.body2.fontSize,
                fontWeight: 500,
                lineHeight: theme.typography.body2.lineHeight,
            }),
            secondary: ({theme}) => ({
                fontSize: theme.typography.caption.fontSize,
                lineHeight: theme.typography.caption.lineHeight,
            }),
        },
    },
    MuiListSubheader: {
        styleOverrides: {
            root: ({theme}) => ({
                backgroundColor: 'transparent',
                padding: '4px 8px',
                fontSize: theme.typography.caption.fontSize,
                fontWeight: 500,
                lineHeight: theme.typography.caption.lineHeight,
            }),
        },
    },
    MuiListItemIcon: {
        styleOverrides: {
            root: {
                minWidth: 0,
            },
        },
    },
    MuiChip: {
        defaultProps: {
            size: 'small',
        },
        styleOverrides: {
            root: ({theme}) => ({
                border: '1px solid',
                borderRadius: '999px',
                [`& .${chipClasses.label}`]: {
                    fontWeight: 600,
                },
                variants: [
                    {
                        props: {
                            color: 'default',
                        },
                        style: {
                            borderColor: gray[200],
                            backgroundColor: gray[100],
                            [`& .${chipClasses.label}`]: {
                                color: gray[500],
                            },
                            [`& .${chipClasses.icon}`]: {
                                color: gray[500],
                            },
                            ...theme.applyStyles('dark', {
                                borderColor: gray[700],
                                backgroundColor: gray[800],
                                [`& .${chipClasses.label}`]: {
                                    color: gray[300],
                                },
                                [`& .${chipClasses.icon}`]: {
                                    color: gray[300],
                                },
                            }),
                        },
                    },
                    {
                        props: {
                            color: 'success',
                        },
                        style: {
                            borderColor: green[200],
                            backgroundColor: green[50],
                            [`& .${chipClasses.label}`]: {
                                color: green[500],
                            },
                            [`& .${chipClasses.icon}`]: {
                                color: green[500],
                            },
                            ...theme.applyStyles('dark', {
                                borderColor: green[800],
                                backgroundColor: green[900],
                                [`& .${chipClasses.label}`]: {
                                    color: green[300],
                                },
                                [`& .${chipClasses.icon}`]: {
                                    color: green[300],
                                },
                            }),
                        },
                    },
                    {
                        props: {
                            color: 'error',
                        },
                        style: {
                            borderColor: red[100],
                            backgroundColor: red[50],
                            [`& .${chipClasses.label}`]: {
                                color: red[500],
                            },
                            [`& .${chipClasses.icon}`]: {
                                color: red[500],
                            },
                            ...theme.applyStyles('dark', {
                                borderColor: red[800],
                                backgroundColor: red[900],
                                [`& .${chipClasses.label}`]: {
                                    color: red[200],
                                },
                                [`& .${chipClasses.icon}`]: {
                                    color: red[300],
                                },
                            }),
                        },
                    },
                    {
                        props: {size: 'small'},
                        style: {
                            maxHeight: 20,
                            [`& .${chipClasses.label}`]: {
                                fontSize: theme.typography.caption.fontSize,
                            },
                            [`& .${svgIconClasses.root}`]: {
                                fontSize: theme.typography.caption.fontSize,
                            },
                        },
                    },
                    {
                        props: {size: 'medium'},
                        style: {
                            [`& .${chipClasses.label}`]: {
                                fontSize: theme.typography.caption.fontSize,
                            },
                        },
                    },
                ],
            }),
        },
    },
    MuiToolbar: {
        styleOverrides: {
            root: ({theme}) => ({
                backgroundColor: 'var(--template-palette-background-default)'
            })
        }
    },
    MuiTable: {
        styleOverrides: {
            root: ({theme}) => ({
                backgroundColor: 'var(--template-palette-background-default)'
            })
        }
    },
    MuiTableRow: {
        styleOverrides: {
            root: ({theme}) => ({
                height: 30,
            })
        }
    },
    MuiTableCell: {
        styleOverrides: {
            root: ({theme}) => ({
                variants: [
                    {
                        style: {
                            borderColor: gray[200],
                            ...theme.applyStyles('dark', {
                                borderColor: gray[700],
                            }),
                        },
                    },
                ]
            })
        }
    },
    MuiTablePagination: {
        styleOverrides: {
            root: ({theme}) => ({
                backgroundColor: 'var(--template-palette-background-default)'
            }),
            actions: {
                display: 'flex',
                gap: 8,
                marginRight: 6,
                [`& .${iconButtonClasses.root}`]: {
                    minWidth: 0,
                    width: 36,
                    height: 36,
                },
            },
        },
    },
    MuiIcon: {
        defaultProps: {
            fontSize: 'small',
        },
        styleOverrides: {
            root: {
                variants: [
                    {
                        props: {
                            fontSize: 'small',
                        },
                        style: {
                            fontSize: '1rem',
                        },
                    },
                ],
            },
        },
    },
};
