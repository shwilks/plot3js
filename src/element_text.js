
import * as THREE from 'three';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { element_base } from './element.js';
import { Material } from "./plotting";
import { apply_style } from "./legend.js";
import { Fonts } from "./fonts.js";

// GL line constructor
export const constructors_text = function(
    plotobj,
    viewer
    ){


    // Apply any additional offset
    var plotdims = viewer.scene.plotdims;

    // Create the object
    if(plotobj.rendering == "geometry"){

        var element = new element_text({
            text   : plotobj.text[0],
            coords : plotobj.position,
            size   : plotobj.size[0],
            alignment : plotobj.alignment,
            offset     : plotobj.offset,
            properties : Material(plotobj.properties)
        });
    
    } else {

        var element = new element_htmltext({
            text   : plotobj.text,
            coords : plotobj.position,
            size   : plotobj.size[0],
            alignment : plotobj.alignment,
            offset     : plotobj.offset,
            style      : plotobj.style,
            properties : Material(plotobj.properties)
        });

    }
    
    return(element);

}


// Make some html text
export const element_htmltext = class htmltext extends element_base {

    constructor(args){

        super();

    	// Set defaults
    	if(!args.style)      args.style      = [];
    	if(!args.alignment)  args.alignment  = [0, 0];
    	if(!args.offset)     args.offset     = [0, 0];
    	if(!args.properties) args.properties = {};

    	// Create text div
	    var textdiv = document.createElement( 'div' );
	    
	    // Define color as hex
	    if(args.properties.color){
	        textdiv.style.color = 'rgb('
	        +args.properties.color.r+','
	        +args.properties.color.g+','
	        +args.properties.color.b
	        +")";
	    } else {
	        textdiv.style.color = 'inherit';
	    }
	    
	    // Set other styles and content
	    textdiv.style.fontSize = args.size+"px";
	    textdiv.textContent    = args.text;
	    apply_style(textdiv, args.style);

        // Add a non-selectable class
        textdiv.classList.add("not-selectable");
	    
	    // Create CSS text object
	    this.object = new CSS2DObject( textdiv );

	    // Set text object alignment
	    this.object.alignment = {
	        x: -50 + 50*args.alignment[0],
	        y: -50 - 50*args.alignment[1]
	    };

	    // Set text offset
	    textdiv.style.marginLeft = args.offset[0]+"px";
	    textdiv.style.marginTop  = args.offset[1]+"px";

	    // Set text object position
	    this.object.position.set(
	        args.coords[0],
	        args.coords[1],
	        args.coords[2]
	    );

    }

    show(){ this.object.element.hidden = false }
    hide(){ this.object.element.hidden = true  }
    setColor(color){
        if(color != "inherit") color = "#" + new THREE.Color(color).getHexString();
        this.object.element.style.color = color;
    }
    setStyle(property, value){
        this.object.element.style.setProperty(property, value);
    }
    setCoords(coords){
        this.object.position.fromArray(coords);
    }

}


// Make geometric text
export const element_text = class htmltext extends element_base {

    constructor(args){

        super();

        // Set defaults
        if(!args.alignment)  args.alignment  = [0, 0];
        if(!args.offset)     args.offset     = [0, 0];
        if(!args.properties) args.properties = {};

        // Adjust alignment
        args.alignment[0] = -args.alignment[0]/2 + 0.5;
        args.alignment[1] = -args.alignment[1]/2 + 0.5;

        var shapes    = Fonts.helvetiker.generateShapes( args.text, 1, 4 );
        var textShape  = new THREE.ShapeGeometry( shapes );

        var color = new THREE.Color(
                args.properties.color.r, 
                args.properties.color.g, 
                args.properties.color.b
        );
        
        var matLite = new THREE.MeshBasicMaterial( {
            color: color,
            side: THREE.DoubleSide
        });
        matLite.opacity = args.properties.opacity;

        // Align text
        textShape.computeBoundingBox();
        var xMid = - 0.5 * ( textShape.boundingBox.max.x - textShape.boundingBox.min.x );
        var yMid = - 0.5 * ( textShape.boundingBox.max.y - textShape.boundingBox.min.y );
        textShape.translate( xMid*2*args.alignment[0], yMid*2*args.alignment[1], 0 );

        // Offset text
        if(args.offset){
            textShape.translate( args.offset[0], args.offset[1], 0 );
        }

        var text = new THREE.Mesh( textShape, matLite );
        text.position.set(args.coords[0], args.coords[1], args.coords[2]);

        // Size text
        text.scale.set(args.size, args.size, args.size);

        this.object = text;
        text.element = this;

    }

}

