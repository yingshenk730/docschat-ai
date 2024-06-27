import { AuthContext } from './authContext.jsx'
import { useContext } from 'react'

export const useAuth = () => {
  return useContext(AuthContext)
}