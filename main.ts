import BarChart from './src/charts/bar-chart'
import LineChart from './src/charts/line-chart'
import AreaChart from './src/charts/area-chart'
import DonutChart from './src/charts/donut-chart'
import PieChart from './src/charts/pie-chart'
import ScatterChart from './src/charts/scatter-chart'

import './src/scss/cherrycharts.scss'

;(function(data) {
  let ele = document.getElementById('bar-chart-responsive')
  let c = new BarChart(ele).title('TIOBE Index for June 2018')
  c.legends({show:true})
  c.datum(data).render()

})(require('./data/bar-chart-data.json'))
;(function(data) {
  let data2 = data.map(v => {
    let v1 = v[0]
    let v2 = parseFloat((v[1] + 100 + Math.random() * v[1]).toFixed(2))
    return [v1, v2]
  })
  let series = [data, data2]
  let ele = document.getElementById('line-chart')
  let c = new LineChart(ele)

  c.setOptions({ theme: { colors: ['#626c91', '#a0a7e6', '#c4ebad'] } })
    .title('Ether Price History (USD)')
    .datum(series)
    .render()
})(require('./data/line-chart-data.json'))
;(function(data) {
  let data1 = data[0]
  let data2 = data1.map(v => {
    let v2 = parseFloat((v + 100 + Math.random() * v).toFixed(2))
    return v2
  })
  let series = [data1, data2]
  let ele = document.getElementById('line-chart2')
  let c = new LineChart()
  c.setOptions({ theme: { colors: ['#626c91', '#a0a7e6', '#c4ebad'] } })
    .timeRange(new Date('7/30/2015'), new Date('7/2/2018'), 'day')
    .xLabel('month', 3)

  c.datum(series)
  .renderTo(ele)
  let data3 = data1.map(v => {
    let v2 = parseFloat((v + 500 + Math.random() * v).toFixed(2))
    return v2
  })
  let ele3 = document.getElementById('line-chart3')
  let series3 = [data1, data3]

  let d = c
    .makeCopy()
    .datum(series3)
    .renderTo(ele3)
})(require('./data/line-chart-data2.json'))
;(function(data) {
  let data2 = data.map(v => {
    let v1 = v[0]
    let v2 = parseFloat((v[1] + 100 + Math.random() * v[1]).toFixed(2))
    return [v1, v2]
  })
  let series = [data, data2]
  let ele = document.getElementById('area-chart')
  let c = new AreaChart(ele)
  c.datum(series).render()
})(require('./data/line-chart-data.json'))
;(function(data) {
  let ele = document.getElementById('bar-chart')
  let c = new BarChart(ele)
  c.datum(data).render()
})(require('./data/bar-chart-data.json'))
;(function(data) {
  let ele = document.getElementById('donut-chart')
  let c = new DonutChart(ele)
  c.setOptions({
    theme: {
      plotOptions: {
        donut: {
          label: {minPercent:"3.25%"}
        }
      }
    }
  }).setPlotOptions({
    label:{
      minPercent:"5%"
    }
  })
  c.datum(data).render()
})(require('./data/bar-chart-data.json'))
;(function(data) {
  let ele = document.getElementById('pie-chart')
  let c = new PieChart(ele)
  c.datum(data).render()
})(require('./data/bar-chart-data.json'))
;(function(data) {
  let ele = document.getElementById('scatter-chart')
  let c = new ScatterChart(ele)
  c.datum(data).render()
})(require('./data/scatter-chart-data.json'))
