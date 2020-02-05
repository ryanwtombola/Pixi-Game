import { Vector } from './utilites';

class Input {
    static mouse() {
        let mouse: any = {};
        mouse.screenPosition = Vector.zero;
        mouse.wheel = 0;

        window.addEventListener("mousemove", e => {
            mouse.screenPosition = new Vector(e.clientX, e.clientY);
        }, false);

        window.addEventListener("wheel", (event: any) => {
            mouse.wheel = event.deltaY;
        });

        return mouse;
    }

    static keyboard(value: any) {
        let key: any = {};
        key.value = value;
        key.isDown = false;
        key.isUp = true;
        key.press = undefined;
        key.release = undefined;

        // Key down handler
        key.downHandler = (event: any) => {
            if (event.key === key.value) {
                if (key.isUp && key.press)
                    key.press();
                key.isDown = true;
                key.isUp = false;
                event.preventDefault();
            }
        };

        // Key up handler
        key.upHandler = (event: any) => {
            if (event.key === key.value) {
                if (key.isDown && key.release)
                    key.release();
                key.isDown = false;
                key.isUp = true;
                event.preventDefault();
            }
        }

        // Attach event listeners
        const downListner = key.downHandler.bind(key);
        const upListner = key.upHandler.bind(key);

        window.addEventListener("keydown", downListner, false);
        window.addEventListener("keyup", upListner, false);

        // Detach event listners
        key.unsubscribe = () => {
            window.removeEventListener("keydown", downListner);
            window.removeEventListener("keyup", upListner);
        };

        return key;
    }

}

export const left = Input.keyboard("a"),
    right = Input.keyboard("d"),
    up = Input.keyboard("w"),
    down = Input.keyboard("s"),
    mouse = Input.mouse();