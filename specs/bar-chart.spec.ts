import BarChart from '../src/charts/bar-chart'

const data = require('../data/bar-chart-data')
const data2 = require('../data/grouped-bar-chart-data')

const theChartType = BarChart

beforeEach(() => {
  document.body.innerHTML = '<div id="chart" style="width:500px;height:300px;"></div>'
})

describe(`testing ${theChartType.name}`, () => {
  it('can render grouped bar chart', () => {
    let ele = document.getElementById('chart')
    let c = new theChartType(ele)
    c.grouped()
      .title('Population')
      .legends({ show: true })
      .yTickLabelFormatter('abbreviateNumber')
      .datum(data2)
      .render()
  })

  it('can render stacked bar chart', () => {
    let ele = document.getElementById('chart')
    let c = new theChartType(ele)
    c.stacked()
      .title('Population')
      .legends({ show: true })
      .yTickLabelFormatter('abbreviateNumber')
      .stacked()
      .datum(data2)
      .render()
  })
})
