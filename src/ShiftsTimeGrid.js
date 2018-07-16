import PropTypes from 'prop-types'
import raf from 'dom-helpers/util/requestAnimationFrame'
import React, { Component } from 'react'
import { findDOMNode } from 'react-dom'
import moment from 'moment'
import dates from './utils/dates'

import ShiftsTimeGridHeader from './ShiftsTimeGridHeader'
import { accessor, dateFormat } from './utils/propTypes'
import { notify } from './utils/helpers'
import { accessor as get } from './utils/accessors'
import { inRange, sortEvents } from './utils/eventLevels'
import ObjectsVacanciesGutter from './ObjectsVacanciesGutter'

export default class ShiftsTimeGrid extends Component {
  static propTypes = {
    events: PropTypes.array.isRequired,
    resources: PropTypes.array,

    employees: PropTypes.array,
    getDistanceColor: PropTypes.func.isRequired,

    step: PropTypes.number,
    range: PropTypes.arrayOf(PropTypes.instanceOf(Date)),
    min: PropTypes.instanceOf(Date),
    max: PropTypes.instanceOf(Date),
    getNow: PropTypes.func.isRequired,

    scrollToTime: PropTypes.instanceOf(Date),
    eventPropGetter: PropTypes.func,
    dayPropGetter: PropTypes.func,
    dayFormat: dateFormat,
    showMultiDayTimes: PropTypes.bool,
    culture: PropTypes.string,

    rtl: PropTypes.bool,
    width: PropTypes.number,

    titleAccessor: accessor.isRequired,
    tooltipAccessor: accessor.isRequired,
    allDayAccessor: accessor.isRequired,
    startAccessor: accessor.isRequired,
    endAccessor: accessor.isRequired,
    resourceAccessor: accessor.isRequired,

    resourceIdAccessor: accessor.isRequired,
    resourceTitleAccessor: accessor.isRequired,

    selected: PropTypes.object,
    selectable: PropTypes.oneOf([true, false, 'ignoreEvents']),
    longPressThreshold: PropTypes.number,

    onNavigate: PropTypes.func,
    onSelectSlot: PropTypes.func,
    onSelectEnd: PropTypes.func,
    onSelectStart: PropTypes.func,
    onSelectEvent: PropTypes.func,
    onCellRender: PropTypes.func,
    onDoubleClickEvent: PropTypes.func,
    onDrillDown: PropTypes.func,
    getDrilldownView: PropTypes.func.isRequired,

    messages: PropTypes.object,
    components: PropTypes.object.isRequired,
  }

  static defaultProps = {
    step: 30,
    timeslots: 2,
    min: dates.startOf(new Date(), 'day'),
    max: dates.endOf(new Date(), 'day'),
    scrollToTime: dates.startOf(new Date(), 'day'),
  }

  constructor(props) {
    super(props)

    this.state = { gutterWidth: undefined, isOverflowing: null }
  }

  componentWillMount() {
    this.calculateScroll()
  }

  componentDidMount() {
    this.checkOverflow()

    this.applyScroll()

    window.addEventListener('resize', this.handleResize)
  }

  handleResize = () => {
    raf.cancel(this.rafHandle)
    this.rafHandle = raf(this.checkOverflow)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize)

    raf.cancel(this.rafHandle)
  }

  componentDidUpdate() {
    this.applyScroll()
    //this.checkOverflow()
  }

  componentWillReceiveProps(nextProps) {
    const { range, scrollToTime } = this.props
    // When paginating, reset scroll
    if (
      !dates.eq(nextProps.range[0], range[0], 'minute') ||
      !dates.eq(nextProps.scrollToTime, scrollToTime, 'minute')
    ) {
      this.calculateScroll(nextProps)
    }
  }

  gutterRef = ref => {
    this.gutter = ref && findDOMNode(ref)
  }

  handleSelectAlldayEvent = (...args) => {
    //cancel any pending selections so only the event click goes through.
    this.clearSelection()
    notify(this.props.onSelectEvent, args)
  }

  handleSelectAllDaySlot = (slots, slotInfo) => {
    const { onSelectSlot } = this.props
    notify(onSelectSlot, {
      slots,
      start: slots[0],
      end: slots[slots.length - 1],
      action: slotInfo.action,
    })
  }

  isInThisDay(date, startEvent, endEvent) {
    const momentDate = moment(date)
    return (
      momentDate.date() === moment.unix(startEvent).date() &&
      momentDate.date() === moment.unix(endEvent).date()
    )
  }

  renderEvents(range, events) {
    return range.map((date, dateIndex) => {
      return (
        <div className={'rbc-day-column'} key={dateIndex}>
          {events.map((event, eventIndex) => {
            return (
              <div className={'rbc-object-cell'} key={eventIndex}>
                {event.vacancies.map((vacancy, vacancyIndex) => {
                  return vacancy.events.map((shift, shiftIndex) => {
                    return this.props.onCellRender({
                      date,
                      dateIndex,
                      event,
                      eventIndex,
                      vacancy,
                      vacancyIndex,
                      shift,
                      shiftIndex,
                    })
                  })
                })}
              </div>
            )
          })}
        </div>
      )
    })
  }

  render() {
    let {
      events,
      range,
      width,
      startAccessor,
      endAccessor,
      selected,
      getNow,
      resources,
      components,
      allDayAccessor,
      eventPropGetter,
      showMultiDayTimes,
      longPressThreshold,
      employees,
      getDistanceColor,
    } = this.props

    width = width || this.state.gutterWidth

    let start = range[0],
      end = range[range.length - 1]

    this.slots = range.length

    let allDayEvents = [],
      rangeEvents = []

    events.forEach(event => {
      if (inRange(event, start, end, this.props)) {
        let eStart = get(event, startAccessor),
          eEnd = get(event, endAccessor)

        if (
          get(event, allDayAccessor) ||
          (dates.isJustDate(eStart) && dates.isJustDate(eEnd)) ||
          (!showMultiDayTimes && !dates.eq(eStart, eEnd, 'day'))
        ) {
          allDayEvents.push(event)
        } else {
          rangeEvents.push(event)
        }
      }
    })

    allDayEvents.sort((a, b) => sortEvents(a, b, this.props))

    const employee = employees[0]

    return (
      <div className="rbc-time-view">
        {!!employees.length && (
          <div className={'employee__header'}>
            <div className={'employee__header-wrap'}>
              <div className={'employee__header-id'}>{`ID ${employee.id}`}</div>
              <div className={'employee__header-carma'}>
                <span className={`custom-icon ${employee.carma}`} />
              </div>
            </div>
            <div className={'employee__header-name'}>
              {employee.fullname || employee.full_name}
            </div>
          </div>
        )}
        <ShiftsTimeGridHeader
          range={range}
          events={allDayEvents}
          width={width}
          getNow={getNow}
          dayFormat={this.props.dayFormat}
          culture={this.props.culture}
          resources={resources}
          selected={selected}
          selectable={this.props.selectable}
          startAccessor={startAccessor}
          endAccessor={endAccessor}
          titleAccessor={this.props.titleAccessor}
          tooltipAccessor={this.props.tooltipAccessor}
          allDayAccessor={this.props.allDayAccessor}
          resourceAccessor={this.props.resourceAccessor}
          resourceIdAccessor={this.props.resourceIdAccessor}
          resourceTitleAccessor={this.props.resourceTitleAccessor}
          isOverflowing={this.state.isOverflowing}
          dayPropGetter={this.props.dayPropGetter}
          eventPropGetter={eventPropGetter}
          longPressThreshold={longPressThreshold}
          headerComponent={components.header}
          eventComponent={components.event}
          eventWrapperComponent={components.eventWrapper}
          dateCellWrapperComponent={components.dateCellWrapper}
          onSelectSlot={this.handleSelectAllDaySlot}
          onSelectEvent={this.handleSelectAlldayEvent}
          onDoubleClickEvent={this.props.onDoubleClickEvent}
          onDrillDown={this.props.onDrillDown}
          getDrilldownView={this.props.getDrilldownView}
        />
        <div ref="content" className="rbc-time-content">
          <ObjectsVacanciesGutter
            items={events}
            getDistanceColor={getDistanceColor}
          />
          {this.renderEvents(range, events, getNow())}
        </div>
      </div>
    )
  }

  clearSelection() {
    clearTimeout(this._selectTimer)
    this._pendingSelection = []
  }

  applyScroll() {
    if (this._scrollRatio) {
      const { content } = this.refs
      content.scrollTop = content.scrollHeight * this._scrollRatio
      // Only do this once
      this._scrollRatio = null
    }
  }

  calculateScroll(props = this.props) {
    const { min, max, scrollToTime } = props

    const diffMillis = scrollToTime - dates.startOf(scrollToTime, 'day')
    const totalMillis = dates.diff(max, min)

    this._scrollRatio = diffMillis / totalMillis
  }

  checkOverflow = () => {
    if (this._updatingOverflow) return

    let isOverflowing =
      this.refs.content.scrollHeight > this.refs.content.clientHeight

    if (this.state.isOverflowing !== isOverflowing) {
      this._updatingOverflow = true
      this.setState({ isOverflowing }, () => {
        this._updatingOverflow = false
      })
    }
  }
}
