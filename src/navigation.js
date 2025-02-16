
import * as THREE from 'three';

export const NavMethods = {

    scrollFocus() {
        // return this.viewport.holder.matches(':focus');
        return true;
    },

    bindNavigation(){

        // Add viewport variables
        this.navigable = true;
        this.damper    = {};
    
        // Set bindings
        this.mouseMove        = this.rotateSceneWithInertia;
        this.mouseMoveMeta    = this.panScene;
        this.mouseScroll      = this.zoomScene;
        this.mouseScrollShift = this.rockScene;
    
        // Bind mouse events
        this.viewport.canvas.addEventListener("mousemove", function(event){ 
    
            var viewer   = this.viewport.viewer;
            var viewport = this.viewport;
    
            if(viewer.navigable){
                if(viewport.mouse.down && !viewport.dragObject && viewer.scrollFocus()){
                    if(!viewport.mouse.event.metaKey && !viewport.mouse.event.shiftKey && viewport.touch.num <= 1){
                        viewer.mouseMove();
                    } else if(viewport.mouse.event.metaKey){
                        viewer.mouseMoveMeta(this.viewport.mouse.deltaX, this.viewport.mouse.deltaY);
                    }
                }
            }
            // if(this.viewport.mouse.down){
            //     this.viewport.viewer.mouseMove();
            // }
    
        });
    
        this.viewport.canvas.addEventListener("wheel", function(event){
    
            var viewer   = this.viewport.viewer;
            var viewport = this.viewport;
    
            if(viewer.navigable && viewer.scrollFocus()){
                if(viewport.mouse.scrollShift){
                    viewer.mouseScrollShift();
                } else {
                    viewer.mouseScroll(viewport.mouse.scrollY);
                }
            }
    
        });
        // this.div.addEventListener("touchmove", function(){
        //     if(this.touch.num == 1){
        //         navMouseMove(this); 
        //     } else {
        //         navScroll(this);
        //     }
        // });
    
    },

    rotateSceneWithInertia(){

        var deltaX = this.viewport.mouse.deltaX;
        var deltaY = -this.viewport.mouse.deltaY;
    
        this.rotateSceneXY(deltaX, deltaY);
    
        if(this.rotationDamperTimeout){ 
            window.clearTimeout( this.rotationDamperTimeout );
        }
        this.rotationDamper( deltaX, deltaY );
    
    },

    rotateSceneXY( deltaX, deltaY, linked ){

        // Rotate linked plots
        if (linked === undefined) {
            this.linkedviewers.map(viewer => viewer.rotateSceneXY(deltaX, deltaY, true));
        }
    
        this.sceneChange = true;
        this.scene.rotateOnAxis(new THREE.Vector3(0,1,0), deltaX );
        this.scene.rotateOnAxis(new THREE.Vector3(1,0,0), deltaY );
        if(this.scene.dynamic) this.scene.showhideDynamics(this.camera);
    
    },
    
    rotationDamper(deltaX, deltaY){
    
        if(Math.abs(deltaX) > 0.001 || Math.abs(deltaY) > 0.001){
    
            deltaX = deltaX*0.85;
            deltaY = deltaY*0.85;
            this.rotateSceneXY(deltaX, deltaY);
            var viewer = this;
            this.rotationDamperTimeout = window.setTimeout(function(){
                if(!viewer.viewport.mouse.down){
                    viewer.rotationDamper( deltaX, deltaY )
                }
            }, 10);
    
        }
    
    },
    
    zoomScene(zoom, linked){
    
        // Zoom linked plots
        if (linked === undefined) {
            this.linkedviewers.map(viewer => viewer.zoomScene(zoom, true));
        }
    
        this.sceneChange = true;
        this.camera.zoom(Math.pow(1.01, zoom));
    
    },
    
    panScene(panX, panY, linked){
    
        // Pan linked plots
        if (linked === undefined) {
            this.linkedviewers.map(viewer => viewer.panScene(panX, panY, true));
        }
    
        this.sceneChange = true;
    
        var plotHolder = this.scene.plotHolder;
        var plotPoints = this.plotPoints;
    
        var position = new THREE.Vector3(0, 0, 0);
        position.applyMatrix4(plotHolder.matrixWorld).project(this.camera.get3JSCamera());
        position.x += panX;
        position.y += panY;
        var inverse_mat = new THREE.Matrix4();
        inverse_mat.copy(plotHolder.matrixWorld).invert();
        position.unproject(this.camera.get3JSCamera()).applyMatrix4(inverse_mat);
    
        this.scene.panScene(position.toArray());
        this.scene.showhideDynamics(this.camera);
    
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

