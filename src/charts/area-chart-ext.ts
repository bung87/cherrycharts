import Chart from '../chart'
import {
  Geometry,
  Line,
  Color,
  Object3D,
  Vector3,
  Vector2,
  CanvasTexture,
  Shape,
  ClampToEdgeWrapping,
  ShapeBufferGeometry,
  NearestFilter,
  LineSegments,
  Mesh,
  MeshBasicMaterial
} from 'three'
import { MeshLine, MeshLineMaterial } from 'three.meshline'

import { DataSource } from '../components/bar'
import { IRect } from '../interfaces'
import { scaleLinear } from 'd3-scale'

class AreaChartExt extends Chart {
  dataSource: DataSource
  barWidth: number
  barGap: number
  lines: LineSegments
  barsRect: IRect
  colors = ['#3fb1e3', '#6be6c1', '#626c91', '#a0a7e6', '#c4ebad', '#96dee8'] // walden

  drawGradientArea() {
    // this.drawMeshLine()
    let dataMax = this.dataSource.reduce(function(max, arr) {
      return Math.max(max, arr[2])
    }, -Infinity)

    let dataMin = this.dataSource.reduce(function(min, arr) {
      return Math.min(min, arr[2])
    }, Infinity)

    let heightScale = scaleLinear()
      .domain([dataMin, dataMax])
      .range([0, this.barsRect.height])

    let xScale = scaleLinear()
      .domain([0, this.dataSource.length])
      .range([this.barsRect.left, this.barsRect.left + this.barsRect.width])
    //   let colorScale = scaleOrdinal()
    //     .domain([0, this.dataSource.length])
    //     .range(colors)

    let arr2 = this.dataSource.reduce((accumulator, currentValue, index) => {
      let h = heightScale(currentValue[2]) + this.barsRect.bottom
      let x = xScale(index)

      return accumulator.concat(new Vector2(x, h))
    }, [])

    // this.drawLine(arr2)

    let shape = new Shape()
    let end = new Vector2(this.barsRect.left + this.barsRect.width, this.barsRect.bottom)
    let start = new Vector2(this.barsRect.left, this.barsRect.bottom)
    shape.setFromPoints(arr2.concat(end, start))

    let geometry2 = new ShapeBufferGeometry(shape)

    let canvas = document.createElement('canvas')
    canvas.width = this.barsRect.width * window.devicePixelRatio
    canvas.height = this.barsRect.height * window.devicePixelRatio
    canvas.style.cssText = `width:${this.barsRect.width}px;height:${this.barsRect.height}px`
    let context = canvas.getContext('2d')

    let gradient = context.createLinearGradient(0, 0, 0, canvas.height)
    gradient.addColorStop(0.1, '#99ddff') // light blue
    gradient.addColorStop(1, '#ffffff') // dark blue
    context.fillStyle = gradient

    context.fillRect(0, 0, canvas.width, canvas.height)

    let texture = new CanvasTexture(canvas)
    texture.needsUpdate = true
    texture.wrapS = ClampToEdgeWrapping
    texture.wrapT = ClampToEdgeWrapping

    texture.minFilter = NearestFilter // or

    document.body.appendChild(canvas)

    let material2 = new MeshBasicMaterial({ map: texture, transparent: true })
    // material2.opacity = 0.5 // for  opacity

    let m = new Mesh(
      geometry2,
      material2 // color: this.colors[0],
    )

    this.scene.add(m)
  }

  drawMeshLine() {
    let dataMax = this.dataSource.reduce(function(max, arr) {
      return Math.max(max, arr[2])
    }, -Infinity)

    let dataMin = this.dataSource.reduce(function(min, arr) {
      return Math.min(min, arr[2])
    }, Infinity)

    let heightScale = scaleLinear()
      .domain([dataMin, dataMax])
      .range([0, this.barsRect.height])

    let xScale = scaleLinear()
      .domain([0, this.dataSource.length])
      .range([this.barsRect.left, this.barsRect.left + this.barsRect.width])
    // let geometry = new BufferGeometry()
    // geometry.name = 'line'

    // let arr = this.dataSource.reduce((accumulator, currentValue, index) => {
    //   let h = heightScale(currentValue[2]) + this.barsRect.bottom
    //   let x = xScale(index)
    //   if (index > 0 && index < this.dataSource.length) {
    //     return accumulator.concat(x, h, 0, x, h, 0)
    //   } else {
    //     return accumulator.concat(x, h, 0)
    //   }
    // }, [])
    // let vertices = new Float32Array(arr)
    // let position = new BufferAttribute(vertices, 3)
    // geometry.addAttribute('position', position)

    let material = new MeshLineMaterial({
      color: new Color('#000000'),
      lineWidth: 1,
      resolution: new Vector2(this.size.width, this.size.height)
      // sizeAttenuation:1
    })

    // for geometry

    // let graph = new Object3D()
    // function makeLine( geo ) {

    //   let g = new MeshLine();
    //   g.setGeometry( geo);

    //   let mesh = new Mesh( g.geometry, material );
    //   graph.add( mesh );

    // }
    // let arr = this.dataSource.reduce((accumulator, currentValue, index) => {
    //   let h = heightScale(currentValue[2]) + this.barsRect.bottom
    //   let x = xScale(index)
    //   if (index > 0 && index < this.dataSource.length) {
    //     return accumulator.concat( new Vector3(x, h, 0), new Vector3(x, h, 0))
    //   } else {
    //   return accumulator.concat(new Vector3(x, h, 0))
    //   }
    // }, [])
    // for (let i=0; i < arr.length-1; i += 2){
    //   let line = new Geometry();
    //   line.vertices.push(arr[i],arr[i+1])

    //   makeLine(line);

    // }
    // this.scene.add( graph );

    let arr = this.dataSource.reduce((accumulator, currentValue, index) => {
      let h = heightScale(currentValue[2]) + this.barsRect.bottom
      let x = xScale(index)
      // if (index > 0 && index < this.dataSource.length) {
      //   return accumulator.concat( x, h, 0, x, h, 0)
      // } else {
      return accumulator.concat(x, h, 0)
      // }
    }, [])
    let vertices = new Float32Array(arr)
    let g = new MeshLine()
    g.setGeometry(vertices)
    let mesh = new Mesh(g.geometry, material)
    this.scene.add(mesh)
  }
}
