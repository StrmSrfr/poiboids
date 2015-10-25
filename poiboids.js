function gravity(e1, e2) {
    var G = 0.0001,
        d = e2.position.subtract(e1.position),
        r = e1.position.distanceFrom(e2.position),
        t = d.toUnitVector();

    if (r > 0) {
        return t.multiply(G*e1.mass*e2.mass/r*r);
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

function Mass(el, mass) {
    var pos;
    this.$ = $(el);
    pos = this.$.offset();

    this.position = $V([pos.left, pos.top]);
    this.velocity = $V([0, 0]);
    this.acceleration = $V([0, 0]);
    // TODO front, angular velocity?
    this.mass = mass;
    this.step = function step() {
        var forces = [],
            i;
        this.position =
            this.position.add(this.velocity);

        this.accelerate();

        forces = [];
        for (i = 0; i < MASSES.length; i++) {
            forces.push(this.force(MASSES[i]));
        }

        for (i = 0; i < forces.length; i++) {
            this.acceleration =
                this.acceleration.add(forces[i]);
        }

        this.$.css('left', this.position.e(1));
        this.$.css('top', this.position.e(2));
        this.$.css('position', 'absolute');
    };

    this.accelerate = function accelerate() {
        var terminal = 3, // decided by a fair die roll
            nv = this.velocity.add(this.acceleration);

        terminal *= 3; // units are negotiable

        if (nv.modulus() > terminal) {
            this.velocity = nv.toUnitVector().multiply(terminal);
        } else {
            this.velocity = nv;
        }
    }

    return this;
}

/**
 * Constructor for boids.  Takes a jQuery object for the DOM element to
 * turn into a boid.
 * Does not add them to the global BOIDS array.  You'll have to do that yourself.
 */
function Boid(el) {
    Mass.call(this, el, 1);
    this.force = function force(that) {
        return gravity(this, that);
    };

    return this;
}

function Poi(el) {
    var r = $(el).attr('r'),
        mass = r*r*Math.PI/39;

    Mass.call(this, el, mass);
    this.force = function nilForce() {
        return $V([0, 0]);
    }
}

var BOIDS = [];
var POI = [];
var MASSES = [];

function spanifyText(parent) {
    http://stackoverflow.com/a/7824394
    var text =
        $(parent).find('*').contents().filter(function () {
            return this.nodeType === 3;
        });
    text.each(function (idx, el) {
        var text = $(el).text(),
            parent = $(el).parent(),
            i;
        for (i = 0; i < text.length; i++) {
            parent.append('<span class="boid">' +
                          text.charAt(i) +
                          '</span>');
        }
        parent.append($('<span class="spacer"></span>').text(text)
                      .css('color', parent.css('background-color'))
                     );
    });
/*
    text.parent().css('color', text.parent().css('background-color'));
*/
    text.detach();
}

function stepBoids() {
    BOIDS.forEach(function (el) {
        el.step();
    });
}

$(function() {
    spanifyText($('.content > *'));
    $('.boid').each(function () {
        var boid = (new Boid(this));
        MASSES.push(boid);
        BOIDS.push(boid);
    });
    $('.poi').each(function () {
        var poi = (new Poi(this));
        MASSES.push(poi);
        POI.push(poi);
    });
    window.setInterval(stepBoids,
                      50);
});
