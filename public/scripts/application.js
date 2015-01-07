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

  InputClass.prototype.registerHandler = function(selector, scenes, callback) {
    var scene_string;
    if (typeof scenes === 'string') {
      scene_string = scenes;
      scenes = [scene_string];
    }
    document.querySelector(selector).addEventListener(inputVerb, (function(_this) {
      return function(event) {
        var _ref;
        event.preventDefault();
        if (_ref = Scenes.current, __indexOf.call(scenes, _ref) >= 0) {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkFuaW1hdGlvbkxvb3AuY29mZmVlIiwiQ29uZmlnLmNvZmZlZSIsIkRldmljZS5jb2ZmZWUiLCJHYW1lLmNvZmZlZSIsIklucHV0LmNvZmZlZSIsIlBhcnRpY2xlLmNvZmZlZSIsIlBhcnRpY2xlR2VuZXJhdG9yLmNvZmZlZSIsIlBsYXlTdGF0ZS5jb2ZmZWUiLCJTY2VuZXMuY29mZmVlIiwiVUkuY29mZmVlIiwiVXRpbHMuY29mZmVlIiwiX2Jvb3RzdHJhcC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsSUFBQSxrQkFBQTs7QUFBQTtBQUVlLEVBQUEsNEJBQUEsR0FBQTtBQUVYLElBQUEsSUFBQyxDQUFBLHFCQUFELENBQUEsQ0FBQSxDQUFBO0FBRUEsV0FBTyxJQUFQLENBSlc7RUFBQSxDQUFiOztBQUFBLCtCQU1BLG9CQUFBLEdBQXNCLFNBQUEsR0FBQTtBQUVwQixJQUFBLE1BQU0sQ0FBQyxvQkFBUCxDQUE0QixJQUFDLENBQUEsZUFBN0IsQ0FBQSxDQUFBO0FBRUEsV0FBTyxJQUFQLENBSm9CO0VBQUEsQ0FOdEIsQ0FBQTs7QUFBQSwrQkFZQSxxQkFBQSxHQUF1QixTQUFBLEdBQUE7QUFFckIsSUFBQSxJQUFDLENBQUEsZUFBRCxHQUFtQixNQUFNLENBQUMscUJBQVAsQ0FBNkIsQ0FBQSxTQUFBLEtBQUEsR0FBQTthQUFBLFNBQUEsR0FBQTtBQUU5QyxRQUFBLEtBQUMsQ0FBQSxxQkFBRCxDQUFBLENBQUEsQ0FGOEM7TUFBQSxFQUFBO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE3QixDQUFuQixDQUFBO0FBQUEsSUFNQSxNQUFNLENBQUMsS0FBUCxHQUFlLE1BQU0sQ0FBQyxLQU50QixDQUFBO0FBQUEsSUFRQSxpQkFBaUIsQ0FBQyxvQkFBbEIsQ0FBQSxDQVJBLENBQUE7QUFVQSxXQUFPLElBQVAsQ0FacUI7RUFBQSxDQVp2QixDQUFBOzs0QkFBQTs7SUFGRixDQUFBOztBQ0FBLElBQUEsV0FBQTs7QUFBQTtBQUVFLHdC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LFdBQUEsQ0FBQSxDQWpDeEIsQ0FBQTs7QUFBQSxLQWtDQSxHQUF3QixJQUFBLFVBQUEsQ0FBQSxDQWxDeEIsQ0FBQTs7QUFBQSxNQW1DQSxHQUF3QixJQUFBLFdBQUEsQ0FBQSxDQW5DeEIsQ0FBQTs7QUFBQSxLQW9DQSxHQUF3QixJQUFBLFVBQUEsQ0FBQSxDQXBDeEIsQ0FBQTs7QUFBQSxpQkF1Q0EsR0FBd0IsSUFBQSxzQkFBQSxDQUFBLENBdkN4QixDQUFBOztBQUFBLFNBd0NBLEdBQXdCLElBQUEsY0FBQSxDQUFBLENBeEN4QixDQUFBOztBQUFBLEVBeUNBLEdBQXdCLElBQUEsT0FBQSxDQUFBLENBekN4QixDQUFBOztBQUFBLE1BMENBLEdBQXdCLElBQUEsV0FBQSxDQUFBLENBMUN4QixDQUFBOztBQUFBLGFBNkNBLEdBQXdCLElBQUEsa0JBQUEsQ0FBQSxDQTdDeEIsQ0FBQTs7QUFBQSxJQWdEQSxHQUF3QixJQUFBLFNBQUEsQ0FBQSxDQWhEeEIsQ0FBQSIsImZpbGUiOiJhcHBsaWNhdGlvbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIlxuY2xhc3MgQW5pbWF0aW9uTG9vcENsYXNzXG5cbiAgY29uc3RydWN0b3I6IC0+XG5cbiAgICBAcmVxdWVzdEFuaW1hdGlvbkZyYW1lKClcblxuICAgIHJldHVybiB0aGlzXG5cbiAgY2FuY2VsQW5pbWF0aW9uRnJhbWU6IC0+XG5cbiAgICB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUoQGFuaW1hdGlvbkxvb3BJZClcblxuICAgIHJldHVybiB0aGlzXG5cbiAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lOiAtPlxuXG4gICAgQGFuaW1hdGlvbkxvb3BJZCA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPT5cblxuICAgICAgQHJlcXVlc3RBbmltYXRpb25GcmFtZSgpXG5cbiAgICAgIHJldHVyblxuXG4gICAgY2FudmFzLndpZHRoID0gY2FudmFzLndpZHRoXG5cbiAgICBQYXJ0aWNsZUdlbmVyYXRvci5hbmltYXRpb25Mb29wQWN0aW9ucygpXG5cbiAgICByZXR1cm4gdGhpc1xuIiwiXG5jbGFzcyBDb25maWdDbGFzc1xuXG4gIGNoYW5jZVBhcnRpY2xlSXNUYXJnZXQ6XG4gICAgZWFzeTogICAgICA1MFxuICAgIGRpZmZpY3VsdDogOTBcblxuICBsZXZlbFVwSW50ZXJ2YWw6IDVcblxuICBtYXhMZXZlbDogNTBcblxuICBtYXhMaW5lV2lkdGg6IDVcblxuICBtYXhUYXJnZXRzQXRPbmNlOlxuICAgIGVhc3k6ICAgICAgM1xuICAgIGRpZmZpY3VsdDogNlxuXG4gIHBhcnRpY2xlR3Jvd3RoTXVsdGlwbGllcjpcbiAgICBlYXN5OiAgICAgIDEuMDVcbiAgICBkaWZmaWN1bHQ6IDEuMTBcblxuICBwYXJ0aWNsZVNwYXduQ2hhbmNlOlxuICAgIGVhc3k6ICAgICAgNjBcbiAgICBkaWZmaWN1bHQ6IDEwMFxuXG4gIHBhcnRpY2xlRGlhbWV0ZXJBc1BlcmNlbnRhZ2VPZlNjcmVlbjogMTVcblxuICBwb2ludHNQZXJQb3A6IDEwXG5cbiAgcHJvcGVydGllc1RvVXBkYXRlV2l0aERpZmZpY3VsdHk6IFtcbiAgICAncGFydGljbGVTcGF3bkNoYW5jZSdcbiAgICAnY2hhbmNlUGFydGljbGVJc1RhcmdldCdcbiAgICAncGFydGljbGVHcm93dGhNdWx0aXBsaWVyJ1xuICAgICdzaXplTWF4J1xuICAgICdtYXhUYXJnZXRzQXRPbmNlJ1xuICAgICdtaW5UYXJnZXRTaXplJ1xuICAgICd2ZWxvY2l0eU1pbidcbiAgICAndmVsb2NpdHlNYXgnXG4gICAgJ3RhcmdldFZlbG9jaXR5TXVsdGlwbGllcidcbiAgXVxuXG4gIHRhcmdldFZlbG9jaXR5TXVsdGlwbGllcjpcbiAgICBlYXN5OiAgICAgIDAuM1xuICAgIGRpZmZpY3VsdDogMC41XG5cbiAgdmVsb2NpdHlNaW46XG4gICAgZWFzeTogICAgICAtNlxuICAgIGRpZmZpY3VsdDogLTEwXG5cbiAgdmVsb2NpdHlNYXg6XG4gICAgZWFzeTogICAgICA2XG4gICAgZGlmZmljdWx0OiAxMFxuXG4gIGNvbnN0cnVjdG9yOiAtPlxuXG4gICAgYmFzZVNjcmVlbldpZHRoICAgPSBNYXRoLm1pbihib2R5LmNsaWVudFdpZHRoLCBib2R5LmNsaWVudEhlaWdodCkgLyAxMDBcbiAgICBiYXNlUGFydGljbGVXaWR0aCA9IE1hdGgucm91bmQoYmFzZVNjcmVlbldpZHRoICogQHBhcnRpY2xlRGlhbWV0ZXJBc1BlcmNlbnRhZ2VPZlNjcmVlbilcblxuICAgIEBiYXNlUGFydGljbGVTaXplID0gYmFzZVBhcnRpY2xlV2lkdGggKiBkZXZpY2VQaXhlbFJhdGlvXG5cbiAgICBAbWluVGFyZ2V0U2l6ZSA9XG4gICAgICBlYXN5OiAgICAgIEBiYXNlUGFydGljbGVTaXplICogMC43XG4gICAgICBkaWZmaWN1bHQ6IEBiYXNlUGFydGljbGVTaXplICogMC40XG5cblxuICAgIEBzaXplTWF4ID1cbiAgICAgIGVhc3k6ICAgICAgQGJhc2VQYXJ0aWNsZVNpemVcbiAgICAgIGRpZmZpY3VsdDogQGJhc2VQYXJ0aWNsZVNpemUgKiAwLjZcblxuICAgIHJldHVybiB0aGlzXG5cbiAgdXBkYXRlVmFsdWVzRm9yRGlmZmljdWx0eTogLT5cblxuICAgIGZvciBwcm9wZXJ0eSBpbiBAcHJvcGVydGllc1RvVXBkYXRlV2l0aERpZmZpY3VsdHlcbiAgICAgIHByb3BlcnR5Q29uZmlnICA9IEBbcHJvcGVydHldXG4gICAgICB2YWx1ZURpZmZlcmVuY2UgPSBwcm9wZXJ0eUNvbmZpZy5kaWZmaWN1bHQgLSBwcm9wZXJ0eUNvbmZpZy5lYXN5XG4gICAgICBsZXZlbE11bGl0cGxpZXIgPSBQbGF5U3RhdGUubGV2ZWwgLyBAbWF4TGV2ZWxcblxuICAgICAgUGxheVN0YXRlW3Byb3BlcnR5XSA9ICh2YWx1ZURpZmZlcmVuY2UgKiBsZXZlbE11bGl0cGxpZXIpICsgcHJvcGVydHlDb25maWcuZWFzeVxuXG4gICAgcmV0dXJuIHRoaXNcbiIsIlxuY2xhc3MgRGV2aWNlQ2xhc3NcblxuICBjb25zdHJ1Y3RvcjogLT5cblxuICAgIHJldHVybiB0aGlzXG4iLCJcbmNsYXNzIEdhbWVDbGFzc1xuXG4gIGNvbnN0cnVjdG9yOiAtPlxuXG4gICAgU2NlbmVzLmlkZW50KClcblxuICAgIHJldHVybiB0aGlzXG5cbiAgb3ZlcjogLT5cblxuICAgIFNjZW5lcy5nYW1lT3ZlcigpXG5cbiAgICBQbGF5U3RhdGUuc3RvcExldmVsVXBJbmNyZW1lbnQoKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBzdGFydDogLT5cblxuICAgIFBsYXlTdGF0ZS5yZXNldCgpXG4gICAgVUkucmVzZXQoKVxuICAgIElucHV0LnJlbW92ZUdhbWVTdGFydFRhcEV2ZW50SGFuZGxlcigpXG4gICAgUGFydGljbGVHZW5lcmF0b3IucmVzZXQoKVxuXG4gICAgU2NlbmVzLnBsYXlpbmcoKVxuXG4gICAgcmV0dXJuIHRoaXNcbiIsIlxuY2xhc3MgSW5wdXRDbGFzc1xuXG4gIGNvbnN0cnVjdG9yOiAtPlxuXG4gICAgQGNhbmNlbFRvdWNoTW92ZUV2ZW50cygpXG5cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciBpbnB1dFZlcmIsIChldmVudCkgLT5cbiAgICAgICNjb25zb2xlLmxvZyBldmVudC50YXJnZXQubm9kZU5hbWUudG9Mb3dlckNhc2UoKVxuICAgICAgcmV0dXJuXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIGFkZEdhbWVTdGFydFRhcEV2ZW50SGFuZGxlcjogKCkgLT5cblxuICAgIGJvZHkuYWRkRXZlbnRMaXN0ZW5lcihpbnB1dFZlcmIsIEBnYW1lU3RhcnRUYXBFdmVudEhhbmRsZXIpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIGNhbmNlbFRvdWNoTW92ZUV2ZW50czogLT5cblxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyICd0b3VjaG1vdmUnLCAoZXZlbnQpIC0+XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG5cbiAgICAgIHJldHVyblxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBnYW1lU3RhcnRUYXBFdmVudEhhbmRsZXI6IChldmVudCkgLT5cblxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcblxuICAgIEdhbWUuc3RhcnQoKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBnZXRUb3VjaERhdGE6IChldmVudCkgLT5cblxuICAgIGlmIHRvdWNoRGF0YVxuICAgICAgdGFwQ29vcmRpbmF0ZXMgPSBldmVudC50b3VjaGVzWzBdXG4gICAgZWxzZVxuICAgICAgdG91Y2hEYXRhID1cbiAgICAgICAgcGFnZVg6IGV2ZW50LmNsaWVudFgsXG4gICAgICAgIHBhZ2VZOiBldmVudC5jbGllbnRZXG5cbiAgICByZXR1cm4gdG91Y2hEYXRhXG5cbiAgcmVnaXN0ZXJIYW5kbGVyOiAoc2VsZWN0b3IsIHNjZW5lcywgY2FsbGJhY2spIC0+XG5cbiAgICBpZiB0eXBlb2Yoc2NlbmVzKSA9PSAnc3RyaW5nJ1xuICAgICAgc2NlbmVfc3RyaW5nID0gc2NlbmVzXG4gICAgICBzY2VuZXMgPSBbc2NlbmVfc3RyaW5nXVxuXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3RvcikuYWRkRXZlbnRMaXN0ZW5lciBpbnB1dFZlcmIsIChldmVudCkgPT5cbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICAgIGNhbGxiYWNrLmFwcGx5KCkgaWYgU2NlbmVzLmN1cnJlbnQgaW4gc2NlbmVzXG4gICAgICByZXR1cm5cblxuICAgIHJldHVybiB0aGlzXG5cbiAgcmVtb3ZlR2FtZVN0YXJ0VGFwRXZlbnRIYW5kbGVyOiAtPlxuXG4gICAgZG9jdW1lbnQuYm9keS5yZW1vdmVFdmVudExpc3RlbmVyKGlucHV0VmVyYiwgQGdhbWVTdGFydFRhcEV2ZW50SGFuZGxlcilcblxuICAgIHJldHVybiB0aGlzXG4iLCJcbmNsYXNzIFBhcnRpY2xlQ2xhc3NcblxuICBkZXN0cm95aW5nOiBmYWxzZVxuICBzaXplOiAgICAgICAxXG5cbiAgY29uc3RydWN0b3I6IC0+XG5cbiAgICByID0gVXRpbHMucmFuZG9tSW50ZWdlcigwLCAyMDApXG4gICAgZyA9IFV0aWxzLnJhbmRvbUludGVnZXIoMCwgMjAwKVxuICAgIGIgPSBVdGlscy5yYW5kb21JbnRlZ2VyKDAsIDIwMClcbiAgICBhID0gVXRpbHMucmFuZG9tKDAuNzUsIDEpXG5cbiAgICBAY29sb3IgICAgICA9IFwicmdiYSgje3J9LCAje2d9LCAje2J9LCAje2F9KVwiXG4gICAgQGZpbmFsU2l6ZSAgPSBVdGlscy5yYW5kb21JbnRlZ2VyKDAsIFBsYXlTdGF0ZS5zaXplTWF4KVxuICAgIEBpZCAgICAgICAgID0gTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyKDIsIDUpXG4gICAgQGlzVGFyZ2V0ICAgPSBAZGV0ZXJtaW5lVGFyZ2V0UGFydGljbGUoKVxuICAgIEBwb3NpdGlvbiAgID1cbiAgICAgIHg6IFBhcnRpY2xlR2VuZXJhdG9yLnBhcnRpY2xlc09yaWdpbi54XG4gICAgICB5OiBQYXJ0aWNsZUdlbmVyYXRvci5wYXJ0aWNsZXNPcmlnaW4ueVxuICAgIEB2ZWxvY2l0eSAgID1cbiAgICAgIHg6IFV0aWxzLnJhbmRvbShQbGF5U3RhdGUudmVsb2NpdHlNaW4sIFBsYXlTdGF0ZS52ZWxvY2l0eU1heClcbiAgICAgIHk6IFV0aWxzLnJhbmRvbShQbGF5U3RhdGUudmVsb2NpdHlNaW4sIFBsYXlTdGF0ZS52ZWxvY2l0eU1heClcblxuICAgIGlmIEBpc1RhcmdldFxuICAgICAgQGNvbG9yICAgICA9IFwicmdiYSgje3J9LCAje2d9LCAje2J9LCAwLjgpXCJcbiAgICAgIEBmaW5hbFNpemUgPSBVdGlscy5yYW5kb21JbnRlZ2VyKFBsYXlTdGF0ZS5taW5UYXJnZXRTaXplLCBQbGF5U3RhdGUuc2l6ZU1heClcblxuICAgICAgQHZlbG9jaXR5LnggKj0gUGxheVN0YXRlLnRhcmdldFZlbG9jaXR5TXVsdGlwbGllclxuICAgICAgQHZlbG9jaXR5LnkgKj0gUGxheVN0YXRlLnRhcmdldFZlbG9jaXR5TXVsdGlwbGllclxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBkZXRlcm1pbmVUYXJnZXRQYXJ0aWNsZTogLT5cblxuICAgIGlzVGFyZ2V0ID0gZmFsc2VcblxuICAgIGlmIFBhcnRpY2xlR2VuZXJhdG9yLnBhcnRpY2xlc1RvVGVzdEZvclRhcHMubGVuZ3RoIDwgUGxheVN0YXRlLm1heFRhcmdldHNBdE9uY2VcbiAgICAgIGlzVGFyZ2V0ID0gVXRpbHMucmFuZG9tUGVyY2VudGFnZSgpIDwgUGxheVN0YXRlLmNoYW5jZVBhcnRpY2xlSXNUYXJnZXRcblxuICAgIHJldHVybiBpc1RhcmdldFxuXG4gIGRyYXc6IC0+XG5cbiAgICBpZiBAb3V0c2lkZUNhbnZhc0JvdW5kcygpXG4gICAgICBQYXJ0aWNsZUdlbmVyYXRvci5wYXJ0aWNsZXNUb0RlbGV0ZS5wdXNoKEBpZClcblxuICAgICAgcmV0dXJuXG5cbiAgICBpZiBAaXNUYXJnZXRcbiAgICAgIEBsaW5lV2lkdGggPSBAc2l6ZSAvIDEwXG5cbiAgICAgIGlmIEBsaW5lV2lkdGggPiBDb25maWcubWF4TGluZVdpZHRoXG4gICAgICAgIEBsaW5lV2lkdGggPSBDb25maWcubWF4TGluZVdpZHRoXG5cbiAgICAgIGNvbnRleHQuZmlsbFN0eWxlID0gJ3JnYmEoMjQ3LCAyNDcsIDI0NywgMC45KSdcbiAgICAgIGNvbnRleHQubGluZVdpZHRoID0gQGxpbmVXaWR0aFxuXG4gICAgY29udGV4dC5iZWdpblBhdGgoKVxuICAgIGNvbnRleHQuYXJjKEBwb3NpdGlvbi54LCBAcG9zaXRpb24ueSwgQGhhbGYsIDAsIE1hdGguUEkgKiAyLCB0cnVlKVxuICAgIGNvbnRleHQuZmlsbCgpXG4gICAgY29udGV4dC5zdHJva2UoKSBpZiBAaXNUYXJnZXRcbiAgICBjb250ZXh0LmNsb3NlUGF0aCgpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIG91dHNpZGVDYW52YXNCb3VuZHM6IC0+XG5cbiAgICBiZXlvbmRCb3VuZHNYID0gQHBvc2l0aW9uLnggPCAtKEBmaW5hbFNpemUpIG9yIEBwb3NpdGlvbi54ID4gY2FudmFzLndpZHRoICArIEBmaW5hbFNpemVcbiAgICBiZXlvbmRCb3VuZHNZID0gQHBvc2l0aW9uLnkgPCAtKEBmaW5hbFNpemUpIG9yIEBwb3NpdGlvbi55ID4gY2FudmFzLmhlaWdodCArIEBmaW5hbFNpemVcblxuICAgIHJldHVybiBiZXlvbmRCb3VuZHNYIG9yIGJleW9uZEJvdW5kc1lcblxuICB1cGRhdGVWYWx1ZXM6IC0+XG5cbiAgICBpZiBAZGVzdHJveWluZ1xuICAgICAgc2hyaW5rTXVsdGlwbGllciA9IGlmIFBsYXlTdGF0ZS5wbGF5aW5nIHRoZW4gMC43IGVsc2UgMC45XG5cbiAgICAgIEBzaXplICo9IHNocmlua011bHRpcGxpZXJcbiAgICBlbHNlXG4gICAgICBpZiBAc2l6ZSA8IEBmaW5hbFNpemVcbiAgICAgICAgQHNpemUgKj0gUGxheVN0YXRlLnBhcnRpY2xlR3Jvd3RoTXVsdGlwbGllclxuXG4gICAgICBpZiBAc2l6ZSA+IEBmaW5hbFNpemVcbiAgICAgICAgQHNpemUgPSBAZmluYWxTaXplXG5cbiAgICBAaGFsZiA9IEBzaXplIC8gMlxuXG4gICAgQHBvc2l0aW9uLnggKz0gQHZlbG9jaXR5LnhcbiAgICBAcG9zaXRpb24ueSArPSBAdmVsb2NpdHkueVxuXG4gICAgQGRyYXcoKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICB3YXNUYXBwZWQ6ICh0b3VjaERhdGEpIC0+XG5cbiAgICB0YXBYICAgICAgPSB0b3VjaERhdGEucGFnZVggKiBkZXZpY2VQaXhlbFJhdGlvXG4gICAgdGFwWSAgICAgID0gdG91Y2hEYXRhLnBhZ2VZICogZGV2aWNlUGl4ZWxSYXRpb1xuICAgIGRpc3RhbmNlWCA9IHRhcFggLSBAcG9zaXRpb24ueFxuICAgIGRpc3RhbmNlWSA9IHRhcFkgLSBAcG9zaXRpb24ueVxuICAgIHJhZGl1cyAgICA9IEBoYWxmXG5cbiAgICByZXR1cm4gKGRpc3RhbmNlWCAqIGRpc3RhbmNlWCkgKyAoZGlzdGFuY2VZICogZGlzdGFuY2VZKSA8IChAaGFsZiAqIEBoYWxmKVxuIiwiXG5jbGFzcyBQYXJ0aWNsZUdlbmVyYXRvckNsYXNzXG5cbiAgY29uc3RydWN0b3I6IC0+XG5cbiAgICBAcGFydGljbGVzQXJyYXkgICAgICAgICA9IFtdXG4gICAgQHBhcnRpY2xlc0FycmF5SWRzICAgICAgPSBbXVxuICAgIEBwYXJ0aWNsZXNUb0RlbGV0ZSAgICAgID0gW11cbiAgICBAcGFydGljbGVzVG9UZXN0Rm9yVGFwcyA9IFtdXG5cbiAgICBAcGFydGljbGVzT3JpZ2luID1cbiAgICAgIHg6IGNhbnZhcy53aWR0aCAgLyAyXG4gICAgICB5OiBjYW52YXMuaGVpZ2h0IC8gMlxuXG4gICAgQHJlZ2lzdGVyUGFydGljbGVUYXBEZXRlY3Rpb25IYW5kbGVyKClcblxuICAgIHJldHVybiB0aGlzXG5cbiAgYW5pbWF0aW9uTG9vcEFjdGlvbnM6IC0+XG5cbiAgICBpZiBQbGF5U3RhdGUucGxheWluZ1xuICAgICAgQGdlbmVyYXRlUGFydGljbGUoKVxuXG4gICAgQHVwZGF0ZVBhcnRpY2xlc1ZhbHVlcygpXG4gICAgQHJlbW92ZVBhcnRpY2xlc0FmdGVyVGFwKClcblxuICAgIGlmIEBwYXJ0aWNsZXNUb0RlbGV0ZS5sZW5ndGggPiAwXG4gICAgICBAZGVzdHJveVBhcnRpY2xlc091dHNpZGVDYW52YXNCb3VuZHMoKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBkZXN0cm95UGFydGljbGVzT3V0c2lkZUNhbnZhc0JvdW5kczogLT5cblxuICAgIEBwYXJ0aWNsZXNUb0RlbGV0ZS5tYXAgKHBhcnRpY2xlSWQpID0+XG4gICAgICBwYXJ0aWNsZUluZGV4ID0gQHBhcnRpY2xlc0FycmF5SWRzLmluZGV4T2YocGFydGljbGVJZClcbiAgICAgIHBhcnRpY2xlICAgICAgPSBAcGFydGljbGVzQXJyYXlbcGFydGljbGVJbmRleF1cblxuICAgICAgaWYgcGFydGljbGU/XG4gICAgICAgIEBnYW1lT3ZlcigpIGlmIHBhcnRpY2xlLmlzVGFyZ2V0XG4gICAgICAgIEByZW1vdmVQYXJ0aWNsZShwYXJ0aWNsZSlcblxuICAgIEBwYXJ0aWNsZXNUb0RlbGV0ZSA9IFtdXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIGdhbWVPdmVyOiAtPlxuXG4gICAgQHN0b3AoKVxuXG4gICAgQHBhcnRpY2xlc0FycmF5Lm1hcCAocGFydGljbGUpID0+XG4gICAgICBwYXJ0aWNsZS5kZXN0cm95aW5nID0gdHJ1ZVxuXG4gICAgUGxheVN0YXRlLnBhcnRpY2xlU3Bhd25DaGFuY2UgPSAwXG5cbiAgICBHYW1lLm92ZXIoKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBnZW5lcmF0ZVBhcnRpY2xlOiAtPlxuXG4gICAgaWYgVXRpbHMucmFuZG9tUGVyY2VudGFnZSgpIDwgUGxheVN0YXRlLnBhcnRpY2xlU3Bhd25DaGFuY2VcbiAgICAgIHBhcnRpY2xlID0gbmV3IFBhcnRpY2xlQ2xhc3MoKVxuXG4gICAgICBAcGFydGljbGVzQXJyYXkucHVzaChwYXJ0aWNsZSlcbiAgICAgIEBwYXJ0aWNsZXNBcnJheUlkcy5wdXNoKHBhcnRpY2xlLmlkKVxuXG4gICAgICBpZiBwYXJ0aWNsZS5pc1RhcmdldFxuICAgICAgICBAcGFydGljbGVzVG9UZXN0Rm9yVGFwcy51bnNoaWZ0KHBhcnRpY2xlLmlkKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBwYXJ0aWNsZVRhcERldGVjdGlvbkhhbmRsZXI6ICgpIC0+XG5cbiAgICB0YXJnZXRIaXQgPSBmYWxzZVxuICAgIHBhcnRpY2xlICA9IGZhbHNlXG5cbiAgICBAcGFydGljbGVzVG9UZXN0Rm9yVGFwcy5tYXAgKHBhcnRpY2xlSWQpID0+XG4gICAgICBwYXJ0aWNsZUluZGV4ID0gQHBhcnRpY2xlc0FycmF5SWRzLmluZGV4T2YocGFydGljbGVJZClcbiAgICAgIHBhcnRpY2xlICAgICAgPSBAcGFydGljbGVzQXJyYXlbcGFydGljbGVJbmRleF1cbiAgICAgIHRvdWNoRGF0YSAgICAgPSBJbnB1dC5nZXRUb3VjaERhdGEoZXZlbnQpXG5cbiAgICAgIGlmIHBhcnRpY2xlPyBhbmQgcGFydGljbGUud2FzVGFwcGVkKHRvdWNoRGF0YSlcbiAgICAgICAgZGVsZXRpb25JbmRleCAgICAgICA9IEBwYXJ0aWNsZXNUb1Rlc3RGb3JUYXBzLmluZGV4T2YocGFydGljbGVJZClcbiAgICAgICAgcGFydGljbGUuZGVzdHJveWluZyA9IHRydWVcbiAgICAgICAgdGFyZ2V0SGl0ICAgICAgICAgICA9IHRydWVcblxuICAgICAgICBAcGFydGljbGVzVG9UZXN0Rm9yVGFwcy5zcGxpY2UoZGVsZXRpb25JbmRleCwgMSlcblxuICAgICAgICByZXR1cm5cblxuICAgIFBsYXlTdGF0ZS51cGRhdGVDb21ib011bHRpcGxpZXIodGFyZ2V0SGl0KVxuXG4gICAgUGxheVN0YXRlLnVwZGF0ZVNjb3JlKHBhcnRpY2xlLnNpemUsIHBhcnRpY2xlLmZpbmFsU2l6ZSkgaWYgdGFyZ2V0SGl0XG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHJlZ2lzdGVyUGFydGljbGVUYXBEZXRlY3Rpb25IYW5kbGVyOiAtPlxuXG4gICAgSW5wdXQucmVnaXN0ZXJIYW5kbGVyICcudWktcGxheWluZycsICdwbGF5aW5nJywgLT5cbiAgICAgIFBhcnRpY2xlR2VuZXJhdG9yLnBhcnRpY2xlVGFwRGV0ZWN0aW9uSGFuZGxlcigpXG4gICAgICByZXR1cm5cblxuICAgIHJldHVybiB0aGlzXG5cbiAgcmVtb3ZlUGFydGljbGU6IChwYXJ0aWNsZSkgLT5cblxuICAgIGlkICAgID0gcGFydGljbGUuaWRcbiAgICBpbmRleCA9IEBwYXJ0aWNsZXNBcnJheUlkcy5pbmRleE9mKGlkKVxuXG4gICAgQHBhcnRpY2xlc0FycmF5LnNwbGljZShpbmRleCwgMSlcbiAgICBAcGFydGljbGVzQXJyYXlJZHMuc3BsaWNlKGluZGV4LCAxKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICByZW1vdmVQYXJ0aWNsZXNBZnRlclRhcDogLT5cblxuICAgIEBwYXJ0aWNsZXNBcnJheS5tYXAgKHBhcnRpY2xlKSA9PlxuICAgICAgQHJlbW92ZVBhcnRpY2xlKHBhcnRpY2xlKSBpZiBwYXJ0aWNsZS5zaXplIDwgMVxuXG4gICAgICByZXR1cm5cblxuICAgIHJldHVybiB0aGlzXG5cbiAgcmVzZXQ6IC0+XG5cbiAgICBAcGFydGljbGVzQXJyYXkgICAgICAgICA9IFtdXG4gICAgQHBhcnRpY2xlc0FycmF5SWRzICAgICAgPSBbXVxuICAgIEBwYXJ0aWNsZXNUb0RlbGV0ZSAgICAgID0gW11cbiAgICBAcGFydGljbGVzVG9UZXN0Rm9yVGFwcyA9IFtdXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHN0b3A6IC0+XG5cbiAgICBQbGF5U3RhdGUudXBkYXRlKGZhbHNlKVxuICAgIFBsYXlTdGF0ZS5zdG9wTGV2ZWxVcEluY3JlbWVudCgpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHVwZGF0ZVBhcnRpY2xlc1ZhbHVlczogLT5cblxuICAgIEBwYXJ0aWNsZXNBcnJheS5tYXAgKHBhcnRpY2xlKSA9PlxuICAgICAgY29udGV4dC5maWxsU3R5bGUgICA9IHBhcnRpY2xlLmNvbG9yXG4gICAgICBjb250ZXh0LnN0cm9rZVN0eWxlID0gcGFydGljbGUuY29sb3JcblxuICAgICAgcGFydGljbGUudXBkYXRlVmFsdWVzKClcblxuICAgICAgcmV0dXJuXG5cbiAgICByZXR1cm4gdGhpc1xuIiwiXG5jbGFzcyBQbGF5U3RhdGVDbGFzc1xuXG4gIGRlZmF1bHRzOlxuICAgIGNvbWJvTXVsdGlwbGllcjogMFxuICAgIGxldmVsOiAgICAgICAgICAgMVxuICAgIHNjb3JlOiAgICAgICAgICAgMFxuXG4gIHJlc2V0OiAtPlxuXG4gICAgQGNoYW5jZVBhcnRpY2xlSXNUYXJnZXQgICA9IENvbmZpZy5jaGFuY2VQYXJ0aWNsZUlzVGFyZ2V0LmVhc3lcbiAgICBAY29tYm9NdWx0aXBsaWVyICAgICAgICAgID0gQGRlZmF1bHRzLmNvbWJvTXVsdGlwbGllclxuICAgIEBsZXZlbCAgICAgICAgICAgICAgICAgICAgPSBAZGVmYXVsdHMubGV2ZWxcbiAgICBAbWF4VGFyZ2V0c0F0T25jZSAgICAgICAgID0gQ29uZmlnLm1heFRhcmdldHNBdE9uY2UuZWFzeVxuICAgIEBtaW5UYXJnZXRTaXplICAgICAgICAgICAgPSBDb25maWcubWluVGFyZ2V0U2l6ZS5lYXN5XG4gICAgQHBhcnRpY2xlR3Jvd3RoTXVsdGlwbGllciA9IENvbmZpZy5wYXJ0aWNsZUdyb3d0aE11bHRpcGxpZXIuZWFzeVxuICAgIEBwYXJ0aWNsZVNwYXduQ2hhbmNlICAgICAgPSBDb25maWcucGFydGljbGVTcGF3bkNoYW5jZS5lYXN5XG4gICAgQHNjb3JlICAgICAgICAgICAgICAgICAgICA9IEBkZWZhdWx0cy5zY29yZVxuICAgIEBzaXplTWF4ICAgICAgICAgICAgICAgICAgPSBDb25maWcuc2l6ZU1heC5lYXN5XG4gICAgQHRhcmdldFZlbG9jaXR5TXVsdGlwbGllciA9IENvbmZpZy50YXJnZXRWZWxvY2l0eU11bHRpcGxpZXIuZWFzeVxuICAgIEB2ZWxvY2l0eU1pbiAgICAgICAgICAgICAgPSBDb25maWcudmVsb2NpdHlNaW4uZWFzeVxuICAgIEB2ZWxvY2l0eU1heCAgICAgICAgICAgICAgPSBDb25maWcudmVsb2NpdHlNYXguZWFzeVxuXG4gICAgQHVwZGF0ZSh0cnVlKVxuXG4gICAgQ29uZmlnLnVwZGF0ZVZhbHVlc0ZvckRpZmZpY3VsdHkoKVxuXG4gICAgQHNldHVwTGV2ZWxVcEluY3JlbWVudCgpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHN0b3BMZXZlbFVwSW5jcmVtZW50OiAtPlxuXG4gICAgd2luZG93LmNsZWFySW50ZXJ2YWwoQGxldmVsVXBDb3VudGVyKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBzZXR1cExldmVsVXBJbmNyZW1lbnQ6IC0+XG5cbiAgICBAbGV2ZWxVcENvdW50ZXIgPSB3aW5kb3cuc2V0SW50ZXJ2YWwgPT5cblxuICAgICAgQHVwZGF0ZUxldmVsKClcblxuICAgICAgcmV0dXJuXG5cbiAgICAsIENvbmZpZy5sZXZlbFVwSW50ZXJ2YWwgKiAxMDAwXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHVwZGF0ZUNvbWJvTXVsdGlwbGllcjogKHRhcmdldEhpdCkgLT5cblxuICAgIEBjb21ib011bHRpcGxpZXIgPSBpZiB0YXJnZXRIaXQgdGhlbiBAY29tYm9NdWx0aXBsaWVyICsgMSBlbHNlIEBkZWZhdWx0cy5jb21ib011bHRpcGxpZXJcblxuICAgIFVJLnVwZGF0ZUNvbWJvTXVsdGlwbGllckNvdW50ZXIoKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICB1cGRhdGU6IChuZXdTdGF0ZSkgLT5cblxuICAgIEBwbGF5aW5nID0gbmV3U3RhdGVcblxuICAgIHJldHVybiB0aGlzXG5cbiAgdXBkYXRlTGV2ZWw6IC0+XG5cbiAgICBAbGV2ZWwgKz0gMVxuXG4gICAgaWYgQGxldmVsID49IENvbmZpZy5tYXhMZXZlbFxuICAgICAgd2luZG93LmNsZWFySW50ZXJ2YWwoQGxldmVsVXBDb3VudGVyKVxuXG4gICAgVUkudXBkYXRlTGV2ZWxDb3VudGVyKClcbiAgICBDb25maWcudXBkYXRlVmFsdWVzRm9yRGlmZmljdWx0eSgpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHVwZGF0ZVNjb3JlOiAoc2l6ZVdoZW5UYXBwZWQsIHNpemVXaGVuRnVsbHlHcm93bikgLT5cblxuICAgICMoKGRlZmF1bHRTY29yZVBlclBvcCArICgxMDAgLSAoKHNpemVXaGVuVGFwcGVkIC8gc2l6ZVdoZW5GdWxseUdyb3duKSAqIDEwMCkpKSAqIGNvbWJvTXVsdGlwbGllcikgKiAobGV2ZWxOdW1iZXIgKyAxKVxuXG4gICAgdGFyZ2V0U2l6ZUJvbnVzID0gTWF0aC5yb3VuZCgxMDAgLSAoKHNpemVXaGVuVGFwcGVkIC8gc2l6ZVdoZW5GdWxseUdyb3duKSAqIDEwMCkpXG4gICAgcG9wUG9pbnRWYWx1ZSAgID0gQ29uZmlnLnBvaW50c1BlclBvcCArIHRhcmdldFNpemVCb251c1xuICAgIGxldmVsTXVsdGlwbGllciA9IEBsZXZlbCArIDFcblxuICAgIEBzY29yZSArPSAocG9wUG9pbnRWYWx1ZSAqIEBjb21ib011bHRpcGxpZXIpICogKGxldmVsTXVsdGlwbGllcilcblxuICAgIFVJLnVwZGF0ZVNjb3JlQ291bnRlcigpXG5cbiAgICByZXR1cm4gdGhpc1xuIiwiXG5jbGFzcyBTY2VuZXNDbGFzc1xuXG4gIEBjdXJyZW50ID0gbnVsbFxuXG4gIGNyZWRpdHM6IC0+XG5cbiAgICBAY3VycmVudCA9ICdjcmVkaXRzJ1xuXG4gICAgVUkudXBkYXRlQm9keUNsYXNzKCdjcmVkaXRzJylcblxuICAgIHJldHVybiB0aGlzXG5cbiAgZ2FtZU92ZXI6IC0+XG5cbiAgICBAY3VycmVudCA9ICdnYW1lLW92ZXInXG5cbiAgICBVSS51cGRhdGVCb2R5Q2xhc3MoJ2dhbWUtb3ZlcicpXG5cbiAgICBJbnB1dC5hZGRHYW1lU3RhcnRUYXBFdmVudEhhbmRsZXIoKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBsZWFkZXJib2FyZDogLT5cblxuICAgIEBjdXJyZW50ID0gJ2xlYWRlcmJvYXJkJ1xuXG4gICAgcmV0dXJuIHRoaXNcblxuICBwbGF5aW5nOiAtPlxuXG4gICAgQGN1cnJlbnQgPSAncGxheWluZydcblxuICAgIFVJLnVwZGF0ZUJvZHlDbGFzcygncGxheWluZycpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIGlkZW50OiAtPlxuXG4gICAgQGN1cnJlbnQgPSAnaWRlbnQnXG5cbiAgICBVSS51cGRhdGVCb2R5Q2xhc3MoJ2lkZW50JylcblxuICAgIHdpbmRvdy5zZXRUaW1lb3V0ID0+XG4gICAgICBAdGl0bGUoKVxuICAgICwgNTAwXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHRpdGxlOiAtPlxuXG4gICAgQGN1cnJlbnQgPSAndGl0bGUnXG5cbiAgICBVSS51cGRhdGVCb2R5Q2xhc3MoJ3RpdGxlJylcblxuICAgIElucHV0LmFkZEdhbWVTdGFydFRhcEV2ZW50SGFuZGxlcigpO1xuXG4gICAgcmV0dXJuIHRoaXNcbiIsIlxuY2xhc3MgVUlDbGFzc1xuXG4gIHJlc2V0OiAtPlxuXG4gICAgQGxldmVsQ291bnRlciAgICAgICAgICAgPSBVdGlscy4kKCcuaHVkLXZhbHVlLWxldmVsJylcbiAgICBAc2NvcmVDb3VudGVyICAgICAgICAgICA9IFV0aWxzLiQoJy5odWQtdmFsdWUtc2NvcmUnKVxuICAgIEBjb21ib011bHRpcGxpZXJDb3VudGVyID0gVXRpbHMuJCgnLmh1ZC12YWx1ZS1jb21ibycpXG4gICAgQHBsYXlBZ2FpbiAgICAgICAgICAgICAgPSBVdGlscy4kKCcucGxheS1hZ2FpbicpXG5cbiAgICBAdXBkYXRlQ29tYm9NdWx0aXBsaWVyQ291bnRlcigpXG4gICAgQHVwZGF0ZUxldmVsQ291bnRlcigpXG4gICAgQHVwZGF0ZVNjb3JlQ291bnRlcigpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHVwZGF0ZUJvZHlDbGFzczogKGNsYXNzTmFtZSkgLT5cblxuICAgIGJvZHkuY2xhc3NOYW1lID0gJydcbiAgICBib2R5LmNsYXNzTGlzdC5hZGQoJ3NjZW5lLScgKyBjbGFzc05hbWUpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHVwZGF0ZUNvbWJvTXVsdGlwbGllckNvdW50ZXI6IC0+XG5cbiAgICBVdGlscy51cGRhdGVVSVRleHROb2RlKEBjb21ib011bHRpcGxpZXJDb3VudGVyLCBQbGF5U3RhdGUuY29tYm9NdWx0aXBsaWVyKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICB1cGRhdGVMZXZlbENvdW50ZXI6IC0+XG5cbiAgICBVdGlscy51cGRhdGVVSVRleHROb2RlKEBsZXZlbENvdW50ZXIsIFBsYXlTdGF0ZS5sZXZlbClcblxuICAgIHJldHVybiB0aGlzXG5cbiAgdXBkYXRlU2NvcmVDb3VudGVyOiAtPlxuXG4gICAgc2NvcmVUb0Zvcm1hdCA9IFV0aWxzLmZvcm1hdFdpdGhDb21tYShQbGF5U3RhdGUuc2NvcmUpXG5cbiAgICBVdGlscy51cGRhdGVVSVRleHROb2RlKEBzY29yZUNvdW50ZXIsIHNjb3JlVG9Gb3JtYXQpXG5cbiAgICByZXR1cm4gdGhpc1xuIiwiXG5jbGFzcyBVdGlsc0NsYXNzXG5cbiAgJDogKHNlbGVjdG9yKSAtPlxuICAgIGlmIHNlbGVjdG9yLnN1YnN0cigwLCAxKSA9PSAnIydcbiAgICAgIHJldHVybiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChzZWxlY3RvcilcblxuICAgIGVscyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpXG5cbiAgICBpZiBlbHMubGVuZ3RoID09IDFcbiAgICAgIHJldHVybiBlbHNbMF1cblxuICAgIHJldHVybiBlbHNcblxuICBjb3JyZWN0VmFsdWVGb3JEUFI6ICh2YWx1ZSwgaW50ZWdlciA9IGZhbHNlKSAtPlxuXG4gICAgdmFsdWUgKj0gZGV2aWNlUGl4ZWxSYXRpb1xuXG4gICAgaWYgaW50ZWdlclxuICAgICAgdmFsdWUgPSBNYXRoLnJvdW5kKHZhbHVlKVxuXG4gICAgcmV0dXJuIHZhbHVlXG5cbiAgZm9ybWF0V2l0aENvbW1hOiAobnVtKSAtPlxuXG4gICAgcmV0dXJuIG51bS50b1N0cmluZygpLnJlcGxhY2UoL1xcQig/PShcXGR7M30pKyg/IVxcZCkpL2csIFwiLFwiKVxuXG4gIHJhbmRvbTogKG1pbiwgbWF4KSAtPlxuXG4gICAgaWYgbWluID09IHVuZGVmaW5lZFxuICAgICAgbWluID0gMFxuICAgICAgbWF4ID0gMVxuICAgIGVsc2UgaWYgbWF4ID09IHVuZGVmaW5lZFxuICAgICAgbWF4ID0gbWluXG4gICAgICBtaW4gPSAwXG5cbiAgICByZXR1cm4gKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluKSkgKyBtaW47XG5cbiAgcmFuZG9tQ29sb3I6IChhbHBoYSA9IGZhbHNlKSAtPlxuXG4gICAgY29sb3JzID1cbiAgICAgIHI6IHRoaXMucmFuZG9tSW50ZWdlcigwLCAyMDApXG4gICAgICBnOiB0aGlzLnJhbmRvbUludGVnZXIoMCwgMjAwKVxuICAgICAgYjogdGhpcy5yYW5kb21JbnRlZ2VyKDAsIDIwMClcbiAgICAgIGE6IGlmICFhbHBoYSB0aGVuIHRoaXMucmFuZG9tKDAuNzUsIDEpIGVsc2UgYWxwaGFcblxuICAgIHJldHVybiAncmdiYSgnICsgY29sb3JzLnIgKyAnLCAnICsgY29sb3JzLmcgKyAnLCAnICsgY29sb3JzLmIgKyAnLCAnICsgY29sb3JzLmEgKyAnKSdcblxuICByYW5kb21JbnRlZ2VyOiAobWluLCBtYXgpIC0+XG5cbiAgICBpZiBtYXggPT0gdW5kZWZpbmVkXG4gICAgICBtYXggPSBtaW5cbiAgICAgIG1pbiA9IDBcblxuICAgIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAobWF4ICsgMSAtIG1pbikpICsgbWluXG5cbiAgcmFuZG9tUGVyY2VudGFnZTogLT5cblxuICAgIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxMDApXG5cbiAgdXBkYXRlVUlUZXh0Tm9kZTogKGVsZW1lbnQsIHZhbHVlKSAtPlxuXG4gICAgZWxlbWVudC5pbm5lckhUTUwgPSB2YWx1ZVxuXG4gICAgcmV0dXJuIHRoaXNcbiIsIlxuZGVidWcgPSB0cnVlXG5cbmFuZHJvaWQgICAgICAgID0gaWYgbmF2aWdhdG9yLnVzZXJBZ2VudC5tYXRjaCgvYW5kcm9pZC9pKSB0aGVuIHRydWUgZWxzZSBmYWxzZVxuYm9keSAgICAgICAgICAgPSBkb2N1bWVudC5ib2R5XG5jYW52YXMgICAgICAgICA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5jYW52YXMnKVxuaGFzVG91Y2hFdmVudHMgPSB3aW5kb3cuaGFzT3duUHJvcGVydHkoJ29udG91Y2hzdGFydCcpIHx8IHdpbmRvdy5oYXNPd25Qcm9wZXJ0eSgnb25tc2dlc3R1cmVjaGFuZ2UnKVxuaW5wdXRWZXJiICAgICAgPSBpZiBoYXNUb3VjaEV2ZW50cyB0aGVuICd0b3VjaHN0YXJ0JyBlbHNlICdjbGljaydcblxuY2FudmFzLmNsYXNzTmFtZSA9ICdjYW52YXMnXG5jYW52YXMud2lkdGggICAgID0gYm9keS5jbGllbnRXaWR0aFxuY2FudmFzLmhlaWdodCAgICA9IGJvZHkuY2xpZW50SGVpZ2h0XG5cbmNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKVxuXG5jb250ZXh0Lmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9ICdzb3VyY2UtYXRvcCdcblxuZGV2aWNlUGl4ZWxSYXRpbyAgPSB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyB8fCAxXG5iYWNraW5nU3RvcmVSYXRpbyA9IGNvbnRleHQud2Via2l0QmFja2luZ1N0b3JlUGl4ZWxSYXRpbyB8fCBjb250ZXh0LmJhY2tpbmdTdG9yZVBpeGVsUmF0aW8gfHwgMVxucmF0aW8gICAgICAgICAgICAgPSBkZXZpY2VQaXhlbFJhdGlvIC8gYmFja2luZ1N0b3JlUmF0aW9cblxuaWYgZGV2aWNlUGl4ZWxSYXRpbyAhPSBiYWNraW5nU3RvcmVSYXRpb1xuICBvbGRXaWR0aCAgPSBjYW52YXMud2lkdGhcbiAgb2xkSGVpZ2h0ID0gY2FudmFzLmhlaWdodFxuXG4gIGNhbnZhcy53aWR0aCAgPSBvbGRXaWR0aCAgKiByYXRpb1xuICBjYW52YXMuaGVpZ2h0ID0gb2xkSGVpZ2h0ICogcmF0aW9cblxuICBjYW52YXMuc3R5bGUud2lkdGggID0gXCIje29sZFdpZHRofXB4XCJcbiAgY2FudmFzLnN0eWxlLmhlaWdodCA9IFwiI3tvbGRIZWlnaHR9cHhcIlxuXG4gIGNvbnRleHQuc2NhbGUocmF0aW8sIHJhdGlvKVxuXG4jIFNldCBlbnZpcm9ubWVudCBhbmQgYmFzZSBjb25maWcgZXRjXG5EZXZpY2UgICAgICAgICAgICA9IG5ldyBEZXZpY2VDbGFzcygpXG5VdGlscyAgICAgICAgICAgICA9IG5ldyBVdGlsc0NsYXNzKClcbkNvbmZpZyAgICAgICAgICAgID0gbmV3IENvbmZpZ0NsYXNzKClcbklucHV0ICAgICAgICAgICAgID0gbmV3IElucHV0Q2xhc3MoKVxuXG4jIExvYWQgdGhlIGdhbWUgbG9naWMgYW5kIGFsbCB0aGF0XG5QYXJ0aWNsZUdlbmVyYXRvciA9IG5ldyBQYXJ0aWNsZUdlbmVyYXRvckNsYXNzKClcblBsYXlTdGF0ZSAgICAgICAgID0gbmV3IFBsYXlTdGF0ZUNsYXNzKClcblVJICAgICAgICAgICAgICAgID0gbmV3IFVJQ2xhc3MoKVxuU2NlbmVzICAgICAgICAgICAgPSBuZXcgU2NlbmVzQ2xhc3MoKVxuXG4jIFNldCBvZmYgdGhlIGNhbnZhcyBhbmltYXRpb24gbG9vcFxuQW5pbWF0aW9uTG9vcCAgICAgPSBuZXcgQW5pbWF0aW9uTG9vcENsYXNzKClcblxuIyBTdGFydCB0aGUgYWN0dWFsIGdhbWVcbkdhbWUgICAgICAgICAgICAgID0gbmV3IEdhbWVDbGFzcygpXG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=