import { cn } from '@/lib/utils'
import { Badge } from './ui/badge'
import moment from 'moment'
import { Button } from './ui/button'
import PropTypes from 'prop-types'
import { useEffect, useState } from 'react'
import { BeatLoader } from 'react-spinners'
import ReactMarkdown from 'react-markdown'
import Expander from './Expander'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useRAG } from '@/context/useRAG'

const RagRecord = ({ record, index }) => {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [question, setQuestion] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [docs, setDocs] = useState([])
  const [answer, setAnswer] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const { getRagHistory } = useRAG()
  const handleQA = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setAnswer('')

    const websocket = new WebSocket(
      `${import.meta.env.VITE_API_WEBSOCKET_BASE_URL}/async_chat/${
        record.collection_name
      }`
    )
    websocket.onopen = () => {
      websocket.send(question)
    }
    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.event_type == 'on_retriever_end') {
        setDocs(data.content)
      } else if (data.event_type == 'on_chat_model_stream') {
        setAnswer((prev) => prev + data.content)
      }
    }
    websocket.onclose = () => {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!isChatOpen) {
      setQuestion('')
      setAnswer('')
      setDocs([])
    }
  }, [isChatOpen])

  const handleDelete = async () => {
    if (record.userId === '' || record.collection_name === '') {
      setDeleteError('User ID or Collection name is missing')
      return
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/${record.userId}/collection/${
          record.collection_name
        }`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ file_name: record.source, type: record.type }),
        }
      )
      if (response.ok) {
        setIsDeleteOpen(false)
        getRagHistory()
      } else {
        setDeleteError('Something went wrong')
      }
    } catch (e) {
      setDeleteError('Something went wrong', e)
    }
  }

  return (
    <>
      <div className="w-full flex items-center justify-between text-sm  p-3 gap-2 ">
        <div className="font-medium w-[5%]">{index + 1}</div>
        <div
          className={cn(
            'font-medium w-[55%] md:w-1/2 text-wrap break-all',
            record.type === 'website'
              ? 'text-sky-600 underline'
              : 'text-slate-800'
          )}>
          {record.type === 'website' ? (
            <a href={record.source} target="_blank">
              {record.source}
            </a>
          ) : (
            <span>{record.source}</span>
          )}
        </div>
        <div className="w-[20%] min-w-[70px] md:w-[15%] ">
          <Badge variant="outline" className="px-3 py-1">
            {record.type}
          </Badge>
        </div>

        <div className="hidden md:block w-[15%]">
          {moment.unix(record.timestamp).format('YYYY-MM-DD')}
        </div>
        <div className="w-[15%] min-w-[70px] md:w-[15%] flex min-[970px]:flex-row flex-col justify-end gap-3">
          <Button
            variant="outline"
            className="w-[70px]"
            onClick={() => setIsChatOpen((prev) => !prev)}>
            {isChatOpen ? 'Close' : 'Chat'}
          </Button>
          {!isChatOpen && (
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive" className="w-[70px]">
                  Delete
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-center">
                    Are you sure to delete this file?
                  </DialogTitle>
                  <DialogDescription className="flex  justify-center pt-3 gap-6">
                    <Button
                      variant="outline"
                      onClick={() => setIsDeleteOpen(false)}>
                      Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDelete}>
                      Delete
                    </Button>
                  </DialogDescription>
                  <div className=" flex justify-center text-destructive ">
                    {deleteError && deleteError}
                  </div>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
      {isChatOpen && (
        <div className="w-full p-3 bg-slate-100 rounded-lg shadow-lg ring-1 ring-slate-200 flex flex-col items-center justify-center ">
          <div className="w-full max-w-screen-sm">
            <p className="text-sm pb-3 font-semibold text-center">
              Start chatting
            </p>
            <div className="flex gap-3">
              <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                type="text"
                placeholder="Ask a question..."
                className="w-full px-3 py-2 text-slate-800 outline-none rounded-md text-sm"
              />

              <button
                type="submit"
                className=" bg-gradient-to-r from-primary to-sky-400/85 hover:bg-gradient-to-r hover:from-sky-700 hover:to-sky-500 px-6 rounded-lg  text-slate-100 text-sm"
                onClick={handleQA}>
                Go!
              </button>
            </div>
          </div>

          {isLoading && <BeatLoader color="#00D8FF" className="py-6" />}

          {answer && (
            <div className="w-full flex flex-col min-[950px]:flex-row gap-6 py-10">
              <div className="w-full min-[950px]:w-1/2 py-2 flex flex-col text-left ">
                <h2 className=" mb-3 font-semibold">Answer</h2>
                <ReactMarkdown className="w-full text-xs">
                  {answer}
                </ReactMarkdown>
              </div>
              <div className="w-full min-[950px]:w-1/2 py-2">
                <h2 className=" mb-3 font-semibold">Documents:</h2>
                <ul className=" flex flex-col gap-3 text-xs">
                  {docs.map((doc, index) => (
                    <Expander
                      key={index}
                      title={
                        doc.page_content.split(' ').slice(0, 5).join(' ') +
                        '...'
                      }
                      content={doc.page_content}
                    />
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}
RagRecord.propTypes = {
  record: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
}
export default RagRecord
