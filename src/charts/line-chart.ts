import { ICartesian } from '../interfaces'
import AreaChart from './area-chart'

class LineChart extends AreaChart implements ICartesian {
  type = 'LineChart'
  constructor(dom: Element) {
    super(dom)
  }

  draw() {
    this.drawAxis()
    this.drawBasicLine()
  }
}

export default LineChart
