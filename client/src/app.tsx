import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { app_router } from './routes/router';
import { F_Init_Theme } from './utils/theme_utils';

// Initialize theme on app load
F_Init_Theme();

function App() {
    return <RouterProvider router={app_router} />;
}

export default App;
