import ScatterChart from '../../charts/scatter-chart'
import '../../scss/cherrycharts.scss'

const data = require('../../../data/scatter-chart-data')

let ele = document.getElementById('scatter-chart')
let c = new ScatterChart(ele)
.datum(data).render()
