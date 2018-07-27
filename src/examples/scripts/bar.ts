import BarChart from '../../charts/bar-chart'
import '../../scss/cherrycharts.scss'

const data = require('../../../data/bar-chart-data')

let ele = document.getElementById('bar-chart-responsive')
let c = new BarChart(ele).title('TIOBE Index for June 2018')
c.legends({ show: true })
c.datum(data).render()
