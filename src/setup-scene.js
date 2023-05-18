import * as THREE from "three"
import { OrbitControls } from "three/addons/controls/OrbitControls"

const setupScene = () => {

	const scene = new THREE.Scene()
	scene.background = new THREE.Color( 0x202020 )

	const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 1_000 )
	camera.position.set( 0, 20, 0 )
	camera.lookAt( 0, 0, 0 )
	camera.updateProjectionMatrix()

	const renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } )
	renderer.setSize( window.innerWidth, window.innerHeight )
	renderer.setPixelRatio( window.devicePixelRatio )

	document.body.insertBefore( renderer.domElement, document.body.firstElementChild )

	new OrbitControls( camera, renderer.domElement )

	window.addEventListener( "resize", () => {

		renderer.setSize( window.innerWidth, window.innerHeight )
		camera.aspect = window.innerWidth / window.innerHeight
		camera.updateProjectionMatrix()

	}, false )

	// Helpers

	{
		const helper = new THREE.AxesHelper( 1_000 )
		scene.add( helper )
	}

	// Lights

	{
		const light = new THREE.DirectionalLight( 0xffffff, 0.5 )
		light.position.set( 25, 50, 0 )
		scene.add( light )
	}

	{
		const light = new THREE.HemisphereLight( 0xffffff, 0xeeeeee, 0.5 )
		light.position.set( 0, 50, 25 )
		scene.add( light )
	}

	{
		const light = new THREE.AmbientLight( 0xffffff, 0.25 )
		light.position.set( 25, 50, 0 )
		scene.add( light )
	}

	renderer.setAnimationLoop( () => renderer.render( scene, camera ) )

	return {
		scene,
		camera,
		renderer,
	}
}

export {
	setupScene,
}
