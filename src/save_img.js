
import * as THREE from 'three';
import { downloadURI } from './utils';

export const saveImgMethods = {

  getImgData(){

    if(!this.save_renderer){
      this.save_renderer = new THREE.WebGLRenderer({
        preserveDrawingBuffer: true,
        physicallyCorrectLights: true,
        antialias: true,
        alpha: true
      });
    }

    this.save_renderer.setSize(this.viewport.getWidth(),
                              this.viewport.getHeight());

    this.save_renderer.setPixelRatio( window.devicePixelRatio );
    this.save_renderer.render( 
      this.scene.get3JSScene(), 
      this.camera.get3JSCamera()
    );

    var img_data = this.save_renderer.domElement.toDataURL();
    return(img_data);

  },

  downloadImage(filename){

    var img_data = this.getImgData(viewport);
    downloadURI(img_data, filename);

  },

}
