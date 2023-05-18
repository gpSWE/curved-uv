import {
	BufferGeometry,
	Float32BufferAttribute,
	Vector3,
} from "three"

class ExtrudeGeometry extends BufferGeometry {

	constructor( shape, curve, steps ) {

		super()

		const positions = []
		const uvs = []
		const placeholder = []

		const extrudePts = curve.getSpacedPoints( steps )
		const splineTube = curve.computeFrenetFrames( steps, false )

		const binormal = new Vector3()
		const normal = new Vector3()
		const position = new Vector3()

		for ( let i = 0; i < shape.length; i ++ ) {

			normal.copy( splineTube.normals[ 0 ] ).multiplyScalar(  shape[ i ].x )
			binormal.copy( splineTube.binormals[ 0 ] ).multiplyScalar(  shape[ i ].y )
			position.copy( extrudePts[ 0 ] ).add( normal ).add( binormal )

			placeholder.push( ...position )
		}

		for ( let s = 1; s <= steps; s ++ ) {

			for ( let i = 0; i < shape.length; i ++ ) {

				normal.copy( splineTube.normals[ s ] ).multiplyScalar(  shape[ i ].x )
				binormal.copy( splineTube.binormals[ s ] ).multiplyScalar(  shape[ i ].y )
				position.copy( extrudePts[ s ] ).add( normal ).add( binormal )

				placeholder.push( ...position )
			}
		}

		let i = shape.length

		console.log( i )

		while ( -- i >= 0 ) {

			const k = i - 1 < 0 ? shape.length - 1 : i - 1

			for ( let s = 0, sl = steps; s < sl; s ++ ) {

				const slen1 = shape.length * s
				const slen2 = shape.length * ( s + 1 )

				const a = i + slen1
				const b = k + slen1
				const c = k + slen2
				const d = i + slen2

				positions.push( placeholder[ a * 3 ], placeholder[ a * 3 + 1 ], placeholder[ a * 3 + 2 ] )
				positions.push( placeholder[ b * 3 ], placeholder[ b * 3 + 1 ], placeholder[ b * 3 + 2 ] )
				positions.push( placeholder[ d * 3 ], placeholder[ d * 3 + 1 ], placeholder[ d * 3 + 2 ] )
				positions.push( placeholder[ b * 3 ], placeholder[ b * 3 + 1 ], placeholder[ b * 3 + 2 ] )
				positions.push( placeholder[ c * 3 ], placeholder[ c * 3 + 1 ], placeholder[ c * 3 + 2 ] )
				positions.push( placeholder[ d * 3 ], placeholder[ d * 3 + 1 ], placeholder[ d * 3 + 2 ] )

				uvs.push( 0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1, 0 )
			}
		}

		this.setAttribute( "position", new Float32BufferAttribute( positions, 3 ) )
		this.setAttribute( "uv", new Float32BufferAttribute( uvs, 2 ) )

		this.computeVertexNormals()
	}
}

export { ExtrudeGeometry }
