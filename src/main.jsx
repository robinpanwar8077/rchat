import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './Contexts/AuthContext.jsx'
import { ChoosenUserProvider } from './Contexts/ChooesUser.jsx'

import { BrowserRouter } from 'react-router-dom'
import { ChatProvider } from './Contexts/Chatauth.jsx'
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
  <AuthProvider>
  <ChatProvider>
  <ChoosenUserProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter></ChoosenUserProvider>
    </ChatProvider>
  </AuthProvider>
</React.StrictMode>,
)
