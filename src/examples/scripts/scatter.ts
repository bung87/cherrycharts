import ScatterChart from '../../charts/scatter-chart'
import '../styles/main.scss'

const data = require('../../../data/scatter-chart-data')

let ele = document.getElementById('scatter-chart')
let c = new ScatterChart(ele)
.datum(data).render()
