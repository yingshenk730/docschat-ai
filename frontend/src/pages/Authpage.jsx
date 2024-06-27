import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

const Authpage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const id_token = searchParams.get('token')
  useEffect(() => {
    if (id_token) {
      localStorage.setItem('id_token', id_token)
      navigate('/dashboard')
    }
  }, [navigate, id_token])

  return <div className="text-black">Authpage</div>
}

export default Authpage
