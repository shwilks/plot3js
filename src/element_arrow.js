
import * as THREE from "three";
import { geometries_line2d } from "./element_lines";
import { geometries_line3d } from "./element_lines";
import { element_base } from "./element";
import { Material } from "./plotting";

// 2D arrow constructor
export const constructors_arrow2d = function(
    plotobj,
    scene
    ){

    // // Setup object
    // if(plotobj.properties.lwd > 1){
    //     var element = new export const element_gllines_fat({
    //         coords : plotobj.position,
    //         properties : plotobj.properties,
    //         viewport : scene.viewer.viewport
    //     });
    // } else {
    //     var element = new export const element_gllines_thin({
    //         coords : plotobj.position,
    //         properties : plotobj.properties
    //     });
    // }
    // return(element);
    throw("Arrow not made");

}


// Make a 2D arrow object
export const element_arrow2d = class arrow2d extends element_base {

    constructor(args){

    	super();
    	var geometry = geometries_line2d({
    		from : args.coords[0],
			to   : args.coords[1],
		    lwd  : args.properties.lwd,
		    arrow : {
				headlength : 0.5,
				headwidth  : 0.25
			}
    	});

    	var material = Material(args.properties);

    	this.object = new THREE.Mesh(geometry, material);

    }

}




// 3D arrow constructor
export const constructors_arrow3d = function(
    plotobj,
    scene
    ){

    // Set object properties
    plotobj.properties.arrowheadlength = plotobj.arrowhead_length[0];
    plotobj.properties.arrowheadwidth = plotobj.arrowhead_width[0];

    // Create element
    var element = new element_arrow3d({
        coords : [plotobj.position.from, plotobj.position.to],
        properties : plotobj.properties
    });

    return(element);

}


// Make a 3D arrow object
export const element_arrow3d = class arrow3d extends element_base {

    constructor(args){

        // Set defaults
        if(!args.properties)       args.properties = {};
        if(!args.properties.lwd)   args.properties.lwd = 0.1;
        if(!args.properties.mat)   args.properties.mat = "lambert";
        if(!args.properties.color) args.properties.color = {r:0.2, g:0.2, b:0.2};
        if(!args.properties.arrowheadlength) args.properties.arrowheadlength = 0.5;
        if(!args.properties.arrowheadwidth)  args.properties.arrowheadwidth = 0.25;

        super();
        var geometry = geometries_line3d({
            from : args.coords[0],
            to   : args.coords[1],
            lwd  : args.properties.lwd,
            lend : args.properties.lend,
            arrow : {
                headlength : args.properties.arrowheadlength,
                headwidth  : args.properties.arrowheadwidth,
                end        : args.properties.arrowheadend
            }
        });

        var material = Material(args.properties);
        this.object = new THREE.Mesh(geometry, material);

    }

}


// Make a 2D arrow object
export const element_arrows3d = class arrows3d {

    constructor(args){

        this.elements = [];
        this.object = new THREE.Object3D();

        for(var i=0; i<args.coords.length; i++){

            var arrowargs = Object.assign({}, args);
            arrowargs.coords = args.coords[i];
            var arrow = new element_arrow3d(arrowargs);
            this.elements.push(arrow);
            this.object.add(arrow.object);

        }

    }

}


