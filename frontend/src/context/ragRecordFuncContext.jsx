import { createContext, useState } from 'react'
import PropTypes from 'prop-types'
import { useAuth } from './useAuth'
export const RagRecordFuncContext = createContext({
  ragRecords: [],
  getRagHistory: () => {},
})

export const RagRecordFuncProvider = ({ children }) => {
  const [ragRecords, setRagRecords] = useState([])
  const { user } = useAuth()
  // console.log('User in ragRecordFuncProvider:', user)
  const getRagHistory = async () => {
    if (user.sub === '') return
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/${user.sub}/rag-history`
    )
    const data = await response.json()
    setRagRecords(data)
  }

  return (
    <RagRecordFuncContext.Provider value={{ ragRecords, getRagHistory }}>
      {children}
    </RagRecordFuncContext.Provider>
  )
}

RagRecordFuncProvider.propTypes = {
  children: PropTypes.node.isRequired,
}
