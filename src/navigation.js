
import { ArcballControls } from 'three/addons/controls/ArcballControls.js';

export const NavMethods = {

    scrollFocus() {
        // return this.viewport.holder.matches(':focus');
        return true;
    },

    bindNavigation() {

        var addCameraControls = (camera) => {

            const controls = new ArcballControls(
                camera.get3JSCamera(),
                this.viewport.canvas,
                this.scene.get3JSScene()
            );

            controls.setGizmosVisible(false);
            controls.unsetMouseAction('WHEEL', 'SHIFT');
            controls.unsetMouseAction(1, 'SHIFT');

            window.addEventListener('keydown', (event) => {
                if (event.key === 'Shift') {
                    console.log("UNSET");
                    controls.unsetMouseAction('WHEEL', null);
                }
            });

            window.addEventListener('keyup', (event) => {
                if (event.key === 'Shift') {
                    console.log("SET");
                    controls.setMouseAction('ZOOM', 'WHEEL', null);
                }
            });

            controls.addEventListener('change', () => {

                this.scene.showhideDynamics(this.camera);
                this.updateTransformInfo();
                this.render();

            });

            return controls;

        }

        this.perspcontrols = addCameraControls(this.camera.perspcamera);
        this.orthocontrols = addCameraControls(this.camera.orthocamera);

        this.viewport.canvas.addEventListener("wheel", function (event) {

            if (event.shiftKey) {
                var viewer = this.viewport.viewer;
                viewer.rockScene(event.deltaY);
                viewer.updateTransformInfo();
            }

        });

    },

    rockScene(value) {

        this.camera.rotate(-value * 0.01);

    },

};

