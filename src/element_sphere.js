
import * as THREE from 'three';
import { element_base } from './element.js';
import { Material } from "./plotting";

// Sphere constructor
export const constructors_sphere = function(
    plotobj,
    plotdims
    ){

    // Make the object
    var element = new element_sphere({
    	radius : plotobj.radius,
        coords : plotobj.position,
        properties : plotobj.properties
    });
    
    // Return the object
    return(element);

}


// Sphere object
export const element_sphere = class Sphere extends element_base {

    // Object constructor
    constructor(args){

        super();

        // Check arguments
        if(typeof(args.radius) === "undefined") {
            throw("Radius must be specified");
        }

        // Set default properties
        if(!args.properties){
            args.properties = {
                mat : "phong",
                color : [0,1,0]
            };
        }

        // Make geometry
        var geometry = new THREE.SphereGeometry(args.radius, 32, 32);

        // Set material
        var material = Material(args.properties);

        // Make object
        this.object  = new THREE.Mesh(geometry, material);
        this.object.element = this;
        
        // Set position
        this.object.position.set(
            args.coords[0],
            args.coords[1],
            args.coords[2]
        );

    }

}

