import { RagRecordFuncContext } from './ragRecordFuncContext'
import { useContext } from 'react'

export const useRAG = () => {
  return useContext(RagRecordFuncContext)
}