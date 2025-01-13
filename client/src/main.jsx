import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from "react-router-dom"; // Импортируем Router
import { ChakraProvider } from '@chakra-ui/react';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ChakraProvider>
            <Router>
                <App />
            </Router>
        </ChakraProvider>
    </React.StrictMode>
);