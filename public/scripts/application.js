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
    BubbleGenerator.animationLoopActions();
    return this;
  };

  return AnimationLoopClass;

})();

var ConfigClass;

ConfigClass = (function() {
  ConfigClass.prototype.chanceBubbleIsTarget = {
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

  ConfigClass.prototype.bubbleGrowthMultiplier = {
    easy: 1.05,
    difficult: 1.10
  };

  ConfigClass.prototype.bubbleSpawnChance = {
    easy: 60,
    difficult: 100
  };

  ConfigClass.prototype.bubbleDiameterAsPercentageOfScreen = 15;

  ConfigClass.prototype.pointsPerPop = 10;

  ConfigClass.prototype.propertiesToUpdateWithDifficulty = ['bubbleSpawnChance', 'chanceBubbleIsTarget', 'bubbleGrowthMultiplier', 'sizeMax', 'maxTargetsAtOnce', 'minTargetSize', 'velocityMin', 'velocityMax', 'targetVelocityMultiplier'];

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
    var baseBubbleWidth, baseScreenWidth;
    baseScreenWidth = Math.min(body.clientWidth, body.clientHeight) / 100;
    baseBubbleWidth = Math.round(baseScreenWidth * this.bubbleDiameterAsPercentageOfScreen);
    this.baseBubbleSize = baseBubbleWidth * devicePixelRatio;
    this.minTargetSize = {
      easy: this.baseBubbleSize * 0.7,
      difficult: this.baseBubbleSize * 0.4
    };
    this.sizeMax = {
      easy: this.baseBubbleSize,
      difficult: this.baseBubbleSize * 0.6
    };
    return this;
  }

  ConfigClass.prototype.updateValuesForDifficulty = function() {
    this.propertiesToUpdateWithDifficulty.map((function(_this) {
      return function(property) {
        var levelMulitplier, propertyConfig, valueDifference;
        propertyConfig = _this[property];
        valueDifference = propertyConfig.difficult - propertyConfig.easy;
        levelMulitplier = PlayState.level / _this.maxLevel;
        PlayState[property] = (valueDifference * levelMulitplier) + propertyConfig.easy;
      };
    })(this));
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
    BubbleGenerator.reset();
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

var BubbleClass;

BubbleClass = (function() {
  BubbleClass.prototype.destroying = false;

  BubbleClass.prototype.size = 1;

  function BubbleClass() {
    var a, b, g, r;
    r = Utils.randomInteger(0, 200);
    g = Utils.randomInteger(0, 200);
    b = Utils.randomInteger(0, 200);
    a = Utils.random(0.75, 1);
    this.color = "rgba(" + r + ", " + g + ", " + b + ", " + a + ")";
    this.finalSize = Utils.randomInteger(0, PlayState.sizeMax);
    this.id = Math.random().toString(36).substr(2, 5);
    this.isTarget = this.determineTargetBubble();
    this.position = {
      x: BubbleGenerator.bubblesOrigin.x,
      y: BubbleGenerator.bubblesOrigin.y
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

  BubbleClass.prototype.determineTargetBubble = function() {
    var isTarget;
    isTarget = false;
    if (BubbleGenerator.bubblesToTestForTaps.length < PlayState.maxTargetsAtOnce) {
      isTarget = Utils.randomPercentage() < PlayState.chanceBubbleIsTarget;
    }
    return isTarget;
  };

  BubbleClass.prototype.draw = function() {
    if (this.outsideCanvasBounds()) {
      BubbleGenerator.bubblesToDelete.push(this.id);
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

  BubbleClass.prototype.outsideCanvasBounds = function() {
    var beyondBoundsX, beyondBoundsY;
    beyondBoundsX = this.position.x < -this.finalSize || this.position.x > canvas.width + this.finalSize;
    beyondBoundsY = this.position.y < -this.finalSize || this.position.y > canvas.height + this.finalSize;
    return beyondBoundsX || beyondBoundsY;
  };

  BubbleClass.prototype.updateValues = function() {
    var shrinkMultiplier;
    if (this.destroying) {
      shrinkMultiplier = PlayState.playing ? 0.7 : 0.9;
      this.size *= shrinkMultiplier;
    } else {
      if (this.size < this.finalSize) {
        this.size *= PlayState.bubbleGrowthMultiplier;
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

  BubbleClass.prototype.wasTapped = function(touchData) {
    var distanceX, distanceY, radius, tapX, tapY;
    tapX = touchData.pageX * devicePixelRatio;
    tapY = touchData.pageY * devicePixelRatio;
    distanceX = tapX - this.position.x;
    distanceY = tapY - this.position.y;
    radius = this.half;
    return (distanceX * distanceX) + (distanceY * distanceY) < (this.half * this.half);
  };

  return BubbleClass;

})();

var BubbleGeneratorClass;

BubbleGeneratorClass = (function() {
  function BubbleGeneratorClass() {
    this.bubblesArray = [];
    this.bubblesArrayIds = [];
    this.bubblesToDelete = [];
    this.bubblesToTestForTaps = [];
    this.bubblesOrigin = {
      x: canvas.width / 2,
      y: canvas.height / 2
    };
    this.registerBubbleTapDetectionHandler();
    return this;
  }

  BubbleGeneratorClass.prototype.animationLoopActions = function() {
    if (PlayState.playing) {
      this.generateBubble();
    }
    this.updateBubblesValues();
    this.removeBubblesAfterTap();
    if (this.bubblesToDelete.length > 0) {
      this.destroyBubblesOutsideCanvasBounds();
    }
    return this;
  };

  BubbleGeneratorClass.prototype.destroyBubblesOutsideCanvasBounds = function() {
    this.bubblesToDelete.map((function(_this) {
      return function(bubbleId) {
        var bubble, bubbleIndex;
        bubbleIndex = _this.bubblesArrayIds.indexOf(bubbleId);
        bubble = _this.bubblesArray[bubbleIndex];
        if (bubble != null) {
          if (bubble.isTarget) {
            _this.gameOver();
          }
          return _this.removeBubble(bubble);
        }
      };
    })(this));
    this.bubblesToDelete = [];
    return this;
  };

  BubbleGeneratorClass.prototype.gameOver = function() {
    this.stop();
    this.bubblesArray.map((function(_this) {
      return function(bubble) {
        return bubble.destroying = true;
      };
    })(this));
    PlayState.bubbleSpawnChance = 0;
    Game.over();
    return this;
  };

  BubbleGeneratorClass.prototype.generateBubble = function() {
    var bubble;
    if (Utils.randomPercentage() < PlayState.bubbleSpawnChance) {
      bubble = new BubbleClass();
      this.bubblesArray.push(bubble);
      this.bubblesArrayIds.push(bubble.id);
      if (bubble.isTarget) {
        this.bubblesToTestForTaps.unshift(bubble.id);
      }
    }
    return this;
  };

  BubbleGeneratorClass.prototype.bubbleTapDetectionHandler = function() {
    var bubble, targetHit;
    targetHit = false;
    bubble = false;
    this.bubblesToTestForTaps.map((function(_this) {
      return function(bubbleId) {
        var bubbleIndex, deletionIndex, touchData;
        bubbleIndex = _this.bubblesArrayIds.indexOf(bubbleId);
        bubble = _this.bubblesArray[bubbleIndex];
        touchData = Input.getTouchData(event);
        if ((bubble != null) && bubble.wasTapped(touchData)) {
          deletionIndex = _this.bubblesToTestForTaps.indexOf(bubbleId);
          bubble.destroying = true;
          targetHit = true;
          _this.bubblesToTestForTaps.splice(deletionIndex, 1);
        }
      };
    })(this));
    PlayState.updateComboMultiplier(targetHit);
    if (targetHit) {
      PlayState.updateScore(bubble.size, bubble.finalSize);
    }
    return this;
  };

  BubbleGeneratorClass.prototype.registerBubbleTapDetectionHandler = function() {
    Input.registerHandler('.ui-playing', inputVerb, function() {
      return BubbleGenerator.bubbleTapDetectionHandler();
    }, ['playing']);
    return this;
  };

  BubbleGeneratorClass.prototype.removeBubble = function(bubble) {
    var id, index;
    id = bubble.id;
    index = this.bubblesArrayIds.indexOf(id);
    this.bubblesArray.splice(index, 1);
    this.bubblesArrayIds.splice(index, 1);
    return this;
  };

  BubbleGeneratorClass.prototype.removeBubblesAfterTap = function() {
    this.bubblesArray.map((function(_this) {
      return function(bubble) {
        if (bubble.size < 1) {
          _this.removeBubble(bubble);
        }
      };
    })(this));
    return this;
  };

  BubbleGeneratorClass.prototype.reset = function() {
    this.bubblesArray = [];
    this.bubblesArrayIds = [];
    this.bubblesToDelete = [];
    this.bubblesToTestForTaps = [];
    return this;
  };

  BubbleGeneratorClass.prototype.stop = function() {
    PlayState.update(false);
    PlayState.stopLevelUpIncrement();
    return this;
  };

  BubbleGeneratorClass.prototype.updateBubblesValues = function() {
    this.bubblesArray.map((function(_this) {
      return function(bubble) {
        context.fillStyle = bubble.color;
        context.strokeStyle = bubble.color;
        bubble.updateValues();
      };
    })(this));
    return this;
  };

  return BubbleGeneratorClass;

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
    this.chanceBubbleIsTarget = Config.chanceBubbleIsTarget.easy;
    this.comboMultiplier = this.defaults.comboMultiplier;
    this.level = this.defaults.level;
    this.maxTargetsAtOnce = Config.maxTargetsAtOnce.easy;
    this.minTargetSize = Config.minTargetSize.easy;
    this.bubbleGrowthMultiplier = Config.bubbleGrowthMultiplier.easy;
    this.bubbleSpawnChance = Config.bubbleSpawnChance.easy;
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
    })(this), 2500);
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

var AnimationLoop, BubbleGenerator, Config, Device, Game, Input, PlayState, Scenes, UI, Utils, android, backingStoreRatio, body, canvas, context, debug, devicePixelRatio, hasTouchEvents, inputVerb, oldHeight, oldWidth, ratio;

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

BubbleGenerator = new BubbleGeneratorClass();

PlayState = new PlayStateClass();

UI = new UIClass();

Scenes = new ScenesClass();

AnimationLoop = new AnimationLoopClass();

Game = new GameClass();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkFuaW1hdGlvbkxvb3AuY29mZmVlIiwiQ29uZmlnLmNvZmZlZSIsIkRldmljZS5jb2ZmZWUiLCJHYW1lLmNvZmZlZSIsIklucHV0LmNvZmZlZSIsIlBhcnRpY2xlLmNvZmZlZSIsIlBhcnRpY2xlR2VuZXJhdG9yLmNvZmZlZSIsIlBsYXlTdGF0ZS5jb2ZmZWUiLCJTY2VuZXMuY29mZmVlIiwiVUkuY29mZmVlIiwiVXRpbHMuY29mZmVlIiwiX2Jvb3RzdHJhcC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsSUFBQSxrQkFBQTs7QUFBQTtBQUVlLEVBQUEsNEJBQUEsR0FBQTtBQUVYLElBQUEsSUFBQyxDQUFBLHFCQUFELENBQUEsQ0FBQSxDQUFBO0FBRUEsV0FBTyxJQUFQLENBSlc7RUFBQSxDQUFiOztBQUFBLCtCQU1BLG9CQUFBLEdBQXNCLFNBQUEsR0FBQTtBQUVwQixJQUFBLE1BQU0sQ0FBQyxvQkFBUCxDQUE0QixJQUFDLENBQUEsZUFBN0IsQ0FBQSxDQUFBO0FBRUEsV0FBTyxJQUFQLENBSm9CO0VBQUEsQ0FOdEIsQ0FBQTs7QUFBQSwrQkFZQSxxQkFBQSxHQUF1QixTQUFBLEdBQUE7QUFFckIsSUFBQSxJQUFDLENBQUEsZUFBRCxHQUFtQixNQUFNLENBQUMscUJBQVAsQ0FBNkIsQ0FBQSxTQUFBLEtBQUEsR0FBQTthQUFBLFNBQUEsR0FBQTtBQUU5QyxRQUFBLEtBQUMsQ0FBQSxxQkFBRCxDQUFBLENBQUEsQ0FGOEM7TUFBQSxFQUFBO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE3QixDQUFuQixDQUFBO0FBQUEsSUFNQSxNQUFNLENBQUMsS0FBUCxHQUFlLE1BQU0sQ0FBQyxLQU50QixDQUFBO0FBQUEsSUFRQSxlQUFlLENBQUMsb0JBQWhCLENBQUEsQ0FSQSxDQUFBO0FBVUEsV0FBTyxJQUFQLENBWnFCO0VBQUEsQ0FadkIsQ0FBQTs7NEJBQUE7O0lBRkYsQ0FBQTs7QUNBQSxJQUFBLFdBQUE7O0FBQUE7QUFFRSx3QkFB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QVksTUFBTSxDQUFDLEtBQW5CLENBQUE7QUFBQSxFQUNBLFNBQUEsR0FBWSxNQUFNLENBQUMsTUFEbkIsQ0FBQTtBQUFBLEVBR0EsTUFBTSxDQUFDLEtBQVAsR0FBZ0IsUUFBQSxHQUFZLEtBSDVCLENBQUE7QUFBQSxFQUlBLE1BQU0sQ0FBQyxNQUFQLEdBQWdCLFNBQUEsR0FBWSxLQUo1QixDQUFBO0FBQUEsRUFNQSxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQWIsR0FBc0IsRUFBQSxHQUFHLFFBQUgsR0FBWSxJQU5sQyxDQUFBO0FBQUEsRUFPQSxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQWIsR0FBc0IsRUFBQSxHQUFHLFNBQUgsR0FBYSxJQVBuQyxDQUFBO0FBQUEsRUFTQSxPQUFPLENBQUMsS0FBUixDQUFjLEtBQWQsRUFBcUIsS0FBckIsQ0FUQSxDQURGO0NBcEJBOztBQUFBLE1BaUNBLEdBQXNCLElBQUEsV0FBQSxDQUFBLENBakN0QixDQUFBOztBQUFBLEtBa0NBLEdBQXNCLElBQUEsVUFBQSxDQUFBLENBbEN0QixDQUFBOztBQUFBLE1BbUNBLEdBQXNCLElBQUEsV0FBQSxDQUFBLENBbkN0QixDQUFBOztBQUFBLEtBb0NBLEdBQXNCLElBQUEsVUFBQSxDQUFBLENBcEN0QixDQUFBOztBQUFBLGVBdUNBLEdBQXNCLElBQUEsb0JBQUEsQ0FBQSxDQXZDdEIsQ0FBQTs7QUFBQSxTQXdDQSxHQUFzQixJQUFBLGNBQUEsQ0FBQSxDQXhDdEIsQ0FBQTs7QUFBQSxFQXlDQSxHQUFzQixJQUFBLE9BQUEsQ0FBQSxDQXpDdEIsQ0FBQTs7QUFBQSxNQTBDQSxHQUFzQixJQUFBLFdBQUEsQ0FBQSxDQTFDdEIsQ0FBQTs7QUFBQSxhQTZDQSxHQUFzQixJQUFBLGtCQUFBLENBQUEsQ0E3Q3RCLENBQUE7O0FBQUEsSUFnREEsR0FBc0IsSUFBQSxTQUFBLENBQUEsQ0FoRHRCLENBQUEiLCJmaWxlIjoiYXBwbGljYXRpb24uanMiLCJzb3VyY2VzQ29udGVudCI6WyJcbmNsYXNzIEFuaW1hdGlvbkxvb3BDbGFzc1xuXG4gIGNvbnN0cnVjdG9yOiAtPlxuXG4gICAgQHJlcXVlc3RBbmltYXRpb25GcmFtZSgpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIGNhbmNlbEFuaW1hdGlvbkZyYW1lOiAtPlxuXG4gICAgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lKEBhbmltYXRpb25Mb29wSWQpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHJlcXVlc3RBbmltYXRpb25GcmFtZTogLT5cblxuICAgIEBhbmltYXRpb25Mb29wSWQgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lID0+XG5cbiAgICAgIEByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKVxuXG4gICAgICByZXR1cm5cblxuICAgIGNhbnZhcy53aWR0aCA9IGNhbnZhcy53aWR0aFxuXG4gICAgQnViYmxlR2VuZXJhdG9yLmFuaW1hdGlvbkxvb3BBY3Rpb25zKClcblxuICAgIHJldHVybiB0aGlzXG4iLCJcbmNsYXNzIENvbmZpZ0NsYXNzXG5cbiAgY2hhbmNlQnViYmxlSXNUYXJnZXQ6XG4gICAgZWFzeTogICAgICA1MFxuICAgIGRpZmZpY3VsdDogOTBcblxuICBsZXZlbFVwSW50ZXJ2YWw6IDVcblxuICBtYXhMZXZlbDogNTBcblxuICBtYXhMaW5lV2lkdGg6IDVcblxuICBtYXhUYXJnZXRzQXRPbmNlOlxuICAgIGVhc3k6ICAgICAgM1xuICAgIGRpZmZpY3VsdDogNlxuXG4gIGJ1YmJsZUdyb3d0aE11bHRpcGxpZXI6XG4gICAgZWFzeTogICAgICAxLjA1XG4gICAgZGlmZmljdWx0OiAxLjEwXG5cbiAgYnViYmxlU3Bhd25DaGFuY2U6XG4gICAgZWFzeTogICAgICA2MFxuICAgIGRpZmZpY3VsdDogMTAwXG5cbiAgYnViYmxlRGlhbWV0ZXJBc1BlcmNlbnRhZ2VPZlNjcmVlbjogMTVcblxuICBwb2ludHNQZXJQb3A6IDEwXG5cbiAgcHJvcGVydGllc1RvVXBkYXRlV2l0aERpZmZpY3VsdHk6IFtcbiAgICAnYnViYmxlU3Bhd25DaGFuY2UnXG4gICAgJ2NoYW5jZUJ1YmJsZUlzVGFyZ2V0J1xuICAgICdidWJibGVHcm93dGhNdWx0aXBsaWVyJ1xuICAgICdzaXplTWF4J1xuICAgICdtYXhUYXJnZXRzQXRPbmNlJ1xuICAgICdtaW5UYXJnZXRTaXplJ1xuICAgICd2ZWxvY2l0eU1pbidcbiAgICAndmVsb2NpdHlNYXgnXG4gICAgJ3RhcmdldFZlbG9jaXR5TXVsdGlwbGllcidcbiAgXVxuXG4gIHRhcmdldFZlbG9jaXR5TXVsdGlwbGllcjpcbiAgICBlYXN5OiAgICAgIDAuM1xuICAgIGRpZmZpY3VsdDogMC41XG5cbiAgdmVsb2NpdHlNaW46XG4gICAgZWFzeTogICAgICAtNlxuICAgIGRpZmZpY3VsdDogLTEwXG5cbiAgdmVsb2NpdHlNYXg6XG4gICAgZWFzeTogICAgICA2XG4gICAgZGlmZmljdWx0OiAxMFxuXG4gIGNvbnN0cnVjdG9yOiAtPlxuXG4gICAgYmFzZVNjcmVlbldpZHRoID0gTWF0aC5taW4oYm9keS5jbGllbnRXaWR0aCwgYm9keS5jbGllbnRIZWlnaHQpIC8gMTAwXG4gICAgYmFzZUJ1YmJsZVdpZHRoID0gTWF0aC5yb3VuZChiYXNlU2NyZWVuV2lkdGggKiBAYnViYmxlRGlhbWV0ZXJBc1BlcmNlbnRhZ2VPZlNjcmVlbilcbiAgICBAYmFzZUJ1YmJsZVNpemUgPSBiYXNlQnViYmxlV2lkdGggKiBkZXZpY2VQaXhlbFJhdGlvXG5cbiAgICBAbWluVGFyZ2V0U2l6ZSA9XG4gICAgICBlYXN5OiAgICAgIEBiYXNlQnViYmxlU2l6ZSAqIDAuN1xuICAgICAgZGlmZmljdWx0OiBAYmFzZUJ1YmJsZVNpemUgKiAwLjRcblxuICAgIEBzaXplTWF4ID1cbiAgICAgIGVhc3k6ICAgICAgQGJhc2VCdWJibGVTaXplXG4gICAgICBkaWZmaWN1bHQ6IEBiYXNlQnViYmxlU2l6ZSAqIDAuNlxuXG4gICAgcmV0dXJuIHRoaXNcblxuICB1cGRhdGVWYWx1ZXNGb3JEaWZmaWN1bHR5OiAtPlxuXG4gICAgQHByb3BlcnRpZXNUb1VwZGF0ZVdpdGhEaWZmaWN1bHR5Lm1hcCAocHJvcGVydHkpID0+XG4gICAgICBwcm9wZXJ0eUNvbmZpZyAgPSBAW3Byb3BlcnR5XVxuICAgICAgdmFsdWVEaWZmZXJlbmNlID0gcHJvcGVydHlDb25maWcuZGlmZmljdWx0IC0gcHJvcGVydHlDb25maWcuZWFzeVxuICAgICAgbGV2ZWxNdWxpdHBsaWVyID0gUGxheVN0YXRlLmxldmVsIC8gQG1heExldmVsXG5cbiAgICAgIFBsYXlTdGF0ZVtwcm9wZXJ0eV0gPSAodmFsdWVEaWZmZXJlbmNlICogbGV2ZWxNdWxpdHBsaWVyKSArIHByb3BlcnR5Q29uZmlnLmVhc3lcblxuICAgICAgcmV0dXJuXG5cbiAgICByZXR1cm4gdGhpc1xuIiwiXG5jbGFzcyBEZXZpY2VDbGFzc1xuXG4gIGNvbnN0cnVjdG9yOiAtPlxuXG4gICAgcmV0dXJuIHRoaXNcbiIsIlxuY2xhc3MgR2FtZUNsYXNzXG5cbiAgY29uc3RydWN0b3I6IC0+XG5cbiAgICBTY2VuZXMuaWRlbnQoKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBvdmVyOiAtPlxuXG4gICAgU2NlbmVzLmdhbWVPdmVyKClcblxuICAgIFBsYXlTdGF0ZS5zdG9wTGV2ZWxVcEluY3JlbWVudCgpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHN0YXJ0OiAtPlxuXG4gICAgUGxheVN0YXRlLnJlc2V0KClcbiAgICBVSS5yZXNldCgpXG4gICAgSW5wdXQucmVtb3ZlR2FtZVN0YXJ0VGFwRXZlbnRIYW5kbGVyKClcbiAgICBCdWJibGVHZW5lcmF0b3IucmVzZXQoKVxuXG4gICAgU2NlbmVzLnBsYXlpbmcoKVxuXG4gICAgcmV0dXJuIHRoaXNcbiIsIlxuY2xhc3MgSW5wdXRDbGFzc1xuXG4gIGNvbnN0cnVjdG9yOiAtPlxuXG4gICAgQGNhbmNlbFRvdWNoTW92ZUV2ZW50cygpXG5cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciBpbnB1dFZlcmIsIChldmVudCkgLT5cbiAgICAgIGNvbnNvbGUubG9nIGV2ZW50LnRhcmdldC5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpXG4gICAgICByZXR1cm5cblxuICAgIHJldHVybiB0aGlzXG5cbiAgY2FuY2VsVG91Y2hNb3ZlRXZlbnRzOiAtPlxuXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIgJ3RvdWNobW92ZScsIChldmVudCkgLT5cbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcblxuICAgICAgcmV0dXJuXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIGdhbWVTdGFydFRhcEV2ZW50SGFuZGxlcjogKCkgLT5cblxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcblxuICAgIEdhbWUuc3RhcnQoKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBnZXRUb3VjaERhdGE6IChldmVudCkgLT5cblxuICAgIGlmIHRvdWNoRGF0YVxuICAgICAgdGFwQ29vcmRpbmF0ZXMgPSBldmVudC50b3VjaGVzWzBdXG4gICAgZWxzZVxuICAgICAgdG91Y2hEYXRhID1cbiAgICAgICAgcGFnZVg6IGV2ZW50LmNsaWVudFgsXG4gICAgICAgIHBhZ2VZOiBldmVudC5jbGllbnRZXG5cbiAgICByZXR1cm4gdG91Y2hEYXRhXG5cbiAgcmVnaXN0ZXJIYW5kbGVyOiAoc2VsZWN0b3IsIGFjdGlvbiwgY2FsbGJhY2ssIHNjZW5lcykgLT5cblxuICAgIGlmIHR5cGVvZiBzY2VuZXMgPT0gJ3N0cmluZydcbiAgICAgIHNjZW5lX3N0cmluZyA9IHNjZW5lc1xuICAgICAgc2NlbmVzID0gW3NjZW5lX3N0cmluZ11cblxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpLmFkZEV2ZW50TGlzdGVuZXIgaW5wdXRWZXJiLCAoZXZlbnQpID0+XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICBjYWxsYmFjay5hcHBseSgpIGlmIHNjZW5lcy5sZW5ndGggPT0gMCB8fCBTY2VuZXMuY3VycmVudCBpbiBzY2VuZXNcbiAgICAgIHJldHVyblxuXG4gICAgcmV0dXJuIHRoaXNcblxuICByZW1vdmVHYW1lU3RhcnRUYXBFdmVudEhhbmRsZXI6IC0+XG5cbiAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUV2ZW50TGlzdGVuZXIoaW5wdXRWZXJiLCBAZ2FtZVN0YXJ0VGFwRXZlbnRIYW5kbGVyKVxuXG4gICAgcmV0dXJuIHRoaXNcbiIsIlxuY2xhc3MgQnViYmxlQ2xhc3NcblxuICBkZXN0cm95aW5nOiBmYWxzZVxuICBzaXplOiAgICAgICAxXG5cbiAgY29uc3RydWN0b3I6IC0+XG5cbiAgICByID0gVXRpbHMucmFuZG9tSW50ZWdlcigwLCAyMDApXG4gICAgZyA9IFV0aWxzLnJhbmRvbUludGVnZXIoMCwgMjAwKVxuICAgIGIgPSBVdGlscy5yYW5kb21JbnRlZ2VyKDAsIDIwMClcbiAgICBhID0gVXRpbHMucmFuZG9tKDAuNzUsIDEpXG5cbiAgICBAY29sb3IgICAgICA9IFwicmdiYSgje3J9LCAje2d9LCAje2J9LCAje2F9KVwiXG4gICAgQGZpbmFsU2l6ZSAgPSBVdGlscy5yYW5kb21JbnRlZ2VyKDAsIFBsYXlTdGF0ZS5zaXplTWF4KVxuICAgIEBpZCAgICAgICAgID0gTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyKDIsIDUpXG4gICAgQGlzVGFyZ2V0ICAgPSBAZGV0ZXJtaW5lVGFyZ2V0QnViYmxlKClcbiAgICBAcG9zaXRpb24gICA9XG4gICAgICB4OiBCdWJibGVHZW5lcmF0b3IuYnViYmxlc09yaWdpbi54XG4gICAgICB5OiBCdWJibGVHZW5lcmF0b3IuYnViYmxlc09yaWdpbi55XG4gICAgQHZlbG9jaXR5ICAgPVxuICAgICAgeDogVXRpbHMucmFuZG9tKFBsYXlTdGF0ZS52ZWxvY2l0eU1pbiwgUGxheVN0YXRlLnZlbG9jaXR5TWF4KVxuICAgICAgeTogVXRpbHMucmFuZG9tKFBsYXlTdGF0ZS52ZWxvY2l0eU1pbiwgUGxheVN0YXRlLnZlbG9jaXR5TWF4KVxuXG4gICAgaWYgQGlzVGFyZ2V0XG4gICAgICBAY29sb3IgICAgID0gXCJyZ2JhKCN7cn0sICN7Z30sICN7Yn0sIDAuOClcIlxuICAgICAgQGZpbmFsU2l6ZSA9IFV0aWxzLnJhbmRvbUludGVnZXIoUGxheVN0YXRlLm1pblRhcmdldFNpemUsIFBsYXlTdGF0ZS5zaXplTWF4KVxuXG4gICAgICBAdmVsb2NpdHkueCAqPSBQbGF5U3RhdGUudGFyZ2V0VmVsb2NpdHlNdWx0aXBsaWVyXG4gICAgICBAdmVsb2NpdHkueSAqPSBQbGF5U3RhdGUudGFyZ2V0VmVsb2NpdHlNdWx0aXBsaWVyXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIGRldGVybWluZVRhcmdldEJ1YmJsZTogLT5cblxuICAgIGlzVGFyZ2V0ID0gZmFsc2VcblxuICAgIGlmIEJ1YmJsZUdlbmVyYXRvci5idWJibGVzVG9UZXN0Rm9yVGFwcy5sZW5ndGggPCBQbGF5U3RhdGUubWF4VGFyZ2V0c0F0T25jZVxuICAgICAgaXNUYXJnZXQgPSBVdGlscy5yYW5kb21QZXJjZW50YWdlKCkgPCBQbGF5U3RhdGUuY2hhbmNlQnViYmxlSXNUYXJnZXRcblxuICAgIHJldHVybiBpc1RhcmdldFxuXG4gIGRyYXc6IC0+XG5cbiAgICBpZiBAb3V0c2lkZUNhbnZhc0JvdW5kcygpXG4gICAgICBCdWJibGVHZW5lcmF0b3IuYnViYmxlc1RvRGVsZXRlLnB1c2goQGlkKVxuXG4gICAgICByZXR1cm5cblxuICAgIGlmIEBpc1RhcmdldFxuICAgICAgQGxpbmVXaWR0aCA9IEBzaXplIC8gMTBcblxuICAgICAgaWYgQGxpbmVXaWR0aCA+IENvbmZpZy5tYXhMaW5lV2lkdGhcbiAgICAgICAgQGxpbmVXaWR0aCA9IENvbmZpZy5tYXhMaW5lV2lkdGhcblxuICAgICAgY29udGV4dC5maWxsU3R5bGUgPSAncmdiYSgyNDcsIDI0NywgMjQ3LCAwLjkpJ1xuICAgICAgY29udGV4dC5saW5lV2lkdGggPSBAbGluZVdpZHRoXG5cbiAgICBjb250ZXh0LmJlZ2luUGF0aCgpXG4gICAgY29udGV4dC5hcmMoQHBvc2l0aW9uLngsIEBwb3NpdGlvbi55LCBAaGFsZiwgMCwgTWF0aC5QSSAqIDIsIHRydWUpXG4gICAgY29udGV4dC5maWxsKClcbiAgICBjb250ZXh0LnN0cm9rZSgpIGlmIEBpc1RhcmdldFxuICAgIGNvbnRleHQuY2xvc2VQYXRoKClcblxuICAgIHJldHVybiB0aGlzXG5cbiAgb3V0c2lkZUNhbnZhc0JvdW5kczogLT5cblxuICAgIGJleW9uZEJvdW5kc1ggPSBAcG9zaXRpb24ueCA8IC0oQGZpbmFsU2l6ZSkgb3IgQHBvc2l0aW9uLnggPiBjYW52YXMud2lkdGggICsgQGZpbmFsU2l6ZVxuICAgIGJleW9uZEJvdW5kc1kgPSBAcG9zaXRpb24ueSA8IC0oQGZpbmFsU2l6ZSkgb3IgQHBvc2l0aW9uLnkgPiBjYW52YXMuaGVpZ2h0ICsgQGZpbmFsU2l6ZVxuXG4gICAgcmV0dXJuIGJleW9uZEJvdW5kc1ggb3IgYmV5b25kQm91bmRzWVxuXG4gIHVwZGF0ZVZhbHVlczogLT5cblxuICAgIGlmIEBkZXN0cm95aW5nXG4gICAgICBzaHJpbmtNdWx0aXBsaWVyID0gaWYgUGxheVN0YXRlLnBsYXlpbmcgdGhlbiAwLjcgZWxzZSAwLjlcblxuICAgICAgQHNpemUgKj0gc2hyaW5rTXVsdGlwbGllclxuICAgIGVsc2VcbiAgICAgIGlmIEBzaXplIDwgQGZpbmFsU2l6ZVxuICAgICAgICBAc2l6ZSAqPSBQbGF5U3RhdGUuYnViYmxlR3Jvd3RoTXVsdGlwbGllclxuXG4gICAgICBpZiBAc2l6ZSA+IEBmaW5hbFNpemVcbiAgICAgICAgQHNpemUgPSBAZmluYWxTaXplXG5cbiAgICBAaGFsZiA9IEBzaXplIC8gMlxuXG4gICAgQHBvc2l0aW9uLnggKz0gQHZlbG9jaXR5LnhcbiAgICBAcG9zaXRpb24ueSArPSBAdmVsb2NpdHkueVxuXG4gICAgQGRyYXcoKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICB3YXNUYXBwZWQ6ICh0b3VjaERhdGEpIC0+XG5cbiAgICB0YXBYICAgICAgPSB0b3VjaERhdGEucGFnZVggKiBkZXZpY2VQaXhlbFJhdGlvXG4gICAgdGFwWSAgICAgID0gdG91Y2hEYXRhLnBhZ2VZICogZGV2aWNlUGl4ZWxSYXRpb1xuICAgIGRpc3RhbmNlWCA9IHRhcFggLSBAcG9zaXRpb24ueFxuICAgIGRpc3RhbmNlWSA9IHRhcFkgLSBAcG9zaXRpb24ueVxuICAgIHJhZGl1cyAgICA9IEBoYWxmXG5cbiAgICByZXR1cm4gKGRpc3RhbmNlWCAqIGRpc3RhbmNlWCkgKyAoZGlzdGFuY2VZICogZGlzdGFuY2VZKSA8IChAaGFsZiAqIEBoYWxmKVxuIiwiXG5jbGFzcyBCdWJibGVHZW5lcmF0b3JDbGFzc1xuXG4gIGNvbnN0cnVjdG9yOiAtPlxuXG4gICAgQGJ1YmJsZXNBcnJheSAgICAgICAgID0gW11cbiAgICBAYnViYmxlc0FycmF5SWRzICAgICAgPSBbXVxuICAgIEBidWJibGVzVG9EZWxldGUgICAgICA9IFtdXG4gICAgQGJ1YmJsZXNUb1Rlc3RGb3JUYXBzID0gW11cblxuICAgIEBidWJibGVzT3JpZ2luID1cbiAgICAgIHg6IGNhbnZhcy53aWR0aCAgLyAyXG4gICAgICB5OiBjYW52YXMuaGVpZ2h0IC8gMlxuXG4gICAgQHJlZ2lzdGVyQnViYmxlVGFwRGV0ZWN0aW9uSGFuZGxlcigpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIGFuaW1hdGlvbkxvb3BBY3Rpb25zOiAtPlxuXG4gICAgaWYgUGxheVN0YXRlLnBsYXlpbmdcbiAgICAgIEBnZW5lcmF0ZUJ1YmJsZSgpXG5cbiAgICBAdXBkYXRlQnViYmxlc1ZhbHVlcygpXG4gICAgQHJlbW92ZUJ1YmJsZXNBZnRlclRhcCgpXG5cbiAgICBpZiBAYnViYmxlc1RvRGVsZXRlLmxlbmd0aCA+IDBcbiAgICAgIEBkZXN0cm95QnViYmxlc091dHNpZGVDYW52YXNCb3VuZHMoKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBkZXN0cm95QnViYmxlc091dHNpZGVDYW52YXNCb3VuZHM6IC0+XG5cbiAgICBAYnViYmxlc1RvRGVsZXRlLm1hcCAoYnViYmxlSWQpID0+XG4gICAgICBidWJibGVJbmRleCA9IEBidWJibGVzQXJyYXlJZHMuaW5kZXhPZihidWJibGVJZClcbiAgICAgIGJ1YmJsZSAgICAgID0gQGJ1YmJsZXNBcnJheVtidWJibGVJbmRleF1cblxuICAgICAgaWYgYnViYmxlP1xuICAgICAgICBAZ2FtZU92ZXIoKSBpZiBidWJibGUuaXNUYXJnZXRcbiAgICAgICAgQHJlbW92ZUJ1YmJsZShidWJibGUpXG5cbiAgICBAYnViYmxlc1RvRGVsZXRlID0gW11cblxuICAgIHJldHVybiB0aGlzXG5cbiAgZ2FtZU92ZXI6IC0+XG5cbiAgICBAc3RvcCgpXG5cbiAgICBAYnViYmxlc0FycmF5Lm1hcCAoYnViYmxlKSA9PlxuICAgICAgYnViYmxlLmRlc3Ryb3lpbmcgPSB0cnVlXG5cbiAgICBQbGF5U3RhdGUuYnViYmxlU3Bhd25DaGFuY2UgPSAwXG5cbiAgICBHYW1lLm92ZXIoKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBnZW5lcmF0ZUJ1YmJsZTogLT5cblxuICAgIGlmIFV0aWxzLnJhbmRvbVBlcmNlbnRhZ2UoKSA8IFBsYXlTdGF0ZS5idWJibGVTcGF3bkNoYW5jZVxuICAgICAgYnViYmxlID0gbmV3IEJ1YmJsZUNsYXNzKClcblxuICAgICAgQGJ1YmJsZXNBcnJheS5wdXNoKGJ1YmJsZSlcbiAgICAgIEBidWJibGVzQXJyYXlJZHMucHVzaChidWJibGUuaWQpXG5cbiAgICAgIGlmIGJ1YmJsZS5pc1RhcmdldFxuICAgICAgICBAYnViYmxlc1RvVGVzdEZvclRhcHMudW5zaGlmdChidWJibGUuaWQpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIGJ1YmJsZVRhcERldGVjdGlvbkhhbmRsZXI6ICgpIC0+XG5cbiAgICB0YXJnZXRIaXQgPSBmYWxzZVxuICAgIGJ1YmJsZSAgPSBmYWxzZVxuXG4gICAgQGJ1YmJsZXNUb1Rlc3RGb3JUYXBzLm1hcCAoYnViYmxlSWQpID0+XG4gICAgICBidWJibGVJbmRleCA9IEBidWJibGVzQXJyYXlJZHMuaW5kZXhPZihidWJibGVJZClcbiAgICAgIGJ1YmJsZSAgICAgID0gQGJ1YmJsZXNBcnJheVtidWJibGVJbmRleF1cbiAgICAgIHRvdWNoRGF0YSAgICAgPSBJbnB1dC5nZXRUb3VjaERhdGEoZXZlbnQpXG5cbiAgICAgIGlmIGJ1YmJsZT8gYW5kIGJ1YmJsZS53YXNUYXBwZWQodG91Y2hEYXRhKVxuICAgICAgICBkZWxldGlvbkluZGV4ICAgICAgID0gQGJ1YmJsZXNUb1Rlc3RGb3JUYXBzLmluZGV4T2YoYnViYmxlSWQpXG4gICAgICAgIGJ1YmJsZS5kZXN0cm95aW5nID0gdHJ1ZVxuICAgICAgICB0YXJnZXRIaXQgICAgICAgICAgID0gdHJ1ZVxuXG4gICAgICAgIEBidWJibGVzVG9UZXN0Rm9yVGFwcy5zcGxpY2UoZGVsZXRpb25JbmRleCwgMSlcblxuICAgICAgICByZXR1cm5cblxuICAgIFBsYXlTdGF0ZS51cGRhdGVDb21ib011bHRpcGxpZXIodGFyZ2V0SGl0KVxuXG4gICAgUGxheVN0YXRlLnVwZGF0ZVNjb3JlKGJ1YmJsZS5zaXplLCBidWJibGUuZmluYWxTaXplKSBpZiB0YXJnZXRIaXRcblxuICAgIHJldHVybiB0aGlzXG5cbiAgcmVnaXN0ZXJCdWJibGVUYXBEZXRlY3Rpb25IYW5kbGVyOiAtPlxuXG4gICAgSW5wdXQucmVnaXN0ZXJIYW5kbGVyICcudWktcGxheWluZycsIGlucHV0VmVyYiwgLT5cbiAgICAgIEJ1YmJsZUdlbmVyYXRvci5idWJibGVUYXBEZXRlY3Rpb25IYW5kbGVyKClcbiAgICAsIFsncGxheWluZyddXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHJlbW92ZUJ1YmJsZTogKGJ1YmJsZSkgLT5cblxuICAgIGlkICAgID0gYnViYmxlLmlkXG4gICAgaW5kZXggPSBAYnViYmxlc0FycmF5SWRzLmluZGV4T2YoaWQpXG5cbiAgICBAYnViYmxlc0FycmF5LnNwbGljZShpbmRleCwgMSlcbiAgICBAYnViYmxlc0FycmF5SWRzLnNwbGljZShpbmRleCwgMSlcblxuICAgIHJldHVybiB0aGlzXG5cbiAgcmVtb3ZlQnViYmxlc0FmdGVyVGFwOiAtPlxuXG4gICAgQGJ1YmJsZXNBcnJheS5tYXAgKGJ1YmJsZSkgPT5cbiAgICAgIEByZW1vdmVCdWJibGUoYnViYmxlKSBpZiBidWJibGUuc2l6ZSA8IDFcblxuICAgICAgcmV0dXJuXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHJlc2V0OiAtPlxuXG4gICAgQGJ1YmJsZXNBcnJheSAgICAgICAgID0gW11cbiAgICBAYnViYmxlc0FycmF5SWRzICAgICAgPSBbXVxuICAgIEBidWJibGVzVG9EZWxldGUgICAgICA9IFtdXG4gICAgQGJ1YmJsZXNUb1Rlc3RGb3JUYXBzID0gW11cblxuICAgIHJldHVybiB0aGlzXG5cbiAgc3RvcDogLT5cblxuICAgIFBsYXlTdGF0ZS51cGRhdGUoZmFsc2UpXG4gICAgUGxheVN0YXRlLnN0b3BMZXZlbFVwSW5jcmVtZW50KClcblxuICAgIHJldHVybiB0aGlzXG5cbiAgdXBkYXRlQnViYmxlc1ZhbHVlczogLT5cblxuICAgIEBidWJibGVzQXJyYXkubWFwIChidWJibGUpID0+XG4gICAgICBjb250ZXh0LmZpbGxTdHlsZSAgID0gYnViYmxlLmNvbG9yXG4gICAgICBjb250ZXh0LnN0cm9rZVN0eWxlID0gYnViYmxlLmNvbG9yXG5cbiAgICAgIGJ1YmJsZS51cGRhdGVWYWx1ZXMoKVxuXG4gICAgICByZXR1cm5cblxuICAgIHJldHVybiB0aGlzXG4iLCJcbmNsYXNzIFBsYXlTdGF0ZUNsYXNzXG5cbiAgZGVmYXVsdHM6XG4gICAgY29tYm9NdWx0aXBsaWVyOiAwXG4gICAgbGV2ZWw6ICAgICAgICAgICAxXG4gICAgc2NvcmU6ICAgICAgICAgICAwXG5cbiAgcmVzZXQ6IC0+XG5cbiAgICBAY2hhbmNlQnViYmxlSXNUYXJnZXQgICAgID0gQ29uZmlnLmNoYW5jZUJ1YmJsZUlzVGFyZ2V0LmVhc3lcbiAgICBAY29tYm9NdWx0aXBsaWVyICAgICAgICAgID0gQGRlZmF1bHRzLmNvbWJvTXVsdGlwbGllclxuICAgIEBsZXZlbCAgICAgICAgICAgICAgICAgICAgPSBAZGVmYXVsdHMubGV2ZWxcbiAgICBAbWF4VGFyZ2V0c0F0T25jZSAgICAgICAgID0gQ29uZmlnLm1heFRhcmdldHNBdE9uY2UuZWFzeVxuICAgIEBtaW5UYXJnZXRTaXplICAgICAgICAgICAgPSBDb25maWcubWluVGFyZ2V0U2l6ZS5lYXN5XG4gICAgQGJ1YmJsZUdyb3d0aE11bHRpcGxpZXIgICA9IENvbmZpZy5idWJibGVHcm93dGhNdWx0aXBsaWVyLmVhc3lcbiAgICBAYnViYmxlU3Bhd25DaGFuY2UgICAgICAgID0gQ29uZmlnLmJ1YmJsZVNwYXduQ2hhbmNlLmVhc3lcbiAgICBAc2NvcmUgICAgICAgICAgICAgICAgICAgID0gQGRlZmF1bHRzLnNjb3JlXG4gICAgQHNpemVNYXggICAgICAgICAgICAgICAgICA9IENvbmZpZy5zaXplTWF4LmVhc3lcbiAgICBAdGFyZ2V0VmVsb2NpdHlNdWx0aXBsaWVyID0gQ29uZmlnLnRhcmdldFZlbG9jaXR5TXVsdGlwbGllci5lYXN5XG4gICAgQHZlbG9jaXR5TWluICAgICAgICAgICAgICA9IENvbmZpZy52ZWxvY2l0eU1pbi5lYXN5XG4gICAgQHZlbG9jaXR5TWF4ICAgICAgICAgICAgICA9IENvbmZpZy52ZWxvY2l0eU1heC5lYXN5XG5cbiAgICBAdXBkYXRlKHRydWUpXG5cbiAgICBDb25maWcudXBkYXRlVmFsdWVzRm9yRGlmZmljdWx0eSgpXG5cbiAgICBAc2V0dXBMZXZlbFVwSW5jcmVtZW50KClcblxuICAgIHJldHVybiB0aGlzXG5cbiAgc3RvcExldmVsVXBJbmNyZW1lbnQ6IC0+XG5cbiAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbChAbGV2ZWxVcENvdW50ZXIpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHNldHVwTGV2ZWxVcEluY3JlbWVudDogLT5cblxuICAgIEBsZXZlbFVwQ291bnRlciA9IHdpbmRvdy5zZXRJbnRlcnZhbCA9PlxuXG4gICAgICBAdXBkYXRlTGV2ZWwoKVxuXG4gICAgICByZXR1cm5cblxuICAgICwgQ29uZmlnLmxldmVsVXBJbnRlcnZhbCAqIDEwMDBcblxuICAgIHJldHVybiB0aGlzXG5cbiAgdXBkYXRlQ29tYm9NdWx0aXBsaWVyOiAodGFyZ2V0SGl0KSAtPlxuXG4gICAgQGNvbWJvTXVsdGlwbGllciA9IGlmIHRhcmdldEhpdCB0aGVuIEBjb21ib011bHRpcGxpZXIgKyAxIGVsc2UgQGRlZmF1bHRzLmNvbWJvTXVsdGlwbGllclxuXG4gICAgVUkudXBkYXRlQ29tYm9NdWx0aXBsaWVyQ291bnRlcigpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHVwZGF0ZTogKG5ld1N0YXRlKSAtPlxuXG4gICAgQHBsYXlpbmcgPSBuZXdTdGF0ZVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICB1cGRhdGVMZXZlbDogLT5cblxuICAgIEBsZXZlbCArPSAxXG5cbiAgICBpZiBAbGV2ZWwgPj0gQ29uZmlnLm1heExldmVsXG4gICAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbChAbGV2ZWxVcENvdW50ZXIpXG5cbiAgICBVSS51cGRhdGVMZXZlbENvdW50ZXIoKVxuICAgIENvbmZpZy51cGRhdGVWYWx1ZXNGb3JEaWZmaWN1bHR5KClcblxuICAgIHJldHVybiB0aGlzXG5cbiAgdXBkYXRlU2NvcmU6IChzaXplV2hlblRhcHBlZCwgc2l6ZVdoZW5GdWxseUdyb3duKSAtPlxuXG4gICAgIygoZGVmYXVsdFNjb3JlUGVyUG9wICsgKDEwMCAtICgoc2l6ZVdoZW5UYXBwZWQgLyBzaXplV2hlbkZ1bGx5R3Jvd24pICogMTAwKSkpICogY29tYm9NdWx0aXBsaWVyKSAqIChsZXZlbE51bWJlciArIDEpXG5cbiAgICB0YXJnZXRTaXplQm9udXMgPSBNYXRoLnJvdW5kKDEwMCAtICgoc2l6ZVdoZW5UYXBwZWQgLyBzaXplV2hlbkZ1bGx5R3Jvd24pICogMTAwKSlcbiAgICBwb3BQb2ludFZhbHVlICAgPSBDb25maWcucG9pbnRzUGVyUG9wICsgdGFyZ2V0U2l6ZUJvbnVzXG4gICAgbGV2ZWxNdWx0aXBsaWVyID0gQGxldmVsICsgMVxuXG4gICAgQHNjb3JlICs9IChwb3BQb2ludFZhbHVlICogQGNvbWJvTXVsdGlwbGllcikgKiAobGV2ZWxNdWx0aXBsaWVyKVxuXG4gICAgVUkudXBkYXRlU2NvcmVDb3VudGVyKClcblxuICAgIHJldHVybiB0aGlzXG4iLCJcbmNsYXNzIFNjZW5lc0NsYXNzXG5cbiAgQGN1cnJlbnQgPSBudWxsXG5cbiAgY3JlZGl0czogLT5cblxuICAgIEBjdXJyZW50ID0gJ2NyZWRpdHMnXG5cbiAgICBVSS51cGRhdGVCb2R5Q2xhc3MoJ2NyZWRpdHMnKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBnYW1lT3ZlcjogLT5cblxuICAgIEBjdXJyZW50ID0gJ2dhbWUtb3ZlcidcblxuICAgIFVJLnVwZGF0ZUJvZHlDbGFzcygnZ2FtZS1vdmVyJylcblxuICAgIHJldHVybiB0aGlzXG5cbiAgbGVhZGVyYm9hcmQ6IC0+XG5cbiAgICBAY3VycmVudCA9ICdsZWFkZXJib2FyZCdcblxuICAgIHJldHVybiB0aGlzXG5cbiAgcGxheWluZzogLT5cblxuICAgIEBjdXJyZW50ID0gJ3BsYXlpbmcnXG5cbiAgICBVSS51cGRhdGVCb2R5Q2xhc3MoJ3BsYXlpbmcnKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBpZGVudDogLT5cblxuICAgIEBjdXJyZW50ID0gJ2lkZW50J1xuXG4gICAgVUkudXBkYXRlQm9keUNsYXNzKCdpZGVudCcpXG5cbiAgICB3aW5kb3cuc2V0VGltZW91dCA9PlxuICAgICAgQHRpdGxlKClcbiAgICAsIDI1MDBcblxuICAgIHJldHVybiB0aGlzXG5cbiAgdGl0bGU6IC0+XG5cbiAgICBAY3VycmVudCA9ICd0aXRsZSdcblxuICAgIFVJLnVwZGF0ZUJvZHlDbGFzcygndGl0bGUnKVxuXG4gICAgcmV0dXJuIHRoaXNcbiIsIlxuY2xhc3MgVUlDbGFzc1xuXG4gIGNvbnN0cnVjdG9yOiAtPlxuXG4gICAgQHNldHVwQmFzaWNJbnRlcmZhY2VFdmVudHMoKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICByZXNldDogLT5cblxuICAgIEBsZXZlbENvdW50ZXIgICAgICAgICAgID0gVXRpbHMuJCgnLmh1ZC12YWx1ZS1sZXZlbCcpXG4gICAgQHNjb3JlQ291bnRlciAgICAgICAgICAgPSBVdGlscy4kKCcuaHVkLXZhbHVlLXNjb3JlJylcbiAgICBAY29tYm9NdWx0aXBsaWVyQ291bnRlciA9IFV0aWxzLiQoJy5odWQtdmFsdWUtY29tYm8nKVxuICAgIEBwbGF5QWdhaW4gICAgICAgICAgICAgID0gVXRpbHMuJCgnLnBsYXktYWdhaW4nKVxuXG4gICAgQHVwZGF0ZUNvbWJvTXVsdGlwbGllckNvdW50ZXIoKVxuICAgIEB1cGRhdGVMZXZlbENvdW50ZXIoKVxuICAgIEB1cGRhdGVTY29yZUNvdW50ZXIoKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBzZXR1cEJhc2ljSW50ZXJmYWNlRXZlbnRzOiAtPlxuXG4gICAgSW5wdXQucmVnaXN0ZXJIYW5kbGVyICcuZ2FtZS1sb2dvJywgaW5wdXRWZXJiLCAtPlxuICAgICAgSW5wdXQuZ2FtZVN0YXJ0VGFwRXZlbnRIYW5kbGVyKClcbiAgICAsIFsndGl0bGUnXVxuXG4gICAgSW5wdXQucmVnaXN0ZXJIYW5kbGVyICcucGxheS1hZ2FpbicsIGlucHV0VmVyYiwgLT5cbiAgICAgIElucHV0LmdhbWVTdGFydFRhcEV2ZW50SGFuZGxlcigpXG4gICAgLCBbJ2dhbWUtb3ZlciddXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHVwZGF0ZUJvZHlDbGFzczogKGNsYXNzTmFtZSkgLT5cblxuICAgIGJvZHkuY2xhc3NOYW1lID0gJydcbiAgICBib2R5LmNsYXNzTGlzdC5hZGQoJ3NjZW5lLScgKyBjbGFzc05hbWUpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHVwZGF0ZUNvbWJvTXVsdGlwbGllckNvdW50ZXI6IC0+XG5cbiAgICBVdGlscy51cGRhdGVVSVRleHROb2RlKEBjb21ib011bHRpcGxpZXJDb3VudGVyLCBQbGF5U3RhdGUuY29tYm9NdWx0aXBsaWVyKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICB1cGRhdGVMZXZlbENvdW50ZXI6IC0+XG5cbiAgICBVdGlscy51cGRhdGVVSVRleHROb2RlKEBsZXZlbENvdW50ZXIsIFBsYXlTdGF0ZS5sZXZlbClcblxuICAgIHJldHVybiB0aGlzXG5cbiAgdXBkYXRlU2NvcmVDb3VudGVyOiAtPlxuXG4gICAgc2NvcmVUb0Zvcm1hdCA9IFV0aWxzLmZvcm1hdFdpdGhDb21tYShQbGF5U3RhdGUuc2NvcmUpXG5cbiAgICBVdGlscy51cGRhdGVVSVRleHROb2RlKEBzY29yZUNvdW50ZXIsIHNjb3JlVG9Gb3JtYXQpXG5cbiAgICByZXR1cm4gdGhpc1xuIiwiXG5jbGFzcyBVdGlsc0NsYXNzXG5cbiAgJDogKHNlbGVjdG9yKSAtPlxuICAgIGlmIHNlbGVjdG9yLnN1YnN0cigwLCAxKSA9PSAnIydcbiAgICAgIHJldHVybiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChzZWxlY3RvcilcblxuICAgIGVscyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpXG5cbiAgICBpZiBlbHMubGVuZ3RoID09IDFcbiAgICAgIHJldHVybiBlbHNbMF1cblxuICAgIHJldHVybiBlbHNcblxuICBjb3JyZWN0VmFsdWVGb3JEUFI6ICh2YWx1ZSwgaW50ZWdlciA9IGZhbHNlKSAtPlxuXG4gICAgdmFsdWUgKj0gZGV2aWNlUGl4ZWxSYXRpb1xuXG4gICAgaWYgaW50ZWdlclxuICAgICAgdmFsdWUgPSBNYXRoLnJvdW5kKHZhbHVlKVxuXG4gICAgcmV0dXJuIHZhbHVlXG5cbiAgZm9ybWF0V2l0aENvbW1hOiAobnVtKSAtPlxuXG4gICAgcmV0dXJuIG51bS50b1N0cmluZygpLnJlcGxhY2UoL1xcQig/PShcXGR7M30pKyg/IVxcZCkpL2csIFwiLFwiKVxuXG4gIHJhbmRvbTogKG1pbiwgbWF4KSAtPlxuXG4gICAgaWYgbWluID09IHVuZGVmaW5lZFxuICAgICAgbWluID0gMFxuICAgICAgbWF4ID0gMVxuICAgIGVsc2UgaWYgbWF4ID09IHVuZGVmaW5lZFxuICAgICAgbWF4ID0gbWluXG4gICAgICBtaW4gPSAwXG5cbiAgICByZXR1cm4gKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluKSkgKyBtaW47XG5cbiAgcmFuZG9tQ29sb3I6IChhbHBoYSA9IGZhbHNlKSAtPlxuXG4gICAgY29sb3JzID1cbiAgICAgIHI6IHRoaXMucmFuZG9tSW50ZWdlcigwLCAyMDApXG4gICAgICBnOiB0aGlzLnJhbmRvbUludGVnZXIoMCwgMjAwKVxuICAgICAgYjogdGhpcy5yYW5kb21JbnRlZ2VyKDAsIDIwMClcbiAgICAgIGE6IGlmICFhbHBoYSB0aGVuIHRoaXMucmFuZG9tKDAuNzUsIDEpIGVsc2UgYWxwaGFcblxuICAgIHJldHVybiAncmdiYSgnICsgY29sb3JzLnIgKyAnLCAnICsgY29sb3JzLmcgKyAnLCAnICsgY29sb3JzLmIgKyAnLCAnICsgY29sb3JzLmEgKyAnKSdcblxuICByYW5kb21JbnRlZ2VyOiAobWluLCBtYXgpIC0+XG5cbiAgICBpZiBtYXggPT0gdW5kZWZpbmVkXG4gICAgICBtYXggPSBtaW5cbiAgICAgIG1pbiA9IDBcblxuICAgIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAobWF4ICsgMSAtIG1pbikpICsgbWluXG5cbiAgcmFuZG9tUGVyY2VudGFnZTogLT5cblxuICAgIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxMDApXG5cbiAgdXBkYXRlVUlUZXh0Tm9kZTogKGVsZW1lbnQsIHZhbHVlKSAtPlxuXG4gICAgZWxlbWVudC5pbm5lckhUTUwgPSB2YWx1ZVxuXG4gICAgcmV0dXJuIHRoaXNcbiIsIlxuZGVidWcgPSB0cnVlXG5cbmFuZHJvaWQgICAgICAgID0gaWYgbmF2aWdhdG9yLnVzZXJBZ2VudC5tYXRjaCgvYW5kcm9pZC9pKSB0aGVuIHRydWUgZWxzZSBmYWxzZVxuYm9keSAgICAgICAgICAgPSBkb2N1bWVudC5ib2R5XG5jYW52YXMgICAgICAgICA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5jYW52YXMnKVxuaGFzVG91Y2hFdmVudHMgPSB3aW5kb3cuaGFzT3duUHJvcGVydHkoJ29udG91Y2hzdGFydCcpIHx8IHdpbmRvdy5oYXNPd25Qcm9wZXJ0eSgnb25tc2dlc3R1cmVjaGFuZ2UnKVxuaW5wdXRWZXJiICAgICAgPSBpZiBoYXNUb3VjaEV2ZW50cyB0aGVuICd0b3VjaHN0YXJ0JyBlbHNlICdjbGljaydcblxuY2FudmFzLmNsYXNzTmFtZSA9ICdjYW52YXMnXG5jYW52YXMud2lkdGggICAgID0gYm9keS5jbGllbnRXaWR0aFxuY2FudmFzLmhlaWdodCAgICA9IGJvZHkuY2xpZW50SGVpZ2h0XG5cbmNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKVxuXG5jb250ZXh0Lmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9ICdzb3VyY2UtYXRvcCdcblxuZGV2aWNlUGl4ZWxSYXRpbyAgPSB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyB8fCAxXG5iYWNraW5nU3RvcmVSYXRpbyA9IGNvbnRleHQud2Via2l0QmFja2luZ1N0b3JlUGl4ZWxSYXRpbyB8fCBjb250ZXh0LmJhY2tpbmdTdG9yZVBpeGVsUmF0aW8gfHwgMVxucmF0aW8gICAgICAgICAgICAgPSBkZXZpY2VQaXhlbFJhdGlvIC8gYmFja2luZ1N0b3JlUmF0aW9cblxuaWYgZGV2aWNlUGl4ZWxSYXRpbyAhPSBiYWNraW5nU3RvcmVSYXRpb1xuICBvbGRXaWR0aCAgPSBjYW52YXMud2lkdGhcbiAgb2xkSGVpZ2h0ID0gY2FudmFzLmhlaWdodFxuXG4gIGNhbnZhcy53aWR0aCAgPSBvbGRXaWR0aCAgKiByYXRpb1xuICBjYW52YXMuaGVpZ2h0ID0gb2xkSGVpZ2h0ICogcmF0aW9cblxuICBjYW52YXMuc3R5bGUud2lkdGggID0gXCIje29sZFdpZHRofXB4XCJcbiAgY2FudmFzLnN0eWxlLmhlaWdodCA9IFwiI3tvbGRIZWlnaHR9cHhcIlxuXG4gIGNvbnRleHQuc2NhbGUocmF0aW8sIHJhdGlvKVxuXG4jIFNldCBlbnZpcm9ubWVudCBhbmQgYmFzZSBjb25maWcgZXRjXG5EZXZpY2UgICAgICAgICAgPSBuZXcgRGV2aWNlQ2xhc3MoKVxuVXRpbHMgICAgICAgICAgID0gbmV3IFV0aWxzQ2xhc3MoKVxuQ29uZmlnICAgICAgICAgID0gbmV3IENvbmZpZ0NsYXNzKClcbklucHV0ICAgICAgICAgICA9IG5ldyBJbnB1dENsYXNzKClcblxuIyBMb2FkIHRoZSBnYW1lIGxvZ2ljIGFuZCBhbGwgdGhhdFxuQnViYmxlR2VuZXJhdG9yID0gbmV3IEJ1YmJsZUdlbmVyYXRvckNsYXNzKClcblBsYXlTdGF0ZSAgICAgICA9IG5ldyBQbGF5U3RhdGVDbGFzcygpXG5VSSAgICAgICAgICAgICAgPSBuZXcgVUlDbGFzcygpXG5TY2VuZXMgICAgICAgICAgPSBuZXcgU2NlbmVzQ2xhc3MoKVxuXG4jIFNldCBvZmYgdGhlIGNhbnZhcyBhbmltYXRpb24gbG9vcFxuQW5pbWF0aW9uTG9vcCAgID0gbmV3IEFuaW1hdGlvbkxvb3BDbGFzcygpXG5cbiMgU3RhcnQgdGhlIGFjdHVhbCBnYW1lXG5HYW1lICAgICAgICAgICAgPSBuZXcgR2FtZUNsYXNzKClcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==