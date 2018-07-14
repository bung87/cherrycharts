import { Object3D, MeshBasicMaterial,PlaneGeometry, Mesh } from 'three'
import { IRect,ICartesianInfo } from '../interfaces'
import {scaleOrdinal,scaleLinear} from 'd3-scale'
import {range} from '../utils'

export type DataSource = Array<Array<any>>

export class Bar extends Object3D {
  constructor(data: DataSource,cartesian: ICartesianInfo, rect: IRect, colors: Array<any>, barWidth: number, barGap: number) {
    super()
    
    let colorScale = scaleOrdinal()
      .domain(range(data.length))
      .range(colors)
   
    data.some((v, i) => {
      // let x = i * (barWidth + barGap) + rect.left + barGap + barWidth / 2
      let x = cartesian.xScale(i) + cartesian.xScale.bandwidth() / 2 
      if (x>rect.left+rect.width){
        return true
      }
      let h = cartesian.yScale(v[1])
      let g = new PlaneGeometry(barWidth, h, 1)
      // let color = new Color(colorScale(i))
      let m = new Mesh(g, new MeshBasicMaterial({ color: colorScale(i) }))
      // m.translateX( xScale(i) )
      
      m.translateX(x)
      m.translateY(h / 2 + rect.bottom)
      this.add(m)
      return false
    })
  }

}
