import { createContext, useEffect, useState } from 'react'
import PropTypes from 'prop-types'

export const AuthContext = createContext({
  user: null,
  logout: () => {},
})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({
    sub: '',
    email: '',
    name: '',
    picture: '',
  })

  useEffect(() => {
    const getUser = async () => {
      const token = localStorage.getItem('id_token')
      if (!token) {
        setUser({
          sub: '',
          email: '',
          name: '',
          picture: '',
        })
        return
      }
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/token`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        const data = await response.json()
        console.log('Data in authpage:', data)
        if (data.token) {
          setUser({
            sub: data.token.sub,
            email: data.token.email,
            name: data.token.name,
            picture: data.token.picture,
          })
        } else {
          localStorage.removeItem('id_token')
          setUser({
            sub: '',
            email: '',
            name: '',
            picture: '',
          })
        }
      } catch (e) {
        throw new Error(e)
      }
    }
    getUser()
  }, [])

  const logout = () => {
    localStorage.removeItem('id_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
}
