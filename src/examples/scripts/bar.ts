import BarChart from '../../charts/bar-chart'
import '../styles/main.scss'

const data = require('../../../data/bar-chart-data')
const data2 = require('../../../data/grouped-bar-chart-data')

let ele = document.getElementById('bar-chart-responsive')
let c = new BarChart(ele).title('TIOBE Index for June 2018')
c.legends({ show: true })
c.datum(data).render()


let ele2 = document.getElementById('bar-chart-grouped')
let c2 = new BarChart(ele2).title('Population')
c2.legends({ show: true })
c2.grouped()
c2.datum(data2).render()

let ele3 = document.getElementById('bar-chart-stacked')
let c3 = new BarChart(ele3).title('Population')
c3.legends({ show: true })
c3.stacked()
c3.datum(data2).render()