import React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import AppTheme from './theme/AppTheme';
import {Route, Routes} from "react-router-dom";
import Box from "@mui/material/Box";
import PageHome from "./page/PageHome";
import ScrollTopOnNavigation from "./hooks/scroll-top-on-navigation";

export default function App(props: { disableCustomTheme?: boolean }) {
    return (
        <AppTheme {...props}>
            <CssBaseline enableColorScheme/>
            <ScrollTopOnNavigation/>

            <Routes>
                <Route path="/" element={<PageHome key="home"/>}/>
                <Route path="/s/:shortId" element={<PageHome key="search"/>}/>
            </Routes>
            <Box sx={{mt: 6}}/>
        </AppTheme>
    );
}
