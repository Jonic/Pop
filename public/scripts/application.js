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

var InputClass,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

InputClass = (function() {
  function InputClass() {
    this.cancelTouchMoveEvents();
    window.addEventListener(inputVerb, function(event) {
      console.log(event.target.nodeName.toLowerCase());
    });
    return this;
  }

  InputClass.prototype.cancelTouchMoveEvents = function() {
    window.addEventListener('touchmove', function(event) {
      event.preventDefault();
    });
    return this;
  };

  InputClass.prototype.gameStartTapEventHandler = function() {
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

  InputClass.prototype.registerHandler = function(selector, action, callback, scenes) {
    var scene_string;
    if (typeof scenes === 'string') {
      scene_string = scenes;
      scenes = [scene_string];
    }
    document.querySelector(selector).addEventListener(inputVerb, (function(_this) {
      return function(event) {
        var _ref;
        event.preventDefault();
        if (scenes.length === 0 || (_ref = Scenes.current, __indexOf.call(scenes, _ref) >= 0)) {
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
    this.particlesToDelete.map((function(_this) {
      return function(particleId) {
        var particle, particleIndex;
        particleIndex = _this.particlesArrayIds.indexOf(particleId);
        particle = _this.particlesArray[particleIndex];
        if (particle != null) {
          if (particle.isTarget) {
            _this.gameOver();
          }
          return _this.removeParticle(particle);
        }
      };
    })(this));
    this.particlesToDelete = [];
    return this;
  };

  ParticleGeneratorClass.prototype.gameOver = function() {
    this.stop();
    this.particlesArray.map((function(_this) {
      return function(particle) {
        return particle.destroying = true;
      };
    })(this));
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
    var particle, targetHit;
    targetHit = false;
    particle = false;
    this.particlesToTestForTaps.map((function(_this) {
      return function(particleId) {
        var deletionIndex, particleIndex, touchData;
        particleIndex = _this.particlesArrayIds.indexOf(particleId);
        particle = _this.particlesArray[particleIndex];
        touchData = Input.getTouchData(event);
        if ((particle != null) && particle.wasTapped(touchData)) {
          deletionIndex = _this.particlesToTestForTaps.indexOf(particleId);
          particle.destroying = true;
          targetHit = true;
          _this.particlesToTestForTaps.splice(deletionIndex, 1);
        }
      };
    })(this));
    PlayState.updateComboMultiplier(targetHit);
    if (targetHit) {
      PlayState.updateScore(particle.size, particle.finalSize);
    }
    return this;
  };

  ParticleGeneratorClass.prototype.registerParticleTapDetectionHandler = function() {
    Input.registerHandler('.ui-playing', inputVerb, function() {
      return ParticleGenerator.particleTapDetectionHandler();
    }, ['playing']);
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
    this.particlesArray.map((function(_this) {
      return function(particle) {
        if (particle.size < 1) {
          _this.removeParticle(particle);
        }
      };
    })(this));
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
    this.particlesArray.map((function(_this) {
      return function(particle) {
        context.fillStyle = particle.color;
        context.strokeStyle = particle.color;
        particle.updateValues();
      };
    })(this));
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
    })(this), 5000);
    return this;
  };

  ScenesClass.prototype.title = function() {
    this.current = 'title';
    UI.updateBodyClass('title');
    return this;
  };

  return ScenesClass;

})();

var UIClass;

UIClass = (function() {
  function UIClass() {
    this.setupBasicInterfaceEvents();
    return this;
  }

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

  UIClass.prototype.setupBasicInterfaceEvents = function() {
    Input.registerHandler('.game-logo', inputVerb, function() {
      return Input.gameStartTapEventHandler();
    }, ['title']);
    Input.registerHandler('.play-again', inputVerb, function() {
      return Input.gameStartTapEventHandler();
    }, ['game-over']);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkFuaW1hdGlvbkxvb3AuY29mZmVlIiwiQ29uZmlnLmNvZmZlZSIsIkRldmljZS5jb2ZmZWUiLCJHYW1lLmNvZmZlZSIsIklucHV0LmNvZmZlZSIsIlBhcnRpY2xlLmNvZmZlZSIsIlBhcnRpY2xlR2VuZXJhdG9yLmNvZmZlZSIsIlBsYXlTdGF0ZS5jb2ZmZWUiLCJTY2VuZXMuY29mZmVlIiwiVUkuY29mZmVlIiwiVXRpbHMuY29mZmVlIiwiX2Jvb3RzdHJhcC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsSUFBQSxrQkFBQTs7QUFBQTtBQUVlLEVBQUEsNEJBQUEsR0FBQTtBQUVYLElBQUEsSUFBQyxDQUFBLHFCQUFELENBQUEsQ0FBQSxDQUFBO0FBRUEsV0FBTyxJQUFQLENBSlc7RUFBQSxDQUFiOztBQUFBLCtCQU1BLG9CQUFBLEdBQXNCLFNBQUEsR0FBQTtBQUVwQixJQUFBLE1BQU0sQ0FBQyxvQkFBUCxDQUE0QixJQUFDLENBQUEsZUFBN0IsQ0FBQSxDQUFBO0FBRUEsV0FBTyxJQUFQLENBSm9CO0VBQUEsQ0FOdEIsQ0FBQTs7QUFBQSwrQkFZQSxxQkFBQSxHQUF1QixTQUFBLEdBQUE7QUFFckIsSUFBQSxJQUFDLENBQUEsZUFBRCxHQUFtQixNQUFNLENBQUMscUJBQVAsQ0FBNkIsQ0FBQSxTQUFBLEtBQUEsR0FBQTthQUFBLFNBQUEsR0FBQTtBQUU5QyxRQUFBLEtBQUMsQ0FBQSxxQkFBRCxDQUFBLENBQUEsQ0FGOEM7TUFBQSxFQUFBO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE3QixDQUFuQixDQUFBO0FBQUEsSUFNQSxNQUFNLENBQUMsS0FBUCxHQUFlLE1BQU0sQ0FBQyxLQU50QixDQUFBO0FBQUEsSUFRQSxpQkFBaUIsQ0FBQyxvQkFBbEIsQ0FBQSxDQVJBLENBQUE7QUFVQSxXQUFPLElBQVAsQ0FacUI7RUFBQSxDQVp2QixDQUFBOzs0QkFBQTs7SUFGRixDQUFBOztBQ0FBLElBQUEsV0FBQTs7QUFBQTtBQUVFLHdC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QSxTQUFBLEdBQVksTUFBTSxDQUFDLE1BRG5CLENBQUE7QUFBQSxFQUdBLE1BQU0sQ0FBQyxLQUFQLEdBQWdCLFFBQUEsR0FBWSxLQUg1QixDQUFBO0FBQUEsRUFJQSxNQUFNLENBQUMsTUFBUCxHQUFnQixTQUFBLEdBQVksS0FKNUIsQ0FBQTtBQUFBLEVBTUEsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFiLEdBQXNCLEVBQUEsR0FBRyxRQUFILEdBQVksSUFObEMsQ0FBQTtBQUFBLEVBT0EsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFiLEdBQXNCLEVBQUEsR0FBRyxTQUFILEdBQWEsSUFQbkMsQ0FBQTtBQUFBLEVBU0EsT0FBTyxDQUFDLEtBQVIsQ0FBYyxLQUFkLEVBQXFCLEtBQXJCLENBVEEsQ0FERjtDQXBCQTs7QUFBQSxNQWlDQSxHQUF3QixJQUFBLFdBQUEsQ0FBQSxDQWpDeEIsQ0FBQTs7QUFBQSxLQWtDQSxHQUF3QixJQUFBLFVBQUEsQ0FBQSxDQWxDeEIsQ0FBQTs7QUFBQSxNQW1DQSxHQUF3QixJQUFBLFdBQUEsQ0FBQSxDQW5DeEIsQ0FBQTs7QUFBQSxLQW9DQSxHQUF3QixJQUFBLFVBQUEsQ0FBQSxDQXBDeEIsQ0FBQTs7QUFBQSxpQkF1Q0EsR0FBd0IsSUFBQSxzQkFBQSxDQUFBLENBdkN4QixDQUFBOztBQUFBLFNBd0NBLEdBQXdCLElBQUEsY0FBQSxDQUFBLENBeEN4QixDQUFBOztBQUFBLEVBeUNBLEdBQXdCLElBQUEsT0FBQSxDQUFBLENBekN4QixDQUFBOztBQUFBLE1BMENBLEdBQXdCLElBQUEsV0FBQSxDQUFBLENBMUN4QixDQUFBOztBQUFBLGFBNkNBLEdBQXdCLElBQUEsa0JBQUEsQ0FBQSxDQTdDeEIsQ0FBQTs7QUFBQSxJQWdEQSxHQUF3QixJQUFBLFNBQUEsQ0FBQSxDQWhEeEIsQ0FBQSIsImZpbGUiOiJhcHBsaWNhdGlvbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIlxuY2xhc3MgQW5pbWF0aW9uTG9vcENsYXNzXG5cbiAgY29uc3RydWN0b3I6IC0+XG5cbiAgICBAcmVxdWVzdEFuaW1hdGlvbkZyYW1lKClcblxuICAgIHJldHVybiB0aGlzXG5cbiAgY2FuY2VsQW5pbWF0aW9uRnJhbWU6IC0+XG5cbiAgICB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUoQGFuaW1hdGlvbkxvb3BJZClcblxuICAgIHJldHVybiB0aGlzXG5cbiAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lOiAtPlxuXG4gICAgQGFuaW1hdGlvbkxvb3BJZCA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPT5cblxuICAgICAgQHJlcXVlc3RBbmltYXRpb25GcmFtZSgpXG5cbiAgICAgIHJldHVyblxuXG4gICAgY2FudmFzLndpZHRoID0gY2FudmFzLndpZHRoXG5cbiAgICBQYXJ0aWNsZUdlbmVyYXRvci5hbmltYXRpb25Mb29wQWN0aW9ucygpXG5cbiAgICByZXR1cm4gdGhpc1xuIiwiXG5jbGFzcyBDb25maWdDbGFzc1xuXG4gIGNoYW5jZVBhcnRpY2xlSXNUYXJnZXQ6XG4gICAgZWFzeTogICAgICA1MFxuICAgIGRpZmZpY3VsdDogOTBcblxuICBsZXZlbFVwSW50ZXJ2YWw6IDVcblxuICBtYXhMZXZlbDogNTBcblxuICBtYXhMaW5lV2lkdGg6IDVcblxuICBtYXhUYXJnZXRzQXRPbmNlOlxuICAgIGVhc3k6ICAgICAgM1xuICAgIGRpZmZpY3VsdDogNlxuXG4gIHBhcnRpY2xlR3Jvd3RoTXVsdGlwbGllcjpcbiAgICBlYXN5OiAgICAgIDEuMDVcbiAgICBkaWZmaWN1bHQ6IDEuMTBcblxuICBwYXJ0aWNsZVNwYXduQ2hhbmNlOlxuICAgIGVhc3k6ICAgICAgNjBcbiAgICBkaWZmaWN1bHQ6IDEwMFxuXG4gIHBhcnRpY2xlRGlhbWV0ZXJBc1BlcmNlbnRhZ2VPZlNjcmVlbjogMTVcblxuICBwb2ludHNQZXJQb3A6IDEwXG5cbiAgcHJvcGVydGllc1RvVXBkYXRlV2l0aERpZmZpY3VsdHk6IFtcbiAgICAncGFydGljbGVTcGF3bkNoYW5jZSdcbiAgICAnY2hhbmNlUGFydGljbGVJc1RhcmdldCdcbiAgICAncGFydGljbGVHcm93dGhNdWx0aXBsaWVyJ1xuICAgICdzaXplTWF4J1xuICAgICdtYXhUYXJnZXRzQXRPbmNlJ1xuICAgICdtaW5UYXJnZXRTaXplJ1xuICAgICd2ZWxvY2l0eU1pbidcbiAgICAndmVsb2NpdHlNYXgnXG4gICAgJ3RhcmdldFZlbG9jaXR5TXVsdGlwbGllcidcbiAgXVxuXG4gIHRhcmdldFZlbG9jaXR5TXVsdGlwbGllcjpcbiAgICBlYXN5OiAgICAgIDAuM1xuICAgIGRpZmZpY3VsdDogMC41XG5cbiAgdmVsb2NpdHlNaW46XG4gICAgZWFzeTogICAgICAtNlxuICAgIGRpZmZpY3VsdDogLTEwXG5cbiAgdmVsb2NpdHlNYXg6XG4gICAgZWFzeTogICAgICA2XG4gICAgZGlmZmljdWx0OiAxMFxuXG4gIGNvbnN0cnVjdG9yOiAtPlxuXG4gICAgYmFzZVNjcmVlbldpZHRoICAgPSBNYXRoLm1pbihib2R5LmNsaWVudFdpZHRoLCBib2R5LmNsaWVudEhlaWdodCkgLyAxMDBcbiAgICBiYXNlUGFydGljbGVXaWR0aCA9IE1hdGgucm91bmQoYmFzZVNjcmVlbldpZHRoICogQHBhcnRpY2xlRGlhbWV0ZXJBc1BlcmNlbnRhZ2VPZlNjcmVlbilcblxuICAgIEBiYXNlUGFydGljbGVTaXplID0gYmFzZVBhcnRpY2xlV2lkdGggKiBkZXZpY2VQaXhlbFJhdGlvXG5cbiAgICBAbWluVGFyZ2V0U2l6ZSA9XG4gICAgICBlYXN5OiAgICAgIEBiYXNlUGFydGljbGVTaXplICogMC43XG4gICAgICBkaWZmaWN1bHQ6IEBiYXNlUGFydGljbGVTaXplICogMC40XG5cblxuICAgIEBzaXplTWF4ID1cbiAgICAgIGVhc3k6ICAgICAgQGJhc2VQYXJ0aWNsZVNpemVcbiAgICAgIGRpZmZpY3VsdDogQGJhc2VQYXJ0aWNsZVNpemUgKiAwLjZcblxuICAgIHJldHVybiB0aGlzXG5cbiAgdXBkYXRlVmFsdWVzRm9yRGlmZmljdWx0eTogLT5cblxuICAgIGZvciBwcm9wZXJ0eSBpbiBAcHJvcGVydGllc1RvVXBkYXRlV2l0aERpZmZpY3VsdHlcbiAgICAgIHByb3BlcnR5Q29uZmlnICA9IEBbcHJvcGVydHldXG4gICAgICB2YWx1ZURpZmZlcmVuY2UgPSBwcm9wZXJ0eUNvbmZpZy5kaWZmaWN1bHQgLSBwcm9wZXJ0eUNvbmZpZy5lYXN5XG4gICAgICBsZXZlbE11bGl0cGxpZXIgPSBQbGF5U3RhdGUubGV2ZWwgLyBAbWF4TGV2ZWxcblxuICAgICAgUGxheVN0YXRlW3Byb3BlcnR5XSA9ICh2YWx1ZURpZmZlcmVuY2UgKiBsZXZlbE11bGl0cGxpZXIpICsgcHJvcGVydHlDb25maWcuZWFzeVxuXG4gICAgcmV0dXJuIHRoaXNcbiIsIlxuY2xhc3MgRGV2aWNlQ2xhc3NcblxuICBjb25zdHJ1Y3RvcjogLT5cblxuICAgIHJldHVybiB0aGlzXG4iLCJcbmNsYXNzIEdhbWVDbGFzc1xuXG4gIGNvbnN0cnVjdG9yOiAtPlxuXG4gICAgU2NlbmVzLmlkZW50KClcblxuICAgIHJldHVybiB0aGlzXG5cbiAgb3ZlcjogLT5cblxuICAgIFNjZW5lcy5nYW1lT3ZlcigpXG5cbiAgICBQbGF5U3RhdGUuc3RvcExldmVsVXBJbmNyZW1lbnQoKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBzdGFydDogLT5cblxuICAgIFBsYXlTdGF0ZS5yZXNldCgpXG4gICAgVUkucmVzZXQoKVxuICAgIElucHV0LnJlbW92ZUdhbWVTdGFydFRhcEV2ZW50SGFuZGxlcigpXG4gICAgUGFydGljbGVHZW5lcmF0b3IucmVzZXQoKVxuXG4gICAgU2NlbmVzLnBsYXlpbmcoKVxuXG4gICAgcmV0dXJuIHRoaXNcbiIsIlxuY2xhc3MgSW5wdXRDbGFzc1xuXG4gIGNvbnN0cnVjdG9yOiAtPlxuXG4gICAgQGNhbmNlbFRvdWNoTW92ZUV2ZW50cygpXG5cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciBpbnB1dFZlcmIsIChldmVudCkgLT5cbiAgICAgIGNvbnNvbGUubG9nIGV2ZW50LnRhcmdldC5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpXG4gICAgICByZXR1cm5cblxuICAgIHJldHVybiB0aGlzXG5cbiAgY2FuY2VsVG91Y2hNb3ZlRXZlbnRzOiAtPlxuXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIgJ3RvdWNobW92ZScsIChldmVudCkgLT5cbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcblxuICAgICAgcmV0dXJuXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIGdhbWVTdGFydFRhcEV2ZW50SGFuZGxlcjogKCkgLT5cblxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcblxuICAgIEdhbWUuc3RhcnQoKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBnZXRUb3VjaERhdGE6IChldmVudCkgLT5cblxuICAgIGlmIHRvdWNoRGF0YVxuICAgICAgdGFwQ29vcmRpbmF0ZXMgPSBldmVudC50b3VjaGVzWzBdXG4gICAgZWxzZVxuICAgICAgdG91Y2hEYXRhID1cbiAgICAgICAgcGFnZVg6IGV2ZW50LmNsaWVudFgsXG4gICAgICAgIHBhZ2VZOiBldmVudC5jbGllbnRZXG5cbiAgICByZXR1cm4gdG91Y2hEYXRhXG5cbiAgcmVnaXN0ZXJIYW5kbGVyOiAoc2VsZWN0b3IsIGFjdGlvbiwgY2FsbGJhY2ssIHNjZW5lcykgLT5cblxuICAgIGlmIHR5cGVvZiBzY2VuZXMgPT0gJ3N0cmluZydcbiAgICAgIHNjZW5lX3N0cmluZyA9IHNjZW5lc1xuICAgICAgc2NlbmVzID0gW3NjZW5lX3N0cmluZ11cblxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpLmFkZEV2ZW50TGlzdGVuZXIgaW5wdXRWZXJiLCAoZXZlbnQpID0+XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICBjYWxsYmFjay5hcHBseSgpIGlmIHNjZW5lcy5sZW5ndGggPT0gMCB8fCBTY2VuZXMuY3VycmVudCBpbiBzY2VuZXNcbiAgICAgIHJldHVyblxuXG4gICAgcmV0dXJuIHRoaXNcblxuICByZW1vdmVHYW1lU3RhcnRUYXBFdmVudEhhbmRsZXI6IC0+XG5cbiAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUV2ZW50TGlzdGVuZXIoaW5wdXRWZXJiLCBAZ2FtZVN0YXJ0VGFwRXZlbnRIYW5kbGVyKVxuXG4gICAgcmV0dXJuIHRoaXNcbiIsIlxuY2xhc3MgUGFydGljbGVDbGFzc1xuXG4gIGRlc3Ryb3lpbmc6IGZhbHNlXG4gIHNpemU6ICAgICAgIDFcblxuICBjb25zdHJ1Y3RvcjogLT5cblxuICAgIHIgPSBVdGlscy5yYW5kb21JbnRlZ2VyKDAsIDIwMClcbiAgICBnID0gVXRpbHMucmFuZG9tSW50ZWdlcigwLCAyMDApXG4gICAgYiA9IFV0aWxzLnJhbmRvbUludGVnZXIoMCwgMjAwKVxuICAgIGEgPSBVdGlscy5yYW5kb20oMC43NSwgMSlcblxuICAgIEBjb2xvciAgICAgID0gXCJyZ2JhKCN7cn0sICN7Z30sICN7Yn0sICN7YX0pXCJcbiAgICBAZmluYWxTaXplICA9IFV0aWxzLnJhbmRvbUludGVnZXIoMCwgUGxheVN0YXRlLnNpemVNYXgpXG4gICAgQGlkICAgICAgICAgPSBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHIoMiwgNSlcbiAgICBAaXNUYXJnZXQgICA9IEBkZXRlcm1pbmVUYXJnZXRQYXJ0aWNsZSgpXG4gICAgQHBvc2l0aW9uICAgPVxuICAgICAgeDogUGFydGljbGVHZW5lcmF0b3IucGFydGljbGVzT3JpZ2luLnhcbiAgICAgIHk6IFBhcnRpY2xlR2VuZXJhdG9yLnBhcnRpY2xlc09yaWdpbi55XG4gICAgQHZlbG9jaXR5ICAgPVxuICAgICAgeDogVXRpbHMucmFuZG9tKFBsYXlTdGF0ZS52ZWxvY2l0eU1pbiwgUGxheVN0YXRlLnZlbG9jaXR5TWF4KVxuICAgICAgeTogVXRpbHMucmFuZG9tKFBsYXlTdGF0ZS52ZWxvY2l0eU1pbiwgUGxheVN0YXRlLnZlbG9jaXR5TWF4KVxuXG4gICAgaWYgQGlzVGFyZ2V0XG4gICAgICBAY29sb3IgICAgID0gXCJyZ2JhKCN7cn0sICN7Z30sICN7Yn0sIDAuOClcIlxuICAgICAgQGZpbmFsU2l6ZSA9IFV0aWxzLnJhbmRvbUludGVnZXIoUGxheVN0YXRlLm1pblRhcmdldFNpemUsIFBsYXlTdGF0ZS5zaXplTWF4KVxuXG4gICAgICBAdmVsb2NpdHkueCAqPSBQbGF5U3RhdGUudGFyZ2V0VmVsb2NpdHlNdWx0aXBsaWVyXG4gICAgICBAdmVsb2NpdHkueSAqPSBQbGF5U3RhdGUudGFyZ2V0VmVsb2NpdHlNdWx0aXBsaWVyXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIGRldGVybWluZVRhcmdldFBhcnRpY2xlOiAtPlxuXG4gICAgaXNUYXJnZXQgPSBmYWxzZVxuXG4gICAgaWYgUGFydGljbGVHZW5lcmF0b3IucGFydGljbGVzVG9UZXN0Rm9yVGFwcy5sZW5ndGggPCBQbGF5U3RhdGUubWF4VGFyZ2V0c0F0T25jZVxuICAgICAgaXNUYXJnZXQgPSBVdGlscy5yYW5kb21QZXJjZW50YWdlKCkgPCBQbGF5U3RhdGUuY2hhbmNlUGFydGljbGVJc1RhcmdldFxuXG4gICAgcmV0dXJuIGlzVGFyZ2V0XG5cbiAgZHJhdzogLT5cblxuICAgIGlmIEBvdXRzaWRlQ2FudmFzQm91bmRzKClcbiAgICAgIFBhcnRpY2xlR2VuZXJhdG9yLnBhcnRpY2xlc1RvRGVsZXRlLnB1c2goQGlkKVxuXG4gICAgICByZXR1cm5cblxuICAgIGlmIEBpc1RhcmdldFxuICAgICAgQGxpbmVXaWR0aCA9IEBzaXplIC8gMTBcblxuICAgICAgaWYgQGxpbmVXaWR0aCA+IENvbmZpZy5tYXhMaW5lV2lkdGhcbiAgICAgICAgQGxpbmVXaWR0aCA9IENvbmZpZy5tYXhMaW5lV2lkdGhcblxuICAgICAgY29udGV4dC5maWxsU3R5bGUgPSAncmdiYSgyNDcsIDI0NywgMjQ3LCAwLjkpJ1xuICAgICAgY29udGV4dC5saW5lV2lkdGggPSBAbGluZVdpZHRoXG5cbiAgICBjb250ZXh0LmJlZ2luUGF0aCgpXG4gICAgY29udGV4dC5hcmMoQHBvc2l0aW9uLngsIEBwb3NpdGlvbi55LCBAaGFsZiwgMCwgTWF0aC5QSSAqIDIsIHRydWUpXG4gICAgY29udGV4dC5maWxsKClcbiAgICBjb250ZXh0LnN0cm9rZSgpIGlmIEBpc1RhcmdldFxuICAgIGNvbnRleHQuY2xvc2VQYXRoKClcblxuICAgIHJldHVybiB0aGlzXG5cbiAgb3V0c2lkZUNhbnZhc0JvdW5kczogLT5cblxuICAgIGJleW9uZEJvdW5kc1ggPSBAcG9zaXRpb24ueCA8IC0oQGZpbmFsU2l6ZSkgb3IgQHBvc2l0aW9uLnggPiBjYW52YXMud2lkdGggICsgQGZpbmFsU2l6ZVxuICAgIGJleW9uZEJvdW5kc1kgPSBAcG9zaXRpb24ueSA8IC0oQGZpbmFsU2l6ZSkgb3IgQHBvc2l0aW9uLnkgPiBjYW52YXMuaGVpZ2h0ICsgQGZpbmFsU2l6ZVxuXG4gICAgcmV0dXJuIGJleW9uZEJvdW5kc1ggb3IgYmV5b25kQm91bmRzWVxuXG4gIHVwZGF0ZVZhbHVlczogLT5cblxuICAgIGlmIEBkZXN0cm95aW5nXG4gICAgICBzaHJpbmtNdWx0aXBsaWVyID0gaWYgUGxheVN0YXRlLnBsYXlpbmcgdGhlbiAwLjcgZWxzZSAwLjlcblxuICAgICAgQHNpemUgKj0gc2hyaW5rTXVsdGlwbGllclxuICAgIGVsc2VcbiAgICAgIGlmIEBzaXplIDwgQGZpbmFsU2l6ZVxuICAgICAgICBAc2l6ZSAqPSBQbGF5U3RhdGUucGFydGljbGVHcm93dGhNdWx0aXBsaWVyXG5cbiAgICAgIGlmIEBzaXplID4gQGZpbmFsU2l6ZVxuICAgICAgICBAc2l6ZSA9IEBmaW5hbFNpemVcblxuICAgIEBoYWxmID0gQHNpemUgLyAyXG5cbiAgICBAcG9zaXRpb24ueCArPSBAdmVsb2NpdHkueFxuICAgIEBwb3NpdGlvbi55ICs9IEB2ZWxvY2l0eS55XG5cbiAgICBAZHJhdygpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHdhc1RhcHBlZDogKHRvdWNoRGF0YSkgLT5cblxuICAgIHRhcFggICAgICA9IHRvdWNoRGF0YS5wYWdlWCAqIGRldmljZVBpeGVsUmF0aW9cbiAgICB0YXBZICAgICAgPSB0b3VjaERhdGEucGFnZVkgKiBkZXZpY2VQaXhlbFJhdGlvXG4gICAgZGlzdGFuY2VYID0gdGFwWCAtIEBwb3NpdGlvbi54XG4gICAgZGlzdGFuY2VZID0gdGFwWSAtIEBwb3NpdGlvbi55XG4gICAgcmFkaXVzICAgID0gQGhhbGZcblxuICAgIHJldHVybiAoZGlzdGFuY2VYICogZGlzdGFuY2VYKSArIChkaXN0YW5jZVkgKiBkaXN0YW5jZVkpIDwgKEBoYWxmICogQGhhbGYpXG4iLCJcbmNsYXNzIFBhcnRpY2xlR2VuZXJhdG9yQ2xhc3NcblxuICBjb25zdHJ1Y3RvcjogLT5cblxuICAgIEBwYXJ0aWNsZXNBcnJheSAgICAgICAgID0gW11cbiAgICBAcGFydGljbGVzQXJyYXlJZHMgICAgICA9IFtdXG4gICAgQHBhcnRpY2xlc1RvRGVsZXRlICAgICAgPSBbXVxuICAgIEBwYXJ0aWNsZXNUb1Rlc3RGb3JUYXBzID0gW11cblxuICAgIEBwYXJ0aWNsZXNPcmlnaW4gPVxuICAgICAgeDogY2FudmFzLndpZHRoICAvIDJcbiAgICAgIHk6IGNhbnZhcy5oZWlnaHQgLyAyXG5cbiAgICBAcmVnaXN0ZXJQYXJ0aWNsZVRhcERldGVjdGlvbkhhbmRsZXIoKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBhbmltYXRpb25Mb29wQWN0aW9uczogLT5cblxuICAgIGlmIFBsYXlTdGF0ZS5wbGF5aW5nXG4gICAgICBAZ2VuZXJhdGVQYXJ0aWNsZSgpXG5cbiAgICBAdXBkYXRlUGFydGljbGVzVmFsdWVzKClcbiAgICBAcmVtb3ZlUGFydGljbGVzQWZ0ZXJUYXAoKVxuXG4gICAgaWYgQHBhcnRpY2xlc1RvRGVsZXRlLmxlbmd0aCA+IDBcbiAgICAgIEBkZXN0cm95UGFydGljbGVzT3V0c2lkZUNhbnZhc0JvdW5kcygpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIGRlc3Ryb3lQYXJ0aWNsZXNPdXRzaWRlQ2FudmFzQm91bmRzOiAtPlxuXG4gICAgQHBhcnRpY2xlc1RvRGVsZXRlLm1hcCAocGFydGljbGVJZCkgPT5cbiAgICAgIHBhcnRpY2xlSW5kZXggPSBAcGFydGljbGVzQXJyYXlJZHMuaW5kZXhPZihwYXJ0aWNsZUlkKVxuICAgICAgcGFydGljbGUgICAgICA9IEBwYXJ0aWNsZXNBcnJheVtwYXJ0aWNsZUluZGV4XVxuXG4gICAgICBpZiBwYXJ0aWNsZT9cbiAgICAgICAgQGdhbWVPdmVyKCkgaWYgcGFydGljbGUuaXNUYXJnZXRcbiAgICAgICAgQHJlbW92ZVBhcnRpY2xlKHBhcnRpY2xlKVxuXG4gICAgQHBhcnRpY2xlc1RvRGVsZXRlID0gW11cblxuICAgIHJldHVybiB0aGlzXG5cbiAgZ2FtZU92ZXI6IC0+XG5cbiAgICBAc3RvcCgpXG5cbiAgICBAcGFydGljbGVzQXJyYXkubWFwIChwYXJ0aWNsZSkgPT5cbiAgICAgIHBhcnRpY2xlLmRlc3Ryb3lpbmcgPSB0cnVlXG5cbiAgICBQbGF5U3RhdGUucGFydGljbGVTcGF3bkNoYW5jZSA9IDBcblxuICAgIEdhbWUub3ZlcigpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIGdlbmVyYXRlUGFydGljbGU6IC0+XG5cbiAgICBpZiBVdGlscy5yYW5kb21QZXJjZW50YWdlKCkgPCBQbGF5U3RhdGUucGFydGljbGVTcGF3bkNoYW5jZVxuICAgICAgcGFydGljbGUgPSBuZXcgUGFydGljbGVDbGFzcygpXG5cbiAgICAgIEBwYXJ0aWNsZXNBcnJheS5wdXNoKHBhcnRpY2xlKVxuICAgICAgQHBhcnRpY2xlc0FycmF5SWRzLnB1c2gocGFydGljbGUuaWQpXG5cbiAgICAgIGlmIHBhcnRpY2xlLmlzVGFyZ2V0XG4gICAgICAgIEBwYXJ0aWNsZXNUb1Rlc3RGb3JUYXBzLnVuc2hpZnQocGFydGljbGUuaWQpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHBhcnRpY2xlVGFwRGV0ZWN0aW9uSGFuZGxlcjogKCkgLT5cblxuICAgIHRhcmdldEhpdCA9IGZhbHNlXG4gICAgcGFydGljbGUgID0gZmFsc2VcblxuICAgIEBwYXJ0aWNsZXNUb1Rlc3RGb3JUYXBzLm1hcCAocGFydGljbGVJZCkgPT5cbiAgICAgIHBhcnRpY2xlSW5kZXggPSBAcGFydGljbGVzQXJyYXlJZHMuaW5kZXhPZihwYXJ0aWNsZUlkKVxuICAgICAgcGFydGljbGUgICAgICA9IEBwYXJ0aWNsZXNBcnJheVtwYXJ0aWNsZUluZGV4XVxuICAgICAgdG91Y2hEYXRhICAgICA9IElucHV0LmdldFRvdWNoRGF0YShldmVudClcblxuICAgICAgaWYgcGFydGljbGU/IGFuZCBwYXJ0aWNsZS53YXNUYXBwZWQodG91Y2hEYXRhKVxuICAgICAgICBkZWxldGlvbkluZGV4ICAgICAgID0gQHBhcnRpY2xlc1RvVGVzdEZvclRhcHMuaW5kZXhPZihwYXJ0aWNsZUlkKVxuICAgICAgICBwYXJ0aWNsZS5kZXN0cm95aW5nID0gdHJ1ZVxuICAgICAgICB0YXJnZXRIaXQgICAgICAgICAgID0gdHJ1ZVxuXG4gICAgICAgIEBwYXJ0aWNsZXNUb1Rlc3RGb3JUYXBzLnNwbGljZShkZWxldGlvbkluZGV4LCAxKVxuXG4gICAgICAgIHJldHVyblxuXG4gICAgUGxheVN0YXRlLnVwZGF0ZUNvbWJvTXVsdGlwbGllcih0YXJnZXRIaXQpXG5cbiAgICBQbGF5U3RhdGUudXBkYXRlU2NvcmUocGFydGljbGUuc2l6ZSwgcGFydGljbGUuZmluYWxTaXplKSBpZiB0YXJnZXRIaXRcblxuICAgIHJldHVybiB0aGlzXG5cbiAgcmVnaXN0ZXJQYXJ0aWNsZVRhcERldGVjdGlvbkhhbmRsZXI6IC0+XG5cbiAgICBJbnB1dC5yZWdpc3RlckhhbmRsZXIgJy51aS1wbGF5aW5nJywgaW5wdXRWZXJiLCAtPlxuICAgICAgUGFydGljbGVHZW5lcmF0b3IucGFydGljbGVUYXBEZXRlY3Rpb25IYW5kbGVyKClcbiAgICAsIFsncGxheWluZyddXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHJlbW92ZVBhcnRpY2xlOiAocGFydGljbGUpIC0+XG5cbiAgICBpZCAgICA9IHBhcnRpY2xlLmlkXG4gICAgaW5kZXggPSBAcGFydGljbGVzQXJyYXlJZHMuaW5kZXhPZihpZClcblxuICAgIEBwYXJ0aWNsZXNBcnJheS5zcGxpY2UoaW5kZXgsIDEpXG4gICAgQHBhcnRpY2xlc0FycmF5SWRzLnNwbGljZShpbmRleCwgMSlcblxuICAgIHJldHVybiB0aGlzXG5cbiAgcmVtb3ZlUGFydGljbGVzQWZ0ZXJUYXA6IC0+XG5cbiAgICBAcGFydGljbGVzQXJyYXkubWFwIChwYXJ0aWNsZSkgPT5cbiAgICAgIEByZW1vdmVQYXJ0aWNsZShwYXJ0aWNsZSkgaWYgcGFydGljbGUuc2l6ZSA8IDFcblxuICAgICAgcmV0dXJuXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHJlc2V0OiAtPlxuXG4gICAgQHBhcnRpY2xlc0FycmF5ICAgICAgICAgPSBbXVxuICAgIEBwYXJ0aWNsZXNBcnJheUlkcyAgICAgID0gW11cbiAgICBAcGFydGljbGVzVG9EZWxldGUgICAgICA9IFtdXG4gICAgQHBhcnRpY2xlc1RvVGVzdEZvclRhcHMgPSBbXVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBzdG9wOiAtPlxuXG4gICAgUGxheVN0YXRlLnVwZGF0ZShmYWxzZSlcbiAgICBQbGF5U3RhdGUuc3RvcExldmVsVXBJbmNyZW1lbnQoKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICB1cGRhdGVQYXJ0aWNsZXNWYWx1ZXM6IC0+XG5cbiAgICBAcGFydGljbGVzQXJyYXkubWFwIChwYXJ0aWNsZSkgPT5cbiAgICAgIGNvbnRleHQuZmlsbFN0eWxlICAgPSBwYXJ0aWNsZS5jb2xvclxuICAgICAgY29udGV4dC5zdHJva2VTdHlsZSA9IHBhcnRpY2xlLmNvbG9yXG5cbiAgICAgIHBhcnRpY2xlLnVwZGF0ZVZhbHVlcygpXG5cbiAgICAgIHJldHVyblxuXG4gICAgcmV0dXJuIHRoaXNcbiIsIlxuY2xhc3MgUGxheVN0YXRlQ2xhc3NcblxuICBkZWZhdWx0czpcbiAgICBjb21ib011bHRpcGxpZXI6IDBcbiAgICBsZXZlbDogICAgICAgICAgIDFcbiAgICBzY29yZTogICAgICAgICAgIDBcblxuICByZXNldDogLT5cblxuICAgIEBjaGFuY2VQYXJ0aWNsZUlzVGFyZ2V0ICAgPSBDb25maWcuY2hhbmNlUGFydGljbGVJc1RhcmdldC5lYXN5XG4gICAgQGNvbWJvTXVsdGlwbGllciAgICAgICAgICA9IEBkZWZhdWx0cy5jb21ib011bHRpcGxpZXJcbiAgICBAbGV2ZWwgICAgICAgICAgICAgICAgICAgID0gQGRlZmF1bHRzLmxldmVsXG4gICAgQG1heFRhcmdldHNBdE9uY2UgICAgICAgICA9IENvbmZpZy5tYXhUYXJnZXRzQXRPbmNlLmVhc3lcbiAgICBAbWluVGFyZ2V0U2l6ZSAgICAgICAgICAgID0gQ29uZmlnLm1pblRhcmdldFNpemUuZWFzeVxuICAgIEBwYXJ0aWNsZUdyb3d0aE11bHRpcGxpZXIgPSBDb25maWcucGFydGljbGVHcm93dGhNdWx0aXBsaWVyLmVhc3lcbiAgICBAcGFydGljbGVTcGF3bkNoYW5jZSAgICAgID0gQ29uZmlnLnBhcnRpY2xlU3Bhd25DaGFuY2UuZWFzeVxuICAgIEBzY29yZSAgICAgICAgICAgICAgICAgICAgPSBAZGVmYXVsdHMuc2NvcmVcbiAgICBAc2l6ZU1heCAgICAgICAgICAgICAgICAgID0gQ29uZmlnLnNpemVNYXguZWFzeVxuICAgIEB0YXJnZXRWZWxvY2l0eU11bHRpcGxpZXIgPSBDb25maWcudGFyZ2V0VmVsb2NpdHlNdWx0aXBsaWVyLmVhc3lcbiAgICBAdmVsb2NpdHlNaW4gICAgICAgICAgICAgID0gQ29uZmlnLnZlbG9jaXR5TWluLmVhc3lcbiAgICBAdmVsb2NpdHlNYXggICAgICAgICAgICAgID0gQ29uZmlnLnZlbG9jaXR5TWF4LmVhc3lcblxuICAgIEB1cGRhdGUodHJ1ZSlcblxuICAgIENvbmZpZy51cGRhdGVWYWx1ZXNGb3JEaWZmaWN1bHR5KClcblxuICAgIEBzZXR1cExldmVsVXBJbmNyZW1lbnQoKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBzdG9wTGV2ZWxVcEluY3JlbWVudDogLT5cblxuICAgIHdpbmRvdy5jbGVhckludGVydmFsKEBsZXZlbFVwQ291bnRlcilcblxuICAgIHJldHVybiB0aGlzXG5cbiAgc2V0dXBMZXZlbFVwSW5jcmVtZW50OiAtPlxuXG4gICAgQGxldmVsVXBDb3VudGVyID0gd2luZG93LnNldEludGVydmFsID0+XG5cbiAgICAgIEB1cGRhdGVMZXZlbCgpXG5cbiAgICAgIHJldHVyblxuXG4gICAgLCBDb25maWcubGV2ZWxVcEludGVydmFsICogMTAwMFxuXG4gICAgcmV0dXJuIHRoaXNcblxuICB1cGRhdGVDb21ib011bHRpcGxpZXI6ICh0YXJnZXRIaXQpIC0+XG5cbiAgICBAY29tYm9NdWx0aXBsaWVyID0gaWYgdGFyZ2V0SGl0IHRoZW4gQGNvbWJvTXVsdGlwbGllciArIDEgZWxzZSBAZGVmYXVsdHMuY29tYm9NdWx0aXBsaWVyXG5cbiAgICBVSS51cGRhdGVDb21ib011bHRpcGxpZXJDb3VudGVyKClcblxuICAgIHJldHVybiB0aGlzXG5cbiAgdXBkYXRlOiAobmV3U3RhdGUpIC0+XG5cbiAgICBAcGxheWluZyA9IG5ld1N0YXRlXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHVwZGF0ZUxldmVsOiAtPlxuXG4gICAgQGxldmVsICs9IDFcblxuICAgIGlmIEBsZXZlbCA+PSBDb25maWcubWF4TGV2ZWxcbiAgICAgIHdpbmRvdy5jbGVhckludGVydmFsKEBsZXZlbFVwQ291bnRlcilcblxuICAgIFVJLnVwZGF0ZUxldmVsQ291bnRlcigpXG4gICAgQ29uZmlnLnVwZGF0ZVZhbHVlc0ZvckRpZmZpY3VsdHkoKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICB1cGRhdGVTY29yZTogKHNpemVXaGVuVGFwcGVkLCBzaXplV2hlbkZ1bGx5R3Jvd24pIC0+XG5cbiAgICAjKChkZWZhdWx0U2NvcmVQZXJQb3AgKyAoMTAwIC0gKChzaXplV2hlblRhcHBlZCAvIHNpemVXaGVuRnVsbHlHcm93bikgKiAxMDApKSkgKiBjb21ib011bHRpcGxpZXIpICogKGxldmVsTnVtYmVyICsgMSlcblxuICAgIHRhcmdldFNpemVCb251cyA9IE1hdGgucm91bmQoMTAwIC0gKChzaXplV2hlblRhcHBlZCAvIHNpemVXaGVuRnVsbHlHcm93bikgKiAxMDApKVxuICAgIHBvcFBvaW50VmFsdWUgICA9IENvbmZpZy5wb2ludHNQZXJQb3AgKyB0YXJnZXRTaXplQm9udXNcbiAgICBsZXZlbE11bHRpcGxpZXIgPSBAbGV2ZWwgKyAxXG5cbiAgICBAc2NvcmUgKz0gKHBvcFBvaW50VmFsdWUgKiBAY29tYm9NdWx0aXBsaWVyKSAqIChsZXZlbE11bHRpcGxpZXIpXG5cbiAgICBVSS51cGRhdGVTY29yZUNvdW50ZXIoKVxuXG4gICAgcmV0dXJuIHRoaXNcbiIsIlxuY2xhc3MgU2NlbmVzQ2xhc3NcblxuICBAY3VycmVudCA9IG51bGxcblxuICBjcmVkaXRzOiAtPlxuXG4gICAgQGN1cnJlbnQgPSAnY3JlZGl0cydcblxuICAgIFVJLnVwZGF0ZUJvZHlDbGFzcygnY3JlZGl0cycpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIGdhbWVPdmVyOiAtPlxuXG4gICAgQGN1cnJlbnQgPSAnZ2FtZS1vdmVyJ1xuXG4gICAgVUkudXBkYXRlQm9keUNsYXNzKCdnYW1lLW92ZXInKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBsZWFkZXJib2FyZDogLT5cblxuICAgIEBjdXJyZW50ID0gJ2xlYWRlcmJvYXJkJ1xuXG4gICAgcmV0dXJuIHRoaXNcblxuICBwbGF5aW5nOiAtPlxuXG4gICAgQGN1cnJlbnQgPSAncGxheWluZydcblxuICAgIFVJLnVwZGF0ZUJvZHlDbGFzcygncGxheWluZycpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIGlkZW50OiAtPlxuXG4gICAgQGN1cnJlbnQgPSAnaWRlbnQnXG5cbiAgICBVSS51cGRhdGVCb2R5Q2xhc3MoJ2lkZW50JylcblxuICAgIHdpbmRvdy5zZXRUaW1lb3V0ID0+XG4gICAgICBAdGl0bGUoKVxuICAgICwgNTAwMFxuXG4gICAgcmV0dXJuIHRoaXNcblxuICB0aXRsZTogLT5cblxuICAgIEBjdXJyZW50ID0gJ3RpdGxlJ1xuXG4gICAgVUkudXBkYXRlQm9keUNsYXNzKCd0aXRsZScpXG5cbiAgICByZXR1cm4gdGhpc1xuIiwiXG5jbGFzcyBVSUNsYXNzXG5cbiAgY29uc3RydWN0b3I6IC0+XG5cbiAgICBAc2V0dXBCYXNpY0ludGVyZmFjZUV2ZW50cygpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHJlc2V0OiAtPlxuXG4gICAgQGxldmVsQ291bnRlciAgICAgICAgICAgPSBVdGlscy4kKCcuaHVkLXZhbHVlLWxldmVsJylcbiAgICBAc2NvcmVDb3VudGVyICAgICAgICAgICA9IFV0aWxzLiQoJy5odWQtdmFsdWUtc2NvcmUnKVxuICAgIEBjb21ib011bHRpcGxpZXJDb3VudGVyID0gVXRpbHMuJCgnLmh1ZC12YWx1ZS1jb21ibycpXG4gICAgQHBsYXlBZ2FpbiAgICAgICAgICAgICAgPSBVdGlscy4kKCcucGxheS1hZ2FpbicpXG5cbiAgICBAdXBkYXRlQ29tYm9NdWx0aXBsaWVyQ291bnRlcigpXG4gICAgQHVwZGF0ZUxldmVsQ291bnRlcigpXG4gICAgQHVwZGF0ZVNjb3JlQ291bnRlcigpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHNldHVwQmFzaWNJbnRlcmZhY2VFdmVudHM6IC0+XG5cbiAgICBJbnB1dC5yZWdpc3RlckhhbmRsZXIgJy5nYW1lLWxvZ28nLCBpbnB1dFZlcmIsIC0+XG4gICAgICBJbnB1dC5nYW1lU3RhcnRUYXBFdmVudEhhbmRsZXIoKVxuICAgICwgWyd0aXRsZSddXG5cbiAgICBJbnB1dC5yZWdpc3RlckhhbmRsZXIgJy5wbGF5LWFnYWluJywgaW5wdXRWZXJiLCAtPlxuICAgICAgSW5wdXQuZ2FtZVN0YXJ0VGFwRXZlbnRIYW5kbGVyKClcbiAgICAsIFsnZ2FtZS1vdmVyJ11cblxuICAgIHJldHVybiB0aGlzXG5cbiAgdXBkYXRlQm9keUNsYXNzOiAoY2xhc3NOYW1lKSAtPlxuXG4gICAgYm9keS5jbGFzc05hbWUgPSAnJ1xuICAgIGJvZHkuY2xhc3NMaXN0LmFkZCgnc2NlbmUtJyArIGNsYXNzTmFtZSlcblxuICAgIHJldHVybiB0aGlzXG5cbiAgdXBkYXRlQ29tYm9NdWx0aXBsaWVyQ291bnRlcjogLT5cblxuICAgIFV0aWxzLnVwZGF0ZVVJVGV4dE5vZGUoQGNvbWJvTXVsdGlwbGllckNvdW50ZXIsIFBsYXlTdGF0ZS5jb21ib011bHRpcGxpZXIpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHVwZGF0ZUxldmVsQ291bnRlcjogLT5cblxuICAgIFV0aWxzLnVwZGF0ZVVJVGV4dE5vZGUoQGxldmVsQ291bnRlciwgUGxheVN0YXRlLmxldmVsKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICB1cGRhdGVTY29yZUNvdW50ZXI6IC0+XG5cbiAgICBzY29yZVRvRm9ybWF0ID0gVXRpbHMuZm9ybWF0V2l0aENvbW1hKFBsYXlTdGF0ZS5zY29yZSlcblxuICAgIFV0aWxzLnVwZGF0ZVVJVGV4dE5vZGUoQHNjb3JlQ291bnRlciwgc2NvcmVUb0Zvcm1hdClcblxuICAgIHJldHVybiB0aGlzXG4iLCJcbmNsYXNzIFV0aWxzQ2xhc3NcblxuICAkOiAoc2VsZWN0b3IpIC0+XG4gICAgaWYgc2VsZWN0b3Iuc3Vic3RyKDAsIDEpID09ICcjJ1xuICAgICAgcmV0dXJuIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHNlbGVjdG9yKVxuXG4gICAgZWxzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcilcblxuICAgIGlmIGVscy5sZW5ndGggPT0gMVxuICAgICAgcmV0dXJuIGVsc1swXVxuXG4gICAgcmV0dXJuIGVsc1xuXG4gIGNvcnJlY3RWYWx1ZUZvckRQUjogKHZhbHVlLCBpbnRlZ2VyID0gZmFsc2UpIC0+XG5cbiAgICB2YWx1ZSAqPSBkZXZpY2VQaXhlbFJhdGlvXG5cbiAgICBpZiBpbnRlZ2VyXG4gICAgICB2YWx1ZSA9IE1hdGgucm91bmQodmFsdWUpXG5cbiAgICByZXR1cm4gdmFsdWVcblxuICBmb3JtYXRXaXRoQ29tbWE6IChudW0pIC0+XG5cbiAgICByZXR1cm4gbnVtLnRvU3RyaW5nKCkucmVwbGFjZSgvXFxCKD89KFxcZHszfSkrKD8hXFxkKSkvZywgXCIsXCIpXG5cbiAgcmFuZG9tOiAobWluLCBtYXgpIC0+XG5cbiAgICBpZiBtaW4gPT0gdW5kZWZpbmVkXG4gICAgICBtaW4gPSAwXG4gICAgICBtYXggPSAxXG4gICAgZWxzZSBpZiBtYXggPT0gdW5kZWZpbmVkXG4gICAgICBtYXggPSBtaW5cbiAgICAgIG1pbiA9IDBcblxuICAgIHJldHVybiAoTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4pKSArIG1pbjtcblxuICByYW5kb21Db2xvcjogKGFscGhhID0gZmFsc2UpIC0+XG5cbiAgICBjb2xvcnMgPVxuICAgICAgcjogdGhpcy5yYW5kb21JbnRlZ2VyKDAsIDIwMClcbiAgICAgIGc6IHRoaXMucmFuZG9tSW50ZWdlcigwLCAyMDApXG4gICAgICBiOiB0aGlzLnJhbmRvbUludGVnZXIoMCwgMjAwKVxuICAgICAgYTogaWYgIWFscGhhIHRoZW4gdGhpcy5yYW5kb20oMC43NSwgMSkgZWxzZSBhbHBoYVxuXG4gICAgcmV0dXJuICdyZ2JhKCcgKyBjb2xvcnMuciArICcsICcgKyBjb2xvcnMuZyArICcsICcgKyBjb2xvcnMuYiArICcsICcgKyBjb2xvcnMuYSArICcpJ1xuXG4gIHJhbmRvbUludGVnZXI6IChtaW4sIG1heCkgLT5cblxuICAgIGlmIG1heCA9PSB1bmRlZmluZWRcbiAgICAgIG1heCA9IG1pblxuICAgICAgbWluID0gMFxuXG4gICAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChtYXggKyAxIC0gbWluKSkgKyBtaW5cblxuICByYW5kb21QZXJjZW50YWdlOiAtPlxuXG4gICAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDEwMClcblxuICB1cGRhdGVVSVRleHROb2RlOiAoZWxlbWVudCwgdmFsdWUpIC0+XG5cbiAgICBlbGVtZW50LmlubmVySFRNTCA9IHZhbHVlXG5cbiAgICByZXR1cm4gdGhpc1xuIiwiXG5kZWJ1ZyA9IHRydWVcblxuYW5kcm9pZCAgICAgICAgPSBpZiBuYXZpZ2F0b3IudXNlckFnZW50Lm1hdGNoKC9hbmRyb2lkL2kpIHRoZW4gdHJ1ZSBlbHNlIGZhbHNlXG5ib2R5ICAgICAgICAgICA9IGRvY3VtZW50LmJvZHlcbmNhbnZhcyAgICAgICAgID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmNhbnZhcycpXG5oYXNUb3VjaEV2ZW50cyA9IHdpbmRvdy5oYXNPd25Qcm9wZXJ0eSgnb250b3VjaHN0YXJ0JykgfHwgd2luZG93Lmhhc093blByb3BlcnR5KCdvbm1zZ2VzdHVyZWNoYW5nZScpXG5pbnB1dFZlcmIgICAgICA9IGlmIGhhc1RvdWNoRXZlbnRzIHRoZW4gJ3RvdWNoc3RhcnQnIGVsc2UgJ2NsaWNrJ1xuXG5jYW52YXMuY2xhc3NOYW1lID0gJ2NhbnZhcydcbmNhbnZhcy53aWR0aCAgICAgPSBib2R5LmNsaWVudFdpZHRoXG5jYW52YXMuaGVpZ2h0ICAgID0gYm9keS5jbGllbnRIZWlnaHRcblxuY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpXG5cbmNvbnRleHQuZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gJ3NvdXJjZS1hdG9wJ1xuXG5kZXZpY2VQaXhlbFJhdGlvICA9IHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvIHx8IDFcbmJhY2tpbmdTdG9yZVJhdGlvID0gY29udGV4dC53ZWJraXRCYWNraW5nU3RvcmVQaXhlbFJhdGlvIHx8IGNvbnRleHQuYmFja2luZ1N0b3JlUGl4ZWxSYXRpbyB8fCAxXG5yYXRpbyAgICAgICAgICAgICA9IGRldmljZVBpeGVsUmF0aW8gLyBiYWNraW5nU3RvcmVSYXRpb1xuXG5pZiBkZXZpY2VQaXhlbFJhdGlvICE9IGJhY2tpbmdTdG9yZVJhdGlvXG4gIG9sZFdpZHRoICA9IGNhbnZhcy53aWR0aFxuICBvbGRIZWlnaHQgPSBjYW52YXMuaGVpZ2h0XG5cbiAgY2FudmFzLndpZHRoICA9IG9sZFdpZHRoICAqIHJhdGlvXG4gIGNhbnZhcy5oZWlnaHQgPSBvbGRIZWlnaHQgKiByYXRpb1xuXG4gIGNhbnZhcy5zdHlsZS53aWR0aCAgPSBcIiN7b2xkV2lkdGh9cHhcIlxuICBjYW52YXMuc3R5bGUuaGVpZ2h0ID0gXCIje29sZEhlaWdodH1weFwiXG5cbiAgY29udGV4dC5zY2FsZShyYXRpbywgcmF0aW8pXG5cbiMgU2V0IGVudmlyb25tZW50IGFuZCBiYXNlIGNvbmZpZyBldGNcbkRldmljZSAgICAgICAgICAgID0gbmV3IERldmljZUNsYXNzKClcblV0aWxzICAgICAgICAgICAgID0gbmV3IFV0aWxzQ2xhc3MoKVxuQ29uZmlnICAgICAgICAgICAgPSBuZXcgQ29uZmlnQ2xhc3MoKVxuSW5wdXQgICAgICAgICAgICAgPSBuZXcgSW5wdXRDbGFzcygpXG5cbiMgTG9hZCB0aGUgZ2FtZSBsb2dpYyBhbmQgYWxsIHRoYXRcblBhcnRpY2xlR2VuZXJhdG9yID0gbmV3IFBhcnRpY2xlR2VuZXJhdG9yQ2xhc3MoKVxuUGxheVN0YXRlICAgICAgICAgPSBuZXcgUGxheVN0YXRlQ2xhc3MoKVxuVUkgICAgICAgICAgICAgICAgPSBuZXcgVUlDbGFzcygpXG5TY2VuZXMgICAgICAgICAgICA9IG5ldyBTY2VuZXNDbGFzcygpXG5cbiMgU2V0IG9mZiB0aGUgY2FudmFzIGFuaW1hdGlvbiBsb29wXG5BbmltYXRpb25Mb29wICAgICA9IG5ldyBBbmltYXRpb25Mb29wQ2xhc3MoKVxuXG4jIFN0YXJ0IHRoZSBhY3R1YWwgZ2FtZVxuR2FtZSAgICAgICAgICAgICAgPSBuZXcgR2FtZUNsYXNzKClcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==