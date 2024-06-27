// import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './context/authContext.jsx'
import { RagRecordFuncProvider } from './context/ragRecordFuncContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  // <React.StrictMode>
  <AuthProvider>
    <RagRecordFuncProvider>
      <App />
    </RagRecordFuncProvider>
  </AuthProvider>
  // </React.StrictMode>
)
