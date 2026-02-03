import { createBrowserRouter } from 'react-router-dom';

// Page imports
import { F_Home_Page } from '../pages/home/home_page';
import { F_Contact_Page } from '../pages/contact/contact_page';
import { F_Login_Page } from '../pages/login/login_page';
import { F_Collection_Page } from '../pages/collection/collection_page';
import { F_New_Product_Page } from '../pages/new_product/new_product_page';
import { F_Product_Page } from '../pages/product/product_page';
// Settings removed

export const app_router = createBrowserRouter([
    {
        path: '/',
        element: <F_Home_Page />,
    },
    {
        path: '/contact',
        element: <F_Contact_Page />,
    },
    {
        path: '/login',
        element: <F_Login_Page />,
    },
    {
        path: '/collection',
        element: <F_Collection_Page />,
    },
    {
        path: '/new-product',
        element: <F_New_Product_Page />,
    },
    {
        path: '/product/:id',
        element: <F_Product_Page />,
    },
    {
        path: '/edit-product/:id',
        element: <F_New_Product_Page />,
    },
]);
