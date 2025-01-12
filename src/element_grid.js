
import * as THREE from 'three';
import { element_base } from './element.js';
import { Material } from "./plotting";

// Grid constructor
export const constructors_grid = function(
    plotobj,
    scene
    ){

    // Make the object
    var element = new element_grid({
    	x : plotobj.x,
        y : plotobj.y,
        z : plotobj.z,
        properties : plotobj.properties
    });
    
    // Return the object
    return(element);

}


// Grid object
export const element_grid = class Grid extends element_base {

    // Object constructor
    constructor(args){

    	super();

        // Calculate number of vertices
        var nx = args.x.length;
        var ny = args.x[0].length;
        var nverts = nx*ny;
        var positions = new Float32Array( nverts * 3 );
        var colors    = new Float32Array( nverts * 3 );

        // Set object geometry
        var material = Material(args.properties);

        var rcol = args.properties.color.r;
        var gcol = args.properties.color.g;
        var bcol = args.properties.color.b;

        // Cycle through and set positions and colors
        var i=0;
        for (var x=0; x<nx; x++) {
            for (var y=0; y<ny; y++) {
                positions[i*3 + 0] = args.x[x][y];
                positions[i*3 + 1] = args.y[x][y];
                positions[i*3 + 2] = args.z[x][y];
                colors[i*3 + 0] = rcol[x][y];
                colors[i*3 + 1] = gcol[x][y];
                colors[i*3 + 2] = bcol[x][y];
                args.x[x][y] = i;
                i++;
            }
        }

        var indices = [];
        for (var x=0; x<(nx - 1); x++) {
            for (var y=0; y<(ny - 1); y++) {

                indices.push(
                    args.x[x][y],
                    args.x[x+1][y],
                    args.x[x][y+1]
                );

                indices.push(
                    args.x[x][y+1],
                    args.x[x+1][y],
                    args.x[x+1][y+1]
                );

            }
        }

        // Create buffer geometry
        var geometry = new THREE.BufferGeometry();
        geometry.setIndex( indices );
        geometry.setAttribute( 'position', new THREE.BufferAttribute( positions, 3 ));
        geometry.setAttribute( 'color',    new THREE.BufferAttribute( colors,    3 ));

        material.vertexColors = true;
        material.color = new THREE.Color();

	    // Make the object
	    this.object = new THREE.LineSegments(geometry, material, args.properties.lwd);
	    this.object.element = this;

	}

}








