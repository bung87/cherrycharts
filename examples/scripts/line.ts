import LineChart from '../../src/charts/line-chart'
import '../styles/main.scss'
import data from '../data/line-chart-data.json'
let ele = document.getElementById('line-chart')
let c = new LineChart(ele)
c.title('Ether Price History (USD)')
.useUTC(true)
.datum(data).render()
