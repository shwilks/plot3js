
export const ApiMethods = {
    
    rotateSceneEuclidean(rotation){
	
        this.scene.rotateEuclidean(rotation);
        // this.scene.showhideDynamics( viewport.camera );
        this.render();
    }

}

