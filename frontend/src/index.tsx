import React from 'react';
import ReactDOM from 'react-dom/client';
import {StyledEngineProvider} from '@mui/material/styles';
import {BrowserRouter} from "react-router-dom";
import App from './App';
import {LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import type {} from '@mui/material/themeCssVarsAugmentation';

ReactDOM.createRoot(document.querySelector("#root")!).render(
    <StyledEngineProvider injectFirst>
        <BrowserRouter>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <App/>
            </LocalizationProvider>
        </BrowserRouter>
    </StyledEngineProvider>
);
