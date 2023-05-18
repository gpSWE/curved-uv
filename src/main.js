import * as THREE from "three"
import { setupScene } from "./setup-scene"
import { ExtrudeGeometry } from "./ExtrudeGeometry"

const { scene } = setupScene()

const size = 2

const curve = new THREE.CatmullRomCurve3( [
	new THREE.Vector3( - 10, 0, 0 ),
	new THREE.Vector3( 0, 0, 0 ),
	new THREE.Vector3( 0, 0, 10 ),
] )

const extrudeCfg = {
	steps: 20,
	extrudePath: curve,
}

const shape = new THREE.Shape()
shape.moveTo( 0, 0 )
shape.lineTo( 0, size )
shape.lineTo( 0.1, size )
shape.lineTo( 0.1, 0 )
shape.lineTo( 0, 0 )

const geometry = new ExtrudeGeometry( shape, extrudeCfg )

const texture = new THREE.TextureLoader().load( "/road.png" )
texture.colorSpace = THREE.SRGBColorSpace
texture.magFilter = THREE.NearestFilter
texture.minFilter = THREE.NearestFilter

const material = new THREE.MeshStandardMaterial( { map: texture } )
const mesh = new THREE.Mesh( geometry, material )

scene.add( mesh )
