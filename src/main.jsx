import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { CalculatorProvider } from './context/CalculatorContext'
import { AuthProvider } from './context/AuthContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CalculatorProvider>
          <App />
        </CalculatorProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)

