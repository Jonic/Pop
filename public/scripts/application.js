var AnimationLoop;

AnimationLoop = (function() {
  function AnimationLoop() {}

  AnimationLoop.prototype.init = function() {
    this.requestAnimationFrame();
    this.animationLoopId;
    return this;
  };

  AnimationLoop.prototype.cancelAnimationFrame = function() {
    window.cancelAnimationFrame(this.animationLoopId);
    return this;
  };

  AnimationLoop.prototype.requestAnimationFrame = function() {
    var self;
    self = this;
    this.animationLoopId = window.requestAnimationFrame(function() {
      self.requestAnimationFrame();
    });
    canvas.width = canvas.width;
    particleGenerator.animationLoopActions();
    return this;
  };

  return AnimationLoop;

})();

var Config;

Config = (function() {
  function Config() {}

  Config.prototype.init = function() {
    var baseParticleWidth, baseScreenWidth;
    this.particleWidthAsPercentageOfScreen = 15;
    baseScreenWidth = Math.min(document.body.clientWidth, document.body.clientHeight);
    baseParticleWidth = Math.round((baseScreenWidth / 100) * this.particleWidthAsPercentageOfScreen);
    this.baseParticleSize = baseParticleWidth * devicePixelRatio;
    this.maxLineWidth = 5;
    this.levelUpInterval = 5;
    this.maxLevel = 50;
    this.pointsPerPop = 10;
    this.chanceParticleIsTarget = {
      easy: 50,
      difficult: 90
    };
    this.maxTargetsAtOnce = {
      easy: 3,
      difficult: 6
    };
    this.minTargetSize = {
      easy: this.baseParticleSize * 0.7,
      difficult: this.baseParticleSize * 0.4
    };
    this.particleGrowthMultiplier = {
      easy: 1.05,
      difficult: 1.10
    };
    this.particleSpawnChance = {
      easy: 60,
      difficult: 100
    };
    this.sizeMax = {
      easy: this.baseParticleSize,
      difficult: this.baseParticleSize * 0.6
    };
    this.targetVelocityMultiplier = {
      easy: 0.3,
      difficult: 0.5
    };
    this.velocityMin = {
      easy: -6,
      difficult: -10
    };
    this.velocityMax = {
      easy: 6,
      difficult: 10
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
      levelMulitplier = playState.level / this.maxLevel;
      playState[property] = (valueDifference * levelMulitplier) + propertyConfig.easy;
    }
    return this;
  };

  return Config;

})();

var Game;

Game = (function() {
  function Game() {}

  Game.prototype.init = function() {
    config.init();
    particleGenerator.init();
    playState.init();
    ui.init();
    input.init();
    animationLoop.init();
    scenes.ident();
    return this;
  };

  Game.prototype.over = function() {
    scenes.gameOver();
    playState.stopLevelUpIncrement();
    return this;
  };

  Game.prototype.start = function() {
    playState.setToInitialState();
    ui.setToInitialState();
    input.removeGameStartTapEventHandler();
    particleGenerator.setToInitialState();
    scenes.playing();
    return this;
  };

  return Game;

})();

var Input;

Input = (function() {
  function Input() {}

  Input.prototype.init = function() {
    this.cancelTouchMoveEvents();
    return this;
  };

  Input.prototype.addGameStartTapEventHandler = function() {
    body.addEventListener(inputVerb, this.gameStartTapEventHandler);
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
    game.start();
    return this;
  };

  Input.prototype.getTapCoordinates = function(event) {
    var tapCoordinates;
    if (hasTouchEvents) {
      tapCoordinates = event.touches[0];
    } else {
      tapCoordinates = {
        pageX: event.clientX,
        pageY: event.clientY
      };
    }
    return tapCoordinates;
  };

  Input.prototype.particleWasTapped = function(particle, touchData) {
    var distanceX, distanceY, radius, tapX, tapY;
    tapX = touchData.pageX * devicePixelRatio;
    tapY = touchData.pageY * devicePixelRatio;
    distanceX = tapX - particle.position.x;
    distanceY = tapY - particle.position.y;
    radius = particle.half;
    return (distanceX * distanceX) + (distanceY * distanceY) < (particle.half * particle.half);
  };

  Input.prototype.particleTapDetectionHandler = function(event) {
    var deletionIndex, particle, particleId, particleIndex, targetHit, touchData, _i, _len, _ref;
    targetHit = false;
    _ref = particleGenerator.particlesToTestForTaps;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      particleId = _ref[_i];
      particleIndex = particleGenerator.particlesArrayIds.indexOf(particleId);
      particle = particleGenerator.particlesArray[particleIndex];
      touchData = this.getTapCoordinates(event);
      if ((particle != null) && this.particleWasTapped(particle, touchData)) {
        deletionIndex = particleGenerator.particlesToTestForTaps.indexOf(particleId);
        particle.destroying = true;
        targetHit = true;
        particleGenerator.particlesToTestForTaps.splice(deletionIndex, 1);
        break;
      }
    }
    playState.updateComboMultiplier(targetHit);
    if (targetHit) {
      playState.updateScore(particle.size, particle.finalSize);
    }
    return this;
  };

  Input.prototype.removeGameStartTapEventHandler = function() {
    document.body.removeEventListener(inputVerb, this.gameStartTapEventHandler);
    return this;
  };

  Input.prototype.setupParticleTapDetection = function() {
    var self;
    self = this;
    particleGenerator.particlesToTestForTaps = [];
    window.addEventListener(inputVerb, function(event) {
      self.particleTapDetectionHandler(event);
    });
    return this;
  };

  return Input;

})();

var Particle;

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
    this.finalSize = utils.randomInteger(0, playState.sizeMax);
    this.id = Math.random().toString(36).substr(2, 5);
    this.isTarget = this.determineTargetParticle();
    this.position = {
      x: particleGenerator.particlesOrigin.x,
      y: particleGenerator.particlesOrigin.y
    };
    this.size = 1;
    this.velocity = {
      x: utils.random(playState.velocityMin, playState.velocityMax),
      y: utils.random(playState.velocityMin, playState.velocityMax)
    };
    if (this.isTarget) {
      this.color = 'rgba(' + colors.r + ', ' + colors.g + ', ' + colors.b + ', 0.8)';
      this.finalSize = utils.randomInteger(playState.minTargetSize, playState.sizeMax);
      this.velocity.x *= playState.targetVelocityMultiplier;
      this.velocity.y *= playState.targetVelocityMultiplier;
    }
    return this;
  };

  Particle.prototype.determineTargetParticle = function() {
    var isTarget;
    isTarget = false;
    if (particleGenerator.particlesToTestForTaps.length < playState.maxTargetsAtOnce) {
      isTarget = utils.randomPercentage() < playState.chanceParticleIsTarget;
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
      shrinkMultiplier = playState.playing ? 0.7 : 0.9;
      this.size *= shrinkMultiplier;
    } else {
      if (this.size < this.finalSize) {
        this.size *= playState.particleGrowthMultiplier;
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

var ParticleGenerator;

ParticleGenerator = (function() {
  function ParticleGenerator() {}

  ParticleGenerator.prototype.init = function() {
    this.particlesOrigin = {
      x: canvas.width / 2,
      y: canvas.height / 2
    };
    this.setToInitialState();
    input.setupParticleTapDetection();
    return this;
  };

  ParticleGenerator.prototype.animationLoopActions = function() {
    if (playState.playing) {
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
    playState.particleSpawnChance = 0;
    game.over();
    return this;
  };

  ParticleGenerator.prototype.generateParticle = function() {
    var newParticle, particle;
    if (utils.randomPercentage() < playState.particleSpawnChance) {
      newParticle = new Particle();
      particle = newParticle.init();
      this.particlesArray.push(particle);
      this.particlesArrayIds.push(particle.id);
      if (particle.isTarget) {
        this.particlesToTestForTaps.unshift(particle.id);
      }
    }
    return this;
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

  ParticleGenerator.prototype.stop = function() {
    playState.update(false);
    playState.stopLevelUpIncrement();
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

var PlayState;

PlayState = (function() {
  function PlayState() {}

  PlayState.prototype.init = function() {
    this.defaults = {
      level: 1,
      score: 0,
      comboMultiplier: 0
    };
    return this;
  };

  PlayState.prototype.stopLevelUpIncrement = function() {
    window.clearInterval(this.levelUpCounter);
    return this;
  };

  PlayState.prototype.setupLevelUpIncrement = function() {
    var self;
    self = this;
    this.levelUpCounter = window.setInterval(function() {
      self.updateLevel();
    }, config.levelUpInterval * 1000);
    return this;
  };

  PlayState.prototype.setToInitialState = function() {
    this.level = this.defaults.level;
    this.chanceParticleIsTarget = config.chanceParticleIsTarget.easy;
    this.comboMultiplier = this.defaults.comboMultiplier;
    this.maxTargetsAtOnce = config.maxTargetsAtOnce.easy;
    this.minTargetSize = config.minTargetSize.easy;
    this.particleGrowthMultiplier = config.particleGrowthMultiplier.easy;
    this.particleSpawnChance = config.particleSpawnChance.easy;
    this.score = this.defaults.score;
    this.sizeMax = config.sizeMax.easy;
    this.targetVelocityMultiplier = config.targetVelocityMultiplier.easy;
    this.velocityMin = config.velocityMin.easy;
    this.velocityMax = config.velocityMax.easy;
    this.update(true);
    config.updateValuesForDifficulty();
    this.setupLevelUpIncrement();
    return this;
  };

  PlayState.prototype.updateComboMultiplier = function(targetHit) {
    this.comboMultiplier = targetHit ? this.comboMultiplier + 1 : this.defaults.comboMultiplier;
    ui.updateComboMultiplierCounter();
    return this;
  };

  PlayState.prototype.update = function(newState) {
    this.playing = newState;
    return this;
  };

  PlayState.prototype.updateLevel = function() {
    this.level += 1;
    if (this.level >= config.maxLevel) {
      window.clearInterval(this.levelUpCounter);
    }
    ui.updateLevelCounter();
    config.updateValuesForDifficulty();
    return this;
  };

  PlayState.prototype.updateScore = function(sizeWhenTapped, sizeWhenFullyGrown) {
    var levelMultiplier, popPointValue, targetSizeBonus;
    targetSizeBonus = Math.round(100 - ((sizeWhenTapped / sizeWhenFullyGrown) * 100));
    popPointValue = config.pointsPerPop + targetSizeBonus;
    levelMultiplier = this.level + 1;
    this.score += (popPointValue * this.comboMultiplier) * levelMultiplier;
    ui.updateScoreCounter();
    return this;
  };

  return PlayState;

})();

var Scenes;

Scenes = (function() {
  function Scenes() {}

  Scenes.prototype.credits = function() {
    ui.updateBodyClass('credits');
    return this;
  };

  Scenes.prototype.gameOver = function() {
    ui.updateBodyClass('game-over');
    input.addGameStartTapEventHandler();
    return this;
  };

  Scenes.prototype.leaderboard = function() {
    return this;
  };

  Scenes.prototype.playing = function() {
    ui.updateBodyClass('playing');
    return this;
  };

  Scenes.prototype.ident = function() {
    var self;
    self = this;
    ui.updateBodyClass('ident');
    window.setTimeout(function() {
      return self.title();
    }, 5000);
    return this;
  };

  Scenes.prototype.title = function() {
    ui.updateBodyClass('title');
    input.addGameStartTapEventHandler();
    return this;
  };

  return Scenes;

})();

var UI;

UI = (function() {
  function UI() {}

  UI.prototype.init = function() {
    this.body = document.body;
    this.levelCounter = utils.$('.hud-value-level');
    this.scoreCounter = utils.$('.hud-value-score');
    this.comboMultiplierCounter = utils.$('.hud-value-combo');
    this.playAgain = utils.$('.play-again');
    return this;
  };

  UI.prototype.updateBodyClass = function(className) {
    this.body.className = '';
    this.body.classList.add('scene-' + className);
    return this;
  };

  UI.prototype.setToInitialState = function() {
    this.updateComboMultiplierCounter();
    this.updateLevelCounter();
    this.updateScoreCounter();
    return this;
  };

  UI.prototype.updateComboMultiplierCounter = function() {
    utils.updateUITextNode(this.comboMultiplierCounter, playState.comboMultiplier);
    return this;
  };

  UI.prototype.updateLevelCounter = function() {
    utils.updateUITextNode(this.levelCounter, playState.level);
    return this;
  };

  UI.prototype.updateScoreCounter = function() {
    var scoreToFormat;
    scoreToFormat = utils.formatWithComma(playState.score);
    utils.updateUITextNode(this.scoreCounter, scoreToFormat);
    return this;
  };

  return UI;

})();

var Utils;

Utils = (function() {
  function Utils() {}

  Utils.prototype.$ = function(selector) {
    var els;
    if (selector.substr(0, 1) === '#') {
      return document.getElementById(selector);
    }
    els = document.querySelectorAll(selector);
    if (els.length === 1) {
      return els[0];
    }
    return els;
  };

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

  Utils.prototype.updateUITextNode = function(element, value) {
    element.innerHTML = value;
    return this;
  };

  return Utils;

})();

var android, animationLoop, backingStoreRatio, body, canvas, config, context, debug, devicePixelRatio, game, hasTouchEvents, input, inputVerb, oldHeight, oldWidth, particleGenerator, playState, ratio, scenes, ui, utils;

debug = true;

android = navigator.userAgent.match(/android/i) ? true : false;

body = document.body;

canvas = document.createElement('canvas');

hasTouchEvents = window.hasOwnProperty('ontouchstart') || window.hasOwnProperty('onmsgesturechange');

inputVerb = hasTouchEvents ? 'touchstart' : 'click';

canvas.className = 'canvas';

canvas.width = body.clientWidth;

canvas.height = body.clientHeight;

body.appendChild(canvas);

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

animationLoop = new AnimationLoop();

config = new Config();

game = new Game();

input = new Input();

particleGenerator = new ParticleGenerator();

utils = new Utils();

scenes = new Scenes();

playState = new PlayState();

ui = new UI();

game.init();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkFuaW1hdGlvbkxvb3AuY29mZmVlIiwiQ29uZmlnLmNvZmZlZSIsIkdhbWUuY29mZmVlIiwiSW5wdXQuY29mZmVlIiwiUGFydGljbGUuY29mZmVlIiwiUGFydGljbGVHZW5lcmF0b3IuY29mZmVlIiwiUGxheVN0YXRlLmNvZmZlZSIsIlNjZW5lcy5jb2ZmZWUiLCJVSS5jb2ZmZWUiLCJVdGlscy5jb2ZmZWUiLCJfYm9vdHN0cmFwLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxJQUFBLGFBQUE7O0FBQUE7NkJBRUM7O0FBQUEsMEJBQUEsSUFBQSxHQUFNLFNBQUEsR0FBQTtBQUVMLElBQUEsSUFBSSxDQUFDLHFCQUFMLENBQUEsQ0FBQSxDQUFBO0FBQUEsSUFDQSxJQUFJLENBQUMsZUFETCxDQUFBO1dBR0EsS0FMSztFQUFBLENBQU4sQ0FBQTs7QUFBQSwwQkFPQSxvQkFBQSxHQUFzQixTQUFBLEdBQUE7QUFFckIsSUFBQSxNQUFNLENBQUMsb0JBQVAsQ0FBNEIsSUFBSSxDQUFDLGVBQWpDLENBQUEsQ0FBQTtXQUVBLEtBSnFCO0VBQUEsQ0FQdEIsQ0FBQTs7QUFBQSwwQkFhQSxxQkFBQSxHQUF1QixTQUFBLEdBQUE7QUFFdEIsUUFBQSxJQUFBO0FBQUEsSUFBQSxJQUFBLEdBQU8sSUFBUCxDQUFBO0FBQUEsSUFFQSxJQUFJLENBQUMsZUFBTCxHQUF1QixNQUFNLENBQUMscUJBQVAsQ0FBNkIsU0FBQSxHQUFBO0FBRW5ELE1BQUEsSUFBSSxDQUFDLHFCQUFMLENBQUEsQ0FBQSxDQUZtRDtJQUFBLENBQTdCLENBRnZCLENBQUE7QUFBQSxJQVFBLE1BQU0sQ0FBQyxLQUFQLEdBQWUsTUFBTSxDQUFDLEtBUnRCLENBQUE7QUFBQSxJQVVBLGlCQUFpQixDQUFDLG9CQUFsQixDQUFBLENBVkEsQ0FBQTtXQVlBLEtBZHNCO0VBQUEsQ0FidkIsQ0FBQTs7dUJBQUE7O0lBRkQsQ0FBQTs7QUNBQSxJQUFBLE1BQUE7O0FBQUE7c0JBRUM7O0FBQUEs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QUEsQ0FBQSxDQXBDeEIsQ0FBQTs7QUFBQSxLQXFDQSxHQUF3QixJQUFBLEtBQUEsQ0FBQSxDQXJDeEIsQ0FBQTs7QUFBQSxpQkFzQ0EsR0FBd0IsSUFBQSxpQkFBQSxDQUFBLENBdEN4QixDQUFBOztBQUFBLEtBdUNBLEdBQXdCLElBQUEsS0FBQSxDQUFBLENBdkN4QixDQUFBOztBQUFBLE1Bd0NBLEdBQXdCLElBQUEsTUFBQSxDQUFBLENBeEN4QixDQUFBOztBQUFBLFNBeUNBLEdBQXdCLElBQUEsU0FBQSxDQUFBLENBekN4QixDQUFBOztBQUFBLEVBMENBLEdBQXdCLElBQUEsRUFBQSxDQUFBLENBMUN4QixDQUFBOztBQUFBLElBNENJLENBQUMsSUFBTCxDQUFBLENBNUNBLENBQUEiLCJmaWxlIjoiYXBwbGljYXRpb24uanMiLCJzb3VyY2VzQ29udGVudCI6WyJcbmNsYXNzIEFuaW1hdGlvbkxvb3BcblxuXHRpbml0OiAtPlxuXG5cdFx0dGhpcy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKVxuXHRcdHRoaXMuYW5pbWF0aW9uTG9vcElkXG5cblx0XHRAXG5cblx0Y2FuY2VsQW5pbWF0aW9uRnJhbWU6IC0+XG5cblx0XHR3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUodGhpcy5hbmltYXRpb25Mb29wSWQpXG5cblx0XHRAXG5cblx0cmVxdWVzdEFuaW1hdGlvbkZyYW1lOiAtPlxuXG5cdFx0c2VsZiA9IHRoaXNcblxuXHRcdHRoaXMuYW5pbWF0aW9uTG9vcElkID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSAtPlxuXG5cdFx0XHRzZWxmLnJlcXVlc3RBbmltYXRpb25GcmFtZSgpXG5cblx0XHRcdHJldHVyblxuXG5cdFx0Y2FudmFzLndpZHRoID0gY2FudmFzLndpZHRoXG5cblx0XHRwYXJ0aWNsZUdlbmVyYXRvci5hbmltYXRpb25Mb29wQWN0aW9ucygpXG5cblx0XHRAXG4iLCJcbmNsYXNzIENvbmZpZ1xuXG5cdGluaXQ6IC0+XG5cblx0XHR0aGlzLnBhcnRpY2xlV2lkdGhBc1BlcmNlbnRhZ2VPZlNjcmVlbiA9IDE1XG5cblx0XHRiYXNlU2NyZWVuV2lkdGggICA9IE1hdGgubWluKGRvY3VtZW50LmJvZHkuY2xpZW50V2lkdGgsIGRvY3VtZW50LmJvZHkuY2xpZW50SGVpZ2h0KVxuXHRcdGJhc2VQYXJ0aWNsZVdpZHRoID0gTWF0aC5yb3VuZCgoYmFzZVNjcmVlbldpZHRoIC8gMTAwKSAqIHRoaXMucGFydGljbGVXaWR0aEFzUGVyY2VudGFnZU9mU2NyZWVuKVxuXG5cdFx0dGhpcy5iYXNlUGFydGljbGVTaXplID0gYmFzZVBhcnRpY2xlV2lkdGggKiBkZXZpY2VQaXhlbFJhdGlvXG5cdFx0dGhpcy5tYXhMaW5lV2lkdGggICAgID0gNVxuXHRcdHRoaXMubGV2ZWxVcEludGVydmFsICA9IDVcblx0XHR0aGlzLm1heExldmVsICAgICAgICAgPSA1MFxuXHRcdHRoaXMucG9pbnRzUGVyUG9wICAgICA9IDEwXG5cblx0XHR0aGlzLmNoYW5jZVBhcnRpY2xlSXNUYXJnZXQgPVxuXHRcdFx0ZWFzeTogICAgICA1MFxuXHRcdFx0ZGlmZmljdWx0OiA5MFxuXG5cdFx0dGhpcy5tYXhUYXJnZXRzQXRPbmNlID1cblx0XHRcdGVhc3k6ICAgICAgM1xuXHRcdFx0ZGlmZmljdWx0OiA2XG5cblx0XHR0aGlzLm1pblRhcmdldFNpemUgPVxuXHRcdFx0ZWFzeTogICAgICB0aGlzLmJhc2VQYXJ0aWNsZVNpemUgKiAwLjdcblx0XHRcdGRpZmZpY3VsdDogdGhpcy5iYXNlUGFydGljbGVTaXplICogMC40XG5cblx0XHR0aGlzLnBhcnRpY2xlR3Jvd3RoTXVsdGlwbGllciA9XG5cdFx0XHRlYXN5OiAgICAgIDEuMDVcblx0XHRcdGRpZmZpY3VsdDogMS4xMFxuXG5cdFx0dGhpcy5wYXJ0aWNsZVNwYXduQ2hhbmNlID1cblx0XHRcdGVhc3k6ICAgICAgNjBcblx0XHRcdGRpZmZpY3VsdDogMTAwXG5cblx0XHR0aGlzLnNpemVNYXggPVxuXHRcdFx0ZWFzeTogICAgICB0aGlzLmJhc2VQYXJ0aWNsZVNpemVcblx0XHRcdGRpZmZpY3VsdDogdGhpcy5iYXNlUGFydGljbGVTaXplICogMC42XG5cblx0XHR0aGlzLnRhcmdldFZlbG9jaXR5TXVsdGlwbGllciA9XG5cdFx0XHRlYXN5OiAgICAgIDAuM1xuXHRcdFx0ZGlmZmljdWx0OiAwLjVcblxuXHRcdHRoaXMudmVsb2NpdHlNaW4gPVxuXHRcdFx0ZWFzeTogICAgICAtNlxuXHRcdFx0ZGlmZmljdWx0OiAtMTBcblxuXHRcdHRoaXMudmVsb2NpdHlNYXggPVxuXHRcdFx0ZWFzeTogICAgICA2XG5cdFx0XHRkaWZmaWN1bHQ6IDEwXG5cblx0XHR0aGlzLnByb3BlcnRpZXNUb1VwZGF0ZVdpdGhEaWZmaWN1bHR5ID0gW1xuXHRcdFx0J3BhcnRpY2xlU3Bhd25DaGFuY2UnLFxuXHRcdFx0J2NoYW5jZVBhcnRpY2xlSXNUYXJnZXQnLFxuXHRcdFx0J3BhcnRpY2xlR3Jvd3RoTXVsdGlwbGllcicsXG5cdFx0XHQnc2l6ZU1heCcsXG5cdFx0XHQnbWF4VGFyZ2V0c0F0T25jZScsXG5cdFx0XHQnbWluVGFyZ2V0U2l6ZScsXG5cdFx0XHQndmVsb2NpdHlNaW4nLFxuXHRcdFx0J3ZlbG9jaXR5TWF4J1xuXHRcdFx0J3RhcmdldFZlbG9jaXR5TXVsdGlwbGllcidcblx0XHRdXG5cblx0XHRAXG5cblx0dXBkYXRlVmFsdWVzRm9yRGlmZmljdWx0eTogLT5cblxuXHRcdGZvciBwcm9wZXJ0eSBpbiB0aGlzLnByb3BlcnRpZXNUb1VwZGF0ZVdpdGhEaWZmaWN1bHR5XG5cdFx0XHRwcm9wZXJ0eUNvbmZpZyAgPSB0aGlzW3Byb3BlcnR5XVxuXHRcdFx0dmFsdWVEaWZmZXJlbmNlID0gcHJvcGVydHlDb25maWcuZGlmZmljdWx0IC0gcHJvcGVydHlDb25maWcuZWFzeVxuXHRcdFx0bGV2ZWxNdWxpdHBsaWVyID0gcGxheVN0YXRlLmxldmVsIC8gdGhpcy5tYXhMZXZlbFxuXHRcdFx0cGxheVN0YXRlW3Byb3BlcnR5XSA9ICh2YWx1ZURpZmZlcmVuY2UgKiBsZXZlbE11bGl0cGxpZXIpICsgcHJvcGVydHlDb25maWcuZWFzeVxuXG5cdFx0QFxuIiwiXG5jbGFzcyBHYW1lXG5cblx0aW5pdDogLT5cblxuXHRcdGNvbmZpZy5pbml0KClcblx0XHRwYXJ0aWNsZUdlbmVyYXRvci5pbml0KClcblx0XHRwbGF5U3RhdGUuaW5pdCgpXG5cdFx0dWkuaW5pdCgpXG5cdFx0aW5wdXQuaW5pdCgpXG5cblx0XHRhbmltYXRpb25Mb29wLmluaXQoKVxuXG5cdFx0c2NlbmVzLmlkZW50KClcblxuXHRcdEBcblxuXHRvdmVyOiAtPlxuXG5cdFx0c2NlbmVzLmdhbWVPdmVyKClcblxuXHRcdHBsYXlTdGF0ZS5zdG9wTGV2ZWxVcEluY3JlbWVudCgpXG5cblx0XHRAXG5cblx0c3RhcnQ6IC0+XG5cblx0XHRwbGF5U3RhdGUuc2V0VG9Jbml0aWFsU3RhdGUoKVxuXHRcdHVpLnNldFRvSW5pdGlhbFN0YXRlKClcblx0XHRpbnB1dC5yZW1vdmVHYW1lU3RhcnRUYXBFdmVudEhhbmRsZXIoKVxuXHRcdHBhcnRpY2xlR2VuZXJhdG9yLnNldFRvSW5pdGlhbFN0YXRlKClcblxuXHRcdHNjZW5lcy5wbGF5aW5nKClcblxuXHRcdEBcbiIsIlxuY2xhc3MgSW5wdXRcblxuXHRpbml0OiAtPlxuXG5cdFx0dGhpcy5jYW5jZWxUb3VjaE1vdmVFdmVudHMoKVxuXG5cdFx0QFxuXG5cdGFkZEdhbWVTdGFydFRhcEV2ZW50SGFuZGxlcjogKCkgLT5cblxuXHRcdGJvZHkuYWRkRXZlbnRMaXN0ZW5lcihpbnB1dFZlcmIsIHRoaXMuZ2FtZVN0YXJ0VGFwRXZlbnRIYW5kbGVyKVxuXG5cdFx0QFxuXG5cdGNhbmNlbFRvdWNoTW92ZUV2ZW50czogLT5cblxuXHRcdHdpbmRvdy5hZGRFdmVudExpc3RlbmVyICd0b3VjaG1vdmUnLCAoZXZlbnQpIC0+XG5cblx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KClcblxuXHRcdFx0cmV0dXJuXG5cblx0XHRAXG5cblx0Z2FtZVN0YXJ0VGFwRXZlbnRIYW5kbGVyOiAoZXZlbnQpIC0+XG5cblx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpXG5cblx0XHRnYW1lLnN0YXJ0KClcblxuXHRcdEBcblxuXHRnZXRUYXBDb29yZGluYXRlczogKGV2ZW50KSAtPlxuXG5cdFx0aWYgaGFzVG91Y2hFdmVudHNcblx0XHRcdHRhcENvb3JkaW5hdGVzID0gZXZlbnQudG91Y2hlc1swXVxuXHRcdGVsc2Vcblx0XHRcdHRhcENvb3JkaW5hdGVzID1cblx0XHRcdFx0cGFnZVg6IGV2ZW50LmNsaWVudFgsXG5cdFx0XHRcdHBhZ2VZOiBldmVudC5jbGllbnRZXG5cblx0XHRyZXR1cm4gdGFwQ29vcmRpbmF0ZXNcblxuXHRwYXJ0aWNsZVdhc1RhcHBlZDogKHBhcnRpY2xlLCB0b3VjaERhdGEpIC0+XG5cblx0XHR0YXBYICAgICAgPSB0b3VjaERhdGEucGFnZVggKiBkZXZpY2VQaXhlbFJhdGlvXG5cdFx0dGFwWSAgICAgID0gdG91Y2hEYXRhLnBhZ2VZICogZGV2aWNlUGl4ZWxSYXRpb1xuXHRcdGRpc3RhbmNlWCA9IHRhcFggLSBwYXJ0aWNsZS5wb3NpdGlvbi54XG5cdFx0ZGlzdGFuY2VZID0gdGFwWSAtIHBhcnRpY2xlLnBvc2l0aW9uLnlcblx0XHRyYWRpdXMgICAgPSBwYXJ0aWNsZS5oYWxmXG5cblx0XHRyZXR1cm4gKGRpc3RhbmNlWCAqIGRpc3RhbmNlWCkgKyAoZGlzdGFuY2VZICogZGlzdGFuY2VZKSA8IChwYXJ0aWNsZS5oYWxmICogcGFydGljbGUuaGFsZilcblxuXHRwYXJ0aWNsZVRhcERldGVjdGlvbkhhbmRsZXI6IChldmVudCkgLT5cblxuXHRcdHRhcmdldEhpdCA9IGZhbHNlXG5cblx0XHRmb3IgcGFydGljbGVJZCBpbiBwYXJ0aWNsZUdlbmVyYXRvci5wYXJ0aWNsZXNUb1Rlc3RGb3JUYXBzXG5cdFx0XHRwYXJ0aWNsZUluZGV4ID0gcGFydGljbGVHZW5lcmF0b3IucGFydGljbGVzQXJyYXlJZHMuaW5kZXhPZihwYXJ0aWNsZUlkKVxuXHRcdFx0cGFydGljbGUgICAgICA9IHBhcnRpY2xlR2VuZXJhdG9yLnBhcnRpY2xlc0FycmF5W3BhcnRpY2xlSW5kZXhdXG5cdFx0XHR0b3VjaERhdGEgICAgID0gdGhpcy5nZXRUYXBDb29yZGluYXRlcyhldmVudClcblxuXHRcdFx0aWYgcGFydGljbGU/IGFuZCB0aGlzLnBhcnRpY2xlV2FzVGFwcGVkKHBhcnRpY2xlLCB0b3VjaERhdGEpXG5cdFx0XHRcdGRlbGV0aW9uSW5kZXggICAgICAgPSBwYXJ0aWNsZUdlbmVyYXRvci5wYXJ0aWNsZXNUb1Rlc3RGb3JUYXBzLmluZGV4T2YocGFydGljbGVJZClcblx0XHRcdFx0cGFydGljbGUuZGVzdHJveWluZyA9IHRydWVcblx0XHRcdFx0dGFyZ2V0SGl0ICAgICAgICAgICA9IHRydWVcblxuXHRcdFx0XHRwYXJ0aWNsZUdlbmVyYXRvci5wYXJ0aWNsZXNUb1Rlc3RGb3JUYXBzLnNwbGljZShkZWxldGlvbkluZGV4LCAxKVxuXG5cdFx0XHRcdGJyZWFrXG5cblx0XHRwbGF5U3RhdGUudXBkYXRlQ29tYm9NdWx0aXBsaWVyKHRhcmdldEhpdClcblxuXHRcdGlmIHRhcmdldEhpdFxuXHRcdFx0cGxheVN0YXRlLnVwZGF0ZVNjb3JlKHBhcnRpY2xlLnNpemUsIHBhcnRpY2xlLmZpbmFsU2l6ZSlcblxuXHRcdEBcblxuXHRyZW1vdmVHYW1lU3RhcnRUYXBFdmVudEhhbmRsZXI6IC0+XG5cblx0XHRkb2N1bWVudC5ib2R5LnJlbW92ZUV2ZW50TGlzdGVuZXIoaW5wdXRWZXJiLCB0aGlzLmdhbWVTdGFydFRhcEV2ZW50SGFuZGxlcilcblxuXHRcdEBcblxuXHRzZXR1cFBhcnRpY2xlVGFwRGV0ZWN0aW9uOiAtPlxuXG5cdFx0c2VsZiA9IHRoaXNcblxuXHRcdHBhcnRpY2xlR2VuZXJhdG9yLnBhcnRpY2xlc1RvVGVzdEZvclRhcHMgPSBbXVxuXG5cdFx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIgaW5wdXRWZXJiLCAoZXZlbnQpIC0+XG5cblx0XHRcdHNlbGYucGFydGljbGVUYXBEZXRlY3Rpb25IYW5kbGVyKGV2ZW50KVxuXG5cdFx0XHRyZXR1cm5cblxuXHRcdEBcbiIsIlxuY2xhc3MgUGFydGljbGVcblxuXHRpbml0OiAtPlxuXG5cdFx0Y29sb3JzID1cblx0XHRcdHI6IHV0aWxzLnJhbmRvbUludGVnZXIoMCwgMjAwKVxuXHRcdFx0ZzogdXRpbHMucmFuZG9tSW50ZWdlcigwLCAyMDApXG5cdFx0XHRiOiB1dGlscy5yYW5kb21JbnRlZ2VyKDAsIDIwMClcblx0XHRcdGE6IHV0aWxzLnJhbmRvbSgwLjc1LCAxKVxuXG5cdFx0dGhpcy5jb2xvciAgICAgID0gJ3JnYmEoJyArIGNvbG9ycy5yICsgJywgJyArIGNvbG9ycy5nICsgJywgJyArIGNvbG9ycy5iICsgJywgJyArIGNvbG9ycy5hICsgJyknXG5cdFx0dGhpcy5kZXN0cm95aW5nID0gZmFsc2Vcblx0XHR0aGlzLmZpbmFsU2l6ZSAgPSB1dGlscy5yYW5kb21JbnRlZ2VyKDAsIHBsYXlTdGF0ZS5zaXplTWF4KVxuXHRcdHRoaXMuaWQgICAgICAgICA9IE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cigyLCA1KVxuXHRcdHRoaXMuaXNUYXJnZXQgICA9IHRoaXMuZGV0ZXJtaW5lVGFyZ2V0UGFydGljbGUoKVxuXHRcdHRoaXMucG9zaXRpb24gICA9XG5cdFx0XHR4OiBwYXJ0aWNsZUdlbmVyYXRvci5wYXJ0aWNsZXNPcmlnaW4ueFxuXHRcdFx0eTogcGFydGljbGVHZW5lcmF0b3IucGFydGljbGVzT3JpZ2luLnlcblx0XHR0aGlzLnNpemUgICAgICAgPSAxXG5cdFx0dGhpcy52ZWxvY2l0eSAgID1cblx0XHRcdHg6IHV0aWxzLnJhbmRvbShwbGF5U3RhdGUudmVsb2NpdHlNaW4sIHBsYXlTdGF0ZS52ZWxvY2l0eU1heClcblx0XHRcdHk6IHV0aWxzLnJhbmRvbShwbGF5U3RhdGUudmVsb2NpdHlNaW4sIHBsYXlTdGF0ZS52ZWxvY2l0eU1heClcblxuXHRcdGlmIHRoaXMuaXNUYXJnZXRcblx0XHRcdHRoaXMuY29sb3IgICAgID0gJ3JnYmEoJyArIGNvbG9ycy5yICsgJywgJyArIGNvbG9ycy5nICsgJywgJyArIGNvbG9ycy5iICsgJywgMC44KSdcblx0XHRcdHRoaXMuZmluYWxTaXplID0gdXRpbHMucmFuZG9tSW50ZWdlcihwbGF5U3RhdGUubWluVGFyZ2V0U2l6ZSwgcGxheVN0YXRlLnNpemVNYXgpXG5cblx0XHRcdHRoaXMudmVsb2NpdHkueCAqPSBwbGF5U3RhdGUudGFyZ2V0VmVsb2NpdHlNdWx0aXBsaWVyXG5cdFx0XHR0aGlzLnZlbG9jaXR5LnkgKj0gcGxheVN0YXRlLnRhcmdldFZlbG9jaXR5TXVsdGlwbGllclxuXG5cdFx0QFxuXG5cdGRldGVybWluZVRhcmdldFBhcnRpY2xlOiAtPlxuXG5cdFx0aXNUYXJnZXQgPSBmYWxzZVxuXG5cdFx0aWYgcGFydGljbGVHZW5lcmF0b3IucGFydGljbGVzVG9UZXN0Rm9yVGFwcy5sZW5ndGggPCBwbGF5U3RhdGUubWF4VGFyZ2V0c0F0T25jZVxuXHRcdFx0aXNUYXJnZXQgPSB1dGlscy5yYW5kb21QZXJjZW50YWdlKCkgPCBwbGF5U3RhdGUuY2hhbmNlUGFydGljbGVJc1RhcmdldFxuXG5cdFx0cmV0dXJuIGlzVGFyZ2V0XG5cblx0ZHJhdzogLT5cblxuXHRcdGlmIHRoaXMub3V0c2lkZUNhbnZhc0JvdW5kcygpXG5cdFx0XHRwYXJ0aWNsZUdlbmVyYXRvci5wYXJ0aWNsZXNUb0RlbGV0ZS5wdXNoKHRoaXMuaWQpXG5cblx0XHRcdHJldHVyblxuXG5cdFx0aWYgdGhpcy5pc1RhcmdldFxuXHRcdFx0dGhpcy5saW5lV2lkdGggPSB0aGlzLnNpemUgLyAxMFxuXG5cdFx0XHRpZiB0aGlzLmxpbmVXaWR0aCA+IGNvbmZpZy5tYXhMaW5lV2lkdGhcblx0XHRcdFx0dGhpcy5saW5lV2lkdGggPSBjb25maWcubWF4TGluZVdpZHRoXG5cblx0XHRcdGNvbnRleHQuZmlsbFN0eWxlID0gJ3JnYmEoMjQ3LCAyNDcsIDI0NywgMC45KSdcblx0XHRcdGNvbnRleHQubGluZVdpZHRoID0gdGhpcy5saW5lV2lkdGhcblxuXHRcdGNvbnRleHQuYmVnaW5QYXRoKClcblx0XHRjb250ZXh0LmFyYyh0aGlzLnBvc2l0aW9uLngsIHRoaXMucG9zaXRpb24ueSwgdGhpcy5oYWxmLCAwLCBNYXRoLlBJICogMiwgdHJ1ZSlcblx0XHRjb250ZXh0LmZpbGwoKVxuXHRcdGNvbnRleHQuc3Ryb2tlKCkgaWYgdGhpcy5pc1RhcmdldFxuXHRcdGNvbnRleHQuY2xvc2VQYXRoKClcblxuXHRcdEBcblxuXHRvdXRzaWRlQ2FudmFzQm91bmRzOiAtPlxuXG5cdFx0YmV5b25kQm91bmRzWCA9IHRoaXMucG9zaXRpb24ueCA8IC0odGhpcy5maW5hbFNpemUpIG9yIHRoaXMucG9zaXRpb24ueCA+IGNhbnZhcy53aWR0aCAgKyB0aGlzLmZpbmFsU2l6ZVxuXHRcdGJleW9uZEJvdW5kc1kgPSB0aGlzLnBvc2l0aW9uLnkgPCAtKHRoaXMuZmluYWxTaXplKSBvciB0aGlzLnBvc2l0aW9uLnkgPiBjYW52YXMuaGVpZ2h0ICsgdGhpcy5maW5hbFNpemVcblxuXHRcdHJldHVybiBiZXlvbmRCb3VuZHNYIG9yIGJleW9uZEJvdW5kc1lcblxuXHR1cGRhdGVWYWx1ZXM6IC0+XG5cblx0XHRpZiB0aGlzLmRlc3Ryb3lpbmdcblx0XHRcdHNocmlua011bHRpcGxpZXIgPSBpZiBwbGF5U3RhdGUucGxheWluZyB0aGVuIDAuNyBlbHNlIDAuOVxuXG5cdFx0XHR0aGlzLnNpemUgKj0gc2hyaW5rTXVsdGlwbGllclxuXHRcdGVsc2Vcblx0XHRcdGlmIHRoaXMuc2l6ZSA8IHRoaXMuZmluYWxTaXplXG5cdFx0XHRcdHRoaXMuc2l6ZSAqPSBwbGF5U3RhdGUucGFydGljbGVHcm93dGhNdWx0aXBsaWVyXG5cblx0XHRcdGlmIHRoaXMuc2l6ZSA+IHRoaXMuZmluYWxTaXplXG5cdFx0XHRcdHRoaXMuc2l6ZSA9IHRoaXMuZmluYWxTaXplXG5cblx0XHR0aGlzLmhhbGYgPSB0aGlzLnNpemUgLyAyXG5cblx0XHR0aGlzLnBvc2l0aW9uLnggKz0gdGhpcy52ZWxvY2l0eS54XG5cdFx0dGhpcy5wb3NpdGlvbi55ICs9IHRoaXMudmVsb2NpdHkueVxuXG5cdFx0dGhpcy5kcmF3KClcblxuXHRcdEBcbiIsIlxuY2xhc3MgUGFydGljbGVHZW5lcmF0b3JcblxuXHRpbml0OiAtPlxuXG5cdFx0dGhpcy5wYXJ0aWNsZXNPcmlnaW4gPVxuXHRcdFx0eDogY2FudmFzLndpZHRoICAvIDJcblx0XHRcdHk6IGNhbnZhcy5oZWlnaHQgLyAyXG5cblx0XHR0aGlzLnNldFRvSW5pdGlhbFN0YXRlKClcblxuXHRcdGlucHV0LnNldHVwUGFydGljbGVUYXBEZXRlY3Rpb24oKVxuXG5cdFx0QFxuXG5cdGFuaW1hdGlvbkxvb3BBY3Rpb25zOiAtPlxuXG5cdFx0aWYgcGxheVN0YXRlLnBsYXlpbmdcblx0XHRcdHRoaXMuZ2VuZXJhdGVQYXJ0aWNsZSgpXG5cblx0XHR0aGlzLnVwZGF0ZVBhcnRpY2xlc1ZhbHVlcygpXG5cdFx0dGhpcy5yZW1vdmVQYXJ0aWNsZXNBZnRlclRhcCgpXG5cblx0XHRpZiB0aGlzLnBhcnRpY2xlc1RvRGVsZXRlLmxlbmd0aCA+IDBcblx0XHRcdHRoaXMuZGVzdHJveVBhcnRpY2xlc091dHNpZGVDYW52YXNCb3VuZHMoKVxuXG5cdFx0QFxuXG5cdGRlc3Ryb3lQYXJ0aWNsZXNPdXRzaWRlQ2FudmFzQm91bmRzOiAtPlxuXG5cdFx0Zm9yIHBhcnRpY2xlSWQgaW4gdGhpcy5wYXJ0aWNsZXNUb0RlbGV0ZVxuXHRcdFx0cGFydGljbGVJbmRleCA9IHRoaXMucGFydGljbGVzQXJyYXlJZHMuaW5kZXhPZihwYXJ0aWNsZUlkKVxuXHRcdFx0cGFydGljbGUgICAgICA9IHRoaXMucGFydGljbGVzQXJyYXlbcGFydGljbGVJbmRleF1cblxuXHRcdFx0aWYgcGFydGljbGU/XG5cdFx0XHRcdGlmIHBhcnRpY2xlLmlzVGFyZ2V0XG5cdFx0XHRcdFx0dGhpcy5nYW1lT3ZlcigpXG5cblx0XHRcdFx0dGhpcy5yZW1vdmVQYXJ0aWNsZShwYXJ0aWNsZSlcblxuXHRcdHRoaXMucGFydGljbGVzVG9EZWxldGUgPSBbXVxuXG5cdFx0QFxuXG5cdGdhbWVPdmVyOiAtPlxuXG5cdFx0dGhpcy5zdG9wKClcblxuXHRcdGZvciBwYXJ0aWNsZSBpbiB0aGlzLnBhcnRpY2xlc0FycmF5XG5cdFx0XHRwYXJ0aWNsZS5kZXN0cm95aW5nID0gdHJ1ZVxuXG5cdFx0cGxheVN0YXRlLnBhcnRpY2xlU3Bhd25DaGFuY2UgPSAwXG5cblx0XHRnYW1lLm92ZXIoKVxuXG5cdFx0QFxuXG5cdGdlbmVyYXRlUGFydGljbGU6IC0+XG5cblx0XHRpZiB1dGlscy5yYW5kb21QZXJjZW50YWdlKCkgPCBwbGF5U3RhdGUucGFydGljbGVTcGF3bkNoYW5jZVxuXHRcdFx0bmV3UGFydGljbGUgPSBuZXcgUGFydGljbGUoKVxuXG5cdFx0XHRwYXJ0aWNsZSA9IG5ld1BhcnRpY2xlLmluaXQoKVxuXG5cdFx0XHR0aGlzLnBhcnRpY2xlc0FycmF5LnB1c2gocGFydGljbGUpXG5cdFx0XHR0aGlzLnBhcnRpY2xlc0FycmF5SWRzLnB1c2gocGFydGljbGUuaWQpXG5cblx0XHRcdGlmIHBhcnRpY2xlLmlzVGFyZ2V0XG5cdFx0XHRcdHRoaXMucGFydGljbGVzVG9UZXN0Rm9yVGFwcy51bnNoaWZ0KHBhcnRpY2xlLmlkKVxuXG5cdFx0QFxuXG5cdHJlbW92ZVBhcnRpY2xlOiAocGFydGljbGUpIC0+XG5cblx0XHRpZCAgICA9IHBhcnRpY2xlLmlkXG5cdFx0aW5kZXggPSB0aGlzLnBhcnRpY2xlc0FycmF5SWRzLmluZGV4T2YoaWQpXG5cblx0XHR0aGlzLnBhcnRpY2xlc0FycmF5LnNwbGljZShpbmRleCwgMSlcblx0XHR0aGlzLnBhcnRpY2xlc0FycmF5SWRzLnNwbGljZShpbmRleCwgMSlcblxuXHRcdEBcblxuXHRyZW1vdmVQYXJ0aWNsZXNBZnRlclRhcDogLT5cblxuXHRcdGZvciBwYXJ0aWNsZSBpbiB0aGlzLnBhcnRpY2xlc0FycmF5XG5cdFx0XHRpZiBwYXJ0aWNsZT8gYW5kIHBhcnRpY2xlLnNpemUgPCAxXG5cdFx0XHRcdHRoaXMucmVtb3ZlUGFydGljbGUocGFydGljbGUpXG5cblx0XHRAXG5cblx0c2V0VG9Jbml0aWFsU3RhdGU6IC0+XG5cblx0XHR0aGlzLnBhcnRpY2xlc0FycmF5ICAgICAgICAgPSBbXVxuXHRcdHRoaXMucGFydGljbGVzQXJyYXlJZHMgICAgICA9IFtdXG5cdFx0dGhpcy5wYXJ0aWNsZXNUb0RlbGV0ZSAgICAgID0gW11cblx0XHR0aGlzLnBhcnRpY2xlc1RvVGVzdEZvclRhcHMgPSBbXVxuXG5cdFx0QFxuXG5cdHN0b3A6IC0+XG5cblx0XHRwbGF5U3RhdGUudXBkYXRlKGZhbHNlKVxuXHRcdHBsYXlTdGF0ZS5zdG9wTGV2ZWxVcEluY3JlbWVudCgpXG5cblx0XHRAXG5cblx0dXBkYXRlUGFydGljbGVzVmFsdWVzOiAtPlxuXG5cdFx0Zm9yIHBhcnRpY2xlIGluIHRoaXMucGFydGljbGVzQXJyYXlcblx0XHRcdGlmIHBhcnRpY2xlP1xuXHRcdFx0XHRjb250ZXh0LmZpbGxTdHlsZSAgID0gcGFydGljbGUuY29sb3Jcblx0XHRcdFx0Y29udGV4dC5zdHJva2VTdHlsZSA9IHBhcnRpY2xlLmNvbG9yXG5cblx0XHRcdFx0cGFydGljbGUudXBkYXRlVmFsdWVzKClcblxuXHRcdEBcbiIsIlxuY2xhc3MgUGxheVN0YXRlXG5cblx0aW5pdDogLT5cblxuXHRcdHRoaXMuZGVmYXVsdHMgPVxuXHRcdFx0bGV2ZWw6ICAgICAgICAgICAxXG5cdFx0XHRzY29yZTogICAgICAgICAgIDBcblx0XHRcdGNvbWJvTXVsdGlwbGllcjogMFxuXG5cdFx0QFxuXG5cdHN0b3BMZXZlbFVwSW5jcmVtZW50OiAtPlxuXG5cdFx0d2luZG93LmNsZWFySW50ZXJ2YWwodGhpcy5sZXZlbFVwQ291bnRlcilcblxuXHRcdEBcblxuXHRzZXR1cExldmVsVXBJbmNyZW1lbnQ6IC0+XG5cblx0XHRzZWxmID0gdGhpc1xuXG5cdFx0dGhpcy5sZXZlbFVwQ291bnRlciA9IHdpbmRvdy5zZXRJbnRlcnZhbCAtPlxuXG5cdFx0XHRzZWxmLnVwZGF0ZUxldmVsKClcblxuXHRcdFx0cmV0dXJuXG5cblx0XHQsIGNvbmZpZy5sZXZlbFVwSW50ZXJ2YWwgKiAxMDAwXG5cblx0XHRAXG5cblx0c2V0VG9Jbml0aWFsU3RhdGU6IC0+XG5cblx0XHR0aGlzLmxldmVsICAgICAgICAgICAgICAgICAgICA9IHRoaXMuZGVmYXVsdHMubGV2ZWxcblx0XHR0aGlzLmNoYW5jZVBhcnRpY2xlSXNUYXJnZXQgICA9IGNvbmZpZy5jaGFuY2VQYXJ0aWNsZUlzVGFyZ2V0LmVhc3lcblx0XHR0aGlzLmNvbWJvTXVsdGlwbGllciAgICAgICAgICA9IHRoaXMuZGVmYXVsdHMuY29tYm9NdWx0aXBsaWVyXG5cdFx0dGhpcy5tYXhUYXJnZXRzQXRPbmNlICAgICAgICAgPSBjb25maWcubWF4VGFyZ2V0c0F0T25jZS5lYXN5XG5cdFx0dGhpcy5taW5UYXJnZXRTaXplICAgICAgICAgICAgPSBjb25maWcubWluVGFyZ2V0U2l6ZS5lYXN5XG5cdFx0dGhpcy5wYXJ0aWNsZUdyb3d0aE11bHRpcGxpZXIgPSBjb25maWcucGFydGljbGVHcm93dGhNdWx0aXBsaWVyLmVhc3lcblx0XHR0aGlzLnBhcnRpY2xlU3Bhd25DaGFuY2UgICAgICA9IGNvbmZpZy5wYXJ0aWNsZVNwYXduQ2hhbmNlLmVhc3lcblx0XHR0aGlzLnNjb3JlICAgICAgICAgICAgICAgICAgICA9IHRoaXMuZGVmYXVsdHMuc2NvcmVcblx0XHR0aGlzLnNpemVNYXggICAgICAgICAgICAgICAgICA9IGNvbmZpZy5zaXplTWF4LmVhc3lcblx0XHR0aGlzLnRhcmdldFZlbG9jaXR5TXVsdGlwbGllciA9IGNvbmZpZy50YXJnZXRWZWxvY2l0eU11bHRpcGxpZXIuZWFzeVxuXHRcdHRoaXMudmVsb2NpdHlNaW4gICAgICAgICAgICAgID0gY29uZmlnLnZlbG9jaXR5TWluLmVhc3lcblx0XHR0aGlzLnZlbG9jaXR5TWF4ICAgICAgICAgICAgICA9IGNvbmZpZy52ZWxvY2l0eU1heC5lYXN5XG5cblx0XHR0aGlzLnVwZGF0ZSh0cnVlKVxuXG5cdFx0Y29uZmlnLnVwZGF0ZVZhbHVlc0ZvckRpZmZpY3VsdHkoKVxuXG5cdFx0dGhpcy5zZXR1cExldmVsVXBJbmNyZW1lbnQoKVxuXG5cdFx0QFxuXG5cdHVwZGF0ZUNvbWJvTXVsdGlwbGllcjogKHRhcmdldEhpdCkgLT5cblxuXHRcdHRoaXMuY29tYm9NdWx0aXBsaWVyID0gaWYgdGFyZ2V0SGl0IHRoZW4gdGhpcy5jb21ib011bHRpcGxpZXIgKyAxIGVsc2UgdGhpcy5kZWZhdWx0cy5jb21ib011bHRpcGxpZXJcblxuXHRcdHVpLnVwZGF0ZUNvbWJvTXVsdGlwbGllckNvdW50ZXIoKVxuXG5cdFx0QFxuXG5cdHVwZGF0ZTogKG5ld1N0YXRlKSAtPlxuXG5cdFx0dGhpcy5wbGF5aW5nID0gbmV3U3RhdGVcblxuXHRcdEBcblxuXHR1cGRhdGVMZXZlbDogLT5cblxuXHRcdHRoaXMubGV2ZWwgKz0gMVxuXG5cdFx0aWYgdGhpcy5sZXZlbCA+PSBjb25maWcubWF4TGV2ZWxcblx0XHRcdHdpbmRvdy5jbGVhckludGVydmFsKHRoaXMubGV2ZWxVcENvdW50ZXIpXG5cblx0XHR1aS51cGRhdGVMZXZlbENvdW50ZXIoKVxuXHRcdGNvbmZpZy51cGRhdGVWYWx1ZXNGb3JEaWZmaWN1bHR5KClcblxuXHRcdEBcblxuXHR1cGRhdGVTY29yZTogKHNpemVXaGVuVGFwcGVkLCBzaXplV2hlbkZ1bGx5R3Jvd24pIC0+XG5cblx0XHQjKChkZWZhdWx0U2NvcmVQZXJQb3AgKyAoMTAwIC0gKChzaXplV2hlblRhcHBlZCAvIHNpemVXaGVuRnVsbHlHcm93bikgKiAxMDApKSkgKiBjb21ib011bHRpcGxpZXIpICogKGxldmVsTnVtYmVyICsgMSlcblxuXHRcdHRhcmdldFNpemVCb251cyA9IE1hdGgucm91bmQoMTAwIC0gKChzaXplV2hlblRhcHBlZCAvIHNpemVXaGVuRnVsbHlHcm93bikgKiAxMDApKVxuXHRcdHBvcFBvaW50VmFsdWUgICA9IGNvbmZpZy5wb2ludHNQZXJQb3AgKyB0YXJnZXRTaXplQm9udXNcblx0XHRsZXZlbE11bHRpcGxpZXIgPSB0aGlzLmxldmVsICsgMVxuXG5cdFx0dGhpcy5zY29yZSArPSAocG9wUG9pbnRWYWx1ZSAqIHRoaXMuY29tYm9NdWx0aXBsaWVyKSAqIChsZXZlbE11bHRpcGxpZXIpXG5cblx0XHR1aS51cGRhdGVTY29yZUNvdW50ZXIoKVxuXG5cdFx0QFxuIiwiXG5jbGFzcyBTY2VuZXNcblxuXHRjcmVkaXRzOiAtPlxuXG5cdFx0dWkudXBkYXRlQm9keUNsYXNzKCdjcmVkaXRzJylcblxuXHRcdEBcblxuXHRnYW1lT3ZlcjogLT5cblxuXHRcdHVpLnVwZGF0ZUJvZHlDbGFzcygnZ2FtZS1vdmVyJylcblxuXHRcdGlucHV0LmFkZEdhbWVTdGFydFRhcEV2ZW50SGFuZGxlcigpXG5cblx0XHRAXG5cblx0bGVhZGVyYm9hcmQ6IC0+XG5cblx0XHRAXG5cblx0cGxheWluZzogLT5cblxuXHRcdHVpLnVwZGF0ZUJvZHlDbGFzcygncGxheWluZycpXG5cblx0XHRAXG5cblx0aWRlbnQ6IC0+XG5cblx0XHRzZWxmID0gdGhpc1xuXG5cdFx0dWkudXBkYXRlQm9keUNsYXNzKCdpZGVudCcpXG5cblx0XHR3aW5kb3cuc2V0VGltZW91dCAtPlxuXHRcdFx0c2VsZi50aXRsZSgpXG5cdFx0LCA1MDAwXG5cblx0XHRAXG5cblx0dGl0bGU6IC0+XG5cblx0XHR1aS51cGRhdGVCb2R5Q2xhc3MoJ3RpdGxlJylcblxuXHRcdGlucHV0LmFkZEdhbWVTdGFydFRhcEV2ZW50SGFuZGxlcigpO1xuXG5cdFx0QFxuIiwiXG5jbGFzcyBVSVxuXG5cdGluaXQ6IC0+XG5cblx0XHR0aGlzLmJvZHkgICAgICAgICAgICAgICAgICAgPSBkb2N1bWVudC5ib2R5XG5cdFx0dGhpcy5sZXZlbENvdW50ZXIgICAgICAgICAgID0gdXRpbHMuJCgnLmh1ZC12YWx1ZS1sZXZlbCcpXG5cdFx0dGhpcy5zY29yZUNvdW50ZXIgICAgICAgICAgID0gdXRpbHMuJCgnLmh1ZC12YWx1ZS1zY29yZScpXG5cdFx0dGhpcy5jb21ib011bHRpcGxpZXJDb3VudGVyID0gdXRpbHMuJCgnLmh1ZC12YWx1ZS1jb21ibycpXG5cdFx0dGhpcy5wbGF5QWdhaW4gICAgICAgICAgICAgID0gdXRpbHMuJCgnLnBsYXktYWdhaW4nKVxuXG5cdFx0QFxuXG5cdHVwZGF0ZUJvZHlDbGFzczogKGNsYXNzTmFtZSkgLT5cblxuXHRcdHRoaXMuYm9keS5jbGFzc05hbWUgPSAnJ1xuXHRcdHRoaXMuYm9keS5jbGFzc0xpc3QuYWRkKCdzY2VuZS0nICsgY2xhc3NOYW1lKVxuXG5cdFx0QFxuXG5cdHNldFRvSW5pdGlhbFN0YXRlOiAtPlxuXG5cdFx0dGhpcy51cGRhdGVDb21ib011bHRpcGxpZXJDb3VudGVyKClcblx0XHR0aGlzLnVwZGF0ZUxldmVsQ291bnRlcigpXG5cdFx0dGhpcy51cGRhdGVTY29yZUNvdW50ZXIoKVxuXG5cdFx0QFxuXG5cdHVwZGF0ZUNvbWJvTXVsdGlwbGllckNvdW50ZXI6IC0+XG5cblx0XHR1dGlscy51cGRhdGVVSVRleHROb2RlKHRoaXMuY29tYm9NdWx0aXBsaWVyQ291bnRlciwgcGxheVN0YXRlLmNvbWJvTXVsdGlwbGllcilcblxuXHRcdEBcblxuXHR1cGRhdGVMZXZlbENvdW50ZXI6IC0+XG5cblx0XHR1dGlscy51cGRhdGVVSVRleHROb2RlKHRoaXMubGV2ZWxDb3VudGVyLCBwbGF5U3RhdGUubGV2ZWwpXG5cblx0XHRAXG5cblx0dXBkYXRlU2NvcmVDb3VudGVyOiAtPlxuXG5cdFx0c2NvcmVUb0Zvcm1hdCA9IHV0aWxzLmZvcm1hdFdpdGhDb21tYShwbGF5U3RhdGUuc2NvcmUpXG5cblx0XHR1dGlscy51cGRhdGVVSVRleHROb2RlKHRoaXMuc2NvcmVDb3VudGVyLCBzY29yZVRvRm9ybWF0KVxuXG5cdFx0QFxuIiwiXG5jbGFzcyBVdGlsc1xuXG5cdCQ6IChzZWxlY3RvcikgLT5cblx0XHRpZiBzZWxlY3Rvci5zdWJzdHIoMCwgMSkgPT0gJyMnXG5cdFx0XHRyZXR1cm4gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoc2VsZWN0b3IpXG5cblx0XHRlbHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKVxuXG5cdFx0aWYgZWxzLmxlbmd0aCA9PSAxXG5cdFx0XHRyZXR1cm4gZWxzWzBdXG5cblx0XHRyZXR1cm4gZWxzXG5cblx0Y29ycmVjdFZhbHVlRm9yRFBSOiAodmFsdWUsIGludGVnZXIgPSBmYWxzZSkgLT5cblxuXHRcdHZhbHVlICo9IGRldmljZVBpeGVsUmF0aW9cblxuXHRcdGlmIGludGVnZXJcblx0XHRcdHZhbHVlID0gTWF0aC5yb3VuZCh2YWx1ZSlcblxuXHRcdHJldHVybiB2YWx1ZVxuXG5cdGZvcm1hdFdpdGhDb21tYTogKG51bSkgLT5cblxuXHRcdG51bS50b1N0cmluZygpLnJlcGxhY2UoL1xcQig/PShcXGR7M30pKyg/IVxcZCkpL2csIFwiLFwiKVxuXG5cdHJhbmRvbTogKG1pbiwgbWF4KSAtPlxuXG5cdFx0aWYgbWluID09IHVuZGVmaW5lZFxuXHRcdFx0bWluID0gMFxuXHRcdFx0bWF4ID0gMVxuXHRcdGVsc2UgaWYgbWF4ID09IHVuZGVmaW5lZFxuXHRcdFx0bWF4ID0gbWluXG5cdFx0XHRtaW4gPSAwXG5cblx0XHRyZXR1cm4gKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluKSkgKyBtaW47XG5cblx0cmFuZG9tQ29sb3I6IChhbHBoYSA9IGZhbHNlKSAtPlxuXG5cdFx0Y29sb3JzID1cblx0XHRcdHI6IHRoaXMucmFuZG9tSW50ZWdlcigwLCAyMDApXG5cdFx0XHRnOiB0aGlzLnJhbmRvbUludGVnZXIoMCwgMjAwKVxuXHRcdFx0YjogdGhpcy5yYW5kb21JbnRlZ2VyKDAsIDIwMClcblx0XHRcdGE6IGlmICFhbHBoYSB0aGVuIHRoaXMucmFuZG9tKDAuNzUsIDEpIGVsc2UgYWxwaGFcblxuXHRcdHJldHVybiAncmdiYSgnICsgY29sb3JzLnIgKyAnLCAnICsgY29sb3JzLmcgKyAnLCAnICsgY29sb3JzLmIgKyAnLCAnICsgY29sb3JzLmEgKyAnKSdcblxuXHRyYW5kb21JbnRlZ2VyOiAobWluLCBtYXgpIC0+XG5cblx0XHRpZiBtYXggPT0gdW5kZWZpbmVkXG5cdFx0XHRtYXggPSBtaW5cblx0XHRcdG1pbiA9IDBcblxuXHRcdHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAobWF4ICsgMSAtIG1pbikpICsgbWluXG5cblx0cmFuZG9tUGVyY2VudGFnZTogLT5cblxuXHRcdHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxMDApXG5cblx0dXBkYXRlVUlUZXh0Tm9kZTogKGVsZW1lbnQsIHZhbHVlKSAtPlxuXG5cdFx0ZWxlbWVudC5pbm5lckhUTUwgPSB2YWx1ZVxuXG5cdFx0QFxuIiwiXG5kZWJ1ZyA9IHRydWVcblxuYW5kcm9pZCAgICAgICAgPSBpZiBuYXZpZ2F0b3IudXNlckFnZW50Lm1hdGNoKC9hbmRyb2lkL2kpIHRoZW4gdHJ1ZSBlbHNlIGZhbHNlXG5ib2R5ICAgICAgICAgICA9IGRvY3VtZW50LmJvZHlcbmNhbnZhcyAgICAgICAgID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJylcbmhhc1RvdWNoRXZlbnRzID0gd2luZG93Lmhhc093blByb3BlcnR5KCdvbnRvdWNoc3RhcnQnKSB8fCB3aW5kb3cuaGFzT3duUHJvcGVydHkoJ29ubXNnZXN0dXJlY2hhbmdlJylcbmlucHV0VmVyYiAgICAgID0gaWYgaGFzVG91Y2hFdmVudHMgdGhlbiAndG91Y2hzdGFydCcgZWxzZSAnY2xpY2snXG5cbmNhbnZhcy5jbGFzc05hbWUgPSAnY2FudmFzJ1xuY2FudmFzLndpZHRoICAgICA9IGJvZHkuY2xpZW50V2lkdGhcbmNhbnZhcy5oZWlnaHQgICAgPSBib2R5LmNsaWVudEhlaWdodFxuXG5ib2R5LmFwcGVuZENoaWxkKGNhbnZhcylcblxuY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpXG5cbmNvbnRleHQuZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gJ3NvdXJjZS1hdG9wJ1xuXG5kZXZpY2VQaXhlbFJhdGlvICA9IHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvIHx8IDFcbmJhY2tpbmdTdG9yZVJhdGlvID0gY29udGV4dC53ZWJraXRCYWNraW5nU3RvcmVQaXhlbFJhdGlvIHx8IGNvbnRleHQuYmFja2luZ1N0b3JlUGl4ZWxSYXRpbyB8fCAxXG5yYXRpbyAgICAgICAgICAgICA9IGRldmljZVBpeGVsUmF0aW8gLyBiYWNraW5nU3RvcmVSYXRpb1xuXG5pZiBkZXZpY2VQaXhlbFJhdGlvICE9IGJhY2tpbmdTdG9yZVJhdGlvXG5cdG9sZFdpZHRoICA9IGNhbnZhcy53aWR0aFxuXHRvbGRIZWlnaHQgPSBjYW52YXMuaGVpZ2h0XG5cblx0Y2FudmFzLndpZHRoICA9IG9sZFdpZHRoICAqIHJhdGlvXG5cdGNhbnZhcy5oZWlnaHQgPSBvbGRIZWlnaHQgKiByYXRpb1xuXG5cdGNhbnZhcy5zdHlsZS53aWR0aCAgPSBvbGRXaWR0aCAgKyAncHgnXG5cdGNhbnZhcy5zdHlsZS5oZWlnaHQgPSBvbGRIZWlnaHQgKyAncHgnXG5cblx0Y29udGV4dC5zY2FsZShyYXRpbywgcmF0aW8pXG5cbmFuaW1hdGlvbkxvb3AgICAgID0gbmV3IEFuaW1hdGlvbkxvb3AoKVxuY29uZmlnICAgICAgICAgICAgPSBuZXcgQ29uZmlnKClcbmdhbWUgICAgICAgICAgICAgID0gbmV3IEdhbWUoKVxuaW5wdXQgICAgICAgICAgICAgPSBuZXcgSW5wdXQoKVxucGFydGljbGVHZW5lcmF0b3IgPSBuZXcgUGFydGljbGVHZW5lcmF0b3IoKVxudXRpbHMgICAgICAgICAgICAgPSBuZXcgVXRpbHMoKVxuc2NlbmVzICAgICAgICAgICAgPSBuZXcgU2NlbmVzKClcbnBsYXlTdGF0ZSAgICAgICAgID0gbmV3IFBsYXlTdGF0ZSgpXG51aSAgICAgICAgICAgICAgICA9IG5ldyBVSSgpXG5cbmdhbWUuaW5pdCgpXG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=