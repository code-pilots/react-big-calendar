import PropTypes from 'prop-types'
import React, { Component } from 'react'

export default class ObjectsVacanciesGutter extends Component {
  static propTypes = {
    items: PropTypes.array.isRequired,
    getDistanceColor: PropTypes.func.isRequired,
  }

  putEmptyStrings(events) {
    let emptyStrings = []

    for (let i = 0; i < events.length - 1; i++) {
      emptyStrings.push(
        <div key={0 - i} className={'rbc-vacancy-item'}>
          {`${events[i].vacancy.name} `}
          &mdash;
          {` ${events[i].price} `}
          &#8381;
          {` ${events[i].unit.name}`}
        </div>
      )
    }

    return emptyStrings
  }

  render() {
    const { items, getDistanceColor } = this.props
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
                      {item.distance}
                    </div>
                  )}
                </div>
                <div className={'rbc-vacancies-wrapper'}>
                  {item.vacancies.map((vacancy, vKey) => {
                    return (
                      <div key={vKey}>
                        <div className={'rbc-vacancy-item'}>
                          {`${vacancy.name} `}
                          &mdash;
                          {` ${vacancy.price} `}
                          &#8381;
                          {` ${vacancy.unit.name}`}
                        </div>
                        {this.putEmptyStrings(vacancy.events)}
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
