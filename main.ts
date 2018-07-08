import BarChart from './src/charts/bar-chart'
import LineChart from './src/charts/line-chart'
import AreaChart from './src/charts/area-chart'
import DonutChart from './src/charts/donut-chart'
import PieChart from './src/charts/pie-chart'

import './src/scss/cherrycharts.scss'
;(function(data) {
  let ele = document.getElementById('bar-chart-responsive')
  let c = new BarChart(ele)
  c.datum(data).render()
})(require('./data/bar-chart-data.json'))

;(function( data) {
  let ele = document.getElementById('line-chart')
  let c = new LineChart(ele)
  c.datum(data).render()
})(require('./data/line-chart-data.json'))

;(function(data) {
  let ele = document.getElementById('area-chart')
  let c = new AreaChart(ele)
  c.datum(data).render()
})(require('./data/line-chart-data.json'))

;(function(data) {
  let ele = document.getElementById('bar-chart')
  let c = new BarChart(ele)
  c.datum(data).render()
})(require('./data/bar-chart-data.json'))

;(function(data) {
  let ele = document.getElementById('donut-chart')
  let c = new DonutChart(ele)
  c.datum(data).render()
})(require('./data/bar-chart-data.json'))

;(function(data) {
  let ele = document.getElementById('pie-chart')
  let c = new PieChart(ele)
  c.datum(data).render()
})(require('./data/bar-chart-data.json'))
