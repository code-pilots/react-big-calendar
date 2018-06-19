import PropTypes from 'prop-types'
import React from 'react'

const Header = ({ label }) => {
  return (
    <span>
      {label.split(' ').map((s, index) => <span key={index}>{s}</span>)}
    </span>
  )
}

Header.propTypes = {
  label: PropTypes.node,
}

export default Header
