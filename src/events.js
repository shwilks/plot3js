
import { getMousePos } from './utils.js';

export const viewportEventMethods = {

    // Window focus event listener
    onwindowblur(event) {
        this.onkeyup();
        this.mouse.down = false;
        this.div.style.cursor = "default";
    },

    // Add window resize events
    onwindowresize() {

        // Resize camera
        this.viewer.camera.setSize(this.getWidth(), this.getHeight());
        this.viewer.renderer.setSize(this.getWidth(), this.getHeight());

        // Run any resize functions
        for (var i = 0; i < this.onresize.length; i++) {
            this.onresize[i]();
        }

        // Render the scene
        this.viewer.render();

    },


    // Add document key up down event listeners
    onkeydown(event) {
        this.keydown = event;
        if (this.keydown.key == "Meta") {
            this.div.style.cursor = "all-scroll";
            this.viewer.dragmode = true;
        }
    },

    onkeyup(event) {
        this.keydown = null;
        this.div.style.cursor = "default";
        this.viewer.dragmode = false;
    },

    // Set mouse move event
    onmousemove(event) {
        var mouse = getMousePos(event, this.div);
        this.mouse.deltaX = mouse.x - this.mouse.x;
        this.mouse.deltaY = mouse.y - this.mouse.y;
        this.mouse.x = mouse.x;
        this.mouse.y = mouse.y;
        this.mouse.shiftKey = event.shiftKey;
        this.viewer.raytraceNeeded = true;

        if (this.mouse.down) {
            var dist = (this.mouse.x - this.mouse.downX) * (this.mouse.x - this.mouse.downX)
                + (this.mouse.y - this.mouse.downY) * (this.mouse.y - this.mouse.downY)
            if (dist > 0.001) {
                this.mouse.moved = true;
            }
        }
    },


    // Add a touch move event listener
    ontouchmove(event) {

        event.preventDefault();

        var mouse = getMousePos(event.touches[0], this);
        this.mouse.deltaX = mouse.x - this.mouse.x;
        this.mouse.deltaY = mouse.y - this.mouse.y;
        this.mouse.x = mouse.x;
        this.mouse.y = mouse.y;

        if (this.touch.num > 1) {

            // this.mouse.scrollX = -20*this.mouse.deltaX;
            // this.mouse.scrollY = -20*this.mouse.deltaY;
            for (var i = 0; i < event.touches.length; i++) {
                var touch = getMousePos(event.touches[i], this);
                this.touch.touches[i].last_x = this.touch.touches[i].x;
                this.touch.touches[i].last_y = this.touch.touches[i].y;
                this.touch.touches[i].x = touch.x;
                this.touch.touches[i].y = touch.y;
                this.touch.touches[i].deltaX = this.touch.touches[i].last_x - this.touch.touches[i].x;
                this.touch.touches[i].deltaY = this.touch.touches[i].last_y - this.touch.touches[i].y;
            }
            var dist1 = Math.sqrt(
                Math.pow(this.touch.touches[0].last_x - this.touch.touches[1].last_x, 2) +
                Math.pow(this.touch.touches[0].last_y - this.touch.touches[1].last_y, 2)
            );
            var dist2 = Math.sqrt(
                Math.pow(this.touch.touches[0].x - this.touch.touches[1].x, 2) +
                Math.pow(this.touch.touches[0].y - this.touch.touches[1].y, 2)
            );
            // this.mouse.scrollX = -20*this.mouse.deltaX;
            this.mouse.scrollY = (dist2 - dist1) * 20;
        }
    },

    // Add mouse down and up listeners
    onmousedown(event) {
        //event.preventDefault();
        this.mouse.down = true;
        this.mouse.event = event;
        this.mouse.moved = false;
        this.mouse.downX = this.mouse.x;
        this.mouse.downY = this.mouse.y;
    },

    onmouseup(event) {
        document.activeElement.blur();
        this.mouse.down = false;
        this.mouse.event = event;

        var intersectedElements = this.viewer.raytracer.intersectedElements();
        if (intersectedElements.length === 0) {
            this.viewer.clickBackground(event);
        } else {
            this.viewer.clickElements(intersectedElements, event);
        }
    },

    ontouchdown(event) {
        event.preventDefault();
        document.activeElement.blur();

        this.touch.num = event.touches.length;
        if (event.touches.length == 1) {
            var mouse = getMousePos(event.touches[0], this);
            this.mouse.x = mouse.x;
            this.mouse.y = mouse.y;
            this.mouse.down = true;
            this.mouse.event = event;
            raytrace();
        } else {
            this.mouse.down = false;
            var touches = [];
            for (var i = 0; i < event.touches.length; i++) {
                var touch = getMousePos(event.touches[i], this);
                touches.push(touch);
            }
            this.touch.touches = touches;
        }
    },


    ontouchup(event) {
        this.mouse.down = false;
        this.mouse.event = event;
        this.touch.num = event.touches.length;
        if (this.viewer.intersected) {
            dehover_intersects(this.viewer.intersected);
            this.viewer.intersected = null;
        }
    },

    oncontextmenu(event) {
        this.mouse.down = false;
    },



    // Mouse over
    onmouseover(event) {
        this.mouse.over = true;
    },


    // Mouse out
    onmouseout(event) {
        this.mouse.over = false;
        this.mouse.down = false;
        if (this.viewer.intersected) {
            this.dehover_point(this.intersected[0].object);
            this.viewer.intersected = null;
        }
        this.viewer.render();
    },


    // Mouse scroll
    onmousescroll(event) {
        if (this.viewer.scrollFocus()) {
            event.preventDefault();
            this.mouse.scrollX = event.deltaX;
            this.mouse.scrollY = event.deltaY;
            this.mouse.scrollShift = event.shiftKey;
        }
    },

}





