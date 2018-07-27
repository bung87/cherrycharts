import LineChart from '../../charts/line-chart'
import '../../scss/cherrycharts.scss'

const data = require('../../../data/line-chart-data')

let ele = document.getElementById('line-chart')
let c = new LineChart(ele)
c.title('Ether Price History (USD)')
.datum(data).render()
