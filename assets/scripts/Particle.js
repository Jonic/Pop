// Generated by CoffeeScript 1.4.0
/*jshint plusplus:false, forin:false
*/

/*global Class
*/

/*global canvas, context, game, particleGenerator, utils
*/

'use strict';

var Particle;

Particle = Class.extend({
  init: function() {
    var colors, self;
    self = this;
    colors = {
      r: utils.randomInteger(0, 255),
      g: utils.randomInteger(0, 255),
      b: utils.randomInteger(0, 255)
    };
    this.color = 'rgb(' + colors.r + ', ' + colors.g + ', ' + colors.b + ')';
    this.size = 1;
    this.finalSize = utils.randomInteger(game.config.sizeMin, game.config.sizeMax);
    this.half = Math.round(this.size / 2);
    this.position = {
      x: particleGenerator.particlesOrigin.x,
      y: particleGenerator.particlesOrigin.y
    };
    this.velocity = {
      x: utils.random(game.config.velocityMin, game.config.velocityMax),
      y: utils.random(game.config.velocityMin, game.config.velocityMax)
    };
    this.id = Math.random().toString(36).substr(2, 5);
    this.isTarget = this.determineTargetParticle();
    if (this.isTarget) {
      this.velocity.x = this.velocity.x * game.config.targetVelocityMultiplier;
      this.velocity.y = this.velocity.y * game.config.targetVelocityMultiplier;
      this.lineWidth = 1;
      particleGenerator.particlesToTestForTaps.push(this.id);
    }
  },
  determineTargetParticle: function() {
    if (this.finalSize >= game.config.minTargetSize) {
      return Math.floor(Math.random() * 101) < game.config.chanceParticleIsTarget;
    }
  },
  draw: function() {
    if (this.withinCanvasBounds()) {
      context.beginPath();
      context.arc(this.position.x, this.position.y, this.half, 0, Math.PI * 2, true);
      if (this.isTarget) {
        context.fillStyle = 'rgb(255, 255, 255)';
        context.lineWidth = this.lineWidth;
        context.stroke();
        if (this.lineWidth < game.config.maxLineWidth) {
          this.lineWidth = this.lineWidth * 1.1;
        } else if (this.lineWidth > game.config.maxLineWidth) {
          this.lineWidth = game.config.maxLineWidth;
        }
      }
      context.fill();
      context.closePath();
    } else {
      particleGenerator.particlesToDelete.push(this.id);
    }
  },
  updateValues: function() {
    if (this.size < this.finalSize) {
      this.size = this.size * game.config.particleGrowthMultiplier;
    }
    if (this.size > this.finalSize) {
      this.size = this.finalSize;
    }
    this.half = Math.round(this.size / 2);
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  },
  withinCanvasBounds: function() {
    var beyondBoundsX, beyondBoundsY;
    beyondBoundsX = this.position.x < -this.size || this.position.x > canvas.width + this.size;
    beyondBoundsY = this.position.y < -this.size || this.position.y > canvas.height + this.size;
    return !(beyondBoundsX || beyondBoundsY);
  }
});
