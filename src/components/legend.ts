import { Object3D, MeshBasicMaterial, Mesh, CircleGeometry } from 'three'
import { IRect } from '../interfaces'
import { scaleBand } from 'd3-scale'
import { range } from '../utils'
import { createLabel } from '../three-helper';

function calculate(num) {
    let ret = []
    let half = Math.floor(num / 2), 
     
        i, j;

    
    num % 2 === 0 ? (i = 2, j = 1) : (i = 3, j = 2);

    for (i; i <= half; i += j) {
        num % i === 0 ? ret.push(i): false;
    }

    return [ret[ret.length/2-1],ret[ret.length/2]]
}

export class Legend extends Object3D {
  constructor(data: Array<any>, colorScale, options) {
    super()
    let padding = 0.2
    let radius = 6
   
    let [cols,rows] = calculate(data.length)
    let rect: IRect = { left: 200, width: 400, height: 100,bottom:200 }
    let xScale = scaleBand()
      .domain(range(cols))
      .rangeRound([rect.left, rect.left + rect.width])
      .paddingInner(padding)
      .paddingOuter(padding)

      let yScale = scaleBand()
      .domain(range(rows).reverse())
      .rangeRound([rect.bottom, rect.bottom + rect.height])
      .paddingInner(padding)
      .paddingOuter(padding)
     
    data.forEach((v, index) => {
       
      let geometry = new CircleGeometry(radius, 32)
      let material = new MeshBasicMaterial({ color: colorScale(index) })
      let circle = new Mesh(geometry, material)
      let x = xScale(index%cols)
      let y = yScale(Math.floor(index / cols) % rows)
      let size = 12
      geometry.translate(x, y, 0)
      let mesh = createLabel(
        data[index][0],
        x,
        y,
        0,
        size,
        "#444444"
      )
      mesh.translateX(mesh.userData.textWidth/2+radius+4)
      this.add(mesh)
      this.add(circle)
    })

  }
}
