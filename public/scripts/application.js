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

var BubbleClass;

BubbleClass = (function() {
  BubbleClass.prototype.alpha = 0.75;

  BubbleClass.prototype.destroying = false;

  BubbleClass.prototype.size = 1;

  function BubbleClass() {
    this.color = Utils.randomColor();
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
      this.alpha = 0.8;
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
    var distanceX, distanceY, radius, tapX, tapY, tapped;
    tapX = touchData.pageX * devicePixelRatio;
    tapY = touchData.pageY * devicePixelRatio;
    distanceX = tapX - this.position.x;
    distanceY = tapY - this.position.y;
    radius = this.half;
    tapped = (distanceX * distanceX) + (distanceY * distanceY) < (this.half * this.half);
    if (tapped) {
      Utils.console("Bubble#" + this.id + " tapped at " + tapX + ", " + tapY);
    } else {
      Utils.console("Combo Broken!");
    }
    return tapped;
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
    this.bubblesArray.map(function(bubble) {
      context.fillStyle = Utils.rgba(bubble.color, bubble.alpha);
      context.strokeStyle = Utils.rgba(bubble.color, bubble.alpha);
      bubble.updateValues();
    });
    return this;
  };

  return BubbleGeneratorClass;

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
    window.addEventListener(inputVerb, function(event) {}, false);
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
    var touchData;
    if (hasTouchEvents) {
      return event.touches[0];
    }
    touchData = {
      pageX: event.clientX,
      pageY: event.clientY
    };
    return touchData;
  };

  InputClass.prototype.registerHandler = function(selector, action, callback, scenes) {
    var element, scene;
    console.log("Input.regsiterHandler(" + selector + ", " + action + ", " + callback + ", " + scenes + ")");
    if (typeof scenes === 'string') {
      scene = scenes;
      scenes = [scene];
    }
    element = document.querySelector(selector);
    element.addEventListener(action, (function(_this) {
      return function(event) {
        var _ref;
        event.preventDefault();
        console.log("Calling " + action + " input on " + element + " in " + Scenes.current + ")");
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
    Utils.console('Load Scene: Credits');
    UI.updateBodyClass('credits');
    return this;
  };

  ScenesClass.prototype.gameOver = function() {
    this.current = 'game-over';
    Utils.console('Load Scene: Game Over');
    UI.updateBodyClass('game-over');
    return this;
  };

  ScenesClass.prototype.leaderboard = function() {
    this.current = 'leaderboard';
    Utils.console('Load Scene: Leaderboard');
    return this;
  };

  ScenesClass.prototype.playing = function() {
    this.current = 'playing';
    Utils.console('Load Scene: Playing');
    UI.updateBodyClass('playing');
    return this;
  };

  ScenesClass.prototype.ident = function() {
    this.current = 'ident';
    Utils.console('Load Scene: Ident');
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
    Utils.console('Load Scene: Title Screen');
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
    if (selector === body) {
      return document.body;
    }
    if (selector.substr(0, 1) === '#') {
      return document.getElementById(selector);
    }
    els = document.querySelectorAll(selector);
    if (els.length === 1) {
      return els[0];
    }
    return els;
  };

  UtilsClass.prototype.console = function(content) {
    var console;
    console = this.$('.console');
    this.updateUITextNode(console, content);
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

  UtilsClass.prototype.randomColor = function() {
    var b, g, r;
    r = this.randomInteger(0, 200);
    g = this.randomInteger(0, 200);
    b = this.randomInteger(0, 200);
    return "" + r + ", " + g + ", " + b;
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

  UtilsClass.prototype.rgba = function(color, alpha) {
    if (!alpha) {
      alpha = 1;
    }
    return "rgba(" + color + ", " + alpha + ")";
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkFuaW1hdGlvbkxvb3AuY29mZmVlIiwiQnViYmxlLmNvZmZlZSIsIkJ1YmJsZUdlbmVyYXRvci5jb2ZmZWUiLCJDb25maWcuY29mZmVlIiwiRGV2aWNlLmNvZmZlZSIsIkdhbWUuY29mZmVlIiwiSW5wdXQuY29mZmVlIiwiUGxheVN0YXRlLmNvZmZlZSIsIlNjZW5lcy5jb2ZmZWUiLCJVSS5jb2ZmZWUiLCJVdGlscy5jb2ZmZWUiLCJfYm9vdHN0cmFwLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxJQUFBLGtCQUFBOztBQUFBO0FBRWUsRUFBQSw0QkFBQSxHQUFBO0FBRVgsSUFBQSxJQUFDLENBQUEscUJBQUQsQ0FBQSxDQUFBLENBQUE7QUFFQSxXQUFPLElBQVAsQ0FKVztFQUFBLENBQWI7O0FBQUEsK0JBTUEsb0JBQUEsR0FBc0IsU0FBQSxHQUFBO0FBRXBCLElBQUEsTUFBTSxDQUFDLG9CQUFQLENBQTRCLElBQUMsQ0FBQSxlQUE3QixDQUFBLENBQUE7QUFFQSxXQUFPLElBQVAsQ0FKb0I7RUFBQSxDQU50QixDQUFBOztBQUFBLCtCQVlBLHFCQUFBLEdBQXVCLFNBQUEsR0FBQTtBQUVyQixJQUFBLElBQUMsQ0FBQSxlQUFELEdBQW1CLE1BQU0sQ0FBQyxxQkFBUCxDQUE2QixDQUFBLFNBQUEsS0FBQSxHQUFBO2FBQUEsU0FBQSxHQUFBO0FBRTlDLFFBQUEsS0FBQyxDQUFBLHFCQUFELENBQUEsQ0FBQSxDQUY4QztNQUFBLEVBQUE7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTdCLENBQW5CLENBQUE7QUFBQSxJQU1BLE1BQU0sQ0FBQyxLQUFQLEdBQWUsTUFBTSxDQUFDLEtBTnRCLENBQUE7QUFBQSxJQVFBLGVBQWUsQ0FBQyxvQkFBaEIsQ0FBQSxDQVJBLENBQUE7QUFVQSxXQUFPLElBQVAsQ0FacUI7RUFBQSxDQVp2QixDQUFBOzs0QkFBQTs7SUFGRixDQUFBOztBQ0FBLElBQUEsV0FBQTs7QUFBQTtBQUVFLHdCQUFBLEtB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QyxLQUFSLENBQWMsS0FBZCxFQUFxQixLQUFyQixDQVRBLENBREY7Q0FwQkE7O0FBQUEsTUFpQ0EsR0FBc0IsSUFBQSxXQUFBLENBQUEsQ0FqQ3RCLENBQUE7O0FBQUEsS0FrQ0EsR0FBc0IsSUFBQSxVQUFBLENBQUEsQ0FsQ3RCLENBQUE7O0FBQUEsTUFtQ0EsR0FBc0IsSUFBQSxXQUFBLENBQUEsQ0FuQ3RCLENBQUE7O0FBQUEsS0FvQ0EsR0FBc0IsSUFBQSxVQUFBLENBQUEsQ0FwQ3RCLENBQUE7O0FBQUEsZUF1Q0EsR0FBc0IsSUFBQSxvQkFBQSxDQUFBLENBdkN0QixDQUFBOztBQUFBLFNBd0NBLEdBQXNCLElBQUEsY0FBQSxDQUFBLENBeEN0QixDQUFBOztBQUFBLEVBeUNBLEdBQXNCLElBQUEsT0FBQSxDQUFBLENBekN0QixDQUFBOztBQUFBLE1BMENBLEdBQXNCLElBQUEsV0FBQSxDQUFBLENBMUN0QixDQUFBOztBQUFBLGFBNkNBLEdBQXNCLElBQUEsa0JBQUEsQ0FBQSxDQTdDdEIsQ0FBQTs7QUFBQSxJQWdEQSxHQUFzQixJQUFBLFNBQUEsQ0FBQSxDQWhEdEIsQ0FBQSIsImZpbGUiOiJhcHBsaWNhdGlvbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIlxuY2xhc3MgQW5pbWF0aW9uTG9vcENsYXNzXG5cbiAgY29uc3RydWN0b3I6IC0+XG5cbiAgICBAcmVxdWVzdEFuaW1hdGlvbkZyYW1lKClcblxuICAgIHJldHVybiB0aGlzXG5cbiAgY2FuY2VsQW5pbWF0aW9uRnJhbWU6IC0+XG5cbiAgICB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUoQGFuaW1hdGlvbkxvb3BJZClcblxuICAgIHJldHVybiB0aGlzXG5cbiAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lOiAtPlxuXG4gICAgQGFuaW1hdGlvbkxvb3BJZCA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPT5cblxuICAgICAgQHJlcXVlc3RBbmltYXRpb25GcmFtZSgpXG5cbiAgICAgIHJldHVyblxuXG4gICAgY2FudmFzLndpZHRoID0gY2FudmFzLndpZHRoXG5cbiAgICBCdWJibGVHZW5lcmF0b3IuYW5pbWF0aW9uTG9vcEFjdGlvbnMoKVxuXG4gICAgcmV0dXJuIHRoaXNcbiIsIlxuY2xhc3MgQnViYmxlQ2xhc3NcblxuICBhbHBoYTogICAgICAwLjc1XG4gIGRlc3Ryb3lpbmc6IGZhbHNlXG4gIHNpemU6ICAgICAgIDFcblxuICBjb25zdHJ1Y3RvcjogLT5cblxuICAgIEBjb2xvciAgICAgID0gVXRpbHMucmFuZG9tQ29sb3IoKVxuICAgIEBmaW5hbFNpemUgID0gVXRpbHMucmFuZG9tSW50ZWdlcigwLCBQbGF5U3RhdGUuc2l6ZU1heClcbiAgICBAaWQgICAgICAgICA9IE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cigyLCA1KVxuICAgIEBpc1RhcmdldCAgID0gQGRldGVybWluZVRhcmdldEJ1YmJsZSgpXG4gICAgQHBvc2l0aW9uICAgPVxuICAgICAgeDogQnViYmxlR2VuZXJhdG9yLmJ1YmJsZXNPcmlnaW4ueFxuICAgICAgeTogQnViYmxlR2VuZXJhdG9yLmJ1YmJsZXNPcmlnaW4ueVxuICAgIEB2ZWxvY2l0eSAgID1cbiAgICAgIHg6IFV0aWxzLnJhbmRvbShQbGF5U3RhdGUudmVsb2NpdHlNaW4sIFBsYXlTdGF0ZS52ZWxvY2l0eU1heClcbiAgICAgIHk6IFV0aWxzLnJhbmRvbShQbGF5U3RhdGUudmVsb2NpdHlNaW4sIFBsYXlTdGF0ZS52ZWxvY2l0eU1heClcblxuICAgIGlmIEBpc1RhcmdldFxuICAgICAgQGFscGhhICAgICA9IDAuOFxuICAgICAgQGZpbmFsU2l6ZSA9IFV0aWxzLnJhbmRvbUludGVnZXIoUGxheVN0YXRlLm1pblRhcmdldFNpemUsIFBsYXlTdGF0ZS5zaXplTWF4KVxuXG4gICAgICBAdmVsb2NpdHkueCAqPSBQbGF5U3RhdGUudGFyZ2V0VmVsb2NpdHlNdWx0aXBsaWVyXG4gICAgICBAdmVsb2NpdHkueSAqPSBQbGF5U3RhdGUudGFyZ2V0VmVsb2NpdHlNdWx0aXBsaWVyXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIGRldGVybWluZVRhcmdldEJ1YmJsZTogLT5cblxuICAgIGlzVGFyZ2V0ID0gZmFsc2VcblxuICAgIGlmIEJ1YmJsZUdlbmVyYXRvci5idWJibGVzVG9UZXN0Rm9yVGFwcy5sZW5ndGggPCBQbGF5U3RhdGUubWF4VGFyZ2V0c0F0T25jZVxuICAgICAgaXNUYXJnZXQgPSBVdGlscy5yYW5kb21QZXJjZW50YWdlKCkgPCBQbGF5U3RhdGUuY2hhbmNlQnViYmxlSXNUYXJnZXRcblxuICAgIHJldHVybiBpc1RhcmdldFxuXG4gIGRyYXc6IC0+XG5cbiAgICBpZiBAb3V0c2lkZUNhbnZhc0JvdW5kcygpXG4gICAgICBCdWJibGVHZW5lcmF0b3IuYnViYmxlc1RvRGVsZXRlLnB1c2goQGlkKVxuXG4gICAgICByZXR1cm5cblxuICAgIGlmIEBpc1RhcmdldFxuICAgICAgQGxpbmVXaWR0aCA9IEBzaXplIC8gMTBcblxuICAgICAgaWYgQGxpbmVXaWR0aCA+IENvbmZpZy5tYXhMaW5lV2lkdGhcbiAgICAgICAgQGxpbmVXaWR0aCA9IENvbmZpZy5tYXhMaW5lV2lkdGhcblxuICAgICAgY29udGV4dC5maWxsU3R5bGUgPSAncmdiYSgyNDcsIDI0NywgMjQ3LCAwLjkpJ1xuICAgICAgY29udGV4dC5saW5lV2lkdGggPSBAbGluZVdpZHRoXG5cbiAgICBjb250ZXh0LmJlZ2luUGF0aCgpXG4gICAgY29udGV4dC5hcmMoQHBvc2l0aW9uLngsIEBwb3NpdGlvbi55LCBAaGFsZiwgMCwgTWF0aC5QSSAqIDIsIHRydWUpXG4gICAgY29udGV4dC5maWxsKClcbiAgICBjb250ZXh0LnN0cm9rZSgpIGlmIEBpc1RhcmdldFxuICAgIGNvbnRleHQuY2xvc2VQYXRoKClcblxuICAgIHJldHVybiB0aGlzXG5cbiAgb3V0c2lkZUNhbnZhc0JvdW5kczogLT5cblxuICAgIGJleW9uZEJvdW5kc1ggPSBAcG9zaXRpb24ueCA8IC0oQGZpbmFsU2l6ZSkgb3IgQHBvc2l0aW9uLnggPiBjYW52YXMud2lkdGggICsgQGZpbmFsU2l6ZVxuICAgIGJleW9uZEJvdW5kc1kgPSBAcG9zaXRpb24ueSA8IC0oQGZpbmFsU2l6ZSkgb3IgQHBvc2l0aW9uLnkgPiBjYW52YXMuaGVpZ2h0ICsgQGZpbmFsU2l6ZVxuXG4gICAgcmV0dXJuIGJleW9uZEJvdW5kc1ggb3IgYmV5b25kQm91bmRzWVxuXG4gIHVwZGF0ZVZhbHVlczogLT5cblxuICAgIGlmIEBkZXN0cm95aW5nXG4gICAgICBzaHJpbmtNdWx0aXBsaWVyID0gaWYgUGxheVN0YXRlLnBsYXlpbmcgdGhlbiAwLjcgZWxzZSAwLjlcblxuICAgICAgQHNpemUgKj0gc2hyaW5rTXVsdGlwbGllclxuICAgIGVsc2VcbiAgICAgIGlmIEBzaXplIDwgQGZpbmFsU2l6ZVxuICAgICAgICBAc2l6ZSAqPSBQbGF5U3RhdGUuYnViYmxlR3Jvd3RoTXVsdGlwbGllclxuXG4gICAgICBpZiBAc2l6ZSA+IEBmaW5hbFNpemVcbiAgICAgICAgQHNpemUgPSBAZmluYWxTaXplXG5cbiAgICBAaGFsZiA9IEBzaXplIC8gMlxuXG4gICAgQHBvc2l0aW9uLnggKz0gQHZlbG9jaXR5LnhcbiAgICBAcG9zaXRpb24ueSArPSBAdmVsb2NpdHkueVxuXG4gICAgQGRyYXcoKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICB3YXNUYXBwZWQ6ICh0b3VjaERhdGEpIC0+XG5cbiAgICB0YXBYICAgICAgPSB0b3VjaERhdGEucGFnZVggKiBkZXZpY2VQaXhlbFJhdGlvXG4gICAgdGFwWSAgICAgID0gdG91Y2hEYXRhLnBhZ2VZICogZGV2aWNlUGl4ZWxSYXRpb1xuICAgIGRpc3RhbmNlWCA9IHRhcFggLSBAcG9zaXRpb24ueFxuICAgIGRpc3RhbmNlWSA9IHRhcFkgLSBAcG9zaXRpb24ueVxuICAgIHJhZGl1cyAgICA9IEBoYWxmXG5cblxuXG4gICAgdGFwcGVkID0gKGRpc3RhbmNlWCAqIGRpc3RhbmNlWCkgKyAoZGlzdGFuY2VZICogZGlzdGFuY2VZKSA8IChAaGFsZiAqIEBoYWxmKVxuXG4gICAgaWYgdGFwcGVkXG4gICAgICBVdGlscy5jb25zb2xlKFwiQnViYmxlIyN7QGlkfSB0YXBwZWQgYXQgI3t0YXBYfSwgI3t0YXBZfVwiKVxuICAgIGVsc2VcbiAgICAgIFV0aWxzLmNvbnNvbGUoXCJDb21ibyBCcm9rZW4hXCIpXG5cbiAgICByZXR1cm4gdGFwcGVkXG4iLCJcbmNsYXNzIEJ1YmJsZUdlbmVyYXRvckNsYXNzXG5cbiAgY29uc3RydWN0b3I6IC0+XG5cbiAgICBAYnViYmxlc0FycmF5ICAgICAgICAgPSBbXVxuICAgIEBidWJibGVzQXJyYXlJZHMgICAgICA9IFtdXG4gICAgQGJ1YmJsZXNUb0RlbGV0ZSAgICAgID0gW11cbiAgICBAYnViYmxlc1RvVGVzdEZvclRhcHMgPSBbXVxuXG4gICAgQGJ1YmJsZXNPcmlnaW4gPVxuICAgICAgeDogY2FudmFzLndpZHRoICAvIDJcbiAgICAgIHk6IGNhbnZhcy5oZWlnaHQgLyAyXG5cbiAgICBAcmVnaXN0ZXJCdWJibGVUYXBEZXRlY3Rpb25IYW5kbGVyKClcblxuICAgIHJldHVybiB0aGlzXG5cbiAgYW5pbWF0aW9uTG9vcEFjdGlvbnM6IC0+XG5cbiAgICBpZiBQbGF5U3RhdGUucGxheWluZ1xuICAgICAgQGdlbmVyYXRlQnViYmxlKClcblxuICAgIEB1cGRhdGVCdWJibGVzVmFsdWVzKClcbiAgICBAcmVtb3ZlQnViYmxlc0FmdGVyVGFwKClcblxuICAgIGlmIEBidWJibGVzVG9EZWxldGUubGVuZ3RoID4gMFxuICAgICAgQGRlc3Ryb3lCdWJibGVzT3V0c2lkZUNhbnZhc0JvdW5kcygpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIGRlc3Ryb3lCdWJibGVzT3V0c2lkZUNhbnZhc0JvdW5kczogLT5cblxuICAgIEBidWJibGVzVG9EZWxldGUubWFwIChidWJibGVJZCkgPT5cbiAgICAgIGJ1YmJsZUluZGV4ID0gQGJ1YmJsZXNBcnJheUlkcy5pbmRleE9mKGJ1YmJsZUlkKVxuICAgICAgYnViYmxlICAgICAgPSBAYnViYmxlc0FycmF5W2J1YmJsZUluZGV4XVxuXG4gICAgICBpZiBidWJibGU/XG4gICAgICAgIEBnYW1lT3ZlcigpIGlmIGJ1YmJsZS5pc1RhcmdldFxuICAgICAgICBAcmVtb3ZlQnViYmxlKGJ1YmJsZSlcblxuICAgIEBidWJibGVzVG9EZWxldGUgPSBbXVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBnYW1lT3ZlcjogLT5cblxuICAgIEBzdG9wKClcblxuICAgIEBidWJibGVzQXJyYXkubWFwIChidWJibGUpID0+XG4gICAgICBidWJibGUuZGVzdHJveWluZyA9IHRydWVcblxuICAgIFBsYXlTdGF0ZS5idWJibGVTcGF3bkNoYW5jZSA9IDBcblxuICAgIEdhbWUub3ZlcigpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIGdlbmVyYXRlQnViYmxlOiAtPlxuXG4gICAgaWYgVXRpbHMucmFuZG9tUGVyY2VudGFnZSgpIDwgUGxheVN0YXRlLmJ1YmJsZVNwYXduQ2hhbmNlXG4gICAgICBidWJibGUgPSBuZXcgQnViYmxlQ2xhc3MoKVxuXG4gICAgICBAYnViYmxlc0FycmF5LnB1c2goYnViYmxlKVxuICAgICAgQGJ1YmJsZXNBcnJheUlkcy5wdXNoKGJ1YmJsZS5pZClcblxuICAgICAgaWYgYnViYmxlLmlzVGFyZ2V0XG4gICAgICAgIEBidWJibGVzVG9UZXN0Rm9yVGFwcy51bnNoaWZ0KGJ1YmJsZS5pZClcblxuICAgIHJldHVybiB0aGlzXG5cbiAgYnViYmxlVGFwRGV0ZWN0aW9uSGFuZGxlcjogKCkgLT5cblxuICAgIHRhcmdldEhpdCA9IGZhbHNlXG4gICAgYnViYmxlICA9IGZhbHNlXG5cbiAgICBAYnViYmxlc1RvVGVzdEZvclRhcHMubWFwIChidWJibGVJZCkgPT5cbiAgICAgIGJ1YmJsZUluZGV4ID0gQGJ1YmJsZXNBcnJheUlkcy5pbmRleE9mKGJ1YmJsZUlkKVxuICAgICAgYnViYmxlICAgICAgPSBAYnViYmxlc0FycmF5W2J1YmJsZUluZGV4XVxuICAgICAgdG91Y2hEYXRhICAgPSBJbnB1dC5nZXRUb3VjaERhdGEoZXZlbnQpXG5cbiAgICAgIGlmIGJ1YmJsZT8gYW5kIGJ1YmJsZS53YXNUYXBwZWQodG91Y2hEYXRhKVxuICAgICAgICBkZWxldGlvbkluZGV4ICAgICAgID0gQGJ1YmJsZXNUb1Rlc3RGb3JUYXBzLmluZGV4T2YoYnViYmxlSWQpXG4gICAgICAgIGJ1YmJsZS5kZXN0cm95aW5nID0gdHJ1ZVxuICAgICAgICB0YXJnZXRIaXQgICAgICAgICAgID0gdHJ1ZVxuXG4gICAgICAgIEBidWJibGVzVG9UZXN0Rm9yVGFwcy5zcGxpY2UoZGVsZXRpb25JbmRleCwgMSlcblxuICAgICAgICByZXR1cm5cblxuICAgIFBsYXlTdGF0ZS51cGRhdGVDb21ib011bHRpcGxpZXIodGFyZ2V0SGl0KVxuXG4gICAgUGxheVN0YXRlLnVwZGF0ZVNjb3JlKGJ1YmJsZS5zaXplLCBidWJibGUuZmluYWxTaXplKSBpZiB0YXJnZXRIaXRcblxuICAgIHJldHVybiB0aGlzXG5cbiAgcmVnaXN0ZXJCdWJibGVUYXBEZXRlY3Rpb25IYW5kbGVyOiAtPlxuXG4gICAgSW5wdXQucmVnaXN0ZXJIYW5kbGVyICcudWktcGxheWluZycsIGlucHV0VmVyYiwgLT5cbiAgICAgIEJ1YmJsZUdlbmVyYXRvci5idWJibGVUYXBEZXRlY3Rpb25IYW5kbGVyKClcbiAgICAsIFsncGxheWluZyddXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHJlbW92ZUJ1YmJsZTogKGJ1YmJsZSkgLT5cblxuICAgIGlkICAgID0gYnViYmxlLmlkXG4gICAgaW5kZXggPSBAYnViYmxlc0FycmF5SWRzLmluZGV4T2YoaWQpXG5cbiAgICBAYnViYmxlc0FycmF5LnNwbGljZShpbmRleCwgMSlcbiAgICBAYnViYmxlc0FycmF5SWRzLnNwbGljZShpbmRleCwgMSlcblxuICAgIHJldHVybiB0aGlzXG5cbiAgcmVtb3ZlQnViYmxlc0FmdGVyVGFwOiAtPlxuXG4gICAgQGJ1YmJsZXNBcnJheS5tYXAgKGJ1YmJsZSkgPT5cbiAgICAgIEByZW1vdmVCdWJibGUoYnViYmxlKSBpZiBidWJibGUuc2l6ZSA8IDFcblxuICAgICAgcmV0dXJuXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHJlc2V0OiAtPlxuXG4gICAgQGJ1YmJsZXNBcnJheSAgICAgICAgID0gW11cbiAgICBAYnViYmxlc0FycmF5SWRzICAgICAgPSBbXVxuICAgIEBidWJibGVzVG9EZWxldGUgICAgICA9IFtdXG4gICAgQGJ1YmJsZXNUb1Rlc3RGb3JUYXBzID0gW11cblxuICAgIHJldHVybiB0aGlzXG5cbiAgc3RvcDogLT5cblxuICAgIFBsYXlTdGF0ZS51cGRhdGUoZmFsc2UpXG4gICAgUGxheVN0YXRlLnN0b3BMZXZlbFVwSW5jcmVtZW50KClcblxuICAgIHJldHVybiB0aGlzXG5cbiAgdXBkYXRlQnViYmxlc1ZhbHVlczogLT5cblxuICAgIEBidWJibGVzQXJyYXkubWFwIChidWJibGUpIC0+XG4gICAgICBjb250ZXh0LmZpbGxTdHlsZSAgID0gVXRpbHMucmdiYShidWJibGUuY29sb3IsIGJ1YmJsZS5hbHBoYSlcbiAgICAgIGNvbnRleHQuc3Ryb2tlU3R5bGUgPSBVdGlscy5yZ2JhKGJ1YmJsZS5jb2xvciwgYnViYmxlLmFscGhhKVxuXG4gICAgICBidWJibGUudXBkYXRlVmFsdWVzKClcblxuICAgICAgcmV0dXJuXG5cbiAgICByZXR1cm4gdGhpc1xuIiwiXG5jbGFzcyBDb25maWdDbGFzc1xuXG4gIGNoYW5jZUJ1YmJsZUlzVGFyZ2V0OlxuICAgIGVhc3k6ICAgICAgNTBcbiAgICBkaWZmaWN1bHQ6IDkwXG5cbiAgbGV2ZWxVcEludGVydmFsOiA1XG5cbiAgbWF4TGV2ZWw6IDUwXG5cbiAgbWF4TGluZVdpZHRoOiA1XG5cbiAgbWF4VGFyZ2V0c0F0T25jZTpcbiAgICBlYXN5OiAgICAgIDNcbiAgICBkaWZmaWN1bHQ6IDZcblxuICBidWJibGVHcm93dGhNdWx0aXBsaWVyOlxuICAgIGVhc3k6ICAgICAgMS4wNVxuICAgIGRpZmZpY3VsdDogMS4xMFxuXG4gIGJ1YmJsZVNwYXduQ2hhbmNlOlxuICAgIGVhc3k6ICAgICAgNjBcbiAgICBkaWZmaWN1bHQ6IDEwMFxuXG4gIGJ1YmJsZURpYW1ldGVyQXNQZXJjZW50YWdlT2ZTY3JlZW46IDE1XG5cbiAgcG9pbnRzUGVyUG9wOiAxMFxuXG4gIHByb3BlcnRpZXNUb1VwZGF0ZVdpdGhEaWZmaWN1bHR5OiBbXG4gICAgJ2J1YmJsZVNwYXduQ2hhbmNlJ1xuICAgICdjaGFuY2VCdWJibGVJc1RhcmdldCdcbiAgICAnYnViYmxlR3Jvd3RoTXVsdGlwbGllcidcbiAgICAnc2l6ZU1heCdcbiAgICAnbWF4VGFyZ2V0c0F0T25jZSdcbiAgICAnbWluVGFyZ2V0U2l6ZSdcbiAgICAndmVsb2NpdHlNaW4nXG4gICAgJ3ZlbG9jaXR5TWF4J1xuICAgICd0YXJnZXRWZWxvY2l0eU11bHRpcGxpZXInXG4gIF1cblxuICB0YXJnZXRWZWxvY2l0eU11bHRpcGxpZXI6XG4gICAgZWFzeTogICAgICAwLjNcbiAgICBkaWZmaWN1bHQ6IDAuNVxuXG4gIHZlbG9jaXR5TWluOlxuICAgIGVhc3k6ICAgICAgLTZcbiAgICBkaWZmaWN1bHQ6IC0xMFxuXG4gIHZlbG9jaXR5TWF4OlxuICAgIGVhc3k6ICAgICAgNlxuICAgIGRpZmZpY3VsdDogMTBcblxuICBjb25zdHJ1Y3RvcjogLT5cblxuICAgIGJhc2VTY3JlZW5XaWR0aCA9IE1hdGgubWluKGJvZHkuY2xpZW50V2lkdGgsIGJvZHkuY2xpZW50SGVpZ2h0KSAvIDEwMFxuICAgIGJhc2VCdWJibGVXaWR0aCA9IE1hdGgucm91bmQoYmFzZVNjcmVlbldpZHRoICogQGJ1YmJsZURpYW1ldGVyQXNQZXJjZW50YWdlT2ZTY3JlZW4pXG4gICAgQGJhc2VCdWJibGVTaXplID0gYmFzZUJ1YmJsZVdpZHRoICogZGV2aWNlUGl4ZWxSYXRpb1xuXG4gICAgQG1pblRhcmdldFNpemUgPVxuICAgICAgZWFzeTogICAgICBAYmFzZUJ1YmJsZVNpemUgKiAwLjdcbiAgICAgIGRpZmZpY3VsdDogQGJhc2VCdWJibGVTaXplICogMC40XG5cbiAgICBAc2l6ZU1heCA9XG4gICAgICBlYXN5OiAgICAgIEBiYXNlQnViYmxlU2l6ZVxuICAgICAgZGlmZmljdWx0OiBAYmFzZUJ1YmJsZVNpemUgKiAwLjZcblxuICAgIHJldHVybiB0aGlzXG5cbiAgdXBkYXRlVmFsdWVzRm9yRGlmZmljdWx0eTogLT5cblxuICAgIEBwcm9wZXJ0aWVzVG9VcGRhdGVXaXRoRGlmZmljdWx0eS5tYXAgKHByb3BlcnR5KSA9PlxuICAgICAgcHJvcGVydHlDb25maWcgID0gQFtwcm9wZXJ0eV1cbiAgICAgIHZhbHVlRGlmZmVyZW5jZSA9IHByb3BlcnR5Q29uZmlnLmRpZmZpY3VsdCAtIHByb3BlcnR5Q29uZmlnLmVhc3lcbiAgICAgIGxldmVsTXVsaXRwbGllciA9IFBsYXlTdGF0ZS5sZXZlbCAvIEBtYXhMZXZlbFxuXG4gICAgICBQbGF5U3RhdGVbcHJvcGVydHldID0gKHZhbHVlRGlmZmVyZW5jZSAqIGxldmVsTXVsaXRwbGllcikgKyBwcm9wZXJ0eUNvbmZpZy5lYXN5XG5cbiAgICAgIHJldHVyblxuXG4gICAgcmV0dXJuIHRoaXNcbiIsIlxuY2xhc3MgRGV2aWNlQ2xhc3NcblxuICBjb25zdHJ1Y3RvcjogLT5cblxuICAgIHJldHVybiB0aGlzXG4iLCJcbmNsYXNzIEdhbWVDbGFzc1xuXG4gIGNvbnN0cnVjdG9yOiAtPlxuXG4gICAgU2NlbmVzLmlkZW50KClcblxuICAgIHJldHVybiB0aGlzXG5cbiAgb3ZlcjogLT5cblxuICAgIFNjZW5lcy5nYW1lT3ZlcigpXG5cbiAgICBQbGF5U3RhdGUuc3RvcExldmVsVXBJbmNyZW1lbnQoKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBzdGFydDogLT5cblxuICAgIFBsYXlTdGF0ZS5yZXNldCgpXG4gICAgVUkucmVzZXQoKVxuICAgIElucHV0LnJlbW92ZUdhbWVTdGFydFRhcEV2ZW50SGFuZGxlcigpXG4gICAgQnViYmxlR2VuZXJhdG9yLnJlc2V0KClcblxuICAgIFNjZW5lcy5wbGF5aW5nKClcblxuICAgIHJldHVybiB0aGlzXG4iLCJcbmNsYXNzIElucHV0Q2xhc3NcblxuICBjb25zdHJ1Y3RvcjogLT5cblxuICAgIEBjYW5jZWxUb3VjaE1vdmVFdmVudHMoKVxuXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIgaW5wdXRWZXJiLCAoZXZlbnQpIC0+XG4gICAgICAjVXRpbHMuY29uc29sZShldmVudC50eXBlICsgJyBvbiAnICsgZXZlbnQudGFyZ2V0Lm5vZGVOYW1lLnRvTG93ZXJDYXNlKCkpXG4gICAgICByZXR1cm5cbiAgICAsIGZhbHNlXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIGNhbmNlbFRvdWNoTW92ZUV2ZW50czogLT5cblxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyICd0b3VjaG1vdmUnLCAoZXZlbnQpIC0+XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG5cbiAgICAgIHJldHVyblxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBnYW1lU3RhcnRUYXBFdmVudEhhbmRsZXI6ICgpIC0+XG5cbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG5cbiAgICBHYW1lLnN0YXJ0KClcblxuICAgIHJldHVybiB0aGlzXG5cbiAgZ2V0VG91Y2hEYXRhOiAoZXZlbnQpIC0+XG5cbiAgICByZXR1cm4gZXZlbnQudG91Y2hlc1swXSBpZiBoYXNUb3VjaEV2ZW50c1xuXG4gICAgdG91Y2hEYXRhID1cbiAgICAgIHBhZ2VYOiBldmVudC5jbGllbnRYLFxuICAgICAgcGFnZVk6IGV2ZW50LmNsaWVudFlcblxuICAgIHJldHVybiB0b3VjaERhdGFcblxuICByZWdpc3RlckhhbmRsZXI6IChzZWxlY3RvciwgYWN0aW9uLCBjYWxsYmFjaywgc2NlbmVzKSAtPlxuXG4gICAgY29uc29sZS5sb2cgXCJJbnB1dC5yZWdzaXRlckhhbmRsZXIoI3tzZWxlY3Rvcn0sICN7YWN0aW9ufSwgI3tjYWxsYmFja30sICN7c2NlbmVzfSlcIlxuXG4gICAgaWYgdHlwZW9mIHNjZW5lcyA9PSAnc3RyaW5nJ1xuICAgICAgc2NlbmUgID0gc2NlbmVzXG4gICAgICBzY2VuZXMgPSBbc2NlbmVdXG5cbiAgICBlbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3RvcilcblxuICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciBhY3Rpb24sIChldmVudCkgPT5cbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICAgIGNvbnNvbGUubG9nIFwiQ2FsbGluZyAje2FjdGlvbn0gaW5wdXQgb24gI3tlbGVtZW50fSBpbiAje1NjZW5lcy5jdXJyZW50fSlcIlxuICAgICAgY2FsbGJhY2suYXBwbHkoKSBpZiBzY2VuZXMubGVuZ3RoID09IDAgfHwgU2NlbmVzLmN1cnJlbnQgaW4gc2NlbmVzXG4gICAgICByZXR1cm5cblxuICAgIHJldHVybiB0aGlzXG5cbiAgcmVtb3ZlR2FtZVN0YXJ0VGFwRXZlbnRIYW5kbGVyOiAtPlxuXG4gICAgZG9jdW1lbnQuYm9keS5yZW1vdmVFdmVudExpc3RlbmVyKGlucHV0VmVyYiwgQGdhbWVTdGFydFRhcEV2ZW50SGFuZGxlcilcblxuICAgIHJldHVybiB0aGlzXG4iLCJcbmNsYXNzIFBsYXlTdGF0ZUNsYXNzXG5cbiAgZGVmYXVsdHM6XG4gICAgY29tYm9NdWx0aXBsaWVyOiAwXG4gICAgbGV2ZWw6ICAgICAgICAgICAxXG4gICAgc2NvcmU6ICAgICAgICAgICAwXG5cbiAgcmVzZXQ6IC0+XG5cbiAgICBAY2hhbmNlQnViYmxlSXNUYXJnZXQgICAgID0gQ29uZmlnLmNoYW5jZUJ1YmJsZUlzVGFyZ2V0LmVhc3lcbiAgICBAY29tYm9NdWx0aXBsaWVyICAgICAgICAgID0gQGRlZmF1bHRzLmNvbWJvTXVsdGlwbGllclxuICAgIEBsZXZlbCAgICAgICAgICAgICAgICAgICAgPSBAZGVmYXVsdHMubGV2ZWxcbiAgICBAbWF4VGFyZ2V0c0F0T25jZSAgICAgICAgID0gQ29uZmlnLm1heFRhcmdldHNBdE9uY2UuZWFzeVxuICAgIEBtaW5UYXJnZXRTaXplICAgICAgICAgICAgPSBDb25maWcubWluVGFyZ2V0U2l6ZS5lYXN5XG4gICAgQGJ1YmJsZUdyb3d0aE11bHRpcGxpZXIgICA9IENvbmZpZy5idWJibGVHcm93dGhNdWx0aXBsaWVyLmVhc3lcbiAgICBAYnViYmxlU3Bhd25DaGFuY2UgICAgICAgID0gQ29uZmlnLmJ1YmJsZVNwYXduQ2hhbmNlLmVhc3lcbiAgICBAc2NvcmUgICAgICAgICAgICAgICAgICAgID0gQGRlZmF1bHRzLnNjb3JlXG4gICAgQHNpemVNYXggICAgICAgICAgICAgICAgICA9IENvbmZpZy5zaXplTWF4LmVhc3lcbiAgICBAdGFyZ2V0VmVsb2NpdHlNdWx0aXBsaWVyID0gQ29uZmlnLnRhcmdldFZlbG9jaXR5TXVsdGlwbGllci5lYXN5XG4gICAgQHZlbG9jaXR5TWluICAgICAgICAgICAgICA9IENvbmZpZy52ZWxvY2l0eU1pbi5lYXN5XG4gICAgQHZlbG9jaXR5TWF4ICAgICAgICAgICAgICA9IENvbmZpZy52ZWxvY2l0eU1heC5lYXN5XG5cbiAgICBAdXBkYXRlKHRydWUpXG5cbiAgICBDb25maWcudXBkYXRlVmFsdWVzRm9yRGlmZmljdWx0eSgpXG5cbiAgICBAc2V0dXBMZXZlbFVwSW5jcmVtZW50KClcblxuICAgIHJldHVybiB0aGlzXG5cbiAgc3RvcExldmVsVXBJbmNyZW1lbnQ6IC0+XG5cbiAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbChAbGV2ZWxVcENvdW50ZXIpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHNldHVwTGV2ZWxVcEluY3JlbWVudDogLT5cblxuICAgIEBsZXZlbFVwQ291bnRlciA9IHdpbmRvdy5zZXRJbnRlcnZhbCA9PlxuXG4gICAgICBAdXBkYXRlTGV2ZWwoKVxuXG4gICAgICByZXR1cm5cblxuICAgICwgQ29uZmlnLmxldmVsVXBJbnRlcnZhbCAqIDEwMDBcblxuICAgIHJldHVybiB0aGlzXG5cbiAgdXBkYXRlQ29tYm9NdWx0aXBsaWVyOiAodGFyZ2V0SGl0KSAtPlxuXG4gICAgQGNvbWJvTXVsdGlwbGllciA9IGlmIHRhcmdldEhpdCB0aGVuIEBjb21ib011bHRpcGxpZXIgKyAxIGVsc2UgQGRlZmF1bHRzLmNvbWJvTXVsdGlwbGllclxuXG4gICAgVUkudXBkYXRlQ29tYm9NdWx0aXBsaWVyQ291bnRlcigpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHVwZGF0ZTogKG5ld1N0YXRlKSAtPlxuXG4gICAgQHBsYXlpbmcgPSBuZXdTdGF0ZVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICB1cGRhdGVMZXZlbDogLT5cblxuICAgIEBsZXZlbCArPSAxXG5cbiAgICBpZiBAbGV2ZWwgPj0gQ29uZmlnLm1heExldmVsXG4gICAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbChAbGV2ZWxVcENvdW50ZXIpXG5cbiAgICBVSS51cGRhdGVMZXZlbENvdW50ZXIoKVxuICAgIENvbmZpZy51cGRhdGVWYWx1ZXNGb3JEaWZmaWN1bHR5KClcblxuICAgIHJldHVybiB0aGlzXG5cbiAgdXBkYXRlU2NvcmU6IChzaXplV2hlblRhcHBlZCwgc2l6ZVdoZW5GdWxseUdyb3duKSAtPlxuXG4gICAgIygoZGVmYXVsdFNjb3JlUGVyUG9wICsgKDEwMCAtICgoc2l6ZVdoZW5UYXBwZWQgLyBzaXplV2hlbkZ1bGx5R3Jvd24pICogMTAwKSkpICogY29tYm9NdWx0aXBsaWVyKSAqIChsZXZlbE51bWJlciArIDEpXG5cbiAgICB0YXJnZXRTaXplQm9udXMgPSBNYXRoLnJvdW5kKDEwMCAtICgoc2l6ZVdoZW5UYXBwZWQgLyBzaXplV2hlbkZ1bGx5R3Jvd24pICogMTAwKSlcbiAgICBwb3BQb2ludFZhbHVlICAgPSBDb25maWcucG9pbnRzUGVyUG9wICsgdGFyZ2V0U2l6ZUJvbnVzXG4gICAgbGV2ZWxNdWx0aXBsaWVyID0gQGxldmVsICsgMVxuXG4gICAgQHNjb3JlICs9IChwb3BQb2ludFZhbHVlICogQGNvbWJvTXVsdGlwbGllcikgKiAobGV2ZWxNdWx0aXBsaWVyKVxuXG4gICAgVUkudXBkYXRlU2NvcmVDb3VudGVyKClcblxuICAgIHJldHVybiB0aGlzXG4iLCJcbmNsYXNzIFNjZW5lc0NsYXNzXG5cbiAgQGN1cnJlbnQgPSBudWxsXG5cbiAgY3JlZGl0czogLT5cblxuICAgIEBjdXJyZW50ID0gJ2NyZWRpdHMnXG5cbiAgICBVdGlscy5jb25zb2xlKCdMb2FkIFNjZW5lOiBDcmVkaXRzJylcblxuICAgIFVJLnVwZGF0ZUJvZHlDbGFzcygnY3JlZGl0cycpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIGdhbWVPdmVyOiAtPlxuXG4gICAgQGN1cnJlbnQgPSAnZ2FtZS1vdmVyJ1xuXG4gICAgVXRpbHMuY29uc29sZSgnTG9hZCBTY2VuZTogR2FtZSBPdmVyJylcblxuICAgIFVJLnVwZGF0ZUJvZHlDbGFzcygnZ2FtZS1vdmVyJylcblxuICAgIHJldHVybiB0aGlzXG5cbiAgbGVhZGVyYm9hcmQ6IC0+XG5cbiAgICBAY3VycmVudCA9ICdsZWFkZXJib2FyZCdcblxuICAgIFV0aWxzLmNvbnNvbGUoJ0xvYWQgU2NlbmU6IExlYWRlcmJvYXJkJylcblxuICAgIHJldHVybiB0aGlzXG5cbiAgcGxheWluZzogLT5cblxuICAgIEBjdXJyZW50ID0gJ3BsYXlpbmcnXG5cbiAgICBVdGlscy5jb25zb2xlKCdMb2FkIFNjZW5lOiBQbGF5aW5nJylcblxuICAgIFVJLnVwZGF0ZUJvZHlDbGFzcygncGxheWluZycpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIGlkZW50OiAtPlxuXG4gICAgQGN1cnJlbnQgPSAnaWRlbnQnXG5cbiAgICBVdGlscy5jb25zb2xlKCdMb2FkIFNjZW5lOiBJZGVudCcpXG5cbiAgICBVSS51cGRhdGVCb2R5Q2xhc3MoJ2lkZW50JylcblxuICAgIHdpbmRvdy5zZXRUaW1lb3V0ID0+XG4gICAgICBAdGl0bGUoKVxuICAgICwgMjUwMFxuXG4gICAgcmV0dXJuIHRoaXNcblxuICB0aXRsZTogLT5cblxuICAgIEBjdXJyZW50ID0gJ3RpdGxlJ1xuXG4gICAgVXRpbHMuY29uc29sZSgnTG9hZCBTY2VuZTogVGl0bGUgU2NyZWVuJylcblxuICAgIFVJLnVwZGF0ZUJvZHlDbGFzcygndGl0bGUnKVxuXG4gICAgcmV0dXJuIHRoaXNcbiIsIlxuY2xhc3MgVUlDbGFzc1xuXG4gIGNvbnN0cnVjdG9yOiAtPlxuXG4gICAgQHNldHVwQmFzaWNJbnRlcmZhY2VFdmVudHMoKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICByZXNldDogLT5cblxuICAgIEBsZXZlbENvdW50ZXIgICAgICAgICAgID0gVXRpbHMuJCgnLmh1ZC12YWx1ZS1sZXZlbCcpXG4gICAgQHNjb3JlQ291bnRlciAgICAgICAgICAgPSBVdGlscy4kKCcuaHVkLXZhbHVlLXNjb3JlJylcbiAgICBAY29tYm9NdWx0aXBsaWVyQ291bnRlciA9IFV0aWxzLiQoJy5odWQtdmFsdWUtY29tYm8nKVxuICAgIEBwbGF5QWdhaW4gICAgICAgICAgICAgID0gVXRpbHMuJCgnLnBsYXktYWdhaW4nKVxuXG4gICAgQHVwZGF0ZUNvbWJvTXVsdGlwbGllckNvdW50ZXIoKVxuICAgIEB1cGRhdGVMZXZlbENvdW50ZXIoKVxuICAgIEB1cGRhdGVTY29yZUNvdW50ZXIoKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBzZXR1cEJhc2ljSW50ZXJmYWNlRXZlbnRzOiAtPlxuXG4gICAgSW5wdXQucmVnaXN0ZXJIYW5kbGVyICcuZ2FtZS1sb2dvJywgaW5wdXRWZXJiLCAtPlxuICAgICAgSW5wdXQuZ2FtZVN0YXJ0VGFwRXZlbnRIYW5kbGVyKClcbiAgICAsIFsndGl0bGUnXVxuXG4gICAgSW5wdXQucmVnaXN0ZXJIYW5kbGVyICcucGxheS1hZ2FpbicsIGlucHV0VmVyYiwgLT5cbiAgICAgIElucHV0LmdhbWVTdGFydFRhcEV2ZW50SGFuZGxlcigpXG4gICAgLCBbJ2dhbWUtb3ZlciddXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHVwZGF0ZUJvZHlDbGFzczogKGNsYXNzTmFtZSkgLT5cblxuICAgIGJvZHkuY2xhc3NOYW1lID0gJydcbiAgICBib2R5LmNsYXNzTGlzdC5hZGQoJ3NjZW5lLScgKyBjbGFzc05hbWUpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHVwZGF0ZUNvbWJvTXVsdGlwbGllckNvdW50ZXI6IC0+XG5cbiAgICBVdGlscy51cGRhdGVVSVRleHROb2RlKEBjb21ib011bHRpcGxpZXJDb3VudGVyLCBQbGF5U3RhdGUuY29tYm9NdWx0aXBsaWVyKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICB1cGRhdGVMZXZlbENvdW50ZXI6IC0+XG5cbiAgICBVdGlscy51cGRhdGVVSVRleHROb2RlKEBsZXZlbENvdW50ZXIsIFBsYXlTdGF0ZS5sZXZlbClcblxuICAgIHJldHVybiB0aGlzXG5cbiAgdXBkYXRlU2NvcmVDb3VudGVyOiAtPlxuXG4gICAgc2NvcmVUb0Zvcm1hdCA9IFV0aWxzLmZvcm1hdFdpdGhDb21tYShQbGF5U3RhdGUuc2NvcmUpXG5cbiAgICBVdGlscy51cGRhdGVVSVRleHROb2RlKEBzY29yZUNvdW50ZXIsIHNjb3JlVG9Gb3JtYXQpXG5cbiAgICByZXR1cm4gdGhpc1xuIiwiXG5jbGFzcyBVdGlsc0NsYXNzXG5cbiAgJDogKHNlbGVjdG9yKSAtPlxuXG4gICAgcmV0dXJuIGRvY3VtZW50LmJvZHkgaWYgc2VsZWN0b3IgPT0gYm9keVxuICAgIHJldHVybiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChzZWxlY3RvcikgaWYgc2VsZWN0b3Iuc3Vic3RyKDAsIDEpID09ICcjJ1xuXG4gICAgZWxzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcilcblxuICAgIHJldHVybiBlbHNbMF0gaWYgZWxzLmxlbmd0aCA9PSAxXG5cbiAgICByZXR1cm4gZWxzXG5cbiAgY29uc29sZTogKGNvbnRlbnQpIC0+XG5cbiAgICBjb25zb2xlID0gQCQoJy5jb25zb2xlJylcblxuICAgIEB1cGRhdGVVSVRleHROb2RlKGNvbnNvbGUsIGNvbnRlbnQpXG5cbiAgICByZXR1cm5cblxuICBjb3JyZWN0VmFsdWVGb3JEUFI6ICh2YWx1ZSwgaW50ZWdlciA9IGZhbHNlKSAtPlxuXG4gICAgdmFsdWUgKj0gZGV2aWNlUGl4ZWxSYXRpb1xuXG4gICAgdmFsdWUgPSBNYXRoLnJvdW5kKHZhbHVlKSBpZiBpbnRlZ2VyXG5cbiAgICByZXR1cm4gdmFsdWVcblxuICBmb3JtYXRXaXRoQ29tbWE6IChudW0pIC0+XG5cbiAgICByZXR1cm4gbnVtLnRvU3RyaW5nKCkucmVwbGFjZSgvXFxCKD89KFxcZHszfSkrKD8hXFxkKSkvZywgXCIsXCIpXG5cbiAgcmFuZG9tOiAobWluLCBtYXgpIC0+XG5cbiAgICBpZiBtaW4gPT0gdW5kZWZpbmVkXG4gICAgICBtaW4gPSAwXG4gICAgICBtYXggPSAxXG4gICAgZWxzZSBpZiBtYXggPT0gdW5kZWZpbmVkXG4gICAgICBtYXggPSBtaW5cbiAgICAgIG1pbiA9IDBcblxuICAgIHJldHVybiAoTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4pKSArIG1pbjtcblxuICByYW5kb21Db2xvcjogKCkgLT5cblxuICAgIHIgPSB0aGlzLnJhbmRvbUludGVnZXIoMCwgMjAwKVxuICAgIGcgPSB0aGlzLnJhbmRvbUludGVnZXIoMCwgMjAwKVxuICAgIGIgPSB0aGlzLnJhbmRvbUludGVnZXIoMCwgMjAwKVxuXG4gICAgcmV0dXJuIFwiI3tyfSwgI3tnfSwgI3tifVwiXG5cbiAgcmFuZG9tSW50ZWdlcjogKG1pbiwgbWF4KSAtPlxuXG4gICAgaWYgbWF4ID09IHVuZGVmaW5lZFxuICAgICAgbWF4ID0gbWluXG4gICAgICBtaW4gPSAwXG5cbiAgICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKG1heCArIDEgLSBtaW4pKSArIG1pblxuXG4gIHJhbmRvbVBlcmNlbnRhZ2U6IC0+XG5cbiAgICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTAwKVxuXG4gIHJnYmE6IChjb2xvciwgYWxwaGEpIC0+XG5cbiAgICBhbHBoYSA9IDEgaWYgIWFscGhhXG5cbiAgICByZXR1cm4gXCJyZ2JhKCN7Y29sb3J9LCAje2FscGhhfSlcIlxuXG4gIHVwZGF0ZVVJVGV4dE5vZGU6IChlbGVtZW50LCB2YWx1ZSkgLT5cblxuICAgIGVsZW1lbnQuaW5uZXJIVE1MID0gdmFsdWVcblxuICAgIHJldHVybiB0aGlzXG4iLCJcbmRlYnVnID0gdHJ1ZVxuXG5hbmRyb2lkICAgICAgICA9IGlmIG5hdmlnYXRvci51c2VyQWdlbnQubWF0Y2goL2FuZHJvaWQvaSkgdGhlbiB0cnVlIGVsc2UgZmFsc2VcbmJvZHkgICAgICAgICAgID0gZG9jdW1lbnQuYm9keVxuY2FudmFzICAgICAgICAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuY2FudmFzJylcbmhhc1RvdWNoRXZlbnRzID0gd2luZG93Lmhhc093blByb3BlcnR5KCdvbnRvdWNoc3RhcnQnKSB8fCB3aW5kb3cuaGFzT3duUHJvcGVydHkoJ29ubXNnZXN0dXJlY2hhbmdlJylcbmlucHV0VmVyYiAgICAgID0gaWYgaGFzVG91Y2hFdmVudHMgdGhlbiAndG91Y2hzdGFydCcgZWxzZSAnY2xpY2snXG5cbmNhbnZhcy5jbGFzc05hbWUgPSAnY2FudmFzJ1xuY2FudmFzLndpZHRoICAgICA9IGJvZHkuY2xpZW50V2lkdGhcbmNhbnZhcy5oZWlnaHQgICAgPSBib2R5LmNsaWVudEhlaWdodFxuXG5jb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoJzJkJylcblxuY29udGV4dC5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb24gPSAnc291cmNlLWF0b3AnXG5cbmRldmljZVBpeGVsUmF0aW8gID0gd2luZG93LmRldmljZVBpeGVsUmF0aW8gfHwgMVxuYmFja2luZ1N0b3JlUmF0aW8gPSBjb250ZXh0LndlYmtpdEJhY2tpbmdTdG9yZVBpeGVsUmF0aW8gfHwgY29udGV4dC5iYWNraW5nU3RvcmVQaXhlbFJhdGlvIHx8IDFcbnJhdGlvICAgICAgICAgICAgID0gZGV2aWNlUGl4ZWxSYXRpbyAvIGJhY2tpbmdTdG9yZVJhdGlvXG5cbmlmIGRldmljZVBpeGVsUmF0aW8gIT0gYmFja2luZ1N0b3JlUmF0aW9cbiAgb2xkV2lkdGggID0gY2FudmFzLndpZHRoXG4gIG9sZEhlaWdodCA9IGNhbnZhcy5oZWlnaHRcblxuICBjYW52YXMud2lkdGggID0gb2xkV2lkdGggICogcmF0aW9cbiAgY2FudmFzLmhlaWdodCA9IG9sZEhlaWdodCAqIHJhdGlvXG5cbiAgY2FudmFzLnN0eWxlLndpZHRoICA9IFwiI3tvbGRXaWR0aH1weFwiXG4gIGNhbnZhcy5zdHlsZS5oZWlnaHQgPSBcIiN7b2xkSGVpZ2h0fXB4XCJcblxuICBjb250ZXh0LnNjYWxlKHJhdGlvLCByYXRpbylcblxuIyBTZXQgZW52aXJvbm1lbnQgYW5kIGJhc2UgY29uZmlnIGV0Y1xuRGV2aWNlICAgICAgICAgID0gbmV3IERldmljZUNsYXNzKClcblV0aWxzICAgICAgICAgICA9IG5ldyBVdGlsc0NsYXNzKClcbkNvbmZpZyAgICAgICAgICA9IG5ldyBDb25maWdDbGFzcygpXG5JbnB1dCAgICAgICAgICAgPSBuZXcgSW5wdXRDbGFzcygpXG5cbiMgTG9hZCB0aGUgZ2FtZSBsb2dpYyBhbmQgYWxsIHRoYXRcbkJ1YmJsZUdlbmVyYXRvciA9IG5ldyBCdWJibGVHZW5lcmF0b3JDbGFzcygpXG5QbGF5U3RhdGUgICAgICAgPSBuZXcgUGxheVN0YXRlQ2xhc3MoKVxuVUkgICAgICAgICAgICAgID0gbmV3IFVJQ2xhc3MoKVxuU2NlbmVzICAgICAgICAgID0gbmV3IFNjZW5lc0NsYXNzKClcblxuIyBTZXQgb2ZmIHRoZSBjYW52YXMgYW5pbWF0aW9uIGxvb3BcbkFuaW1hdGlvbkxvb3AgICA9IG5ldyBBbmltYXRpb25Mb29wQ2xhc3MoKVxuXG4jIFN0YXJ0IHRoZSBhY3R1YWwgZ2FtZVxuR2FtZSAgICAgICAgICAgID0gbmV3IEdhbWVDbGFzcygpXG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=