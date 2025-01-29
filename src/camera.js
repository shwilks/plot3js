
import * as THREE from 'three';

let Camera = class Camera {

	constructor(viewer) {
		this.viewer = viewer;
		this.perspcamera = new PerspCamera(viewer);
		this.orthocamera = new OrthoCamera(viewer);
		viewer.scene.scene.add(this.perspcamera.camera);
		viewer.scene.scene.add(this.orthocamera.camera);
	}

	// Set the zoom
	setZoom(zoom) {
		this.perspcamera.setZoom(zoom);
		this.orthocamera.setZoom(zoom);
	}

	// Get the zoom
	getZoom() {
		return (this.maincamera.getCameraZoom());
	}

	// Get the translation
	getSceneTranslation() {
		return (this.maincamera.getSceneTranslation());
	}

	// Get the rotation
	getSceneRotation() {
		return (this.maincamera.getSceneRotation());
	}

	// Reset the zoom
	resetZoom() {
		this.perspcamera.resetZoom();
		this.orthocamera.resetZoom();
	}

	// Reset the transformation
	resetTransformation() {
		// this.perspcamera.resetTransformation();
		// this.orthocamera.resetTransformation();
	}

	// Set the size
	setSize(width, height) {
		this.perspcamera.setSize(width, height);
		this.orthocamera.setSize(width, height);
	}

	// Initiate the camera in a viewer
	initiateInViewer(viewer) {
		this.perspcamera.initiateInViewer(viewer);
		this.orthocamera.initiateInViewer(viewer);
	}

	// Reset the default zoom
	setDefaultZoom() {
		this.perspcamera.setDefaultZoom();
		this.orthocamera.setDefaultZoom();
	}

	// Zoom to limits
	zoomToLims(lims) {
		this.perspcamera.zoomToLims(lims);
		this.orthocamera.zoomToLims(lims);
	}

	getCameraPosition() {
		return (this.maincamera.getCameraPosition());
	}

	getCameraOriginVector() {
		return this.maincamera.getCameraOriginVector();
	}

	// Get the threejs camera
	get3JSCamera() {
		return (this.maincamera.get3JSCamera());
	}

	// Set the camera type
	setType(type) {
		if (type == "orthographic") {
			this.type = "orthographic";
			this.maincamera = this.orthocamera;
		} else {
			this.type = "perspective";
			this.maincamera = this.perspcamera;
		}
	}

	// Toggle the camera type
	toggleType() {
		if (this.type == "orthographic") {
			this.setType("perspective");
		} else {
			this.setType("orthographic");
		}
		this.viewer.render();
		this.viewer.dispatchEvent("cameraTypeChange", { type: this.type });
	}

	add(object) {
		this.maincamera.camera.add(object);
	}

}

// Base camera class that contains both orthographic and perspective cameras
let BaseCamera = class BaseCamera {

	constructor(viewer) {
		this.min_zoom = 0.1;
		this.max_zoom = 4;
		this.default_zoom = 2;
		this.viewer = viewer;
	}

	// Set the zoom
	setZoom(zoom) {
		var start_zoom = this.getCameraZoom();
		this.setCameraZoom(zoom);
		var end_zoom = this.getCameraZoom();
		this.viewer.dispatchEvent(
			"zoom",
			{ start_zoom: start_zoom, end_zoom: end_zoom }
		);
	}

	// Reset the zoom
	resetZoom() {
		this.setZoom(this.default_zoom);
	}

	// Zooming the camera
	zoom(zoom) {

		zoom = Math.pow(zoom, this.zoom_adjuster);
		var start_zoom = this.getZoom();
		var min_zoom = this.min_zoom;
		var max_zoom = this.max_zoom;

		if (start_zoom * zoom <= max_zoom
			&& start_zoom * zoom >= min_zoom) {
			this.setZoom(start_zoom * zoom);
		} else if (start_zoom * zoom < min_zoom) {
			this.setZoom(min_zoom);
		} else {
			this.setZoom(max_zoom);
		}

	}

	// Set the camera size
	setSize(width, height) {

		this.aspect = width / height;
		this.camera.aspect = width / height;
		this.camera.updateProjectionMatrix();
		this.setZoom(this.getCameraZoom());

	}

	// Initiate the camera in a viewer
	initiateInViewer(viewer) {

		this.setSize(
			viewer.viewport.getWidth(),
			viewer.viewport.getHeight()
		);

	}

	// Reset the default zoom
	setDefaultZoom() {
		this.default_zoom = this.getZoom();
	}

	// Get the threejs camera
	get3JSCamera() {
		return (this.camera);
	}

	// Get the translation
	getTranslation() {
		return ([
			this.camera.position.x,
			this.camera.position.y
		]);
	}

	// Get the camera rotation
	getCameraRotation() {

		return new THREE.Vector3().fromArray(
			this.camera.rotation.toArray()
		)

	}

	// Get the scene rotation
	getSceneRotation() {

		return this.getCameraRotation().negate();

	}

	// Get the scene translation
	getSceneTranslation() {

		let camera_position = this.getCameraPosition();
		let camera_vec = new THREE.Vector3();
		this.camera.getWorldDirection(camera_vec);

		let zoom = this.getCameraZoom();

		let translation = camera_position.clone().add(
			camera_vec.clone().multiplyScalar(zoom)
		).negate();

		return translation;

	}

}


// Standard perspective camera for 3D
let PerspCamera = class PerspCamera extends BaseCamera {

	// Constructor function
	constructor(viewer) {

		super(viewer);
		this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 10000);
		this.zoom_adjuster = 1;

	}

	// Set the zoom
	setCameraZoom(zoom) {

		this.camera.position.z = zoom;
		this.camera.updateProjectionMatrix();

	}

	rotate(value) {

		this.camera.rotateZ(value);
		this.viewer.sceneChange = true;

	}

	zoomToLims(lims) {

		let cam_z = this.camera.position.z;
		let a = this.camera.fov;
		let bsphere = new THREE.Sphere().setFromPoints(
			[
				new THREE.Vector3(lims.x[0], lims.y[0], lims.z[1]),
				new THREE.Vector3(lims.x[0], lims.y[1], lims.z[1]),
				new THREE.Vector3(lims.x[1], lims.y[0], lims.z[1]),
				new THREE.Vector3(lims.x[1], lims.y[1], lims.z[1]),
			],
			new THREE.Vector3(0, 0, 0)
		);
		let s = bsphere.radius * 2;
		let d = (s / 2) / Math.tan(a / 2)
		this.setZoom(d);

	}

	// Get the camera zoom
	getCameraZoom() {

		let camera_vec = new THREE.Vector3();
		this.camera.getWorldDirection(camera_vec);

		let origin_vec = this.camera.position.clone().normalize().negate();
		let angle = camera_vec.angleTo(origin_vec);

		let origin_dist = this.camera.position.length();
		let zoom = origin_dist * Math.cos(angle);

		return zoom;

	}

	// Get the position
	getCameraPosition() {
		return this.camera.position;
	}

	getCameraOriginVector() {
		return this.camera.position.clone().negate();
	}

}


// Orthographic camera for 2D
let OrthoCamera = class OrthoCamera extends BaseCamera {

	// Constructor function
	constructor(viewer) {

		super(viewer);

		this.camera = new THREE.OrthographicCamera();
		this.camera.near = -100;
		this.camera.far = 100;
		this.zoom_adjuster = 1;

	}

	// Get the zoom
	getCameraZoom() {

		// Create a new Matrix4 instance to avoid modifying the original matrix
		const matrix = new THREE.Matrix4().copy(this.camera.projectionMatrix);

		// Decompose the matrix to extract the scale components
		const scale = new THREE.Vector3();
		matrix.decompose(new THREE.Vector3(), new THREE.Quaternion(), scale);

		// For an orthographic camera, the zoom level is the inverse of the scale.x (or scale.y)
		const zoomLevel = 2 / scale.y;
		return zoomLevel;

	}

	// Set the zoom
	setCameraZoom(zoom) {

		zoom = 2;
		this.distance = zoom;
		this.camera.left = -this.distance * this.aspect / 2;
		this.camera.right = this.distance * this.aspect / 2;
		this.camera.top = this.distance / 2;
		this.camera.bottom = -this.distance / 2;
		this.camera.updateProjectionMatrix();

	}

	// Get frustrum
	frustrum() {
		return ({
			left: this.camera.left,
			right: this.camera.right,
			top: this.camera.top,
			bottom: this.camera.bottom,
		})
	}

	rotate(value) {

		this.camera.rotateZ(value);

	}

	zoomToLims(lims) {

		var frustrum = this.frustrum();
		var frustrum_xrange = frustrum.right - frustrum.left;
		var frustrum_yrange = frustrum.top - frustrum.bottom;

		var xrange = lims.x[1] - lims.x[0];
		var yrange = lims.y[1] - lims.y[0];

		var zoom = this.getZoom();
		var zoom_factor_x = (xrange) / frustrum_xrange;
		var zoom_factor_y = (yrange) / frustrum_yrange;
		var zoom_factor = Math.max(zoom_factor_x, zoom_factor_y);

		this.setCameraZoom(zoom * zoom_factor);

	}

	getCameraPosition() {
		// var vec = new THREE.Vector3();
		// this.camera.getWorldDirection(vec);
		// vec.negate();
		// return vec;
		let camera_position = this.camera.position.clone();
		camera_position.z = this.getCameraZoom();
		camera_position.applyQuaternion(this.camera.quaternion);
		return camera_position;
	}

	getCameraOriginVector() {
		var camera_to_origin = new THREE.Vector3();
		this.camera.getWorldDirection(camera_to_origin);
		return camera_to_origin;
	}

}

export { Camera, BaseCamera, PerspCamera, OrthoCamera };
