import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { app_router } from './routes/router';
import { F_Init_Theme } from './utils/theme_utils';
import { F_Error_Boundary } from './components/atoms/error_boundary';

// Initialize theme on app load
F_Init_Theme();

function App() {
    return (
        <F_Error_Boundary>
            <RouterProvider router={app_router} />
        </F_Error_Boundary>
    );
}

export default App;
