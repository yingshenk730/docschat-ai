
import { useAuth } from "@/context/useAuth"
import { useNavigate } from "react-router-dom"

const useAuthActions = () => {
  const navigate = useNavigate()
  const { logout } = useAuth()

  const handleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL}/login`
  }

  const handleLogout = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/logout`,
        {
          method: 'GET',
          credentials: 'include',
        }
      )
      if (response.ok) {
        logout()
        navigate('/', { replace: true })
      } else {
        console.error('Logout failed')
      }
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }
  return { handleLogin, handleLogout }
}

export default useAuthActions