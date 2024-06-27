import { useState } from 'react'
import PropTypes from 'prop-types'

const Expander = ({ title, content }) => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div className=" border-[1px] border-slate-300 p-2 rounded-md">
      <p
        onClick={() => setIsOpen(!isOpen)}
        className=" cursor-pointer hover:underline font-semibold hover:text-blue-500">
        {title}
      </p>
      {isOpen && <p className="py-2 ">{content}</p>}
    </div>
  )
}

Expander.propTypes = {
  title: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
}

export default Expander
