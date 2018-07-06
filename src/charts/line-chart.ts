
import { ICartesian } from '../interfaces'
import AreaChart from './area-chart'

class LineChart extends AreaChart implements ICartesian {
  
  constructor(dom: Element) {
    super(dom)

    this.mainRect = {
      top: 20,
      right: 20,
      bottom: 20,
      left: 20
    }
    this.mainRect.width = this.size.width - this.mainRect.left - this.mainRect.right
    this.mainRect.height = this.size.height - this.mainRect.top - this.mainRect.bottom
  }
  

  draw() {
    this.drawAxis()
    this.drawBasicLine()
  }
}

export default LineChart
