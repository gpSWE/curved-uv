import {
	BufferGeometry,
	Float32BufferAttribute,
	Vector2,
	Vector3,
	ShapeUtils,
} from "three"

class ExtrudeGeometry extends BufferGeometry {

	constructor( shape, options ) {

		super()

		const scope = this

		const verticesArray = []
		const uvArray = []

		addShape()

		this.setAttribute( "position", new Float32BufferAttribute( verticesArray, 3 ) )
		this.setAttribute( "uv", new Float32BufferAttribute( uvArray, 2 ) )

		this.computeVertexNormals()

		function addShape() {

			const placeholder = []

			const curveSegments = options.curveSegments
			const steps = options.steps
			const depth = options.depth

			const extrudePath = options.extrudePath

			let extrudePts, extrudeByPath = false
			let splineTube, binormal, normal, position2

			if ( extrudePath ) {

				extrudePts = extrudePath.getSpacedPoints( steps )

				extrudeByPath = true

				splineTube = extrudePath.computeFrenetFrames( steps, false )

				binormal = new Vector3()
				normal = new Vector3()
				position2 = new Vector3()
			}

			let vertices = shape

			const faces = ShapeUtils.triangulateShape( vertices, [] )

			const contour = vertices

			const vlen = vertices.length, flen = faces.length

			for ( let i = 0; i < vlen; i ++ ) {

				const vert = vertices[ i ]

				normal.copy( splineTube.normals[ 0 ] ).multiplyScalar( vert.x )
				binormal.copy( splineTube.binormals[ 0 ] ).multiplyScalar( vert.y )

				position2.copy( extrudePts[ 0 ] ).add( normal ).add( binormal )

				placeholder.push( position2.x, position2.y, position2.z )
			}

			for ( let s = 1; s <= steps; s ++ ) {

				for ( let i = 0; i < vlen; i ++ ) {

					const vert = vertices[ i ]

					normal.copy( splineTube.normals[ s ] ).multiplyScalar( vert.x )
					binormal.copy( splineTube.binormals[ s ] ).multiplyScalar( vert.y )

					position2.copy( extrudePts[ s ] ).add( normal ).add( binormal )

					placeholder.push( position2.x, position2.y, position2.z )
				}
			}

			function sidewalls( contour ) {

				let i = contour.length

				while ( -- i >= 0 ) {

					const k = i - 1 < 0 ? contour.length - 1 : i - 1

					for ( let s = 0, sl = steps; s < sl; s ++ ) {

						const slen1 = vlen * s
						const slen2 = vlen * ( s + 1 )

						const a = i + slen1
						const b = k + slen1
						const c = k + slen2
						const d = i + slen2

						verticesArray.push( placeholder[ a * 3 + 0 ], placeholder[ a * 3 + 1 ], placeholder[ a * 3 + 2 ] )
						verticesArray.push( placeholder[ b * 3 + 0 ], placeholder[ b * 3 + 1 ], placeholder[ b * 3 + 2 ] )
						verticesArray.push( placeholder[ d * 3 + 0 ], placeholder[ d * 3 + 1 ], placeholder[ d * 3 + 2 ] )
						verticesArray.push( placeholder[ b * 3 + 0 ], placeholder[ b * 3 + 1 ], placeholder[ b * 3 + 2 ] )
						verticesArray.push( placeholder[ c * 3 + 0 ], placeholder[ c * 3 + 1 ], placeholder[ c * 3 + 2 ] )
						verticesArray.push( placeholder[ d * 3 + 0 ], placeholder[ d * 3 + 1 ], placeholder[ d * 3 + 2 ] )

						uvArray.push( 0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1, 0 )
					}
				}
			}

			sidewalls( contour )
		}
	}
}

export { ExtrudeGeometry }
