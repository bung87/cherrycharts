import PieChart from '../../charts/pie-chart'
import '../styles/main.scss'

const data = require('../../../data/bar-chart-data')

let ele = document.getElementById('pie-chart')
let c = new PieChart(ele)
c.datum(data).render()
