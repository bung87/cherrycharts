import DonutChart from '../../src/charts/donut-chart'
import '../styles/main.scss'

import data from '../data/bar-chart-data.json'

let ele = document.getElementById('donut-chart')
let c = new DonutChart(ele)
c.setPlotOptions({
    label: {
      minPercent: '5%'
    }
  })
.datum(data).render()
