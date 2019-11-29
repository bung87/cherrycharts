import PieChart from '../../src/charts/pie-chart'
import '../styles/main.scss'

import data from '../data/bar-chart-data.json'

let ele = document.getElementById('pie-chart')
let c = new PieChart(ele)
c.datum(data).render()
