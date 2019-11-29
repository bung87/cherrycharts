import AreaChart from '../../src/charts/area-chart'
import '../styles/main.scss'

import data  from '../data/line-chart-data.json'

let ele = document.getElementById('area-chart')
let c = new AreaChart(ele)
c.title('Ether Price History (USD)')
.datum(data).render()
