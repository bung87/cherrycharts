import BarChart from './src/charts/bar-chart'
import LineChart from './src/charts/line-chart'
import AreaChart from './src/charts/area-chart'

;(function(data) {
  let ele = document.getElementById('chart')
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
