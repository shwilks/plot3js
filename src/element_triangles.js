
import * as THREE from 'three';
import { element_base } from './element.js';
import { DefaultProperties, Material } from "./plotting";

export const constructors_triangles = function(
    plotobj,
    plotdims
    ){

    // Make the object
    var element = new element_Triangles({
        vertices   : plotobj.vertices,
        properties : plotobj.properties
    });
    
    // Return the object
    return(element);

}

// Sphere object
export const element_Triangles = class Triangles extends element_base {

    // Object constructor
    constructor(args){

        super();

        // Set defaults
        args.properties = DefaultProperties(args.properties, args.vertices.length);

        // Make geometry
        var positions = new Float32Array( args.vertices.length * 3 );
        var colors    = new Float32Array( args.vertices.length * 3 );

        // Add vertices and colors
        for(var i=0; i<args.vertices.length; i++){

            positions[i*3 + 0] = args.vertices[i][0]; // - object.position.x,
            positions[i*3 + 1] = args.vertices[i][1]; // - object.position.y,
            positions[i*3 + 2] = args.vertices[i][2]; // - object.position.z

            colors[i*3 + 0] = args.properties.color.r[i];
            colors[i*3 + 1] = args.properties.color.g[i];
            colors[i*3 + 2] = args.properties.color.b[i];

        }

        // Set fill material
        var material = Material(args.properties);
        material.vertexColors = true;
        material.color = new THREE.Color();

        // Create buffer geometry
        var geometry = new THREE.BufferGeometry();
        geometry.setAttribute( 'position', new THREE.BufferAttribute( positions, 3 ));
        geometry.setAttribute( 'color',    new THREE.BufferAttribute( colors,    3 ));
        geometry.computeVertexNormals();

        material.vertexColors = true;
        material.color = new THREE.Color();

        // Make fill object
        this.object = new THREE.Mesh(geometry, material);

    }

}

