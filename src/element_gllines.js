
import * as THREE from "three";
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js';
import { element_base } from "./element.js";
import { Material } from "./plotting.js";

// GL line constructor
export const constructors_glline = function(
    plotobj,
    viewer
    ){

    // Setup object
    if(plotobj.properties.lwd > 1){
        var element = new element_gllines_fat({
            coords : plotobj.position,
            properties : plotobj.properties,
            segments : plotobj.segments,
            viewer : viewer
        });
    } else {
        var element = new element_gllines_thin({
            coords : plotobj.position,
            properties : plotobj.properties,
            segments : plotobj.segments
        });
    }
    return(element);

}


// Make a thin line object
export const element_gllines_thin = class GLLines_thin extends element_base {

    constructor(args){

        super();
        var ncoords = args.coords.length;

        // Set default properties
        if(!args.properties){
            args.properties = {
                mat : "line",
                lwd : 1,
                color : {
                    r : Array(ncoords).fill(0),
                    g : Array(ncoords).fill(0),
                    b : Array(ncoords).fill(0)
                }
            };
        }

        // Set position and color
        var positions = new Float32Array( ncoords * 3 );
        var color     = new Float32Array( ncoords * 4 );
        
        // Fill in info
        for(var i=0; i<args.coords.length; i++){

            positions[i*3]   = args.coords[i][0];
            positions[i*3+1] = args.coords[i][1];
            positions[i*3+2] = args.coords[i][2];

            color[i*4]   = args.properties.color.r[i];
            color[i*4+1] = args.properties.color.g[i];
            color[i*4+2] = args.properties.color.b[i];
            color[i*4+3] = 1;

        }

        // Create buffer geometry
        var geometry = new THREE.BufferGeometry();
        if(args.properties.lwd > 0){
            geometry.setAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
            geometry.setAttribute( 'color',    new THREE.BufferAttribute( color,     4 ) );
        }

        // Create the material
        var material = Material(args.properties);
        material.color = new THREE.Color();
        material.vertexColors = true;
        material.linewidth = args.properties.lwd;

        // Make the actual line object
        if(args.segments){
            this.object = new THREE.LineSegments( geometry, material );
        } else {
            this.object = new THREE.Line( geometry, material );
        }
        if(args.properties.gapSize){
            this.object.computeLineDistances();
        }
        this.object.element = this;

    }

}


// Make a fat line object
export const element_gllines_fat = class GLLines_fat extends element_base {

    constructor(args){

        super();
        var viewport = args.viewer.viewport;

        // Set defaults
        if(!args.properties) args.properties = {};

        // Convert single color to multiple
        if(typeof(args.properties.color.r) !== "object"){
            args.properties.color.r = Array(args.coords.length).fill(args.properties.color.r);
            args.properties.color.g = Array(args.coords.length).fill(args.properties.color.g);
            args.properties.color.b = Array(args.coords.length).fill(args.properties.color.b);
            args.properties.color.a = Array(args.coords.length).fill(args.properties.color.a);
        };
        
        // Make geometry
        if(args.segments){
            var geometry = new LineSegmentsGeometry();
        } else {
            var geometry = new LineGeometry();
        }

        // Make material
        var matLine = new LineMaterial( {
            color: 0xffffff,
            vertexColors: true
        } );
        matLine.linewidth = args.properties.lwd;

        if(args.properties.gapSize){
            matLine.dashed    = true;
            matLine.dashScale = 200;
            matLine.dashSize  = args.properties.dashSize;
            matLine.gapSize   = args.properties.gapSize;
            matLine.defines.USE_DASH = "";
        }
        
        // Set initial resolution
        matLine.resolution.set( 
            viewport.getWidth(), 
            viewport.getHeight()
        );
        
        // Add a resize event listener to the viewport
        viewport.onresize.push(
            function(){
                matLine.resolution.set( 
                    viewport.getWidth(), 
                    viewport.getHeight()
                );
            }
        );

        // Make line
        this.object = new Line2( geometry, matLine );

        // Set colors and positions
        if(args.properties.lwd > 0){
            this.setCoords(args.coords);
        }
        this.setColor(args.properties.color);

        // Compute line distances for dashed lines
        this.object.computeLineDistances();

    }

    // Method to set the coordinates
    setCoords(coords){

        this.object.geometry.setPositions( 
            [].concat(...coords)
        );

    }

    // Method to set the colors
    setColor(colors){

        var colarray = Array(colors.r.length*3);
        for(var i=0; i<colors.r.length; i++){
            colarray[i*3]   = colors.r[i];
            colarray[i*3+1] = colors.g[i];
            colarray[i*3+2] = colors.b[i];
        }
        this.object.geometry.setColors(
            colarray
        );

    }

    // Getting and setting line widths
    getLineWidth(){

        return(this.object.material.linewidth);

    }

    setLineWidth(linewidth){

        this.object.material.linewidth = linewidth;

    }

}





