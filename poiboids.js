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
    // TODO angular velocity?
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
    var density = 1/39,
        r = $(el).attr('r'),
        that = this;

    this.$ = $(this);

    this.setR = function setR(r) {
        that.r = r;
        that.mass = r*r*Math.PI*density;
        that.$.attr('r', r);
    }

    this.setR(r);

    Mass.call(this, el, this.mass);

    this.inspect = function inspect() {
        INSPECTOR.inspect(that);
    }

    this.$.click(this.inspect);

    this.force = function nilForce() {
        return $V([0, 0]);
    }

    this.setX = function setX(x) {
        that.position = $V([x, that.position.e(2)]);
        that.$.attr('cx', +x + +that.r);
    }

    this.setY = function setY(y) {
        that.position = $V([that.position.e(1), y]);
        that.$.attr('cy', +y + +that.r);
    }

    this.setColor = function setColor(c) {
        that.$.attr('fill', c);
    }

    this.remove = function remove() {
        that.$.remove();
        POI.splice(POI.indexOf(that), 1);
        MASSES.splice(MASSES.indexOf(that), 1);
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
    text.detach();
}

function stepBoids() {
    BOIDS.forEach(function (el) {
        el.step();
    });
}

function Inspector(el) {
    var that = this;

    this.$ = $(el);
    this.$x = this.$.find('#PoiX');
    this.$y = this.$.find('#PoiY');
    this.$r = this.$.find('#PoiSize');
    this.$c = this.$.find('#PoiColor');

    this.$.find('.saveButton').click(function save() {
        var poi = that.inspecting,
            x = that.$x.val(),
            y = that.$y.val(),
            r = that.$r.val(),
            c = that.$c.val();
        poi.setX(x);
        poi.setY(y);
        poi.setR(r);
        poi.setColor(c);
        if (POI.indexOf(poi) < 0) {
            POI.push(poi);
        }
        if (MASSES.indexOf(poi) < 0) {
            MASSES.push(poi);
        }
    });

    this.$.find('.deleteButton').click(function del() {
        var poi = that.inspecting;
        if (poi) {
            poi.remove();
            that.deinspect(poi);
        }
    });

    this.$.find('.newButton').click(function add() {
        var poi = that.inspecting,
            dom = newCircle({
                class: "poi",
                cx: "300",
                cy: "300",
                r: "50",
                stroke: "black",
                "stroke-width": "2",
                fill: "#0000ff"
            });

        if (poi) {
            that.deinspect(poi);
        }

        poi = new Poi(dom);
        that.inspect(poi);
    });

    this.inspect = function inspect(poi) {
        var old = that.inspecting;
        if (old) {
            that.deinspect(old);
            if (old === poi) {
                /* already selected, just deselect */
                return;
            }
        }

        this.$x.val(poi.position.e(1));
        this.$y.val(poi.position.e(2));
        this.$r.val(poi.r);
        this.$c.val(poi.$.attr('fill'));

        poi.$.css('outline-color', 'rgba(240,248,255,128)'); // 50% AliceBlue
        poi.$.css('outline-width', 'thick');
        poi.$.css('outline-style', 'solid');

        this.inspecting = poi;
    }

    this.deinspect = function deinspect(poi) {
        poi.$.css('outline-style', 'none');
        this.$x.val('');
        this.$y.val('');
        this.$r.val('');
        this.$c.val('');
        this.inspecting = undefined;
    }
}

function newCircle(attributes) {
    var svg = document.createElementNS('http://www.w3.org/2000/svg',
                                       'svg'),
        circle = document.createElementNS('http://www.w3.org/2000/svg',
                                          'circle'),
        dom = $(circle);
    dom.attr(attributes);
    dom.appendTo('#svg');
    return dom;
}

var INSPECTOR;

function loadPoi() {
    var poi = localStorage.getItem('poi');
    poi.forEach(function (p) {
        var circle = newCircle(p),
            poi = new Poi(circle);

        POI.push(poi);
        MASSES.push(poi);
    });
}

function start() {
    if (localStorage.getItem('poi')) {
        $('.poi').each(function () {
            $(this).remove();
        });
        loadPoi();
    }

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
    $('.inspector').each(function () {
        INSPECTOR = new Inspector(this);
    });
    window.setInterval(stepBoids,
                      50);
}

$(function() {
    start();
});
