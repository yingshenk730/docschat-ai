import PropTypes from 'prop-types'
const Title = ({ title }) => {
  return (
    <div
      className="  
        px-24 py-3 text-3xl font-bold bg-[conic-gradient(from_var(--shimmer-angle),theme(colors.white)_10%,theme(colors.sky.600)_10%,theme(colors.white)_20%)] animate-[shimmer_2.5s_linear_infinite] rounded-[24px]
        relative
        after:flex after:absolute  after:grainy-light after:inset-[2px] after:rounded-[22px] after:content-[attr(aria-label)]
        after:items-center after:justify-center
        "
      aria-label={title}>
      <span className="opacity-0">{title} </span>
    </div>
  )
}

Title.propTypes = {
  title: PropTypes.string.isRequired,
}

export default Title
