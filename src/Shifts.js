import PropTypes from 'prop-types'
import React from 'react'
import dates from './utils/dates'
import localizer from './localizer'
import { navigate } from './utils/constants'
import ShiftsTimeGrid from './ShiftsTimeGrid'

class Shifts extends React.Component {
  static propTypes = {
    date: PropTypes.instanceOf(Date).isRequired,
  }

  static defaultProps = ShiftsTimeGrid.defaultProps

  render() {
    let { date, ...props } = this.props
    let range = Shifts.range(date, this.props)

    return <ShiftsTimeGrid {...props} range={range} eventOffset={15} />
  }
}

Shifts.navigate = (date, action) => {
  switch (action) {
    case navigate.PREVIOUS:
      return dates.add(date, -1, 'week')

    case navigate.NEXT:
      return dates.add(date, 1, 'week')

    default:
      return date
  }
}

Shifts.range = (date, { culture }) => {
  let firstOfShifts = localizer.startOfWeek(culture)
  let start = dates.startOf(date, 'week', firstOfShifts)
  let end = dates.endOf(date, 'week', firstOfShifts)

  return dates.range(start, end)
}

Shifts.title = (date, { formats, culture }) => {
  let [start, ...rest] = Shifts.range(date, { culture })
  return localizer.format(
    { start, end: rest.pop() },
    formats.dayRangeHeaderFormat,
    culture
  )
}

export default Shifts
