// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from '@/App'
import { Provider } from 'react-redux'
import { store } from '@/store/Store'
import { AuthProvider } from '@/Context/AuthProvider'
import { ThemeProvider } from "@/Context/ThemeContext";
import { GoogleOAuthProvider } from "@react-oauth/google";

createRoot(document.getElementById('root')!).render(
  // <StrictMode>
  <ThemeProvider>
    <AuthProvider>
      <Provider store={store}>
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
          <App />
        </GoogleOAuthProvider>
      </Provider>
    </AuthProvider>
  </ThemeProvider>
  // </StrictMode>
)