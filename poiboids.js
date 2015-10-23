function gravity(e1, e2) {
    var G = 0.0001,
        d = e1.position.subtract(e2.position),
        r = e1.position.distanceFrom(e2.position),
        t = d.toUnitVector();

    // TODO mass?
    if (r > 0) {
        return t.multiply(G/r*r);
    } else {
        return $V([0, 0]);
    }
}

/**
 * Takes a function:
 * x.f(y) = z
 * and returns a function so it may be called:
 * g(x, y) = z
 */
function unmethodify(method) {
    return function unmethodify$1() {
        var rest = [],
            i;
        for (i = 1; i < arguments.length; i++) {
            rest.push(arguments[i]);
        }
        method.call(arguments[0], rest);
    }
}

/**
 * Constructor for boids.  Takes a jQuery object for the DOM element to
 * turn into a boid.
 * Does not add them to the global BOIDS array.  You'll have to do that yourself.
 */
function Boid(el) {
    var pos;
    this.$ = $(el);
    pos = this.$.position();

    this.position = $V([pos.left, pos.top]);
    this.velocity = $V([0, 0]);
    this.acceleration = $V([0, 0]);
    // TODO front, angular velocity?
    // TODO mass

    this.step = function step() {
        var forces = [],
            i;
        this.position =
            this.position.add(this.velocity);
        this.velocity =
            this.velocity.add(this.acceleration);

        forces = [];
        for (i = 0; i < BOIDS.length; i++) {
            forces.push(this.force(BOIDS[i]));
        }

        for (i = 0; i < forces.length; i++) {
            this.acceleration =
                this.acceleration.add(forces[i]);
        }

        this.$.css('left', this.position.e(1));
        this.$.css('top', this.position.e(2));
    };

    this.force = function force(that) {
        return gravity(this, that);
    };

    return this;
}

var BOIDS = [];

$(function() {
    $('.content > *').css('position', 'relative').each(function () { BOIDS.push(new Boid(this)); });
    window.setInterval(function () {
        BOIDS.forEach(function (el) {
            el.step();
        });
    },
                      50);
});
