import DonutChart from '../../charts/donut-chart'
import '../styles/main.scss'

const data = require('../../../data/bar-chart-data')

let ele = document.getElementById('donut-chart')
let c = new DonutChart(ele)
c.setPlotOptions({
    label: {
      minPercent: '5%'
    }
  })
.datum(data).render()
