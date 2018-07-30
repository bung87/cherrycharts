import HistogramChart from '../../charts/histogram-chart'
import '../styles/main.scss'

const data = require('../../../data/histogram-chart-data')

let ele = document.getElementById('histogram-chart')
let c = new HistogramChart(ele)
c.legends({ show: true })
c.datum(data).render()