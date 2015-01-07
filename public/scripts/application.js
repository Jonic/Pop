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
  ParticleClass.prototype.destroying = false;

  ParticleClass.prototype.size = 1;

  function ParticleClass() {
    var a, b, g, r;
    r = Utils.randomInteger(0, 200);
    g = Utils.randomInteger(0, 200);
    b = Utils.randomInteger(0, 200);
    a = Utils.random(0.75, 1);
    this.color = "rgba(" + r + ", " + g + ", " + b + ", " + a + ")";
    this.finalSize = Utils.randomInteger(0, PlayState.sizeMax);
    this.id = Math.random().toString(36).substr(2, 5);
    this.isTarget = this.determineTargetParticle();
    this.position = {
      x: ParticleGenerator.particlesOrigin.x,
      y: ParticleGenerator.particlesOrigin.y
    };
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
    Input.registerHandler('.ui-playing', 'playing', function() {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkFuaW1hdGlvbkxvb3AuY29mZmVlIiwiQ29uZmlnLmNvZmZlZSIsIkRldmljZS5jb2ZmZWUiLCJHYW1lLmNvZmZlZSIsIklucHV0LmNvZmZlZSIsIlBhcnRpY2xlLmNvZmZlZSIsIlBhcnRpY2xlR2VuZXJhdG9yLmNvZmZlZSIsIlBsYXlTdGF0ZS5jb2ZmZWUiLCJTY2VuZXMuY29mZmVlIiwiVUkuY29mZmVlIiwiVXRpbHMuY29mZmVlIiwiX2Jvb3RzdHJhcC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsSUFBQSxrQkFBQTs7QUFBQTtBQUVlLEVBQUEsNEJBQUEsR0FBQTtBQUVYLElBQUEsSUFBQyxDQUFBLHFCQUFELENBQUEsQ0FBQSxDQUFBO0FBRUEsV0FBTyxJQUFQLENBSlc7RUFBQSxDQUFiOztBQUFBLCtCQU1BLG9CQUFBLEdBQXNCLFNBQUEsR0FBQTtBQUVwQixJQUFBLE1BQU0sQ0FBQyxvQkFBUCxDQUE0QixJQUFDLENBQUEsZUFBN0IsQ0FBQSxDQUFBO0FBRUEsV0FBTyxJQUFQLENBSm9CO0VBQUEsQ0FOdEIsQ0FBQTs7QUFBQSwrQkFZQSxxQkFBQSxHQUF1QixTQUFBLEdBQUE7QUFFckIsSUFBQSxJQUFDLENBQUEsZUFBRCxHQUFtQixNQUFNLENBQUMscUJBQVAsQ0FBNkIsQ0FBQSxTQUFBLEtBQUEsR0FBQTthQUFBLFNBQUEsR0FBQTtBQUU5QyxRQUFBLEtBQUMsQ0FBQSxxQkFBRCxDQUFBLENBQUEsQ0FGOEM7TUFBQSxFQUFBO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE3QixDQUFuQixDQUFBO0FBQUEsSUFNQSxNQUFNLENBQUMsS0FBUCxHQUFlLE1BQU0sQ0FBQyxLQU50QixDQUFBO0FBQUEsSUFRQSxpQkFBaUIsQ0FBQyxvQkFBbEIsQ0FBQSxDQVJBLENBQUE7QUFVQSxXQUFPLElBQVAsQ0FacUI7RUFBQSxDQVp2QixDQUFBOzs0QkFBQTs7SUFGRixDQUFBOztBQ0FBLElBQUEsV0FBQTs7QUFBQTtBQUVFLHdC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WSxLQUg1QixDQUFBO0FBQUEsRUFJQSxNQUFNLENBQUMsTUFBUCxHQUFnQixTQUFBLEdBQVksS0FKNUIsQ0FBQTtBQUFBLEVBTUEsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFiLEdBQXNCLEVBQUEsR0FBRyxRQUFILEdBQVksSUFObEMsQ0FBQTtBQUFBLEVBT0EsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFiLEdBQXNCLEVBQUEsR0FBRyxTQUFILEdBQWEsSUFQbkMsQ0FBQTtBQUFBLEVBU0EsT0FBTyxDQUFDLEtBQVIsQ0FBYyxLQUFkLEVBQXFCLEtBQXJCLENBVEEsQ0FERjtDQXBCQTs7QUFBQSxNQWlDQSxHQUF3QixJQUFBLFdBQUEsQ0FBQSxDQWpDeEIsQ0FBQTs7QUFBQSxLQWtDQSxHQUF3QixJQUFBLFVBQUEsQ0FBQSxDQWxDeEIsQ0FBQTs7QUFBQSxNQW1DQSxHQUF3QixJQUFBLFdBQUEsQ0FBQSxDQW5DeEIsQ0FBQTs7QUFBQSxLQW9DQSxHQUF3QixJQUFBLFVBQUEsQ0FBQSxDQXBDeEIsQ0FBQTs7QUFBQSxpQkF1Q0EsR0FBd0IsSUFBQSxzQkFBQSxDQUFBLENBdkN4QixDQUFBOztBQUFBLFNBd0NBLEdBQXdCLElBQUEsY0FBQSxDQUFBLENBeEN4QixDQUFBOztBQUFBLEVBeUNBLEdBQXdCLElBQUEsT0FBQSxDQUFBLENBekN4QixDQUFBOztBQUFBLE1BMENBLEdBQXdCLElBQUEsV0FBQSxDQUFBLENBMUN4QixDQUFBOztBQUFBLGFBNkNBLEdBQXdCLElBQUEsa0JBQUEsQ0FBQSxDQTdDeEIsQ0FBQTs7QUFBQSxJQWdEQSxHQUF3QixJQUFBLFNBQUEsQ0FBQSxDQWhEeEIsQ0FBQSIsImZpbGUiOiJhcHBsaWNhdGlvbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIlxuY2xhc3MgQW5pbWF0aW9uTG9vcENsYXNzXG5cbiAgY29uc3RydWN0b3I6IC0+XG5cbiAgICBAcmVxdWVzdEFuaW1hdGlvbkZyYW1lKClcblxuICAgIHJldHVybiB0aGlzXG5cbiAgY2FuY2VsQW5pbWF0aW9uRnJhbWU6IC0+XG5cbiAgICB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUoQGFuaW1hdGlvbkxvb3BJZClcblxuICAgIHJldHVybiB0aGlzXG5cbiAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lOiAtPlxuXG4gICAgQGFuaW1hdGlvbkxvb3BJZCA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPT5cblxuICAgICAgQHJlcXVlc3RBbmltYXRpb25GcmFtZSgpXG5cbiAgICAgIHJldHVyblxuXG4gICAgY2FudmFzLndpZHRoID0gY2FudmFzLndpZHRoXG5cbiAgICBQYXJ0aWNsZUdlbmVyYXRvci5hbmltYXRpb25Mb29wQWN0aW9ucygpXG5cbiAgICByZXR1cm4gdGhpc1xuIiwiXG5jbGFzcyBDb25maWdDbGFzc1xuXG4gIGNoYW5jZVBhcnRpY2xlSXNUYXJnZXQ6XG4gICAgZWFzeTogICAgICA1MFxuICAgIGRpZmZpY3VsdDogOTBcblxuICBsZXZlbFVwSW50ZXJ2YWw6IDVcblxuICBtYXhMZXZlbDogNTBcblxuICBtYXhMaW5lV2lkdGg6IDVcblxuICBtYXhUYXJnZXRzQXRPbmNlOlxuICAgIGVhc3k6ICAgICAgM1xuICAgIGRpZmZpY3VsdDogNlxuXG4gIHBhcnRpY2xlR3Jvd3RoTXVsdGlwbGllcjpcbiAgICBlYXN5OiAgICAgIDEuMDVcbiAgICBkaWZmaWN1bHQ6IDEuMTBcblxuICBwYXJ0aWNsZVNwYXduQ2hhbmNlOlxuICAgIGVhc3k6ICAgICAgNjBcbiAgICBkaWZmaWN1bHQ6IDEwMFxuXG4gIHBhcnRpY2xlRGlhbWV0ZXJBc1BlcmNlbnRhZ2VPZlNjcmVlbjogMTVcblxuICBwb2ludHNQZXJQb3A6IDEwXG5cbiAgcHJvcGVydGllc1RvVXBkYXRlV2l0aERpZmZpY3VsdHk6IFtcbiAgICAncGFydGljbGVTcGF3bkNoYW5jZSdcbiAgICAnY2hhbmNlUGFydGljbGVJc1RhcmdldCdcbiAgICAncGFydGljbGVHcm93dGhNdWx0aXBsaWVyJ1xuICAgICdzaXplTWF4J1xuICAgICdtYXhUYXJnZXRzQXRPbmNlJ1xuICAgICdtaW5UYXJnZXRTaXplJ1xuICAgICd2ZWxvY2l0eU1pbidcbiAgICAndmVsb2NpdHlNYXgnXG4gICAgJ3RhcmdldFZlbG9jaXR5TXVsdGlwbGllcidcbiAgXVxuXG4gIHRhcmdldFZlbG9jaXR5TXVsdGlwbGllcjpcbiAgICBlYXN5OiAgICAgIDAuM1xuICAgIGRpZmZpY3VsdDogMC41XG5cbiAgdmVsb2NpdHlNaW46XG4gICAgZWFzeTogICAgICAtNlxuICAgIGRpZmZpY3VsdDogLTEwXG5cbiAgdmVsb2NpdHlNYXg6XG4gICAgZWFzeTogICAgICA2XG4gICAgZGlmZmljdWx0OiAxMFxuXG4gIGNvbnN0cnVjdG9yOiAtPlxuXG4gICAgYmFzZVNjcmVlbldpZHRoICAgPSBNYXRoLm1pbihib2R5LmNsaWVudFdpZHRoLCBib2R5LmNsaWVudEhlaWdodCkgLyAxMDBcbiAgICBiYXNlUGFydGljbGVXaWR0aCA9IE1hdGgucm91bmQoYmFzZVNjcmVlbldpZHRoICogQHBhcnRpY2xlRGlhbWV0ZXJBc1BlcmNlbnRhZ2VPZlNjcmVlbilcblxuICAgIEBiYXNlUGFydGljbGVTaXplID0gYmFzZVBhcnRpY2xlV2lkdGggKiBkZXZpY2VQaXhlbFJhdGlvXG5cbiAgICBAbWluVGFyZ2V0U2l6ZSA9XG4gICAgICBlYXN5OiAgICAgIEBiYXNlUGFydGljbGVTaXplICogMC43XG4gICAgICBkaWZmaWN1bHQ6IEBiYXNlUGFydGljbGVTaXplICogMC40XG5cblxuICAgIEBzaXplTWF4ID1cbiAgICAgIGVhc3k6ICAgICAgQGJhc2VQYXJ0aWNsZVNpemVcbiAgICAgIGRpZmZpY3VsdDogQGJhc2VQYXJ0aWNsZVNpemUgKiAwLjZcblxuICAgIHJldHVybiB0aGlzXG5cbiAgdXBkYXRlVmFsdWVzRm9yRGlmZmljdWx0eTogLT5cblxuICAgIGZvciBwcm9wZXJ0eSBpbiBAcHJvcGVydGllc1RvVXBkYXRlV2l0aERpZmZpY3VsdHlcbiAgICAgIHByb3BlcnR5Q29uZmlnICA9IEBbcHJvcGVydHldXG4gICAgICB2YWx1ZURpZmZlcmVuY2UgPSBwcm9wZXJ0eUNvbmZpZy5kaWZmaWN1bHQgLSBwcm9wZXJ0eUNvbmZpZy5lYXN5XG4gICAgICBsZXZlbE11bGl0cGxpZXIgPSBQbGF5U3RhdGUubGV2ZWwgLyBAbWF4TGV2ZWxcblxuICAgICAgUGxheVN0YXRlW3Byb3BlcnR5XSA9ICh2YWx1ZURpZmZlcmVuY2UgKiBsZXZlbE11bGl0cGxpZXIpICsgcHJvcGVydHlDb25maWcuZWFzeVxuXG4gICAgcmV0dXJuIHRoaXNcbiIsIlxuY2xhc3MgRGV2aWNlQ2xhc3NcblxuICBjb25zdHJ1Y3RvcjogLT5cblxuICAgIHJldHVybiB0aGlzXG4iLCJcbmNsYXNzIEdhbWVDbGFzc1xuXG4gIGNvbnN0cnVjdG9yOiAtPlxuXG4gICAgU2NlbmVzLmlkZW50KClcblxuICAgIHJldHVybiB0aGlzXG5cbiAgb3ZlcjogLT5cblxuICAgIFNjZW5lcy5nYW1lT3ZlcigpXG5cbiAgICBQbGF5U3RhdGUuc3RvcExldmVsVXBJbmNyZW1lbnQoKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBzdGFydDogLT5cblxuICAgIFBsYXlTdGF0ZS5yZXNldCgpXG4gICAgVUkucmVzZXQoKVxuICAgIElucHV0LnJlbW92ZUdhbWVTdGFydFRhcEV2ZW50SGFuZGxlcigpXG4gICAgUGFydGljbGVHZW5lcmF0b3IucmVzZXQoKVxuXG4gICAgU2NlbmVzLnBsYXlpbmcoKVxuXG4gICAgcmV0dXJuIHRoaXNcbiIsIlxuY2xhc3MgSW5wdXRDbGFzc1xuXG4gIGNvbnN0cnVjdG9yOiAtPlxuXG4gICAgQGNhbmNlbFRvdWNoTW92ZUV2ZW50cygpXG5cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciBpbnB1dFZlcmIsIChldmVudCkgLT5cbiAgICAgICNjb25zb2xlLmxvZyBldmVudC50YXJnZXQubm9kZU5hbWUudG9Mb3dlckNhc2UoKVxuICAgICAgcmV0dXJuXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIGFkZEdhbWVTdGFydFRhcEV2ZW50SGFuZGxlcjogKCkgLT5cblxuICAgIGJvZHkuYWRkRXZlbnRMaXN0ZW5lcihpbnB1dFZlcmIsIEBnYW1lU3RhcnRUYXBFdmVudEhhbmRsZXIpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIGNhbmNlbFRvdWNoTW92ZUV2ZW50czogLT5cblxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyICd0b3VjaG1vdmUnLCAoZXZlbnQpIC0+XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG5cbiAgICAgIHJldHVyblxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBnYW1lU3RhcnRUYXBFdmVudEhhbmRsZXI6IChldmVudCkgLT5cblxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcblxuICAgIEdhbWUuc3RhcnQoKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBnZXRUb3VjaERhdGE6IChldmVudCkgLT5cblxuICAgIGlmIHRvdWNoRGF0YVxuICAgICAgdGFwQ29vcmRpbmF0ZXMgPSBldmVudC50b3VjaGVzWzBdXG4gICAgZWxzZVxuICAgICAgdG91Y2hEYXRhID1cbiAgICAgICAgcGFnZVg6IGV2ZW50LmNsaWVudFgsXG4gICAgICAgIHBhZ2VZOiBldmVudC5jbGllbnRZXG5cbiAgICByZXR1cm4gdG91Y2hEYXRhXG5cbiAgcmVnaXN0ZXJIYW5kbGVyOiAoc2VsZWN0b3IsIHNjZW5lLCBjYWxsYmFjaykgLT5cblxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpLmFkZEV2ZW50TGlzdGVuZXIgaW5wdXRWZXJiLCAoZXZlbnQpID0+XG5cbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcblxuICAgICAgY2FsbGJhY2suYXBwbHkoKSBpZiBTY2VuZXMuY3VycmVudCA9PSBzY2VuZVxuXG4gICAgICByZXR1cm5cblxuICAgIHJldHVybiB0aGlzXG5cbiAgcmVtb3ZlR2FtZVN0YXJ0VGFwRXZlbnRIYW5kbGVyOiAtPlxuXG4gICAgZG9jdW1lbnQuYm9keS5yZW1vdmVFdmVudExpc3RlbmVyKGlucHV0VmVyYiwgQGdhbWVTdGFydFRhcEV2ZW50SGFuZGxlcilcblxuICAgIHJldHVybiB0aGlzXG4iLCJcbmNsYXNzIFBhcnRpY2xlQ2xhc3NcblxuICBkZXN0cm95aW5nOiBmYWxzZVxuICBzaXplOiAgICAgICAxXG5cbiAgY29uc3RydWN0b3I6IC0+XG5cbiAgICByID0gVXRpbHMucmFuZG9tSW50ZWdlcigwLCAyMDApXG4gICAgZyA9IFV0aWxzLnJhbmRvbUludGVnZXIoMCwgMjAwKVxuICAgIGIgPSBVdGlscy5yYW5kb21JbnRlZ2VyKDAsIDIwMClcbiAgICBhID0gVXRpbHMucmFuZG9tKDAuNzUsIDEpXG5cbiAgICBAY29sb3IgICAgICA9IFwicmdiYSgje3J9LCAje2d9LCAje2J9LCAje2F9KVwiXG4gICAgQGZpbmFsU2l6ZSAgPSBVdGlscy5yYW5kb21JbnRlZ2VyKDAsIFBsYXlTdGF0ZS5zaXplTWF4KVxuICAgIEBpZCAgICAgICAgID0gTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyKDIsIDUpXG4gICAgQGlzVGFyZ2V0ICAgPSBAZGV0ZXJtaW5lVGFyZ2V0UGFydGljbGUoKVxuICAgIEBwb3NpdGlvbiAgID1cbiAgICAgIHg6IFBhcnRpY2xlR2VuZXJhdG9yLnBhcnRpY2xlc09yaWdpbi54XG4gICAgICB5OiBQYXJ0aWNsZUdlbmVyYXRvci5wYXJ0aWNsZXNPcmlnaW4ueVxuICAgIEB2ZWxvY2l0eSAgID1cbiAgICAgIHg6IFV0aWxzLnJhbmRvbShQbGF5U3RhdGUudmVsb2NpdHlNaW4sIFBsYXlTdGF0ZS52ZWxvY2l0eU1heClcbiAgICAgIHk6IFV0aWxzLnJhbmRvbShQbGF5U3RhdGUudmVsb2NpdHlNaW4sIFBsYXlTdGF0ZS52ZWxvY2l0eU1heClcblxuICAgIGlmIEBpc1RhcmdldFxuICAgICAgQGNvbG9yICAgICA9IFwicmdiYSgje3J9LCAje2d9LCAje2J9LCAwLjgpXCJcbiAgICAgIEBmaW5hbFNpemUgPSBVdGlscy5yYW5kb21JbnRlZ2VyKFBsYXlTdGF0ZS5taW5UYXJnZXRTaXplLCBQbGF5U3RhdGUuc2l6ZU1heClcblxuICAgICAgQHZlbG9jaXR5LnggKj0gUGxheVN0YXRlLnRhcmdldFZlbG9jaXR5TXVsdGlwbGllclxuICAgICAgQHZlbG9jaXR5LnkgKj0gUGxheVN0YXRlLnRhcmdldFZlbG9jaXR5TXVsdGlwbGllclxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBkZXRlcm1pbmVUYXJnZXRQYXJ0aWNsZTogLT5cblxuICAgIGlzVGFyZ2V0ID0gZmFsc2VcblxuICAgIGlmIFBhcnRpY2xlR2VuZXJhdG9yLnBhcnRpY2xlc1RvVGVzdEZvclRhcHMubGVuZ3RoIDwgUGxheVN0YXRlLm1heFRhcmdldHNBdE9uY2VcbiAgICAgIGlzVGFyZ2V0ID0gVXRpbHMucmFuZG9tUGVyY2VudGFnZSgpIDwgUGxheVN0YXRlLmNoYW5jZVBhcnRpY2xlSXNUYXJnZXRcblxuICAgIHJldHVybiBpc1RhcmdldFxuXG4gIGRyYXc6IC0+XG5cbiAgICBpZiBAb3V0c2lkZUNhbnZhc0JvdW5kcygpXG4gICAgICBQYXJ0aWNsZUdlbmVyYXRvci5wYXJ0aWNsZXNUb0RlbGV0ZS5wdXNoKEBpZClcblxuICAgICAgcmV0dXJuXG5cbiAgICBpZiBAaXNUYXJnZXRcbiAgICAgIEBsaW5lV2lkdGggPSBAc2l6ZSAvIDEwXG5cbiAgICAgIGlmIEBsaW5lV2lkdGggPiBDb25maWcubWF4TGluZVdpZHRoXG4gICAgICAgIEBsaW5lV2lkdGggPSBDb25maWcubWF4TGluZVdpZHRoXG5cbiAgICAgIGNvbnRleHQuZmlsbFN0eWxlID0gJ3JnYmEoMjQ3LCAyNDcsIDI0NywgMC45KSdcbiAgICAgIGNvbnRleHQubGluZVdpZHRoID0gQGxpbmVXaWR0aFxuXG4gICAgY29udGV4dC5iZWdpblBhdGgoKVxuICAgIGNvbnRleHQuYXJjKEBwb3NpdGlvbi54LCBAcG9zaXRpb24ueSwgQGhhbGYsIDAsIE1hdGguUEkgKiAyLCB0cnVlKVxuICAgIGNvbnRleHQuZmlsbCgpXG4gICAgY29udGV4dC5zdHJva2UoKSBpZiBAaXNUYXJnZXRcbiAgICBjb250ZXh0LmNsb3NlUGF0aCgpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIG91dHNpZGVDYW52YXNCb3VuZHM6IC0+XG5cbiAgICBiZXlvbmRCb3VuZHNYID0gQHBvc2l0aW9uLnggPCAtKEBmaW5hbFNpemUpIG9yIEBwb3NpdGlvbi54ID4gY2FudmFzLndpZHRoICArIEBmaW5hbFNpemVcbiAgICBiZXlvbmRCb3VuZHNZID0gQHBvc2l0aW9uLnkgPCAtKEBmaW5hbFNpemUpIG9yIEBwb3NpdGlvbi55ID4gY2FudmFzLmhlaWdodCArIEBmaW5hbFNpemVcblxuICAgIHJldHVybiBiZXlvbmRCb3VuZHNYIG9yIGJleW9uZEJvdW5kc1lcblxuICB1cGRhdGVWYWx1ZXM6IC0+XG5cbiAgICBpZiBAZGVzdHJveWluZ1xuICAgICAgc2hyaW5rTXVsdGlwbGllciA9IGlmIFBsYXlTdGF0ZS5wbGF5aW5nIHRoZW4gMC43IGVsc2UgMC45XG5cbiAgICAgIEBzaXplICo9IHNocmlua011bHRpcGxpZXJcbiAgICBlbHNlXG4gICAgICBpZiBAc2l6ZSA8IEBmaW5hbFNpemVcbiAgICAgICAgQHNpemUgKj0gUGxheVN0YXRlLnBhcnRpY2xlR3Jvd3RoTXVsdGlwbGllclxuXG4gICAgICBpZiBAc2l6ZSA+IEBmaW5hbFNpemVcbiAgICAgICAgQHNpemUgPSBAZmluYWxTaXplXG5cbiAgICBAaGFsZiA9IEBzaXplIC8gMlxuXG4gICAgQHBvc2l0aW9uLnggKz0gQHZlbG9jaXR5LnhcbiAgICBAcG9zaXRpb24ueSArPSBAdmVsb2NpdHkueVxuXG4gICAgQGRyYXcoKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICB3YXNUYXBwZWQ6ICh0b3VjaERhdGEpIC0+XG5cbiAgICB0YXBYICAgICAgPSB0b3VjaERhdGEucGFnZVggKiBkZXZpY2VQaXhlbFJhdGlvXG4gICAgdGFwWSAgICAgID0gdG91Y2hEYXRhLnBhZ2VZICogZGV2aWNlUGl4ZWxSYXRpb1xuICAgIGRpc3RhbmNlWCA9IHRhcFggLSBAcG9zaXRpb24ueFxuICAgIGRpc3RhbmNlWSA9IHRhcFkgLSBAcG9zaXRpb24ueVxuICAgIHJhZGl1cyAgICA9IEBoYWxmXG5cbiAgICByZXR1cm4gKGRpc3RhbmNlWCAqIGRpc3RhbmNlWCkgKyAoZGlzdGFuY2VZICogZGlzdGFuY2VZKSA8IChAaGFsZiAqIEBoYWxmKVxuIiwiXG5jbGFzcyBQYXJ0aWNsZUdlbmVyYXRvckNsYXNzXG5cbiAgY29uc3RydWN0b3I6IC0+XG5cbiAgICBAcGFydGljbGVzQXJyYXkgICAgICAgICA9IFtdXG4gICAgQHBhcnRpY2xlc0FycmF5SWRzICAgICAgPSBbXVxuICAgIEBwYXJ0aWNsZXNUb0RlbGV0ZSAgICAgID0gW11cbiAgICBAcGFydGljbGVzVG9UZXN0Rm9yVGFwcyA9IFtdXG5cbiAgICBAcGFydGljbGVzT3JpZ2luID1cbiAgICAgIHg6IGNhbnZhcy53aWR0aCAgLyAyXG4gICAgICB5OiBjYW52YXMuaGVpZ2h0IC8gMlxuXG4gICAgQHJlZ2lzdGVyUGFydGljbGVUYXBEZXRlY3Rpb25IYW5kbGVyKClcblxuICAgIHJldHVybiB0aGlzXG5cbiAgYW5pbWF0aW9uTG9vcEFjdGlvbnM6IC0+XG5cbiAgICBpZiBQbGF5U3RhdGUucGxheWluZ1xuICAgICAgQGdlbmVyYXRlUGFydGljbGUoKVxuXG4gICAgQHVwZGF0ZVBhcnRpY2xlc1ZhbHVlcygpXG4gICAgQHJlbW92ZVBhcnRpY2xlc0FmdGVyVGFwKClcblxuICAgIGlmIEBwYXJ0aWNsZXNUb0RlbGV0ZS5sZW5ndGggPiAwXG4gICAgICBAZGVzdHJveVBhcnRpY2xlc091dHNpZGVDYW52YXNCb3VuZHMoKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBkZXN0cm95UGFydGljbGVzT3V0c2lkZUNhbnZhc0JvdW5kczogLT5cblxuICAgIGZvciBwYXJ0aWNsZUlkIGluIEBwYXJ0aWNsZXNUb0RlbGV0ZVxuICAgICAgcGFydGljbGVJbmRleCA9IEBwYXJ0aWNsZXNBcnJheUlkcy5pbmRleE9mKHBhcnRpY2xlSWQpXG4gICAgICBwYXJ0aWNsZSAgICAgID0gQHBhcnRpY2xlc0FycmF5W3BhcnRpY2xlSW5kZXhdXG5cbiAgICAgIGlmIHBhcnRpY2xlP1xuICAgICAgICBAZ2FtZU92ZXIoKSBpZiBwYXJ0aWNsZS5pc1RhcmdldFxuICAgICAgICBAcmVtb3ZlUGFydGljbGUocGFydGljbGUpXG5cbiAgICBAcGFydGljbGVzVG9EZWxldGUgPSBbXVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBnYW1lT3ZlcjogLT5cblxuICAgIEBzdG9wKClcblxuICAgIGZvciBwYXJ0aWNsZSBpbiBAcGFydGljbGVzQXJyYXlcbiAgICAgIHBhcnRpY2xlLmRlc3Ryb3lpbmcgPSB0cnVlXG5cbiAgICBQbGF5U3RhdGUucGFydGljbGVTcGF3bkNoYW5jZSA9IDBcblxuICAgIEdhbWUub3ZlcigpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIGdlbmVyYXRlUGFydGljbGU6IC0+XG5cbiAgICBpZiBVdGlscy5yYW5kb21QZXJjZW50YWdlKCkgPCBQbGF5U3RhdGUucGFydGljbGVTcGF3bkNoYW5jZVxuICAgICAgcGFydGljbGUgPSBuZXcgUGFydGljbGVDbGFzcygpXG5cbiAgICAgIEBwYXJ0aWNsZXNBcnJheS5wdXNoKHBhcnRpY2xlKVxuICAgICAgQHBhcnRpY2xlc0FycmF5SWRzLnB1c2gocGFydGljbGUuaWQpXG5cbiAgICAgIGlmIHBhcnRpY2xlLmlzVGFyZ2V0XG4gICAgICAgIEBwYXJ0aWNsZXNUb1Rlc3RGb3JUYXBzLnVuc2hpZnQocGFydGljbGUuaWQpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHBhcnRpY2xlVGFwRGV0ZWN0aW9uSGFuZGxlcjogKCkgLT5cblxuICAgIHRhcmdldEhpdCA9IGZhbHNlXG5cbiAgICBmb3IgcGFydGljbGVJZCBpbiBAcGFydGljbGVzVG9UZXN0Rm9yVGFwc1xuICAgICAgcGFydGljbGVJbmRleCA9IEBwYXJ0aWNsZXNBcnJheUlkcy5pbmRleE9mKHBhcnRpY2xlSWQpXG4gICAgICBwYXJ0aWNsZSAgICAgID0gQHBhcnRpY2xlc0FycmF5W3BhcnRpY2xlSW5kZXhdXG4gICAgICB0b3VjaERhdGEgICAgID0gSW5wdXQuZ2V0VG91Y2hEYXRhKGV2ZW50KVxuXG4gICAgICBpZiBwYXJ0aWNsZT8gYW5kIHBhcnRpY2xlLndhc1RhcHBlZCh0b3VjaERhdGEpXG4gICAgICAgIGRlbGV0aW9uSW5kZXggICAgICAgPSBAcGFydGljbGVzVG9UZXN0Rm9yVGFwcy5pbmRleE9mKHBhcnRpY2xlSWQpXG4gICAgICAgIHBhcnRpY2xlLmRlc3Ryb3lpbmcgPSB0cnVlXG4gICAgICAgIHRhcmdldEhpdCAgICAgICAgICAgPSB0cnVlXG5cbiAgICAgICAgQHBhcnRpY2xlc1RvVGVzdEZvclRhcHMuc3BsaWNlKGRlbGV0aW9uSW5kZXgsIDEpXG5cbiAgICAgICAgYnJlYWtcblxuICAgIFBsYXlTdGF0ZS51cGRhdGVDb21ib011bHRpcGxpZXIodGFyZ2V0SGl0KVxuXG4gICAgaWYgdGFyZ2V0SGl0XG4gICAgICBQbGF5U3RhdGUudXBkYXRlU2NvcmUocGFydGljbGUuc2l6ZSwgcGFydGljbGUuZmluYWxTaXplKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICByZWdpc3RlclBhcnRpY2xlVGFwRGV0ZWN0aW9uSGFuZGxlcjogLT5cblxuICAgIElucHV0LnJlZ2lzdGVySGFuZGxlciAnLnVpLXBsYXlpbmcnLCAncGxheWluZycsIC0+XG4gICAgICBQYXJ0aWNsZUdlbmVyYXRvci5wYXJ0aWNsZVRhcERldGVjdGlvbkhhbmRsZXIoKVxuICAgICAgcmV0dXJuXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHJlbW92ZVBhcnRpY2xlOiAocGFydGljbGUpIC0+XG5cbiAgICBpZCAgICA9IHBhcnRpY2xlLmlkXG4gICAgaW5kZXggPSBAcGFydGljbGVzQXJyYXlJZHMuaW5kZXhPZihpZClcblxuICAgIEBwYXJ0aWNsZXNBcnJheS5zcGxpY2UoaW5kZXgsIDEpXG4gICAgQHBhcnRpY2xlc0FycmF5SWRzLnNwbGljZShpbmRleCwgMSlcblxuICAgIHJldHVybiB0aGlzXG5cbiAgcmVtb3ZlUGFydGljbGVzQWZ0ZXJUYXA6IC0+XG5cbiAgICBmb3IgcGFydGljbGUgaW4gQHBhcnRpY2xlc0FycmF5XG4gICAgICBpZiBwYXJ0aWNsZT8gYW5kIHBhcnRpY2xlLnNpemUgPCAxXG4gICAgICAgIEByZW1vdmVQYXJ0aWNsZShwYXJ0aWNsZSlcblxuICAgIHJldHVybiB0aGlzXG5cbiAgcmVzZXQ6IC0+XG5cbiAgICBAcGFydGljbGVzQXJyYXkgICAgICAgICA9IFtdXG4gICAgQHBhcnRpY2xlc0FycmF5SWRzICAgICAgPSBbXVxuICAgIEBwYXJ0aWNsZXNUb0RlbGV0ZSAgICAgID0gW11cbiAgICBAcGFydGljbGVzVG9UZXN0Rm9yVGFwcyA9IFtdXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHN0b3A6IC0+XG5cbiAgICBQbGF5U3RhdGUudXBkYXRlKGZhbHNlKVxuICAgIFBsYXlTdGF0ZS5zdG9wTGV2ZWxVcEluY3JlbWVudCgpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHVwZGF0ZVBhcnRpY2xlc1ZhbHVlczogLT5cblxuICAgIGZvciBwYXJ0aWNsZSBpbiBAcGFydGljbGVzQXJyYXlcbiAgICAgIGlmIHBhcnRpY2xlP1xuICAgICAgICBjb250ZXh0LmZpbGxTdHlsZSAgID0gcGFydGljbGUuY29sb3JcbiAgICAgICAgY29udGV4dC5zdHJva2VTdHlsZSA9IHBhcnRpY2xlLmNvbG9yXG5cbiAgICAgICAgcGFydGljbGUudXBkYXRlVmFsdWVzKClcblxuICAgIHJldHVybiB0aGlzXG4iLCJcbmNsYXNzIFBsYXlTdGF0ZUNsYXNzXG5cbiAgZGVmYXVsdHM6XG4gICAgY29tYm9NdWx0aXBsaWVyOiAwXG4gICAgbGV2ZWw6ICAgICAgICAgICAxXG4gICAgc2NvcmU6ICAgICAgICAgICAwXG5cbiAgcmVzZXQ6IC0+XG5cbiAgICBAY2hhbmNlUGFydGljbGVJc1RhcmdldCAgID0gQ29uZmlnLmNoYW5jZVBhcnRpY2xlSXNUYXJnZXQuZWFzeVxuICAgIEBjb21ib011bHRpcGxpZXIgICAgICAgICAgPSBAZGVmYXVsdHMuY29tYm9NdWx0aXBsaWVyXG4gICAgQGxldmVsICAgICAgICAgICAgICAgICAgICA9IEBkZWZhdWx0cy5sZXZlbFxuICAgIEBtYXhUYXJnZXRzQXRPbmNlICAgICAgICAgPSBDb25maWcubWF4VGFyZ2V0c0F0T25jZS5lYXN5XG4gICAgQG1pblRhcmdldFNpemUgICAgICAgICAgICA9IENvbmZpZy5taW5UYXJnZXRTaXplLmVhc3lcbiAgICBAcGFydGljbGVHcm93dGhNdWx0aXBsaWVyID0gQ29uZmlnLnBhcnRpY2xlR3Jvd3RoTXVsdGlwbGllci5lYXN5XG4gICAgQHBhcnRpY2xlU3Bhd25DaGFuY2UgICAgICA9IENvbmZpZy5wYXJ0aWNsZVNwYXduQ2hhbmNlLmVhc3lcbiAgICBAc2NvcmUgICAgICAgICAgICAgICAgICAgID0gQGRlZmF1bHRzLnNjb3JlXG4gICAgQHNpemVNYXggICAgICAgICAgICAgICAgICA9IENvbmZpZy5zaXplTWF4LmVhc3lcbiAgICBAdGFyZ2V0VmVsb2NpdHlNdWx0aXBsaWVyID0gQ29uZmlnLnRhcmdldFZlbG9jaXR5TXVsdGlwbGllci5lYXN5XG4gICAgQHZlbG9jaXR5TWluICAgICAgICAgICAgICA9IENvbmZpZy52ZWxvY2l0eU1pbi5lYXN5XG4gICAgQHZlbG9jaXR5TWF4ICAgICAgICAgICAgICA9IENvbmZpZy52ZWxvY2l0eU1heC5lYXN5XG5cbiAgICBAdXBkYXRlKHRydWUpXG5cbiAgICBDb25maWcudXBkYXRlVmFsdWVzRm9yRGlmZmljdWx0eSgpXG5cbiAgICBAc2V0dXBMZXZlbFVwSW5jcmVtZW50KClcblxuICAgIHJldHVybiB0aGlzXG5cbiAgc3RvcExldmVsVXBJbmNyZW1lbnQ6IC0+XG5cbiAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbChAbGV2ZWxVcENvdW50ZXIpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHNldHVwTGV2ZWxVcEluY3JlbWVudDogLT5cblxuICAgIEBsZXZlbFVwQ291bnRlciA9IHdpbmRvdy5zZXRJbnRlcnZhbCA9PlxuXG4gICAgICBAdXBkYXRlTGV2ZWwoKVxuXG4gICAgICByZXR1cm5cblxuICAgICwgQ29uZmlnLmxldmVsVXBJbnRlcnZhbCAqIDEwMDBcblxuICAgIHJldHVybiB0aGlzXG5cbiAgdXBkYXRlQ29tYm9NdWx0aXBsaWVyOiAodGFyZ2V0SGl0KSAtPlxuXG4gICAgQGNvbWJvTXVsdGlwbGllciA9IGlmIHRhcmdldEhpdCB0aGVuIEBjb21ib011bHRpcGxpZXIgKyAxIGVsc2UgQGRlZmF1bHRzLmNvbWJvTXVsdGlwbGllclxuXG4gICAgVUkudXBkYXRlQ29tYm9NdWx0aXBsaWVyQ291bnRlcigpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHVwZGF0ZTogKG5ld1N0YXRlKSAtPlxuXG4gICAgQHBsYXlpbmcgPSBuZXdTdGF0ZVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICB1cGRhdGVMZXZlbDogLT5cblxuICAgIEBsZXZlbCArPSAxXG5cbiAgICBpZiBAbGV2ZWwgPj0gQ29uZmlnLm1heExldmVsXG4gICAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbChAbGV2ZWxVcENvdW50ZXIpXG5cbiAgICBVSS51cGRhdGVMZXZlbENvdW50ZXIoKVxuICAgIENvbmZpZy51cGRhdGVWYWx1ZXNGb3JEaWZmaWN1bHR5KClcblxuICAgIHJldHVybiB0aGlzXG5cbiAgdXBkYXRlU2NvcmU6IChzaXplV2hlblRhcHBlZCwgc2l6ZVdoZW5GdWxseUdyb3duKSAtPlxuXG4gICAgIygoZGVmYXVsdFNjb3JlUGVyUG9wICsgKDEwMCAtICgoc2l6ZVdoZW5UYXBwZWQgLyBzaXplV2hlbkZ1bGx5R3Jvd24pICogMTAwKSkpICogY29tYm9NdWx0aXBsaWVyKSAqIChsZXZlbE51bWJlciArIDEpXG5cbiAgICB0YXJnZXRTaXplQm9udXMgPSBNYXRoLnJvdW5kKDEwMCAtICgoc2l6ZVdoZW5UYXBwZWQgLyBzaXplV2hlbkZ1bGx5R3Jvd24pICogMTAwKSlcbiAgICBwb3BQb2ludFZhbHVlICAgPSBDb25maWcucG9pbnRzUGVyUG9wICsgdGFyZ2V0U2l6ZUJvbnVzXG4gICAgbGV2ZWxNdWx0aXBsaWVyID0gQGxldmVsICsgMVxuXG4gICAgQHNjb3JlICs9IChwb3BQb2ludFZhbHVlICogQGNvbWJvTXVsdGlwbGllcikgKiAobGV2ZWxNdWx0aXBsaWVyKVxuXG4gICAgVUkudXBkYXRlU2NvcmVDb3VudGVyKClcblxuICAgIHJldHVybiB0aGlzXG4iLCJcbmNsYXNzIFNjZW5lc0NsYXNzXG5cbiAgQGN1cnJlbnQgPSBudWxsXG5cbiAgY3JlZGl0czogLT5cblxuICAgIEBjdXJyZW50ID0gJ2NyZWRpdHMnXG5cbiAgICBVSS51cGRhdGVCb2R5Q2xhc3MoJ2NyZWRpdHMnKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBnYW1lT3ZlcjogLT5cblxuICAgIEBjdXJyZW50ID0gJ2dhbWUtb3ZlcidcblxuICAgIFVJLnVwZGF0ZUJvZHlDbGFzcygnZ2FtZS1vdmVyJylcblxuICAgIElucHV0LmFkZEdhbWVTdGFydFRhcEV2ZW50SGFuZGxlcigpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIGxlYWRlcmJvYXJkOiAtPlxuXG4gICAgQGN1cnJlbnQgPSAnbGVhZGVyYm9hcmQnXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHBsYXlpbmc6IC0+XG5cbiAgICBAY3VycmVudCA9ICdwbGF5aW5nJ1xuXG4gICAgVUkudXBkYXRlQm9keUNsYXNzKCdwbGF5aW5nJylcblxuICAgIHJldHVybiB0aGlzXG5cbiAgaWRlbnQ6IC0+XG5cbiAgICBAY3VycmVudCA9ICdpZGVudCdcblxuICAgIFVJLnVwZGF0ZUJvZHlDbGFzcygnaWRlbnQnKVxuXG4gICAgd2luZG93LnNldFRpbWVvdXQgPT5cbiAgICAgIEB0aXRsZSgpXG4gICAgLCA1MDBcblxuICAgIHJldHVybiB0aGlzXG5cbiAgdGl0bGU6IC0+XG5cbiAgICBAY3VycmVudCA9ICd0aXRsZSdcblxuICAgIFVJLnVwZGF0ZUJvZHlDbGFzcygndGl0bGUnKVxuXG4gICAgSW5wdXQuYWRkR2FtZVN0YXJ0VGFwRXZlbnRIYW5kbGVyKCk7XG5cbiAgICByZXR1cm4gdGhpc1xuIiwiXG5jbGFzcyBVSUNsYXNzXG5cbiAgcmVzZXQ6IC0+XG5cbiAgICBAbGV2ZWxDb3VudGVyICAgICAgICAgICA9IFV0aWxzLiQoJy5odWQtdmFsdWUtbGV2ZWwnKVxuICAgIEBzY29yZUNvdW50ZXIgICAgICAgICAgID0gVXRpbHMuJCgnLmh1ZC12YWx1ZS1zY29yZScpXG4gICAgQGNvbWJvTXVsdGlwbGllckNvdW50ZXIgPSBVdGlscy4kKCcuaHVkLXZhbHVlLWNvbWJvJylcbiAgICBAcGxheUFnYWluICAgICAgICAgICAgICA9IFV0aWxzLiQoJy5wbGF5LWFnYWluJylcblxuICAgIEB1cGRhdGVDb21ib011bHRpcGxpZXJDb3VudGVyKClcbiAgICBAdXBkYXRlTGV2ZWxDb3VudGVyKClcbiAgICBAdXBkYXRlU2NvcmVDb3VudGVyKClcblxuICAgIHJldHVybiB0aGlzXG5cbiAgdXBkYXRlQm9keUNsYXNzOiAoY2xhc3NOYW1lKSAtPlxuXG4gICAgYm9keS5jbGFzc05hbWUgPSAnJ1xuICAgIGJvZHkuY2xhc3NMaXN0LmFkZCgnc2NlbmUtJyArIGNsYXNzTmFtZSlcblxuICAgIHJldHVybiB0aGlzXG5cbiAgdXBkYXRlQ29tYm9NdWx0aXBsaWVyQ291bnRlcjogLT5cblxuICAgIFV0aWxzLnVwZGF0ZVVJVGV4dE5vZGUoQGNvbWJvTXVsdGlwbGllckNvdW50ZXIsIFBsYXlTdGF0ZS5jb21ib011bHRpcGxpZXIpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHVwZGF0ZUxldmVsQ291bnRlcjogLT5cblxuICAgIFV0aWxzLnVwZGF0ZVVJVGV4dE5vZGUoQGxldmVsQ291bnRlciwgUGxheVN0YXRlLmxldmVsKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICB1cGRhdGVTY29yZUNvdW50ZXI6IC0+XG5cbiAgICBzY29yZVRvRm9ybWF0ID0gVXRpbHMuZm9ybWF0V2l0aENvbW1hKFBsYXlTdGF0ZS5zY29yZSlcblxuICAgIFV0aWxzLnVwZGF0ZVVJVGV4dE5vZGUoQHNjb3JlQ291bnRlciwgc2NvcmVUb0Zvcm1hdClcblxuICAgIHJldHVybiB0aGlzXG4iLCJcbmNsYXNzIFV0aWxzQ2xhc3NcblxuICAkOiAoc2VsZWN0b3IpIC0+XG4gICAgaWYgc2VsZWN0b3Iuc3Vic3RyKDAsIDEpID09ICcjJ1xuICAgICAgcmV0dXJuIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHNlbGVjdG9yKVxuXG4gICAgZWxzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcilcblxuICAgIGlmIGVscy5sZW5ndGggPT0gMVxuICAgICAgcmV0dXJuIGVsc1swXVxuXG4gICAgcmV0dXJuIGVsc1xuXG4gIGNvcnJlY3RWYWx1ZUZvckRQUjogKHZhbHVlLCBpbnRlZ2VyID0gZmFsc2UpIC0+XG5cbiAgICB2YWx1ZSAqPSBkZXZpY2VQaXhlbFJhdGlvXG5cbiAgICBpZiBpbnRlZ2VyXG4gICAgICB2YWx1ZSA9IE1hdGgucm91bmQodmFsdWUpXG5cbiAgICByZXR1cm4gdmFsdWVcblxuICBmb3JtYXRXaXRoQ29tbWE6IChudW0pIC0+XG5cbiAgICByZXR1cm4gbnVtLnRvU3RyaW5nKCkucmVwbGFjZSgvXFxCKD89KFxcZHszfSkrKD8hXFxkKSkvZywgXCIsXCIpXG5cbiAgcmFuZG9tOiAobWluLCBtYXgpIC0+XG5cbiAgICBpZiBtaW4gPT0gdW5kZWZpbmVkXG4gICAgICBtaW4gPSAwXG4gICAgICBtYXggPSAxXG4gICAgZWxzZSBpZiBtYXggPT0gdW5kZWZpbmVkXG4gICAgICBtYXggPSBtaW5cbiAgICAgIG1pbiA9IDBcblxuICAgIHJldHVybiAoTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4pKSArIG1pbjtcblxuICByYW5kb21Db2xvcjogKGFscGhhID0gZmFsc2UpIC0+XG5cbiAgICBjb2xvcnMgPVxuICAgICAgcjogdGhpcy5yYW5kb21JbnRlZ2VyKDAsIDIwMClcbiAgICAgIGc6IHRoaXMucmFuZG9tSW50ZWdlcigwLCAyMDApXG4gICAgICBiOiB0aGlzLnJhbmRvbUludGVnZXIoMCwgMjAwKVxuICAgICAgYTogaWYgIWFscGhhIHRoZW4gdGhpcy5yYW5kb20oMC43NSwgMSkgZWxzZSBhbHBoYVxuXG4gICAgcmV0dXJuICdyZ2JhKCcgKyBjb2xvcnMuciArICcsICcgKyBjb2xvcnMuZyArICcsICcgKyBjb2xvcnMuYiArICcsICcgKyBjb2xvcnMuYSArICcpJ1xuXG4gIHJhbmRvbUludGVnZXI6IChtaW4sIG1heCkgLT5cblxuICAgIGlmIG1heCA9PSB1bmRlZmluZWRcbiAgICAgIG1heCA9IG1pblxuICAgICAgbWluID0gMFxuXG4gICAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChtYXggKyAxIC0gbWluKSkgKyBtaW5cblxuICByYW5kb21QZXJjZW50YWdlOiAtPlxuXG4gICAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDEwMClcblxuICB1cGRhdGVVSVRleHROb2RlOiAoZWxlbWVudCwgdmFsdWUpIC0+XG5cbiAgICBlbGVtZW50LmlubmVySFRNTCA9IHZhbHVlXG5cbiAgICByZXR1cm4gdGhpc1xuIiwiXG5kZWJ1ZyA9IHRydWVcblxuYW5kcm9pZCAgICAgICAgPSBpZiBuYXZpZ2F0b3IudXNlckFnZW50Lm1hdGNoKC9hbmRyb2lkL2kpIHRoZW4gdHJ1ZSBlbHNlIGZhbHNlXG5ib2R5ICAgICAgICAgICA9IGRvY3VtZW50LmJvZHlcbmNhbnZhcyAgICAgICAgID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmNhbnZhcycpXG5oYXNUb3VjaEV2ZW50cyA9IHdpbmRvdy5oYXNPd25Qcm9wZXJ0eSgnb250b3VjaHN0YXJ0JykgfHwgd2luZG93Lmhhc093blByb3BlcnR5KCdvbm1zZ2VzdHVyZWNoYW5nZScpXG5pbnB1dFZlcmIgICAgICA9IGlmIGhhc1RvdWNoRXZlbnRzIHRoZW4gJ3RvdWNoc3RhcnQnIGVsc2UgJ2NsaWNrJ1xuXG5jYW52YXMuY2xhc3NOYW1lID0gJ2NhbnZhcydcbmNhbnZhcy53aWR0aCAgICAgPSBib2R5LmNsaWVudFdpZHRoXG5jYW52YXMuaGVpZ2h0ICAgID0gYm9keS5jbGllbnRIZWlnaHRcblxuY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpXG5cbmNvbnRleHQuZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gJ3NvdXJjZS1hdG9wJ1xuXG5kZXZpY2VQaXhlbFJhdGlvICA9IHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvIHx8IDFcbmJhY2tpbmdTdG9yZVJhdGlvID0gY29udGV4dC53ZWJraXRCYWNraW5nU3RvcmVQaXhlbFJhdGlvIHx8IGNvbnRleHQuYmFja2luZ1N0b3JlUGl4ZWxSYXRpbyB8fCAxXG5yYXRpbyAgICAgICAgICAgICA9IGRldmljZVBpeGVsUmF0aW8gLyBiYWNraW5nU3RvcmVSYXRpb1xuXG5pZiBkZXZpY2VQaXhlbFJhdGlvICE9IGJhY2tpbmdTdG9yZVJhdGlvXG4gIG9sZFdpZHRoICA9IGNhbnZhcy53aWR0aFxuICBvbGRIZWlnaHQgPSBjYW52YXMuaGVpZ2h0XG5cbiAgY2FudmFzLndpZHRoICA9IG9sZFdpZHRoICAqIHJhdGlvXG4gIGNhbnZhcy5oZWlnaHQgPSBvbGRIZWlnaHQgKiByYXRpb1xuXG4gIGNhbnZhcy5zdHlsZS53aWR0aCAgPSBcIiN7b2xkV2lkdGh9cHhcIlxuICBjYW52YXMuc3R5bGUuaGVpZ2h0ID0gXCIje29sZEhlaWdodH1weFwiXG5cbiAgY29udGV4dC5zY2FsZShyYXRpbywgcmF0aW8pXG5cbiMgU2V0IGVudmlyb25tZW50IGFuZCBiYXNlIGNvbmZpZyBldGNcbkRldmljZSAgICAgICAgICAgID0gbmV3IERldmljZUNsYXNzKClcblV0aWxzICAgICAgICAgICAgID0gbmV3IFV0aWxzQ2xhc3MoKVxuQ29uZmlnICAgICAgICAgICAgPSBuZXcgQ29uZmlnQ2xhc3MoKVxuSW5wdXQgICAgICAgICAgICAgPSBuZXcgSW5wdXRDbGFzcygpXG5cbiMgTG9hZCB0aGUgZ2FtZSBsb2dpYyBhbmQgYWxsIHRoYXRcblBhcnRpY2xlR2VuZXJhdG9yID0gbmV3IFBhcnRpY2xlR2VuZXJhdG9yQ2xhc3MoKVxuUGxheVN0YXRlICAgICAgICAgPSBuZXcgUGxheVN0YXRlQ2xhc3MoKVxuVUkgICAgICAgICAgICAgICAgPSBuZXcgVUlDbGFzcygpXG5TY2VuZXMgICAgICAgICAgICA9IG5ldyBTY2VuZXNDbGFzcygpXG5cbiMgU2V0IG9mZiB0aGUgY2FudmFzIGFuaW1hdGlvbiBsb29wXG5BbmltYXRpb25Mb29wICAgICA9IG5ldyBBbmltYXRpb25Mb29wQ2xhc3MoKVxuXG4jIFN0YXJ0IHRoZSBhY3R1YWwgZ2FtZVxuR2FtZSAgICAgICAgICAgICAgPSBuZXcgR2FtZUNsYXNzKClcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==