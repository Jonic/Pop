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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkFuaW1hdGlvbkxvb3AuY29mZmVlIiwiQ29uZmlnLmNvZmZlZSIsIkRldmljZS5jb2ZmZWUiLCJHYW1lLmNvZmZlZSIsIklucHV0LmNvZmZlZSIsIlBhcnRpY2xlLmNvZmZlZSIsIlBhcnRpY2xlR2VuZXJhdG9yLmNvZmZlZSIsIlBsYXlTdGF0ZS5jb2ZmZWUiLCJTY2VuZXMuY29mZmVlIiwiVUkuY29mZmVlIiwiVXRpbHMuY29mZmVlIiwiX2Jvb3RzdHJhcC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsSUFBQSxrQkFBQTs7QUFBQTtBQUVlLEVBQUEsNEJBQUEsR0FBQTtBQUVYLElBQUEsSUFBQyxDQUFBLHFCQUFELENBQUEsQ0FBQSxDQUFBO0FBRUEsV0FBTyxJQUFQLENBSlc7RUFBQSxDQUFiOztBQUFBLCtCQU1BLG9CQUFBLEdBQXNCLFNBQUEsR0FBQTtBQUVwQixJQUFBLE1BQU0sQ0FBQyxvQkFBUCxDQUE0QixJQUFDLENBQUEsZUFBN0IsQ0FBQSxDQUFBO0FBRUEsV0FBTyxJQUFQLENBSm9CO0VBQUEsQ0FOdEIsQ0FBQTs7QUFBQSwrQkFZQSxxQkFBQSxHQUF1QixTQUFBLEdBQUE7QUFFckIsSUFBQSxJQUFDLENBQUEsZUFBRCxHQUFtQixNQUFNLENBQUMscUJBQVAsQ0FBNkIsQ0FBQSxTQUFBLEtBQUEsR0FBQTthQUFBLFNBQUEsR0FBQTtBQUU5QyxRQUFBLEtBQUMsQ0FBQSxxQkFBRCxDQUFBLENBQUEsQ0FGOEM7TUFBQSxFQUFBO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE3QixDQUFuQixDQUFBO0FBQUEsSUFNQSxNQUFNLENBQUMsS0FBUCxHQUFlLE1BQU0sQ0FBQyxLQU50QixDQUFBO0FBQUEsSUFRQSxpQkFBaUIsQ0FBQyxvQkFBbEIsQ0FBQSxDQVJBLENBQUE7QUFVQSxXQUFPLElBQVAsQ0FacUI7RUFBQSxDQVp2QixDQUFBOzs0QkFBQTs7SUFGRixDQUFBOztBQ0FBLElBQUEsV0FBQTs7QUFBQTtBQUVFLHdC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LENBQUE7QUFBQSxFQUdBLE1BQU0sQ0FBQyxLQUFQLEdBQWdCLFFBQUEsR0FBWSxLQUg1QixDQUFBO0FBQUEsRUFJQSxNQUFNLENBQUMsTUFBUCxHQUFnQixTQUFBLEdBQVksS0FKNUIsQ0FBQTtBQUFBLEVBTUEsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFiLEdBQXNCLEVBQUEsR0FBRyxRQUFILEdBQVksSUFObEMsQ0FBQTtBQUFBLEVBT0EsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFiLEdBQXNCLEVBQUEsR0FBRyxTQUFILEdBQWEsSUFQbkMsQ0FBQTtBQUFBLEVBU0EsT0FBTyxDQUFDLEtBQVIsQ0FBYyxLQUFkLEVBQXFCLEtBQXJCLENBVEEsQ0FERjtDQXBCQTs7QUFBQSxNQWlDQSxHQUF3QixJQUFBLFdBQUEsQ0FBQSxDQWpDeEIsQ0FBQTs7QUFBQSxLQWtDQSxHQUF3QixJQUFBLFVBQUEsQ0FBQSxDQWxDeEIsQ0FBQTs7QUFBQSxNQW1DQSxHQUF3QixJQUFBLFdBQUEsQ0FBQSxDQW5DeEIsQ0FBQTs7QUFBQSxLQW9DQSxHQUF3QixJQUFBLFVBQUEsQ0FBQSxDQXBDeEIsQ0FBQTs7QUFBQSxpQkF1Q0EsR0FBd0IsSUFBQSxzQkFBQSxDQUFBLENBdkN4QixDQUFBOztBQUFBLFNBd0NBLEdBQXdCLElBQUEsY0FBQSxDQUFBLENBeEN4QixDQUFBOztBQUFBLEVBeUNBLEdBQXdCLElBQUEsT0FBQSxDQUFBLENBekN4QixDQUFBOztBQUFBLE1BMENBLEdBQXdCLElBQUEsV0FBQSxDQUFBLENBMUN4QixDQUFBOztBQUFBLGFBNkNBLEdBQXdCLElBQUEsa0JBQUEsQ0FBQSxDQTdDeEIsQ0FBQTs7QUFBQSxJQWdEQSxHQUF3QixJQUFBLFNBQUEsQ0FBQSxDQWhEeEIsQ0FBQSIsImZpbGUiOiJhcHBsaWNhdGlvbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIlxuY2xhc3MgQW5pbWF0aW9uTG9vcENsYXNzXG5cbiAgY29uc3RydWN0b3I6IC0+XG5cbiAgICBAcmVxdWVzdEFuaW1hdGlvbkZyYW1lKClcblxuICAgIHJldHVybiB0aGlzXG5cbiAgY2FuY2VsQW5pbWF0aW9uRnJhbWU6IC0+XG5cbiAgICB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUoQGFuaW1hdGlvbkxvb3BJZClcblxuICAgIHJldHVybiB0aGlzXG5cbiAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lOiAtPlxuXG4gICAgQGFuaW1hdGlvbkxvb3BJZCA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPT5cblxuICAgICAgQHJlcXVlc3RBbmltYXRpb25GcmFtZSgpXG5cbiAgICAgIHJldHVyblxuXG4gICAgY2FudmFzLndpZHRoID0gY2FudmFzLndpZHRoXG5cbiAgICBQYXJ0aWNsZUdlbmVyYXRvci5hbmltYXRpb25Mb29wQWN0aW9ucygpXG5cbiAgICByZXR1cm4gdGhpc1xuIiwiXG5jbGFzcyBDb25maWdDbGFzc1xuXG4gIGNoYW5jZVBhcnRpY2xlSXNUYXJnZXQ6XG4gICAgZWFzeTogICAgICA1MFxuICAgIGRpZmZpY3VsdDogOTBcblxuICBsZXZlbFVwSW50ZXJ2YWw6IDVcblxuICBtYXhMZXZlbDogNTBcblxuICBtYXhMaW5lV2lkdGg6IDVcblxuICBtYXhUYXJnZXRzQXRPbmNlOlxuICAgIGVhc3k6ICAgICAgM1xuICAgIGRpZmZpY3VsdDogNlxuXG4gIHBhcnRpY2xlR3Jvd3RoTXVsdGlwbGllcjpcbiAgICBlYXN5OiAgICAgIDEuMDVcbiAgICBkaWZmaWN1bHQ6IDEuMTBcblxuICBwYXJ0aWNsZVNwYXduQ2hhbmNlOlxuICAgIGVhc3k6ICAgICAgNjBcbiAgICBkaWZmaWN1bHQ6IDEwMFxuXG4gIHBhcnRpY2xlRGlhbWV0ZXJBc1BlcmNlbnRhZ2VPZlNjcmVlbjogMTVcblxuICBwb2ludHNQZXJQb3A6IDEwXG5cbiAgcHJvcGVydGllc1RvVXBkYXRlV2l0aERpZmZpY3VsdHk6IFtcbiAgICAncGFydGljbGVTcGF3bkNoYW5jZSdcbiAgICAnY2hhbmNlUGFydGljbGVJc1RhcmdldCdcbiAgICAncGFydGljbGVHcm93dGhNdWx0aXBsaWVyJ1xuICAgICdzaXplTWF4J1xuICAgICdtYXhUYXJnZXRzQXRPbmNlJ1xuICAgICdtaW5UYXJnZXRTaXplJ1xuICAgICd2ZWxvY2l0eU1pbidcbiAgICAndmVsb2NpdHlNYXgnXG4gICAgJ3RhcmdldFZlbG9jaXR5TXVsdGlwbGllcidcbiAgXVxuXG4gIHRhcmdldFZlbG9jaXR5TXVsdGlwbGllcjpcbiAgICBlYXN5OiAgICAgIDAuM1xuICAgIGRpZmZpY3VsdDogMC41XG5cbiAgdmVsb2NpdHlNaW46XG4gICAgZWFzeTogICAgICAtNlxuICAgIGRpZmZpY3VsdDogLTEwXG5cbiAgdmVsb2NpdHlNYXg6XG4gICAgZWFzeTogICAgICA2XG4gICAgZGlmZmljdWx0OiAxMFxuXG4gIGNvbnN0cnVjdG9yOiAtPlxuXG4gICAgYmFzZVNjcmVlbldpZHRoICAgPSBNYXRoLm1pbihib2R5LmNsaWVudFdpZHRoLCBib2R5LmNsaWVudEhlaWdodCkgLyAxMDBcbiAgICBiYXNlUGFydGljbGVXaWR0aCA9IE1hdGgucm91bmQoYmFzZVNjcmVlbldpZHRoICogQHBhcnRpY2xlRGlhbWV0ZXJBc1BlcmNlbnRhZ2VPZlNjcmVlbilcblxuICAgIEBiYXNlUGFydGljbGVTaXplID0gYmFzZVBhcnRpY2xlV2lkdGggKiBkZXZpY2VQaXhlbFJhdGlvXG5cbiAgICBAbWluVGFyZ2V0U2l6ZSA9XG4gICAgICBlYXN5OiAgICAgIEBiYXNlUGFydGljbGVTaXplICogMC43XG4gICAgICBkaWZmaWN1bHQ6IEBiYXNlUGFydGljbGVTaXplICogMC40XG5cblxuICAgIEBzaXplTWF4ID1cbiAgICAgIGVhc3k6ICAgICAgQGJhc2VQYXJ0aWNsZVNpemVcbiAgICAgIGRpZmZpY3VsdDogQGJhc2VQYXJ0aWNsZVNpemUgKiAwLjZcblxuICAgIHJldHVybiB0aGlzXG5cbiAgdXBkYXRlVmFsdWVzRm9yRGlmZmljdWx0eTogLT5cblxuICAgIGZvciBwcm9wZXJ0eSBpbiBAcHJvcGVydGllc1RvVXBkYXRlV2l0aERpZmZpY3VsdHlcbiAgICAgIHByb3BlcnR5Q29uZmlnICA9IEBbcHJvcGVydHldXG4gICAgICB2YWx1ZURpZmZlcmVuY2UgPSBwcm9wZXJ0eUNvbmZpZy5kaWZmaWN1bHQgLSBwcm9wZXJ0eUNvbmZpZy5lYXN5XG4gICAgICBsZXZlbE11bGl0cGxpZXIgPSBQbGF5U3RhdGUubGV2ZWwgLyBAbWF4TGV2ZWxcblxuICAgICAgUGxheVN0YXRlW3Byb3BlcnR5XSA9ICh2YWx1ZURpZmZlcmVuY2UgKiBsZXZlbE11bGl0cGxpZXIpICsgcHJvcGVydHlDb25maWcuZWFzeVxuXG4gICAgcmV0dXJuIHRoaXNcbiIsIlxuY2xhc3MgRGV2aWNlQ2xhc3NcblxuICBjb25zdHJ1Y3RvcjogLT5cblxuICAgIHJldHVybiB0aGlzXG4iLCJcbmNsYXNzIEdhbWVDbGFzc1xuXG4gIGNvbnN0cnVjdG9yOiAtPlxuXG4gICAgU2NlbmVzLmlkZW50KClcblxuICAgIHJldHVybiB0aGlzXG5cbiAgb3ZlcjogLT5cblxuICAgIFNjZW5lcy5nYW1lT3ZlcigpXG5cbiAgICBQbGF5U3RhdGUuc3RvcExldmVsVXBJbmNyZW1lbnQoKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBzdGFydDogLT5cblxuICAgIFBsYXlTdGF0ZS5yZXNldCgpXG4gICAgVUkucmVzZXQoKVxuICAgIElucHV0LnJlbW92ZUdhbWVTdGFydFRhcEV2ZW50SGFuZGxlcigpXG4gICAgUGFydGljbGVHZW5lcmF0b3IucmVzZXQoKVxuXG4gICAgU2NlbmVzLnBsYXlpbmcoKVxuXG4gICAgcmV0dXJuIHRoaXNcbiIsIlxuY2xhc3MgSW5wdXRDbGFzc1xuXG4gIGNvbnN0cnVjdG9yOiAtPlxuXG4gICAgQGNhbmNlbFRvdWNoTW92ZUV2ZW50cygpXG5cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciBpbnB1dFZlcmIsIChldmVudCkgLT5cbiAgICAgICNjb25zb2xlLmxvZyBldmVudC50YXJnZXQubm9kZU5hbWUudG9Mb3dlckNhc2UoKVxuICAgICAgcmV0dXJuXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIGFkZEdhbWVTdGFydFRhcEV2ZW50SGFuZGxlcjogKCkgLT5cblxuICAgIGJvZHkuYWRkRXZlbnRMaXN0ZW5lcihpbnB1dFZlcmIsIEBnYW1lU3RhcnRUYXBFdmVudEhhbmRsZXIpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIGNhbmNlbFRvdWNoTW92ZUV2ZW50czogLT5cblxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyICd0b3VjaG1vdmUnLCAoZXZlbnQpIC0+XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG5cbiAgICAgIHJldHVyblxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBnYW1lU3RhcnRUYXBFdmVudEhhbmRsZXI6IChldmVudCkgLT5cblxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcblxuICAgIEdhbWUuc3RhcnQoKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBnZXRUb3VjaERhdGE6IChldmVudCkgLT5cblxuICAgIGlmIHRvdWNoRGF0YVxuICAgICAgdGFwQ29vcmRpbmF0ZXMgPSBldmVudC50b3VjaGVzWzBdXG4gICAgZWxzZVxuICAgICAgdG91Y2hEYXRhID1cbiAgICAgICAgcGFnZVg6IGV2ZW50LmNsaWVudFgsXG4gICAgICAgIHBhZ2VZOiBldmVudC5jbGllbnRZXG5cbiAgICByZXR1cm4gdG91Y2hEYXRhXG5cbiAgcmVnaXN0ZXJIYW5kbGVyOiAoc2VsZWN0b3IsIHNjZW5lLCBjYWxsYmFjaykgLT5cblxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpLmFkZEV2ZW50TGlzdGVuZXIgaW5wdXRWZXJiLCAoZXZlbnQpID0+XG5cbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcblxuICAgICAgY2FsbGJhY2suYXBwbHkoKSBpZiBTY2VuZXMuY3VycmVudCA9PSBzY2VuZVxuXG4gICAgICByZXR1cm5cblxuICAgIHJldHVybiB0aGlzXG5cbiAgcmVtb3ZlR2FtZVN0YXJ0VGFwRXZlbnRIYW5kbGVyOiAtPlxuXG4gICAgZG9jdW1lbnQuYm9keS5yZW1vdmVFdmVudExpc3RlbmVyKGlucHV0VmVyYiwgQGdhbWVTdGFydFRhcEV2ZW50SGFuZGxlcilcblxuICAgIHJldHVybiB0aGlzXG4iLCJcbmNsYXNzIFBhcnRpY2xlQ2xhc3NcblxuICBkZXN0cm95aW5nOiBmYWxzZVxuICBzaXplOiAgICAgICAxXG5cbiAgY29uc3RydWN0b3I6IC0+XG5cbiAgICByID0gVXRpbHMucmFuZG9tSW50ZWdlcigwLCAyMDApXG4gICAgZyA9IFV0aWxzLnJhbmRvbUludGVnZXIoMCwgMjAwKVxuICAgIGIgPSBVdGlscy5yYW5kb21JbnRlZ2VyKDAsIDIwMClcbiAgICBhID0gVXRpbHMucmFuZG9tKDAuNzUsIDEpXG5cbiAgICBAY29sb3IgICAgICA9IFwicmdiYSgje3J9LCAje2d9LCAje2J9LCAje2F9KVwiXG4gICAgQGZpbmFsU2l6ZSAgPSBVdGlscy5yYW5kb21JbnRlZ2VyKDAsIFBsYXlTdGF0ZS5zaXplTWF4KVxuICAgIEBpZCAgICAgICAgID0gTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyKDIsIDUpXG4gICAgQGlzVGFyZ2V0ICAgPSBAZGV0ZXJtaW5lVGFyZ2V0UGFydGljbGUoKVxuICAgIEBwb3NpdGlvbiAgID1cbiAgICAgIHg6IFBhcnRpY2xlR2VuZXJhdG9yLnBhcnRpY2xlc09yaWdpbi54XG4gICAgICB5OiBQYXJ0aWNsZUdlbmVyYXRvci5wYXJ0aWNsZXNPcmlnaW4ueVxuICAgIEB2ZWxvY2l0eSAgID1cbiAgICAgIHg6IFV0aWxzLnJhbmRvbShQbGF5U3RhdGUudmVsb2NpdHlNaW4sIFBsYXlTdGF0ZS52ZWxvY2l0eU1heClcbiAgICAgIHk6IFV0aWxzLnJhbmRvbShQbGF5U3RhdGUudmVsb2NpdHlNaW4sIFBsYXlTdGF0ZS52ZWxvY2l0eU1heClcblxuICAgIGlmIEBpc1RhcmdldFxuICAgICAgQGNvbG9yICAgICA9IFwicmdiYSgje3J9LCAje2d9LCAje2J9LCAwLjgpXCJcbiAgICAgIEBmaW5hbFNpemUgPSBVdGlscy5yYW5kb21JbnRlZ2VyKFBsYXlTdGF0ZS5taW5UYXJnZXRTaXplLCBQbGF5U3RhdGUuc2l6ZU1heClcblxuICAgICAgQHZlbG9jaXR5LnggKj0gUGxheVN0YXRlLnRhcmdldFZlbG9jaXR5TXVsdGlwbGllclxuICAgICAgQHZlbG9jaXR5LnkgKj0gUGxheVN0YXRlLnRhcmdldFZlbG9jaXR5TXVsdGlwbGllclxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBkZXRlcm1pbmVUYXJnZXRQYXJ0aWNsZTogLT5cblxuICAgIGlzVGFyZ2V0ID0gZmFsc2VcblxuICAgIGlmIFBhcnRpY2xlR2VuZXJhdG9yLnBhcnRpY2xlc1RvVGVzdEZvclRhcHMubGVuZ3RoIDwgUGxheVN0YXRlLm1heFRhcmdldHNBdE9uY2VcbiAgICAgIGlzVGFyZ2V0ID0gVXRpbHMucmFuZG9tUGVyY2VudGFnZSgpIDwgUGxheVN0YXRlLmNoYW5jZVBhcnRpY2xlSXNUYXJnZXRcblxuICAgIHJldHVybiBpc1RhcmdldFxuXG4gIGRyYXc6IC0+XG5cbiAgICBpZiBAb3V0c2lkZUNhbnZhc0JvdW5kcygpXG4gICAgICBQYXJ0aWNsZUdlbmVyYXRvci5wYXJ0aWNsZXNUb0RlbGV0ZS5wdXNoKEBpZClcblxuICAgICAgcmV0dXJuXG5cbiAgICBpZiBAaXNUYXJnZXRcbiAgICAgIEBsaW5lV2lkdGggPSBAc2l6ZSAvIDEwXG5cbiAgICAgIGlmIEBsaW5lV2lkdGggPiBDb25maWcubWF4TGluZVdpZHRoXG4gICAgICAgIEBsaW5lV2lkdGggPSBDb25maWcubWF4TGluZVdpZHRoXG5cbiAgICAgIGNvbnRleHQuZmlsbFN0eWxlID0gJ3JnYmEoMjQ3LCAyNDcsIDI0NywgMC45KSdcbiAgICAgIGNvbnRleHQubGluZVdpZHRoID0gQGxpbmVXaWR0aFxuXG4gICAgY29udGV4dC5iZWdpblBhdGgoKVxuICAgIGNvbnRleHQuYXJjKEBwb3NpdGlvbi54LCBAcG9zaXRpb24ueSwgQGhhbGYsIDAsIE1hdGguUEkgKiAyLCB0cnVlKVxuICAgIGNvbnRleHQuZmlsbCgpXG4gICAgY29udGV4dC5zdHJva2UoKSBpZiBAaXNUYXJnZXRcbiAgICBjb250ZXh0LmNsb3NlUGF0aCgpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIG91dHNpZGVDYW52YXNCb3VuZHM6IC0+XG5cbiAgICBiZXlvbmRCb3VuZHNYID0gQHBvc2l0aW9uLnggPCAtKEBmaW5hbFNpemUpIG9yIEBwb3NpdGlvbi54ID4gY2FudmFzLndpZHRoICArIEBmaW5hbFNpemVcbiAgICBiZXlvbmRCb3VuZHNZID0gQHBvc2l0aW9uLnkgPCAtKEBmaW5hbFNpemUpIG9yIEBwb3NpdGlvbi55ID4gY2FudmFzLmhlaWdodCArIEBmaW5hbFNpemVcblxuICAgIHJldHVybiBiZXlvbmRCb3VuZHNYIG9yIGJleW9uZEJvdW5kc1lcblxuICB1cGRhdGVWYWx1ZXM6IC0+XG5cbiAgICBpZiBAZGVzdHJveWluZ1xuICAgICAgc2hyaW5rTXVsdGlwbGllciA9IGlmIFBsYXlTdGF0ZS5wbGF5aW5nIHRoZW4gMC43IGVsc2UgMC45XG5cbiAgICAgIEBzaXplICo9IHNocmlua011bHRpcGxpZXJcbiAgICBlbHNlXG4gICAgICBpZiBAc2l6ZSA8IEBmaW5hbFNpemVcbiAgICAgICAgQHNpemUgKj0gUGxheVN0YXRlLnBhcnRpY2xlR3Jvd3RoTXVsdGlwbGllclxuXG4gICAgICBpZiBAc2l6ZSA+IEBmaW5hbFNpemVcbiAgICAgICAgQHNpemUgPSBAZmluYWxTaXplXG5cbiAgICBAaGFsZiA9IEBzaXplIC8gMlxuXG4gICAgQHBvc2l0aW9uLnggKz0gQHZlbG9jaXR5LnhcbiAgICBAcG9zaXRpb24ueSArPSBAdmVsb2NpdHkueVxuXG4gICAgQGRyYXcoKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICB3YXNUYXBwZWQ6ICh0b3VjaERhdGEpIC0+XG5cbiAgICB0YXBYICAgICAgPSB0b3VjaERhdGEucGFnZVggKiBkZXZpY2VQaXhlbFJhdGlvXG4gICAgdGFwWSAgICAgID0gdG91Y2hEYXRhLnBhZ2VZICogZGV2aWNlUGl4ZWxSYXRpb1xuICAgIGRpc3RhbmNlWCA9IHRhcFggLSBAcG9zaXRpb24ueFxuICAgIGRpc3RhbmNlWSA9IHRhcFkgLSBAcG9zaXRpb24ueVxuICAgIHJhZGl1cyAgICA9IEBoYWxmXG5cbiAgICByZXR1cm4gKGRpc3RhbmNlWCAqIGRpc3RhbmNlWCkgKyAoZGlzdGFuY2VZICogZGlzdGFuY2VZKSA8IChAaGFsZiAqIEBoYWxmKVxuIiwiXG5jbGFzcyBQYXJ0aWNsZUdlbmVyYXRvckNsYXNzXG5cbiAgY29uc3RydWN0b3I6IC0+XG5cbiAgICBAcGFydGljbGVzQXJyYXkgICAgICAgICA9IFtdXG4gICAgQHBhcnRpY2xlc0FycmF5SWRzICAgICAgPSBbXVxuICAgIEBwYXJ0aWNsZXNUb0RlbGV0ZSAgICAgID0gW11cbiAgICBAcGFydGljbGVzVG9UZXN0Rm9yVGFwcyA9IFtdXG5cbiAgICBAcGFydGljbGVzT3JpZ2luID1cbiAgICAgIHg6IGNhbnZhcy53aWR0aCAgLyAyXG4gICAgICB5OiBjYW52YXMuaGVpZ2h0IC8gMlxuXG4gICAgQHJlZ2lzdGVyUGFydGljbGVUYXBEZXRlY3Rpb25IYW5kbGVyKClcblxuICAgIHJldHVybiB0aGlzXG5cbiAgYW5pbWF0aW9uTG9vcEFjdGlvbnM6IC0+XG5cbiAgICBpZiBQbGF5U3RhdGUucGxheWluZ1xuICAgICAgQGdlbmVyYXRlUGFydGljbGUoKVxuXG4gICAgQHVwZGF0ZVBhcnRpY2xlc1ZhbHVlcygpXG4gICAgQHJlbW92ZVBhcnRpY2xlc0FmdGVyVGFwKClcblxuICAgIGlmIEBwYXJ0aWNsZXNUb0RlbGV0ZS5sZW5ndGggPiAwXG4gICAgICBAZGVzdHJveVBhcnRpY2xlc091dHNpZGVDYW52YXNCb3VuZHMoKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBkZXN0cm95UGFydGljbGVzT3V0c2lkZUNhbnZhc0JvdW5kczogLT5cblxuICAgIGZvciBwYXJ0aWNsZUlkIGluIEBwYXJ0aWNsZXNUb0RlbGV0ZVxuICAgICAgcGFydGljbGVJbmRleCA9IEBwYXJ0aWNsZXNBcnJheUlkcy5pbmRleE9mKHBhcnRpY2xlSWQpXG4gICAgICBwYXJ0aWNsZSAgICAgID0gQHBhcnRpY2xlc0FycmF5W3BhcnRpY2xlSW5kZXhdXG5cbiAgICAgIGlmIHBhcnRpY2xlP1xuICAgICAgICBAZ2FtZU92ZXIoKSBpZiBwYXJ0aWNsZS5pc1RhcmdldFxuICAgICAgICBAcmVtb3ZlUGFydGljbGUocGFydGljbGUpXG5cbiAgICBAcGFydGljbGVzVG9EZWxldGUgPSBbXVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBnYW1lT3ZlcjogLT5cblxuICAgIEBzdG9wKClcblxuICAgIGZvciBwYXJ0aWNsZSBpbiBAcGFydGljbGVzQXJyYXlcbiAgICAgIHBhcnRpY2xlLmRlc3Ryb3lpbmcgPSB0cnVlXG5cbiAgICBQbGF5U3RhdGUucGFydGljbGVTcGF3bkNoYW5jZSA9IDBcblxuICAgIEdhbWUub3ZlcigpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIGdlbmVyYXRlUGFydGljbGU6IC0+XG5cbiAgICBpZiBVdGlscy5yYW5kb21QZXJjZW50YWdlKCkgPCBQbGF5U3RhdGUucGFydGljbGVTcGF3bkNoYW5jZVxuICAgICAgcGFydGljbGUgPSBuZXcgUGFydGljbGVDbGFzcygpXG5cbiAgICAgIEBwYXJ0aWNsZXNBcnJheS5wdXNoKHBhcnRpY2xlKVxuICAgICAgQHBhcnRpY2xlc0FycmF5SWRzLnB1c2gocGFydGljbGUuaWQpXG5cbiAgICAgIGlmIHBhcnRpY2xlLmlzVGFyZ2V0XG4gICAgICAgIEBwYXJ0aWNsZXNUb1Rlc3RGb3JUYXBzLnVuc2hpZnQocGFydGljbGUuaWQpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHBhcnRpY2xlVGFwRGV0ZWN0aW9uSGFuZGxlcjogKCkgLT5cblxuICAgIGNvbnNvbGUubG9nKGV2ZW50KVxuXG4gICAgdGFyZ2V0SGl0ID0gZmFsc2VcblxuICAgIGZvciBwYXJ0aWNsZUlkIGluIEBwYXJ0aWNsZXNUb1Rlc3RGb3JUYXBzXG4gICAgICBwYXJ0aWNsZUluZGV4ID0gQHBhcnRpY2xlc0FycmF5SWRzLmluZGV4T2YocGFydGljbGVJZClcbiAgICAgIHBhcnRpY2xlICAgICAgPSBAcGFydGljbGVzQXJyYXlbcGFydGljbGVJbmRleF1cbiAgICAgIHRvdWNoRGF0YSAgICAgPSBJbnB1dC5nZXRUb3VjaERhdGEoZXZlbnQpXG5cbiAgICAgIGlmIHBhcnRpY2xlPyBhbmQgcGFydGljbGUud2FzVGFwcGVkKHRvdWNoRGF0YSlcbiAgICAgICAgZGVsZXRpb25JbmRleCAgICAgICA9IEBwYXJ0aWNsZXNUb1Rlc3RGb3JUYXBzLmluZGV4T2YocGFydGljbGVJZClcbiAgICAgICAgcGFydGljbGUuZGVzdHJveWluZyA9IHRydWVcbiAgICAgICAgdGFyZ2V0SGl0ICAgICAgICAgICA9IHRydWVcblxuICAgICAgICBAcGFydGljbGVzVG9UZXN0Rm9yVGFwcy5zcGxpY2UoZGVsZXRpb25JbmRleCwgMSlcblxuICAgICAgICBicmVha1xuXG4gICAgUGxheVN0YXRlLnVwZGF0ZUNvbWJvTXVsdGlwbGllcih0YXJnZXRIaXQpXG5cbiAgICBpZiB0YXJnZXRIaXRcbiAgICAgIFBsYXlTdGF0ZS51cGRhdGVTY29yZShwYXJ0aWNsZS5zaXplLCBwYXJ0aWNsZS5maW5hbFNpemUpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHJlZ2lzdGVyUGFydGljbGVUYXBEZXRlY3Rpb25IYW5kbGVyOiAtPlxuXG4gICAgSW5wdXQucmVnaXN0ZXJIYW5kbGVyICcudWktcGxheWluZycsICdwbGF5aW5nJywgLT5cbiAgICAgIFBhcnRpY2xlR2VuZXJhdG9yLnBhcnRpY2xlVGFwRGV0ZWN0aW9uSGFuZGxlcigpXG4gICAgICByZXR1cm5cblxuICAgIHJldHVybiB0aGlzXG5cbiAgcmVtb3ZlUGFydGljbGU6IChwYXJ0aWNsZSkgLT5cblxuICAgIGlkICAgID0gcGFydGljbGUuaWRcbiAgICBpbmRleCA9IEBwYXJ0aWNsZXNBcnJheUlkcy5pbmRleE9mKGlkKVxuXG4gICAgQHBhcnRpY2xlc0FycmF5LnNwbGljZShpbmRleCwgMSlcbiAgICBAcGFydGljbGVzQXJyYXlJZHMuc3BsaWNlKGluZGV4LCAxKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICByZW1vdmVQYXJ0aWNsZXNBZnRlclRhcDogLT5cblxuICAgIGZvciBwYXJ0aWNsZSBpbiBAcGFydGljbGVzQXJyYXlcbiAgICAgIGlmIHBhcnRpY2xlPyBhbmQgcGFydGljbGUuc2l6ZSA8IDFcbiAgICAgICAgQHJlbW92ZVBhcnRpY2xlKHBhcnRpY2xlKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICByZXNldDogLT5cblxuICAgIEBwYXJ0aWNsZXNBcnJheSAgICAgICAgID0gW11cbiAgICBAcGFydGljbGVzQXJyYXlJZHMgICAgICA9IFtdXG4gICAgQHBhcnRpY2xlc1RvRGVsZXRlICAgICAgPSBbXVxuICAgIEBwYXJ0aWNsZXNUb1Rlc3RGb3JUYXBzID0gW11cblxuICAgIHJldHVybiB0aGlzXG5cbiAgc3RvcDogLT5cblxuICAgIFBsYXlTdGF0ZS51cGRhdGUoZmFsc2UpXG4gICAgUGxheVN0YXRlLnN0b3BMZXZlbFVwSW5jcmVtZW50KClcblxuICAgIHJldHVybiB0aGlzXG5cbiAgdXBkYXRlUGFydGljbGVzVmFsdWVzOiAtPlxuXG4gICAgZm9yIHBhcnRpY2xlIGluIEBwYXJ0aWNsZXNBcnJheVxuICAgICAgaWYgcGFydGljbGU/XG4gICAgICAgIGNvbnRleHQuZmlsbFN0eWxlICAgPSBwYXJ0aWNsZS5jb2xvclxuICAgICAgICBjb250ZXh0LnN0cm9rZVN0eWxlID0gcGFydGljbGUuY29sb3JcblxuICAgICAgICBwYXJ0aWNsZS51cGRhdGVWYWx1ZXMoKVxuXG4gICAgcmV0dXJuIHRoaXNcbiIsIlxuY2xhc3MgUGxheVN0YXRlQ2xhc3NcblxuICBkZWZhdWx0czpcbiAgICBjb21ib011bHRpcGxpZXI6IDBcbiAgICBsZXZlbDogICAgICAgICAgIDFcbiAgICBzY29yZTogICAgICAgICAgIDBcblxuICByZXNldDogLT5cblxuICAgIEBjaGFuY2VQYXJ0aWNsZUlzVGFyZ2V0ICAgPSBDb25maWcuY2hhbmNlUGFydGljbGVJc1RhcmdldC5lYXN5XG4gICAgQGNvbWJvTXVsdGlwbGllciAgICAgICAgICA9IEBkZWZhdWx0cy5jb21ib011bHRpcGxpZXJcbiAgICBAbGV2ZWwgICAgICAgICAgICAgICAgICAgID0gQGRlZmF1bHRzLmxldmVsXG4gICAgQG1heFRhcmdldHNBdE9uY2UgICAgICAgICA9IENvbmZpZy5tYXhUYXJnZXRzQXRPbmNlLmVhc3lcbiAgICBAbWluVGFyZ2V0U2l6ZSAgICAgICAgICAgID0gQ29uZmlnLm1pblRhcmdldFNpemUuZWFzeVxuICAgIEBwYXJ0aWNsZUdyb3d0aE11bHRpcGxpZXIgPSBDb25maWcucGFydGljbGVHcm93dGhNdWx0aXBsaWVyLmVhc3lcbiAgICBAcGFydGljbGVTcGF3bkNoYW5jZSAgICAgID0gQ29uZmlnLnBhcnRpY2xlU3Bhd25DaGFuY2UuZWFzeVxuICAgIEBzY29yZSAgICAgICAgICAgICAgICAgICAgPSBAZGVmYXVsdHMuc2NvcmVcbiAgICBAc2l6ZU1heCAgICAgICAgICAgICAgICAgID0gQ29uZmlnLnNpemVNYXguZWFzeVxuICAgIEB0YXJnZXRWZWxvY2l0eU11bHRpcGxpZXIgPSBDb25maWcudGFyZ2V0VmVsb2NpdHlNdWx0aXBsaWVyLmVhc3lcbiAgICBAdmVsb2NpdHlNaW4gICAgICAgICAgICAgID0gQ29uZmlnLnZlbG9jaXR5TWluLmVhc3lcbiAgICBAdmVsb2NpdHlNYXggICAgICAgICAgICAgID0gQ29uZmlnLnZlbG9jaXR5TWF4LmVhc3lcblxuICAgIEB1cGRhdGUodHJ1ZSlcblxuICAgIENvbmZpZy51cGRhdGVWYWx1ZXNGb3JEaWZmaWN1bHR5KClcblxuICAgIEBzZXR1cExldmVsVXBJbmNyZW1lbnQoKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBzdG9wTGV2ZWxVcEluY3JlbWVudDogLT5cblxuICAgIHdpbmRvdy5jbGVhckludGVydmFsKEBsZXZlbFVwQ291bnRlcilcblxuICAgIHJldHVybiB0aGlzXG5cbiAgc2V0dXBMZXZlbFVwSW5jcmVtZW50OiAtPlxuXG4gICAgQGxldmVsVXBDb3VudGVyID0gd2luZG93LnNldEludGVydmFsID0+XG5cbiAgICAgIEB1cGRhdGVMZXZlbCgpXG5cbiAgICAgIHJldHVyblxuXG4gICAgLCBDb25maWcubGV2ZWxVcEludGVydmFsICogMTAwMFxuXG4gICAgcmV0dXJuIHRoaXNcblxuICB1cGRhdGVDb21ib011bHRpcGxpZXI6ICh0YXJnZXRIaXQpIC0+XG5cbiAgICBAY29tYm9NdWx0aXBsaWVyID0gaWYgdGFyZ2V0SGl0IHRoZW4gQGNvbWJvTXVsdGlwbGllciArIDEgZWxzZSBAZGVmYXVsdHMuY29tYm9NdWx0aXBsaWVyXG5cbiAgICBVSS51cGRhdGVDb21ib011bHRpcGxpZXJDb3VudGVyKClcblxuICAgIHJldHVybiB0aGlzXG5cbiAgdXBkYXRlOiAobmV3U3RhdGUpIC0+XG5cbiAgICBAcGxheWluZyA9IG5ld1N0YXRlXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHVwZGF0ZUxldmVsOiAtPlxuXG4gICAgQGxldmVsICs9IDFcblxuICAgIGlmIEBsZXZlbCA+PSBDb25maWcubWF4TGV2ZWxcbiAgICAgIHdpbmRvdy5jbGVhckludGVydmFsKEBsZXZlbFVwQ291bnRlcilcblxuICAgIFVJLnVwZGF0ZUxldmVsQ291bnRlcigpXG4gICAgQ29uZmlnLnVwZGF0ZVZhbHVlc0ZvckRpZmZpY3VsdHkoKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICB1cGRhdGVTY29yZTogKHNpemVXaGVuVGFwcGVkLCBzaXplV2hlbkZ1bGx5R3Jvd24pIC0+XG5cbiAgICAjKChkZWZhdWx0U2NvcmVQZXJQb3AgKyAoMTAwIC0gKChzaXplV2hlblRhcHBlZCAvIHNpemVXaGVuRnVsbHlHcm93bikgKiAxMDApKSkgKiBjb21ib011bHRpcGxpZXIpICogKGxldmVsTnVtYmVyICsgMSlcblxuICAgIHRhcmdldFNpemVCb251cyA9IE1hdGgucm91bmQoMTAwIC0gKChzaXplV2hlblRhcHBlZCAvIHNpemVXaGVuRnVsbHlHcm93bikgKiAxMDApKVxuICAgIHBvcFBvaW50VmFsdWUgICA9IENvbmZpZy5wb2ludHNQZXJQb3AgKyB0YXJnZXRTaXplQm9udXNcbiAgICBsZXZlbE11bHRpcGxpZXIgPSBAbGV2ZWwgKyAxXG5cbiAgICBAc2NvcmUgKz0gKHBvcFBvaW50VmFsdWUgKiBAY29tYm9NdWx0aXBsaWVyKSAqIChsZXZlbE11bHRpcGxpZXIpXG5cbiAgICBVSS51cGRhdGVTY29yZUNvdW50ZXIoKVxuXG4gICAgcmV0dXJuIHRoaXNcbiIsIlxuY2xhc3MgU2NlbmVzQ2xhc3NcblxuICBAY3VycmVudCA9IG51bGxcblxuICBjcmVkaXRzOiAtPlxuXG4gICAgQGN1cnJlbnQgPSAnY3JlZGl0cydcblxuICAgIFVJLnVwZGF0ZUJvZHlDbGFzcygnY3JlZGl0cycpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIGdhbWVPdmVyOiAtPlxuXG4gICAgQGN1cnJlbnQgPSAnZ2FtZS1vdmVyJ1xuXG4gICAgVUkudXBkYXRlQm9keUNsYXNzKCdnYW1lLW92ZXInKVxuXG4gICAgSW5wdXQuYWRkR2FtZVN0YXJ0VGFwRXZlbnRIYW5kbGVyKClcblxuICAgIHJldHVybiB0aGlzXG5cbiAgbGVhZGVyYm9hcmQ6IC0+XG5cbiAgICBAY3VycmVudCA9ICdsZWFkZXJib2FyZCdcblxuICAgIHJldHVybiB0aGlzXG5cbiAgcGxheWluZzogLT5cblxuICAgIEBjdXJyZW50ID0gJ3BsYXlpbmcnXG5cbiAgICBVSS51cGRhdGVCb2R5Q2xhc3MoJ3BsYXlpbmcnKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBpZGVudDogLT5cblxuICAgIEBjdXJyZW50ID0gJ2lkZW50J1xuXG4gICAgVUkudXBkYXRlQm9keUNsYXNzKCdpZGVudCcpXG5cbiAgICB3aW5kb3cuc2V0VGltZW91dCA9PlxuICAgICAgQHRpdGxlKClcbiAgICAsIDUwMFxuXG4gICAgcmV0dXJuIHRoaXNcblxuICB0aXRsZTogLT5cblxuICAgIEBjdXJyZW50ID0gJ3RpdGxlJ1xuXG4gICAgVUkudXBkYXRlQm9keUNsYXNzKCd0aXRsZScpXG5cbiAgICBJbnB1dC5hZGRHYW1lU3RhcnRUYXBFdmVudEhhbmRsZXIoKTtcblxuICAgIHJldHVybiB0aGlzXG4iLCJcbmNsYXNzIFVJQ2xhc3NcblxuICByZXNldDogLT5cblxuICAgIEBsZXZlbENvdW50ZXIgICAgICAgICAgID0gVXRpbHMuJCgnLmh1ZC12YWx1ZS1sZXZlbCcpXG4gICAgQHNjb3JlQ291bnRlciAgICAgICAgICAgPSBVdGlscy4kKCcuaHVkLXZhbHVlLXNjb3JlJylcbiAgICBAY29tYm9NdWx0aXBsaWVyQ291bnRlciA9IFV0aWxzLiQoJy5odWQtdmFsdWUtY29tYm8nKVxuICAgIEBwbGF5QWdhaW4gICAgICAgICAgICAgID0gVXRpbHMuJCgnLnBsYXktYWdhaW4nKVxuXG4gICAgQHVwZGF0ZUNvbWJvTXVsdGlwbGllckNvdW50ZXIoKVxuICAgIEB1cGRhdGVMZXZlbENvdW50ZXIoKVxuICAgIEB1cGRhdGVTY29yZUNvdW50ZXIoKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICB1cGRhdGVCb2R5Q2xhc3M6IChjbGFzc05hbWUpIC0+XG5cbiAgICBib2R5LmNsYXNzTmFtZSA9ICcnXG4gICAgYm9keS5jbGFzc0xpc3QuYWRkKCdzY2VuZS0nICsgY2xhc3NOYW1lKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICB1cGRhdGVDb21ib011bHRpcGxpZXJDb3VudGVyOiAtPlxuXG4gICAgVXRpbHMudXBkYXRlVUlUZXh0Tm9kZShAY29tYm9NdWx0aXBsaWVyQ291bnRlciwgUGxheVN0YXRlLmNvbWJvTXVsdGlwbGllcilcblxuICAgIHJldHVybiB0aGlzXG5cbiAgdXBkYXRlTGV2ZWxDb3VudGVyOiAtPlxuXG4gICAgVXRpbHMudXBkYXRlVUlUZXh0Tm9kZShAbGV2ZWxDb3VudGVyLCBQbGF5U3RhdGUubGV2ZWwpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHVwZGF0ZVNjb3JlQ291bnRlcjogLT5cblxuICAgIHNjb3JlVG9Gb3JtYXQgPSBVdGlscy5mb3JtYXRXaXRoQ29tbWEoUGxheVN0YXRlLnNjb3JlKVxuXG4gICAgVXRpbHMudXBkYXRlVUlUZXh0Tm9kZShAc2NvcmVDb3VudGVyLCBzY29yZVRvRm9ybWF0KVxuXG4gICAgcmV0dXJuIHRoaXNcbiIsIlxuY2xhc3MgVXRpbHNDbGFzc1xuXG4gICQ6IChzZWxlY3RvcikgLT5cbiAgICBpZiBzZWxlY3Rvci5zdWJzdHIoMCwgMSkgPT0gJyMnXG4gICAgICByZXR1cm4gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoc2VsZWN0b3IpXG5cbiAgICBlbHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKVxuXG4gICAgaWYgZWxzLmxlbmd0aCA9PSAxXG4gICAgICByZXR1cm4gZWxzWzBdXG5cbiAgICByZXR1cm4gZWxzXG5cbiAgY29ycmVjdFZhbHVlRm9yRFBSOiAodmFsdWUsIGludGVnZXIgPSBmYWxzZSkgLT5cblxuICAgIHZhbHVlICo9IGRldmljZVBpeGVsUmF0aW9cblxuICAgIGlmIGludGVnZXJcbiAgICAgIHZhbHVlID0gTWF0aC5yb3VuZCh2YWx1ZSlcblxuICAgIHJldHVybiB2YWx1ZVxuXG4gIGZvcm1hdFdpdGhDb21tYTogKG51bSkgLT5cblxuICAgIHJldHVybiBudW0udG9TdHJpbmcoKS5yZXBsYWNlKC9cXEIoPz0oXFxkezN9KSsoPyFcXGQpKS9nLCBcIixcIilcblxuICByYW5kb206IChtaW4sIG1heCkgLT5cblxuICAgIGlmIG1pbiA9PSB1bmRlZmluZWRcbiAgICAgIG1pbiA9IDBcbiAgICAgIG1heCA9IDFcbiAgICBlbHNlIGlmIG1heCA9PSB1bmRlZmluZWRcbiAgICAgIG1heCA9IG1pblxuICAgICAgbWluID0gMFxuXG4gICAgcmV0dXJuIChNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbikpICsgbWluO1xuXG4gIHJhbmRvbUNvbG9yOiAoYWxwaGEgPSBmYWxzZSkgLT5cblxuICAgIGNvbG9ycyA9XG4gICAgICByOiB0aGlzLnJhbmRvbUludGVnZXIoMCwgMjAwKVxuICAgICAgZzogdGhpcy5yYW5kb21JbnRlZ2VyKDAsIDIwMClcbiAgICAgIGI6IHRoaXMucmFuZG9tSW50ZWdlcigwLCAyMDApXG4gICAgICBhOiBpZiAhYWxwaGEgdGhlbiB0aGlzLnJhbmRvbSgwLjc1LCAxKSBlbHNlIGFscGhhXG5cbiAgICByZXR1cm4gJ3JnYmEoJyArIGNvbG9ycy5yICsgJywgJyArIGNvbG9ycy5nICsgJywgJyArIGNvbG9ycy5iICsgJywgJyArIGNvbG9ycy5hICsgJyknXG5cbiAgcmFuZG9tSW50ZWdlcjogKG1pbiwgbWF4KSAtPlxuXG4gICAgaWYgbWF4ID09IHVuZGVmaW5lZFxuICAgICAgbWF4ID0gbWluXG4gICAgICBtaW4gPSAwXG5cbiAgICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKG1heCArIDEgLSBtaW4pKSArIG1pblxuXG4gIHJhbmRvbVBlcmNlbnRhZ2U6IC0+XG5cbiAgICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTAwKVxuXG4gIHVwZGF0ZVVJVGV4dE5vZGU6IChlbGVtZW50LCB2YWx1ZSkgLT5cblxuICAgIGVsZW1lbnQuaW5uZXJIVE1MID0gdmFsdWVcblxuICAgIHJldHVybiB0aGlzXG4iLCJcbmRlYnVnID0gdHJ1ZVxuXG5hbmRyb2lkICAgICAgICA9IGlmIG5hdmlnYXRvci51c2VyQWdlbnQubWF0Y2goL2FuZHJvaWQvaSkgdGhlbiB0cnVlIGVsc2UgZmFsc2VcbmJvZHkgICAgICAgICAgID0gZG9jdW1lbnQuYm9keVxuY2FudmFzICAgICAgICAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuY2FudmFzJylcbmhhc1RvdWNoRXZlbnRzID0gd2luZG93Lmhhc093blByb3BlcnR5KCdvbnRvdWNoc3RhcnQnKSB8fCB3aW5kb3cuaGFzT3duUHJvcGVydHkoJ29ubXNnZXN0dXJlY2hhbmdlJylcbmlucHV0VmVyYiAgICAgID0gaWYgaGFzVG91Y2hFdmVudHMgdGhlbiAndG91Y2hzdGFydCcgZWxzZSAnY2xpY2snXG5cbmNhbnZhcy5jbGFzc05hbWUgPSAnY2FudmFzJ1xuY2FudmFzLndpZHRoICAgICA9IGJvZHkuY2xpZW50V2lkdGhcbmNhbnZhcy5oZWlnaHQgICAgPSBib2R5LmNsaWVudEhlaWdodFxuXG5jb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoJzJkJylcblxuY29udGV4dC5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb24gPSAnc291cmNlLWF0b3AnXG5cbmRldmljZVBpeGVsUmF0aW8gID0gd2luZG93LmRldmljZVBpeGVsUmF0aW8gfHwgMVxuYmFja2luZ1N0b3JlUmF0aW8gPSBjb250ZXh0LndlYmtpdEJhY2tpbmdTdG9yZVBpeGVsUmF0aW8gfHwgY29udGV4dC5iYWNraW5nU3RvcmVQaXhlbFJhdGlvIHx8IDFcbnJhdGlvICAgICAgICAgICAgID0gZGV2aWNlUGl4ZWxSYXRpbyAvIGJhY2tpbmdTdG9yZVJhdGlvXG5cbmlmIGRldmljZVBpeGVsUmF0aW8gIT0gYmFja2luZ1N0b3JlUmF0aW9cbiAgb2xkV2lkdGggID0gY2FudmFzLndpZHRoXG4gIG9sZEhlaWdodCA9IGNhbnZhcy5oZWlnaHRcblxuICBjYW52YXMud2lkdGggID0gb2xkV2lkdGggICogcmF0aW9cbiAgY2FudmFzLmhlaWdodCA9IG9sZEhlaWdodCAqIHJhdGlvXG5cbiAgY2FudmFzLnN0eWxlLndpZHRoICA9IFwiI3tvbGRXaWR0aH1weFwiXG4gIGNhbnZhcy5zdHlsZS5oZWlnaHQgPSBcIiN7b2xkSGVpZ2h0fXB4XCJcblxuICBjb250ZXh0LnNjYWxlKHJhdGlvLCByYXRpbylcblxuIyBTZXQgZW52aXJvbm1lbnQgYW5kIGJhc2UgY29uZmlnIGV0Y1xuRGV2aWNlICAgICAgICAgICAgPSBuZXcgRGV2aWNlQ2xhc3MoKVxuVXRpbHMgICAgICAgICAgICAgPSBuZXcgVXRpbHNDbGFzcygpXG5Db25maWcgICAgICAgICAgICA9IG5ldyBDb25maWdDbGFzcygpXG5JbnB1dCAgICAgICAgICAgICA9IG5ldyBJbnB1dENsYXNzKClcblxuIyBMb2FkIHRoZSBnYW1lIGxvZ2ljIGFuZCBhbGwgdGhhdFxuUGFydGljbGVHZW5lcmF0b3IgPSBuZXcgUGFydGljbGVHZW5lcmF0b3JDbGFzcygpXG5QbGF5U3RhdGUgICAgICAgICA9IG5ldyBQbGF5U3RhdGVDbGFzcygpXG5VSSAgICAgICAgICAgICAgICA9IG5ldyBVSUNsYXNzKClcblNjZW5lcyAgICAgICAgICAgID0gbmV3IFNjZW5lc0NsYXNzKClcblxuIyBTZXQgb2ZmIHRoZSBjYW52YXMgYW5pbWF0aW9uIGxvb3BcbkFuaW1hdGlvbkxvb3AgICAgID0gbmV3IEFuaW1hdGlvbkxvb3BDbGFzcygpXG5cbiMgU3RhcnQgdGhlIGFjdHVhbCBnYW1lXG5HYW1lICAgICAgICAgICAgICA9IG5ldyBHYW1lQ2xhc3MoKVxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9