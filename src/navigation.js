
import * as THREE from 'three';
import { ArcballControls } from 'three/addons/controls/ArcballControls.js';

export const NavMethods = {

    scrollFocus() {
        // return this.viewport.holder.matches(':focus');
        return true;
    },

    bindNavigation(){
        
        var addCameraControls = (camera) => {

            const controls = new ArcballControls( 
                camera.get3JSCamera(),
                this.viewport.canvas,
                this.scene.get3JSScene()
            );
    
            controls.setGizmosVisible(false);
            controls.unsetMouseAction('WHEEL', 'SHIFT');
            controls.unsetMouseAction(1, 'SHIFT');
    
            window.addEventListener('keydown', (event) => {
                if (event.key === 'Shift') {
                    console.log("UNSET");
                    controls.unsetMouseAction('WHEEL', null);
                }
            });
    
            window.addEventListener('keyup', (event) => {
                if (event.key === 'Shift') {
                    console.log("SET");
                    controls.setMouseAction('ZOOM', 'WHEEL', null);
                }
            });

            controls.addEventListener( 'change', () => {

                this.scene.showhideDynamics(this.camera);
                this.render();
    
            } );

            return controls;

        }

        this.perspcontrols = addCameraControls(this.camera.perspcamera);
        this.orthocontrols = addCameraControls(this.camera.orthocamera);

        // controls.setMouseAction('ROTATE', 1, 'SHIFT');

        // // Create a DirectionalLight
        // const light = new THREE.DirectionalLight(0xffffff, 1);
        // light.position.set(0, 1, -1); // Set the light's relative position
        // this.camera.get3JSCamera().add(light); // Add the light to the camera

        // // Add the camera (with the light) to the scene
        // this.scene.get3JSScene().add(this.camera.get3JSCamera());

        

        // this.controls = controls;

        // Add viewport variables
        this.navigable = true;
        // this.damper    = {};
    
        // // Set bindings
        // this.mouseMove        = this.rotateSceneWithInertia;
        // this.mouseMoveMeta    = this.panScene;
        // this.mouseScroll      = this.zoomScene;
        // this.mouseScrollShift = this.rockScene;
    
        // // Bind mouse events
        // this.viewport.canvas.addEventListener("mousemove", function(event){ 
    
        //     var viewer   = this.viewport.viewer;
        //     var viewport = this.viewport;
    
        //     if(viewer.navigable){
        //         if(viewport.mouse.down && !viewport.dragObject && viewer.scrollFocus()){
        //             if(!viewport.mouse.event.metaKey && !viewport.mouse.event.shiftKey && viewport.touch.num <= 1){
        //                 viewer.mouseMove();
        //             } else if(viewport.mouse.event.metaKey){
        //                 viewer.mouseMoveMeta(this.viewport.mouse.deltaX, this.viewport.mouse.deltaY);
        //             }
        //         }
        //     }
        //     // if(this.viewport.mouse.down){
        //     //     this.viewport.viewer.mouseMove();
        //     // }
    
        // });
    
        this.viewport.canvas.addEventListener("wheel", function(event){
            
            var viewer   = this.viewport.viewer;
            var viewport = this.viewport;
            
            if(viewer.navigable && viewer.scrollFocus()){
                if(viewport.mouse.scrollShift){
                    viewer.mouseScrollShift();
                }
            }
    
        });
    
    },
    
    rockScene(){
        
        this.sceneChange = true;
        var rotZ = this.viewport.mouse.scrollY;
        var plotHolder = this.scene.plotHolder;
        this.scene.rotateOnAxis(new THREE.Vector3(0,0,1), rotZ*0.01);
        this.scene.showhideDynamics(this.camera);
    
        if(this.settings.rotateAroundMouse){
    
            // Rotate about mouse position
            var mouse = this.viewport.mouse;
            var scene_pos1 = new THREE.Vector3( mouse.x, mouse.y, 0 ).unproject( this.camera.get3JSCamera() );
            this.scene.plotHolder.updateMatrixWorld();
            this.scene.plotHolder.worldToLocal(scene_pos1);
    
            // Rotate vector
            var scene_pos2 = scene_pos1.clone().applyAxisAngle(new THREE.Vector3(0,0,1), rotZ*0.01);
    
            // Get difference in position
            var posdif = scene_pos1.sub(scene_pos2);
            this.scene.panScene(posdif.toArray());
    
        }
    
    },

};

