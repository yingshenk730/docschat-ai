import { useCallback } from 'react'
import { IconFileInvoice, IconUpload } from '@tabler/icons-react'
import { useDropzone } from 'react-dropzone'
import PropTypes from 'prop-types'

const Dropbox = ({ file, setFile, setIndexRes, setPdfError }) => {
  const onDrop = useCallback((acceptedFile, fileRejection) => {
    setIndexRes('')
    setPdfError('')
    if (fileRejection.length > 0) {
      setPdfError(fileRejection[0].errors[0].message)
      return
    } else {
      setFile(acceptedFile[0])
    }
  }, []) // eslint-disable-line
  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
  })
  return (
    <div className=" my-5 px-10 py-3 border-2 border-dashed border-gray-300 bg-white/80 ">
      <div
        className="flex flex-col justify-center items-center cursor-pointer focus-visible:outline-none focus-visible:ring focus-visible:ring-primary-200 transition-all transition-75 text-sm"
        {...getRootProps()}>
        <input className="" {...getInputProps()} />
        {file ? (
          <div className="flex gap-1 items-center justify-center pb-2">
            <div className="hidden md:block">
              <IconFileInvoice size={25} stroke={1} color="grey" />
            </div>
            <p className=" text-s_grey-400 ">{file.name}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <IconUpload size={25} stroke={1} color="grey" />

            <p className="font-semibold text-sm text-slate-800/90">
              Drag and drop your file
            </p>
            <p className="text-sm font-medium text-s_grey-500 text-center">
              or click to upload your files
            </p>
            <p className="text-sm font-medium text-s_grey-500 text-center">
              (Max size: 5MB)
            </p>

            {/* <div className="lg:hidden block">
              <p className="font-medium">
                Click to <span className="text-primary-600">browse</span> file
              </p>
            </div> */}
          </div>
        )}
      </div>
      {file && (
        <div>
          <p className="text-sm text-center ">Filename: {file.name}</p>
        </div>
      )}
    </div>
  )
}

Dropbox.propTypes = {
  file: PropTypes.object,
  setFile: PropTypes.func.isRequired,
  setIndexRes: PropTypes.func.isRequired,
  setPdfError: PropTypes.func.isRequired,
}

export default Dropbox
