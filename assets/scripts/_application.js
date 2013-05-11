// Generated by CoffeeScript 1.6.1
'use strict';
var AnimationLoop, Config, Game, HeadsUp, Input, Particle, ParticleGenerator, Scenes, State, Utils, android, animationLoop, animationLoopId, backingStoreRatio, canvas, config, context, debug, devicePixelRatio, game, headsUp, homeScreenApp, iOS, input, oldHeight, oldWidth, particleGenerator, ratio, scenes, state, utils;

android = navigator.userAgent.match(/android/i) ? true : false;

iOS = navigator.userAgent.match(/(iPad|iPhone|iPod)/i) ? true : false;

homeScreenApp = iOS && navigator.standalone;

debug = true;

animationLoopId = null;

canvas = document.createElement('canvas');

document.body.appendChild(canvas);

canvas.width = document.width;

canvas.height = document.height;

context = canvas.getContext('2d');

context.globalCompositeOperation = 'source-atop';

devicePixelRatio = window.devicePixelRatio || 1;

backingStoreRatio = context.webkitBackingStorePixelRatio || context.backingStorePixelRatio || 1;

ratio = devicePixelRatio / backingStoreRatio;

if (devicePixelRatio !== backingStoreRatio) {
  oldWidth = canvas.width;
  oldHeight = canvas.height;
  canvas.width = oldWidth * ratio;
  canvas.height = oldHeight * ratio;
  canvas.style.width = oldWidth + 'px';
  canvas.style.height = oldHeight + 'px';
  context.scale(ratio, ratio);
}

/* --------------------------------------------
     Begin AnimationLoop.coffee
--------------------------------------------
*/


AnimationLoop = (function() {

  function AnimationLoop() {}

  AnimationLoop.prototype.init = function() {
    this.requestAnimationFrame();
    return this;
  };

  AnimationLoop.prototype.cancelAnimationFrame = function() {
    window.cancelAnimationFrame(animationLoopId);
    return this;
  };

  AnimationLoop.prototype.requestAnimationFrame = function() {
    var self;
    self = this;
    animationLoopId = window.requestAnimationFrame(function() {
      self.requestAnimationFrame();
    });
    canvas.width = canvas.width;
    particleGenerator.animationLoopActions();
    return this;
  };

  return AnimationLoop;

})();

/* --------------------------------------------
     Begin Config.coffee
--------------------------------------------
*/


Config = (function() {

  function Config() {}

  Config.prototype.init = function() {
    this.maxLineWidth = 5;
    this.levelUpInterval = 10;
    this.maxLevel = 50;
    this.pointsPerPop = 10;
    this.chanceParticleIsTarget = {
      easy: 2,
      difficult: 3
    };
    this.maxTargetsAtOnce = {
      easy: 2,
      difficult: 4
    };
    this.minTargetSize = {
      easy: 80,
      difficult: 50
    };
    this.particleGrowthMultiplier = {
      easy: 1.05,
      difficult: 1.10
    };
    this.particleSpawnChance = {
      easy: 40,
      difficult: 100
    };
    this.sizeMax = {
      easy: 100,
      difficult: 60
    };
    this.targetVelocityMultiplier = {
      easy: 0.3,
      difficult: 0.5
    };
    this.velocityMin = {
      easy: -5,
      difficult: -8
    };
    this.velocityMax = {
      easy: 5,
      difficult: 8
    };
    this.propertiesToUpdateWithDifficulty = ['particleSpawnChance', 'chanceParticleIsTarget', 'particleGrowthMultiplier', 'sizeMax', 'maxTargetsAtOnce', 'minTargetSize', 'velocityMin', 'velocityMax', 'targetVelocityMultiplier'];
    return this;
  };

  Config.prototype.updateValuesForDifficulty = function() {
    var levelMulitplier, property, propertyConfig, valueDifference, _i, _len, _ref;
    _ref = this.propertiesToUpdateWithDifficulty;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      property = _ref[_i];
      propertyConfig = this[property];
      valueDifference = propertyConfig.difficult - propertyConfig.easy;
      levelMulitplier = state.level / this.maxLevel;
      state[property] = (valueDifference * levelMulitplier) + propertyConfig.easy;
    }
    return this;
  };

  return Config;

})();

/* --------------------------------------------
     Begin Game.coffee
--------------------------------------------
*/


Game = (function() {

  function Game() {}

  Game.prototype.init = function() {
    config.init();
    particleGenerator.init();
    scenes.init();
    state.init();
    headsUp.init();
    input.init();
    animationLoop.init();
    scenes.splash();
    return this;
  };

  Game.prototype.over = function() {
    scenes.gameOver();
    state.stopLevelUpIncrement();
    return this;
  };

  Game.prototype.reset = function() {
    return this;
  };

  Game.prototype.start = function() {
    state.setToInitialState();
    headsUp.setToInitialState();
    input.removeGameStartTapEventHandler();
    particleGenerator.setToInitialState();
    return this;
  };

  return Game;

})();

/* --------------------------------------------
     Begin HeadsUp.coffee
--------------------------------------------
*/


HeadsUp = (function() {

  function HeadsUp() {}

  HeadsUp.prototype.init = function() {
    var self;
    self = this;
    this.containerElement = document.querySelector('.headsup');
    this.levelCounter = '.hu-value-level';
    this.scoreCounter = '.hu-value-score';
    this.comboMultiplierCounter = '.hu-value-combo';
    return this;
  };

  HeadsUp.prototype.hide = function() {
    this.containerElement.classList.add('hidden');
    return this;
  };

  HeadsUp.prototype.setToInitialState = function() {
    this.updateComboMultiplierCounter();
    this.updateLevelCounter();
    this.updateScoreCounter();
    this.show();
    return this;
  };

  HeadsUp.prototype.show = function() {
    this.containerElement.classList.remove('hidden');
    return this;
  };

  HeadsUp.prototype.updateComboMultiplierCounter = function() {
    utils.updateUITextNode(this.comboMultiplierCounter, state.comboMultiplier);
    return this;
  };

  HeadsUp.prototype.updateLevelCounter = function() {
    utils.updateUITextNode(this.levelCounter, state.level);
    return this;
  };

  HeadsUp.prototype.updateScoreCounter = function() {
    var scoreToFormat;
    scoreToFormat = utils.formatWithComma(state.score);
    utils.updateUITextNode(this.scoreCounter, scoreToFormat);
    return this;
  };

  return HeadsUp;

})();

/* --------------------------------------------
     Begin Input.coffee
--------------------------------------------
*/


Input = (function() {

  function Input() {}

  Input.prototype.init = function() {
    this.cancelTouchMoveEvents();
    return this;
  };

  Input.prototype.addGameStartTapEventHandler = function() {
    document.body.addEventListener('click', this.gameStartTapEventHandler);
    return this;
  };

  Input.prototype.cancelTouchMoveEvents = function() {
    window.addEventListener('touchmove', function(event) {
      event.preventDefault();
    });
    return this;
  };

  Input.prototype.gameStartTapEventHandler = function(event) {
    event.preventDefault();
    scenes.summary.classList.add('hidden');
    game.start();
    return this;
  };

  Input.prototype.removeGameStartTapEventHandler = function() {
    document.body.removeEventListener('click', this.gameStartTapEventHandler);
    return this;
  };

  return Input;

})();

/* --------------------------------------------
     Begin Particle.coffee
--------------------------------------------
*/


Particle = (function() {

  function Particle() {}

  Particle.prototype.init = function() {
    var colors;
    colors = {
      r: utils.randomInteger(0, 200),
      g: utils.randomInteger(0, 200),
      b: utils.randomInteger(0, 200),
      a: utils.random(0.75, 1)
    };
    this.color = 'rgba(' + colors.r + ', ' + colors.g + ', ' + colors.b + ', ' + colors.a + ')';
    this.destroying = false;
    this.finalSize = utils.randomInteger(0, state.sizeMax);
    this.id = Math.random().toString(36).substr(2, 5);
    this.isTarget = this.determineTargetParticle();
    this.position = {
      x: particleGenerator.particlesOrigin.x,
      y: particleGenerator.particlesOrigin.y
    };
    this.size = 1;
    this.velocity = {
      x: utils.random(state.velocityMin, state.velocityMax),
      y: utils.random(state.velocityMin, state.velocityMax)
    };
    if (this.isTarget) {
      this.color = 'rgba(' + colors.r + ', ' + colors.g + ', ' + colors.b + ', 0.8)';
      this.finalSize = utils.randomInteger(state.minTargetSize, state.sizeMax);
      this.velocity.x *= state.targetVelocityMultiplier;
      this.velocity.y *= state.targetVelocityMultiplier;
    }
    return this;
  };

  Particle.prototype.determineTargetParticle = function() {
    var isTarget;
    isTarget = false;
    if (particleGenerator.particlesToTestForTaps.length < state.maxTargetsAtOnce) {
      isTarget = utils.randomPercentage() < state.chanceParticleIsTarget;
    }
    return isTarget;
  };

  Particle.prototype.draw = function() {
    if (this.outsideCanvasBounds()) {
      particleGenerator.particlesToDelete.push(this.id);
      return;
    }
    if (this.isTarget) {
      this.lineWidth = this.size / 10;
      if (this.lineWidth > config.maxLineWidth) {
        this.lineWidth = config.maxLineWidth;
      }
      context.fillStyle = 'rgba(247, 247, 247, 0.9)';
      context.lineWidth = this.lineWidth;
    }
    context.beginPath();
    context.arc(this.position.x, this.position.y, this.half, 0, Math.PI * 2, true);
    context.fill();
    if (this.isTarget) {
      context.stroke();
    }
    context.closePath();
    return this;
  };

  Particle.prototype.outsideCanvasBounds = function() {
    var beyondBoundsX, beyondBoundsY;
    beyondBoundsX = this.position.x < -this.finalSize || this.position.x > canvas.width + this.finalSize;
    beyondBoundsY = this.position.y < -this.finalSize || this.position.y > canvas.height + this.finalSize;
    return beyondBoundsX || beyondBoundsY;
  };

  Particle.prototype.updateValues = function() {
    var shrinkMultiplier;
    if (this.destroying) {
      shrinkMultiplier = state.gameState === 'playing' ? 0.7 : 0.9;
      this.size *= shrinkMultiplier;
    } else {
      if (this.size < this.finalSize) {
        this.size *= state.particleGrowthMultiplier;
      }
      if (this.size > this.finalSize) {
        this.size = this.finalSize;
      }
    }
    this.half = this.size / 2;
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    this.draw();
    return this;
  };

  return Particle;

})();

/* --------------------------------------------
     Begin ParticleGenerator.coffee
--------------------------------------------
*/


ParticleGenerator = (function() {

  function ParticleGenerator() {}

  ParticleGenerator.prototype.init = function() {
    this.particlesOrigin = {
      x: canvas.width / 2,
      y: canvas.height / 2
    };
    this.setToInitialState();
    this.setupParticleTapDetection();
    return this;
  };

  ParticleGenerator.prototype.animationLoopActions = function() {
    if (state.gameState === 'playing') {
      this.generateParticle();
    }
    this.updateParticlesValues();
    this.removeParticlesAfterTap();
    if (this.particlesToDelete.length > 0) {
      this.destroyParticlesOutsideCanvasBounds();
    }
    return this;
  };

  ParticleGenerator.prototype.destroyParticlesOutsideCanvasBounds = function() {
    var particle, particleId, particleIndex, _i, _len, _ref;
    _ref = this.particlesToDelete;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      particleId = _ref[_i];
      particleIndex = this.particlesArrayIds.indexOf(particleId);
      particle = this.particlesArray[particleIndex];
      if (particle != null) {
        if (particle.isTarget) {
          this.gameOver();
        }
        this.removeParticle(particle);
      }
    }
    this.particlesToDelete = [];
    return this;
  };

  ParticleGenerator.prototype.gameOver = function() {
    var particle, _i, _len, _ref;
    this.stop();
    _ref = this.particlesArray;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      particle = _ref[_i];
      particle.destroying = true;
    }
    state.particleSpawnChance = 0;
    game.over();
    return this;
  };

  ParticleGenerator.prototype.generateParticle = function() {
    var newParticle, particle;
    if (utils.randomPercentage() < state.particleSpawnChance) {
      newParticle = new Particle();
      particle = newParticle.init();
      this.particlesArray.push(particle);
      this.particlesArrayIds.push(particle.id);
      if (particle.isTarget) {
        this.particlesToTestForTaps.push(particle.id);
      }
    }
    return this;
  };

  ParticleGenerator.prototype.particleTapDetectionHandler = function() {
    var deletionIndex, particle, particleId, particleIndex, targetHit, touchData, _i, _len, _ref;
    targetHit = false;
    _ref = this.particlesToTestForTaps.reverse();
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      particleId = _ref[_i];
      particleIndex = this.particlesArrayIds.indexOf(particleId);
      particle = this.particlesArray[particleIndex];
      touchData = event.touches[0];
      if ((particle != null) && this.particleWasTapped(particle, touchData)) {
        deletionIndex = this.particlesToTestForTaps.indexOf(particleId);
        this.particlesToTestForTaps.splice(deletionIndex, 1);
        particle.destroying = true;
        targetHit = true;
        break;
      }
    }
    state.updateComboMultiplier(targetHit);
    if (targetHit) {
      state.updateScore(particle.size, particle.finalSize);
    }
    return this;
  };

  ParticleGenerator.prototype.particleWasTapped = function(particle, touchData) {
    var hitX, hitY, maxX, maxY, minX, minY, tapX, tapY;
    tapX = touchData.pageX * devicePixelRatio;
    tapY = touchData.pageY * devicePixelRatio;
    minX = particle.position.x - particle.half;
    maxX = minX + particle.size;
    hitX = tapX >= minX && tapX <= maxX;
    minY = particle.position.y - particle.half;
    maxY = minY + particle.size;
    hitY = tapY >= minY && tapY <= maxY;
    return hitX && hitY;
  };

  ParticleGenerator.prototype.removeParticle = function(particle) {
    var id, index;
    id = particle.id;
    index = this.particlesArrayIds.indexOf(id);
    this.particlesArray.splice(index, 1);
    this.particlesArrayIds.splice(index, 1);
    return this;
  };

  ParticleGenerator.prototype.removeParticlesAfterTap = function() {
    var particle, _i, _len, _ref;
    _ref = this.particlesArray;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      particle = _ref[_i];
      if ((particle != null) && particle.size < 1) {
        this.removeParticle(particle);
      }
    }
    return this;
  };

  ParticleGenerator.prototype.setToInitialState = function() {
    this.particlesArray = [];
    this.particlesArrayIds = [];
    this.particlesToDelete = [];
    this.particlesToTestForTaps = [];
    return this;
  };

  ParticleGenerator.prototype.setupParticleTapDetection = function() {
    var self;
    self = this;
    this.particlesToTestForTaps = [];
    window.addEventListener('touchstart', function() {
      self.particleTapDetectionHandler();
    });
    return this;
  };

  ParticleGenerator.prototype.stop = function() {
    state.updateGameState('stopped');
    state.stopLevelUpIncrement();
    return this;
  };

  ParticleGenerator.prototype.updateParticlesValues = function() {
    var particle, _i, _len, _ref;
    _ref = this.particlesArray;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      particle = _ref[_i];
      if (particle != null) {
        context.fillStyle = particle.color;
        context.strokeStyle = particle.color;
        particle.updateValues();
      }
    }
    return this;
  };

  return ParticleGenerator;

})();

/* --------------------------------------------
     Begin Scenes.coffee
--------------------------------------------
*/


Scenes = (function() {

  function Scenes() {}

  Scenes.prototype.init = function() {
    this.summary = document.querySelector('.summary');
    this.playAgain = document.querySelector('.play-again');
    return this;
  };

  Scenes.prototype.credits = function() {
    return this;
  };

  Scenes.prototype.gameOver = function() {
    input.addGameStartTapEventHandler();
    this.summary.classList.remove('hidden');
    return this;
  };

  Scenes.prototype.howToPlay = function() {
    return this;
  };

  Scenes.prototype.installationPrompt = function() {
    utils.updateUITextNode('body', 'ADD THIS TO YOUR HOME SCREEN TO PLAY');
    return this;
  };

  Scenes.prototype.mobilePrompt = function() {
    utils.updateUITextNode('body', 'YOU NEED TO RUN THIS ON A MOBILE DEVICE');
    return this;
  };

  Scenes.prototype.splash = function() {
    this.title();
    return this;
  };

  Scenes.prototype.title = function() {
    input.addGameStartTapEventHandler();
    return this;
  };

  return Scenes;

})();

/* --------------------------------------------
     Begin State.coffee
--------------------------------------------
*/


State = (function() {

  function State() {}

  State.prototype.init = function() {
    this.defaults = {
      level: 1,
      score: 0,
      comboMultiplier: 0
    };
    return this;
  };

  State.prototype.stopLevelUpIncrement = function() {
    window.clearInterval(this.levelUpCounter);
    return this;
  };

  State.prototype.setupLevelUpIncrement = function() {
    var self;
    self = this;
    this.levelUpCounter = window.setInterval(function() {
      self.updateLevel();
    }, config.levelUpInterval * 1000);
    return this;
  };

  State.prototype.setToInitialState = function() {
    this.level = this.defaults.level;
    this.score = this.defaults.score;
    this.comboMultiplier = this.defaults.comboMultiplier;
    this.chanceParticleIsTarget = config.chanceParticleIsTarget.easy;
    this.maxTargetsAtOnce = config.maxTargetsAtOnce.easy;
    this.minTargetSize = config.minTargetSize.easy;
    this.particleGrowthMultiplier = config.particleGrowthMultiplier.easy;
    this.particleSpawnChance = config.particleSpawnChance.easy;
    this.sizeMax = config.sizeMax.easy;
    this.targetVelocityMultiplier = config.targetVelocityMultiplier.easy;
    this.velocityMin = config.velocityMin.easy;
    this.velocityMax = config.velocityMax.easy;
    this.updateGameState('playing');
    config.updateValuesForDifficulty();
    this.setupLevelUpIncrement();
    return this;
  };

  State.prototype.updateComboMultiplier = function(targetHit) {
    this.comboMultiplier = targetHit ? this.comboMultiplier + 1 : this.defaults.comboMultiplier;
    headsUp.updateComboMultiplierCounter();
    return this;
  };

  State.prototype.updateGameState = function(newState) {
    this.gameState = newState;
    return this;
  };

  State.prototype.updateLevel = function() {
    this.level += 1;
    if (this.level >= config.maxLevel) {
      window.clearInterval(this.levelUpCounter);
    }
    headsUp.updateLevelCounter();
    config.updateValuesForDifficulty();
    return this;
  };

  State.prototype.updateScore = function(sizeWhenTapped, sizeWhenFullyGrown) {
    var levelMultiplier, popPointValue, targetSizeBonus;
    targetSizeBonus = Math.round(100 - ((sizeWhenTapped / sizeWhenFullyGrown) * 100));
    popPointValue = config.pointsPerPop + targetSizeBonus;
    levelMultiplier = this.level + 1;
    this.score += (popPointValue * this.comboMultiplier) * levelMultiplier;
    headsUp.updateScoreCounter();
    return this;
  };

  return State;

})();

/* --------------------------------------------
     Begin Utils.coffee
--------------------------------------------
*/


Utils = (function() {

  function Utils() {}

  Utils.prototype.correctValueForDPR = function(value, integer) {
    if (integer == null) {
      integer = false;
    }
    value *= devicePixelRatio;
    if (integer) {
      value = Math.round(value);
    }
    return value;
  };

  Utils.prototype.formatWithComma = function(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  Utils.prototype.random = function(min, max) {
    if (min === void 0) {
      min = 0;
      max = 1;
    } else if (max === void 0) {
      max = min;
      min = 0;
    }
    return (Math.random() * (max - min)) + min;
  };

  Utils.prototype.randomColor = function(alpha) {
    var colors;
    if (alpha == null) {
      alpha = false;
    }
    colors = {
      r: this.randomInteger(0, 200),
      g: this.randomInteger(0, 200),
      b: this.randomInteger(0, 200),
      a: !alpha ? this.random(0.75, 1) : alpha
    };
    return 'rgba(' + colors.r + ', ' + colors.g + ', ' + colors.b + ', ' + colors.a + ')';
  };

  Utils.prototype.randomInteger = function(min, max) {
    if (max === void 0) {
      max = min;
      min = 0;
    }
    return Math.floor(Math.random() * (max + 1 - min)) + min;
  };

  Utils.prototype.randomPercentage = function() {
    return Math.floor(Math.random() * 100);
  };

  Utils.prototype.updateUITextNode = function(selector, value) {
    var element;
    element = document.querySelector(selector);
    element.innerHTML = value;
    return this;
  };

  return Utils;

})();

/* --------------------------------------------
     Begin _bootstrap.coffee
--------------------------------------------
*/


animationLoop = new AnimationLoop();

config = new Config();

game = new Game();

headsUp = new HeadsUp();

input = new Input();

particleGenerator = new ParticleGenerator();

utils = new Utils();

scenes = new Scenes();

state = new State();

if (android || homeScreenApp || debug) {
  game.init();
} else if (iOS) {
  scenes.installationPrompt();
} else {
  scenes.mobilePrompt();
}
