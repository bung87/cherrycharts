import HistogramChart from '../../src/charts/histogram-chart'
import '../styles/main.scss'
import data from '../data/histogram-chart-data.json'

let ele = document.getElementById('histogram-chart')
let c = new HistogramChart(ele)
c.legends({ show: true })
c.datum(data).render()