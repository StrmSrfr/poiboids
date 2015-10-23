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

    return this;
}

var BOIDS = [];

$(function() {
    $('.content > *').css('position', 'relative').each(function () { BOIDS.push(new Boid(this)); });
});
