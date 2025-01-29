
import * as THREE from 'three';
import { ScenePlottingMethods } from './plotting.js';
import { SceneDynamicMethods } from './dynamic.js';
import { element_Light } from './element_light.js';
import { generatePlane } from './utils.js';

let Scene = class Scene {

    constructor(viewer) {

        // Set defaults
        this.sceneChange = false;
        this.defaults = {
            translation: [0, 0, 0],
            rotation: [0, 0, 0]
        };
        this.plotdims = {};
        this.clippingPlanes = [];
        this.selectable_elements = [];
        this.toggles = {
            names: [],
            objects: []
        }
        this.elements = [];
        this.lights = [];

        // Create scene
        this.scene = new THREE.Scene();

        // Create plotHolder for rotation
        this.plotHolder = new THREE.Object3D();
        this.scene.add(this.plotHolder);

        // Create plotPoints for panning
        this.plotPoints = new THREE.Object3D();
        this.plotPoints.clippingPlanes = [];
        this.plotHolder.add(this.plotPoints);

        // Bind viewer
        this.viewer = viewer;

    }

    // Setting lims and aspect
    setPlotDims(plotdims) {

        // Update properties
        this.plotdims.dimensions = plotdims.dimensions;
        this.plotdims.lims = plotdims.lims;
        this.plotdims.aspect = plotdims.aspect;
        this.plotdims.size = [];
        for (var i = 0; i < plotdims.lims.length; i++) {
            this.plotdims.size.push(
                plotdims.lims[i][1] - plotdims.lims[i][0]
            );
        }
        this.plotdims.midpoints = [];
        for (var i = 0; i < plotdims.lims.length; i++) {
            this.plotdims.midpoints.push(
                (plotdims.lims[i][0] + plotdims.lims[i][1]) / 2
            );
        }

        // Rescale plotPoints
        this.plotPoints.scale.set(
            this.plotdims.aspect[0] / this.plotdims.size[0],
            this.plotdims.aspect[1] / this.plotdims.size[0],
            this.plotdims.aspect[2] / this.plotdims.size[0]
        );

        // Reposition plotPoints
        this.plotdims.baseposition = [
            -this.plotdims.midpoints[0] * this.plotdims.aspect[0] / this.plotdims.size[0],
            -this.plotdims.midpoints[1] * this.plotdims.aspect[1] / this.plotdims.size[0],
            -this.plotdims.midpoints[2] * this.plotdims.aspect[2] / this.plotdims.size[0]
        ]
        this.plotPoints.position.fromArray(
            this.plotdims.baseposition
        );

        // Redefine outer clipping planes
        this.setOuterClippingPlanes();

    }

    // Add an object to the scene
    add(object) {

        this.plotPoints.add(object);
        this.sceneChange = true;

    }

    // Remove an object from the scene
    remove(object) {

        this.plotPoints.remove(object);
        this.sceneChange = true;

    }

    // Add elements to the scene
    addElement(element) {
        element.id = this.elements.length;
        this.elements.push(element);
    }
    addElements(elements) {

        for (var i = 0; i < elements.length; i++) {
            this.addElement(elements[i]);
        }

    }

    // Add selectable elements
    addSelectableElement(element) {
        if (this.selectable_elements.indexOf(element) === -1) {
            this.selectable_elements.push(element);
        }
    }
    addSelectableElements(elements) {
        for (var i = 0; i < elements.length; i++) {
            this.addSelectableElement(elements[i]);
        }
    }

    // Remove a selectable element
    removeSelectableElement(element) {
        var index = this.selectable_elements.indexOf(element);
        if (index !== -1) {
            this.selectable_elements.splice(index, 1);
        }
    }

    // Set background color
    setBackgroundColor(color) {
        this.scene.background = new THREE.Color(
            color.r,
            color.g,
            color.b,
        );
    }

    // Clipping planes
    setOuterClippingPlanes() {
        var lower_lims = this.plotCoordToScene([
            this.plotdims.lims[0][0],
            this.plotdims.lims[1][0],
            this.plotdims.lims[2][0]
        ]);
        var upper_lims = this.plotCoordToScene([
            this.plotdims.lims[0][1],
            this.plotdims.lims[1][1],
            this.plotdims.lims[2][1]
        ]);
        this.plotPoints.clippingPlanes = [
            new THREE.Plane(new THREE.Vector3(1, 0, 0).applyQuaternion(this.plotHolder.quaternion), -(this.plotdims.lims[0][0] * this.plotPoints.scale.x + this.plotPoints.position.x)),
            new THREE.Plane(new THREE.Vector3(-1, 0, 0).applyQuaternion(this.plotHolder.quaternion), this.plotdims.lims[0][1] * this.plotPoints.scale.x + this.plotPoints.position.x),
            new THREE.Plane(new THREE.Vector3(0, 1, 0).applyQuaternion(this.plotHolder.quaternion), -(this.plotdims.lims[1][0] * this.plotPoints.scale.y + this.plotPoints.position.y)),
            new THREE.Plane(new THREE.Vector3(0, -1, 0).applyQuaternion(this.plotHolder.quaternion), this.plotdims.lims[1][1] * this.plotPoints.scale.y + this.plotPoints.position.y),
            new THREE.Plane(new THREE.Vector3(0, 0, 1).applyQuaternion(this.plotHolder.quaternion), -(this.plotdims.lims[2][0] * this.plotPoints.scale.z + this.plotPoints.position.z)),
            new THREE.Plane(new THREE.Vector3(0, 0, -1).applyQuaternion(this.plotHolder.quaternion), this.plotdims.lims[2][1] * this.plotPoints.scale.z + this.plotPoints.position.z),
        ];
    }

    // Add a new clipping plane
    addClippingPlane(plane) {

        // See if plane is already referenced
        for (var i = 0; i < this.clippingPlanes.length; i++) {

            var scene_plane = this.clippingPlanes[i];
            if (scene_plane.constant == plane.constant &&
                scene_plane.normal.x == plane.normal.x &&
                scene_plane.normal.y == plane.normal.y &&
                scene_plane.normal.z == plane.normal.z) {
                return (scene_plane);
            }

        }

        // If not then add a reference
        this.clippingPlanes.push(plane);
        return (plane);

    }


    // Add a clipping plane reference to the scene, if a reference does not 
    // already exist
    fetchClippingPlaneReference(clippingPlaneData) {

        // Variable for returning clipping plane refs
        var clippingPlanes = [];

        // Work through clipping plane data
        for (var i = 0; i < clippingPlaneData.length; i++) {

            var planeData = clippingPlaneData[i];

            // Normalise and coordinates provided
            planeData.coplanarPoints = this.plotCoordsToScene(planeData.coplanarPoints);

            // Make the plane
            var plane = generatePlane(planeData);
            clippingPlanes.push(
                this.addClippingPlane(plane)
            );

        }
        return (clippingPlanes);

    }

    // Convert coordinates in the plotpoint system to the scene
    plotCoordToScene(coord) {
        var converted_coord = new THREE.Vector3().fromArray(coord);
        converted_coord.multiply(this.plotPoints.scale);
        converted_coord.add(this.plotPoints.position);
        converted_coord.applyQuaternion(this.plotHolder.quaternion);
        return (converted_coord.toArray());
    }

    plotCoordsToScene(coords) {
        var converted_coords = [];
        for (var i = 0; i < coords.length; i++) {
            converted_coords.push(
                this.plotCoordToScene(coords[i])
            );
        }
        return (converted_coords);
    }

    // Empty
    empty() {

        // Remove clipping planes
        this.clippingPlanes = [];

        // Remove selectable elements
        this.selectable_elements = [];

        // Remove elements
        for (var i = 0; i < this.elements.length; i++) {
            this.remove(this.elements[i].object);
        }
        this.elements = [];

        // Remove additional objects
        while (this.plotPoints.children.length > 0) {
            this.plotPoints.remove(this.plotPoints.children[0]);
        }

    }

    // Clear all lights
    clearLights() {

        for (var i = 0; i < this.lights.length; i++) {
            if (this.lights[i].type == "PointLight") {
                this.remove(this.lights[i].object);
            } else {
                this.viewer.camera.remove(this.lights[i].object);
            }
        }
        this.lights = [];

    }

    addLight(args) {

        var light = new element_Light(args);
        if (light.object.type == "PointLight") {
            this.add(light.object);
        } else {
            light.object.target = this.viewer.camera.get3JSCamera();
            this.viewer.camera.add(light.object);
        }
        this.lights.push(light);

    }

    getWorldScale() {
        var scale = new THREE.Vector3();
        this.plotPoints.getWorldScale(scale);
        return (scale.toArray());
    }

    get3JSScene() {
        return (this.scene);
    }

}

// Assign mixins
Object.assign(Scene.prototype, ScenePlottingMethods);
Object.assign(Scene.prototype, SceneDynamicMethods);

export { Scene };

