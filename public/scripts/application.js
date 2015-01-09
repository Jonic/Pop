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
        Utils.console(touchData);
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
    Utils.console('Game Over');
    PlayState.stopLevelUpIncrement();
    return this;
  };

  GameClass.prototype.start = function() {
    PlayState.reset();
    UI.reset();
    Input.removeGameStartTapEventHandler();
    BubbleGenerator.reset();
    Scenes.playing();
    Utils.console('Playing');
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkFuaW1hdGlvbkxvb3AuY29mZmVlIiwiQnViYmxlLmNvZmZlZSIsIkJ1YmJsZUdlbmVyYXRvci5jb2ZmZWUiLCJDb25maWcuY29mZmVlIiwiRGV2aWNlLmNvZmZlZSIsIkdhbWUuY29mZmVlIiwiSW5wdXQuY29mZmVlIiwiUGxheVN0YXRlLmNvZmZlZSIsIlNjZW5lcy5jb2ZmZWUiLCJVSS5jb2ZmZWUiLCJVdGlscy5jb2ZmZWUiLCJfYm9vdHN0cmFwLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxJQUFBLGtCQUFBOztBQUFBO0FBRWUsRUFBQSw0QkFBQSxHQUFBO0FBRVgsSUFBQSxJQUFDLENBQUEscUJBQUQsQ0FBQSxDQUFBLENBQUE7QUFFQSxXQUFPLElBQVAsQ0FKVztFQUFBLENBQWI7O0FBQUEsK0JBTUEsb0JBQUEsR0FBc0IsU0FBQSxHQUFBO0FBRXBCLElBQUEsTUFBTSxDQUFDLG9CQUFQLENBQTRCLElBQUMsQ0FBQSxlQUE3QixDQUFBLENBQUE7QUFFQSxXQUFPLElBQVAsQ0FKb0I7RUFBQSxDQU50QixDQUFBOztBQUFBLCtCQVlBLHFCQUFBLEdBQXVCLFNBQUEsR0FBQTtBQUVyQixJQUFBLElBQUMsQ0FBQSxlQUFELEdBQW1CLE1BQU0sQ0FBQyxxQkFBUCxDQUE2QixDQUFBLFNBQUEsS0FBQSxHQUFBO2FBQUEsU0FBQSxHQUFBO0FBRTlDLFFBQUEsS0FBQyxDQUFBLHFCQUFELENBQUEsQ0FBQSxDQUY4QztNQUFBLEVBQUE7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTdCLENBQW5CLENBQUE7QUFBQSxJQU1BLE1BQU0sQ0FBQyxLQUFQLEdBQWUsTUFBTSxDQUFDLEtBTnRCLENBQUE7QUFBQSxJQVFBLGVBQWUsQ0FBQyxvQkFBaEIsQ0FBQSxDQVJBLENBQUE7QUFVQSxXQUFPLElBQVAsQ0FacUI7RUFBQSxDQVp2QixDQUFBOzs0QkFBQTs7SUFGRixDQUFBOztBQ0FBLElBQUEsV0FBQTs7QUFBQTtBQUVFLHdCQUFBLFVB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U0EsT0FBTyxDQUFDLEtBQVIsQ0FBYyxLQUFkLEVBQXFCLEtBQXJCLENBVEEsQ0FERjtDQXBCQTs7QUFBQSxNQWlDQSxHQUFzQixJQUFBLFdBQUEsQ0FBQSxDQWpDdEIsQ0FBQTs7QUFBQSxLQWtDQSxHQUFzQixJQUFBLFVBQUEsQ0FBQSxDQWxDdEIsQ0FBQTs7QUFBQSxNQW1DQSxHQUFzQixJQUFBLFdBQUEsQ0FBQSxDQW5DdEIsQ0FBQTs7QUFBQSxLQW9DQSxHQUFzQixJQUFBLFVBQUEsQ0FBQSxDQXBDdEIsQ0FBQTs7QUFBQSxlQXVDQSxHQUFzQixJQUFBLG9CQUFBLENBQUEsQ0F2Q3RCLENBQUE7O0FBQUEsU0F3Q0EsR0FBc0IsSUFBQSxjQUFBLENBQUEsQ0F4Q3RCLENBQUE7O0FBQUEsRUF5Q0EsR0FBc0IsSUFBQSxPQUFBLENBQUEsQ0F6Q3RCLENBQUE7O0FBQUEsTUEwQ0EsR0FBc0IsSUFBQSxXQUFBLENBQUEsQ0ExQ3RCLENBQUE7O0FBQUEsYUE2Q0EsR0FBc0IsSUFBQSxrQkFBQSxDQUFBLENBN0N0QixDQUFBOztBQUFBLElBZ0RBLEdBQXNCLElBQUEsU0FBQSxDQUFBLENBaER0QixDQUFBIiwiZmlsZSI6ImFwcGxpY2F0aW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXG5jbGFzcyBBbmltYXRpb25Mb29wQ2xhc3NcblxuICBjb25zdHJ1Y3RvcjogLT5cblxuICAgIEByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBjYW5jZWxBbmltYXRpb25GcmFtZTogLT5cblxuICAgIHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZShAYW5pbWF0aW9uTG9vcElkKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWU6IC0+XG5cbiAgICBAYW5pbWF0aW9uTG9vcElkID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSA9PlxuXG4gICAgICBAcmVxdWVzdEFuaW1hdGlvbkZyYW1lKClcblxuICAgICAgcmV0dXJuXG5cbiAgICBjYW52YXMud2lkdGggPSBjYW52YXMud2lkdGhcblxuICAgIEJ1YmJsZUdlbmVyYXRvci5hbmltYXRpb25Mb29wQWN0aW9ucygpXG5cbiAgICByZXR1cm4gdGhpc1xuIiwiXG5jbGFzcyBCdWJibGVDbGFzc1xuXG4gIGRlc3Ryb3lpbmc6IGZhbHNlXG4gIHNpemU6ICAgICAgIDFcblxuICBjb25zdHJ1Y3RvcjogLT5cblxuICAgIHIgPSBVdGlscy5yYW5kb21JbnRlZ2VyKDAsIDIwMClcbiAgICBnID0gVXRpbHMucmFuZG9tSW50ZWdlcigwLCAyMDApXG4gICAgYiA9IFV0aWxzLnJhbmRvbUludGVnZXIoMCwgMjAwKVxuICAgIGEgPSBVdGlscy5yYW5kb20oMC43NSwgMSlcblxuICAgIEBjb2xvciAgICAgID0gXCJyZ2JhKCN7cn0sICN7Z30sICN7Yn0sICN7YX0pXCJcbiAgICBAZmluYWxTaXplICA9IFV0aWxzLnJhbmRvbUludGVnZXIoMCwgUGxheVN0YXRlLnNpemVNYXgpXG4gICAgQGlkICAgICAgICAgPSBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHIoMiwgNSlcbiAgICBAaXNUYXJnZXQgICA9IEBkZXRlcm1pbmVUYXJnZXRCdWJibGUoKVxuICAgIEBwb3NpdGlvbiAgID1cbiAgICAgIHg6IEJ1YmJsZUdlbmVyYXRvci5idWJibGVzT3JpZ2luLnhcbiAgICAgIHk6IEJ1YmJsZUdlbmVyYXRvci5idWJibGVzT3JpZ2luLnlcbiAgICBAdmVsb2NpdHkgICA9XG4gICAgICB4OiBVdGlscy5yYW5kb20oUGxheVN0YXRlLnZlbG9jaXR5TWluLCBQbGF5U3RhdGUudmVsb2NpdHlNYXgpXG4gICAgICB5OiBVdGlscy5yYW5kb20oUGxheVN0YXRlLnZlbG9jaXR5TWluLCBQbGF5U3RhdGUudmVsb2NpdHlNYXgpXG5cbiAgICBpZiBAaXNUYXJnZXRcbiAgICAgIEBjb2xvciAgICAgPSBcInJnYmEoI3tyfSwgI3tnfSwgI3tifSwgMC44KVwiXG4gICAgICBAZmluYWxTaXplID0gVXRpbHMucmFuZG9tSW50ZWdlcihQbGF5U3RhdGUubWluVGFyZ2V0U2l6ZSwgUGxheVN0YXRlLnNpemVNYXgpXG5cbiAgICAgIEB2ZWxvY2l0eS54ICo9IFBsYXlTdGF0ZS50YXJnZXRWZWxvY2l0eU11bHRpcGxpZXJcbiAgICAgIEB2ZWxvY2l0eS55ICo9IFBsYXlTdGF0ZS50YXJnZXRWZWxvY2l0eU11bHRpcGxpZXJcblxuICAgIHJldHVybiB0aGlzXG5cbiAgZGV0ZXJtaW5lVGFyZ2V0QnViYmxlOiAtPlxuXG4gICAgaXNUYXJnZXQgPSBmYWxzZVxuXG4gICAgaWYgQnViYmxlR2VuZXJhdG9yLmJ1YmJsZXNUb1Rlc3RGb3JUYXBzLmxlbmd0aCA8IFBsYXlTdGF0ZS5tYXhUYXJnZXRzQXRPbmNlXG4gICAgICBpc1RhcmdldCA9IFV0aWxzLnJhbmRvbVBlcmNlbnRhZ2UoKSA8IFBsYXlTdGF0ZS5jaGFuY2VCdWJibGVJc1RhcmdldFxuXG4gICAgcmV0dXJuIGlzVGFyZ2V0XG5cbiAgZHJhdzogLT5cblxuICAgIGlmIEBvdXRzaWRlQ2FudmFzQm91bmRzKClcbiAgICAgIEJ1YmJsZUdlbmVyYXRvci5idWJibGVzVG9EZWxldGUucHVzaChAaWQpXG5cbiAgICAgIHJldHVyblxuXG4gICAgaWYgQGlzVGFyZ2V0XG4gICAgICBAbGluZVdpZHRoID0gQHNpemUgLyAxMFxuXG4gICAgICBpZiBAbGluZVdpZHRoID4gQ29uZmlnLm1heExpbmVXaWR0aFxuICAgICAgICBAbGluZVdpZHRoID0gQ29uZmlnLm1heExpbmVXaWR0aFxuXG4gICAgICBjb250ZXh0LmZpbGxTdHlsZSA9ICdyZ2JhKDI0NywgMjQ3LCAyNDcsIDAuOSknXG4gICAgICBjb250ZXh0LmxpbmVXaWR0aCA9IEBsaW5lV2lkdGhcblxuICAgIGNvbnRleHQuYmVnaW5QYXRoKClcbiAgICBjb250ZXh0LmFyYyhAcG9zaXRpb24ueCwgQHBvc2l0aW9uLnksIEBoYWxmLCAwLCBNYXRoLlBJICogMiwgdHJ1ZSlcbiAgICBjb250ZXh0LmZpbGwoKVxuICAgIGNvbnRleHQuc3Ryb2tlKCkgaWYgQGlzVGFyZ2V0XG4gICAgY29udGV4dC5jbG9zZVBhdGgoKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBvdXRzaWRlQ2FudmFzQm91bmRzOiAtPlxuXG4gICAgYmV5b25kQm91bmRzWCA9IEBwb3NpdGlvbi54IDwgLShAZmluYWxTaXplKSBvciBAcG9zaXRpb24ueCA+IGNhbnZhcy53aWR0aCAgKyBAZmluYWxTaXplXG4gICAgYmV5b25kQm91bmRzWSA9IEBwb3NpdGlvbi55IDwgLShAZmluYWxTaXplKSBvciBAcG9zaXRpb24ueSA+IGNhbnZhcy5oZWlnaHQgKyBAZmluYWxTaXplXG5cbiAgICByZXR1cm4gYmV5b25kQm91bmRzWCBvciBiZXlvbmRCb3VuZHNZXG5cbiAgdXBkYXRlVmFsdWVzOiAtPlxuXG4gICAgaWYgQGRlc3Ryb3lpbmdcbiAgICAgIHNocmlua011bHRpcGxpZXIgPSBpZiBQbGF5U3RhdGUucGxheWluZyB0aGVuIDAuNyBlbHNlIDAuOVxuXG4gICAgICBAc2l6ZSAqPSBzaHJpbmtNdWx0aXBsaWVyXG4gICAgZWxzZVxuICAgICAgaWYgQHNpemUgPCBAZmluYWxTaXplXG4gICAgICAgIEBzaXplICo9IFBsYXlTdGF0ZS5idWJibGVHcm93dGhNdWx0aXBsaWVyXG5cbiAgICAgIGlmIEBzaXplID4gQGZpbmFsU2l6ZVxuICAgICAgICBAc2l6ZSA9IEBmaW5hbFNpemVcblxuICAgIEBoYWxmID0gQHNpemUgLyAyXG5cbiAgICBAcG9zaXRpb24ueCArPSBAdmVsb2NpdHkueFxuICAgIEBwb3NpdGlvbi55ICs9IEB2ZWxvY2l0eS55XG5cbiAgICBAZHJhdygpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHdhc1RhcHBlZDogKHRvdWNoRGF0YSkgLT5cblxuICAgIHRhcFggICAgICA9IHRvdWNoRGF0YS5wYWdlWCAqIGRldmljZVBpeGVsUmF0aW9cbiAgICB0YXBZICAgICAgPSB0b3VjaERhdGEucGFnZVkgKiBkZXZpY2VQaXhlbFJhdGlvXG4gICAgZGlzdGFuY2VYID0gdGFwWCAtIEBwb3NpdGlvbi54XG4gICAgZGlzdGFuY2VZID0gdGFwWSAtIEBwb3NpdGlvbi55XG4gICAgcmFkaXVzICAgID0gQGhhbGZcblxuICAgIHJldHVybiAoZGlzdGFuY2VYICogZGlzdGFuY2VYKSArIChkaXN0YW5jZVkgKiBkaXN0YW5jZVkpIDwgKEBoYWxmICogQGhhbGYpXG4iLCJcbmNsYXNzIEJ1YmJsZUdlbmVyYXRvckNsYXNzXG5cbiAgY29uc3RydWN0b3I6IC0+XG5cbiAgICBAYnViYmxlc0FycmF5ICAgICAgICAgPSBbXVxuICAgIEBidWJibGVzQXJyYXlJZHMgICAgICA9IFtdXG4gICAgQGJ1YmJsZXNUb0RlbGV0ZSAgICAgID0gW11cbiAgICBAYnViYmxlc1RvVGVzdEZvclRhcHMgPSBbXVxuXG4gICAgQGJ1YmJsZXNPcmlnaW4gPVxuICAgICAgeDogY2FudmFzLndpZHRoICAvIDJcbiAgICAgIHk6IGNhbnZhcy5oZWlnaHQgLyAyXG5cbiAgICBAcmVnaXN0ZXJCdWJibGVUYXBEZXRlY3Rpb25IYW5kbGVyKClcblxuICAgIHJldHVybiB0aGlzXG5cbiAgYW5pbWF0aW9uTG9vcEFjdGlvbnM6IC0+XG5cbiAgICBpZiBQbGF5U3RhdGUucGxheWluZ1xuICAgICAgQGdlbmVyYXRlQnViYmxlKClcblxuICAgIEB1cGRhdGVCdWJibGVzVmFsdWVzKClcbiAgICBAcmVtb3ZlQnViYmxlc0FmdGVyVGFwKClcblxuICAgIGlmIEBidWJibGVzVG9EZWxldGUubGVuZ3RoID4gMFxuICAgICAgQGRlc3Ryb3lCdWJibGVzT3V0c2lkZUNhbnZhc0JvdW5kcygpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIGRlc3Ryb3lCdWJibGVzT3V0c2lkZUNhbnZhc0JvdW5kczogLT5cblxuICAgIEBidWJibGVzVG9EZWxldGUubWFwIChidWJibGVJZCkgPT5cbiAgICAgIGJ1YmJsZUluZGV4ID0gQGJ1YmJsZXNBcnJheUlkcy5pbmRleE9mKGJ1YmJsZUlkKVxuICAgICAgYnViYmxlICAgICAgPSBAYnViYmxlc0FycmF5W2J1YmJsZUluZGV4XVxuXG4gICAgICBpZiBidWJibGU/XG4gICAgICAgIEBnYW1lT3ZlcigpIGlmIGJ1YmJsZS5pc1RhcmdldFxuICAgICAgICBAcmVtb3ZlQnViYmxlKGJ1YmJsZSlcblxuICAgIEBidWJibGVzVG9EZWxldGUgPSBbXVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBnYW1lT3ZlcjogLT5cblxuICAgIEBzdG9wKClcblxuICAgIEBidWJibGVzQXJyYXkubWFwIChidWJibGUpID0+XG4gICAgICBidWJibGUuZGVzdHJveWluZyA9IHRydWVcblxuICAgIFBsYXlTdGF0ZS5idWJibGVTcGF3bkNoYW5jZSA9IDBcblxuICAgIEdhbWUub3ZlcigpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIGdlbmVyYXRlQnViYmxlOiAtPlxuXG4gICAgaWYgVXRpbHMucmFuZG9tUGVyY2VudGFnZSgpIDwgUGxheVN0YXRlLmJ1YmJsZVNwYXduQ2hhbmNlXG4gICAgICBidWJibGUgPSBuZXcgQnViYmxlQ2xhc3MoKVxuXG4gICAgICBAYnViYmxlc0FycmF5LnB1c2goYnViYmxlKVxuICAgICAgQGJ1YmJsZXNBcnJheUlkcy5wdXNoKGJ1YmJsZS5pZClcblxuICAgICAgaWYgYnViYmxlLmlzVGFyZ2V0XG4gICAgICAgIEBidWJibGVzVG9UZXN0Rm9yVGFwcy51bnNoaWZ0KGJ1YmJsZS5pZClcblxuICAgIHJldHVybiB0aGlzXG5cbiAgYnViYmxlVGFwRGV0ZWN0aW9uSGFuZGxlcjogKCkgLT5cblxuICAgIHRhcmdldEhpdCA9IGZhbHNlXG4gICAgYnViYmxlICA9IGZhbHNlXG5cbiAgICBAYnViYmxlc1RvVGVzdEZvclRhcHMubWFwIChidWJibGVJZCkgPT5cbiAgICAgIGJ1YmJsZUluZGV4ID0gQGJ1YmJsZXNBcnJheUlkcy5pbmRleE9mKGJ1YmJsZUlkKVxuICAgICAgYnViYmxlICAgICAgPSBAYnViYmxlc0FycmF5W2J1YmJsZUluZGV4XVxuICAgICAgdG91Y2hEYXRhICAgPSBJbnB1dC5nZXRUb3VjaERhdGEoZXZlbnQpXG5cbiAgICAgIFV0aWxzLmNvbnNvbGUodG91Y2hEYXRhKVxuXG4gICAgICBpZiBidWJibGU/IGFuZCBidWJibGUud2FzVGFwcGVkKHRvdWNoRGF0YSlcbiAgICAgICAgZGVsZXRpb25JbmRleCAgICAgICA9IEBidWJibGVzVG9UZXN0Rm9yVGFwcy5pbmRleE9mKGJ1YmJsZUlkKVxuICAgICAgICBidWJibGUuZGVzdHJveWluZyA9IHRydWVcbiAgICAgICAgdGFyZ2V0SGl0ICAgICAgICAgICA9IHRydWVcblxuICAgICAgICBAYnViYmxlc1RvVGVzdEZvclRhcHMuc3BsaWNlKGRlbGV0aW9uSW5kZXgsIDEpXG5cbiAgICAgICAgcmV0dXJuXG5cbiAgICBQbGF5U3RhdGUudXBkYXRlQ29tYm9NdWx0aXBsaWVyKHRhcmdldEhpdClcblxuICAgIFBsYXlTdGF0ZS51cGRhdGVTY29yZShidWJibGUuc2l6ZSwgYnViYmxlLmZpbmFsU2l6ZSkgaWYgdGFyZ2V0SGl0XG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHJlZ2lzdGVyQnViYmxlVGFwRGV0ZWN0aW9uSGFuZGxlcjogLT5cblxuICAgIElucHV0LnJlZ2lzdGVySGFuZGxlciAnLnVpLXBsYXlpbmcnLCBpbnB1dFZlcmIsIC0+XG4gICAgICBCdWJibGVHZW5lcmF0b3IuYnViYmxlVGFwRGV0ZWN0aW9uSGFuZGxlcigpXG4gICAgLCBbJ3BsYXlpbmcnXVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICByZW1vdmVCdWJibGU6IChidWJibGUpIC0+XG5cbiAgICBpZCAgICA9IGJ1YmJsZS5pZFxuICAgIGluZGV4ID0gQGJ1YmJsZXNBcnJheUlkcy5pbmRleE9mKGlkKVxuXG4gICAgQGJ1YmJsZXNBcnJheS5zcGxpY2UoaW5kZXgsIDEpXG4gICAgQGJ1YmJsZXNBcnJheUlkcy5zcGxpY2UoaW5kZXgsIDEpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHJlbW92ZUJ1YmJsZXNBZnRlclRhcDogLT5cblxuICAgIEBidWJibGVzQXJyYXkubWFwIChidWJibGUpID0+XG4gICAgICBAcmVtb3ZlQnViYmxlKGJ1YmJsZSkgaWYgYnViYmxlLnNpemUgPCAxXG5cbiAgICAgIHJldHVyblxuXG4gICAgcmV0dXJuIHRoaXNcblxuICByZXNldDogLT5cblxuICAgIEBidWJibGVzQXJyYXkgICAgICAgICA9IFtdXG4gICAgQGJ1YmJsZXNBcnJheUlkcyAgICAgID0gW11cbiAgICBAYnViYmxlc1RvRGVsZXRlICAgICAgPSBbXVxuICAgIEBidWJibGVzVG9UZXN0Rm9yVGFwcyA9IFtdXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHN0b3A6IC0+XG5cbiAgICBQbGF5U3RhdGUudXBkYXRlKGZhbHNlKVxuICAgIFBsYXlTdGF0ZS5zdG9wTGV2ZWxVcEluY3JlbWVudCgpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHVwZGF0ZUJ1YmJsZXNWYWx1ZXM6IC0+XG5cbiAgICBAYnViYmxlc0FycmF5Lm1hcCAoYnViYmxlKSA9PlxuICAgICAgY29udGV4dC5maWxsU3R5bGUgICA9IGJ1YmJsZS5jb2xvclxuICAgICAgY29udGV4dC5zdHJva2VTdHlsZSA9IGJ1YmJsZS5jb2xvclxuXG4gICAgICBidWJibGUudXBkYXRlVmFsdWVzKClcblxuICAgICAgcmV0dXJuXG5cbiAgICByZXR1cm4gdGhpc1xuIiwiXG5jbGFzcyBDb25maWdDbGFzc1xuXG4gIGNoYW5jZUJ1YmJsZUlzVGFyZ2V0OlxuICAgIGVhc3k6ICAgICAgNTBcbiAgICBkaWZmaWN1bHQ6IDkwXG5cbiAgbGV2ZWxVcEludGVydmFsOiA1XG5cbiAgbWF4TGV2ZWw6IDUwXG5cbiAgbWF4TGluZVdpZHRoOiA1XG5cbiAgbWF4VGFyZ2V0c0F0T25jZTpcbiAgICBlYXN5OiAgICAgIDNcbiAgICBkaWZmaWN1bHQ6IDZcblxuICBidWJibGVHcm93dGhNdWx0aXBsaWVyOlxuICAgIGVhc3k6ICAgICAgMS4wNVxuICAgIGRpZmZpY3VsdDogMS4xMFxuXG4gIGJ1YmJsZVNwYXduQ2hhbmNlOlxuICAgIGVhc3k6ICAgICAgNjBcbiAgICBkaWZmaWN1bHQ6IDEwMFxuXG4gIGJ1YmJsZURpYW1ldGVyQXNQZXJjZW50YWdlT2ZTY3JlZW46IDE1XG5cbiAgcG9pbnRzUGVyUG9wOiAxMFxuXG4gIHByb3BlcnRpZXNUb1VwZGF0ZVdpdGhEaWZmaWN1bHR5OiBbXG4gICAgJ2J1YmJsZVNwYXduQ2hhbmNlJ1xuICAgICdjaGFuY2VCdWJibGVJc1RhcmdldCdcbiAgICAnYnViYmxlR3Jvd3RoTXVsdGlwbGllcidcbiAgICAnc2l6ZU1heCdcbiAgICAnbWF4VGFyZ2V0c0F0T25jZSdcbiAgICAnbWluVGFyZ2V0U2l6ZSdcbiAgICAndmVsb2NpdHlNaW4nXG4gICAgJ3ZlbG9jaXR5TWF4J1xuICAgICd0YXJnZXRWZWxvY2l0eU11bHRpcGxpZXInXG4gIF1cblxuICB0YXJnZXRWZWxvY2l0eU11bHRpcGxpZXI6XG4gICAgZWFzeTogICAgICAwLjNcbiAgICBkaWZmaWN1bHQ6IDAuNVxuXG4gIHZlbG9jaXR5TWluOlxuICAgIGVhc3k6ICAgICAgLTZcbiAgICBkaWZmaWN1bHQ6IC0xMFxuXG4gIHZlbG9jaXR5TWF4OlxuICAgIGVhc3k6ICAgICAgNlxuICAgIGRpZmZpY3VsdDogMTBcblxuICBjb25zdHJ1Y3RvcjogLT5cblxuICAgIGJhc2VTY3JlZW5XaWR0aCA9IE1hdGgubWluKGJvZHkuY2xpZW50V2lkdGgsIGJvZHkuY2xpZW50SGVpZ2h0KSAvIDEwMFxuICAgIGJhc2VCdWJibGVXaWR0aCA9IE1hdGgucm91bmQoYmFzZVNjcmVlbldpZHRoICogQGJ1YmJsZURpYW1ldGVyQXNQZXJjZW50YWdlT2ZTY3JlZW4pXG4gICAgQGJhc2VCdWJibGVTaXplID0gYmFzZUJ1YmJsZVdpZHRoICogZGV2aWNlUGl4ZWxSYXRpb1xuXG4gICAgQG1pblRhcmdldFNpemUgPVxuICAgICAgZWFzeTogICAgICBAYmFzZUJ1YmJsZVNpemUgKiAwLjdcbiAgICAgIGRpZmZpY3VsdDogQGJhc2VCdWJibGVTaXplICogMC40XG5cbiAgICBAc2l6ZU1heCA9XG4gICAgICBlYXN5OiAgICAgIEBiYXNlQnViYmxlU2l6ZVxuICAgICAgZGlmZmljdWx0OiBAYmFzZUJ1YmJsZVNpemUgKiAwLjZcblxuICAgIHJldHVybiB0aGlzXG5cbiAgdXBkYXRlVmFsdWVzRm9yRGlmZmljdWx0eTogLT5cblxuICAgIEBwcm9wZXJ0aWVzVG9VcGRhdGVXaXRoRGlmZmljdWx0eS5tYXAgKHByb3BlcnR5KSA9PlxuICAgICAgcHJvcGVydHlDb25maWcgID0gQFtwcm9wZXJ0eV1cbiAgICAgIHZhbHVlRGlmZmVyZW5jZSA9IHByb3BlcnR5Q29uZmlnLmRpZmZpY3VsdCAtIHByb3BlcnR5Q29uZmlnLmVhc3lcbiAgICAgIGxldmVsTXVsaXRwbGllciA9IFBsYXlTdGF0ZS5sZXZlbCAvIEBtYXhMZXZlbFxuXG4gICAgICBQbGF5U3RhdGVbcHJvcGVydHldID0gKHZhbHVlRGlmZmVyZW5jZSAqIGxldmVsTXVsaXRwbGllcikgKyBwcm9wZXJ0eUNvbmZpZy5lYXN5XG5cbiAgICAgIHJldHVyblxuXG4gICAgcmV0dXJuIHRoaXNcbiIsIlxuY2xhc3MgRGV2aWNlQ2xhc3NcblxuICBjb25zdHJ1Y3RvcjogLT5cblxuICAgIHJldHVybiB0aGlzXG4iLCJcbmNsYXNzIEdhbWVDbGFzc1xuXG4gIGNvbnN0cnVjdG9yOiAtPlxuXG4gICAgU2NlbmVzLmlkZW50KClcblxuICAgIHJldHVybiB0aGlzXG5cbiAgb3ZlcjogLT5cblxuICAgIFNjZW5lcy5nYW1lT3ZlcigpXG5cbiAgICBVdGlscy5jb25zb2xlKCdHYW1lIE92ZXInKVxuXG4gICAgUGxheVN0YXRlLnN0b3BMZXZlbFVwSW5jcmVtZW50KClcblxuICAgIHJldHVybiB0aGlzXG5cbiAgc3RhcnQ6IC0+XG5cbiAgICBQbGF5U3RhdGUucmVzZXQoKVxuICAgIFVJLnJlc2V0KClcbiAgICBJbnB1dC5yZW1vdmVHYW1lU3RhcnRUYXBFdmVudEhhbmRsZXIoKVxuICAgIEJ1YmJsZUdlbmVyYXRvci5yZXNldCgpXG5cbiAgICBTY2VuZXMucGxheWluZygpXG5cbiAgICBVdGlscy5jb25zb2xlKCdQbGF5aW5nJylcblxuICAgIHJldHVybiB0aGlzXG4iLCJcbmNsYXNzIElucHV0Q2xhc3NcblxuICBjb25zdHJ1Y3RvcjogLT5cblxuICAgIEBjYW5jZWxUb3VjaE1vdmVFdmVudHMoKVxuXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIgaW5wdXRWZXJiLCAoZXZlbnQpIC0+XG4gICAgICAjVXRpbHMuY29uc29sZShldmVudC50eXBlICsgJyBvbiAnICsgZXZlbnQudGFyZ2V0Lm5vZGVOYW1lLnRvTG93ZXJDYXNlKCkpXG4gICAgICByZXR1cm5cbiAgICAsIGZhbHNlXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIGNhbmNlbFRvdWNoTW92ZUV2ZW50czogLT5cblxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyICd0b3VjaG1vdmUnLCAoZXZlbnQpIC0+XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG5cbiAgICAgIHJldHVyblxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBnYW1lU3RhcnRUYXBFdmVudEhhbmRsZXI6ICgpIC0+XG5cbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG5cbiAgICBHYW1lLnN0YXJ0KClcblxuICAgIHJldHVybiB0aGlzXG5cbiAgZ2V0VG91Y2hEYXRhOiAoZXZlbnQpIC0+XG5cbiAgICByZXR1cm4gZXZlbnQudG91Y2hlc1swXSBpZiBoYXNUb3VjaEV2ZW50c1xuXG4gICAgdG91Y2hEYXRhID1cbiAgICAgIHBhZ2VYOiBldmVudC5jbGllbnRYLFxuICAgICAgcGFnZVk6IGV2ZW50LmNsaWVudFlcblxuICAgIHJldHVybiB0b3VjaERhdGFcblxuICByZWdpc3RlckhhbmRsZXI6IChzZWxlY3RvciwgYWN0aW9uLCBjYWxsYmFjaywgc2NlbmVzKSAtPlxuXG4gICAgY29uc29sZS5sb2cgXCJJbnB1dC5yZWdzaXRlckhhbmRsZXIoI3tzZWxlY3Rvcn0sICN7YWN0aW9ufSwgI3tjYWxsYmFja30sICN7c2NlbmVzfSlcIlxuXG4gICAgaWYgdHlwZW9mIHNjZW5lcyA9PSAnc3RyaW5nJ1xuICAgICAgc2NlbmUgID0gc2NlbmVzXG4gICAgICBzY2VuZXMgPSBbc2NlbmVdXG5cbiAgICBlbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3RvcilcblxuICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciBhY3Rpb24sIChldmVudCkgPT5cbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICAgIGNvbnNvbGUubG9nIFwiQ2FsbGluZyAje2FjdGlvbn0gaW5wdXQgb24gI3tlbGVtZW50fSBpbiAje1NjZW5lcy5jdXJyZW50fSlcIlxuICAgICAgY2FsbGJhY2suYXBwbHkoKSBpZiBzY2VuZXMubGVuZ3RoID09IDAgfHwgU2NlbmVzLmN1cnJlbnQgaW4gc2NlbmVzXG4gICAgICByZXR1cm5cblxuICAgIHJldHVybiB0aGlzXG5cbiAgcmVtb3ZlR2FtZVN0YXJ0VGFwRXZlbnRIYW5kbGVyOiAtPlxuXG4gICAgZG9jdW1lbnQuYm9keS5yZW1vdmVFdmVudExpc3RlbmVyKGlucHV0VmVyYiwgQGdhbWVTdGFydFRhcEV2ZW50SGFuZGxlcilcblxuICAgIHJldHVybiB0aGlzXG4iLCJcbmNsYXNzIFBsYXlTdGF0ZUNsYXNzXG5cbiAgZGVmYXVsdHM6XG4gICAgY29tYm9NdWx0aXBsaWVyOiAwXG4gICAgbGV2ZWw6ICAgICAgICAgICAxXG4gICAgc2NvcmU6ICAgICAgICAgICAwXG5cbiAgcmVzZXQ6IC0+XG5cbiAgICBAY2hhbmNlQnViYmxlSXNUYXJnZXQgICAgID0gQ29uZmlnLmNoYW5jZUJ1YmJsZUlzVGFyZ2V0LmVhc3lcbiAgICBAY29tYm9NdWx0aXBsaWVyICAgICAgICAgID0gQGRlZmF1bHRzLmNvbWJvTXVsdGlwbGllclxuICAgIEBsZXZlbCAgICAgICAgICAgICAgICAgICAgPSBAZGVmYXVsdHMubGV2ZWxcbiAgICBAbWF4VGFyZ2V0c0F0T25jZSAgICAgICAgID0gQ29uZmlnLm1heFRhcmdldHNBdE9uY2UuZWFzeVxuICAgIEBtaW5UYXJnZXRTaXplICAgICAgICAgICAgPSBDb25maWcubWluVGFyZ2V0U2l6ZS5lYXN5XG4gICAgQGJ1YmJsZUdyb3d0aE11bHRpcGxpZXIgICA9IENvbmZpZy5idWJibGVHcm93dGhNdWx0aXBsaWVyLmVhc3lcbiAgICBAYnViYmxlU3Bhd25DaGFuY2UgICAgICAgID0gQ29uZmlnLmJ1YmJsZVNwYXduQ2hhbmNlLmVhc3lcbiAgICBAc2NvcmUgICAgICAgICAgICAgICAgICAgID0gQGRlZmF1bHRzLnNjb3JlXG4gICAgQHNpemVNYXggICAgICAgICAgICAgICAgICA9IENvbmZpZy5zaXplTWF4LmVhc3lcbiAgICBAdGFyZ2V0VmVsb2NpdHlNdWx0aXBsaWVyID0gQ29uZmlnLnRhcmdldFZlbG9jaXR5TXVsdGlwbGllci5lYXN5XG4gICAgQHZlbG9jaXR5TWluICAgICAgICAgICAgICA9IENvbmZpZy52ZWxvY2l0eU1pbi5lYXN5XG4gICAgQHZlbG9jaXR5TWF4ICAgICAgICAgICAgICA9IENvbmZpZy52ZWxvY2l0eU1heC5lYXN5XG5cbiAgICBAdXBkYXRlKHRydWUpXG5cbiAgICBDb25maWcudXBkYXRlVmFsdWVzRm9yRGlmZmljdWx0eSgpXG5cbiAgICBAc2V0dXBMZXZlbFVwSW5jcmVtZW50KClcblxuICAgIHJldHVybiB0aGlzXG5cbiAgc3RvcExldmVsVXBJbmNyZW1lbnQ6IC0+XG5cbiAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbChAbGV2ZWxVcENvdW50ZXIpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHNldHVwTGV2ZWxVcEluY3JlbWVudDogLT5cblxuICAgIEBsZXZlbFVwQ291bnRlciA9IHdpbmRvdy5zZXRJbnRlcnZhbCA9PlxuXG4gICAgICBAdXBkYXRlTGV2ZWwoKVxuXG4gICAgICByZXR1cm5cblxuICAgICwgQ29uZmlnLmxldmVsVXBJbnRlcnZhbCAqIDEwMDBcblxuICAgIHJldHVybiB0aGlzXG5cbiAgdXBkYXRlQ29tYm9NdWx0aXBsaWVyOiAodGFyZ2V0SGl0KSAtPlxuXG4gICAgQGNvbWJvTXVsdGlwbGllciA9IGlmIHRhcmdldEhpdCB0aGVuIEBjb21ib011bHRpcGxpZXIgKyAxIGVsc2UgQGRlZmF1bHRzLmNvbWJvTXVsdGlwbGllclxuXG4gICAgVUkudXBkYXRlQ29tYm9NdWx0aXBsaWVyQ291bnRlcigpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHVwZGF0ZTogKG5ld1N0YXRlKSAtPlxuXG4gICAgQHBsYXlpbmcgPSBuZXdTdGF0ZVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICB1cGRhdGVMZXZlbDogLT5cblxuICAgIEBsZXZlbCArPSAxXG5cbiAgICBpZiBAbGV2ZWwgPj0gQ29uZmlnLm1heExldmVsXG4gICAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbChAbGV2ZWxVcENvdW50ZXIpXG5cbiAgICBVSS51cGRhdGVMZXZlbENvdW50ZXIoKVxuICAgIENvbmZpZy51cGRhdGVWYWx1ZXNGb3JEaWZmaWN1bHR5KClcblxuICAgIHJldHVybiB0aGlzXG5cbiAgdXBkYXRlU2NvcmU6IChzaXplV2hlblRhcHBlZCwgc2l6ZVdoZW5GdWxseUdyb3duKSAtPlxuXG4gICAgIygoZGVmYXVsdFNjb3JlUGVyUG9wICsgKDEwMCAtICgoc2l6ZVdoZW5UYXBwZWQgLyBzaXplV2hlbkZ1bGx5R3Jvd24pICogMTAwKSkpICogY29tYm9NdWx0aXBsaWVyKSAqIChsZXZlbE51bWJlciArIDEpXG5cbiAgICB0YXJnZXRTaXplQm9udXMgPSBNYXRoLnJvdW5kKDEwMCAtICgoc2l6ZVdoZW5UYXBwZWQgLyBzaXplV2hlbkZ1bGx5R3Jvd24pICogMTAwKSlcbiAgICBwb3BQb2ludFZhbHVlICAgPSBDb25maWcucG9pbnRzUGVyUG9wICsgdGFyZ2V0U2l6ZUJvbnVzXG4gICAgbGV2ZWxNdWx0aXBsaWVyID0gQGxldmVsICsgMVxuXG4gICAgQHNjb3JlICs9IChwb3BQb2ludFZhbHVlICogQGNvbWJvTXVsdGlwbGllcikgKiAobGV2ZWxNdWx0aXBsaWVyKVxuXG4gICAgVUkudXBkYXRlU2NvcmVDb3VudGVyKClcblxuICAgIHJldHVybiB0aGlzXG4iLCJcbmNsYXNzIFNjZW5lc0NsYXNzXG5cbiAgQGN1cnJlbnQgPSBudWxsXG5cbiAgY3JlZGl0czogLT5cblxuICAgIEBjdXJyZW50ID0gJ2NyZWRpdHMnXG5cbiAgICBVSS51cGRhdGVCb2R5Q2xhc3MoJ2NyZWRpdHMnKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBnYW1lT3ZlcjogLT5cblxuICAgIEBjdXJyZW50ID0gJ2dhbWUtb3ZlcidcblxuICAgIFVJLnVwZGF0ZUJvZHlDbGFzcygnZ2FtZS1vdmVyJylcblxuICAgIHJldHVybiB0aGlzXG5cbiAgbGVhZGVyYm9hcmQ6IC0+XG5cbiAgICBAY3VycmVudCA9ICdsZWFkZXJib2FyZCdcblxuICAgIHJldHVybiB0aGlzXG5cbiAgcGxheWluZzogLT5cblxuICAgIEBjdXJyZW50ID0gJ3BsYXlpbmcnXG5cbiAgICBVSS51cGRhdGVCb2R5Q2xhc3MoJ3BsYXlpbmcnKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBpZGVudDogLT5cblxuICAgIEBjdXJyZW50ID0gJ2lkZW50J1xuXG4gICAgVUkudXBkYXRlQm9keUNsYXNzKCdpZGVudCcpXG5cbiAgICB3aW5kb3cuc2V0VGltZW91dCA9PlxuICAgICAgQHRpdGxlKClcbiAgICAsIDI1MDBcblxuICAgIHJldHVybiB0aGlzXG5cbiAgdGl0bGU6IC0+XG5cbiAgICBAY3VycmVudCA9ICd0aXRsZSdcblxuICAgIFVJLnVwZGF0ZUJvZHlDbGFzcygndGl0bGUnKVxuXG4gICAgcmV0dXJuIHRoaXNcbiIsIlxuY2xhc3MgVUlDbGFzc1xuXG4gIGNvbnN0cnVjdG9yOiAtPlxuXG4gICAgQHNldHVwQmFzaWNJbnRlcmZhY2VFdmVudHMoKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICByZXNldDogLT5cblxuICAgIEBsZXZlbENvdW50ZXIgICAgICAgICAgID0gVXRpbHMuJCgnLmh1ZC12YWx1ZS1sZXZlbCcpXG4gICAgQHNjb3JlQ291bnRlciAgICAgICAgICAgPSBVdGlscy4kKCcuaHVkLXZhbHVlLXNjb3JlJylcbiAgICBAY29tYm9NdWx0aXBsaWVyQ291bnRlciA9IFV0aWxzLiQoJy5odWQtdmFsdWUtY29tYm8nKVxuICAgIEBwbGF5QWdhaW4gICAgICAgICAgICAgID0gVXRpbHMuJCgnLnBsYXktYWdhaW4nKVxuXG4gICAgQHVwZGF0ZUNvbWJvTXVsdGlwbGllckNvdW50ZXIoKVxuICAgIEB1cGRhdGVMZXZlbENvdW50ZXIoKVxuICAgIEB1cGRhdGVTY29yZUNvdW50ZXIoKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBzZXR1cEJhc2ljSW50ZXJmYWNlRXZlbnRzOiAtPlxuXG4gICAgSW5wdXQucmVnaXN0ZXJIYW5kbGVyICcuZ2FtZS1sb2dvJywgaW5wdXRWZXJiLCAtPlxuICAgICAgSW5wdXQuZ2FtZVN0YXJ0VGFwRXZlbnRIYW5kbGVyKClcbiAgICAsIFsndGl0bGUnXVxuXG4gICAgSW5wdXQucmVnaXN0ZXJIYW5kbGVyICcucGxheS1hZ2FpbicsIGlucHV0VmVyYiwgLT5cbiAgICAgIElucHV0LmdhbWVTdGFydFRhcEV2ZW50SGFuZGxlcigpXG4gICAgLCBbJ2dhbWUtb3ZlciddXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHVwZGF0ZUJvZHlDbGFzczogKGNsYXNzTmFtZSkgLT5cblxuICAgIGJvZHkuY2xhc3NOYW1lID0gJydcbiAgICBib2R5LmNsYXNzTGlzdC5hZGQoJ3NjZW5lLScgKyBjbGFzc05hbWUpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHVwZGF0ZUNvbWJvTXVsdGlwbGllckNvdW50ZXI6IC0+XG5cbiAgICBVdGlscy51cGRhdGVVSVRleHROb2RlKEBjb21ib011bHRpcGxpZXJDb3VudGVyLCBQbGF5U3RhdGUuY29tYm9NdWx0aXBsaWVyKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICB1cGRhdGVMZXZlbENvdW50ZXI6IC0+XG5cbiAgICBVdGlscy51cGRhdGVVSVRleHROb2RlKEBsZXZlbENvdW50ZXIsIFBsYXlTdGF0ZS5sZXZlbClcblxuICAgIHJldHVybiB0aGlzXG5cbiAgdXBkYXRlU2NvcmVDb3VudGVyOiAtPlxuXG4gICAgc2NvcmVUb0Zvcm1hdCA9IFV0aWxzLmZvcm1hdFdpdGhDb21tYShQbGF5U3RhdGUuc2NvcmUpXG5cbiAgICBVdGlscy51cGRhdGVVSVRleHROb2RlKEBzY29yZUNvdW50ZXIsIHNjb3JlVG9Gb3JtYXQpXG5cbiAgICByZXR1cm4gdGhpc1xuIiwiXG5jbGFzcyBVdGlsc0NsYXNzXG5cbiAgJDogKHNlbGVjdG9yKSAtPlxuXG4gICAgcmV0dXJuIGRvY3VtZW50LmJvZHkgaWYgc2VsZWN0b3IgPT0gYm9keVxuICAgIHJldHVybiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChzZWxlY3RvcikgaWYgc2VsZWN0b3Iuc3Vic3RyKDAsIDEpID09ICcjJ1xuXG4gICAgZWxzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcilcblxuICAgIHJldHVybiBlbHNbMF0gaWYgZWxzLmxlbmd0aCA9PSAxXG5cbiAgICByZXR1cm4gZWxzXG5cbiAgY29uc29sZTogKGNvbnRlbnQpIC0+XG4gICAgY29uc29sZSA9IEAkKCcuY29uc29sZScpXG4gICAgQHVwZGF0ZVVJVGV4dE5vZGUoY29uc29sZSwgY29udGVudClcbiAgICByZXR1cm5cblxuICBjb3JyZWN0VmFsdWVGb3JEUFI6ICh2YWx1ZSwgaW50ZWdlciA9IGZhbHNlKSAtPlxuXG4gICAgdmFsdWUgKj0gZGV2aWNlUGl4ZWxSYXRpb1xuXG4gICAgdmFsdWUgPSBNYXRoLnJvdW5kKHZhbHVlKSBpZiBpbnRlZ2VyXG5cbiAgICByZXR1cm4gdmFsdWVcblxuICBmb3JtYXRXaXRoQ29tbWE6IChudW0pIC0+XG5cbiAgICByZXR1cm4gbnVtLnRvU3RyaW5nKCkucmVwbGFjZSgvXFxCKD89KFxcZHszfSkrKD8hXFxkKSkvZywgXCIsXCIpXG5cbiAgcmFuZG9tOiAobWluLCBtYXgpIC0+XG5cbiAgICBpZiBtaW4gPT0gdW5kZWZpbmVkXG4gICAgICBtaW4gPSAwXG4gICAgICBtYXggPSAxXG4gICAgZWxzZSBpZiBtYXggPT0gdW5kZWZpbmVkXG4gICAgICBtYXggPSBtaW5cbiAgICAgIG1pbiA9IDBcblxuICAgIHJldHVybiAoTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4pKSArIG1pbjtcblxuICByYW5kb21Db2xvcjogKGFscGhhID0gZmFsc2UpIC0+XG5cbiAgICBjb2xvcnMgPVxuICAgICAgcjogdGhpcy5yYW5kb21JbnRlZ2VyKDAsIDIwMClcbiAgICAgIGc6IHRoaXMucmFuZG9tSW50ZWdlcigwLCAyMDApXG4gICAgICBiOiB0aGlzLnJhbmRvbUludGVnZXIoMCwgMjAwKVxuICAgICAgYTogaWYgIWFscGhhIHRoZW4gdGhpcy5yYW5kb20oMC43NSwgMSkgZWxzZSBhbHBoYVxuXG4gICAgcmV0dXJuICdyZ2JhKCcgKyBjb2xvcnMuciArICcsICcgKyBjb2xvcnMuZyArICcsICcgKyBjb2xvcnMuYiArICcsICcgKyBjb2xvcnMuYSArICcpJ1xuXG4gIHJhbmRvbUludGVnZXI6IChtaW4sIG1heCkgLT5cblxuICAgIGlmIG1heCA9PSB1bmRlZmluZWRcbiAgICAgIG1heCA9IG1pblxuICAgICAgbWluID0gMFxuXG4gICAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChtYXggKyAxIC0gbWluKSkgKyBtaW5cblxuICByYW5kb21QZXJjZW50YWdlOiAtPlxuXG4gICAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDEwMClcblxuICB1cGRhdGVVSVRleHROb2RlOiAoZWxlbWVudCwgdmFsdWUpIC0+XG5cbiAgICBlbGVtZW50LmlubmVySFRNTCA9IHZhbHVlXG5cbiAgICByZXR1cm4gdGhpc1xuIiwiXG5kZWJ1ZyA9IHRydWVcblxuYW5kcm9pZCAgICAgICAgPSBpZiBuYXZpZ2F0b3IudXNlckFnZW50Lm1hdGNoKC9hbmRyb2lkL2kpIHRoZW4gdHJ1ZSBlbHNlIGZhbHNlXG5ib2R5ICAgICAgICAgICA9IGRvY3VtZW50LmJvZHlcbmNhbnZhcyAgICAgICAgID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmNhbnZhcycpXG5oYXNUb3VjaEV2ZW50cyA9IHdpbmRvdy5oYXNPd25Qcm9wZXJ0eSgnb250b3VjaHN0YXJ0JykgfHwgd2luZG93Lmhhc093blByb3BlcnR5KCdvbm1zZ2VzdHVyZWNoYW5nZScpXG5pbnB1dFZlcmIgICAgICA9IGlmIGhhc1RvdWNoRXZlbnRzIHRoZW4gJ3RvdWNoc3RhcnQnIGVsc2UgJ2NsaWNrJ1xuXG5jYW52YXMuY2xhc3NOYW1lID0gJ2NhbnZhcydcbmNhbnZhcy53aWR0aCAgICAgPSBib2R5LmNsaWVudFdpZHRoXG5jYW52YXMuaGVpZ2h0ICAgID0gYm9keS5jbGllbnRIZWlnaHRcblxuY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpXG5cbmNvbnRleHQuZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gJ3NvdXJjZS1hdG9wJ1xuXG5kZXZpY2VQaXhlbFJhdGlvICA9IHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvIHx8IDFcbmJhY2tpbmdTdG9yZVJhdGlvID0gY29udGV4dC53ZWJraXRCYWNraW5nU3RvcmVQaXhlbFJhdGlvIHx8IGNvbnRleHQuYmFja2luZ1N0b3JlUGl4ZWxSYXRpbyB8fCAxXG5yYXRpbyAgICAgICAgICAgICA9IGRldmljZVBpeGVsUmF0aW8gLyBiYWNraW5nU3RvcmVSYXRpb1xuXG5pZiBkZXZpY2VQaXhlbFJhdGlvICE9IGJhY2tpbmdTdG9yZVJhdGlvXG4gIG9sZFdpZHRoICA9IGNhbnZhcy53aWR0aFxuICBvbGRIZWlnaHQgPSBjYW52YXMuaGVpZ2h0XG5cbiAgY2FudmFzLndpZHRoICA9IG9sZFdpZHRoICAqIHJhdGlvXG4gIGNhbnZhcy5oZWlnaHQgPSBvbGRIZWlnaHQgKiByYXRpb1xuXG4gIGNhbnZhcy5zdHlsZS53aWR0aCAgPSBcIiN7b2xkV2lkdGh9cHhcIlxuICBjYW52YXMuc3R5bGUuaGVpZ2h0ID0gXCIje29sZEhlaWdodH1weFwiXG5cbiAgY29udGV4dC5zY2FsZShyYXRpbywgcmF0aW8pXG5cbiMgU2V0IGVudmlyb25tZW50IGFuZCBiYXNlIGNvbmZpZyBldGNcbkRldmljZSAgICAgICAgICA9IG5ldyBEZXZpY2VDbGFzcygpXG5VdGlscyAgICAgICAgICAgPSBuZXcgVXRpbHNDbGFzcygpXG5Db25maWcgICAgICAgICAgPSBuZXcgQ29uZmlnQ2xhc3MoKVxuSW5wdXQgICAgICAgICAgID0gbmV3IElucHV0Q2xhc3MoKVxuXG4jIExvYWQgdGhlIGdhbWUgbG9naWMgYW5kIGFsbCB0aGF0XG5CdWJibGVHZW5lcmF0b3IgPSBuZXcgQnViYmxlR2VuZXJhdG9yQ2xhc3MoKVxuUGxheVN0YXRlICAgICAgID0gbmV3IFBsYXlTdGF0ZUNsYXNzKClcblVJICAgICAgICAgICAgICA9IG5ldyBVSUNsYXNzKClcblNjZW5lcyAgICAgICAgICA9IG5ldyBTY2VuZXNDbGFzcygpXG5cbiMgU2V0IG9mZiB0aGUgY2FudmFzIGFuaW1hdGlvbiBsb29wXG5BbmltYXRpb25Mb29wICAgPSBuZXcgQW5pbWF0aW9uTG9vcENsYXNzKClcblxuIyBTdGFydCB0aGUgYWN0dWFsIGdhbWVcbkdhbWUgICAgICAgICAgICA9IG5ldyBHYW1lQ2xhc3MoKVxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9