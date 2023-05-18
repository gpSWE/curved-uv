import {
	BufferGeometry,
	Float32BufferAttribute,
	Vector2,
	Vector3,
	Shape,
	ShapeUtils,
} from "three"

class ExtrudeGeometry extends BufferGeometry {

	constructor( shape, options ) {

		super()

		const scope = this

		const verticesArray = []
		const uvArray = []

		addShape( shape )

		this.setAttribute( "position", new Float32BufferAttribute( verticesArray, 3 ) )
		this.setAttribute( "uv", new Float32BufferAttribute( uvArray, 2 ) )

		this.computeVertexNormals()

		function addShape( shape ) {

			const placeholder = []

			const curveSegments = options.curveSegments !== undefined ? options.curveSegments : 12
			const steps = options.steps !== undefined ? options.steps : 1
			const depth = options.depth !== undefined ? options.depth : 1

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

			const shapePoints = shape.extractPoints( curveSegments )

			let vertices = shapePoints.shape

			const faces = ShapeUtils.triangulateShape( vertices, [] )

			const contour = vertices

			const vlen = vertices.length, flen = faces.length

			function getBevelVec( inPt, inPrev, inNext ) {

				let v_trans_x, v_trans_y, shrink_by

				const v_prev_x = inPt.x - inPrev.x,
					v_prev_y = inPt.y - inPrev.y
				const v_next_x = inNext.x - inPt.x,
					v_next_y = inNext.y - inPt.y

				const v_prev_lensq = ( v_prev_x * v_prev_x + v_prev_y * v_prev_y )

				const collinear0 = ( v_prev_x * v_next_y - v_prev_y * v_next_x )

				if ( Math.abs( collinear0 ) > Number.EPSILON ) {

					const v_prev_len = Math.sqrt( v_prev_lensq )
					const v_next_len = Math.sqrt( v_next_x * v_next_x + v_next_y * v_next_y )

					const ptPrevShift_x = ( inPrev.x - v_prev_y / v_prev_len )
					const ptPrevShift_y = ( inPrev.y + v_prev_x / v_prev_len )

					const ptNextShift_x = ( inNext.x - v_next_y / v_next_len )
					const ptNextShift_y = ( inNext.y + v_next_x / v_next_len )

					const sf = ( ( ptNextShift_x - ptPrevShift_x ) * v_next_y - ( ptNextShift_y - ptPrevShift_y ) * v_next_x ) / ( v_prev_x * v_next_y - v_prev_y * v_next_x )

					v_trans_x = ( ptPrevShift_x + v_prev_x * sf - inPt.x )
					v_trans_y = ( ptPrevShift_y + v_prev_y * sf - inPt.y )

					const v_trans_lensq = ( v_trans_x * v_trans_x + v_trans_y * v_trans_y )
					
					if ( v_trans_lensq <= 2 ) {

						return new Vector2( v_trans_x, v_trans_y )
					}
					else {

						shrink_by = Math.sqrt( v_trans_lensq / 2 )
					}
				}
				else {

					let direction_eq = false

					if ( v_prev_x > Number.EPSILON ) {

						if ( v_next_x > Number.EPSILON ) {

							direction_eq = true
						}
					}
					else {

						if ( v_prev_x < - Number.EPSILON ) {

							if ( v_next_x < - Number.EPSILON ) {

								direction_eq = true
							}
						}
						else {

							if ( Math.sign( v_prev_y ) === Math.sign( v_next_y ) ) {

								direction_eq = true
							}
						}
					}

					if ( direction_eq ) {

						v_trans_x = - v_prev_y
						v_trans_y = v_prev_x
						shrink_by = Math.sqrt( v_prev_lensq )
					}
					else {

						v_trans_x = v_prev_x
						v_trans_y = v_prev_y
						shrink_by = Math.sqrt( v_prev_lensq / 2 )
					}
				}

				return new Vector2( v_trans_x / shrink_by, v_trans_y / shrink_by )
			}

			for ( let i = 0; i < vlen; i ++ ) {

				const vert = vertices[ i ]

				if ( ! extrudeByPath ) {

					placeholder.push( vert.x, vert.y, 0 )
				}
				else {

					normal.copy( splineTube.normals[ 0 ] ).multiplyScalar( vert.x )
					binormal.copy( splineTube.binormals[ 0 ] ).multiplyScalar( vert.y )

					position2.copy( extrudePts[ 0 ] ).add( normal ).add( binormal )

					placeholder.push( position2.x, position2.y, position2.z )
				}
			}

			for ( let s = 1; s <= steps; s ++ ) {

				for ( let i = 0; i < vlen; i ++ ) {

					const vert = vertices[ i ]

					if ( ! extrudeByPath ) {

						placeholder.push( vert.x, vert.y, depth / steps * s )
					}
					else {

						normal.copy( splineTube.normals[ s ] ).multiplyScalar( vert.x )
						binormal.copy( splineTube.binormals[ s ] ).multiplyScalar( vert.y )

						position2.copy( extrudePts[ s ] ).add( normal ).add( binormal )

						placeholder.push( position2.x, position2.y, position2.z )
					}
				}
			}

			function sidewalls( contour, layeroffset = 0 ) {

				let i = contour.length

				while ( -- i >= 0 ) {

					const j = i
					let k = i - 1
					if ( k < 0 ) k = contour.length - 1

					for ( let s = 0, sl = steps; s < sl; s ++ ) {

						const slen1 = vlen * s
						const slen2 = vlen * ( s + 1 )

						const a = layeroffset + j + slen1,
							b = layeroffset + k + slen1,
							c = layeroffset + k + slen2,
							d = layeroffset + j + slen2

						f4( a, b, c, d )
					}
				}
			}

			sidewalls( contour )

			function f4( a, b, c, d ) {

				addVertex( a )
				addVertex( b )
				addVertex( d )

				addVertex( b )
				addVertex( c )
				addVertex( d )

				const nextIndex = verticesArray.length / 3
				const uvs = uvgen.generateSideWallUV( scope, verticesArray, nextIndex - 6, nextIndex - 3, nextIndex - 2, nextIndex - 1 )

				addUV( uvs[ 0 ] )
				addUV( uvs[ 1 ] )
				addUV( uvs[ 3 ] )

				addUV( uvs[ 1 ] )
				addUV( uvs[ 2 ] )
				addUV( uvs[ 3 ] )
			}

			function addVertex( index ) {

				verticesArray.push( placeholder[ index * 3 + 0 ] )
				verticesArray.push( placeholder[ index * 3 + 1 ] )
				verticesArray.push( placeholder[ index * 3 + 2 ] )
			}

			function addUV( vector2 ) {

				uvArray.push( vector2.x )
				uvArray.push( vector2.y )
			}
		}
	}
}

const uvgen = {

	generateTopUV: () => {

		return [
			new Vector2( 0, 0 ),
			new Vector2( 0, 0 ),
			new Vector2( 0, 0 )
		]
	},

	generateSideWallUV: () => {

		return [
			new Vector2( 0, 0 ),
			new Vector2( 0, 1 ),
			new Vector2( 1, 1 ),
			new Vector2( 1, 0 ),
		]
	}
}

export { ExtrudeGeometry }
