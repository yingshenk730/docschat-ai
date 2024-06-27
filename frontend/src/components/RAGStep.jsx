import { useState } from 'react'
import Dropbox from './Dropbox'
import Seperator from './Seperator'
import { BeatLoader } from 'react-spinners'
import ReactMarkdown from 'react-markdown'
import Expander from './Expander'
import { useAuth } from '../context/useAuth'

const RAGStep = () => {
  const [question, setQuestion] = useState('')
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isIndexingLoading, setIsIndexingLoading] = useState(false)
  const [docs, setDocs] = useState([])
  const [answer, setAnswer] = useState('')
  const [indexRes, setIndexRes] = useState('')
  const [file, setFile] = useState(null)
  const [error, setError] = useState('')

  const { user } = useAuth()
  const handleQA = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setAnswer('')

    const websocket = new WebSocket(
      `${import.meta.env.VITE_API_WEBSOCKET_BASE_URL}/async_chat`
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
  const validateURL = (url) => {
    try {
      new URL(url)
      return true
    } catch (e) {
      return false
    }
  }

  const handleIndex = async (e) => {
    e.preventDefault()
    setIsIndexingLoading(true)
    setError('')
    setIndexRes('')
    setAnswer('')
    setDocs([])
    let response
    if (file && url) {
      setError(
        'You cannot index PDF file or  URL at once! Please choose one option.'
      )
      setIsIndexingLoading(false)
      return
    } else if (file) {
      const formData = new FormData()
      formData.append('pdf_file', file)
      response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/${user.sub}/pdf-indexing`,
        {
          method: 'POST',
          body: formData,
        }
      )
    } else if (url) {
      if (!validateURL(url)) {
        setError('Please enter a valid URL.')
        setIsIndexingLoading(false)
        return
      }
      response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/${user.sub}/url-indexing`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: url }),
        }
      )
    } else {
      setError('Please upload a PDF file or enter a URL.')
      setIsIndexingLoading(false)
      return
    }
    const data = await response.json()
    console.log('Data:', data)
    setFile(null)
    setUrl('')
    setIndexRes(data.message)
    setIsIndexingLoading(false)
  }

  return (
    <div className="w-full md:min-h-[500px] md:h-screen md:overflow-y-auto bg-none px-6 sm:px-12 md:w-2/3 flex flex-col items-center bg-slate-300/50 ">
      <form
        className=" flex flex-col py-6 md:pt-12 w-full max-w-screen-sm "
        onSubmit={handleIndex}>
        <p className=" text-sm">
          <span className="font-semibold">Step1:</span> Upload your PDF file or
          website url and index it
        </p>
        <div className="flex gap-3 justify-center">
          <Dropbox
            file={file}
            setFile={setFile}
            setIndexRes={setIndexRes}
            setError={setError}
          />
          {file && (
            <div className="flex items-center">
              <button
                className=" bg-gradient-to-r from-primary to-sky-400/85 hover:bg-gradient-to-r hover:from-sky-700 hover:to-sky-500 px-3 py-2 text-slate-100 rounded-lg text-sm "
                onClick={() => {
                  setFile(null)
                  setError('')
                }}>
                Remove file
              </button>
            </div>
          )}
        </div>
        <Seperator />
        <input
          value={url}
          onChange={(e) => {
            setIndexRes('')
            setError('')
            setUrl(e.target.value)
          }}
          type="text"
          placeholder="Input a website url to index it."
          className="w-full px-3 py-2 mb-3 text-slate-800 outline-none rounded-md text-sm"
        />
        {isIndexingLoading && <BeatLoader color="#00D8FF" className="py-6" />}
        {error && (
          <div className="w-full  text-sm text-red-500 py-3">{error}</div>
        )}
        {indexRes && <div className="w-full text-sm pb-3 ">{indexRes}</div>}
        <div className="w-full flex justify-center">
          <button
            type="submit"
            className=" bg-gradient-to-r from-primary to-sky-400/85 hover:bg-gradient-to-r hover:from-sky-700 hover:to-sky-500 px-6 py-2 rounded-lg  text-slate-100 text-sm">
            Index
          </button>
        </div>
      </form>

      <div className="  w-full flex flex-col items-center justify-center">
        <div className="w-full max-w-screen-sm   pb-6">
          <p className="text-sm pb-3">
            <span className="font-semibold">Step2:</span> Start chatting
          </p>

          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            type="text"
            placeholder="Ask a question..."
            className="w-full px-3 py-2 mb-3 text-slate-800 outline-none rounded-md text-sm"
          />
          <div className="w-full flex justify-center">
            <button
              type="submit"
              className=" bg-gradient-to-r from-primary to-sky-400/85 hover:bg-gradient-to-r hover:from-sky-700 hover:to-sky-500 px-6 py-2 rounded-lg  text-slate-100 text-sm"
              onClick={handleQA}>
              Q&A
            </button>
          </div>
        </div>

        {isLoading && <BeatLoader color="#00D8FF" className="py-6" />}

        {answer && (
          <div className="w-full flex flex-col min-[950px]:flex-row gap-6 py-10">
            <div className="w-full min-[950px]:w-1/2 py-2 flex flex-col text-left ">
              <h2 className=" mb-3 font-semibold">Answer</h2>
              <ReactMarkdown className="w-full text-xs">{answer}</ReactMarkdown>
            </div>
            <div className="w-full min-[950px]:w-1/2 py-2">
              <h2 className=" mb-3 font-semibold">Documents:</h2>
              <ul className=" flex flex-col gap-3 text-xs">
                {docs.map((doc, index) => (
                  <Expander
                    key={index}
                    title={
                      doc.page_content.split(' ').slice(0, 5).join(' ') + '...'
                    }
                    content={doc.page_content}
                    source={doc.metadata.source_url}
                  />
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default RAGStep
