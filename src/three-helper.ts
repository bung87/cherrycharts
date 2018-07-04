import {
    BufferAttribute,
    BufferGeometry,
  } from 'three'

export function createBufferGeometry(arrayOrArrayBuffer: ArrayLike<number> | ArrayBuffer,name?:string) {
    let geometry = new BufferGeometry()
    if (name){
        geometry.name = name
    }
    let vertices = new Float32Array(arrayOrArrayBuffer)
    let position = new BufferAttribute(vertices, 3)
    geometry.addAttribute('position', position)
    return geometry
  }
  