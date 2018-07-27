import AreaChart from '../src/charts/area-chart'
const data1 = require('../data/line-chart-data.json')
const data2 = require('../data/line-chart-data2.json')

const theChartType = AreaChart

beforeEach(() => {
  document.body.innerHTML = '<div id="chart" style="width:500px;height:300px;"></div>'
})

describe(`testing ${theChartType.name}`, () => {

  it('allow multi series data and can parse x value to Date', () => {
    let ele = document.getElementById('chart')
    let c = new theChartType()
      c.datum(data1)
      .renderTo(ele)
  })

  it('allow multi series data with configured same time range', () => {
    let ele = document.getElementById('chart')
    let c = new theChartType()
    c.timeRange(new Date('7/30/2015'), new Date('7/2/2018'), 'day')
      .xLabel('month', 3)
      .datum(data2)
      .renderTo(ele)
  })
})
