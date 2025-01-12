
export const HighlightMethods = {

  clickBackground(elements){
  },

  clickElements(elements, event){
    for(var i=0; i<elements.length; i++){
      elements[i].click(event);
    }
    this.sceneChange = true;
  },

  hoverElements(elements){
    for(var i=0; i<elements.length; i++){
      elements[i].hover();
    }
    this.sceneChange = true;
  },

  dehoverElements(elements){
    for(var i=0; i<elements.length; i++){
      elements[i].dehover();
    }
    this.sceneChange = true;
  },

}

