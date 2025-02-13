
import { Viewport } from "./viewport.js";
import { Scene } from "./scene.js";
import { Renderer } from "./renderer.js";
import { Camera } from "./camera.js";
import { Raytracer } from "./raytrace.js";
import { Shaders } from "./shaders.js";
import { NavMethods } from "./navigation.js";
import { LoadMethods } from "./load.js";
import { ToggleMethods } from "./toggle.js";
import { HighlightMethods } from "./highlight.js";
import { ApiMethods } from "./api.js";
import { ViewerButtonMethods } from "./buttons.js";
import { saveImgMethods } from "./save_img.js";

let Viewer = class R3JSviewer {

    // Constructor function
    constructor(container, settings = {
        startAnimation: true,
        initiate: true
    }) {

        // Set settings
        this.settings = settings;

        // Set variables
        this.sceneChange = false;
        this.raytraceNeeded = false;
        this.name = "r3js viewer";

        // Set the container
        this.container = container;
        container.viewer = this;

        // Create viewport
        this.viewport = new Viewport(this);

        // Bind event listeners
        this.bindEventListeners();

        // Initiate the viewer
        if (settings.initiate) {
            this.initiate(settings.startAnimation);
        }

    }

    // Function to initiate webgl
    initiate(startAnimation = true) {

        // Create scene
        this.scene = new Scene(this);
        this.scene.setBackgroundColor({
            r: 1,
            g: 1,
            b: 1
        })

        // Create renderer and append to dom
        this.renderer = new Renderer();
        this.renderer.attachToViewport(this.viewport);
        this.renderer.setSize(
            this.viewport.width,
            this.viewport.height
        );

        // Create cameras
        this.camera = new Camera(this);
        this.camera.setType("perspective");

        // Add raytracer
        this.raytracer = new Raytracer();

        // Bind navigation
        this.bindNavigation();

        // Add rectangular selection
        if (this.settings.rectangularSelection) {
            this.addRectangleSelection();
        }

        // Start animation loop
        const animate = () => {
            if (this.raytraceNeeded || this.sceneChange || this.scene.sceneChange) {
                this.raytraceNeeded = false;
                this.raytrace();
            }
            if (this.sceneChange || this.scene.sceneChange) {
                this.sceneChange = false;
                this.scene.sceneChange = false;
                this.render();
            }
            requestAnimationFrame(animate);
        };

        animate();

    }

    // Render function
    render() {
        this.renderer.render(
            this.scene,
            this.camera
        );
    }

    // Raytrace function
    raytrace() {
        this.raytracer.raytrace(
            this,
            this.scene,
            this.camera,
            this.viewport.mouse
        )
    }

    // Rest transformation
    resetTransformation() {
        this.sceneChange = true;
        this.scene.resetTransformation();
        this.camera.resetZoom();
        this.scene.showhideDynamics(this.camera);
    }

    // Set plot lims
    setPlotDims(plotdims) {

        // Set scene lims
        this.scene.setPlotDims(plotdims);

        // Rebind navigation depending upon 2D or 3D plot
        //this.navigation_bind(plotdims.dimensions);

        // Set camera
        if (plotdims.dimensions == 2) {
            this.camera.setType("orthographic");
            this.renderer.setShaders(
                Shaders.VertexShader2D,
                Shaders.FragmentShader2D
            );
        } else {
            this.camera.setType("perspective");
            this.renderer.setShaders(
                Shaders.VertexShader3D,
                Shaders.FragmentShader2D
            );
        }

    }

    // Return aspect ratio
    getAspect() {
        return (this.viewport.getAspect());
    }

    // Get plot dims
    getPlotDims() {
        return (this.scene.plotdims.dimensions);
    }

    // Check if this is part of a page or the whole page
    fullpage() {
        return (
            this.container.offsetHeight == document.body.offsetHeight &&
            this.container.offsetWidth == document.body.offsetWidth
        )
    }

    // For dispatching custom events
    dispatchEvent(name, detail) {
        detail.viewer = this;
        let event = new CustomEvent(name, {
            detail: detail
        });
        this.container.dispatchEvent(event);
    }

    addEventListener(name, fn) {
        this.container.addEventListener(name, fn);
    }

    bindEventListeners() {
        for (var i = 0; i < this.eventListeners.length; i++) {
            this.addEventListener(
                this.eventListeners[i].name,
                this.eventListeners[i].fn
            );
        }
    }

    addHoverInfo = function(div){
        this.viewport.hover_info.add(div);
    }
    
    removeHoverInfo = function(div){
        this.viewport.hover_info.remove(div);
    }

}

// Assign mixins
Viewer.prototype.eventListeners = [];
Object.assign(Viewer.prototype, NavMethods);
Object.assign(Viewer.prototype, LoadMethods);
Object.assign(Viewer.prototype, ToggleMethods);
Object.assign(Viewer.prototype, HighlightMethods);
Object.assign(Viewer.prototype, ApiMethods);
Object.assign(Viewer.prototype, ViewerButtonMethods);
Object.assign(Viewer.prototype, saveImgMethods);

export {Viewer};
