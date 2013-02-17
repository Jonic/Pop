// Generated by CoffeeScript 1.4.0
/*jshint plusplus:false, forin:false
*/

/*global Class
*/

/*global game
*/

'use strict';

var HeadsUp;

HeadsUp = Class.extend({
  init: function() {
    this.levelCounter = $('.level');
    this.scoreCounter = $('.score');
  },
  reset: function() {
    window.clearInterval(this.levelUpCounter);
  },
  setToInitialValues: function() {
    var self;
    self = this;
    this.level = 1;
    this.score = 0;
    this.comboMultiplier = 1;
    this.levelCounter.text(this.level);
    this.scoreCounter.text(this.score);
    this.levelUpCounter = window.setInterval(function() {
      self.updateLevel();
    }, game.config.levelUpInterval * 1000);
  },
  updateLevel: function() {
    this.level += 1;
    this.levelCounter.text(this.level);
    if (this.level >= game.config.maxLevel) {
      window.clearInterval(this.levelUpCounter);
    }
  },
  updateScore: function(targetSizeMultiplier) {
    var levelMultiplier, points, pointsAfterComboMultiplier;
    points = game.config.pointsPerPop + targetSizeMultiplier;
    pointsAfterComboMultiplier = points * this.comboMultiplier;
    levelMultiplier = this.level + 1;
    this.score += pointsAfterComboMultiplier * levelMultiplier;
    this.scoreCounter.text(this.score);
  }
});
