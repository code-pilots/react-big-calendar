import PropTypes from 'prop-types'
import React, { Component } from 'react'

export default class ObjectsVacanciesGutter extends Component {
  static propTypes = {
    items: PropTypes.array.isRequired,
    getDistanceColor: PropTypes.func.isRequired,
    getDistanceLabel: PropTypes.func.isRequired,
    onVacancyRender: PropTypes.func.isRequired,
    onPutEmptyStrings: PropTypes.func.isRequired,
  }

  render() {
    const {
      items,
      getDistanceColor,
      getDistanceLabel,
      onVacancyRender,
      onPutEmptyStrings,
    } = this.props
    return (
      <div className="rbc-time-gutter rbc-objects-vacancies-gutter rbc-time-column">
        {!!items &&
          items.map((item, key) => {
            return (
              <div className={'rbc-object-vacancy-row'} key={key}>
                <div className={'rbc-object-item'}>
                  <div className={'rbc-object-item-object-name'}>
                    {item.object.name}
                  </div>
                  <div className={'rbc-object-item-company-name'}>
                    {item.client.name}
                  </div>
                  {item.distance && (
                    <div
                      className={`rbc-object-item-company-distance color-${getDistanceColor(
                        item.distance
                      )}`}
                    >
                      {getDistanceLabel(item.distance)}
                    </div>
                  )}
                </div>
                <div className={'rbc-vacancies-wrapper'}>
                  {item.vacancies.map((vacancy, vKey) => {
                    return (
                      <div key={vKey}>
                        {onVacancyRender(vacancy)}
                        {onPutEmptyStrings(vacancy.events)}
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
