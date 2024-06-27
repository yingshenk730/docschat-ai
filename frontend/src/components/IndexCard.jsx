import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useAuth } from '@/context/useAuth'
import { useState } from 'react'
import Dropbox from './Dropbox'
import { BeatLoader } from 'react-spinners'
import PropTypes from 'prop-types'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { useRAG } from '@/context/useRAG'

const IndexCard = ({
  indexRes,
  setIndexRes,
  pdfError,
  setPdfError,
  urlError,
  setUrlError,
}) => {
  const { user } = useAuth()
  const [url, setUrl] = useState('')
  const [isIndexingLoading, setIsIndexingLoading] = useState(false)
  // const [answer, setAnswer] = useState('') //eslint-disable-line
  const { getRagHistory } = useRAG()
  const [file, setFile] = useState(null)

  const validateURL = (url) => {
    try {
      new URL(url)
      return true
    } catch (e) {
      return false
    }
  }
  const handlePdfIndex = async (e) => {
    e.preventDefault()
    setIsIndexingLoading(true)
    setPdfError('')
    setIndexRes('')
    // setAnswer('')

    if (!file) {
      setPdfError('please select a pdf file to upload.')
      setIsIndexingLoading(false)
      return
    }
    try {
      const formData = new FormData()
      formData.append('pdf_file', file)
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/${user.sub}/pdf-indexing`,
        {
          method: 'POST',
          body: formData,
        }
      )
      if (!response.ok) {
        setPdfError('An error occured while uploading the file.')
      }
      const data = await response.json()
      setFile(null)
      setIndexRes(data.message)
      setIsIndexingLoading(false)
      getRagHistory()
    } catch (e) {
      console.log(e)
      setPdfError('An error occured while uploading the file.')
    }
  }

  const handleUrlIndex = async (e) => {
    e.preventDefault()
    setIsIndexingLoading(true)
    setUrlError('')
    setIndexRes('')
    // setAnswer('')

    if (!url) {
      setUrlError('Please add a URL')
      setIsIndexingLoading(false)
      return
    }
    if (!validateURL(url)) {
      setUrlError('Please enter a valid URL.')
      setIsIndexingLoading(false)
      return
    }
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/${user.sub}/url-indexing`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: url }),
        }
      )

      const data = await response.json()

      setFile(null)
      setUrl('')
      setIndexRes(data.message)
      setIsIndexingLoading(false)
    } catch (e) {
      console.log(e)
      setUrlError('An error occured while indexing the URL.')
    }
  }
  return (
    <DialogContent className="grainy-light">
      {/* <DialogDescription>Add new file to your knowledge base</DialogDescription> */}
      <DialogHeader>
        <DialogTitle className="text-base">
          Upload your PDF file or website url and index it
        </DialogTitle>
        <Tabs defaultValue="pdf">
          <div className="flex items-center">
            <TabsList>
              <TabsTrigger value="pdf">Upload PDF</TabsTrigger>
              <TabsTrigger value="url">Add URL</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="pdf">
            <form
              className=" flex flex-col pb-6 w-full max-w-screen-sm "
              onSubmit={handlePdfIndex}>
              <div className="flex gap-3 justify-center">
                <Dropbox
                  file={file}
                  setFile={setFile}
                  setIndexRes={setIndexRes}
                  setPdfError={setPdfError}
                />
                {file && (
                  <div className="flex items-center">
                    <button
                      className=" bg-gradient-to-r from-primary to-sky-400/85 hover:bg-gradient-to-r hover:from-sky-700 hover:to-sky-500 px-3 py-2 text-slate-100 rounded-lg text-sm "
                      onClick={() => {
                        setFile(null)
                        setPdfError('')
                      }}>
                      Remove file
                    </button>
                  </div>
                )}
              </div>

              {isIndexingLoading && (
                <div className="flex items-center justify-center">
                  <BeatLoader color="#00D8FF" className="py-6" />
                </div>
              )}
              {pdfError && (
                <div className="w-full  text-sm text-red-500 py-3">
                  {pdfError}
                </div>
              )}
              {indexRes && (
                <div className="w-full text-sm pb-3 ">{indexRes}</div>
              )}
              <div className="w-full flex justify-center">
                <button
                  type="submit"
                  className=" bg-gradient-to-r from-primary to-sky-400/85 hover:bg-gradient-to-r hover:from-sky-700 hover:to-sky-500 px-6 py-2 rounded-lg  text-slate-100 text-sm">
                  Index
                </button>
              </div>
            </form>
          </TabsContent>
          <TabsContent value="url">
            <div className=" flex flex-col pb-6 w-full max-w-screen-sm ">
              <input
                value={url}
                onChange={(e) => {
                  setIndexRes('')
                  setUrlError('')
                  setUrl(e.target.value)
                }}
                type="text"
                placeholder="Input a website url to index it."
                className="w-full px-3 py-2 mb-3 outline-none text-slate-800 rounded-md text-sm"
              />
              {isIndexingLoading && (
                <div className="flex items-center justify-center">
                  <BeatLoader color="#00D8FF" className="py-6" />
                </div>
              )}
              {urlError && (
                <div className="w-full  text-sm text-red-500 py-3">
                  {urlError}
                </div>
              )}
              {indexRes && (
                <div className="w-full text-sm pb-3 ">{indexRes}</div>
              )}
              <div className="w-full flex justify-center">
                <button
                  type="submit"
                  onClick={handleUrlIndex}
                  className=" bg-gradient-to-r from-primary to-sky-400/85 hover:bg-gradient-to-r hover:from-sky-700 hover:to-sky-500 px-6 py-2 rounded-lg  text-slate-100 text-sm">
                  Index
                </button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogHeader>
    </DialogContent>
  )
}

IndexCard.propTypes = {
  indexRes: PropTypes.string.isRequired,
  setIndexRes: PropTypes.func.isRequired,
  pdfError: PropTypes.string.isRequired,
  setPdfError: PropTypes.func.isRequired,
  urlError: PropTypes.string.isRequired,
  setUrlError: PropTypes.func.isRequired,
}

export default IndexCard
