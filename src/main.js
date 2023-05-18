import * as THREE from "three"
import { setupScene } from "./setup-scene"

const { scene } = setupScene()

const uvGenerator = {

	generateTopUV: function( geometry, vertices, idxA, idxB, idxC ) {

		let ax, ay, bx, by, cx, cy;

		ax = vertices[ idxA * 3 ]
		ay = vertices[ ( idxA * 3 ) + 1 ]
		bx = vertices[ idxB * 3 ]
		by = vertices[ ( idxB * 3 ) + 1 ]
		cx = vertices[ idxC * 3 ]
		cy = vertices[ ( idxC * 3 ) + 1 ]

		return [
			new THREE.Vector2( ax, ay ),
			new THREE.Vector2( bx, by ),
			new THREE.Vector2( cx, cy ),
		]
	},

	generateSideWallUV: function( geometry, vertices, idxA, idxB, idxC, idxD ) {

		return [
			new THREE.Vector2( 0, 0 ),
			new THREE.Vector2( 0, 1 ),
			new THREE.Vector2( 1, 1 ),
			new THREE.Vector2( 1, 0 ),
		]
	}
}

const size = 2

const curve = new THREE.CatmullRomCurve3( [
	new THREE.Vector3( - 10, 0, 0 ),
	new THREE.Vector3( 0, 0, 0 ),
	new THREE.Vector3( 0, 0, 10 ),
] )

const extrudeCfg = {
	steps: 20,
	bevelEnabled: false,
	extrudePath: curve,
	UVGenerator: uvGenerator,
}

const shape = new THREE.Shape()
shape.moveTo( 0, 0 )
shape.lineTo( 0, size )
shape.lineTo( 0.1, size )
shape.lineTo( 0.1, 0 )
shape.lineTo( 0, 0 )

const geometry = new THREE.ExtrudeGeometry( shape, extrudeCfg )
geometry.computeBoundingBox()
geometry.computeVertexNormals()

const texture = new THREE.TextureLoader().load( "/road.png" )
texture.colorSpace = THREE.SRGBColorSpace
texture.magFilter = THREE.NearestFilter
texture.minFilter = THREE.NearestFilter

const material = new THREE.MeshBasicMaterial( { map: texture } )
const mesh = new THREE.Mesh( geometry, material )

scene.add( mesh )
