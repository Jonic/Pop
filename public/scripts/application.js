var AnimationLoopClass;

AnimationLoopClass = (function() {
  function AnimationLoopClass() {
    this.requestAnimationFrame();
    return this;
  }

  AnimationLoopClass.prototype.cancelAnimationFrame = function() {
    window.cancelAnimationFrame(this.animationLoopId);
    return this;
  };

  AnimationLoopClass.prototype.requestAnimationFrame = function() {
    this.animationLoopId = window.requestAnimationFrame((function(_this) {
      return function() {
        _this.requestAnimationFrame();
      };
    })(this));
    canvas.width = canvas.width;
    ParticleGenerator.animationLoopActions();
    return this;
  };

  return AnimationLoopClass;

})();

var ConfigClass;

ConfigClass = (function() {
  ConfigClass.prototype.chanceParticleIsTarget = {
    easy: 50,
    difficult: 90
  };

  ConfigClass.prototype.levelUpInterval = 5;

  ConfigClass.prototype.maxLevel = 50;

  ConfigClass.prototype.maxLineWidth = 5;

  ConfigClass.prototype.maxTargetsAtOnce = {
    easy: 3,
    difficult: 6
  };

  ConfigClass.prototype.particleGrowthMultiplier = {
    easy: 1.05,
    difficult: 1.10
  };

  ConfigClass.prototype.particleSpawnChance = {
    easy: 60,
    difficult: 100
  };

  ConfigClass.prototype.particleDiameterAsPercentageOfScreen = 15;

  ConfigClass.prototype.pointsPerPop = 10;

  ConfigClass.prototype.propertiesToUpdateWithDifficulty = ['particleSpawnChance', 'chanceParticleIsTarget', 'particleGrowthMultiplier', 'sizeMax', 'maxTargetsAtOnce', 'minTargetSize', 'velocityMin', 'velocityMax', 'targetVelocityMultiplier'];

  ConfigClass.prototype.targetVelocityMultiplier = {
    easy: 0.3,
    difficult: 0.5
  };

  ConfigClass.prototype.velocityMin = {
    easy: -6,
    difficult: -10
  };

  ConfigClass.prototype.velocityMax = {
    easy: 6,
    difficult: 10
  };

  function ConfigClass() {
    var baseParticleWidth, baseScreenWidth;
    baseScreenWidth = Math.min(body.clientWidth, body.clientHeight) / 100;
    baseParticleWidth = Math.round(baseScreenWidth * this.particleDiameterAsPercentageOfScreen);
    this.baseParticleSize = baseParticleWidth * devicePixelRatio;
    this.minTargetSize = {
      easy: this.baseParticleSize * 0.7,
      difficult: this.baseParticleSize * 0.4
    };
    this.sizeMax = {
      easy: this.baseParticleSize,
      difficult: this.baseParticleSize * 0.6
    };
    return this;
  }

  ConfigClass.prototype.updateValuesForDifficulty = function() {
    var levelMulitplier, property, propertyConfig, valueDifference, _i, _len, _ref;
    _ref = this.propertiesToUpdateWithDifficulty;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      property = _ref[_i];
      propertyConfig = this[property];
      valueDifference = propertyConfig.difficult - propertyConfig.easy;
      levelMulitplier = PlayState.level / this.maxLevel;
      PlayState[property] = (valueDifference * levelMulitplier) + propertyConfig.easy;
    }
    return this;
  };

  return ConfigClass;

})();

var DeviceClass;

DeviceClass = (function() {
  function DeviceClass() {
    return this;
  }

  return DeviceClass;

})();

var GameClass;

GameClass = (function() {
  function GameClass() {
    Scenes.ident();
    return this;
  }

  GameClass.prototype.over = function() {
    Scenes.gameOver();
    PlayState.stopLevelUpIncrement();
    return this;
  };

  GameClass.prototype.start = function() {
    PlayState.reset();
    UI.reset();
    Input.removeGameStartTapEventHandler();
    ParticleGenerator.reset();
    Scenes.playing();
    return this;
  };

  return GameClass;

})();

var InputClass;

InputClass = (function() {
  function InputClass() {
    this.cancelTouchMoveEvents();
    window.addEventListener(inputVerb, function(event) {});
    return this;
  }

  InputClass.prototype.addGameStartTapEventHandler = function() {
    body.addEventListener(inputVerb, this.gameStartTapEventHandler);
    return this;
  };

  InputClass.prototype.cancelTouchMoveEvents = function() {
    window.addEventListener('touchmove', function(event) {
      event.preventDefault();
    });
    return this;
  };

  InputClass.prototype.gameStartTapEventHandler = function(event) {
    event.preventDefault();
    Game.start();
    return this;
  };

  InputClass.prototype.getTouchData = function(event) {
    var tapCoordinates, touchData;
    if (touchData) {
      tapCoordinates = event.touches[0];
    } else {
      touchData = {
        pageX: event.clientX,
        pageY: event.clientY
      };
    }
    return touchData;
  };

  InputClass.prototype.registerHandler = function(selector, scene, callback) {
    document.querySelector(selector).addEventListener(inputVerb, (function(_this) {
      return function(event) {
        event.preventDefault();
        if (Scenes.current === scene) {
          callback.apply();
        }
      };
    })(this));
    return this;
  };

  InputClass.prototype.removeGameStartTapEventHandler = function() {
    document.body.removeEventListener(inputVerb, this.gameStartTapEventHandler);
    return this;
  };

  return InputClass;

})();

var ParticleClass;

ParticleClass = (function() {
  function ParticleClass() {
    var a, b, g, r;
    r = Utils.randomInteger(0, 200);
    g = Utils.randomInteger(0, 200);
    b = Utils.randomInteger(0, 200);
    a = Utils.random(0.75, 1);
    this.color = "rgba(" + r + ", " + g + ", " + b + ", " + a + ")";
    this.destroying = false;
    this.finalSize = Utils.randomInteger(0, PlayState.sizeMax);
    this.id = Math.random().toString(36).substr(2, 5);
    this.isTarget = this.determineTargetParticle();
    this.position = {
      x: ParticleGenerator.particlesOrigin.x,
      y: ParticleGenerator.particlesOrigin.y
    };
    this.size = 1;
    this.velocity = {
      x: Utils.random(PlayState.velocityMin, PlayState.velocityMax),
      y: Utils.random(PlayState.velocityMin, PlayState.velocityMax)
    };
    if (this.isTarget) {
      this.color = "rgba(" + r + ", " + g + ", " + b + ", 0.8)";
      this.finalSize = Utils.randomInteger(PlayState.minTargetSize, PlayState.sizeMax);
      this.velocity.x *= PlayState.targetVelocityMultiplier;
      this.velocity.y *= PlayState.targetVelocityMultiplier;
    }
    return this;
  }

  ParticleClass.prototype.determineTargetParticle = function() {
    var isTarget;
    isTarget = false;
    if (ParticleGenerator.particlesToTestForTaps.length < PlayState.maxTargetsAtOnce) {
      isTarget = Utils.randomPercentage() < PlayState.chanceParticleIsTarget;
    }
    return isTarget;
  };

  ParticleClass.prototype.draw = function() {
    if (this.outsideCanvasBounds()) {
      ParticleGenerator.particlesToDelete.push(this.id);
      return;
    }
    if (this.isTarget) {
      this.lineWidth = this.size / 10;
      if (this.lineWidth > Config.maxLineWidth) {
        this.lineWidth = Config.maxLineWidth;
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

  ParticleClass.prototype.outsideCanvasBounds = function() {
    var beyondBoundsX, beyondBoundsY;
    beyondBoundsX = this.position.x < -this.finalSize || this.position.x > canvas.width + this.finalSize;
    beyondBoundsY = this.position.y < -this.finalSize || this.position.y > canvas.height + this.finalSize;
    return beyondBoundsX || beyondBoundsY;
  };

  ParticleClass.prototype.updateValues = function() {
    var shrinkMultiplier;
    if (this.destroying) {
      shrinkMultiplier = PlayState.playing ? 0.7 : 0.9;
      this.size *= shrinkMultiplier;
    } else {
      if (this.size < this.finalSize) {
        this.size *= PlayState.particleGrowthMultiplier;
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

  ParticleClass.prototype.wasTapped = function(touchData) {
    var distanceX, distanceY, radius, tapX, tapY;
    tapX = touchData.pageX * devicePixelRatio;
    tapY = touchData.pageY * devicePixelRatio;
    distanceX = tapX - this.position.x;
    distanceY = tapY - this.position.y;
    radius = this.half;
    return (distanceX * distanceX) + (distanceY * distanceY) < (this.half * this.half);
  };

  return ParticleClass;

})();

var ParticleGeneratorClass;

ParticleGeneratorClass = (function() {
  function ParticleGeneratorClass() {
    this.particlesArray = [];
    this.particlesArrayIds = [];
    this.particlesToDelete = [];
    this.particlesToTestForTaps = [];
    this.particlesOrigin = {
      x: canvas.width / 2,
      y: canvas.height / 2
    };
    this.registerParticleTapDetectionHandler();
    return this;
  }

  ParticleGeneratorClass.prototype.animationLoopActions = function() {
    if (PlayState.playing) {
      this.generateParticle();
    }
    this.updateParticlesValues();
    this.removeParticlesAfterTap();
    if (this.particlesToDelete.length > 0) {
      this.destroyParticlesOutsideCanvasBounds();
    }
    return this;
  };

  ParticleGeneratorClass.prototype.destroyParticlesOutsideCanvasBounds = function() {
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

  ParticleGeneratorClass.prototype.gameOver = function() {
    var particle, _i, _len, _ref;
    this.stop();
    _ref = this.particlesArray;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      particle = _ref[_i];
      particle.destroying = true;
    }
    PlayState.particleSpawnChance = 0;
    Game.over();
    return this;
  };

  ParticleGeneratorClass.prototype.generateParticle = function() {
    var particle;
    if (Utils.randomPercentage() < PlayState.particleSpawnChance) {
      particle = new ParticleClass();
      this.particlesArray.push(particle);
      this.particlesArrayIds.push(particle.id);
      if (particle.isTarget) {
        this.particlesToTestForTaps.unshift(particle.id);
      }
    }
    return this;
  };

  ParticleGeneratorClass.prototype.particleTapDetectionHandler = function() {
    var deletionIndex, particle, particleId, particleIndex, targetHit, touchData, _i, _len, _ref;
    console.log(event);
    targetHit = false;
    _ref = this.particlesToTestForTaps;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      particleId = _ref[_i];
      particleIndex = this.particlesArrayIds.indexOf(particleId);
      particle = this.particlesArray[particleIndex];
      touchData = Input.getTouchData(event);
      if ((particle != null) && particle.wasTapped(touchData)) {
        deletionIndex = this.particlesToTestForTaps.indexOf(particleId);
        particle.destroying = true;
        targetHit = true;
        this.particlesToTestForTaps.splice(deletionIndex, 1);
        break;
      }
    }
    PlayState.updateComboMultiplier(targetHit);
    if (targetHit) {
      PlayState.updateScore(particle.size, particle.finalSize);
    }
    return this;
  };

  ParticleGeneratorClass.prototype.registerParticleTapDetectionHandler = function() {
    Input.registerHandler('.canvas', 'playing', function() {
      ParticleGenerator.particleTapDetectionHandler();
    });
    return this;
  };

  ParticleGeneratorClass.prototype.removeParticle = function(particle) {
    var id, index;
    id = particle.id;
    index = this.particlesArrayIds.indexOf(id);
    this.particlesArray.splice(index, 1);
    this.particlesArrayIds.splice(index, 1);
    return this;
  };

  ParticleGeneratorClass.prototype.removeParticlesAfterTap = function() {
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

  ParticleGeneratorClass.prototype.reset = function() {
    this.particlesArray = [];
    this.particlesArrayIds = [];
    this.particlesToDelete = [];
    this.particlesToTestForTaps = [];
    return this;
  };

  ParticleGeneratorClass.prototype.stop = function() {
    PlayState.update(false);
    PlayState.stopLevelUpIncrement();
    return this;
  };

  ParticleGeneratorClass.prototype.updateParticlesValues = function() {
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

  return ParticleGeneratorClass;

})();

var PlayStateClass;

PlayStateClass = (function() {
  function PlayStateClass() {}

  PlayStateClass.prototype.defaults = {
    comboMultiplier: 0,
    level: 1,
    score: 0
  };

  PlayStateClass.prototype.reset = function() {
    this.chanceParticleIsTarget = Config.chanceParticleIsTarget.easy;
    this.comboMultiplier = this.defaults.comboMultiplier;
    this.level = this.defaults.level;
    this.maxTargetsAtOnce = Config.maxTargetsAtOnce.easy;
    this.minTargetSize = Config.minTargetSize.easy;
    this.particleGrowthMultiplier = Config.particleGrowthMultiplier.easy;
    this.particleSpawnChance = Config.particleSpawnChance.easy;
    this.score = this.defaults.score;
    this.sizeMax = Config.sizeMax.easy;
    this.targetVelocityMultiplier = Config.targetVelocityMultiplier.easy;
    this.velocityMin = Config.velocityMin.easy;
    this.velocityMax = Config.velocityMax.easy;
    this.update(true);
    Config.updateValuesForDifficulty();
    this.setupLevelUpIncrement();
    return this;
  };

  PlayStateClass.prototype.stopLevelUpIncrement = function() {
    window.clearInterval(this.levelUpCounter);
    return this;
  };

  PlayStateClass.prototype.setupLevelUpIncrement = function() {
    this.levelUpCounter = window.setInterval((function(_this) {
      return function() {
        _this.updateLevel();
      };
    })(this), Config.levelUpInterval * 1000);
    return this;
  };

  PlayStateClass.prototype.updateComboMultiplier = function(targetHit) {
    this.comboMultiplier = targetHit ? this.comboMultiplier + 1 : this.defaults.comboMultiplier;
    UI.updateComboMultiplierCounter();
    return this;
  };

  PlayStateClass.prototype.update = function(newState) {
    this.playing = newState;
    return this;
  };

  PlayStateClass.prototype.updateLevel = function() {
    this.level += 1;
    if (this.level >= Config.maxLevel) {
      window.clearInterval(this.levelUpCounter);
    }
    UI.updateLevelCounter();
    Config.updateValuesForDifficulty();
    return this;
  };

  PlayStateClass.prototype.updateScore = function(sizeWhenTapped, sizeWhenFullyGrown) {
    var levelMultiplier, popPointValue, targetSizeBonus;
    targetSizeBonus = Math.round(100 - ((sizeWhenTapped / sizeWhenFullyGrown) * 100));
    popPointValue = Config.pointsPerPop + targetSizeBonus;
    levelMultiplier = this.level + 1;
    this.score += (popPointValue * this.comboMultiplier) * levelMultiplier;
    UI.updateScoreCounter();
    return this;
  };

  return PlayStateClass;

})();

var ScenesClass;

ScenesClass = (function() {
  function ScenesClass() {}

  ScenesClass.current = null;

  ScenesClass.prototype.credits = function() {
    this.current = 'credits';
    UI.updateBodyClass('credits');
    return this;
  };

  ScenesClass.prototype.gameOver = function() {
    this.current = 'game-over';
    UI.updateBodyClass('game-over');
    Input.addGameStartTapEventHandler();
    return this;
  };

  ScenesClass.prototype.leaderboard = function() {
    this.current = 'leaderboard';
    return this;
  };

  ScenesClass.prototype.playing = function() {
    this.current = 'playing';
    UI.updateBodyClass('playing');
    return this;
  };

  ScenesClass.prototype.ident = function() {
    this.current = 'ident';
    UI.updateBodyClass('ident');
    window.setTimeout((function(_this) {
      return function() {
        return _this.title();
      };
    })(this), 500);
    return this;
  };

  ScenesClass.prototype.title = function() {
    this.current = 'title';
    UI.updateBodyClass('title');
    Input.addGameStartTapEventHandler();
    return this;
  };

  return ScenesClass;

})();

var UIClass;

UIClass = (function() {
  function UIClass() {}

  UIClass.prototype.reset = function() {
    this.levelCounter = Utils.$('.hud-value-level');
    this.scoreCounter = Utils.$('.hud-value-score');
    this.comboMultiplierCounter = Utils.$('.hud-value-combo');
    this.playAgain = Utils.$('.play-again');
    this.updateComboMultiplierCounter();
    this.updateLevelCounter();
    this.updateScoreCounter();
    return this;
  };

  UIClass.prototype.updateBodyClass = function(className) {
    body.className = '';
    body.classList.add('scene-' + className);
    return this;
  };

  UIClass.prototype.updateComboMultiplierCounter = function() {
    Utils.updateUITextNode(this.comboMultiplierCounter, PlayState.comboMultiplier);
    return this;
  };

  UIClass.prototype.updateLevelCounter = function() {
    Utils.updateUITextNode(this.levelCounter, PlayState.level);
    return this;
  };

  UIClass.prototype.updateScoreCounter = function() {
    var scoreToFormat;
    scoreToFormat = Utils.formatWithComma(PlayState.score);
    Utils.updateUITextNode(this.scoreCounter, scoreToFormat);
    return this;
  };

  return UIClass;

})();

var UtilsClass;

UtilsClass = (function() {
  function UtilsClass() {}

  UtilsClass.prototype.$ = function(selector) {
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

  UtilsClass.prototype.correctValueForDPR = function(value, integer) {
    if (integer == null) {
      integer = false;
    }
    value *= devicePixelRatio;
    if (integer) {
      value = Math.round(value);
    }
    return value;
  };

  UtilsClass.prototype.formatWithComma = function(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  UtilsClass.prototype.random = function(min, max) {
    if (min === void 0) {
      min = 0;
      max = 1;
    } else if (max === void 0) {
      max = min;
      min = 0;
    }
    return (Math.random() * (max - min)) + min;
  };

  UtilsClass.prototype.randomColor = function(alpha) {
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

  UtilsClass.prototype.randomInteger = function(min, max) {
    if (max === void 0) {
      max = min;
      min = 0;
    }
    return Math.floor(Math.random() * (max + 1 - min)) + min;
  };

  UtilsClass.prototype.randomPercentage = function() {
    return Math.floor(Math.random() * 100);
  };

  UtilsClass.prototype.updateUITextNode = function(element, value) {
    element.innerHTML = value;
    return this;
  };

  return UtilsClass;

})();

var AnimationLoop, Config, Device, Game, Input, ParticleGenerator, PlayState, Scenes, UI, Utils, android, backingStoreRatio, body, canvas, context, debug, devicePixelRatio, hasTouchEvents, inputVerb, oldHeight, oldWidth, ratio;

debug = true;

android = navigator.userAgent.match(/android/i) ? true : false;

body = document.body;

canvas = document.querySelector('.canvas');

hasTouchEvents = window.hasOwnProperty('ontouchstart') || window.hasOwnProperty('onmsgesturechange');

inputVerb = hasTouchEvents ? 'touchstart' : 'click';

canvas.className = 'canvas';

canvas.width = body.clientWidth;

canvas.height = body.clientHeight;

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
  canvas.style.width = "" + oldWidth + "px";
  canvas.style.height = "" + oldHeight + "px";
  context.scale(ratio, ratio);
}

Device = new DeviceClass();

Utils = new UtilsClass();

Config = new ConfigClass();

Input = new InputClass();

ParticleGenerator = new ParticleGeneratorClass();

PlayState = new PlayStateClass();

UI = new UIClass();

Scenes = new ScenesClass();

AnimationLoop = new AnimationLoopClass();

Game = new GameClass();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkFuaW1hdGlvbkxvb3AuY29mZmVlIiwiQ29uZmlnLmNvZmZlZSIsIkRldmljZS5jb2ZmZWUiLCJHYW1lLmNvZmZlZSIsIklucHV0LmNvZmZlZSIsIlBhcnRpY2xlLmNvZmZlZSIsIlBhcnRpY2xlR2VuZXJhdG9yLmNvZmZlZSIsIlBsYXlTdGF0ZS5jb2ZmZWUiLCJTY2VuZXMuY29mZmVlIiwiVUkuY29mZmVlIiwiVXRpbHMuY29mZmVlIiwiX2Jvb3RzdHJhcC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsSUFBQSxrQkFBQTs7QUFBQTtBQUVlLEVBQUEsNEJBQUEsR0FBQTtBQUVYLElBQUEsSUFBQyxDQUFBLHFCQUFELENBQUEsQ0FBQSxDQUFBO0FBRUEsV0FBTyxJQUFQLENBSlc7RUFBQSxDQUFiOztBQUFBLCtCQU1BLG9CQUFBLEdBQXNCLFNBQUEsR0FBQTtBQUVwQixJQUFBLE1BQU0sQ0FBQyxvQkFBUCxDQUE0QixJQUFDLENBQUEsZUFBN0IsQ0FBQSxDQUFBO0FBRUEsV0FBTyxJQUFQLENBSm9CO0VBQUEsQ0FOdEIsQ0FBQTs7QUFBQSwrQkFZQSxxQkFBQSxHQUF1QixTQUFBLEdBQUE7QUFFckIsSUFBQSxJQUFDLENBQUEsZUFBRCxHQUFtQixNQUFNLENBQUMscUJBQVAsQ0FBNkIsQ0FBQSxTQUFBLEtBQUEsR0FBQTthQUFBLFNBQUEsR0FBQTtBQUU5QyxRQUFBLEtBQUMsQ0FBQSxxQkFBRCxDQUFBLENBQUEsQ0FGOEM7TUFBQSxFQUFBO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE3QixDQUFuQixDQUFBO0FBQUEsSUFNQSxNQUFNLENBQUMsS0FBUCxHQUFlLE1BQU0sQ0FBQyxLQU50QixDQUFBO0FBQUEsSUFRQSxpQkFBaUIsQ0FBQyxvQkFBbEIsQ0FBQSxDQVJBLENBQUE7QUFVQSxXQUFPLElBQVAsQ0FacUI7RUFBQSxDQVp2QixDQUFBOzs0QkFBQTs7SUFGRixDQUFBOztBQ0FBLElBQUEsV0FBQTs7QUFBQTtBQUVFLHdC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LE1BQU0sQ0FBQyxNQURuQixDQUFBO0FBQUEsRUFHQSxNQUFNLENBQUMsS0FBUCxHQUFnQixRQUFBLEdBQVksS0FINUIsQ0FBQTtBQUFBLEVBSUEsTUFBTSxDQUFDLE1BQVAsR0FBZ0IsU0FBQSxHQUFZLEtBSjVCLENBQUE7QUFBQSxFQU1BLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBYixHQUFzQixFQUFBLEdBQUcsUUFBSCxHQUFZLElBTmxDLENBQUE7QUFBQSxFQU9BLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBYixHQUFzQixFQUFBLEdBQUcsU0FBSCxHQUFhLElBUG5DLENBQUE7QUFBQSxFQVNBLE9BQU8sQ0FBQyxLQUFSLENBQWMsS0FBZCxFQUFxQixLQUFyQixDQVRBLENBREY7Q0FwQkE7O0FBQUEsTUFpQ0EsR0FBd0IsSUFBQSxXQUFBLENBQUEsQ0FqQ3hCLENBQUE7O0FBQUEsS0FrQ0EsR0FBd0IsSUFBQSxVQUFBLENBQUEsQ0FsQ3hCLENBQUE7O0FBQUEsTUFtQ0EsR0FBd0IsSUFBQSxXQUFBLENBQUEsQ0FuQ3hCLENBQUE7O0FBQUEsS0FvQ0EsR0FBd0IsSUFBQSxVQUFBLENBQUEsQ0FwQ3hCLENBQUE7O0FBQUEsaUJBdUNBLEdBQXdCLElBQUEsc0JBQUEsQ0FBQSxDQXZDeEIsQ0FBQTs7QUFBQSxTQXdDQSxHQUF3QixJQUFBLGNBQUEsQ0FBQSxDQXhDeEIsQ0FBQTs7QUFBQSxFQXlDQSxHQUF3QixJQUFBLE9BQUEsQ0FBQSxDQXpDeEIsQ0FBQTs7QUFBQSxNQTBDQSxHQUF3QixJQUFBLFdBQUEsQ0FBQSxDQTFDeEIsQ0FBQTs7QUFBQSxhQTZDQSxHQUF3QixJQUFBLGtCQUFBLENBQUEsQ0E3Q3hCLENBQUE7O0FBQUEsSUFnREEsR0FBd0IsSUFBQSxTQUFBLENBQUEsQ0FoRHhCLENBQUEiLCJmaWxlIjoiYXBwbGljYXRpb24uanMiLCJzb3VyY2VzQ29udGVudCI6WyJcbmNsYXNzIEFuaW1hdGlvbkxvb3BDbGFzc1xuXG4gIGNvbnN0cnVjdG9yOiAtPlxuXG4gICAgQHJlcXVlc3RBbmltYXRpb25GcmFtZSgpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIGNhbmNlbEFuaW1hdGlvbkZyYW1lOiAtPlxuXG4gICAgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lKEBhbmltYXRpb25Mb29wSWQpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHJlcXVlc3RBbmltYXRpb25GcmFtZTogLT5cblxuICAgIEBhbmltYXRpb25Mb29wSWQgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lID0+XG5cbiAgICAgIEByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKVxuXG4gICAgICByZXR1cm5cblxuICAgIGNhbnZhcy53aWR0aCA9IGNhbnZhcy53aWR0aFxuXG4gICAgUGFydGljbGVHZW5lcmF0b3IuYW5pbWF0aW9uTG9vcEFjdGlvbnMoKVxuXG4gICAgcmV0dXJuIHRoaXNcbiIsIlxuY2xhc3MgQ29uZmlnQ2xhc3NcblxuICBjaGFuY2VQYXJ0aWNsZUlzVGFyZ2V0OlxuICAgIGVhc3k6ICAgICAgNTBcbiAgICBkaWZmaWN1bHQ6IDkwXG5cbiAgbGV2ZWxVcEludGVydmFsOiA1XG5cbiAgbWF4TGV2ZWw6IDUwXG5cbiAgbWF4TGluZVdpZHRoOiA1XG5cbiAgbWF4VGFyZ2V0c0F0T25jZTpcbiAgICBlYXN5OiAgICAgIDNcbiAgICBkaWZmaWN1bHQ6IDZcblxuICBwYXJ0aWNsZUdyb3d0aE11bHRpcGxpZXI6XG4gICAgZWFzeTogICAgICAxLjA1XG4gICAgZGlmZmljdWx0OiAxLjEwXG5cbiAgcGFydGljbGVTcGF3bkNoYW5jZTpcbiAgICBlYXN5OiAgICAgIDYwXG4gICAgZGlmZmljdWx0OiAxMDBcblxuICBwYXJ0aWNsZURpYW1ldGVyQXNQZXJjZW50YWdlT2ZTY3JlZW46IDE1XG5cbiAgcG9pbnRzUGVyUG9wOiAxMFxuXG4gIHByb3BlcnRpZXNUb1VwZGF0ZVdpdGhEaWZmaWN1bHR5OiBbXG4gICAgJ3BhcnRpY2xlU3Bhd25DaGFuY2UnXG4gICAgJ2NoYW5jZVBhcnRpY2xlSXNUYXJnZXQnXG4gICAgJ3BhcnRpY2xlR3Jvd3RoTXVsdGlwbGllcidcbiAgICAnc2l6ZU1heCdcbiAgICAnbWF4VGFyZ2V0c0F0T25jZSdcbiAgICAnbWluVGFyZ2V0U2l6ZSdcbiAgICAndmVsb2NpdHlNaW4nXG4gICAgJ3ZlbG9jaXR5TWF4J1xuICAgICd0YXJnZXRWZWxvY2l0eU11bHRpcGxpZXInXG4gIF1cblxuICB0YXJnZXRWZWxvY2l0eU11bHRpcGxpZXI6XG4gICAgZWFzeTogICAgICAwLjNcbiAgICBkaWZmaWN1bHQ6IDAuNVxuXG4gIHZlbG9jaXR5TWluOlxuICAgIGVhc3k6ICAgICAgLTZcbiAgICBkaWZmaWN1bHQ6IC0xMFxuXG4gIHZlbG9jaXR5TWF4OlxuICAgIGVhc3k6ICAgICAgNlxuICAgIGRpZmZpY3VsdDogMTBcblxuICBjb25zdHJ1Y3RvcjogLT5cblxuICAgIGJhc2VTY3JlZW5XaWR0aCAgID0gTWF0aC5taW4oYm9keS5jbGllbnRXaWR0aCwgYm9keS5jbGllbnRIZWlnaHQpIC8gMTAwXG4gICAgYmFzZVBhcnRpY2xlV2lkdGggPSBNYXRoLnJvdW5kKGJhc2VTY3JlZW5XaWR0aCAqIEBwYXJ0aWNsZURpYW1ldGVyQXNQZXJjZW50YWdlT2ZTY3JlZW4pXG5cbiAgICBAYmFzZVBhcnRpY2xlU2l6ZSA9IGJhc2VQYXJ0aWNsZVdpZHRoICogZGV2aWNlUGl4ZWxSYXRpb1xuXG4gICAgQG1pblRhcmdldFNpemUgPVxuICAgICAgZWFzeTogICAgICBAYmFzZVBhcnRpY2xlU2l6ZSAqIDAuN1xuICAgICAgZGlmZmljdWx0OiBAYmFzZVBhcnRpY2xlU2l6ZSAqIDAuNFxuXG5cbiAgICBAc2l6ZU1heCA9XG4gICAgICBlYXN5OiAgICAgIEBiYXNlUGFydGljbGVTaXplXG4gICAgICBkaWZmaWN1bHQ6IEBiYXNlUGFydGljbGVTaXplICogMC42XG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHVwZGF0ZVZhbHVlc0ZvckRpZmZpY3VsdHk6IC0+XG5cbiAgICBmb3IgcHJvcGVydHkgaW4gQHByb3BlcnRpZXNUb1VwZGF0ZVdpdGhEaWZmaWN1bHR5XG4gICAgICBwcm9wZXJ0eUNvbmZpZyAgPSBAW3Byb3BlcnR5XVxuICAgICAgdmFsdWVEaWZmZXJlbmNlID0gcHJvcGVydHlDb25maWcuZGlmZmljdWx0IC0gcHJvcGVydHlDb25maWcuZWFzeVxuICAgICAgbGV2ZWxNdWxpdHBsaWVyID0gUGxheVN0YXRlLmxldmVsIC8gQG1heExldmVsXG5cbiAgICAgIFBsYXlTdGF0ZVtwcm9wZXJ0eV0gPSAodmFsdWVEaWZmZXJlbmNlICogbGV2ZWxNdWxpdHBsaWVyKSArIHByb3BlcnR5Q29uZmlnLmVhc3lcblxuICAgIHJldHVybiB0aGlzXG4iLCJcbmNsYXNzIERldmljZUNsYXNzXG5cbiAgY29uc3RydWN0b3I6IC0+XG5cbiAgICByZXR1cm4gdGhpc1xuIiwiXG5jbGFzcyBHYW1lQ2xhc3NcblxuICBjb25zdHJ1Y3RvcjogLT5cblxuICAgIFNjZW5lcy5pZGVudCgpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIG92ZXI6IC0+XG5cbiAgICBTY2VuZXMuZ2FtZU92ZXIoKVxuXG4gICAgUGxheVN0YXRlLnN0b3BMZXZlbFVwSW5jcmVtZW50KClcblxuICAgIHJldHVybiB0aGlzXG5cbiAgc3RhcnQ6IC0+XG5cbiAgICBQbGF5U3RhdGUucmVzZXQoKVxuICAgIFVJLnJlc2V0KClcbiAgICBJbnB1dC5yZW1vdmVHYW1lU3RhcnRUYXBFdmVudEhhbmRsZXIoKVxuICAgIFBhcnRpY2xlR2VuZXJhdG9yLnJlc2V0KClcblxuICAgIFNjZW5lcy5wbGF5aW5nKClcblxuICAgIHJldHVybiB0aGlzXG4iLCJcbmNsYXNzIElucHV0Q2xhc3NcblxuICBjb25zdHJ1Y3RvcjogLT5cblxuICAgIEBjYW5jZWxUb3VjaE1vdmVFdmVudHMoKVxuXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIgaW5wdXRWZXJiLCAoZXZlbnQpIC0+XG4gICAgICAjY29uc29sZS5sb2cgZXZlbnQudGFyZ2V0Lm5vZGVOYW1lLnRvTG93ZXJDYXNlKClcbiAgICAgIHJldHVyblxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBhZGRHYW1lU3RhcnRUYXBFdmVudEhhbmRsZXI6ICgpIC0+XG5cbiAgICBib2R5LmFkZEV2ZW50TGlzdGVuZXIoaW5wdXRWZXJiLCBAZ2FtZVN0YXJ0VGFwRXZlbnRIYW5kbGVyKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBjYW5jZWxUb3VjaE1vdmVFdmVudHM6IC0+XG5cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciAndG91Y2htb3ZlJywgKGV2ZW50KSAtPlxuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuXG4gICAgICByZXR1cm5cblxuICAgIHJldHVybiB0aGlzXG5cbiAgZ2FtZVN0YXJ0VGFwRXZlbnRIYW5kbGVyOiAoZXZlbnQpIC0+XG5cbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG5cbiAgICBHYW1lLnN0YXJ0KClcblxuICAgIHJldHVybiB0aGlzXG5cbiAgZ2V0VG91Y2hEYXRhOiAoZXZlbnQpIC0+XG5cbiAgICBpZiB0b3VjaERhdGFcbiAgICAgIHRhcENvb3JkaW5hdGVzID0gZXZlbnQudG91Y2hlc1swXVxuICAgIGVsc2VcbiAgICAgIHRvdWNoRGF0YSA9XG4gICAgICAgIHBhZ2VYOiBldmVudC5jbGllbnRYLFxuICAgICAgICBwYWdlWTogZXZlbnQuY2xpZW50WVxuXG4gICAgcmV0dXJuIHRvdWNoRGF0YVxuXG4gIHJlZ2lzdGVySGFuZGxlcjogKHNlbGVjdG9yLCBzY2VuZSwgY2FsbGJhY2spIC0+XG5cbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKS5hZGRFdmVudExpc3RlbmVyIGlucHV0VmVyYiwgKGV2ZW50KSA9PlxuXG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG5cbiAgICAgIGNhbGxiYWNrLmFwcGx5KCkgaWYgU2NlbmVzLmN1cnJlbnQgPT0gc2NlbmVcblxuICAgICAgcmV0dXJuXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHJlbW92ZUdhbWVTdGFydFRhcEV2ZW50SGFuZGxlcjogLT5cblxuICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlRXZlbnRMaXN0ZW5lcihpbnB1dFZlcmIsIEBnYW1lU3RhcnRUYXBFdmVudEhhbmRsZXIpXG5cbiAgICByZXR1cm4gdGhpc1xuIiwiXG5jbGFzcyBQYXJ0aWNsZUNsYXNzXG5cbiAgY29uc3RydWN0b3I6IC0+XG5cbiAgICByID0gVXRpbHMucmFuZG9tSW50ZWdlcigwLCAyMDApXG4gICAgZyA9IFV0aWxzLnJhbmRvbUludGVnZXIoMCwgMjAwKVxuICAgIGIgPSBVdGlscy5yYW5kb21JbnRlZ2VyKDAsIDIwMClcbiAgICBhID0gVXRpbHMucmFuZG9tKDAuNzUsIDEpXG5cbiAgICBAY29sb3IgICAgICA9IFwicmdiYSgje3J9LCAje2d9LCAje2J9LCAje2F9KVwiXG4gICAgQGRlc3Ryb3lpbmcgPSBmYWxzZVxuICAgIEBmaW5hbFNpemUgID0gVXRpbHMucmFuZG9tSW50ZWdlcigwLCBQbGF5U3RhdGUuc2l6ZU1heClcbiAgICBAaWQgICAgICAgICA9IE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cigyLCA1KVxuICAgIEBpc1RhcmdldCAgID0gQGRldGVybWluZVRhcmdldFBhcnRpY2xlKClcbiAgICBAcG9zaXRpb24gICA9XG4gICAgICB4OiBQYXJ0aWNsZUdlbmVyYXRvci5wYXJ0aWNsZXNPcmlnaW4ueFxuICAgICAgeTogUGFydGljbGVHZW5lcmF0b3IucGFydGljbGVzT3JpZ2luLnlcbiAgICBAc2l6ZSAgICAgICA9IDFcbiAgICBAdmVsb2NpdHkgICA9XG4gICAgICB4OiBVdGlscy5yYW5kb20oUGxheVN0YXRlLnZlbG9jaXR5TWluLCBQbGF5U3RhdGUudmVsb2NpdHlNYXgpXG4gICAgICB5OiBVdGlscy5yYW5kb20oUGxheVN0YXRlLnZlbG9jaXR5TWluLCBQbGF5U3RhdGUudmVsb2NpdHlNYXgpXG5cbiAgICBpZiBAaXNUYXJnZXRcbiAgICAgIEBjb2xvciAgICAgPSBcInJnYmEoI3tyfSwgI3tnfSwgI3tifSwgMC44KVwiXG4gICAgICBAZmluYWxTaXplID0gVXRpbHMucmFuZG9tSW50ZWdlcihQbGF5U3RhdGUubWluVGFyZ2V0U2l6ZSwgUGxheVN0YXRlLnNpemVNYXgpXG5cbiAgICAgIEB2ZWxvY2l0eS54ICo9IFBsYXlTdGF0ZS50YXJnZXRWZWxvY2l0eU11bHRpcGxpZXJcbiAgICAgIEB2ZWxvY2l0eS55ICo9IFBsYXlTdGF0ZS50YXJnZXRWZWxvY2l0eU11bHRpcGxpZXJcblxuICAgIHJldHVybiB0aGlzXG5cbiAgZGV0ZXJtaW5lVGFyZ2V0UGFydGljbGU6IC0+XG5cbiAgICBpc1RhcmdldCA9IGZhbHNlXG5cbiAgICBpZiBQYXJ0aWNsZUdlbmVyYXRvci5wYXJ0aWNsZXNUb1Rlc3RGb3JUYXBzLmxlbmd0aCA8IFBsYXlTdGF0ZS5tYXhUYXJnZXRzQXRPbmNlXG4gICAgICBpc1RhcmdldCA9IFV0aWxzLnJhbmRvbVBlcmNlbnRhZ2UoKSA8IFBsYXlTdGF0ZS5jaGFuY2VQYXJ0aWNsZUlzVGFyZ2V0XG5cbiAgICByZXR1cm4gaXNUYXJnZXRcblxuICBkcmF3OiAtPlxuXG4gICAgaWYgQG91dHNpZGVDYW52YXNCb3VuZHMoKVxuICAgICAgUGFydGljbGVHZW5lcmF0b3IucGFydGljbGVzVG9EZWxldGUucHVzaChAaWQpXG5cbiAgICAgIHJldHVyblxuXG4gICAgaWYgQGlzVGFyZ2V0XG4gICAgICBAbGluZVdpZHRoID0gQHNpemUgLyAxMFxuXG4gICAgICBpZiBAbGluZVdpZHRoID4gQ29uZmlnLm1heExpbmVXaWR0aFxuICAgICAgICBAbGluZVdpZHRoID0gQ29uZmlnLm1heExpbmVXaWR0aFxuXG4gICAgICBjb250ZXh0LmZpbGxTdHlsZSA9ICdyZ2JhKDI0NywgMjQ3LCAyNDcsIDAuOSknXG4gICAgICBjb250ZXh0LmxpbmVXaWR0aCA9IEBsaW5lV2lkdGhcblxuICAgIGNvbnRleHQuYmVnaW5QYXRoKClcbiAgICBjb250ZXh0LmFyYyhAcG9zaXRpb24ueCwgQHBvc2l0aW9uLnksIEBoYWxmLCAwLCBNYXRoLlBJICogMiwgdHJ1ZSlcbiAgICBjb250ZXh0LmZpbGwoKVxuICAgIGNvbnRleHQuc3Ryb2tlKCkgaWYgQGlzVGFyZ2V0XG4gICAgY29udGV4dC5jbG9zZVBhdGgoKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBvdXRzaWRlQ2FudmFzQm91bmRzOiAtPlxuXG4gICAgYmV5b25kQm91bmRzWCA9IEBwb3NpdGlvbi54IDwgLShAZmluYWxTaXplKSBvciBAcG9zaXRpb24ueCA+IGNhbnZhcy53aWR0aCAgKyBAZmluYWxTaXplXG4gICAgYmV5b25kQm91bmRzWSA9IEBwb3NpdGlvbi55IDwgLShAZmluYWxTaXplKSBvciBAcG9zaXRpb24ueSA+IGNhbnZhcy5oZWlnaHQgKyBAZmluYWxTaXplXG5cbiAgICByZXR1cm4gYmV5b25kQm91bmRzWCBvciBiZXlvbmRCb3VuZHNZXG5cbiAgdXBkYXRlVmFsdWVzOiAtPlxuXG4gICAgaWYgQGRlc3Ryb3lpbmdcbiAgICAgIHNocmlua011bHRpcGxpZXIgPSBpZiBQbGF5U3RhdGUucGxheWluZyB0aGVuIDAuNyBlbHNlIDAuOVxuXG4gICAgICBAc2l6ZSAqPSBzaHJpbmtNdWx0aXBsaWVyXG4gICAgZWxzZVxuICAgICAgaWYgQHNpemUgPCBAZmluYWxTaXplXG4gICAgICAgIEBzaXplICo9IFBsYXlTdGF0ZS5wYXJ0aWNsZUdyb3d0aE11bHRpcGxpZXJcblxuICAgICAgaWYgQHNpemUgPiBAZmluYWxTaXplXG4gICAgICAgIEBzaXplID0gQGZpbmFsU2l6ZVxuXG4gICAgQGhhbGYgPSBAc2l6ZSAvIDJcblxuICAgIEBwb3NpdGlvbi54ICs9IEB2ZWxvY2l0eS54XG4gICAgQHBvc2l0aW9uLnkgKz0gQHZlbG9jaXR5LnlcblxuICAgIEBkcmF3KClcblxuICAgIHJldHVybiB0aGlzXG5cbiAgd2FzVGFwcGVkOiAodG91Y2hEYXRhKSAtPlxuXG4gICAgdGFwWCAgICAgID0gdG91Y2hEYXRhLnBhZ2VYICogZGV2aWNlUGl4ZWxSYXRpb1xuICAgIHRhcFkgICAgICA9IHRvdWNoRGF0YS5wYWdlWSAqIGRldmljZVBpeGVsUmF0aW9cbiAgICBkaXN0YW5jZVggPSB0YXBYIC0gQHBvc2l0aW9uLnhcbiAgICBkaXN0YW5jZVkgPSB0YXBZIC0gQHBvc2l0aW9uLnlcbiAgICByYWRpdXMgICAgPSBAaGFsZlxuXG4gICAgcmV0dXJuIChkaXN0YW5jZVggKiBkaXN0YW5jZVgpICsgKGRpc3RhbmNlWSAqIGRpc3RhbmNlWSkgPCAoQGhhbGYgKiBAaGFsZilcbiIsIlxuY2xhc3MgUGFydGljbGVHZW5lcmF0b3JDbGFzc1xuXG4gIGNvbnN0cnVjdG9yOiAtPlxuXG4gICAgQHBhcnRpY2xlc0FycmF5ICAgICAgICAgPSBbXVxuICAgIEBwYXJ0aWNsZXNBcnJheUlkcyAgICAgID0gW11cbiAgICBAcGFydGljbGVzVG9EZWxldGUgICAgICA9IFtdXG4gICAgQHBhcnRpY2xlc1RvVGVzdEZvclRhcHMgPSBbXVxuXG4gICAgQHBhcnRpY2xlc09yaWdpbiA9XG4gICAgICB4OiBjYW52YXMud2lkdGggIC8gMlxuICAgICAgeTogY2FudmFzLmhlaWdodCAvIDJcblxuICAgIEByZWdpc3RlclBhcnRpY2xlVGFwRGV0ZWN0aW9uSGFuZGxlcigpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIGFuaW1hdGlvbkxvb3BBY3Rpb25zOiAtPlxuXG4gICAgaWYgUGxheVN0YXRlLnBsYXlpbmdcbiAgICAgIEBnZW5lcmF0ZVBhcnRpY2xlKClcblxuICAgIEB1cGRhdGVQYXJ0aWNsZXNWYWx1ZXMoKVxuICAgIEByZW1vdmVQYXJ0aWNsZXNBZnRlclRhcCgpXG5cbiAgICBpZiBAcGFydGljbGVzVG9EZWxldGUubGVuZ3RoID4gMFxuICAgICAgQGRlc3Ryb3lQYXJ0aWNsZXNPdXRzaWRlQ2FudmFzQm91bmRzKClcblxuICAgIHJldHVybiB0aGlzXG5cbiAgZGVzdHJveVBhcnRpY2xlc091dHNpZGVDYW52YXNCb3VuZHM6IC0+XG5cbiAgICBmb3IgcGFydGljbGVJZCBpbiBAcGFydGljbGVzVG9EZWxldGVcbiAgICAgIHBhcnRpY2xlSW5kZXggPSBAcGFydGljbGVzQXJyYXlJZHMuaW5kZXhPZihwYXJ0aWNsZUlkKVxuICAgICAgcGFydGljbGUgICAgICA9IEBwYXJ0aWNsZXNBcnJheVtwYXJ0aWNsZUluZGV4XVxuXG4gICAgICBpZiBwYXJ0aWNsZT9cbiAgICAgICAgQGdhbWVPdmVyKCkgaWYgcGFydGljbGUuaXNUYXJnZXRcbiAgICAgICAgQHJlbW92ZVBhcnRpY2xlKHBhcnRpY2xlKVxuXG4gICAgQHBhcnRpY2xlc1RvRGVsZXRlID0gW11cblxuICAgIHJldHVybiB0aGlzXG5cbiAgZ2FtZU92ZXI6IC0+XG5cbiAgICBAc3RvcCgpXG5cbiAgICBmb3IgcGFydGljbGUgaW4gQHBhcnRpY2xlc0FycmF5XG4gICAgICBwYXJ0aWNsZS5kZXN0cm95aW5nID0gdHJ1ZVxuXG4gICAgUGxheVN0YXRlLnBhcnRpY2xlU3Bhd25DaGFuY2UgPSAwXG5cbiAgICBHYW1lLm92ZXIoKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBnZW5lcmF0ZVBhcnRpY2xlOiAtPlxuXG4gICAgaWYgVXRpbHMucmFuZG9tUGVyY2VudGFnZSgpIDwgUGxheVN0YXRlLnBhcnRpY2xlU3Bhd25DaGFuY2VcbiAgICAgIHBhcnRpY2xlID0gbmV3IFBhcnRpY2xlQ2xhc3MoKVxuXG4gICAgICBAcGFydGljbGVzQXJyYXkucHVzaChwYXJ0aWNsZSlcbiAgICAgIEBwYXJ0aWNsZXNBcnJheUlkcy5wdXNoKHBhcnRpY2xlLmlkKVxuXG4gICAgICBpZiBwYXJ0aWNsZS5pc1RhcmdldFxuICAgICAgICBAcGFydGljbGVzVG9UZXN0Rm9yVGFwcy51bnNoaWZ0KHBhcnRpY2xlLmlkKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBwYXJ0aWNsZVRhcERldGVjdGlvbkhhbmRsZXI6ICgpIC0+XG5cbiAgICBjb25zb2xlLmxvZyhldmVudClcblxuICAgIHRhcmdldEhpdCA9IGZhbHNlXG5cbiAgICBmb3IgcGFydGljbGVJZCBpbiBAcGFydGljbGVzVG9UZXN0Rm9yVGFwc1xuICAgICAgcGFydGljbGVJbmRleCA9IEBwYXJ0aWNsZXNBcnJheUlkcy5pbmRleE9mKHBhcnRpY2xlSWQpXG4gICAgICBwYXJ0aWNsZSAgICAgID0gQHBhcnRpY2xlc0FycmF5W3BhcnRpY2xlSW5kZXhdXG4gICAgICB0b3VjaERhdGEgICAgID0gSW5wdXQuZ2V0VG91Y2hEYXRhKGV2ZW50KVxuXG4gICAgICBpZiBwYXJ0aWNsZT8gYW5kIHBhcnRpY2xlLndhc1RhcHBlZCh0b3VjaERhdGEpXG4gICAgICAgIGRlbGV0aW9uSW5kZXggICAgICAgPSBAcGFydGljbGVzVG9UZXN0Rm9yVGFwcy5pbmRleE9mKHBhcnRpY2xlSWQpXG4gICAgICAgIHBhcnRpY2xlLmRlc3Ryb3lpbmcgPSB0cnVlXG4gICAgICAgIHRhcmdldEhpdCAgICAgICAgICAgPSB0cnVlXG5cbiAgICAgICAgQHBhcnRpY2xlc1RvVGVzdEZvclRhcHMuc3BsaWNlKGRlbGV0aW9uSW5kZXgsIDEpXG5cbiAgICAgICAgYnJlYWtcblxuICAgIFBsYXlTdGF0ZS51cGRhdGVDb21ib011bHRpcGxpZXIodGFyZ2V0SGl0KVxuXG4gICAgaWYgdGFyZ2V0SGl0XG4gICAgICBQbGF5U3RhdGUudXBkYXRlU2NvcmUocGFydGljbGUuc2l6ZSwgcGFydGljbGUuZmluYWxTaXplKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICByZWdpc3RlclBhcnRpY2xlVGFwRGV0ZWN0aW9uSGFuZGxlcjogLT5cblxuICAgIElucHV0LnJlZ2lzdGVySGFuZGxlciAnLmNhbnZhcycsICdwbGF5aW5nJywgLT5cbiAgICAgIFBhcnRpY2xlR2VuZXJhdG9yLnBhcnRpY2xlVGFwRGV0ZWN0aW9uSGFuZGxlcigpXG4gICAgICByZXR1cm5cblxuICAgIHJldHVybiB0aGlzXG5cbiAgcmVtb3ZlUGFydGljbGU6IChwYXJ0aWNsZSkgLT5cblxuICAgIGlkICAgID0gcGFydGljbGUuaWRcbiAgICBpbmRleCA9IEBwYXJ0aWNsZXNBcnJheUlkcy5pbmRleE9mKGlkKVxuXG4gICAgQHBhcnRpY2xlc0FycmF5LnNwbGljZShpbmRleCwgMSlcbiAgICBAcGFydGljbGVzQXJyYXlJZHMuc3BsaWNlKGluZGV4LCAxKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICByZW1vdmVQYXJ0aWNsZXNBZnRlclRhcDogLT5cblxuICAgIGZvciBwYXJ0aWNsZSBpbiBAcGFydGljbGVzQXJyYXlcbiAgICAgIGlmIHBhcnRpY2xlPyBhbmQgcGFydGljbGUuc2l6ZSA8IDFcbiAgICAgICAgQHJlbW92ZVBhcnRpY2xlKHBhcnRpY2xlKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICByZXNldDogLT5cblxuICAgIEBwYXJ0aWNsZXNBcnJheSAgICAgICAgID0gW11cbiAgICBAcGFydGljbGVzQXJyYXlJZHMgICAgICA9IFtdXG4gICAgQHBhcnRpY2xlc1RvRGVsZXRlICAgICAgPSBbXVxuICAgIEBwYXJ0aWNsZXNUb1Rlc3RGb3JUYXBzID0gW11cblxuICAgIHJldHVybiB0aGlzXG5cbiAgc3RvcDogLT5cblxuICAgIFBsYXlTdGF0ZS51cGRhdGUoZmFsc2UpXG4gICAgUGxheVN0YXRlLnN0b3BMZXZlbFVwSW5jcmVtZW50KClcblxuICAgIHJldHVybiB0aGlzXG5cbiAgdXBkYXRlUGFydGljbGVzVmFsdWVzOiAtPlxuXG4gICAgZm9yIHBhcnRpY2xlIGluIEBwYXJ0aWNsZXNBcnJheVxuICAgICAgaWYgcGFydGljbGU/XG4gICAgICAgIGNvbnRleHQuZmlsbFN0eWxlICAgPSBwYXJ0aWNsZS5jb2xvclxuICAgICAgICBjb250ZXh0LnN0cm9rZVN0eWxlID0gcGFydGljbGUuY29sb3JcblxuICAgICAgICBwYXJ0aWNsZS51cGRhdGVWYWx1ZXMoKVxuXG4gICAgcmV0dXJuIHRoaXNcbiIsIlxuY2xhc3MgUGxheVN0YXRlQ2xhc3NcblxuICBkZWZhdWx0czpcbiAgICBjb21ib011bHRpcGxpZXI6IDBcbiAgICBsZXZlbDogICAgICAgICAgIDFcbiAgICBzY29yZTogICAgICAgICAgIDBcblxuICByZXNldDogLT5cblxuICAgIEBjaGFuY2VQYXJ0aWNsZUlzVGFyZ2V0ICAgPSBDb25maWcuY2hhbmNlUGFydGljbGVJc1RhcmdldC5lYXN5XG4gICAgQGNvbWJvTXVsdGlwbGllciAgICAgICAgICA9IEBkZWZhdWx0cy5jb21ib011bHRpcGxpZXJcbiAgICBAbGV2ZWwgICAgICAgICAgICAgICAgICAgID0gQGRlZmF1bHRzLmxldmVsXG4gICAgQG1heFRhcmdldHNBdE9uY2UgICAgICAgICA9IENvbmZpZy5tYXhUYXJnZXRzQXRPbmNlLmVhc3lcbiAgICBAbWluVGFyZ2V0U2l6ZSAgICAgICAgICAgID0gQ29uZmlnLm1pblRhcmdldFNpemUuZWFzeVxuICAgIEBwYXJ0aWNsZUdyb3d0aE11bHRpcGxpZXIgPSBDb25maWcucGFydGljbGVHcm93dGhNdWx0aXBsaWVyLmVhc3lcbiAgICBAcGFydGljbGVTcGF3bkNoYW5jZSAgICAgID0gQ29uZmlnLnBhcnRpY2xlU3Bhd25DaGFuY2UuZWFzeVxuICAgIEBzY29yZSAgICAgICAgICAgICAgICAgICAgPSBAZGVmYXVsdHMuc2NvcmVcbiAgICBAc2l6ZU1heCAgICAgICAgICAgICAgICAgID0gQ29uZmlnLnNpemVNYXguZWFzeVxuICAgIEB0YXJnZXRWZWxvY2l0eU11bHRpcGxpZXIgPSBDb25maWcudGFyZ2V0VmVsb2NpdHlNdWx0aXBsaWVyLmVhc3lcbiAgICBAdmVsb2NpdHlNaW4gICAgICAgICAgICAgID0gQ29uZmlnLnZlbG9jaXR5TWluLmVhc3lcbiAgICBAdmVsb2NpdHlNYXggICAgICAgICAgICAgID0gQ29uZmlnLnZlbG9jaXR5TWF4LmVhc3lcblxuICAgIEB1cGRhdGUodHJ1ZSlcblxuICAgIENvbmZpZy51cGRhdGVWYWx1ZXNGb3JEaWZmaWN1bHR5KClcblxuICAgIEBzZXR1cExldmVsVXBJbmNyZW1lbnQoKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBzdG9wTGV2ZWxVcEluY3JlbWVudDogLT5cblxuICAgIHdpbmRvdy5jbGVhckludGVydmFsKEBsZXZlbFVwQ291bnRlcilcblxuICAgIHJldHVybiB0aGlzXG5cbiAgc2V0dXBMZXZlbFVwSW5jcmVtZW50OiAtPlxuXG4gICAgQGxldmVsVXBDb3VudGVyID0gd2luZG93LnNldEludGVydmFsID0+XG5cbiAgICAgIEB1cGRhdGVMZXZlbCgpXG5cbiAgICAgIHJldHVyblxuXG4gICAgLCBDb25maWcubGV2ZWxVcEludGVydmFsICogMTAwMFxuXG4gICAgcmV0dXJuIHRoaXNcblxuICB1cGRhdGVDb21ib011bHRpcGxpZXI6ICh0YXJnZXRIaXQpIC0+XG5cbiAgICBAY29tYm9NdWx0aXBsaWVyID0gaWYgdGFyZ2V0SGl0IHRoZW4gQGNvbWJvTXVsdGlwbGllciArIDEgZWxzZSBAZGVmYXVsdHMuY29tYm9NdWx0aXBsaWVyXG5cbiAgICBVSS51cGRhdGVDb21ib011bHRpcGxpZXJDb3VudGVyKClcblxuICAgIHJldHVybiB0aGlzXG5cbiAgdXBkYXRlOiAobmV3U3RhdGUpIC0+XG5cbiAgICBAcGxheWluZyA9IG5ld1N0YXRlXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHVwZGF0ZUxldmVsOiAtPlxuXG4gICAgQGxldmVsICs9IDFcblxuICAgIGlmIEBsZXZlbCA+PSBDb25maWcubWF4TGV2ZWxcbiAgICAgIHdpbmRvdy5jbGVhckludGVydmFsKEBsZXZlbFVwQ291bnRlcilcblxuICAgIFVJLnVwZGF0ZUxldmVsQ291bnRlcigpXG4gICAgQ29uZmlnLnVwZGF0ZVZhbHVlc0ZvckRpZmZpY3VsdHkoKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICB1cGRhdGVTY29yZTogKHNpemVXaGVuVGFwcGVkLCBzaXplV2hlbkZ1bGx5R3Jvd24pIC0+XG5cbiAgICAjKChkZWZhdWx0U2NvcmVQZXJQb3AgKyAoMTAwIC0gKChzaXplV2hlblRhcHBlZCAvIHNpemVXaGVuRnVsbHlHcm93bikgKiAxMDApKSkgKiBjb21ib011bHRpcGxpZXIpICogKGxldmVsTnVtYmVyICsgMSlcblxuICAgIHRhcmdldFNpemVCb251cyA9IE1hdGgucm91bmQoMTAwIC0gKChzaXplV2hlblRhcHBlZCAvIHNpemVXaGVuRnVsbHlHcm93bikgKiAxMDApKVxuICAgIHBvcFBvaW50VmFsdWUgICA9IENvbmZpZy5wb2ludHNQZXJQb3AgKyB0YXJnZXRTaXplQm9udXNcbiAgICBsZXZlbE11bHRpcGxpZXIgPSBAbGV2ZWwgKyAxXG5cbiAgICBAc2NvcmUgKz0gKHBvcFBvaW50VmFsdWUgKiBAY29tYm9NdWx0aXBsaWVyKSAqIChsZXZlbE11bHRpcGxpZXIpXG5cbiAgICBVSS51cGRhdGVTY29yZUNvdW50ZXIoKVxuXG4gICAgcmV0dXJuIHRoaXNcbiIsIlxuY2xhc3MgU2NlbmVzQ2xhc3NcblxuICBAY3VycmVudCA9IG51bGxcblxuICBjcmVkaXRzOiAtPlxuXG4gICAgQGN1cnJlbnQgPSAnY3JlZGl0cydcblxuICAgIFVJLnVwZGF0ZUJvZHlDbGFzcygnY3JlZGl0cycpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIGdhbWVPdmVyOiAtPlxuXG4gICAgQGN1cnJlbnQgPSAnZ2FtZS1vdmVyJ1xuXG4gICAgVUkudXBkYXRlQm9keUNsYXNzKCdnYW1lLW92ZXInKVxuXG4gICAgSW5wdXQuYWRkR2FtZVN0YXJ0VGFwRXZlbnRIYW5kbGVyKClcblxuICAgIHJldHVybiB0aGlzXG5cbiAgbGVhZGVyYm9hcmQ6IC0+XG5cbiAgICBAY3VycmVudCA9ICdsZWFkZXJib2FyZCdcblxuICAgIHJldHVybiB0aGlzXG5cbiAgcGxheWluZzogLT5cblxuICAgIEBjdXJyZW50ID0gJ3BsYXlpbmcnXG5cbiAgICBVSS51cGRhdGVCb2R5Q2xhc3MoJ3BsYXlpbmcnKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBpZGVudDogLT5cblxuICAgIEBjdXJyZW50ID0gJ2lkZW50J1xuXG4gICAgVUkudXBkYXRlQm9keUNsYXNzKCdpZGVudCcpXG5cbiAgICB3aW5kb3cuc2V0VGltZW91dCA9PlxuICAgICAgQHRpdGxlKClcbiAgICAsIDUwMFxuXG4gICAgcmV0dXJuIHRoaXNcblxuICB0aXRsZTogLT5cblxuICAgIEBjdXJyZW50ID0gJ3RpdGxlJ1xuXG4gICAgVUkudXBkYXRlQm9keUNsYXNzKCd0aXRsZScpXG5cbiAgICBJbnB1dC5hZGRHYW1lU3RhcnRUYXBFdmVudEhhbmRsZXIoKTtcblxuICAgIHJldHVybiB0aGlzXG4iLCJcbmNsYXNzIFVJQ2xhc3NcblxuICByZXNldDogLT5cblxuICAgIEBsZXZlbENvdW50ZXIgICAgICAgICAgID0gVXRpbHMuJCgnLmh1ZC12YWx1ZS1sZXZlbCcpXG4gICAgQHNjb3JlQ291bnRlciAgICAgICAgICAgPSBVdGlscy4kKCcuaHVkLXZhbHVlLXNjb3JlJylcbiAgICBAY29tYm9NdWx0aXBsaWVyQ291bnRlciA9IFV0aWxzLiQoJy5odWQtdmFsdWUtY29tYm8nKVxuICAgIEBwbGF5QWdhaW4gICAgICAgICAgICAgID0gVXRpbHMuJCgnLnBsYXktYWdhaW4nKVxuXG4gICAgQHVwZGF0ZUNvbWJvTXVsdGlwbGllckNvdW50ZXIoKVxuICAgIEB1cGRhdGVMZXZlbENvdW50ZXIoKVxuICAgIEB1cGRhdGVTY29yZUNvdW50ZXIoKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICB1cGRhdGVCb2R5Q2xhc3M6IChjbGFzc05hbWUpIC0+XG5cbiAgICBib2R5LmNsYXNzTmFtZSA9ICcnXG4gICAgYm9keS5jbGFzc0xpc3QuYWRkKCdzY2VuZS0nICsgY2xhc3NOYW1lKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICB1cGRhdGVDb21ib011bHRpcGxpZXJDb3VudGVyOiAtPlxuXG4gICAgVXRpbHMudXBkYXRlVUlUZXh0Tm9kZShAY29tYm9NdWx0aXBsaWVyQ291bnRlciwgUGxheVN0YXRlLmNvbWJvTXVsdGlwbGllcilcblxuICAgIHJldHVybiB0aGlzXG5cbiAgdXBkYXRlTGV2ZWxDb3VudGVyOiAtPlxuXG4gICAgVXRpbHMudXBkYXRlVUlUZXh0Tm9kZShAbGV2ZWxDb3VudGVyLCBQbGF5U3RhdGUubGV2ZWwpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHVwZGF0ZVNjb3JlQ291bnRlcjogLT5cblxuICAgIHNjb3JlVG9Gb3JtYXQgPSBVdGlscy5mb3JtYXRXaXRoQ29tbWEoUGxheVN0YXRlLnNjb3JlKVxuXG4gICAgVXRpbHMudXBkYXRlVUlUZXh0Tm9kZShAc2NvcmVDb3VudGVyLCBzY29yZVRvRm9ybWF0KVxuXG4gICAgcmV0dXJuIHRoaXNcbiIsIlxuY2xhc3MgVXRpbHNDbGFzc1xuXG4gICQ6IChzZWxlY3RvcikgLT5cbiAgICBpZiBzZWxlY3Rvci5zdWJzdHIoMCwgMSkgPT0gJyMnXG4gICAgICByZXR1cm4gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoc2VsZWN0b3IpXG5cbiAgICBlbHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKVxuXG4gICAgaWYgZWxzLmxlbmd0aCA9PSAxXG4gICAgICByZXR1cm4gZWxzWzBdXG5cbiAgICByZXR1cm4gZWxzXG5cbiAgY29ycmVjdFZhbHVlRm9yRFBSOiAodmFsdWUsIGludGVnZXIgPSBmYWxzZSkgLT5cblxuICAgIHZhbHVlICo9IGRldmljZVBpeGVsUmF0aW9cblxuICAgIGlmIGludGVnZXJcbiAgICAgIHZhbHVlID0gTWF0aC5yb3VuZCh2YWx1ZSlcblxuICAgIHJldHVybiB2YWx1ZVxuXG4gIGZvcm1hdFdpdGhDb21tYTogKG51bSkgLT5cblxuICAgIHJldHVybiBudW0udG9TdHJpbmcoKS5yZXBsYWNlKC9cXEIoPz0oXFxkezN9KSsoPyFcXGQpKS9nLCBcIixcIilcblxuICByYW5kb206IChtaW4sIG1heCkgLT5cblxuICAgIGlmIG1pbiA9PSB1bmRlZmluZWRcbiAgICAgIG1pbiA9IDBcbiAgICAgIG1heCA9IDFcbiAgICBlbHNlIGlmIG1heCA9PSB1bmRlZmluZWRcbiAgICAgIG1heCA9IG1pblxuICAgICAgbWluID0gMFxuXG4gICAgcmV0dXJuIChNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbikpICsgbWluO1xuXG4gIHJhbmRvbUNvbG9yOiAoYWxwaGEgPSBmYWxzZSkgLT5cblxuICAgIGNvbG9ycyA9XG4gICAgICByOiB0aGlzLnJhbmRvbUludGVnZXIoMCwgMjAwKVxuICAgICAgZzogdGhpcy5yYW5kb21JbnRlZ2VyKDAsIDIwMClcbiAgICAgIGI6IHRoaXMucmFuZG9tSW50ZWdlcigwLCAyMDApXG4gICAgICBhOiBpZiAhYWxwaGEgdGhlbiB0aGlzLnJhbmRvbSgwLjc1LCAxKSBlbHNlIGFscGhhXG5cbiAgICByZXR1cm4gJ3JnYmEoJyArIGNvbG9ycy5yICsgJywgJyArIGNvbG9ycy5nICsgJywgJyArIGNvbG9ycy5iICsgJywgJyArIGNvbG9ycy5hICsgJyknXG5cbiAgcmFuZG9tSW50ZWdlcjogKG1pbiwgbWF4KSAtPlxuXG4gICAgaWYgbWF4ID09IHVuZGVmaW5lZFxuICAgICAgbWF4ID0gbWluXG4gICAgICBtaW4gPSAwXG5cbiAgICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKG1heCArIDEgLSBtaW4pKSArIG1pblxuXG4gIHJhbmRvbVBlcmNlbnRhZ2U6IC0+XG5cbiAgICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTAwKVxuXG4gIHVwZGF0ZVVJVGV4dE5vZGU6IChlbGVtZW50LCB2YWx1ZSkgLT5cblxuICAgIGVsZW1lbnQuaW5uZXJIVE1MID0gdmFsdWVcblxuICAgIHJldHVybiB0aGlzXG4iLCJcbmRlYnVnID0gdHJ1ZVxuXG5hbmRyb2lkICAgICAgICA9IGlmIG5hdmlnYXRvci51c2VyQWdlbnQubWF0Y2goL2FuZHJvaWQvaSkgdGhlbiB0cnVlIGVsc2UgZmFsc2VcbmJvZHkgICAgICAgICAgID0gZG9jdW1lbnQuYm9keVxuY2FudmFzICAgICAgICAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuY2FudmFzJylcbmhhc1RvdWNoRXZlbnRzID0gd2luZG93Lmhhc093blByb3BlcnR5KCdvbnRvdWNoc3RhcnQnKSB8fCB3aW5kb3cuaGFzT3duUHJvcGVydHkoJ29ubXNnZXN0dXJlY2hhbmdlJylcbmlucHV0VmVyYiAgICAgID0gaWYgaGFzVG91Y2hFdmVudHMgdGhlbiAndG91Y2hzdGFydCcgZWxzZSAnY2xpY2snXG5cbmNhbnZhcy5jbGFzc05hbWUgPSAnY2FudmFzJ1xuY2FudmFzLndpZHRoICAgICA9IGJvZHkuY2xpZW50V2lkdGhcbmNhbnZhcy5oZWlnaHQgICAgPSBib2R5LmNsaWVudEhlaWdodFxuXG5jb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoJzJkJylcblxuY29udGV4dC5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb24gPSAnc291cmNlLWF0b3AnXG5cbmRldmljZVBpeGVsUmF0aW8gID0gd2luZG93LmRldmljZVBpeGVsUmF0aW8gfHwgMVxuYmFja2luZ1N0b3JlUmF0aW8gPSBjb250ZXh0LndlYmtpdEJhY2tpbmdTdG9yZVBpeGVsUmF0aW8gfHwgY29udGV4dC5iYWNraW5nU3RvcmVQaXhlbFJhdGlvIHx8IDFcbnJhdGlvICAgICAgICAgICAgID0gZGV2aWNlUGl4ZWxSYXRpbyAvIGJhY2tpbmdTdG9yZVJhdGlvXG5cbmlmIGRldmljZVBpeGVsUmF0aW8gIT0gYmFja2luZ1N0b3JlUmF0aW9cbiAgb2xkV2lkdGggID0gY2FudmFzLndpZHRoXG4gIG9sZEhlaWdodCA9IGNhbnZhcy5oZWlnaHRcblxuICBjYW52YXMud2lkdGggID0gb2xkV2lkdGggICogcmF0aW9cbiAgY2FudmFzLmhlaWdodCA9IG9sZEhlaWdodCAqIHJhdGlvXG5cbiAgY2FudmFzLnN0eWxlLndpZHRoICA9IFwiI3tvbGRXaWR0aH1weFwiXG4gIGNhbnZhcy5zdHlsZS5oZWlnaHQgPSBcIiN7b2xkSGVpZ2h0fXB4XCJcblxuICBjb250ZXh0LnNjYWxlKHJhdGlvLCByYXRpbylcblxuIyBTZXQgZW52aXJvbm1lbnQgYW5kIGJhc2UgY29uZmlnIGV0Y1xuRGV2aWNlICAgICAgICAgICAgPSBuZXcgRGV2aWNlQ2xhc3MoKVxuVXRpbHMgICAgICAgICAgICAgPSBuZXcgVXRpbHNDbGFzcygpXG5Db25maWcgICAgICAgICAgICA9IG5ldyBDb25maWdDbGFzcygpXG5JbnB1dCAgICAgICAgICAgICA9IG5ldyBJbnB1dENsYXNzKClcblxuIyBMb2FkIHRoZSBnYW1lIGxvZ2ljIGFuZCBhbGwgdGhhdFxuUGFydGljbGVHZW5lcmF0b3IgPSBuZXcgUGFydGljbGVHZW5lcmF0b3JDbGFzcygpXG5QbGF5U3RhdGUgICAgICAgICA9IG5ldyBQbGF5U3RhdGVDbGFzcygpXG5VSSAgICAgICAgICAgICAgICA9IG5ldyBVSUNsYXNzKClcblNjZW5lcyAgICAgICAgICAgID0gbmV3IFNjZW5lc0NsYXNzKClcblxuIyBTZXQgb2ZmIHRoZSBjYW52YXMgYW5pbWF0aW9uIGxvb3BcbkFuaW1hdGlvbkxvb3AgICAgID0gbmV3IEFuaW1hdGlvbkxvb3BDbGFzcygpXG5cbiMgU3RhcnQgdGhlIGFjdHVhbCBnYW1lXG5HYW1lICAgICAgICAgICAgICA9IG5ldyBHYW1lQ2xhc3MoKVxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9