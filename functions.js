function trajectory(position, velocity, maxIterations, scale) {
    var points = [],
        vel = [],
        length = 0;
    fullOrbit = gravity(position).toRad() + Math.PI,
        currentAngle = 0,
        looped = false,
        playerDistance = position.distance(planet),
        lastDistance = Vector.zero,
        apoapsis = Vector.zero,
        apoapsisDistance = 0;
    periapsis = Vector.zero;
    periapsisDistance = 0;

    scale /= Math.pow(maxIterations, 1.5);

    points[0] = position;
    vel[0] = velocity;

    for (let i = 1; i < maxIterations; i++) {
        let gravForce = gravity(points[i - 1]);
        lastDistance = points[i - 1].distance(planet);
        length = scale * Math.pow(lastDistance, 1.5);

        if (gravForce != Vector.zero) {
            collisionCourse = false;
            if (currentAngle > fullOrbit) {
                looped = true;
            }

            if (looped && currentAngle < fullOrbit + 0.1) {
                points[i] = position;
                break;
            } else {
                currentAngle = gravForce.toRad() + Math.PI;
                vel[i] = vel[i - 1].add(gravForce.multiply(length));
                points[i] = points[i - 1].add(vel[i].multiply(length));
            }

            var distance = points[i].distance(planet);
            if (distance > apoapsisDistance) {
                if (playerDistance > distance) {
                    apoapsis = position;
                } else {
                    apoapsis = points[i];
                    apoapsisDistance = distance;
                }
            }
            if (distance < periapsisDistance || periapsisDistance === 0) {
                periapsis = points[i];
                periapsisDistance = distance;
            }
        } else {
            collisionCourse = true;
            break;
        }
    }

    apoapsisIcon.position.set(apoapsis.x, apoapsis.y);
    periapsisIcon.position.set(periapsis.x, periapsis.y);

    return points;
}

function lerp(start, end, percent) {
    return (1 - percent) * start + percent * end;
}

function keyboard(value) {
    let key = {};
    key.value = value;
    key.isDown = false;
    key.isUp = true;
    key.press = undefined;
    key.release = undefined;

    // Key down handler
    key.downHandler = event => {
        if (event.key === key.value) {
            if (key.isUp && key.press) key.press();
            key.isDown = true;
            key.isUp = false;
            event.preventDefault();
        }
    };

    // Key up handler
    key.upHandler = event => {
        if (event.key === key.value) {
            if (key.isDown && key.release) key.release();
            key.isDown = false;
            key.isUp = true;
            event.preventDefault();
        }
    };

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

function gravity(position) {
    let relativePosition = position.distanceTo(planet);
    let distance = relativePosition.magnitude();
    if (distance > planet.radius) {
        let direction = relativePosition.normalized();
        let gravForce = (planet.radius * 100 * 10) / (distance * distance);
        return direction.multiply(gravForce);
    } else {
        return Vector.zero;
    }
}

function clamp(num, min, max) {
    return num <= min ? min : num >= max ? max : num;
}

function loop(num, min, max) {
    return num < min ? max : num > max ? min : num;
}

function changeTimeWarpText(text) {
    timeWarpText.alpha = 4;
    timeWarpText.text = text;
}

function animate(object, animationName, loop = false, delta = 1) {
    let animation = json.meta.frameTags.find(x => x.name === animationName);

    if (object.lastAnimation !== animationName) {
        object.frame = animation.from;
    }

    if (object.frame < animation.to + 1) {
        let spriteNumber = object.frame - (object.frame % 1);
        object.texture = id["Space Tilesheet " + spriteNumber + ".aseprite"];
        let frameDuration =
            json.frames["Space Tilesheet " + spriteNumber + ".aseprite"].duration;
        object.frame += 1 / (((60 / delta) * frameDuration) / 1000);
    } else if (loop) {
        object.frame = animation.from;
    } else {
        object.frame = animation.to;
    }
    object.lastAnimation = animationName;
}

function createArray(length) {
    var arr = new Array(length || 0),
        i = length;

    if (arguments.length > 1) {
        var args = Array.prototype.slice.call(arguments, 1);
        while (i--) arr[length - 1 - i] = createArray.apply(this, args);
    }

    return arr;
}