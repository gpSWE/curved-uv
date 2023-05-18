import * as THREE from "three"
import { setupScene } from "./setup-scene"
import { ContourGeometry } from "./ContourGeometry"

const { scene } = setupScene()

const points = [
	new THREE.Vector3( -5, -2.5, 0 ),
	new THREE.Vector3( 0, 2.5, 0 ),
	new THREE.Vector3( 5, -2.5, 0 ),
]

const curve = new THREE.QuadraticBezierCurve3( ...points )

const geometry = new ContourGeometry( curve, 2, 1 )

const texture = new THREE.TextureLoader().load( "/road.png" )
texture.colorSpace = THREE.SRGBColorSpace
texture.magFilter = THREE.NearestFilter
texture.minFilter = THREE.NearestFilter

const material = new THREE.MeshStandardMaterial( { map: texture } )
const mesh = new THREE.Mesh( geometry, material )

scene.add( mesh )

{
	const geometry = new THREE.BufferGeometry().setFromPoints( points )
	const material = new THREE.PointsMaterial( { size: 0.25 } )
	const mesh = new THREE.Points( geometry, material )
	scene.add( mesh )
}

{
	const geometry = new THREE.BufferGeometry().setFromPoints( points )
	const material = new THREE.LineBasicMaterial( { color: 0xffff00 } )
	const mesh = new THREE.Line( geometry, material )
	scene.add( mesh )
}
