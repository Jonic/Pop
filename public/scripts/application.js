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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkFuaW1hdGlvbkxvb3AuY29mZmVlIiwiQnViYmxlLmNvZmZlZSIsIkJ1YmJsZUdlbmVyYXRvci5jb2ZmZWUiLCJDb25maWcuY29mZmVlIiwiRGV2aWNlLmNvZmZlZSIsIkdhbWUuY29mZmVlIiwiSW5wdXQuY29mZmVlIiwiUGxheVN0YXRlLmNvZmZlZSIsIlNjZW5lcy5jb2ZmZWUiLCJVSS5jb2ZmZWUiLCJVdGlscy5jb2ZmZWUiLCJfYm9vdHN0cmFwLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxJQUFBLGtCQUFBOztBQUFBO0FBRWUsRUFBQSw0QkFBQSxHQUFBO0FBRVgsSUFBQSxJQUFDLENBQUEscUJBQUQsQ0FBQSxDQUFBLENBQUE7QUFFQSxXQUFPLElBQVAsQ0FKVztFQUFBLENBQWI7O0FBQUEsK0JBTUEsb0JBQUEsR0FBc0IsU0FBQSxHQUFBO0FBRXBCLElBQUEsTUFBTSxDQUFDLG9CQUFQLENBQTRCLElBQUMsQ0FBQSxlQUE3QixDQUFBLENBQUE7QUFFQSxXQUFPLElBQVAsQ0FKb0I7RUFBQSxDQU50QixDQUFBOztBQUFBLCtCQVlBLHFCQUFBLEdBQXVCLFNBQUEsR0FBQTtBQUVyQixJQUFBLElBQUMsQ0FBQSxlQUFELEdBQW1CLE1BQU0sQ0FBQyxxQkFBUCxDQUE2QixDQUFBLFNBQUEsS0FBQSxHQUFBO2FBQUEsU0FBQSxHQUFBO0FBRTlDLFFBQUEsS0FBQyxDQUFBLHFCQUFELENBQUEsQ0FBQSxDQUY4QztNQUFBLEVBQUE7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTdCLENBQW5CLENBQUE7QUFBQSxJQU1BLE1BQU0sQ0FBQyxLQUFQLEdBQWUsTUFBTSxDQUFDLEtBTnRCLENBQUE7QUFBQSxJQVFBLGVBQWUsQ0FBQyxvQkFBaEIsQ0FBQSxDQVJBLENBQUE7QUFVQSxXQUFPLElBQVAsQ0FacUI7RUFBQSxDQVp2QixDQUFBOzs0QkFBQTs7SUFGRixDQUFBOztBQ0FBLElBQUEsV0FBQTs7QUFBQTtBQUVFLHdCQUFBLFVBQUEsR0FBWSxLQUFaLENBQUE7O0FBQUEsd0JBQ0EsSUFBQSxHQUFZLENBRFosQ0FBQTs7QUFHYSxFQUFBLHFCQUFBLEdBQUE7QUFFWCxRQUFBLFVBQUE7QUFBQSxJQUFBLENBQUEsR0FBSSxLQUFLLENBQUMsYUFBTixDQUFvQixDQUFwQixFQUF1QixHQUF2QixDQUFKLENBQUE7QUFBQSxJQUNBLENBQUEsR0FBSSxLQUFLLENBQUMsYUFBTixDQUFvQixDQUFwQixFQUF1QixHQUF2QixDQURKLENBQUE7QUFBQSxJQUVBLENBQUEsR0FBSSxLQUFLLENBQUMsYUFBTixDQUFvQixDQUFwQixFQUF1QixHQUF2QixDQUZKLENBQUE7QUFBQSxJQUdBLENBQUEsR0FBSSxLQUFLLENBQUMsTUFBTixDQUFhLElBQWIsRUFBbUIsQ0FBbkIsQ0FISixDQUFBO0FBQUEsSUFLQSxJQUFDLENBQUEsS0FBRCxHQUFlLE9BQUEsR0FBTyxDQUFQLEdBQVMsSUFBVCxHQUFhLENBQWIsR0FBZSxJQUFmLEdBQW1CLENBQW5CLEdBQXFCLElBQXJCLEdBQXlCLENBQXpCLEdBQTJCLEdBTDFDLENBQUE7QUFBQSxJQU1BLElBQUMsQ0FBQSxTQUFELEdBQWMsS0FBSyxDQUFDLGFBQU4sQ0FBb0IsQ0FBcEIsRUFBdUIsU0FBUyxDQUFDLE9BQWpDLENBTmQsQ0FBQTtBQUFBLElBT0EsSUFBQyxDQUFBLEVBQUQsR0FBYyxJQUFJLENBQUMsTUFBTCxDQUFBLENBQWEsQ0FBQyxRQUFkLENBQXVCLEVBQXZCLENBQTBCLENBQUMsTUFBM0IsQ0FBa0MsQ0FBbEMsRUFBcUMsQ0FBckMsQ0FQZCxDQUFBO0FBQUEsSUFRQSxJQUFDLENBQUEsUUFBRCxHQUFjLElBQUMsQ0FBQSxxQkFBRCxDQUFBLENBUmQsQ0FBQTtBQUFBLElBU0EsSUFBQyxDQUFBLFFBQUQsR0FDRTtBQUFBLE1BQUEsQ0FBQSxFQUFHLGVBQWUsQ0FBQyxhQUFhLENBQUMsQ0FBakM7QUFBQSxNQUNBLENBQUEsRUFBRyxlQUFlLENBQUMsYUFBYSxDQUFDLENBRGpDO0tBVkYsQ0FBQTtBQUFBLElBWUEsSUFBQyxDQUFBLFFBQUQsR0FDRTtBQUFBLE1BQUEsQ0FBQSxFQUFHLEtBQUssQ0FBQyxNQUFOLENBQWEsU0FBUyxDQUFDLFdBQXZCLEVBQW9DLFNBQVMsQ0FBQyxXQUE5QyxDQUFIO0FBQUEsTUFDQSxDQUFBLEVBQUcsS0FBSyxDQUFDLE1BQU4sQ0FBYSxTQUFTLENBQUMsV0FBdkIsRUFBb0MsU0FBUyxDQUFDLFdBQTlDLENBREg7S0FiRixDQUFBO0FBZ0JBLElBQUEsSUFBRyxJQUFDLENBQUEsUUFBSjtBQUNFLE1BQUEsSUFBQyxDQUFBLEtBQUQsR0FBYyxPQUFBLEdBQU8sQ0FBUCxHQUFTLElBQVQsR0FBYSxDQUFiLEdBQWUsSUFBZixHQUFtQixDQUFuQixHQUFxQixRQUFuQyxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsU0FBRCxHQUFhLEtBQUssQ0FBQyxhQUFOLENBQW9CLFNBQVMsQ0FBQyxhQUE5QixFQUE2QyxTQUFTLENBQUMsT0FBdkQsQ0FEYixDQUFBO0FBQUEsTUFHQSxJQUFDLENBQUEsUUFBUSxDQUFDLENBQVYsSUFBZSxTQUFTLENBQUMsd0JBSHpCLENBQUE7QUFBQSxNQUlBLElBQUMsQ0FBQSxRQUFRLENBQUMsQ0FBVixJQUFlLFNBQVMsQ0FBQyx3QkFKekIsQ0FERjtLQWhCQTtBQXVCQSxXQUFPLElBQVAsQ0F6Qlc7RUFBQSxDQUhiOztBQUFBLHdCQThCQSxxQkFBQSxHQUF1QixTQUFBLEdBQUE7QUFFckIsUUFBQSxRQUFBO0FBQUEsSUFBQSxRQUFBLEdBQVcsS0FBWCxDQUFBO0FBRUEsSUFBQSxJQUFHLGVBQWUsQ0FBQyxvQkFBb0IsQ0FBQyxNQUFyQyxHQUE4QyxTQUFTLENBQUMsZ0JBQTNEO0FBQ0UsTUFBQSxRQUFBLEdBQVcsS0FBSyxDQUFDLGdCQUFOLENBQUEsQ0FBQSxHQUEyQixTQUFTLENBQUMsb0JBQWhELENBREY7S0FGQTtBQUtBLFdBQU8sUUFBUCxDQVBxQjtFQUFBLENBOUJ2QixDQUFBOztBQUFBLHdCQXVDQSxJQUFBLEdBQU0sU0FBQSxHQUFBO0FBRUosSUFBQSxJQUFHLElBQUMsQ0FBQSxtQkFBRCxDQUFBLENBQUg7QUFDRSxNQUFBLGVBQWUsQ0FBQyxlQUFlLENBQUMsSUFBaEMsQ0FBcUMsSUFBQyxDQUFBLEVBQXRDLENBQUEsQ0FBQTtBQUVBLFlBQUEsQ0FIRjtLQUFBO0FBS0EsSUFBQSxJQUFHLElBQUMsQ0FBQSxRQUFKO0FBQ0UsTUFBQSxJQUFDLENBQUEsU0FBRCxHQUFhLElBQUMsQ0FBQSxJQUFELEdBQVEsRUFBckIsQ0FBQTtBQUVBLE1BQUEsSUFBRyxJQUFDLENBQUEsU0FBRCxHQUFhLE1BQU0sQ0FBQyxZQUF2QjtBQUNFLFFBQUEsSUFBQyxDQUFBLFNBQUQsR0FBYSxNQUFNLENBQUMsWUFBcEIsQ0FERjtPQUZBO0FBQUEsTUFLQSxPQUFPLENBQUMsU0FBUixHQUFvQiwwQkFMcEIsQ0FBQTtBQUFBLE1BTUEsT0FBTyxDQUFDLFNBQVIsR0FBb0IsSUFBQyxDQUFBLFNBTnJCLENBREY7S0FMQTtBQUFBLElBY0EsT0FBTyxDQUFDLFNBQVIsQ0FBQSxDQWRBLENBQUE7QUFBQSxJQWVBLE9BQU8sQ0FBQyxHQUFSLENBQVksSUFBQyxDQUFBLFFBQVEsQ0FBQyxDQUF0QixFQUF5QixJQUFDLENBQUEsUUFBUSxDQUFDLENBQW5DLEVBQXNDLElBQUMsQ0FBQSxJQUF2QyxFQUE2QyxDQUE3QyxFQUFnRCxJQUFJLENBQUMsRUFBTCxHQUFVLENBQTFELEVBQTZELElBQTdELENBZkEsQ0FBQTtBQUFBLElBZ0JBLE9BQU8sQ0FBQyxJQUFSLENBQUEsQ0FoQkEsQ0FBQTtBQWlCQSxJQUFBLElBQW9CLElBQUMsQ0FBQSxRQUFyQjtBQUFBLE1BQUEsT0FBTyxDQUFDLE1BQVIsQ0FBQSxDQUFBLENBQUE7S0FqQkE7QUFBQSxJQWtCQSxPQUFPLENBQUMsU0FBUixDQUFBLENBbEJBLENBQUE7QUFvQkEsV0FBTyxJQUFQLENBdEJJO0VBQUEsQ0F2Q04sQ0FBQTs7QUFBQSx3QkErREEsbUJBQUEsR0FBcUIsU0FBQSxHQUFBO0FBRW5CLFFBQUEsNEJBQUE7QUFBQSxJQUFBLGFBQUEsR0FBZ0IsSUFBQyxDQUFBLFFBQVEsQ0FBQyxDQUFWLEdBQWMsQ0FBQSxJQUFHLENBQUEsU0FBakIsSUFBK0IsSUFBQyxDQUFBLFFBQVEsQ0FBQyxDQUFWLEdBQWMsTUFBTSxDQUFDLEtBQVAsR0FBZ0IsSUFBQyxDQUFBLFNBQTlFLENBQUE7QUFBQSxJQUNBLGFBQUEsR0FBZ0IsSUFBQyxDQUFBLFFBQVEsQ0FBQyxDQUFWLEdBQWMsQ0FBQSxJQUFHLENBQUEsU0FBakIsSUFBK0IsSUFBQyxDQUFBLFFBQVEsQ0FBQyxDQUFWLEdBQWMsTUFBTSxDQUFDLE1BQVAsR0FBZ0IsSUFBQyxDQUFBLFNBRDlFLENBQUE7QUFHQSxXQUFPLGFBQUEsSUFBaUIsYUFBeEIsQ0FMbUI7RUFBQSxDQS9EckIsQ0FBQTs7QUFBQSx3QkFzRUEsWUFBQSxHQUFjLFNBQUEsR0FBQTtBQUVaLFFBQUEsZ0JBQUE7QUFBQSxJQUFBLElBQUcsSUFBQyxDQUFBLFVBQUo7QUFDRSxNQUFBLGdCQUFBLEdBQXNCLFNBQVMsQ0FBQyxPQUFiLEdBQTBCLEdBQTFCLEdBQW1DLEdBQXRELENBQUE7QUFBQSxNQUVBLElBQUMsQ0FBQSxJQUFELElBQVMsZ0JBRlQsQ0FERjtLQUFBLE1BQUE7QUFLRSxNQUFBLElBQUcsSUFBQyxDQUFBLElBQUQsR0FBUSxJQUFDLENBQUEsU0FBWjtBQUNFLFFBQUEsSUFBQyxDQUFBLElBQUQsSUFBUyxTQUFTLENBQUMsc0JBQW5CLENBREY7T0FBQTtBQUdBLE1BQUEsSUFBRyxJQUFDLENBQUEsSUFBRCxHQUFRLElBQUMsQ0FBQSxTQUFaO0FBQ0UsUUFBQSxJQUFDLENBQUEsSUFBRCxHQUFRLElBQUMsQ0FBQSxTQUFULENBREY7T0FSRjtLQUFBO0FBQUEsSUFXQSxJQUFDLENBQUEsSUFBRCxHQUFRLElBQUMsQ0FBQSxJQUFELEdBQVEsQ0FYaEIsQ0FBQTtBQUFBLElBYUEsSUFBQyxDQUFBLFFBQVEsQ0FBQyxDQUFWLElBQWUsSUFBQyxDQUFBLFFBQVEsQ0FBQyxDQWJ6QixDQUFBO0FBQUEsSUFjQSxJQUFDLENBQUEsUUFBUSxDQUFDLENBQVYsSUFBZSxJQUFDLENBQUEsUUFBUSxDQUFDLENBZHpCLENBQUE7QUFBQSxJQWdCQSxJQUFDLENBQUEsSUFBRCxDQUFBLENBaEJBLENBQUE7QUFrQkEsV0FBTyxJQUFQLENBcEJZO0VBQUEsQ0F0RWQsQ0FBQTs7QUFBQSx3QkE0RkEsU0FBQSxHQUFXLFNBQUMsU0FBRCxHQUFBO0FBRVQsUUFBQSxnREFBQTtBQUFBLElBQUEsSUFBQSxHQUFZLFNBQVMsQ0FBQyxLQUFWLEdBQWtCLGdCQUE5QixDQUFBO0FBQUEsSUFDQSxJQUFBLEdBQVksU0FBUyxDQUFDLEtBQVYsR0FBa0IsZ0JBRDlCLENBQUE7QUFBQSxJQUVBLFNBQUEsR0FBWSxJQUFBLEdBQU8sSUFBQyxDQUFBLFFBQVEsQ0FBQyxDQUY3QixDQUFBO0FBQUEsSUFHQSxTQUFBLEdBQVksSUFBQSxHQUFPLElBQUMsQ0FBQSxRQUFRLENBQUMsQ0FIN0IsQ0FBQTtBQUFBLElBSUEsTUFBQSxHQUFZLElBQUMsQ0FBQSxJQUpiLENBQUE7QUFBQSxJQVFBLE1BQUEsR0FBUyxDQUFDLFNBQUEsR0FBWSxTQUFiLENBQUEsR0FBMEIsQ0FBQyxTQUFBLEdBQVksU0FBYixDQUExQixHQUFvRCxDQUFDLElBQUMsQ0FBQSxJQUFELEdBQVEsSUFBQyxDQUFBLElBQVYsQ0FSN0QsQ0FBQTtBQVVBLElBQUEsSUFBRyxNQUFIO0FBQ0UsTUFBQSxLQUFLLENBQUMsT0FBTixDQUFlLFNBQUEsR0FBUyxJQUFDLENBQUEsRUFBVixHQUFhLGFBQWIsR0FBMEIsSUFBMUIsR0FBK0IsSUFBL0IsR0FBbUMsSUFBbEQsQ0FBQSxDQURGO0tBQUEsTUFBQTtBQUdFLE1BQUEsS0FBSyxDQUFDLE9BQU4sQ0FBYyxlQUFkLENBQUEsQ0FIRjtLQVZBO0FBZUEsV0FBTyxNQUFQLENBakJTO0VBQUEsQ0E1RlgsQ0FBQTs7cUJBQUE7O0lBRkYsQ0FBQTs7QUNBQSxJQUFBLG9CQUFBOztBQUFBO0FBRWUsRUFBQSw4QkFBQSxHQUFBO0FBRVgsSUFBQSxJQUFDLENBQUEsWUFBRCxHQUF3QixFQUF4QixDQUFBO0FBQUEsSUFDQSxJQUFDLENBQUEsZUFBRCxHQUF3QixFQUR4QixDQUFBO0FBQUEsSUFFQSxJQUFDLENBQUEsZUFBRCxHQUF3QixFQUZ4QixDQUFBO0FBQUEsSUFHQSxJQUFDLENBQUEsb0JBQUQsR0FBd0IsRUFIeEIsQ0FBQTtBQUFBLElBS0EsSUFBQyxDQUFBLGFBQUQsR0FDRTtBQUFBLE1BQUEsQ0FBQSxFQUFHLE1BQU0sQ0FBQyxLQUFQLEdBQWdCLENBQW5CO0FBQUEsTUFDQSxDQUFBLEVBQUcsTUFBTSxDQUFDLE1BQVAsR0FBZ0IsQ0FEbkI7S0FORixDQUFBO0FBQUEsSUFTQSxJQUFDLENBQUEsaUNBQUQsQ0FBQSxDQVRBLENBQUE7QUFXQSxXQUFPLElBQVAsQ0FiVztFQUFBLENBQWI7O0FBQUEsaUNBZUEsb0JBQUEsR0FBc0IsU0FBQSxHQUFBO0FBRXBCLElBQUEsSUFBRyxTQUFTLENBQUMsT0FBYjtBQUNFLE1BQUEsSUFBQyxDQUFBLGNBQUQsQ0FBQSxDQUFBLENBREY7S0FBQTtBQUFBLElBR0EsSUFBQyxDQUFBLG1CQUFELENBQUEsQ0FIQSxDQUFBO0FBQUEsSUFJQSxJQUFDLENBQUEscUJBQUQsQ0FBQSxDQUpBLENBQUE7QUFNQSxJQUFBLElBQUcsSUFBQyxDQUFBLGVBQWUsQ0FBQyxNQUFqQixHQUEwQixDQUE3QjtBQUNFLE1BQUEsSUFBQyxDQUFBLGlDQUFELENBQUEsQ0FBQSxDQURGO0tBTkE7QUFTQSxXQUFPLElBQVAsQ0FYb0I7RUFBQSxDQWZ0QixDQUFBOztBQUFBLGlDQTRCQSxpQ0FBQSxHQUFtQyxTQUFBLEdBQUE7QUFFakMsSUFBQSxJQUFDLENBQUEsZUFBZSxDQUFDLEdBQWpCLENBQXFCLENBQUEsU0FBQSxLQUFBLEdBQUE7YUFBQSxTQUFDLFFBQUQsR0FBQTtBQUNuQixZQUFBLG1CQUFBO0FBQUEsUUFBQSxXQUFBLEdBQWMsS0FBQyxDQUFBLGVBQWUsQ0FBQyxPQUFqQixDQUF5QixRQUF6QixDQUFkLENBQUE7QUFBQSxRQUNBLE1BQUEsR0FBYyxLQUFDLENBQUEsWUFBYSxDQUFBLFdBQUEsQ0FENUIsQ0FBQTtBQUdBLFFBQUEsSUFBRyxjQUFIO0FBQ0UsVUFBQSxJQUFlLE1BQU0sQ0FBQyxRQUF0QjtBQUFBLFlBQUEsS0FBQyxDQUFBLFFBQUQsQ0FBQSxDQUFBLENBQUE7V0FBQTtpQkFDQSxLQUFDLENBQUEsWUFBRCxDQUFjLE1BQWQsRUFGRjtTQUptQjtNQUFBLEVBQUE7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXJCLENBQUEsQ0FBQTtBQUFBLElBUUEsSUFBQyxDQUFBLGVBQUQsR0FBbUIsRUFSbkIsQ0FBQTtBQVVBLFdBQU8sSUFBUCxDQVppQztFQUFBLENBNUJuQyxDQUFBOztBQUFBLGlDQTBDQSxRQUFBLEdBQVUsU0FBQSxHQUFBO0FBRVIsSUFBQSxJQUFDLENBQUEsSUFBRCxDQUFBLENBQUEsQ0FBQTtBQUFBLElBRUEsSUFBQyxDQUFBLFlBQVksQ0FBQyxHQUFkLENBQWtCLENBQUEsU0FBQSxLQUFBLEdBQUE7YUFBQSxTQUFDLE1BQUQsR0FBQTtlQUNoQixNQUFNLENBQUMsVUFBUCxHQUFvQixLQURKO01BQUEsRUFBQTtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbEIsQ0FGQSxDQUFBO0FBQUEsSUFLQSxTQUFTLENBQUMsaUJBQVYsR0FBOEIsQ0FMOUIsQ0FBQTtBQUFBLElBT0EsSUFBSSxDQUFDLElBQUwsQ0FBQSxDQVBBLENBQUE7QUFTQSxXQUFPLElBQVAsQ0FYUTtFQUFBLENBMUNWLENBQUE7O0FBQUEsaUNBdURBLGNBQUEsR0FBZ0IsU0FBQSxHQUFBO0FBRWQsUUFBQSxNQUFBO0FBQUEsSUFBQSxJQUFHLEtBQUssQ0FBQyxnQkFBTixDQUFBLENBQUEsR0FBMkIsU0FBUyxDQUFDLGlCQUF4QztBQUNFLE1BQUEsTUFBQSxHQUFhLElBQUEsV0FBQSxDQUFBLENBQWIsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLFlBQVksQ0FBQyxJQUFkLENBQW1CLE1BQW5CLENBRkEsQ0FBQTtBQUFBLE1BR0EsSUFBQyxDQUFBLGVBQWUsQ0FBQyxJQUFqQixDQUFzQixNQUFNLENBQUMsRUFBN0IsQ0FIQSxDQUFBO0FBS0EsTUFBQSxJQUFHLE1BQU0sQ0FBQyxRQUFWO0FBQ0UsUUFBQSxJQUFDLENBQUEsb0JBQW9CLENBQUMsT0FBdEIsQ0FBOEIsTUFBTSxDQUFDLEVBQXJDLENBQUEsQ0FERjtPQU5GO0tBQUE7QUFTQSxXQUFPLElBQVAsQ0FYYztFQUFBLENBdkRoQixDQUFBOztBQUFBLGlDQW9FQSx5QkFBQSxHQUEyQixTQUFBLEdBQUE7QUFFekIsUUFBQSxpQkFBQTtBQUFBLElBQUEsU0FBQSxHQUFZLEtBQVosQ0FBQTtBQUFBLElBQ0EsTUFBQSxHQUFVLEtBRFYsQ0FBQTtBQUFBLElBR0EsSUFBQyxDQUFBLG9CQUFvQixDQUFDLEdBQXRCLENBQTBCLENBQUEsU0FBQSxLQUFBLEdBQUE7YUFBQSxTQUFDLFFBQUQsR0FBQTtBQUN4QixZQUFBLHFDQUFBO0FBQUEsUUFBQSxXQUFBLEdBQWMsS0FBQyxDQUFBLGVBQWUsQ0FBQyxPQUFqQixDQUF5QixRQUF6QixDQUFkLENBQUE7QUFBQSxRQUNBLE1BQUEsR0FBYyxLQUFDLENBQUEsWUFBYSxDQUFBLFdBQUEsQ0FENUIsQ0FBQTtBQUFBLFFBRUEsU0FBQSxHQUFjLEtBQUssQ0FBQyxZQUFOLENBQW1CLEtBQW5CLENBRmQsQ0FBQTtBQUlBLFFBQUEsSUFBRyxnQkFBQSxJQUFZLE1BQU0sQ0FBQyxTQUFQLENBQWlCLFNBQWpCLENBQWY7QUFDRSxVQUFBLGFBQUEsR0FBc0IsS0FBQyxDQUFBLG9CQUFvQixDQUFDLE9BQXRCLENBQThCLFFBQTlCLENBQXRCLENBQUE7QUFBQSxVQUNBLE1BQU0sQ0FBQyxVQUFQLEdBQW9CLElBRHBCLENBQUE7QUFBQSxVQUVBLFNBQUEsR0FBc0IsSUFGdEIsQ0FBQTtBQUFBLFVBSUEsS0FBQyxDQUFBLG9CQUFvQixDQUFDLE1BQXRCLENBQTZCLGFBQTdCLEVBQTRDLENBQTVDLENBSkEsQ0FERjtTQUx3QjtNQUFBLEVBQUE7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTFCLENBSEEsQ0FBQTtBQUFBLElBaUJBLFNBQVMsQ0FBQyxxQkFBVixDQUFnQyxTQUFoQyxDQWpCQSxDQUFBO0FBbUJBLElBQUEsSUFBd0QsU0FBeEQ7QUFBQSxNQUFBLFNBQVMsQ0FBQyxXQUFWLENBQXNCLE1BQU0sQ0FBQyxJQUE3QixFQUFtQyxNQUFNLENBQUMsU0FBMUMsQ0FBQSxDQUFBO0tBbkJBO0FBcUJBLFdBQU8sSUFBUCxDQXZCeUI7RUFBQSxDQXBFM0IsQ0FBQTs7QUFBQSxpQ0E2RkEsaUNBQUEsR0FBbUMsU0FBQSxHQUFBO0FBRWpDLElBQUEsS0FBSyxDQUFDLGVBQU4sQ0FBc0IsYUFBdEIsRUFBcUMsU0FBckMsRUFBZ0QsU0FBQSxHQUFBO2FBQzlDLGVBQWUsQ0FBQyx5QkFBaEIsQ0FBQSxFQUQ4QztJQUFBLENBQWhELEVBRUUsQ0FBQyxTQUFELENBRkYsQ0FBQSxDQUFBO0FBSUEsV0FBTyxJQUFQLENBTmlDO0VBQUEsQ0E3Rm5DLENBQUE7O0FBQUEsaUNBcUdBLFlBQUEsR0FBYyxTQUFDLE1BQUQsR0FBQTtBQUVaLFFBQUEsU0FBQTtBQUFBLElBQUEsRUFBQSxHQUFRLE1BQU0sQ0FBQyxFQUFmLENBQUE7QUFBQSxJQUNBLEtBQUEsR0FBUSxJQUFDLENBQUEsZUFBZSxDQUFDLE9BQWpCLENBQXlCLEVBQXpCLENBRFIsQ0FBQTtBQUFBLElBR0EsSUFBQyxDQUFBLFlBQVksQ0FBQyxNQUFkLENBQXFCLEtBQXJCLEVBQTRCLENBQTVCLENBSEEsQ0FBQTtBQUFBLElBSUEsSUFBQyxDQUFBLGVBQWUsQ0FBQyxNQUFqQixDQUF3QixLQUF4QixFQUErQixDQUEvQixDQUpBLENBQUE7QUFNQSxXQUFPLElBQVAsQ0FSWTtFQUFBLENBckdkLENBQUE7O0FBQUEsaUNBK0dBLHFCQUFBLEdBQXVCLFNBQUEsR0FBQTtBQUVyQixJQUFBLElBQUMsQ0FBQSxZQUFZLENBQUMsR0FBZCxDQUFrQixDQUFBLFNBQUEsS0FBQSxHQUFBO2FBQUEsU0FBQyxNQUFELEdBQUE7QUFDaEIsUUFBQSxJQUF5QixNQUFNLENBQUMsSUFBUCxHQUFjLENBQXZDO0FBQUEsVUFBQSxLQUFDLENBQUEsWUFBRCxDQUFjLE1BQWQsQ0FBQSxDQUFBO1NBRGdCO01BQUEsRUFBQTtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbEIsQ0FBQSxDQUFBO0FBS0EsV0FBTyxJQUFQLENBUHFCO0VBQUEsQ0EvR3ZCLENBQUE7O0FBQUEsaUNBd0hBLEtBQUEsR0FBTyxTQUFBLEdBQUE7QUFFTCxJQUFBLElBQUMsQ0FBQSxZQUFELEdBQXdCLEVBQXhCLENBQUE7QUFBQSxJQUNBLElBQUMsQ0FBQSxlQUFELEdBQXdCLEVBRHhCLENBQUE7QUFBQSxJQUVBLElBQUMsQ0FBQSxlQUFELEdBQXdCLEVBRnhCLENBQUE7QUFBQSxJQUdBLElBQUMsQ0FBQSxvQkFBRCxHQUF3QixFQUh4QixDQUFBO0FBS0EsV0FBTyxJQUFQLENBUEs7RUFBQSxDQXhIUCxDQUFBOztBQUFBLGlDQWlJQSxJQUFBLEdBQU0sU0FBQSxHQUFBO0FBRUosSUFBQSxTQUFTLENBQUMsTUFBVixDQUFpQixLQUFqQixDQUFBLENBQUE7QUFBQSxJQUNBLFNBQVMsQ0FBQyxvQkFBVixDQUFBLENBREEsQ0FBQTtBQUdBLFdBQU8sSUFBUCxDQUxJO0VBQUEsQ0FqSU4sQ0FBQTs7QUFBQSxpQ0F3SUEsbUJBQUEsR0FBcUIsU0FBQSxHQUFBO0FBRW5CLElBQUEsSUFBQyxDQUFBLFlBQVksQ0FBQyxHQUFkLENBQWtCLENBQUEsU0FBQSxLQUFBLEdBQUE7YUFBQSxTQUFDLE1BQUQsR0FBQTtBQUNoQixRQUFBLE9BQU8sQ0FBQyxTQUFSLEdBQXNCLE1BQU0sQ0FBQyxLQUE3QixDQUFBO0FBQUEsUUFDQSxPQUFPLENBQUMsV0FBUixHQUFzQixNQUFNLENBQUMsS0FEN0IsQ0FBQTtBQUFBLFFBR0EsTUFBTSxDQUFDLFlBQVAsQ0FBQSxDQUhBLENBRGdCO01BQUEsRUFBQTtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbEIsQ0FBQSxDQUFBO0FBUUEsV0FBTyxJQUFQLENBVm1CO0VBQUEsQ0F4SXJCLENBQUE7OzhCQUFBOztJQUZGLENBQUE7O0FDQUEsSUFBQSxXQUFBOztBQUFBO0FBRUUsd0JBQUEsb0JBQUEsR0FDRTtBQUFBLElBQUEsSUFBQSxFQUFXLEVBQVg7QUFBQSxJQUNBLFNBQUEsRUFBVyxFQURYO0dBREYsQ0FBQTs7QUFBQSx3QkFJQSxlQUFBLEdBQWlCLENBSmpCLENBQUE7O0FBQUEsd0JBTUEsUUFBQSxHQUFVLEVBTlYsQ0FBQTs7QUFBQSx3QkFRQSxZQUFBLEdBQWMsQ0FSZCxDQUFBOztBQUFBLHdCQVVBLGdCQUFBLEdBQ0U7QUFBQSxJQUFBLElBQUEsRUFBVyxDQUFYO0FBQUEsSUFDQSxTQUFBLEVBQVcsQ0FEWDtHQVhGLENBQUE7O0FBQUEsd0JBY0Esc0JBQUEsR0FDRTtBQUFBLElBQUEsSUFBQSxFQUFXLElBQVg7QUFBQSxJQUNBLFNBQUEsRUFBVyxJQURYO0dBZkYsQ0FBQTs7QUFBQSx3QkFrQkEsaUJBQUEsR0FDRTtBQUFBLElBQUEsSUFBQSxFQUFXLEVBQVg7QUFBQSxJQUNBLFNBQUEsRUFBVyxHQURYO0dBbkJGLENBQUE7O0FBQUEsd0JBc0JBLGtDQUFBLEdBQW9DLEVBdEJwQyxDQUFBOztBQUFBLHdCQXdCQSxZQUFBLEdBQWMsRUF4QmQsQ0FBQTs7QUFBQSx3QkEwQkEsZ0NBQUEsR0FBa0MsQ0FDaEMsbUJBRGdDLEVBRWhDLHNCQUZnQyxFQUdoQyx3QkFIZ0MsRUFJaEMsU0FKZ0MsRUFLaEMsa0JBTGdDLEVBTWhDLGVBTmdDLEVBT2hDLGFBUGdDLEVBUWhDLGFBUmdDLEVBU2hDLDBCQVRnQyxDQTFCbEMsQ0FBQTs7QUFBQSx3QkFzQ0Esd0JBQUEsR0FDRTtBQUFBLElBQUEsSUFBQSxFQUFXLEdBQVg7QUFBQSxJQUNBLFNBQUEsRUFBVyxHQURYO0dBdkNGLENBQUE7O0FBQUEsd0JBMENBLFdBQUEsR0FDRTtBQUFBLElBQUEsSUFBQSxFQUFXLENBQUEsQ0FBWDtBQUFBLElBQ0EsU0FBQSxFQUFXLENBQUEsRUFEWDtHQTNDRixDQUFBOztBQUFBLHdCQThDQSxXQUFBLEdBQ0U7QUFBQSxJQUFBLElBQUEsRUFBVyxDQUFYO0FBQUEsSUFDQSxTQUFBLEVBQVcsRUFEWDtHQS9DRixDQUFBOztBQWtEYSxFQUFBLHFCQUFBLEdBQUE7QUFFWCxRQUFBLGdDQUFBO0FBQUEsSUFBQSxlQUFBLEdBQWtCLElBQUksQ0FBQyxHQUFMLENBQVMsSUFBSSxDQUFDLFdBQWQsRUFBMkIsSUFBSSxDQUFDLFlBQWhDLENBQUEsR0FBZ0QsR0FBbEUsQ0FBQTtBQUFBLElBQ0EsZUFBQSxHQUFrQixJQUFJLENBQUMsS0FBTCxDQUFXLGVBQUEsR0FBa0IsSUFBQyxDQUFBLGtDQUE5QixDQURsQixDQUFBO0FBQUEsSUFFQSxJQUFDLENBQUEsY0FBRCxHQUFrQixlQUFBLEdBQWtCLGdCQUZwQyxDQUFBO0FBQUEsSUFJQSxJQUFDLENBQUEsYUFBRCxHQUNFO0FBQUEsTUFBQSxJQUFBLEVBQVcsSUFBQyxDQUFBLGNBQUQsR0FBa0IsR0FBN0I7QUFBQSxNQUNBLFNBQUEsRUFBVyxJQUFDLENBQUEsY0FBRCxHQUFrQixHQUQ3QjtLQUxGLENBQUE7QUFBQSxJQVFBLElBQUMsQ0FBQSxPQUFELEdBQ0U7QUFBQSxNQUFBLElBQUEsRUFBVyxJQUFDLENBQUEsY0FBWjtBQUFBLE1BQ0EsU0FBQSxFQUFXLElBQUMsQ0FBQSxjQUFELEdBQWtCLEdBRDdCO0tBVEYsQ0FBQTtBQVlBLFdBQU8sSUFBUCxDQWRXO0VBQUEsQ0FsRGI7O0FBQUEsd0JBa0VBLHlCQUFBLEdBQTJCLFNBQUEsR0FBQTtBQUV6QixJQUFBLElBQUMsQ0FBQSxnQ0FBZ0MsQ0FBQyxHQUFsQyxDQUFzQyxDQUFBLFNBQUEsS0FBQSxHQUFBO2FBQUEsU0FBQyxRQUFELEdBQUE7QUFDcEMsWUFBQSxnREFBQTtBQUFBLFFBQUEsY0FBQSxHQUFrQixLQUFFLENBQUEsUUFBQSxDQUFwQixDQUFBO0FBQUEsUUFDQSxlQUFBLEdBQWtCLGNBQWMsQ0FBQyxTQUFmLEdBQTJCLGNBQWMsQ0FBQyxJQUQ1RCxDQUFBO0FBQUEsUUFFQSxlQUFBLEdBQWtCLFNBQVMsQ0FBQyxLQUFWLEdBQWtCLEtBQUMsQ0FBQSxRQUZyQyxDQUFBO0FBQUEsUUFJQSxTQUFVLENBQUEsUUFBQSxDQUFWLEdBQXNCLENBQUMsZUFBQSxHQUFrQixlQUFuQixDQUFBLEdBQXNDLGNBQWMsQ0FBQyxJQUozRSxDQURvQztNQUFBLEVBQUE7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXRDLENBQUEsQ0FBQTtBQVNBLFdBQU8sSUFBUCxDQVh5QjtFQUFBLENBbEUzQixDQUFBOztxQkFBQTs7SUFGRixDQUFBOztBQ0FBLElBQUEsV0FBQTs7QUFBQTtBQUVlLEVBQUEscUJBQUEsR0FBQTtBQUVYLFdBQU8sSUFBUCxDQUZXO0VBQUEsQ0FBYjs7cUJBQUE7O0lBRkYsQ0FBQTs7QUNBQSxJQUFBLFNBQUE7O0FBQUE7QUFFZSxFQUFBLG1CQUFBLEdBQUE7QUFFWCxJQUFBLE1BQU0sQ0FBQyxLQUFQLENBQUEsQ0FBQSxDQUFBO0FBRUEsV0FBTyxJQUFQLENBSlc7RUFBQSxDQUFiOztBQUFBLHNCQU1BLElBQUEsR0FBTSxTQUFBLEdBQUE7QUFFSixJQUFBLE1BQU0sQ0FBQyxRQUFQLENBQUEsQ0FBQSxDQUFBO0FBQUEsSUFFQSxTQUFTLENBQUMsb0JBQVYsQ0FBQSxDQUZBLENBQUE7QUFJQSxXQUFPLElBQVAsQ0FOSTtFQUFBLENBTk4sQ0FBQTs7QUFBQSxzQkFjQSxLQUFBLEdBQU8sU0FBQSxHQUFBO0FBRUwsSUFBQSxTQUFTLENBQUMsS0FBVixDQUFBLENBQUEsQ0FBQTtBQUFBLElBQ0EsRUFBRSxDQUFDLEtBQUgsQ0FBQSxDQURBLENBQUE7QUFBQSxJQUVBLEtBQUssQ0FBQyw4QkFBTixDQUFBLENBRkEsQ0FBQTtBQUFBLElBR0EsZUFBZSxDQUFDLEtBQWhCLENBQUEsQ0FIQSxDQUFBO0FBQUEsSUFLQSxNQUFNLENBQUMsT0FBUCxDQUFBLENBTEEsQ0FBQTtBQU9BLFdBQU8sSUFBUCxDQVRLO0VBQUEsQ0FkUCxDQUFBOzttQkFBQTs7SUFGRixDQUFBOztBQ0FBLElBQUEsVUFBQTtFQUFBLHFKQUFBOztBQUFBO0FBRWUsRUFBQSxvQkFBQSxHQUFBO0FBRVgsSUFBQSxJQUFDLENBQUEscUJBQUQsQ0FBQSxDQUFBLENBQUE7QUFBQSxJQUVBLE1BQU0sQ0FBQyxnQkFBUCxDQUF3QixTQUF4QixFQUFtQyxTQUFDLEtBQUQsR0FBQSxDQUFuQyxFQUdFLEtBSEYsQ0FGQSxDQUFBO0FBT0EsV0FBTyxJQUFQLENBVFc7RUFBQSxDQUFiOztBQUFBLHVCQVdBLHFCQUFBLEdBQXVCLFNBQUEsR0FBQTtBQUVyQixJQUFBLE1BQU0sQ0FBQyxnQkFBUCxDQUF3QixXQUF4QixFQUFxQyxTQUFDLEtBQUQsR0FBQTtBQUNuQyxNQUFBLEtBQUssQ0FBQyxjQUFOLENBQUEsQ0FBQSxDQURtQztJQUFBLENBQXJDLENBQUEsQ0FBQTtBQUtBLFdBQU8sSUFBUCxDQVBxQjtFQUFBLENBWHZCLENBQUE7O0FBQUEsdUJBb0JBLHdCQUFBLEdBQTBCLFNBQUEsR0FBQTtBQUV4QixJQUFBLEtBQUssQ0FBQyxjQUFOLENBQUEsQ0FBQSxDQUFBO0FBQUEsSUFFQSxJQUFJLENBQUMsS0FBTCxDQUFBLENBRkEsQ0FBQTtBQUlBLFdBQU8sSUFBUCxDQU53QjtFQUFBLENBcEIxQixDQUFBOztBQUFBLHVCQTRCQSxZQUFBLEdBQWMsU0FBQyxLQUFELEdBQUE7QUFFWixRQUFBLFNBQUE7QUFBQSxJQUFBLElBQTJCLGNBQTNCO0FBQUEsYUFBTyxLQUFLLENBQUMsT0FBUSxDQUFBLENBQUEsQ0FBckIsQ0FBQTtLQUFBO0FBQUEsSUFFQSxTQUFBLEdBQ0U7QUFBQSxNQUFBLEtBQUEsRUFBTyxLQUFLLENBQUMsT0FBYjtBQUFBLE1BQ0EsS0FBQSxFQUFPLEtBQUssQ0FBQyxPQURiO0tBSEYsQ0FBQTtBQU1BLFdBQU8sU0FBUCxDQVJZO0VBQUEsQ0E1QmQsQ0FBQTs7QUFBQSx1QkFzQ0EsZUFBQSxHQUFpQixTQUFDLFFBQUQsRUFBVyxNQUFYLEVBQW1CLFFBQW5CLEVBQTZCLE1BQTdCLEdBQUE7QUFFZixRQUFBLGNBQUE7QUFBQSxJQUFBLE9BQU8sQ0FBQyxHQUFSLENBQWEsd0JBQUEsR0FBd0IsUUFBeEIsR0FBaUMsSUFBakMsR0FBcUMsTUFBckMsR0FBNEMsSUFBNUMsR0FBZ0QsUUFBaEQsR0FBeUQsSUFBekQsR0FBNkQsTUFBN0QsR0FBb0UsR0FBakYsQ0FBQSxDQUFBO0FBRUEsSUFBQSxJQUFHLE1BQUEsQ0FBQSxNQUFBLEtBQWlCLFFBQXBCO0FBQ0UsTUFBQSxLQUFBLEdBQVMsTUFBVCxDQUFBO0FBQUEsTUFDQSxNQUFBLEdBQVMsQ0FBQyxLQUFELENBRFQsQ0FERjtLQUZBO0FBQUEsSUFNQSxPQUFBLEdBQVUsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsUUFBdkIsQ0FOVixDQUFBO0FBQUEsSUFRQSxPQUFPLENBQUMsZ0JBQVIsQ0FBeUIsTUFBekIsRUFBaUMsQ0FBQSxTQUFBLEtBQUEsR0FBQTthQUFBLFNBQUMsS0FBRCxHQUFBO0FBQy9CLFlBQUEsSUFBQTtBQUFBLFFBQUEsS0FBSyxDQUFDLGNBQU4sQ0FBQSxDQUFBLENBQUE7QUFBQSxRQUNBLE9BQU8sQ0FBQyxHQUFSLENBQWEsVUFBQSxHQUFVLE1BQVYsR0FBaUIsWUFBakIsR0FBNkIsT0FBN0IsR0FBcUMsTUFBckMsR0FBMkMsTUFBTSxDQUFDLE9BQWxELEdBQTBELEdBQXZFLENBREEsQ0FBQTtBQUVBLFFBQUEsSUFBb0IsTUFBTSxDQUFDLE1BQVAsS0FBaUIsQ0FBakIsSUFBc0IsUUFBQSxNQUFNLENBQUMsT0FBUCxFQUFBLGVBQWtCLE1BQWxCLEVBQUEsSUFBQSxNQUFBLENBQTFDO0FBQUEsVUFBQSxRQUFRLENBQUMsS0FBVCxDQUFBLENBQUEsQ0FBQTtTQUgrQjtNQUFBLEVBQUE7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWpDLENBUkEsQ0FBQTtBQWNBLFdBQU8sSUFBUCxDQWhCZTtFQUFBLENBdENqQixDQUFBOztBQUFBLHVCQXdEQSw4QkFBQSxHQUFnQyxTQUFBLEdBQUE7QUFFOUIsSUFBQSxRQUFRLENBQUMsSUFBSSxDQUFDLG1CQUFkLENBQWtDLFNBQWxDLEVBQTZDLElBQUMsQ0FBQSx3QkFBOUMsQ0FBQSxDQUFBO0FBRUEsV0FBTyxJQUFQLENBSjhCO0VBQUEsQ0F4RGhDLENBQUE7O29CQUFBOztJQUZGLENBQUE7O0FDQUEsSUFBQSxjQUFBOztBQUFBOzhCQUVFOztBQUFBLDJCQUFBLFFBQUEsR0FDRTtBQUFBLElBQUEsZUFBQSxFQUFpQixDQUFqQjtBQUFBLElBQ0EsS0FBQSxFQUFpQixDQURqQjtBQUFBLElBRUEsS0FBQSxFQUFpQixDQUZqQjtHQURGLENBQUE7O0FBQUEsMkJBS0EsS0FBQSxHQUFPLFNBQUEsR0FBQTtBQUVMLElBQUEsSUFBQyxDQUFBLG9CQUFELEdBQTRCLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxJQUF4RCxDQUFBO0FBQUEsSUFDQSxJQUFDLENBQUEsZUFBRCxHQUE0QixJQUFDLENBQUEsUUFBUSxDQUFDLGVBRHRDLENBQUE7QUFBQSxJQUVBLElBQUMsQ0FBQSxLQUFELEdBQTRCLElBQUMsQ0FBQSxRQUFRLENBQUMsS0FGdEMsQ0FBQTtBQUFBLElBR0EsSUFBQyxDQUFBLGdCQUFELEdBQTRCLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxJQUhwRCxDQUFBO0FBQUEsSUFJQSxJQUFDLENBQUEsYUFBRCxHQUE0QixNQUFNLENBQUMsYUFBYSxDQUFDLElBSmpELENBQUE7QUFBQSxJQUtBLElBQUMsQ0FBQSxzQkFBRCxHQUE0QixNQUFNLENBQUMsc0JBQXNCLENBQUMsSUFMMUQsQ0FBQTtBQUFBLElBTUEsSUFBQyxDQUFBLGlCQUFELEdBQTRCLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxJQU5yRCxDQUFBO0FBQUEsSUFPQSxJQUFDLENBQUEsS0FBRCxHQUE0QixJQUFDLENBQUEsUUFBUSxDQUFDLEtBUHRDLENBQUE7QUFBQSxJQVFBLElBQUMsQ0FBQSxPQUFELEdBQTRCLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFSM0MsQ0FBQTtBQUFBLElBU0EsSUFBQyxDQUFBLHdCQUFELEdBQTRCLE1BQU0sQ0FBQyx3QkFBd0IsQ0FBQyxJQVQ1RCxDQUFBO0FBQUEsSUFVQSxJQUFDLENBQUEsV0FBRCxHQUE0QixNQUFNLENBQUMsV0FBVyxDQUFDLElBVi9DLENBQUE7QUFBQSxJQVdBLElBQUMsQ0FBQSxXQUFELEdBQTRCLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFYL0MsQ0FBQTtBQUFBLElBYUEsSUFBQyxDQUFBLE1BQUQsQ0FBUSxJQUFSLENBYkEsQ0FBQTtBQUFBLElBZUEsTUFBTSxDQUFDLHlCQUFQLENBQUEsQ0FmQSxDQUFBO0FBQUEsSUFpQkEsSUFBQyxDQUFBLHFCQUFELENBQUEsQ0FqQkEsQ0FBQTtBQW1CQSxXQUFPLElBQVAsQ0FyQks7RUFBQSxDQUxQLENBQUE7O0FBQUEsMkJBNEJBLG9CQUFBLEdBQXNCLFNBQUEsR0FBQTtBQUVwQixJQUFBLE1BQU0sQ0FBQyxhQUFQLENBQXFCLElBQUMsQ0FBQSxjQUF0QixDQUFBLENBQUE7QUFFQSxXQUFPLElBQVAsQ0FKb0I7RUFBQSxDQTVCdEIsQ0FBQTs7QUFBQSwyQkFrQ0EscUJBQUEsR0FBdUIsU0FBQSxHQUFBO0FBRXJCLElBQUEsSUFBQyxDQUFBLGNBQUQsR0FBa0IsTUFBTSxDQUFDLFdBQVAsQ0FBbUIsQ0FBQSxTQUFBLEtBQUEsR0FBQTthQUFBLFNBQUEsR0FBQTtBQUVuQyxRQUFBLEtBQUMsQ0FBQSxXQUFELENBQUEsQ0FBQSxDQUZtQztNQUFBLEVBQUE7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQW5CLEVBTWhCLE1BQU0sQ0FBQyxlQUFQLEdBQXlCLElBTlQsQ0FBbEIsQ0FBQTtBQVFBLFdBQU8sSUFBUCxDQVZxQjtFQUFBLENBbEN2QixDQUFBOztBQUFBLDJCQThDQSxxQkFBQSxHQUF1QixTQUFDLFNBQUQsR0FBQTtBQUVyQixJQUFBLElBQUMsQ0FBQSxlQUFELEdBQXNCLFNBQUgsR0FBa0IsSUFBQyxDQUFBLGVBQUQsR0FBbUIsQ0FBckMsR0FBNEMsSUFBQyxDQUFBLFFBQVEsQ0FBQyxlQUF6RSxDQUFBO0FBQUEsSUFFQSxFQUFFLENBQUMsNEJBQUgsQ0FBQSxDQUZBLENBQUE7QUFJQSxXQUFPLElBQVAsQ0FOcUI7RUFBQSxDQTlDdkIsQ0FBQTs7QUFBQSwyQkFzREEsTUFBQSxHQUFRLFNBQUMsUUFBRCxHQUFBO0FBRU4sSUFBQSxJQUFDLENBQUEsT0FBRCxHQUFXLFFBQVgsQ0FBQTtBQUVBLFdBQU8sSUFBUCxDQUpNO0VBQUEsQ0F0RFIsQ0FBQTs7QUFBQSwyQkE0REEsV0FBQSxHQUFhLFNBQUEsR0FBQTtBQUVYLElBQUEsSUFBQyxDQUFBLEtBQUQsSUFBVSxDQUFWLENBQUE7QUFFQSxJQUFBLElBQUcsSUFBQyxDQUFBLEtBQUQsSUFBVSxNQUFNLENBQUMsUUFBcEI7QUFDRSxNQUFBLE1BQU0sQ0FBQyxhQUFQLENBQXFCLElBQUMsQ0FBQSxjQUF0QixDQUFBLENBREY7S0FGQTtBQUFBLElBS0EsRUFBRSxDQUFDLGtCQUFILENBQUEsQ0FMQSxDQUFBO0FBQUEsSUFNQSxNQUFNLENBQUMseUJBQVAsQ0FBQSxDQU5BLENBQUE7QUFRQSxXQUFPLElBQVAsQ0FWVztFQUFBLENBNURiLENBQUE7O0FBQUEsMkJBd0VBLFdBQUEsR0FBYSxTQUFDLGNBQUQsRUFBaUIsa0JBQWpCLEdBQUE7QUFJWCxRQUFBLCtDQUFBO0FBQUEsSUFBQSxlQUFBLEdBQWtCLElBQUksQ0FBQyxLQUFMLENBQVcsR0FBQSxHQUFNLENBQUMsQ0FBQyxjQUFBLEdBQWlCLGtCQUFsQixDQUFBLEdBQXdDLEdBQXpDLENBQWpCLENBQWxCLENBQUE7QUFBQSxJQUNBLGFBQUEsR0FBa0IsTUFBTSxDQUFDLFlBQVAsR0FBc0IsZUFEeEMsQ0FBQTtBQUFBLElBRUEsZUFBQSxHQUFrQixJQUFDLENBQUEsS0FBRCxHQUFTLENBRjNCLENBQUE7QUFBQSxJQUlBLElBQUMsQ0FBQSxLQUFELElBQVUsQ0FBQyxhQUFBLEdBQWdCLElBQUMsQ0FBQSxlQUFsQixDQUFBLEdBQXNDLGVBSmhELENBQUE7QUFBQSxJQU1BLEVBQUUsQ0FBQyxrQkFBSCxDQUFBLENBTkEsQ0FBQTtBQVFBLFdBQU8sSUFBUCxDQVpXO0VBQUEsQ0F4RWIsQ0FBQTs7d0JBQUE7O0lBRkYsQ0FBQTs7QUNBQSxJQUFBLFdBQUE7O0FBQUE7MkJBRUU7O0FBQUEsRUFBQSxXQUFDLENBQUEsT0FBRCxHQUFXLElBQVgsQ0FBQTs7QUFBQSx3QkFFQSxPQUFBLEdBQVMsU0FBQSxHQUFBO0FBRVAsSUFBQSxJQUFDLENBQUEsT0FBRCxHQUFXLFNBQVgsQ0FBQTtBQUFBLElBRUEsS0FBSyxDQUFDLE9BQU4sQ0FBYyxxQkFBZCxDQUZBLENBQUE7QUFBQSxJQUlBLEVBQUUsQ0FBQyxlQUFILENBQW1CLFNBQW5CLENBSkEsQ0FBQTtBQU1BLFdBQU8sSUFBUCxDQVJPO0VBQUEsQ0FGVCxDQUFBOztBQUFBLHdCQVlBLFFBQUEsR0FBVSxTQUFBLEdBQUE7QUFFUixJQUFBLElBQUMsQ0FBQSxPQUFELEdBQVcsV0FBWCxDQUFBO0FBQUEsSUFFQSxLQUFLLENBQUMsT0FBTixDQUFjLHVCQUFkLENBRkEsQ0FBQTtBQUFBLElBSUEsRUFBRSxDQUFDLGVBQUgsQ0FBbUIsV0FBbkIsQ0FKQSxDQUFBO0FBTUEsV0FBTyxJQUFQLENBUlE7RUFBQSxDQVpWLENBQUE7O0FBQUEsd0JBc0JBLFdBQUEsR0FBYSxTQUFBLEdBQUE7QUFFWCxJQUFBLElBQUMsQ0FBQSxPQUFELEdBQVcsYUFBWCxDQUFBO0FBQUEsSUFFQSxLQUFLLENBQUMsT0FBTixDQUFjLHlCQUFkLENBRkEsQ0FBQTtBQUlBLFdBQU8sSUFBUCxDQU5XO0VBQUEsQ0F0QmIsQ0FBQTs7QUFBQSx3QkE4QkEsT0FBQSxHQUFTLFNBQUEsR0FBQTtBQUVQLElBQUEsSUFBQyxDQUFBLE9BQUQsR0FBVyxTQUFYLENBQUE7QUFBQSxJQUVBLEtBQUssQ0FBQyxPQUFOLENBQWMscUJBQWQsQ0FGQSxDQUFBO0FBQUEsSUFJQSxFQUFFLENBQUMsZUFBSCxDQUFtQixTQUFuQixDQUpBLENBQUE7QUFNQSxXQUFPLElBQVAsQ0FSTztFQUFBLENBOUJULENBQUE7O0FBQUEsd0JBd0NBLEtBQUEsR0FBTyxTQUFBLEdBQUE7QUFFTCxJQUFBLElBQUMsQ0FBQSxPQUFELEdBQVcsT0FBWCxDQUFBO0FBQUEsSUFFQSxLQUFLLENBQUMsT0FBTixDQUFjLG1CQUFkLENBRkEsQ0FBQTtBQUFBLElBSUEsRUFBRSxDQUFDLGVBQUgsQ0FBbUIsT0FBbkIsQ0FKQSxDQUFBO0FBQUEsSUFNQSxNQUFNLENBQUMsVUFBUCxDQUFrQixDQUFBLFNBQUEsS0FBQSxHQUFBO2FBQUEsU0FBQSxHQUFBO2VBQ2hCLEtBQUMsQ0FBQSxLQUFELENBQUEsRUFEZ0I7TUFBQSxFQUFBO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFsQixFQUVFLElBRkYsQ0FOQSxDQUFBO0FBVUEsV0FBTyxJQUFQLENBWks7RUFBQSxDQXhDUCxDQUFBOztBQUFBLHdCQXNEQSxLQUFBLEdBQU8sU0FBQSxHQUFBO0FBRUwsSUFBQSxJQUFDLENBQUEsT0FBRCxHQUFXLE9BQVgsQ0FBQTtBQUFBLElBRUEsS0FBSyxDQUFDLE9BQU4sQ0FBYywwQkFBZCxDQUZBLENBQUE7QUFBQSxJQUlBLEVBQUUsQ0FBQyxlQUFILENBQW1CLE9BQW5CLENBSkEsQ0FBQTtBQU1BLFdBQU8sSUFBUCxDQVJLO0VBQUEsQ0F0RFAsQ0FBQTs7cUJBQUE7O0lBRkYsQ0FBQTs7QUNBQSxJQUFBLE9BQUE7O0FBQUE7QUFFZSxFQUFBLGlCQUFBLEdBQUE7QUFFWCxJQUFBLElBQUMsQ0FBQSx5QkFBRCxDQUFBLENBQUEsQ0FBQTtBQUVBLFdBQU8sSUFBUCxDQUpXO0VBQUEsQ0FBYjs7QUFBQSxvQkFNQSxLQUFBLEdBQU8sU0FBQSxHQUFBO0FBRUwsSUFBQSxJQUFDLENBQUEsWUFBRCxHQUEwQixLQUFLLENBQUMsQ0FBTixDQUFRLGtCQUFSLENBQTFCLENBQUE7QUFBQSxJQUNBLElBQUMsQ0FBQSxZQUFELEdBQTBCLEtBQUssQ0FBQyxDQUFOLENBQVEsa0JBQVIsQ0FEMUIsQ0FBQTtBQUFBLElBRUEsSUFBQyxDQUFBLHNCQUFELEdBQTBCLEtBQUssQ0FBQyxDQUFOLENBQVEsa0JBQVIsQ0FGMUIsQ0FBQTtBQUFBLElBR0EsSUFBQyxDQUFBLFNBQUQsR0FBMEIsS0FBSyxDQUFDLENBQU4sQ0FBUSxhQUFSLENBSDFCLENBQUE7QUFBQSxJQUtBLElBQUMsQ0FBQSw0QkFBRCxDQUFBLENBTEEsQ0FBQTtBQUFBLElBTUEsSUFBQyxDQUFBLGtCQUFELENBQUEsQ0FOQSxDQUFBO0FBQUEsSUFPQSxJQUFDLENBQUEsa0JBQUQsQ0FBQSxDQVBBLENBQUE7QUFTQSxXQUFPLElBQVAsQ0FYSztFQUFBLENBTlAsQ0FBQTs7QUFBQSxvQkFtQkEseUJBQUEsR0FBMkIsU0FBQSxHQUFBO0FBRXpCLElBQUEsS0FBSyxDQUFDLGVBQU4sQ0FBc0IsWUFBdEIsRUFBb0MsU0FBcEMsRUFBK0MsU0FBQSxHQUFBO2FBQzdDLEtBQUssQ0FBQyx3QkFBTixDQUFBLEVBRDZDO0lBQUEsQ0FBL0MsRUFFRSxDQUFDLE9BQUQsQ0FGRixDQUFBLENBQUE7QUFBQSxJQUlBLEtBQUssQ0FBQyxlQUFOLENBQXNCLGFBQXRCLEVBQXFDLFNBQXJDLEVBQWdELFNBQUEsR0FBQTthQUM5QyxLQUFLLENBQUMsd0JBQU4sQ0FBQSxFQUQ4QztJQUFBLENBQWhELEVBRUUsQ0FBQyxXQUFELENBRkYsQ0FKQSxDQUFBO0FBUUEsV0FBTyxJQUFQLENBVnlCO0VBQUEsQ0FuQjNCLENBQUE7O0FBQUEsb0JBK0JBLGVBQUEsR0FBaUIsU0FBQyxTQUFELEdBQUE7QUFFZixJQUFBLElBQUksQ0FBQyxTQUFMLEdBQWlCLEVBQWpCLENBQUE7QUFBQSxJQUNBLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBZixDQUFtQixRQUFBLEdBQVcsU0FBOUIsQ0FEQSxDQUFBO0FBR0EsV0FBTyxJQUFQLENBTGU7RUFBQSxDQS9CakIsQ0FBQTs7QUFBQSxvQkFzQ0EsNEJBQUEsR0FBOEIsU0FBQSxHQUFBO0FBRTVCLElBQUEsS0FBSyxDQUFDLGdCQUFOLENBQXVCLElBQUMsQ0FBQSxzQkFBeEIsRUFBZ0QsU0FBUyxDQUFDLGVBQTFELENBQUEsQ0FBQTtBQUVBLFdBQU8sSUFBUCxDQUo0QjtFQUFBLENBdEM5QixDQUFBOztBQUFBLG9CQTRDQSxrQkFBQSxHQUFvQixTQUFBLEdBQUE7QUFFbEIsSUFBQSxLQUFLLENBQUMsZ0JBQU4sQ0FBdUIsSUFBQyxDQUFBLFlBQXhCLEVBQXNDLFNBQVMsQ0FBQyxLQUFoRCxDQUFBLENBQUE7QUFFQSxXQUFPLElBQVAsQ0FKa0I7RUFBQSxDQTVDcEIsQ0FBQTs7QUFBQSxvQkFrREEsa0JBQUEsR0FBb0IsU0FBQSxHQUFBO0FBRWxCLFFBQUEsYUFBQTtBQUFBLElBQUEsYUFBQSxHQUFnQixLQUFLLENBQUMsZUFBTixDQUFzQixTQUFTLENBQUMsS0FBaEMsQ0FBaEIsQ0FBQTtBQUFBLElBRUEsS0FBSyxDQUFDLGdCQUFOLENBQXVCLElBQUMsQ0FBQSxZQUF4QixFQUFzQyxhQUF0QyxDQUZBLENBQUE7QUFJQSxXQUFPLElBQVAsQ0FOa0I7RUFBQSxDQWxEcEIsQ0FBQTs7aUJBQUE7O0lBRkYsQ0FBQTs7QUNBQSxJQUFBLFVBQUE7O0FBQUE7MEJBRUU7O0FBQUEsdUJBQUEsQ0FBQSxHQUFHLFNBQUMsUUFBRCxHQUFBO0FBRUQsUUFBQSxHQUFBO0FBQUEsSUFBQSxJQUF3QixRQUFBLEtBQVksSUFBcEM7QUFBQSxhQUFPLFFBQVEsQ0FBQyxJQUFoQixDQUFBO0tBQUE7QUFDQSxJQUFBLElBQTRDLFFBQVEsQ0FBQyxNQUFULENBQWdCLENBQWhCLEVBQW1CLENBQW5CLENBQUEsS0FBeUIsR0FBckU7QUFBQSxhQUFPLFFBQVEsQ0FBQyxjQUFULENBQXdCLFFBQXhCLENBQVAsQ0FBQTtLQURBO0FBQUEsSUFHQSxHQUFBLEdBQU0sUUFBUSxDQUFDLGdCQUFULENBQTBCLFFBQTFCLENBSE4sQ0FBQTtBQUtBLElBQUEsSUFBaUIsR0FBRyxDQUFDLE1BQUosS0FBYyxDQUEvQjtBQUFBLGFBQU8sR0FBSSxDQUFBLENBQUEsQ0FBWCxDQUFBO0tBTEE7QUFPQSxXQUFPLEdBQVAsQ0FUQztFQUFBLENBQUgsQ0FBQTs7QUFBQSx1QkFXQSxPQUFBLEdBQVMsU0FBQyxPQUFELEdBQUE7QUFDUCxRQUFBLE9BQUE7QUFBQSxJQUFBLE9BQUEsR0FBVSxJQUFDLENBQUEsQ0FBRCxDQUFHLFVBQUgsQ0FBVixDQUFBO0FBQUEsSUFDQSxJQUFDLENBQUEsZ0JBQUQsQ0FBa0IsT0FBbEIsRUFBMkIsT0FBM0IsQ0FEQSxDQURPO0VBQUEsQ0FYVCxDQUFBOztBQUFBLHVCQWdCQSxrQkFBQSxHQUFvQixTQUFDLEtBQUQsRUFBUSxPQUFSLEdBQUE7O01BQVEsVUFBVTtLQUVwQztBQUFBLElBQUEsS0FBQSxJQUFTLGdCQUFULENBQUE7QUFFQSxJQUFBLElBQTZCLE9BQTdCO0FBQUEsTUFBQSxLQUFBLEdBQVEsSUFBSSxDQUFDLEtBQUwsQ0FBVyxLQUFYLENBQVIsQ0FBQTtLQUZBO0FBSUEsV0FBTyxLQUFQLENBTmtCO0VBQUEsQ0FoQnBCLENBQUE7O0FBQUEsdUJBd0JBLGVBQUEsR0FBaUIsU0FBQyxHQUFELEdBQUE7QUFFZixXQUFPLEdBQUcsQ0FBQyxRQUFKLENBQUEsQ0FBYyxDQUFDLE9BQWYsQ0FBdUIsdUJBQXZCLEVBQWdELEdBQWhELENBQVAsQ0FGZTtFQUFBLENBeEJqQixDQUFBOztBQUFBLHVCQTRCQSxNQUFBLEdBQVEsU0FBQyxHQUFELEVBQU0sR0FBTixHQUFBO0FBRU4sSUFBQSxJQUFHLEdBQUEsS0FBTyxNQUFWO0FBQ0UsTUFBQSxHQUFBLEdBQU0sQ0FBTixDQUFBO0FBQUEsTUFDQSxHQUFBLEdBQU0sQ0FETixDQURGO0tBQUEsTUFHSyxJQUFHLEdBQUEsS0FBTyxNQUFWO0FBQ0gsTUFBQSxHQUFBLEdBQU0sR0FBTixDQUFBO0FBQUEsTUFDQSxHQUFBLEdBQU0sQ0FETixDQURHO0tBSEw7QUFPQSxXQUFPLENBQUMsSUFBSSxDQUFDLE1BQUwsQ0FBQSxDQUFBLEdBQWdCLENBQUMsR0FBQSxHQUFNLEdBQVAsQ0FBakIsQ0FBQSxHQUFnQyxHQUF2QyxDQVRNO0VBQUEsQ0E1QlIsQ0FBQTs7QUFBQSx1QkF1Q0EsV0FBQSxHQUFhLFNBQUMsS0FBRCxHQUFBO0FBRVgsUUFBQSxNQUFBOztNQUZZLFFBQVE7S0FFcEI7QUFBQSxJQUFBLE1BQUEsR0FDRTtBQUFBLE1BQUEsQ0FBQSxFQUFHLElBQUksQ0FBQyxhQUFMLENBQW1CLENBQW5CLEVBQXNCLEdBQXRCLENBQUg7QUFBQSxNQUNBLENBQUEsRUFBRyxJQUFJLENBQUMsYUFBTCxDQUFtQixDQUFuQixFQUFzQixHQUF0QixDQURIO0FBQUEsTUFFQSxDQUFBLEVBQUcsSUFBSSxDQUFDLGFBQUwsQ0FBbUIsQ0FBbkIsRUFBc0IsR0FBdEIsQ0FGSDtBQUFBLE1BR0EsQ0FBQSxFQUFNLENBQUEsS0FBSCxHQUFlLElBQUksQ0FBQyxNQUFMLENBQVksSUFBWixFQUFrQixDQUFsQixDQUFmLEdBQXlDLEtBSDVDO0tBREYsQ0FBQTtBQU1BLFdBQU8sT0FBQSxHQUFVLE1BQU0sQ0FBQyxDQUFqQixHQUFxQixJQUFyQixHQUE0QixNQUFNLENBQUMsQ0FBbkMsR0FBdUMsSUFBdkMsR0FBOEMsTUFBTSxDQUFDLENBQXJELEdBQXlELElBQXpELEdBQWdFLE1BQU0sQ0FBQyxDQUF2RSxHQUEyRSxHQUFsRixDQVJXO0VBQUEsQ0F2Q2IsQ0FBQTs7QUFBQSx1QkFpREEsYUFBQSxHQUFlLFNBQUMsR0FBRCxFQUFNLEdBQU4sR0FBQTtBQUViLElBQUEsSUFBRyxHQUFBLEtBQU8sTUFBVjtBQUNFLE1BQUEsR0FBQSxHQUFNLEdBQU4sQ0FBQTtBQUFBLE1BQ0EsR0FBQSxHQUFNLENBRE4sQ0FERjtLQUFBO0FBSUEsV0FBTyxJQUFJLENBQUMsS0FBTCxDQUFXLElBQUksQ0FBQyxNQUFMLENBQUEsQ0FBQSxHQUFnQixDQUFDLEdBQUEsR0FBTSxDQUFOLEdBQVUsR0FBWCxDQUEzQixDQUFBLEdBQThDLEdBQXJELENBTmE7RUFBQSxDQWpEZixDQUFBOztBQUFBLHVCQXlEQSxnQkFBQSxHQUFrQixTQUFBLEdBQUE7QUFFaEIsV0FBTyxJQUFJLENBQUMsS0FBTCxDQUFXLElBQUksQ0FBQyxNQUFMLENBQUEsQ0FBQSxHQUFnQixHQUEzQixDQUFQLENBRmdCO0VBQUEsQ0F6RGxCLENBQUE7O0FBQUEsdUJBNkRBLGdCQUFBLEdBQWtCLFNBQUMsT0FBRCxFQUFVLEtBQVYsR0FBQTtBQUVoQixJQUFBLE9BQU8sQ0FBQyxTQUFSLEdBQW9CLEtBQXBCLENBQUE7QUFFQSxXQUFPLElBQVAsQ0FKZ0I7RUFBQSxDQTdEbEIsQ0FBQTs7b0JBQUE7O0lBRkYsQ0FBQTs7QUNBQSxJQUFBLDROQUFBOztBQUFBLEtBQUEsR0FBUSxJQUFSLENBQUE7O0FBQUEsT0FFQSxHQUFvQixTQUFTLENBQUMsU0FBUyxDQUFDLEtBQXBCLENBQTBCLFVBQTFCLENBQUgsR0FBOEMsSUFBOUMsR0FBd0QsS0FGekUsQ0FBQTs7QUFBQSxJQUdBLEdBQWlCLFFBQVEsQ0FBQyxJQUgxQixDQUFBOztBQUFBLE1BSUEsR0FBaUIsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsU0FBdkIsQ0FKakIsQ0FBQTs7QUFBQSxjQUtBLEdBQWlCLE1BQU0sQ0FBQyxjQUFQLENBQXNCLGNBQXRCLENBQUEsSUFBeUMsTUFBTSxDQUFDLGNBQVAsQ0FBc0IsbUJBQXRCLENBTDFELENBQUE7O0FBQUEsU0FNQSxHQUFvQixjQUFILEdBQXVCLFlBQXZCLEdBQXlDLE9BTjFELENBQUE7O0FBQUEsTUFRTSxDQUFDLFNBQVAsR0FBbUIsUUFSbkIsQ0FBQTs7QUFBQSxNQVNNLENBQUMsS0FBUCxHQUFtQixJQUFJLENBQUMsV0FUeEIsQ0FBQTs7QUFBQSxNQVVNLENBQUMsTUFBUCxHQUFtQixJQUFJLENBQUMsWUFWeEIsQ0FBQTs7QUFBQSxPQVlBLEdBQVUsTUFBTSxDQUFDLFVBQVAsQ0FBa0IsSUFBbEIsQ0FaVixDQUFBOztBQUFBLE9BY08sQ0FBQyx3QkFBUixHQUFtQyxhQWRuQyxDQUFBOztBQUFBLGdCQWdCQSxHQUFvQixNQUFNLENBQUMsZ0JBQVAsSUFBMkIsQ0FoQi9DLENBQUE7O0FBQUEsaUJBaUJBLEdBQW9CLE9BQU8sQ0FBQyw0QkFBUixJQUF3QyxPQUFPLENBQUMsc0JBQWhELElBQTBFLENBakI5RixDQUFBOztBQUFBLEtBa0JBLEdBQW9CLGdCQUFBLEdBQW1CLGlCQWxCdkMsQ0FBQTs7QUFvQkEsSUFBRyxnQkFBQSxLQUFvQixpQkFBdkI7QUFDRSxFQUFBLFFBQUEsR0FBWSxNQUFNLENBQUMsS0FBbkIsQ0FBQTtBQUFBLEVBQ0EsU0FBQSxHQUFZLE1BQU0sQ0FBQyxNQURuQixDQUFBO0FBQUEsRUFHQSxNQUFNLENBQUMsS0FBUCxHQUFnQixRQUFBLEdBQVksS0FINUIsQ0FBQTtBQUFBLEVBSUEsTUFBTSxDQUFDLE1BQVAsR0FBZ0IsU0FBQSxHQUFZLEtBSjVCLENBQUE7QUFBQSxFQU1BLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBYixHQUFzQixFQUFBLEdBQUcsUUFBSCxHQUFZLElBTmxDLENBQUE7QUFBQSxFQU9BLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBYixHQUFzQixFQUFBLEdBQUcsU0FBSCxHQUFhLElBUG5DLENBQUE7QUFBQSxFQVNBLE9BQU8sQ0FBQyxLQUFSLENBQWMsS0FBZCxFQUFxQixLQUFyQixDQVRBLENBREY7Q0FwQkE7O0FBQUEsTUFpQ0EsR0FBc0IsSUFBQSxXQUFBLENBQUEsQ0FqQ3RCLENBQUE7O0FBQUEsS0FrQ0EsR0FBc0IsSUFBQSxVQUFBLENBQUEsQ0FsQ3RCLENBQUE7O0FBQUEsTUFtQ0EsR0FBc0IsSUFBQSxXQUFBLENBQUEsQ0FuQ3RCLENBQUE7O0FBQUEsS0FvQ0EsR0FBc0IsSUFBQSxVQUFBLENBQUEsQ0FwQ3RCLENBQUE7O0FBQUEsZUF1Q0EsR0FBc0IsSUFBQSxvQkFBQSxDQUFBLENBdkN0QixDQUFBOztBQUFBLFNBd0NBLEdBQXNCLElBQUEsY0FBQSxDQUFBLENBeEN0QixDQUFBOztBQUFBLEVBeUNBLEdBQXNCLElBQUEsT0FBQSxDQUFBLENBekN0QixDQUFBOztBQUFBLE1BMENBLEdBQXNCLElBQUEsV0FBQSxDQUFBLENBMUN0QixDQUFBOztBQUFBLGFBNkNBLEdBQXNCLElBQUEsa0JBQUEsQ0FBQSxDQTdDdEIsQ0FBQTs7QUFBQSxJQWdEQSxHQUFzQixJQUFBLFNBQUEsQ0FBQSxDQWhEdEIsQ0FBQSIsImZpbGUiOiJhcHBsaWNhdGlvbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIlxuY2xhc3MgQW5pbWF0aW9uTG9vcENsYXNzXG5cbiAgY29uc3RydWN0b3I6IC0+XG5cbiAgICBAcmVxdWVzdEFuaW1hdGlvbkZyYW1lKClcblxuICAgIHJldHVybiB0aGlzXG5cbiAgY2FuY2VsQW5pbWF0aW9uRnJhbWU6IC0+XG5cbiAgICB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUoQGFuaW1hdGlvbkxvb3BJZClcblxuICAgIHJldHVybiB0aGlzXG5cbiAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lOiAtPlxuXG4gICAgQGFuaW1hdGlvbkxvb3BJZCA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPT5cblxuICAgICAgQHJlcXVlc3RBbmltYXRpb25GcmFtZSgpXG5cbiAgICAgIHJldHVyblxuXG4gICAgY2FudmFzLndpZHRoID0gY2FudmFzLndpZHRoXG5cbiAgICBCdWJibGVHZW5lcmF0b3IuYW5pbWF0aW9uTG9vcEFjdGlvbnMoKVxuXG4gICAgcmV0dXJuIHRoaXNcbiIsIlxuY2xhc3MgQnViYmxlQ2xhc3NcblxuICBkZXN0cm95aW5nOiBmYWxzZVxuICBzaXplOiAgICAgICAxXG5cbiAgY29uc3RydWN0b3I6IC0+XG5cbiAgICByID0gVXRpbHMucmFuZG9tSW50ZWdlcigwLCAyMDApXG4gICAgZyA9IFV0aWxzLnJhbmRvbUludGVnZXIoMCwgMjAwKVxuICAgIGIgPSBVdGlscy5yYW5kb21JbnRlZ2VyKDAsIDIwMClcbiAgICBhID0gVXRpbHMucmFuZG9tKDAuNzUsIDEpXG5cbiAgICBAY29sb3IgICAgICA9IFwicmdiYSgje3J9LCAje2d9LCAje2J9LCAje2F9KVwiXG4gICAgQGZpbmFsU2l6ZSAgPSBVdGlscy5yYW5kb21JbnRlZ2VyKDAsIFBsYXlTdGF0ZS5zaXplTWF4KVxuICAgIEBpZCAgICAgICAgID0gTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyKDIsIDUpXG4gICAgQGlzVGFyZ2V0ICAgPSBAZGV0ZXJtaW5lVGFyZ2V0QnViYmxlKClcbiAgICBAcG9zaXRpb24gICA9XG4gICAgICB4OiBCdWJibGVHZW5lcmF0b3IuYnViYmxlc09yaWdpbi54XG4gICAgICB5OiBCdWJibGVHZW5lcmF0b3IuYnViYmxlc09yaWdpbi55XG4gICAgQHZlbG9jaXR5ICAgPVxuICAgICAgeDogVXRpbHMucmFuZG9tKFBsYXlTdGF0ZS52ZWxvY2l0eU1pbiwgUGxheVN0YXRlLnZlbG9jaXR5TWF4KVxuICAgICAgeTogVXRpbHMucmFuZG9tKFBsYXlTdGF0ZS52ZWxvY2l0eU1pbiwgUGxheVN0YXRlLnZlbG9jaXR5TWF4KVxuXG4gICAgaWYgQGlzVGFyZ2V0XG4gICAgICBAY29sb3IgICAgID0gXCJyZ2JhKCN7cn0sICN7Z30sICN7Yn0sIDAuOClcIlxuICAgICAgQGZpbmFsU2l6ZSA9IFV0aWxzLnJhbmRvbUludGVnZXIoUGxheVN0YXRlLm1pblRhcmdldFNpemUsIFBsYXlTdGF0ZS5zaXplTWF4KVxuXG4gICAgICBAdmVsb2NpdHkueCAqPSBQbGF5U3RhdGUudGFyZ2V0VmVsb2NpdHlNdWx0aXBsaWVyXG4gICAgICBAdmVsb2NpdHkueSAqPSBQbGF5U3RhdGUudGFyZ2V0VmVsb2NpdHlNdWx0aXBsaWVyXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIGRldGVybWluZVRhcmdldEJ1YmJsZTogLT5cblxuICAgIGlzVGFyZ2V0ID0gZmFsc2VcblxuICAgIGlmIEJ1YmJsZUdlbmVyYXRvci5idWJibGVzVG9UZXN0Rm9yVGFwcy5sZW5ndGggPCBQbGF5U3RhdGUubWF4VGFyZ2V0c0F0T25jZVxuICAgICAgaXNUYXJnZXQgPSBVdGlscy5yYW5kb21QZXJjZW50YWdlKCkgPCBQbGF5U3RhdGUuY2hhbmNlQnViYmxlSXNUYXJnZXRcblxuICAgIHJldHVybiBpc1RhcmdldFxuXG4gIGRyYXc6IC0+XG5cbiAgICBpZiBAb3V0c2lkZUNhbnZhc0JvdW5kcygpXG4gICAgICBCdWJibGVHZW5lcmF0b3IuYnViYmxlc1RvRGVsZXRlLnB1c2goQGlkKVxuXG4gICAgICByZXR1cm5cblxuICAgIGlmIEBpc1RhcmdldFxuICAgICAgQGxpbmVXaWR0aCA9IEBzaXplIC8gMTBcblxuICAgICAgaWYgQGxpbmVXaWR0aCA+IENvbmZpZy5tYXhMaW5lV2lkdGhcbiAgICAgICAgQGxpbmVXaWR0aCA9IENvbmZpZy5tYXhMaW5lV2lkdGhcblxuICAgICAgY29udGV4dC5maWxsU3R5bGUgPSAncmdiYSgyNDcsIDI0NywgMjQ3LCAwLjkpJ1xuICAgICAgY29udGV4dC5saW5lV2lkdGggPSBAbGluZVdpZHRoXG5cbiAgICBjb250ZXh0LmJlZ2luUGF0aCgpXG4gICAgY29udGV4dC5hcmMoQHBvc2l0aW9uLngsIEBwb3NpdGlvbi55LCBAaGFsZiwgMCwgTWF0aC5QSSAqIDIsIHRydWUpXG4gICAgY29udGV4dC5maWxsKClcbiAgICBjb250ZXh0LnN0cm9rZSgpIGlmIEBpc1RhcmdldFxuICAgIGNvbnRleHQuY2xvc2VQYXRoKClcblxuICAgIHJldHVybiB0aGlzXG5cbiAgb3V0c2lkZUNhbnZhc0JvdW5kczogLT5cblxuICAgIGJleW9uZEJvdW5kc1ggPSBAcG9zaXRpb24ueCA8IC0oQGZpbmFsU2l6ZSkgb3IgQHBvc2l0aW9uLnggPiBjYW52YXMud2lkdGggICsgQGZpbmFsU2l6ZVxuICAgIGJleW9uZEJvdW5kc1kgPSBAcG9zaXRpb24ueSA8IC0oQGZpbmFsU2l6ZSkgb3IgQHBvc2l0aW9uLnkgPiBjYW52YXMuaGVpZ2h0ICsgQGZpbmFsU2l6ZVxuXG4gICAgcmV0dXJuIGJleW9uZEJvdW5kc1ggb3IgYmV5b25kQm91bmRzWVxuXG4gIHVwZGF0ZVZhbHVlczogLT5cblxuICAgIGlmIEBkZXN0cm95aW5nXG4gICAgICBzaHJpbmtNdWx0aXBsaWVyID0gaWYgUGxheVN0YXRlLnBsYXlpbmcgdGhlbiAwLjcgZWxzZSAwLjlcblxuICAgICAgQHNpemUgKj0gc2hyaW5rTXVsdGlwbGllclxuICAgIGVsc2VcbiAgICAgIGlmIEBzaXplIDwgQGZpbmFsU2l6ZVxuICAgICAgICBAc2l6ZSAqPSBQbGF5U3RhdGUuYnViYmxlR3Jvd3RoTXVsdGlwbGllclxuXG4gICAgICBpZiBAc2l6ZSA+IEBmaW5hbFNpemVcbiAgICAgICAgQHNpemUgPSBAZmluYWxTaXplXG5cbiAgICBAaGFsZiA9IEBzaXplIC8gMlxuXG4gICAgQHBvc2l0aW9uLnggKz0gQHZlbG9jaXR5LnhcbiAgICBAcG9zaXRpb24ueSArPSBAdmVsb2NpdHkueVxuXG4gICAgQGRyYXcoKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICB3YXNUYXBwZWQ6ICh0b3VjaERhdGEpIC0+XG5cbiAgICB0YXBYICAgICAgPSB0b3VjaERhdGEucGFnZVggKiBkZXZpY2VQaXhlbFJhdGlvXG4gICAgdGFwWSAgICAgID0gdG91Y2hEYXRhLnBhZ2VZICogZGV2aWNlUGl4ZWxSYXRpb1xuICAgIGRpc3RhbmNlWCA9IHRhcFggLSBAcG9zaXRpb24ueFxuICAgIGRpc3RhbmNlWSA9IHRhcFkgLSBAcG9zaXRpb24ueVxuICAgIHJhZGl1cyAgICA9IEBoYWxmXG5cblxuXG4gICAgdGFwcGVkID0gKGRpc3RhbmNlWCAqIGRpc3RhbmNlWCkgKyAoZGlzdGFuY2VZICogZGlzdGFuY2VZKSA8IChAaGFsZiAqIEBoYWxmKVxuXG4gICAgaWYgdGFwcGVkXG4gICAgICBVdGlscy5jb25zb2xlKFwiQnViYmxlIyN7QGlkfSB0YXBwZWQgYXQgI3t0YXBYfSwgI3t0YXBZfVwiKVxuICAgIGVsc2VcbiAgICAgIFV0aWxzLmNvbnNvbGUoXCJDb21ibyBCcm9rZW4hXCIpXG5cbiAgICByZXR1cm4gdGFwcGVkXG4iLCJcbmNsYXNzIEJ1YmJsZUdlbmVyYXRvckNsYXNzXG5cbiAgY29uc3RydWN0b3I6IC0+XG5cbiAgICBAYnViYmxlc0FycmF5ICAgICAgICAgPSBbXVxuICAgIEBidWJibGVzQXJyYXlJZHMgICAgICA9IFtdXG4gICAgQGJ1YmJsZXNUb0RlbGV0ZSAgICAgID0gW11cbiAgICBAYnViYmxlc1RvVGVzdEZvclRhcHMgPSBbXVxuXG4gICAgQGJ1YmJsZXNPcmlnaW4gPVxuICAgICAgeDogY2FudmFzLndpZHRoICAvIDJcbiAgICAgIHk6IGNhbnZhcy5oZWlnaHQgLyAyXG5cbiAgICBAcmVnaXN0ZXJCdWJibGVUYXBEZXRlY3Rpb25IYW5kbGVyKClcblxuICAgIHJldHVybiB0aGlzXG5cbiAgYW5pbWF0aW9uTG9vcEFjdGlvbnM6IC0+XG5cbiAgICBpZiBQbGF5U3RhdGUucGxheWluZ1xuICAgICAgQGdlbmVyYXRlQnViYmxlKClcblxuICAgIEB1cGRhdGVCdWJibGVzVmFsdWVzKClcbiAgICBAcmVtb3ZlQnViYmxlc0FmdGVyVGFwKClcblxuICAgIGlmIEBidWJibGVzVG9EZWxldGUubGVuZ3RoID4gMFxuICAgICAgQGRlc3Ryb3lCdWJibGVzT3V0c2lkZUNhbnZhc0JvdW5kcygpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIGRlc3Ryb3lCdWJibGVzT3V0c2lkZUNhbnZhc0JvdW5kczogLT5cblxuICAgIEBidWJibGVzVG9EZWxldGUubWFwIChidWJibGVJZCkgPT5cbiAgICAgIGJ1YmJsZUluZGV4ID0gQGJ1YmJsZXNBcnJheUlkcy5pbmRleE9mKGJ1YmJsZUlkKVxuICAgICAgYnViYmxlICAgICAgPSBAYnViYmxlc0FycmF5W2J1YmJsZUluZGV4XVxuXG4gICAgICBpZiBidWJibGU/XG4gICAgICAgIEBnYW1lT3ZlcigpIGlmIGJ1YmJsZS5pc1RhcmdldFxuICAgICAgICBAcmVtb3ZlQnViYmxlKGJ1YmJsZSlcblxuICAgIEBidWJibGVzVG9EZWxldGUgPSBbXVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBnYW1lT3ZlcjogLT5cblxuICAgIEBzdG9wKClcblxuICAgIEBidWJibGVzQXJyYXkubWFwIChidWJibGUpID0+XG4gICAgICBidWJibGUuZGVzdHJveWluZyA9IHRydWVcblxuICAgIFBsYXlTdGF0ZS5idWJibGVTcGF3bkNoYW5jZSA9IDBcblxuICAgIEdhbWUub3ZlcigpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIGdlbmVyYXRlQnViYmxlOiAtPlxuXG4gICAgaWYgVXRpbHMucmFuZG9tUGVyY2VudGFnZSgpIDwgUGxheVN0YXRlLmJ1YmJsZVNwYXduQ2hhbmNlXG4gICAgICBidWJibGUgPSBuZXcgQnViYmxlQ2xhc3MoKVxuXG4gICAgICBAYnViYmxlc0FycmF5LnB1c2goYnViYmxlKVxuICAgICAgQGJ1YmJsZXNBcnJheUlkcy5wdXNoKGJ1YmJsZS5pZClcblxuICAgICAgaWYgYnViYmxlLmlzVGFyZ2V0XG4gICAgICAgIEBidWJibGVzVG9UZXN0Rm9yVGFwcy51bnNoaWZ0KGJ1YmJsZS5pZClcblxuICAgIHJldHVybiB0aGlzXG5cbiAgYnViYmxlVGFwRGV0ZWN0aW9uSGFuZGxlcjogKCkgLT5cblxuICAgIHRhcmdldEhpdCA9IGZhbHNlXG4gICAgYnViYmxlICA9IGZhbHNlXG5cbiAgICBAYnViYmxlc1RvVGVzdEZvclRhcHMubWFwIChidWJibGVJZCkgPT5cbiAgICAgIGJ1YmJsZUluZGV4ID0gQGJ1YmJsZXNBcnJheUlkcy5pbmRleE9mKGJ1YmJsZUlkKVxuICAgICAgYnViYmxlICAgICAgPSBAYnViYmxlc0FycmF5W2J1YmJsZUluZGV4XVxuICAgICAgdG91Y2hEYXRhICAgPSBJbnB1dC5nZXRUb3VjaERhdGEoZXZlbnQpXG5cbiAgICAgIGlmIGJ1YmJsZT8gYW5kIGJ1YmJsZS53YXNUYXBwZWQodG91Y2hEYXRhKVxuICAgICAgICBkZWxldGlvbkluZGV4ICAgICAgID0gQGJ1YmJsZXNUb1Rlc3RGb3JUYXBzLmluZGV4T2YoYnViYmxlSWQpXG4gICAgICAgIGJ1YmJsZS5kZXN0cm95aW5nID0gdHJ1ZVxuICAgICAgICB0YXJnZXRIaXQgICAgICAgICAgID0gdHJ1ZVxuXG4gICAgICAgIEBidWJibGVzVG9UZXN0Rm9yVGFwcy5zcGxpY2UoZGVsZXRpb25JbmRleCwgMSlcblxuICAgICAgICByZXR1cm5cblxuICAgIFBsYXlTdGF0ZS51cGRhdGVDb21ib011bHRpcGxpZXIodGFyZ2V0SGl0KVxuXG4gICAgUGxheVN0YXRlLnVwZGF0ZVNjb3JlKGJ1YmJsZS5zaXplLCBidWJibGUuZmluYWxTaXplKSBpZiB0YXJnZXRIaXRcblxuICAgIHJldHVybiB0aGlzXG5cbiAgcmVnaXN0ZXJCdWJibGVUYXBEZXRlY3Rpb25IYW5kbGVyOiAtPlxuXG4gICAgSW5wdXQucmVnaXN0ZXJIYW5kbGVyICcudWktcGxheWluZycsIGlucHV0VmVyYiwgLT5cbiAgICAgIEJ1YmJsZUdlbmVyYXRvci5idWJibGVUYXBEZXRlY3Rpb25IYW5kbGVyKClcbiAgICAsIFsncGxheWluZyddXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHJlbW92ZUJ1YmJsZTogKGJ1YmJsZSkgLT5cblxuICAgIGlkICAgID0gYnViYmxlLmlkXG4gICAgaW5kZXggPSBAYnViYmxlc0FycmF5SWRzLmluZGV4T2YoaWQpXG5cbiAgICBAYnViYmxlc0FycmF5LnNwbGljZShpbmRleCwgMSlcbiAgICBAYnViYmxlc0FycmF5SWRzLnNwbGljZShpbmRleCwgMSlcblxuICAgIHJldHVybiB0aGlzXG5cbiAgcmVtb3ZlQnViYmxlc0FmdGVyVGFwOiAtPlxuXG4gICAgQGJ1YmJsZXNBcnJheS5tYXAgKGJ1YmJsZSkgPT5cbiAgICAgIEByZW1vdmVCdWJibGUoYnViYmxlKSBpZiBidWJibGUuc2l6ZSA8IDFcblxuICAgICAgcmV0dXJuXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHJlc2V0OiAtPlxuXG4gICAgQGJ1YmJsZXNBcnJheSAgICAgICAgID0gW11cbiAgICBAYnViYmxlc0FycmF5SWRzICAgICAgPSBbXVxuICAgIEBidWJibGVzVG9EZWxldGUgICAgICA9IFtdXG4gICAgQGJ1YmJsZXNUb1Rlc3RGb3JUYXBzID0gW11cblxuICAgIHJldHVybiB0aGlzXG5cbiAgc3RvcDogLT5cblxuICAgIFBsYXlTdGF0ZS51cGRhdGUoZmFsc2UpXG4gICAgUGxheVN0YXRlLnN0b3BMZXZlbFVwSW5jcmVtZW50KClcblxuICAgIHJldHVybiB0aGlzXG5cbiAgdXBkYXRlQnViYmxlc1ZhbHVlczogLT5cblxuICAgIEBidWJibGVzQXJyYXkubWFwIChidWJibGUpID0+XG4gICAgICBjb250ZXh0LmZpbGxTdHlsZSAgID0gYnViYmxlLmNvbG9yXG4gICAgICBjb250ZXh0LnN0cm9rZVN0eWxlID0gYnViYmxlLmNvbG9yXG5cbiAgICAgIGJ1YmJsZS51cGRhdGVWYWx1ZXMoKVxuXG4gICAgICByZXR1cm5cblxuICAgIHJldHVybiB0aGlzXG4iLCJcbmNsYXNzIENvbmZpZ0NsYXNzXG5cbiAgY2hhbmNlQnViYmxlSXNUYXJnZXQ6XG4gICAgZWFzeTogICAgICA1MFxuICAgIGRpZmZpY3VsdDogOTBcblxuICBsZXZlbFVwSW50ZXJ2YWw6IDVcblxuICBtYXhMZXZlbDogNTBcblxuICBtYXhMaW5lV2lkdGg6IDVcblxuICBtYXhUYXJnZXRzQXRPbmNlOlxuICAgIGVhc3k6ICAgICAgM1xuICAgIGRpZmZpY3VsdDogNlxuXG4gIGJ1YmJsZUdyb3d0aE11bHRpcGxpZXI6XG4gICAgZWFzeTogICAgICAxLjA1XG4gICAgZGlmZmljdWx0OiAxLjEwXG5cbiAgYnViYmxlU3Bhd25DaGFuY2U6XG4gICAgZWFzeTogICAgICA2MFxuICAgIGRpZmZpY3VsdDogMTAwXG5cbiAgYnViYmxlRGlhbWV0ZXJBc1BlcmNlbnRhZ2VPZlNjcmVlbjogMTVcblxuICBwb2ludHNQZXJQb3A6IDEwXG5cbiAgcHJvcGVydGllc1RvVXBkYXRlV2l0aERpZmZpY3VsdHk6IFtcbiAgICAnYnViYmxlU3Bhd25DaGFuY2UnXG4gICAgJ2NoYW5jZUJ1YmJsZUlzVGFyZ2V0J1xuICAgICdidWJibGVHcm93dGhNdWx0aXBsaWVyJ1xuICAgICdzaXplTWF4J1xuICAgICdtYXhUYXJnZXRzQXRPbmNlJ1xuICAgICdtaW5UYXJnZXRTaXplJ1xuICAgICd2ZWxvY2l0eU1pbidcbiAgICAndmVsb2NpdHlNYXgnXG4gICAgJ3RhcmdldFZlbG9jaXR5TXVsdGlwbGllcidcbiAgXVxuXG4gIHRhcmdldFZlbG9jaXR5TXVsdGlwbGllcjpcbiAgICBlYXN5OiAgICAgIDAuM1xuICAgIGRpZmZpY3VsdDogMC41XG5cbiAgdmVsb2NpdHlNaW46XG4gICAgZWFzeTogICAgICAtNlxuICAgIGRpZmZpY3VsdDogLTEwXG5cbiAgdmVsb2NpdHlNYXg6XG4gICAgZWFzeTogICAgICA2XG4gICAgZGlmZmljdWx0OiAxMFxuXG4gIGNvbnN0cnVjdG9yOiAtPlxuXG4gICAgYmFzZVNjcmVlbldpZHRoID0gTWF0aC5taW4oYm9keS5jbGllbnRXaWR0aCwgYm9keS5jbGllbnRIZWlnaHQpIC8gMTAwXG4gICAgYmFzZUJ1YmJsZVdpZHRoID0gTWF0aC5yb3VuZChiYXNlU2NyZWVuV2lkdGggKiBAYnViYmxlRGlhbWV0ZXJBc1BlcmNlbnRhZ2VPZlNjcmVlbilcbiAgICBAYmFzZUJ1YmJsZVNpemUgPSBiYXNlQnViYmxlV2lkdGggKiBkZXZpY2VQaXhlbFJhdGlvXG5cbiAgICBAbWluVGFyZ2V0U2l6ZSA9XG4gICAgICBlYXN5OiAgICAgIEBiYXNlQnViYmxlU2l6ZSAqIDAuN1xuICAgICAgZGlmZmljdWx0OiBAYmFzZUJ1YmJsZVNpemUgKiAwLjRcblxuICAgIEBzaXplTWF4ID1cbiAgICAgIGVhc3k6ICAgICAgQGJhc2VCdWJibGVTaXplXG4gICAgICBkaWZmaWN1bHQ6IEBiYXNlQnViYmxlU2l6ZSAqIDAuNlxuXG4gICAgcmV0dXJuIHRoaXNcblxuICB1cGRhdGVWYWx1ZXNGb3JEaWZmaWN1bHR5OiAtPlxuXG4gICAgQHByb3BlcnRpZXNUb1VwZGF0ZVdpdGhEaWZmaWN1bHR5Lm1hcCAocHJvcGVydHkpID0+XG4gICAgICBwcm9wZXJ0eUNvbmZpZyAgPSBAW3Byb3BlcnR5XVxuICAgICAgdmFsdWVEaWZmZXJlbmNlID0gcHJvcGVydHlDb25maWcuZGlmZmljdWx0IC0gcHJvcGVydHlDb25maWcuZWFzeVxuICAgICAgbGV2ZWxNdWxpdHBsaWVyID0gUGxheVN0YXRlLmxldmVsIC8gQG1heExldmVsXG5cbiAgICAgIFBsYXlTdGF0ZVtwcm9wZXJ0eV0gPSAodmFsdWVEaWZmZXJlbmNlICogbGV2ZWxNdWxpdHBsaWVyKSArIHByb3BlcnR5Q29uZmlnLmVhc3lcblxuICAgICAgcmV0dXJuXG5cbiAgICByZXR1cm4gdGhpc1xuIiwiXG5jbGFzcyBEZXZpY2VDbGFzc1xuXG4gIGNvbnN0cnVjdG9yOiAtPlxuXG4gICAgcmV0dXJuIHRoaXNcbiIsIlxuY2xhc3MgR2FtZUNsYXNzXG5cbiAgY29uc3RydWN0b3I6IC0+XG5cbiAgICBTY2VuZXMuaWRlbnQoKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBvdmVyOiAtPlxuXG4gICAgU2NlbmVzLmdhbWVPdmVyKClcblxuICAgIFBsYXlTdGF0ZS5zdG9wTGV2ZWxVcEluY3JlbWVudCgpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHN0YXJ0OiAtPlxuXG4gICAgUGxheVN0YXRlLnJlc2V0KClcbiAgICBVSS5yZXNldCgpXG4gICAgSW5wdXQucmVtb3ZlR2FtZVN0YXJ0VGFwRXZlbnRIYW5kbGVyKClcbiAgICBCdWJibGVHZW5lcmF0b3IucmVzZXQoKVxuXG4gICAgU2NlbmVzLnBsYXlpbmcoKVxuXG4gICAgcmV0dXJuIHRoaXNcbiIsIlxuY2xhc3MgSW5wdXRDbGFzc1xuXG4gIGNvbnN0cnVjdG9yOiAtPlxuXG4gICAgQGNhbmNlbFRvdWNoTW92ZUV2ZW50cygpXG5cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciBpbnB1dFZlcmIsIChldmVudCkgLT5cbiAgICAgICNVdGlscy5jb25zb2xlKGV2ZW50LnR5cGUgKyAnIG9uICcgKyBldmVudC50YXJnZXQubm9kZU5hbWUudG9Mb3dlckNhc2UoKSlcbiAgICAgIHJldHVyblxuICAgICwgZmFsc2VcblxuICAgIHJldHVybiB0aGlzXG5cbiAgY2FuY2VsVG91Y2hNb3ZlRXZlbnRzOiAtPlxuXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIgJ3RvdWNobW92ZScsIChldmVudCkgLT5cbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcblxuICAgICAgcmV0dXJuXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIGdhbWVTdGFydFRhcEV2ZW50SGFuZGxlcjogKCkgLT5cblxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcblxuICAgIEdhbWUuc3RhcnQoKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBnZXRUb3VjaERhdGE6IChldmVudCkgLT5cblxuICAgIHJldHVybiBldmVudC50b3VjaGVzWzBdIGlmIGhhc1RvdWNoRXZlbnRzXG5cbiAgICB0b3VjaERhdGEgPVxuICAgICAgcGFnZVg6IGV2ZW50LmNsaWVudFgsXG4gICAgICBwYWdlWTogZXZlbnQuY2xpZW50WVxuXG4gICAgcmV0dXJuIHRvdWNoRGF0YVxuXG4gIHJlZ2lzdGVySGFuZGxlcjogKHNlbGVjdG9yLCBhY3Rpb24sIGNhbGxiYWNrLCBzY2VuZXMpIC0+XG5cbiAgICBjb25zb2xlLmxvZyBcIklucHV0LnJlZ3NpdGVySGFuZGxlcigje3NlbGVjdG9yfSwgI3thY3Rpb259LCAje2NhbGxiYWNrfSwgI3tzY2VuZXN9KVwiXG5cbiAgICBpZiB0eXBlb2Ygc2NlbmVzID09ICdzdHJpbmcnXG4gICAgICBzY2VuZSAgPSBzY2VuZXNcbiAgICAgIHNjZW5lcyA9IFtzY2VuZV1cblxuICAgIGVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKVxuXG4gICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyIGFjdGlvbiwgKGV2ZW50KSA9PlxuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgICAgY29uc29sZS5sb2cgXCJDYWxsaW5nICN7YWN0aW9ufSBpbnB1dCBvbiAje2VsZW1lbnR9IGluICN7U2NlbmVzLmN1cnJlbnR9KVwiXG4gICAgICBjYWxsYmFjay5hcHBseSgpIGlmIHNjZW5lcy5sZW5ndGggPT0gMCB8fCBTY2VuZXMuY3VycmVudCBpbiBzY2VuZXNcbiAgICAgIHJldHVyblxuXG4gICAgcmV0dXJuIHRoaXNcblxuICByZW1vdmVHYW1lU3RhcnRUYXBFdmVudEhhbmRsZXI6IC0+XG5cbiAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUV2ZW50TGlzdGVuZXIoaW5wdXRWZXJiLCBAZ2FtZVN0YXJ0VGFwRXZlbnRIYW5kbGVyKVxuXG4gICAgcmV0dXJuIHRoaXNcbiIsIlxuY2xhc3MgUGxheVN0YXRlQ2xhc3NcblxuICBkZWZhdWx0czpcbiAgICBjb21ib011bHRpcGxpZXI6IDBcbiAgICBsZXZlbDogICAgICAgICAgIDFcbiAgICBzY29yZTogICAgICAgICAgIDBcblxuICByZXNldDogLT5cblxuICAgIEBjaGFuY2VCdWJibGVJc1RhcmdldCAgICAgPSBDb25maWcuY2hhbmNlQnViYmxlSXNUYXJnZXQuZWFzeVxuICAgIEBjb21ib011bHRpcGxpZXIgICAgICAgICAgPSBAZGVmYXVsdHMuY29tYm9NdWx0aXBsaWVyXG4gICAgQGxldmVsICAgICAgICAgICAgICAgICAgICA9IEBkZWZhdWx0cy5sZXZlbFxuICAgIEBtYXhUYXJnZXRzQXRPbmNlICAgICAgICAgPSBDb25maWcubWF4VGFyZ2V0c0F0T25jZS5lYXN5XG4gICAgQG1pblRhcmdldFNpemUgICAgICAgICAgICA9IENvbmZpZy5taW5UYXJnZXRTaXplLmVhc3lcbiAgICBAYnViYmxlR3Jvd3RoTXVsdGlwbGllciAgID0gQ29uZmlnLmJ1YmJsZUdyb3d0aE11bHRpcGxpZXIuZWFzeVxuICAgIEBidWJibGVTcGF3bkNoYW5jZSAgICAgICAgPSBDb25maWcuYnViYmxlU3Bhd25DaGFuY2UuZWFzeVxuICAgIEBzY29yZSAgICAgICAgICAgICAgICAgICAgPSBAZGVmYXVsdHMuc2NvcmVcbiAgICBAc2l6ZU1heCAgICAgICAgICAgICAgICAgID0gQ29uZmlnLnNpemVNYXguZWFzeVxuICAgIEB0YXJnZXRWZWxvY2l0eU11bHRpcGxpZXIgPSBDb25maWcudGFyZ2V0VmVsb2NpdHlNdWx0aXBsaWVyLmVhc3lcbiAgICBAdmVsb2NpdHlNaW4gICAgICAgICAgICAgID0gQ29uZmlnLnZlbG9jaXR5TWluLmVhc3lcbiAgICBAdmVsb2NpdHlNYXggICAgICAgICAgICAgID0gQ29uZmlnLnZlbG9jaXR5TWF4LmVhc3lcblxuICAgIEB1cGRhdGUodHJ1ZSlcblxuICAgIENvbmZpZy51cGRhdGVWYWx1ZXNGb3JEaWZmaWN1bHR5KClcblxuICAgIEBzZXR1cExldmVsVXBJbmNyZW1lbnQoKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBzdG9wTGV2ZWxVcEluY3JlbWVudDogLT5cblxuICAgIHdpbmRvdy5jbGVhckludGVydmFsKEBsZXZlbFVwQ291bnRlcilcblxuICAgIHJldHVybiB0aGlzXG5cbiAgc2V0dXBMZXZlbFVwSW5jcmVtZW50OiAtPlxuXG4gICAgQGxldmVsVXBDb3VudGVyID0gd2luZG93LnNldEludGVydmFsID0+XG5cbiAgICAgIEB1cGRhdGVMZXZlbCgpXG5cbiAgICAgIHJldHVyblxuXG4gICAgLCBDb25maWcubGV2ZWxVcEludGVydmFsICogMTAwMFxuXG4gICAgcmV0dXJuIHRoaXNcblxuICB1cGRhdGVDb21ib011bHRpcGxpZXI6ICh0YXJnZXRIaXQpIC0+XG5cbiAgICBAY29tYm9NdWx0aXBsaWVyID0gaWYgdGFyZ2V0SGl0IHRoZW4gQGNvbWJvTXVsdGlwbGllciArIDEgZWxzZSBAZGVmYXVsdHMuY29tYm9NdWx0aXBsaWVyXG5cbiAgICBVSS51cGRhdGVDb21ib011bHRpcGxpZXJDb3VudGVyKClcblxuICAgIHJldHVybiB0aGlzXG5cbiAgdXBkYXRlOiAobmV3U3RhdGUpIC0+XG5cbiAgICBAcGxheWluZyA9IG5ld1N0YXRlXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHVwZGF0ZUxldmVsOiAtPlxuXG4gICAgQGxldmVsICs9IDFcblxuICAgIGlmIEBsZXZlbCA+PSBDb25maWcubWF4TGV2ZWxcbiAgICAgIHdpbmRvdy5jbGVhckludGVydmFsKEBsZXZlbFVwQ291bnRlcilcblxuICAgIFVJLnVwZGF0ZUxldmVsQ291bnRlcigpXG4gICAgQ29uZmlnLnVwZGF0ZVZhbHVlc0ZvckRpZmZpY3VsdHkoKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICB1cGRhdGVTY29yZTogKHNpemVXaGVuVGFwcGVkLCBzaXplV2hlbkZ1bGx5R3Jvd24pIC0+XG5cbiAgICAjKChkZWZhdWx0U2NvcmVQZXJQb3AgKyAoMTAwIC0gKChzaXplV2hlblRhcHBlZCAvIHNpemVXaGVuRnVsbHlHcm93bikgKiAxMDApKSkgKiBjb21ib011bHRpcGxpZXIpICogKGxldmVsTnVtYmVyICsgMSlcblxuICAgIHRhcmdldFNpemVCb251cyA9IE1hdGgucm91bmQoMTAwIC0gKChzaXplV2hlblRhcHBlZCAvIHNpemVXaGVuRnVsbHlHcm93bikgKiAxMDApKVxuICAgIHBvcFBvaW50VmFsdWUgICA9IENvbmZpZy5wb2ludHNQZXJQb3AgKyB0YXJnZXRTaXplQm9udXNcbiAgICBsZXZlbE11bHRpcGxpZXIgPSBAbGV2ZWwgKyAxXG5cbiAgICBAc2NvcmUgKz0gKHBvcFBvaW50VmFsdWUgKiBAY29tYm9NdWx0aXBsaWVyKSAqIChsZXZlbE11bHRpcGxpZXIpXG5cbiAgICBVSS51cGRhdGVTY29yZUNvdW50ZXIoKVxuXG4gICAgcmV0dXJuIHRoaXNcbiIsIlxuY2xhc3MgU2NlbmVzQ2xhc3NcblxuICBAY3VycmVudCA9IG51bGxcblxuICBjcmVkaXRzOiAtPlxuXG4gICAgQGN1cnJlbnQgPSAnY3JlZGl0cydcblxuICAgIFV0aWxzLmNvbnNvbGUoJ0xvYWQgU2NlbmU6IENyZWRpdHMnKVxuXG4gICAgVUkudXBkYXRlQm9keUNsYXNzKCdjcmVkaXRzJylcblxuICAgIHJldHVybiB0aGlzXG5cbiAgZ2FtZU92ZXI6IC0+XG5cbiAgICBAY3VycmVudCA9ICdnYW1lLW92ZXInXG5cbiAgICBVdGlscy5jb25zb2xlKCdMb2FkIFNjZW5lOiBHYW1lIE92ZXInKVxuXG4gICAgVUkudXBkYXRlQm9keUNsYXNzKCdnYW1lLW92ZXInKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBsZWFkZXJib2FyZDogLT5cblxuICAgIEBjdXJyZW50ID0gJ2xlYWRlcmJvYXJkJ1xuXG4gICAgVXRpbHMuY29uc29sZSgnTG9hZCBTY2VuZTogTGVhZGVyYm9hcmQnKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBwbGF5aW5nOiAtPlxuXG4gICAgQGN1cnJlbnQgPSAncGxheWluZydcblxuICAgIFV0aWxzLmNvbnNvbGUoJ0xvYWQgU2NlbmU6IFBsYXlpbmcnKVxuXG4gICAgVUkudXBkYXRlQm9keUNsYXNzKCdwbGF5aW5nJylcblxuICAgIHJldHVybiB0aGlzXG5cbiAgaWRlbnQ6IC0+XG5cbiAgICBAY3VycmVudCA9ICdpZGVudCdcblxuICAgIFV0aWxzLmNvbnNvbGUoJ0xvYWQgU2NlbmU6IElkZW50JylcblxuICAgIFVJLnVwZGF0ZUJvZHlDbGFzcygnaWRlbnQnKVxuXG4gICAgd2luZG93LnNldFRpbWVvdXQgPT5cbiAgICAgIEB0aXRsZSgpXG4gICAgLCAyNTAwXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHRpdGxlOiAtPlxuXG4gICAgQGN1cnJlbnQgPSAndGl0bGUnXG5cbiAgICBVdGlscy5jb25zb2xlKCdMb2FkIFNjZW5lOiBUaXRsZSBTY3JlZW4nKVxuXG4gICAgVUkudXBkYXRlQm9keUNsYXNzKCd0aXRsZScpXG5cbiAgICByZXR1cm4gdGhpc1xuIiwiXG5jbGFzcyBVSUNsYXNzXG5cbiAgY29uc3RydWN0b3I6IC0+XG5cbiAgICBAc2V0dXBCYXNpY0ludGVyZmFjZUV2ZW50cygpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHJlc2V0OiAtPlxuXG4gICAgQGxldmVsQ291bnRlciAgICAgICAgICAgPSBVdGlscy4kKCcuaHVkLXZhbHVlLWxldmVsJylcbiAgICBAc2NvcmVDb3VudGVyICAgICAgICAgICA9IFV0aWxzLiQoJy5odWQtdmFsdWUtc2NvcmUnKVxuICAgIEBjb21ib011bHRpcGxpZXJDb3VudGVyID0gVXRpbHMuJCgnLmh1ZC12YWx1ZS1jb21ibycpXG4gICAgQHBsYXlBZ2FpbiAgICAgICAgICAgICAgPSBVdGlscy4kKCcucGxheS1hZ2FpbicpXG5cbiAgICBAdXBkYXRlQ29tYm9NdWx0aXBsaWVyQ291bnRlcigpXG4gICAgQHVwZGF0ZUxldmVsQ291bnRlcigpXG4gICAgQHVwZGF0ZVNjb3JlQ291bnRlcigpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHNldHVwQmFzaWNJbnRlcmZhY2VFdmVudHM6IC0+XG5cbiAgICBJbnB1dC5yZWdpc3RlckhhbmRsZXIgJy5nYW1lLWxvZ28nLCBpbnB1dFZlcmIsIC0+XG4gICAgICBJbnB1dC5nYW1lU3RhcnRUYXBFdmVudEhhbmRsZXIoKVxuICAgICwgWyd0aXRsZSddXG5cbiAgICBJbnB1dC5yZWdpc3RlckhhbmRsZXIgJy5wbGF5LWFnYWluJywgaW5wdXRWZXJiLCAtPlxuICAgICAgSW5wdXQuZ2FtZVN0YXJ0VGFwRXZlbnRIYW5kbGVyKClcbiAgICAsIFsnZ2FtZS1vdmVyJ11cblxuICAgIHJldHVybiB0aGlzXG5cbiAgdXBkYXRlQm9keUNsYXNzOiAoY2xhc3NOYW1lKSAtPlxuXG4gICAgYm9keS5jbGFzc05hbWUgPSAnJ1xuICAgIGJvZHkuY2xhc3NMaXN0LmFkZCgnc2NlbmUtJyArIGNsYXNzTmFtZSlcblxuICAgIHJldHVybiB0aGlzXG5cbiAgdXBkYXRlQ29tYm9NdWx0aXBsaWVyQ291bnRlcjogLT5cblxuICAgIFV0aWxzLnVwZGF0ZVVJVGV4dE5vZGUoQGNvbWJvTXVsdGlwbGllckNvdW50ZXIsIFBsYXlTdGF0ZS5jb21ib011bHRpcGxpZXIpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHVwZGF0ZUxldmVsQ291bnRlcjogLT5cblxuICAgIFV0aWxzLnVwZGF0ZVVJVGV4dE5vZGUoQGxldmVsQ291bnRlciwgUGxheVN0YXRlLmxldmVsKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICB1cGRhdGVTY29yZUNvdW50ZXI6IC0+XG5cbiAgICBzY29yZVRvRm9ybWF0ID0gVXRpbHMuZm9ybWF0V2l0aENvbW1hKFBsYXlTdGF0ZS5zY29yZSlcblxuICAgIFV0aWxzLnVwZGF0ZVVJVGV4dE5vZGUoQHNjb3JlQ291bnRlciwgc2NvcmVUb0Zvcm1hdClcblxuICAgIHJldHVybiB0aGlzXG4iLCJcbmNsYXNzIFV0aWxzQ2xhc3NcblxuICAkOiAoc2VsZWN0b3IpIC0+XG5cbiAgICByZXR1cm4gZG9jdW1lbnQuYm9keSBpZiBzZWxlY3RvciA9PSBib2R5XG4gICAgcmV0dXJuIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHNlbGVjdG9yKSBpZiBzZWxlY3Rvci5zdWJzdHIoMCwgMSkgPT0gJyMnXG5cbiAgICBlbHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKVxuXG4gICAgcmV0dXJuIGVsc1swXSBpZiBlbHMubGVuZ3RoID09IDFcblxuICAgIHJldHVybiBlbHNcblxuICBjb25zb2xlOiAoY29udGVudCkgLT5cbiAgICBjb25zb2xlID0gQCQoJy5jb25zb2xlJylcbiAgICBAdXBkYXRlVUlUZXh0Tm9kZShjb25zb2xlLCBjb250ZW50KVxuICAgIHJldHVyblxuXG4gIGNvcnJlY3RWYWx1ZUZvckRQUjogKHZhbHVlLCBpbnRlZ2VyID0gZmFsc2UpIC0+XG5cbiAgICB2YWx1ZSAqPSBkZXZpY2VQaXhlbFJhdGlvXG5cbiAgICB2YWx1ZSA9IE1hdGgucm91bmQodmFsdWUpIGlmIGludGVnZXJcblxuICAgIHJldHVybiB2YWx1ZVxuXG4gIGZvcm1hdFdpdGhDb21tYTogKG51bSkgLT5cblxuICAgIHJldHVybiBudW0udG9TdHJpbmcoKS5yZXBsYWNlKC9cXEIoPz0oXFxkezN9KSsoPyFcXGQpKS9nLCBcIixcIilcblxuICByYW5kb206IChtaW4sIG1heCkgLT5cblxuICAgIGlmIG1pbiA9PSB1bmRlZmluZWRcbiAgICAgIG1pbiA9IDBcbiAgICAgIG1heCA9IDFcbiAgICBlbHNlIGlmIG1heCA9PSB1bmRlZmluZWRcbiAgICAgIG1heCA9IG1pblxuICAgICAgbWluID0gMFxuXG4gICAgcmV0dXJuIChNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbikpICsgbWluO1xuXG4gIHJhbmRvbUNvbG9yOiAoYWxwaGEgPSBmYWxzZSkgLT5cblxuICAgIGNvbG9ycyA9XG4gICAgICByOiB0aGlzLnJhbmRvbUludGVnZXIoMCwgMjAwKVxuICAgICAgZzogdGhpcy5yYW5kb21JbnRlZ2VyKDAsIDIwMClcbiAgICAgIGI6IHRoaXMucmFuZG9tSW50ZWdlcigwLCAyMDApXG4gICAgICBhOiBpZiAhYWxwaGEgdGhlbiB0aGlzLnJhbmRvbSgwLjc1LCAxKSBlbHNlIGFscGhhXG5cbiAgICByZXR1cm4gJ3JnYmEoJyArIGNvbG9ycy5yICsgJywgJyArIGNvbG9ycy5nICsgJywgJyArIGNvbG9ycy5iICsgJywgJyArIGNvbG9ycy5hICsgJyknXG5cbiAgcmFuZG9tSW50ZWdlcjogKG1pbiwgbWF4KSAtPlxuXG4gICAgaWYgbWF4ID09IHVuZGVmaW5lZFxuICAgICAgbWF4ID0gbWluXG4gICAgICBtaW4gPSAwXG5cbiAgICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKG1heCArIDEgLSBtaW4pKSArIG1pblxuXG4gIHJhbmRvbVBlcmNlbnRhZ2U6IC0+XG5cbiAgICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTAwKVxuXG4gIHVwZGF0ZVVJVGV4dE5vZGU6IChlbGVtZW50LCB2YWx1ZSkgLT5cblxuICAgIGVsZW1lbnQuaW5uZXJIVE1MID0gdmFsdWVcblxuICAgIHJldHVybiB0aGlzXG4iLCJcbmRlYnVnID0gdHJ1ZVxuXG5hbmRyb2lkICAgICAgICA9IGlmIG5hdmlnYXRvci51c2VyQWdlbnQubWF0Y2goL2FuZHJvaWQvaSkgdGhlbiB0cnVlIGVsc2UgZmFsc2VcbmJvZHkgICAgICAgICAgID0gZG9jdW1lbnQuYm9keVxuY2FudmFzICAgICAgICAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuY2FudmFzJylcbmhhc1RvdWNoRXZlbnRzID0gd2luZG93Lmhhc093blByb3BlcnR5KCdvbnRvdWNoc3RhcnQnKSB8fCB3aW5kb3cuaGFzT3duUHJvcGVydHkoJ29ubXNnZXN0dXJlY2hhbmdlJylcbmlucHV0VmVyYiAgICAgID0gaWYgaGFzVG91Y2hFdmVudHMgdGhlbiAndG91Y2hzdGFydCcgZWxzZSAnY2xpY2snXG5cbmNhbnZhcy5jbGFzc05hbWUgPSAnY2FudmFzJ1xuY2FudmFzLndpZHRoICAgICA9IGJvZHkuY2xpZW50V2lkdGhcbmNhbnZhcy5oZWlnaHQgICAgPSBib2R5LmNsaWVudEhlaWdodFxuXG5jb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoJzJkJylcblxuY29udGV4dC5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb24gPSAnc291cmNlLWF0b3AnXG5cbmRldmljZVBpeGVsUmF0aW8gID0gd2luZG93LmRldmljZVBpeGVsUmF0aW8gfHwgMVxuYmFja2luZ1N0b3JlUmF0aW8gPSBjb250ZXh0LndlYmtpdEJhY2tpbmdTdG9yZVBpeGVsUmF0aW8gfHwgY29udGV4dC5iYWNraW5nU3RvcmVQaXhlbFJhdGlvIHx8IDFcbnJhdGlvICAgICAgICAgICAgID0gZGV2aWNlUGl4ZWxSYXRpbyAvIGJhY2tpbmdTdG9yZVJhdGlvXG5cbmlmIGRldmljZVBpeGVsUmF0aW8gIT0gYmFja2luZ1N0b3JlUmF0aW9cbiAgb2xkV2lkdGggID0gY2FudmFzLndpZHRoXG4gIG9sZEhlaWdodCA9IGNhbnZhcy5oZWlnaHRcblxuICBjYW52YXMud2lkdGggID0gb2xkV2lkdGggICogcmF0aW9cbiAgY2FudmFzLmhlaWdodCA9IG9sZEhlaWdodCAqIHJhdGlvXG5cbiAgY2FudmFzLnN0eWxlLndpZHRoICA9IFwiI3tvbGRXaWR0aH1weFwiXG4gIGNhbnZhcy5zdHlsZS5oZWlnaHQgPSBcIiN7b2xkSGVpZ2h0fXB4XCJcblxuICBjb250ZXh0LnNjYWxlKHJhdGlvLCByYXRpbylcblxuIyBTZXQgZW52aXJvbm1lbnQgYW5kIGJhc2UgY29uZmlnIGV0Y1xuRGV2aWNlICAgICAgICAgID0gbmV3IERldmljZUNsYXNzKClcblV0aWxzICAgICAgICAgICA9IG5ldyBVdGlsc0NsYXNzKClcbkNvbmZpZyAgICAgICAgICA9IG5ldyBDb25maWdDbGFzcygpXG5JbnB1dCAgICAgICAgICAgPSBuZXcgSW5wdXRDbGFzcygpXG5cbiMgTG9hZCB0aGUgZ2FtZSBsb2dpYyBhbmQgYWxsIHRoYXRcbkJ1YmJsZUdlbmVyYXRvciA9IG5ldyBCdWJibGVHZW5lcmF0b3JDbGFzcygpXG5QbGF5U3RhdGUgICAgICAgPSBuZXcgUGxheVN0YXRlQ2xhc3MoKVxuVUkgICAgICAgICAgICAgID0gbmV3IFVJQ2xhc3MoKVxuU2NlbmVzICAgICAgICAgID0gbmV3IFNjZW5lc0NsYXNzKClcblxuIyBTZXQgb2ZmIHRoZSBjYW52YXMgYW5pbWF0aW9uIGxvb3BcbkFuaW1hdGlvbkxvb3AgICA9IG5ldyBBbmltYXRpb25Mb29wQ2xhc3MoKVxuXG4jIFN0YXJ0IHRoZSBhY3R1YWwgZ2FtZVxuR2FtZSAgICAgICAgICAgID0gbmV3IEdhbWVDbGFzcygpXG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=