import ScatterChart from '../../src/charts/scatter-chart'
import '../styles/main.scss'
import data from '../data/scatter-chart-data.json'

let ele = document.getElementById('scatter-chart')
let c = new ScatterChart(ele)
.datum(data).render()
