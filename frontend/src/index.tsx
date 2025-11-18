import React from 'react';
import ReactDOM from 'react-dom/client';
import {StyledEngineProvider} from '@mui/material/styles';
import {BrowserRouter} from "react-router-dom";
import App from './App';
import type {} from '@mui/material/themeCssVarsAugmentation';

ReactDOM.createRoot(document.querySelector("#root")!).render(
    <StyledEngineProvider injectFirst>
        <BrowserRouter>
            <App/>
        </BrowserRouter>
    </StyledEngineProvider>
);
