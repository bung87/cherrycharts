import AreaChart from '../../charts/area-chart'
import '../styles/main.scss'

const data = require('../../../data/line-chart-data')

let ele = document.getElementById('area-chart')
let c = new AreaChart(ele)
c.title('Ether Price History (USD)')
.datum(data).render()
