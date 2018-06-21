// import cn from 'classnames'
import PropTypes from 'prop-types'
import React, { Component } from 'react'

export default class ObjectsVacanciesGutter extends Component {
  static propTypes = {
    items: PropTypes.array.isRequired,
  }

  render() {
    return (
      <div className="rbc-time-gutter rbc-objects-vacancies-gutter rbc-time-column">
        {!!this.props.items &&
          this.props.items.map((item, key) => {
            return (
              <div className={'rbc-object-vacancy-row'} key={key}>
                <div className={'rbc-object-item'}>
                  <div className={'rbc-object-item-object-name'}>
                    {item.objectName}
                  </div>
                  <div className={'rbc-object-item-company-name'}>
                    {item.companyName}
                  </div>
                </div>
                <div className={'rbc-vacancies-wrapper'}>
                  {item.vacancies.map((vacancy, vKey) => {
                    return (
                      <div key={vKey} className={'rbc-vacancy-item'}>
                        {`${vacancy.name} &mdash; ${vacancy.rate} &#8381;/ч`}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
      </div>
    )
  }
}
