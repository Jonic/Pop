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
    var event_details;
    this.cancelTouchMoveEvents();
    event_details = {
      element: Utils.$('.event_details .element'),
      action: Utils.$('.event_details .action')
    };
    window.addEventListener(inputVerb, function(event) {
      console.log(event);
      Utils.updateUITextNode(event_details.element, event.target.nodeName.toLowerCase());
      Utils.updateUITextNode(event_details.action, event.type);
    }, false);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkFuaW1hdGlvbkxvb3AuY29mZmVlIiwiQnViYmxlLmNvZmZlZSIsIkJ1YmJsZUdlbmVyYXRvci5jb2ZmZWUiLCJDb25maWcuY29mZmVlIiwiRGV2aWNlLmNvZmZlZSIsIkdhbWUuY29mZmVlIiwiSW5wdXQuY29mZmVlIiwiUGxheVN0YXRlLmNvZmZlZSIsIlNjZW5lcy5jb2ZmZWUiLCJVSS5jb2ZmZWUiLCJVdGlscy5jb2ZmZWUiLCJfYm9vdHN0cmFwLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxJQUFBLGtCQUFBOztBQUFBO0FBRWUsRUFBQSw0QkFBQSxHQUFBO0FBRVgsSUFBQSxJQUFDLENBQUEscUJBQUQsQ0FBQSxDQUFBLENBQUE7QUFFQSxXQUFPLElBQVAsQ0FKVztFQUFBLENBQWI7O0FBQUEsK0JBTUEsb0JBQUEsR0FBc0IsU0FBQSxHQUFBO0FBRXBCLElBQUEsTUFBTSxDQUFDLG9CQUFQLENBQTRCLElBQUMsQ0FBQSxlQUE3QixDQUFBLENBQUE7QUFFQSxXQUFPLElBQVAsQ0FKb0I7RUFBQSxDQU50QixDQUFBOztBQUFBLCtCQVlBLHFCQUFBLEdBQXVCLFNBQUEsR0FBQTtBQUVyQixJQUFBLElBQUMsQ0FBQSxlQUFELEdBQW1CLE1BQU0sQ0FBQyxxQkFBUCxDQUE2QixDQUFBLFNBQUEsS0FBQSxHQUFBO2FBQUEsU0FBQSxHQUFBO0FBRTlDLFFBQUEsS0FBQyxDQUFBLHFCQUFELENBQUEsQ0FBQSxDQUY4QztNQUFBLEVBQUE7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTdCLENBQW5CLENBQUE7QUFBQSxJQU1BLE1BQU0sQ0FBQyxLQUFQLEdBQWUsTUFBTSxDQUFDLEtBTnRCLENBQUE7QUFBQSxJQVFBLGVBQWUsQ0FBQyxvQkFBaEIsQ0FBQSxDQVJBLENBQUE7QUFVQSxXQUFPLElBQVAsQ0FacUI7RUFBQSxDQVp2QixDQUFBOzs0QkFBQTs7SUFGRixDQUFBOztBQ0FBLElBQUEsV0FBQTs7QUFBQTtBQUVFLHdCQUFBLFVB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LEdBQVksSUFObEMsQ0FBQTtBQUFBLEVBT0EsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFiLEdBQXNCLEVBQUEsR0FBRyxTQUFILEdBQWEsSUFQbkMsQ0FBQTtBQUFBLEVBU0EsT0FBTyxDQUFDLEtBQVIsQ0FBYyxLQUFkLEVBQXFCLEtBQXJCLENBVEEsQ0FERjtDQXBCQTs7QUFBQSxNQWlDQSxHQUFzQixJQUFBLFdBQUEsQ0FBQSxDQWpDdEIsQ0FBQTs7QUFBQSxLQWtDQSxHQUFzQixJQUFBLFVBQUEsQ0FBQSxDQWxDdEIsQ0FBQTs7QUFBQSxNQW1DQSxHQUFzQixJQUFBLFdBQUEsQ0FBQSxDQW5DdEIsQ0FBQTs7QUFBQSxLQW9DQSxHQUFzQixJQUFBLFVBQUEsQ0FBQSxDQXBDdEIsQ0FBQTs7QUFBQSxlQXVDQSxHQUFzQixJQUFBLG9CQUFBLENBQUEsQ0F2Q3RCLENBQUE7O0FBQUEsU0F3Q0EsR0FBc0IsSUFBQSxjQUFBLENBQUEsQ0F4Q3RCLENBQUE7O0FBQUEsRUF5Q0EsR0FBc0IsSUFBQSxPQUFBLENBQUEsQ0F6Q3RCLENBQUE7O0FBQUEsTUEwQ0EsR0FBc0IsSUFBQSxXQUFBLENBQUEsQ0ExQ3RCLENBQUE7O0FBQUEsYUE2Q0EsR0FBc0IsSUFBQSxrQkFBQSxDQUFBLENBN0N0QixDQUFBOztBQUFBLElBZ0RBLEdBQXNCLElBQUEsU0FBQSxDQUFBLENBaER0QixDQUFBIiwiZmlsZSI6ImFwcGxpY2F0aW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXG5jbGFzcyBBbmltYXRpb25Mb29wQ2xhc3NcblxuICBjb25zdHJ1Y3RvcjogLT5cblxuICAgIEByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBjYW5jZWxBbmltYXRpb25GcmFtZTogLT5cblxuICAgIHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZShAYW5pbWF0aW9uTG9vcElkKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWU6IC0+XG5cbiAgICBAYW5pbWF0aW9uTG9vcElkID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSA9PlxuXG4gICAgICBAcmVxdWVzdEFuaW1hdGlvbkZyYW1lKClcblxuICAgICAgcmV0dXJuXG5cbiAgICBjYW52YXMud2lkdGggPSBjYW52YXMud2lkdGhcblxuICAgIEJ1YmJsZUdlbmVyYXRvci5hbmltYXRpb25Mb29wQWN0aW9ucygpXG5cbiAgICByZXR1cm4gdGhpc1xuIiwiXG5jbGFzcyBCdWJibGVDbGFzc1xuXG4gIGRlc3Ryb3lpbmc6IGZhbHNlXG4gIHNpemU6ICAgICAgIDFcblxuICBjb25zdHJ1Y3RvcjogLT5cblxuICAgIHIgPSBVdGlscy5yYW5kb21JbnRlZ2VyKDAsIDIwMClcbiAgICBnID0gVXRpbHMucmFuZG9tSW50ZWdlcigwLCAyMDApXG4gICAgYiA9IFV0aWxzLnJhbmRvbUludGVnZXIoMCwgMjAwKVxuICAgIGEgPSBVdGlscy5yYW5kb20oMC43NSwgMSlcblxuICAgIEBjb2xvciAgICAgID0gXCJyZ2JhKCN7cn0sICN7Z30sICN7Yn0sICN7YX0pXCJcbiAgICBAZmluYWxTaXplICA9IFV0aWxzLnJhbmRvbUludGVnZXIoMCwgUGxheVN0YXRlLnNpemVNYXgpXG4gICAgQGlkICAgICAgICAgPSBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHIoMiwgNSlcbiAgICBAaXNUYXJnZXQgICA9IEBkZXRlcm1pbmVUYXJnZXRCdWJibGUoKVxuICAgIEBwb3NpdGlvbiAgID1cbiAgICAgIHg6IEJ1YmJsZUdlbmVyYXRvci5idWJibGVzT3JpZ2luLnhcbiAgICAgIHk6IEJ1YmJsZUdlbmVyYXRvci5idWJibGVzT3JpZ2luLnlcbiAgICBAdmVsb2NpdHkgICA9XG4gICAgICB4OiBVdGlscy5yYW5kb20oUGxheVN0YXRlLnZlbG9jaXR5TWluLCBQbGF5U3RhdGUudmVsb2NpdHlNYXgpXG4gICAgICB5OiBVdGlscy5yYW5kb20oUGxheVN0YXRlLnZlbG9jaXR5TWluLCBQbGF5U3RhdGUudmVsb2NpdHlNYXgpXG5cbiAgICBpZiBAaXNUYXJnZXRcbiAgICAgIEBjb2xvciAgICAgPSBcInJnYmEoI3tyfSwgI3tnfSwgI3tifSwgMC44KVwiXG4gICAgICBAZmluYWxTaXplID0gVXRpbHMucmFuZG9tSW50ZWdlcihQbGF5U3RhdGUubWluVGFyZ2V0U2l6ZSwgUGxheVN0YXRlLnNpemVNYXgpXG5cbiAgICAgIEB2ZWxvY2l0eS54ICo9IFBsYXlTdGF0ZS50YXJnZXRWZWxvY2l0eU11bHRpcGxpZXJcbiAgICAgIEB2ZWxvY2l0eS55ICo9IFBsYXlTdGF0ZS50YXJnZXRWZWxvY2l0eU11bHRpcGxpZXJcblxuICAgIHJldHVybiB0aGlzXG5cbiAgZGV0ZXJtaW5lVGFyZ2V0QnViYmxlOiAtPlxuXG4gICAgaXNUYXJnZXQgPSBmYWxzZVxuXG4gICAgaWYgQnViYmxlR2VuZXJhdG9yLmJ1YmJsZXNUb1Rlc3RGb3JUYXBzLmxlbmd0aCA8IFBsYXlTdGF0ZS5tYXhUYXJnZXRzQXRPbmNlXG4gICAgICBpc1RhcmdldCA9IFV0aWxzLnJhbmRvbVBlcmNlbnRhZ2UoKSA8IFBsYXlTdGF0ZS5jaGFuY2VCdWJibGVJc1RhcmdldFxuXG4gICAgcmV0dXJuIGlzVGFyZ2V0XG5cbiAgZHJhdzogLT5cblxuICAgIGlmIEBvdXRzaWRlQ2FudmFzQm91bmRzKClcbiAgICAgIEJ1YmJsZUdlbmVyYXRvci5idWJibGVzVG9EZWxldGUucHVzaChAaWQpXG5cbiAgICAgIHJldHVyblxuXG4gICAgaWYgQGlzVGFyZ2V0XG4gICAgICBAbGluZVdpZHRoID0gQHNpemUgLyAxMFxuXG4gICAgICBpZiBAbGluZVdpZHRoID4gQ29uZmlnLm1heExpbmVXaWR0aFxuICAgICAgICBAbGluZVdpZHRoID0gQ29uZmlnLm1heExpbmVXaWR0aFxuXG4gICAgICBjb250ZXh0LmZpbGxTdHlsZSA9ICdyZ2JhKDI0NywgMjQ3LCAyNDcsIDAuOSknXG4gICAgICBjb250ZXh0LmxpbmVXaWR0aCA9IEBsaW5lV2lkdGhcblxuICAgIGNvbnRleHQuYmVnaW5QYXRoKClcbiAgICBjb250ZXh0LmFyYyhAcG9zaXRpb24ueCwgQHBvc2l0aW9uLnksIEBoYWxmLCAwLCBNYXRoLlBJICogMiwgdHJ1ZSlcbiAgICBjb250ZXh0LmZpbGwoKVxuICAgIGNvbnRleHQuc3Ryb2tlKCkgaWYgQGlzVGFyZ2V0XG4gICAgY29udGV4dC5jbG9zZVBhdGgoKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBvdXRzaWRlQ2FudmFzQm91bmRzOiAtPlxuXG4gICAgYmV5b25kQm91bmRzWCA9IEBwb3NpdGlvbi54IDwgLShAZmluYWxTaXplKSBvciBAcG9zaXRpb24ueCA+IGNhbnZhcy53aWR0aCAgKyBAZmluYWxTaXplXG4gICAgYmV5b25kQm91bmRzWSA9IEBwb3NpdGlvbi55IDwgLShAZmluYWxTaXplKSBvciBAcG9zaXRpb24ueSA+IGNhbnZhcy5oZWlnaHQgKyBAZmluYWxTaXplXG5cbiAgICByZXR1cm4gYmV5b25kQm91bmRzWCBvciBiZXlvbmRCb3VuZHNZXG5cbiAgdXBkYXRlVmFsdWVzOiAtPlxuXG4gICAgaWYgQGRlc3Ryb3lpbmdcbiAgICAgIHNocmlua011bHRpcGxpZXIgPSBpZiBQbGF5U3RhdGUucGxheWluZyB0aGVuIDAuNyBlbHNlIDAuOVxuXG4gICAgICBAc2l6ZSAqPSBzaHJpbmtNdWx0aXBsaWVyXG4gICAgZWxzZVxuICAgICAgaWYgQHNpemUgPCBAZmluYWxTaXplXG4gICAgICAgIEBzaXplICo9IFBsYXlTdGF0ZS5idWJibGVHcm93dGhNdWx0aXBsaWVyXG5cbiAgICAgIGlmIEBzaXplID4gQGZpbmFsU2l6ZVxuICAgICAgICBAc2l6ZSA9IEBmaW5hbFNpemVcblxuICAgIEBoYWxmID0gQHNpemUgLyAyXG5cbiAgICBAcG9zaXRpb24ueCArPSBAdmVsb2NpdHkueFxuICAgIEBwb3NpdGlvbi55ICs9IEB2ZWxvY2l0eS55XG5cbiAgICBAZHJhdygpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHdhc1RhcHBlZDogKHRvdWNoRGF0YSkgLT5cblxuICAgIHRhcFggICAgICA9IHRvdWNoRGF0YS5wYWdlWCAqIGRldmljZVBpeGVsUmF0aW9cbiAgICB0YXBZICAgICAgPSB0b3VjaERhdGEucGFnZVkgKiBkZXZpY2VQaXhlbFJhdGlvXG4gICAgZGlzdGFuY2VYID0gdGFwWCAtIEBwb3NpdGlvbi54XG4gICAgZGlzdGFuY2VZID0gdGFwWSAtIEBwb3NpdGlvbi55XG4gICAgcmFkaXVzICAgID0gQGhhbGZcblxuICAgIHJldHVybiAoZGlzdGFuY2VYICogZGlzdGFuY2VYKSArIChkaXN0YW5jZVkgKiBkaXN0YW5jZVkpIDwgKEBoYWxmICogQGhhbGYpXG4iLCJcbmNsYXNzIEJ1YmJsZUdlbmVyYXRvckNsYXNzXG5cbiAgY29uc3RydWN0b3I6IC0+XG5cbiAgICBAYnViYmxlc0FycmF5ICAgICAgICAgPSBbXVxuICAgIEBidWJibGVzQXJyYXlJZHMgICAgICA9IFtdXG4gICAgQGJ1YmJsZXNUb0RlbGV0ZSAgICAgID0gW11cbiAgICBAYnViYmxlc1RvVGVzdEZvclRhcHMgPSBbXVxuXG4gICAgQGJ1YmJsZXNPcmlnaW4gPVxuICAgICAgeDogY2FudmFzLndpZHRoICAvIDJcbiAgICAgIHk6IGNhbnZhcy5oZWlnaHQgLyAyXG5cbiAgICBAcmVnaXN0ZXJCdWJibGVUYXBEZXRlY3Rpb25IYW5kbGVyKClcblxuICAgIHJldHVybiB0aGlzXG5cbiAgYW5pbWF0aW9uTG9vcEFjdGlvbnM6IC0+XG5cbiAgICBpZiBQbGF5U3RhdGUucGxheWluZ1xuICAgICAgQGdlbmVyYXRlQnViYmxlKClcblxuICAgIEB1cGRhdGVCdWJibGVzVmFsdWVzKClcbiAgICBAcmVtb3ZlQnViYmxlc0FmdGVyVGFwKClcblxuICAgIGlmIEBidWJibGVzVG9EZWxldGUubGVuZ3RoID4gMFxuICAgICAgQGRlc3Ryb3lCdWJibGVzT3V0c2lkZUNhbnZhc0JvdW5kcygpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIGRlc3Ryb3lCdWJibGVzT3V0c2lkZUNhbnZhc0JvdW5kczogLT5cblxuICAgIEBidWJibGVzVG9EZWxldGUubWFwIChidWJibGVJZCkgPT5cbiAgICAgIGJ1YmJsZUluZGV4ID0gQGJ1YmJsZXNBcnJheUlkcy5pbmRleE9mKGJ1YmJsZUlkKVxuICAgICAgYnViYmxlICAgICAgPSBAYnViYmxlc0FycmF5W2J1YmJsZUluZGV4XVxuXG4gICAgICBpZiBidWJibGU/XG4gICAgICAgIEBnYW1lT3ZlcigpIGlmIGJ1YmJsZS5pc1RhcmdldFxuICAgICAgICBAcmVtb3ZlQnViYmxlKGJ1YmJsZSlcblxuICAgIEBidWJibGVzVG9EZWxldGUgPSBbXVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBnYW1lT3ZlcjogLT5cblxuICAgIEBzdG9wKClcblxuICAgIEBidWJibGVzQXJyYXkubWFwIChidWJibGUpID0+XG4gICAgICBidWJibGUuZGVzdHJveWluZyA9IHRydWVcblxuICAgIFBsYXlTdGF0ZS5idWJibGVTcGF3bkNoYW5jZSA9IDBcblxuICAgIEdhbWUub3ZlcigpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIGdlbmVyYXRlQnViYmxlOiAtPlxuXG4gICAgaWYgVXRpbHMucmFuZG9tUGVyY2VudGFnZSgpIDwgUGxheVN0YXRlLmJ1YmJsZVNwYXduQ2hhbmNlXG4gICAgICBidWJibGUgPSBuZXcgQnViYmxlQ2xhc3MoKVxuXG4gICAgICBAYnViYmxlc0FycmF5LnB1c2goYnViYmxlKVxuICAgICAgQGJ1YmJsZXNBcnJheUlkcy5wdXNoKGJ1YmJsZS5pZClcblxuICAgICAgaWYgYnViYmxlLmlzVGFyZ2V0XG4gICAgICAgIEBidWJibGVzVG9UZXN0Rm9yVGFwcy51bnNoaWZ0KGJ1YmJsZS5pZClcblxuICAgIHJldHVybiB0aGlzXG5cbiAgYnViYmxlVGFwRGV0ZWN0aW9uSGFuZGxlcjogKCkgLT5cblxuICAgIHRhcmdldEhpdCA9IGZhbHNlXG4gICAgYnViYmxlICA9IGZhbHNlXG5cbiAgICBAYnViYmxlc1RvVGVzdEZvclRhcHMubWFwIChidWJibGVJZCkgPT5cbiAgICAgIGJ1YmJsZUluZGV4ID0gQGJ1YmJsZXNBcnJheUlkcy5pbmRleE9mKGJ1YmJsZUlkKVxuICAgICAgYnViYmxlICAgICAgPSBAYnViYmxlc0FycmF5W2J1YmJsZUluZGV4XVxuICAgICAgdG91Y2hEYXRhICAgICA9IElucHV0LmdldFRvdWNoRGF0YShldmVudClcblxuICAgICAgaWYgYnViYmxlPyBhbmQgYnViYmxlLndhc1RhcHBlZCh0b3VjaERhdGEpXG4gICAgICAgIGRlbGV0aW9uSW5kZXggICAgICAgPSBAYnViYmxlc1RvVGVzdEZvclRhcHMuaW5kZXhPZihidWJibGVJZClcbiAgICAgICAgYnViYmxlLmRlc3Ryb3lpbmcgPSB0cnVlXG4gICAgICAgIHRhcmdldEhpdCAgICAgICAgICAgPSB0cnVlXG5cbiAgICAgICAgQGJ1YmJsZXNUb1Rlc3RGb3JUYXBzLnNwbGljZShkZWxldGlvbkluZGV4LCAxKVxuXG4gICAgICAgIHJldHVyblxuXG4gICAgUGxheVN0YXRlLnVwZGF0ZUNvbWJvTXVsdGlwbGllcih0YXJnZXRIaXQpXG5cbiAgICBQbGF5U3RhdGUudXBkYXRlU2NvcmUoYnViYmxlLnNpemUsIGJ1YmJsZS5maW5hbFNpemUpIGlmIHRhcmdldEhpdFxuXG4gICAgcmV0dXJuIHRoaXNcblxuICByZWdpc3RlckJ1YmJsZVRhcERldGVjdGlvbkhhbmRsZXI6IC0+XG5cbiAgICBJbnB1dC5yZWdpc3RlckhhbmRsZXIgJy51aS1wbGF5aW5nJywgaW5wdXRWZXJiLCAtPlxuICAgICAgQnViYmxlR2VuZXJhdG9yLmJ1YmJsZVRhcERldGVjdGlvbkhhbmRsZXIoKVxuICAgICwgWydwbGF5aW5nJ11cblxuICAgIHJldHVybiB0aGlzXG5cbiAgcmVtb3ZlQnViYmxlOiAoYnViYmxlKSAtPlxuXG4gICAgaWQgICAgPSBidWJibGUuaWRcbiAgICBpbmRleCA9IEBidWJibGVzQXJyYXlJZHMuaW5kZXhPZihpZClcblxuICAgIEBidWJibGVzQXJyYXkuc3BsaWNlKGluZGV4LCAxKVxuICAgIEBidWJibGVzQXJyYXlJZHMuc3BsaWNlKGluZGV4LCAxKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICByZW1vdmVCdWJibGVzQWZ0ZXJUYXA6IC0+XG5cbiAgICBAYnViYmxlc0FycmF5Lm1hcCAoYnViYmxlKSA9PlxuICAgICAgQHJlbW92ZUJ1YmJsZShidWJibGUpIGlmIGJ1YmJsZS5zaXplIDwgMVxuXG4gICAgICByZXR1cm5cblxuICAgIHJldHVybiB0aGlzXG5cbiAgcmVzZXQ6IC0+XG5cbiAgICBAYnViYmxlc0FycmF5ICAgICAgICAgPSBbXVxuICAgIEBidWJibGVzQXJyYXlJZHMgICAgICA9IFtdXG4gICAgQGJ1YmJsZXNUb0RlbGV0ZSAgICAgID0gW11cbiAgICBAYnViYmxlc1RvVGVzdEZvclRhcHMgPSBbXVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBzdG9wOiAtPlxuXG4gICAgUGxheVN0YXRlLnVwZGF0ZShmYWxzZSlcbiAgICBQbGF5U3RhdGUuc3RvcExldmVsVXBJbmNyZW1lbnQoKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICB1cGRhdGVCdWJibGVzVmFsdWVzOiAtPlxuXG4gICAgQGJ1YmJsZXNBcnJheS5tYXAgKGJ1YmJsZSkgPT5cbiAgICAgIGNvbnRleHQuZmlsbFN0eWxlICAgPSBidWJibGUuY29sb3JcbiAgICAgIGNvbnRleHQuc3Ryb2tlU3R5bGUgPSBidWJibGUuY29sb3JcblxuICAgICAgYnViYmxlLnVwZGF0ZVZhbHVlcygpXG5cbiAgICAgIHJldHVyblxuXG4gICAgcmV0dXJuIHRoaXNcbiIsIlxuY2xhc3MgQ29uZmlnQ2xhc3NcblxuICBjaGFuY2VCdWJibGVJc1RhcmdldDpcbiAgICBlYXN5OiAgICAgIDUwXG4gICAgZGlmZmljdWx0OiA5MFxuXG4gIGxldmVsVXBJbnRlcnZhbDogNVxuXG4gIG1heExldmVsOiA1MFxuXG4gIG1heExpbmVXaWR0aDogNVxuXG4gIG1heFRhcmdldHNBdE9uY2U6XG4gICAgZWFzeTogICAgICAzXG4gICAgZGlmZmljdWx0OiA2XG5cbiAgYnViYmxlR3Jvd3RoTXVsdGlwbGllcjpcbiAgICBlYXN5OiAgICAgIDEuMDVcbiAgICBkaWZmaWN1bHQ6IDEuMTBcblxuICBidWJibGVTcGF3bkNoYW5jZTpcbiAgICBlYXN5OiAgICAgIDYwXG4gICAgZGlmZmljdWx0OiAxMDBcblxuICBidWJibGVEaWFtZXRlckFzUGVyY2VudGFnZU9mU2NyZWVuOiAxNVxuXG4gIHBvaW50c1BlclBvcDogMTBcblxuICBwcm9wZXJ0aWVzVG9VcGRhdGVXaXRoRGlmZmljdWx0eTogW1xuICAgICdidWJibGVTcGF3bkNoYW5jZSdcbiAgICAnY2hhbmNlQnViYmxlSXNUYXJnZXQnXG4gICAgJ2J1YmJsZUdyb3d0aE11bHRpcGxpZXInXG4gICAgJ3NpemVNYXgnXG4gICAgJ21heFRhcmdldHNBdE9uY2UnXG4gICAgJ21pblRhcmdldFNpemUnXG4gICAgJ3ZlbG9jaXR5TWluJ1xuICAgICd2ZWxvY2l0eU1heCdcbiAgICAndGFyZ2V0VmVsb2NpdHlNdWx0aXBsaWVyJ1xuICBdXG5cbiAgdGFyZ2V0VmVsb2NpdHlNdWx0aXBsaWVyOlxuICAgIGVhc3k6ICAgICAgMC4zXG4gICAgZGlmZmljdWx0OiAwLjVcblxuICB2ZWxvY2l0eU1pbjpcbiAgICBlYXN5OiAgICAgIC02XG4gICAgZGlmZmljdWx0OiAtMTBcblxuICB2ZWxvY2l0eU1heDpcbiAgICBlYXN5OiAgICAgIDZcbiAgICBkaWZmaWN1bHQ6IDEwXG5cbiAgY29uc3RydWN0b3I6IC0+XG5cbiAgICBiYXNlU2NyZWVuV2lkdGggPSBNYXRoLm1pbihib2R5LmNsaWVudFdpZHRoLCBib2R5LmNsaWVudEhlaWdodCkgLyAxMDBcbiAgICBiYXNlQnViYmxlV2lkdGggPSBNYXRoLnJvdW5kKGJhc2VTY3JlZW5XaWR0aCAqIEBidWJibGVEaWFtZXRlckFzUGVyY2VudGFnZU9mU2NyZWVuKVxuICAgIEBiYXNlQnViYmxlU2l6ZSA9IGJhc2VCdWJibGVXaWR0aCAqIGRldmljZVBpeGVsUmF0aW9cblxuICAgIEBtaW5UYXJnZXRTaXplID1cbiAgICAgIGVhc3k6ICAgICAgQGJhc2VCdWJibGVTaXplICogMC43XG4gICAgICBkaWZmaWN1bHQ6IEBiYXNlQnViYmxlU2l6ZSAqIDAuNFxuXG4gICAgQHNpemVNYXggPVxuICAgICAgZWFzeTogICAgICBAYmFzZUJ1YmJsZVNpemVcbiAgICAgIGRpZmZpY3VsdDogQGJhc2VCdWJibGVTaXplICogMC42XG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHVwZGF0ZVZhbHVlc0ZvckRpZmZpY3VsdHk6IC0+XG5cbiAgICBAcHJvcGVydGllc1RvVXBkYXRlV2l0aERpZmZpY3VsdHkubWFwIChwcm9wZXJ0eSkgPT5cbiAgICAgIHByb3BlcnR5Q29uZmlnICA9IEBbcHJvcGVydHldXG4gICAgICB2YWx1ZURpZmZlcmVuY2UgPSBwcm9wZXJ0eUNvbmZpZy5kaWZmaWN1bHQgLSBwcm9wZXJ0eUNvbmZpZy5lYXN5XG4gICAgICBsZXZlbE11bGl0cGxpZXIgPSBQbGF5U3RhdGUubGV2ZWwgLyBAbWF4TGV2ZWxcblxuICAgICAgUGxheVN0YXRlW3Byb3BlcnR5XSA9ICh2YWx1ZURpZmZlcmVuY2UgKiBsZXZlbE11bGl0cGxpZXIpICsgcHJvcGVydHlDb25maWcuZWFzeVxuXG4gICAgICByZXR1cm5cblxuICAgIHJldHVybiB0aGlzXG4iLCJcbmNsYXNzIERldmljZUNsYXNzXG5cbiAgY29uc3RydWN0b3I6IC0+XG5cbiAgICByZXR1cm4gdGhpc1xuIiwiXG5jbGFzcyBHYW1lQ2xhc3NcblxuICBjb25zdHJ1Y3RvcjogLT5cblxuICAgIFNjZW5lcy5pZGVudCgpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIG92ZXI6IC0+XG5cbiAgICBTY2VuZXMuZ2FtZU92ZXIoKVxuXG4gICAgUGxheVN0YXRlLnN0b3BMZXZlbFVwSW5jcmVtZW50KClcblxuICAgIHJldHVybiB0aGlzXG5cbiAgc3RhcnQ6IC0+XG5cbiAgICBQbGF5U3RhdGUucmVzZXQoKVxuICAgIFVJLnJlc2V0KClcbiAgICBJbnB1dC5yZW1vdmVHYW1lU3RhcnRUYXBFdmVudEhhbmRsZXIoKVxuICAgIEJ1YmJsZUdlbmVyYXRvci5yZXNldCgpXG5cbiAgICBTY2VuZXMucGxheWluZygpXG5cbiAgICByZXR1cm4gdGhpc1xuIiwiXG5jbGFzcyBJbnB1dENsYXNzXG5cbiAgY29uc3RydWN0b3I6IC0+XG5cbiAgICBAY2FuY2VsVG91Y2hNb3ZlRXZlbnRzKClcblxuICAgIGV2ZW50X2RldGFpbHMgPSB7XG4gICAgICBlbGVtZW50OiBVdGlscy4kKCcuZXZlbnRfZGV0YWlscyAuZWxlbWVudCcpXG4gICAgICBhY3Rpb246ICBVdGlscy4kKCcuZXZlbnRfZGV0YWlscyAuYWN0aW9uJylcbiAgICB9XG5cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciBpbnB1dFZlcmIsIChldmVudCkgLT5cbiAgICAgIGNvbnNvbGUubG9nIGV2ZW50XG4gICAgICBVdGlscy51cGRhdGVVSVRleHROb2RlKGV2ZW50X2RldGFpbHMuZWxlbWVudCwgZXZlbnQudGFyZ2V0Lm5vZGVOYW1lLnRvTG93ZXJDYXNlKCkpXG4gICAgICBVdGlscy51cGRhdGVVSVRleHROb2RlKGV2ZW50X2RldGFpbHMuYWN0aW9uLCAgZXZlbnQudHlwZSlcbiAgICAgIHJldHVyblxuICAgICwgZmFsc2VcblxuICAgIHJldHVybiB0aGlzXG5cbiAgY2FuY2VsVG91Y2hNb3ZlRXZlbnRzOiAtPlxuXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIgJ3RvdWNobW92ZScsIChldmVudCkgLT5cbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcblxuICAgICAgcmV0dXJuXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIGdhbWVTdGFydFRhcEV2ZW50SGFuZGxlcjogKCkgLT5cblxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcblxuICAgIEdhbWUuc3RhcnQoKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBnZXRUb3VjaERhdGE6IChldmVudCkgLT5cblxuICAgIGlmIHRvdWNoRGF0YVxuICAgICAgdGFwQ29vcmRpbmF0ZXMgPSBldmVudC50b3VjaGVzWzBdXG4gICAgZWxzZVxuICAgICAgdG91Y2hEYXRhID1cbiAgICAgICAgcGFnZVg6IGV2ZW50LmNsaWVudFgsXG4gICAgICAgIHBhZ2VZOiBldmVudC5jbGllbnRZXG5cbiAgICByZXR1cm4gdG91Y2hEYXRhXG5cbiAgcmVnaXN0ZXJIYW5kbGVyOiAoc2VsZWN0b3IsIGFjdGlvbiwgY2FsbGJhY2ssIHNjZW5lcykgLT5cblxuICAgIGNvbnNvbGUubG9nIFwiSW5wdXQucmVnc2l0ZXJIYW5kbGVyKCN7c2VsZWN0b3J9LCAje2FjdGlvbn0sICN7Y2FsbGJhY2t9LCAje3NjZW5lc30pXCJcblxuICAgIGlmIHR5cGVvZiBzY2VuZXMgPT0gJ3N0cmluZydcbiAgICAgIHNjZW5lICA9IHNjZW5lc1xuICAgICAgc2NlbmVzID0gW3NjZW5lXVxuXG4gICAgZWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpXG5cbiAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIgYWN0aW9uLCAoZXZlbnQpID0+XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICBjb25zb2xlLmxvZyBcIkNhbGxpbmcgI3thY3Rpb259IGlucHV0IG9uICN7ZWxlbWVudH0gaW4gI3tTY2VuZXMuY3VycmVudH0pXCJcbiAgICAgIGNhbGxiYWNrLmFwcGx5KCkgaWYgc2NlbmVzLmxlbmd0aCA9PSAwIHx8IFNjZW5lcy5jdXJyZW50IGluIHNjZW5lc1xuICAgICAgcmV0dXJuXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHJlbW92ZUdhbWVTdGFydFRhcEV2ZW50SGFuZGxlcjogLT5cblxuICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlRXZlbnRMaXN0ZW5lcihpbnB1dFZlcmIsIEBnYW1lU3RhcnRUYXBFdmVudEhhbmRsZXIpXG5cbiAgICByZXR1cm4gdGhpc1xuIiwiXG5jbGFzcyBQbGF5U3RhdGVDbGFzc1xuXG4gIGRlZmF1bHRzOlxuICAgIGNvbWJvTXVsdGlwbGllcjogMFxuICAgIGxldmVsOiAgICAgICAgICAgMVxuICAgIHNjb3JlOiAgICAgICAgICAgMFxuXG4gIHJlc2V0OiAtPlxuXG4gICAgQGNoYW5jZUJ1YmJsZUlzVGFyZ2V0ICAgICA9IENvbmZpZy5jaGFuY2VCdWJibGVJc1RhcmdldC5lYXN5XG4gICAgQGNvbWJvTXVsdGlwbGllciAgICAgICAgICA9IEBkZWZhdWx0cy5jb21ib011bHRpcGxpZXJcbiAgICBAbGV2ZWwgICAgICAgICAgICAgICAgICAgID0gQGRlZmF1bHRzLmxldmVsXG4gICAgQG1heFRhcmdldHNBdE9uY2UgICAgICAgICA9IENvbmZpZy5tYXhUYXJnZXRzQXRPbmNlLmVhc3lcbiAgICBAbWluVGFyZ2V0U2l6ZSAgICAgICAgICAgID0gQ29uZmlnLm1pblRhcmdldFNpemUuZWFzeVxuICAgIEBidWJibGVHcm93dGhNdWx0aXBsaWVyICAgPSBDb25maWcuYnViYmxlR3Jvd3RoTXVsdGlwbGllci5lYXN5XG4gICAgQGJ1YmJsZVNwYXduQ2hhbmNlICAgICAgICA9IENvbmZpZy5idWJibGVTcGF3bkNoYW5jZS5lYXN5XG4gICAgQHNjb3JlICAgICAgICAgICAgICAgICAgICA9IEBkZWZhdWx0cy5zY29yZVxuICAgIEBzaXplTWF4ICAgICAgICAgICAgICAgICAgPSBDb25maWcuc2l6ZU1heC5lYXN5XG4gICAgQHRhcmdldFZlbG9jaXR5TXVsdGlwbGllciA9IENvbmZpZy50YXJnZXRWZWxvY2l0eU11bHRpcGxpZXIuZWFzeVxuICAgIEB2ZWxvY2l0eU1pbiAgICAgICAgICAgICAgPSBDb25maWcudmVsb2NpdHlNaW4uZWFzeVxuICAgIEB2ZWxvY2l0eU1heCAgICAgICAgICAgICAgPSBDb25maWcudmVsb2NpdHlNYXguZWFzeVxuXG4gICAgQHVwZGF0ZSh0cnVlKVxuXG4gICAgQ29uZmlnLnVwZGF0ZVZhbHVlc0ZvckRpZmZpY3VsdHkoKVxuXG4gICAgQHNldHVwTGV2ZWxVcEluY3JlbWVudCgpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHN0b3BMZXZlbFVwSW5jcmVtZW50OiAtPlxuXG4gICAgd2luZG93LmNsZWFySW50ZXJ2YWwoQGxldmVsVXBDb3VudGVyKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBzZXR1cExldmVsVXBJbmNyZW1lbnQ6IC0+XG5cbiAgICBAbGV2ZWxVcENvdW50ZXIgPSB3aW5kb3cuc2V0SW50ZXJ2YWwgPT5cblxuICAgICAgQHVwZGF0ZUxldmVsKClcblxuICAgICAgcmV0dXJuXG5cbiAgICAsIENvbmZpZy5sZXZlbFVwSW50ZXJ2YWwgKiAxMDAwXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHVwZGF0ZUNvbWJvTXVsdGlwbGllcjogKHRhcmdldEhpdCkgLT5cblxuICAgIEBjb21ib011bHRpcGxpZXIgPSBpZiB0YXJnZXRIaXQgdGhlbiBAY29tYm9NdWx0aXBsaWVyICsgMSBlbHNlIEBkZWZhdWx0cy5jb21ib011bHRpcGxpZXJcblxuICAgIFVJLnVwZGF0ZUNvbWJvTXVsdGlwbGllckNvdW50ZXIoKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICB1cGRhdGU6IChuZXdTdGF0ZSkgLT5cblxuICAgIEBwbGF5aW5nID0gbmV3U3RhdGVcblxuICAgIHJldHVybiB0aGlzXG5cbiAgdXBkYXRlTGV2ZWw6IC0+XG5cbiAgICBAbGV2ZWwgKz0gMVxuXG4gICAgaWYgQGxldmVsID49IENvbmZpZy5tYXhMZXZlbFxuICAgICAgd2luZG93LmNsZWFySW50ZXJ2YWwoQGxldmVsVXBDb3VudGVyKVxuXG4gICAgVUkudXBkYXRlTGV2ZWxDb3VudGVyKClcbiAgICBDb25maWcudXBkYXRlVmFsdWVzRm9yRGlmZmljdWx0eSgpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHVwZGF0ZVNjb3JlOiAoc2l6ZVdoZW5UYXBwZWQsIHNpemVXaGVuRnVsbHlHcm93bikgLT5cblxuICAgICMoKGRlZmF1bHRTY29yZVBlclBvcCArICgxMDAgLSAoKHNpemVXaGVuVGFwcGVkIC8gc2l6ZVdoZW5GdWxseUdyb3duKSAqIDEwMCkpKSAqIGNvbWJvTXVsdGlwbGllcikgKiAobGV2ZWxOdW1iZXIgKyAxKVxuXG4gICAgdGFyZ2V0U2l6ZUJvbnVzID0gTWF0aC5yb3VuZCgxMDAgLSAoKHNpemVXaGVuVGFwcGVkIC8gc2l6ZVdoZW5GdWxseUdyb3duKSAqIDEwMCkpXG4gICAgcG9wUG9pbnRWYWx1ZSAgID0gQ29uZmlnLnBvaW50c1BlclBvcCArIHRhcmdldFNpemVCb251c1xuICAgIGxldmVsTXVsdGlwbGllciA9IEBsZXZlbCArIDFcblxuICAgIEBzY29yZSArPSAocG9wUG9pbnRWYWx1ZSAqIEBjb21ib011bHRpcGxpZXIpICogKGxldmVsTXVsdGlwbGllcilcblxuICAgIFVJLnVwZGF0ZVNjb3JlQ291bnRlcigpXG5cbiAgICByZXR1cm4gdGhpc1xuIiwiXG5jbGFzcyBTY2VuZXNDbGFzc1xuXG4gIEBjdXJyZW50ID0gbnVsbFxuXG4gIGNyZWRpdHM6IC0+XG5cbiAgICBAY3VycmVudCA9ICdjcmVkaXRzJ1xuXG4gICAgVUkudXBkYXRlQm9keUNsYXNzKCdjcmVkaXRzJylcblxuICAgIHJldHVybiB0aGlzXG5cbiAgZ2FtZU92ZXI6IC0+XG5cbiAgICBAY3VycmVudCA9ICdnYW1lLW92ZXInXG5cbiAgICBVSS51cGRhdGVCb2R5Q2xhc3MoJ2dhbWUtb3ZlcicpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIGxlYWRlcmJvYXJkOiAtPlxuXG4gICAgQGN1cnJlbnQgPSAnbGVhZGVyYm9hcmQnXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHBsYXlpbmc6IC0+XG5cbiAgICBAY3VycmVudCA9ICdwbGF5aW5nJ1xuXG4gICAgVUkudXBkYXRlQm9keUNsYXNzKCdwbGF5aW5nJylcblxuICAgIHJldHVybiB0aGlzXG5cbiAgaWRlbnQ6IC0+XG5cbiAgICBAY3VycmVudCA9ICdpZGVudCdcblxuICAgIFVJLnVwZGF0ZUJvZHlDbGFzcygnaWRlbnQnKVxuXG4gICAgd2luZG93LnNldFRpbWVvdXQgPT5cbiAgICAgIEB0aXRsZSgpXG4gICAgLCAyNTAwXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHRpdGxlOiAtPlxuXG4gICAgQGN1cnJlbnQgPSAndGl0bGUnXG5cbiAgICBVSS51cGRhdGVCb2R5Q2xhc3MoJ3RpdGxlJylcblxuICAgIHJldHVybiB0aGlzXG4iLCJcbmNsYXNzIFVJQ2xhc3NcblxuICBjb25zdHJ1Y3RvcjogLT5cblxuICAgIEBzZXR1cEJhc2ljSW50ZXJmYWNlRXZlbnRzKClcblxuICAgIHJldHVybiB0aGlzXG5cbiAgcmVzZXQ6IC0+XG5cbiAgICBAbGV2ZWxDb3VudGVyICAgICAgICAgICA9IFV0aWxzLiQoJy5odWQtdmFsdWUtbGV2ZWwnKVxuICAgIEBzY29yZUNvdW50ZXIgICAgICAgICAgID0gVXRpbHMuJCgnLmh1ZC12YWx1ZS1zY29yZScpXG4gICAgQGNvbWJvTXVsdGlwbGllckNvdW50ZXIgPSBVdGlscy4kKCcuaHVkLXZhbHVlLWNvbWJvJylcbiAgICBAcGxheUFnYWluICAgICAgICAgICAgICA9IFV0aWxzLiQoJy5wbGF5LWFnYWluJylcblxuICAgIEB1cGRhdGVDb21ib011bHRpcGxpZXJDb3VudGVyKClcbiAgICBAdXBkYXRlTGV2ZWxDb3VudGVyKClcbiAgICBAdXBkYXRlU2NvcmVDb3VudGVyKClcblxuICAgIHJldHVybiB0aGlzXG5cbiAgc2V0dXBCYXNpY0ludGVyZmFjZUV2ZW50czogLT5cblxuICAgIElucHV0LnJlZ2lzdGVySGFuZGxlciAnLmdhbWUtbG9nbycsIGlucHV0VmVyYiwgLT5cbiAgICAgIElucHV0LmdhbWVTdGFydFRhcEV2ZW50SGFuZGxlcigpXG4gICAgLCBbJ3RpdGxlJ11cblxuICAgIElucHV0LnJlZ2lzdGVySGFuZGxlciAnLnBsYXktYWdhaW4nLCBpbnB1dFZlcmIsIC0+XG4gICAgICBJbnB1dC5nYW1lU3RhcnRUYXBFdmVudEhhbmRsZXIoKVxuICAgICwgWydnYW1lLW92ZXInXVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICB1cGRhdGVCb2R5Q2xhc3M6IChjbGFzc05hbWUpIC0+XG5cbiAgICBib2R5LmNsYXNzTmFtZSA9ICcnXG4gICAgYm9keS5jbGFzc0xpc3QuYWRkKCdzY2VuZS0nICsgY2xhc3NOYW1lKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICB1cGRhdGVDb21ib011bHRpcGxpZXJDb3VudGVyOiAtPlxuXG4gICAgVXRpbHMudXBkYXRlVUlUZXh0Tm9kZShAY29tYm9NdWx0aXBsaWVyQ291bnRlciwgUGxheVN0YXRlLmNvbWJvTXVsdGlwbGllcilcblxuICAgIHJldHVybiB0aGlzXG5cbiAgdXBkYXRlTGV2ZWxDb3VudGVyOiAtPlxuXG4gICAgVXRpbHMudXBkYXRlVUlUZXh0Tm9kZShAbGV2ZWxDb3VudGVyLCBQbGF5U3RhdGUubGV2ZWwpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHVwZGF0ZVNjb3JlQ291bnRlcjogLT5cblxuICAgIHNjb3JlVG9Gb3JtYXQgPSBVdGlscy5mb3JtYXRXaXRoQ29tbWEoUGxheVN0YXRlLnNjb3JlKVxuXG4gICAgVXRpbHMudXBkYXRlVUlUZXh0Tm9kZShAc2NvcmVDb3VudGVyLCBzY29yZVRvRm9ybWF0KVxuXG4gICAgcmV0dXJuIHRoaXNcbiIsIlxuY2xhc3MgVXRpbHNDbGFzc1xuXG4gICQ6IChzZWxlY3RvcikgLT5cblxuICAgIHJldHVybiBkb2N1bWVudC5ib2R5IGlmIHNlbGVjdG9yID09IGJvZHlcbiAgICByZXR1cm4gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoc2VsZWN0b3IpIGlmIHNlbGVjdG9yLnN1YnN0cigwLCAxKSA9PSAnIydcblxuICAgIGVscyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpXG5cbiAgICByZXR1cm4gZWxzWzBdIGlmIGVscy5sZW5ndGggPT0gMVxuXG4gICAgcmV0dXJuIGVsc1xuXG4gIGNvcnJlY3RWYWx1ZUZvckRQUjogKHZhbHVlLCBpbnRlZ2VyID0gZmFsc2UpIC0+XG5cbiAgICB2YWx1ZSAqPSBkZXZpY2VQaXhlbFJhdGlvXG5cbiAgICB2YWx1ZSA9IE1hdGgucm91bmQodmFsdWUpIGlmIGludGVnZXJcblxuICAgIHJldHVybiB2YWx1ZVxuXG4gIGZvcm1hdFdpdGhDb21tYTogKG51bSkgLT5cblxuICAgIHJldHVybiBudW0udG9TdHJpbmcoKS5yZXBsYWNlKC9cXEIoPz0oXFxkezN9KSsoPyFcXGQpKS9nLCBcIixcIilcblxuICByYW5kb206IChtaW4sIG1heCkgLT5cblxuICAgIGlmIG1pbiA9PSB1bmRlZmluZWRcbiAgICAgIG1pbiA9IDBcbiAgICAgIG1heCA9IDFcbiAgICBlbHNlIGlmIG1heCA9PSB1bmRlZmluZWRcbiAgICAgIG1heCA9IG1pblxuICAgICAgbWluID0gMFxuXG4gICAgcmV0dXJuIChNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbikpICsgbWluO1xuXG4gIHJhbmRvbUNvbG9yOiAoYWxwaGEgPSBmYWxzZSkgLT5cblxuICAgIGNvbG9ycyA9XG4gICAgICByOiB0aGlzLnJhbmRvbUludGVnZXIoMCwgMjAwKVxuICAgICAgZzogdGhpcy5yYW5kb21JbnRlZ2VyKDAsIDIwMClcbiAgICAgIGI6IHRoaXMucmFuZG9tSW50ZWdlcigwLCAyMDApXG4gICAgICBhOiBpZiAhYWxwaGEgdGhlbiB0aGlzLnJhbmRvbSgwLjc1LCAxKSBlbHNlIGFscGhhXG5cbiAgICByZXR1cm4gJ3JnYmEoJyArIGNvbG9ycy5yICsgJywgJyArIGNvbG9ycy5nICsgJywgJyArIGNvbG9ycy5iICsgJywgJyArIGNvbG9ycy5hICsgJyknXG5cbiAgcmFuZG9tSW50ZWdlcjogKG1pbiwgbWF4KSAtPlxuXG4gICAgaWYgbWF4ID09IHVuZGVmaW5lZFxuICAgICAgbWF4ID0gbWluXG4gICAgICBtaW4gPSAwXG5cbiAgICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKG1heCArIDEgLSBtaW4pKSArIG1pblxuXG4gIHJhbmRvbVBlcmNlbnRhZ2U6IC0+XG5cbiAgICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTAwKVxuXG4gIHVwZGF0ZVVJVGV4dE5vZGU6IChlbGVtZW50LCB2YWx1ZSkgLT5cblxuICAgIGVsZW1lbnQuaW5uZXJIVE1MID0gdmFsdWVcblxuICAgIHJldHVybiB0aGlzXG4iLCJcbmRlYnVnID0gdHJ1ZVxuXG5hbmRyb2lkICAgICAgICA9IGlmIG5hdmlnYXRvci51c2VyQWdlbnQubWF0Y2goL2FuZHJvaWQvaSkgdGhlbiB0cnVlIGVsc2UgZmFsc2VcbmJvZHkgICAgICAgICAgID0gZG9jdW1lbnQuYm9keVxuY2FudmFzICAgICAgICAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuY2FudmFzJylcbmhhc1RvdWNoRXZlbnRzID0gd2luZG93Lmhhc093blByb3BlcnR5KCdvbnRvdWNoc3RhcnQnKSB8fCB3aW5kb3cuaGFzT3duUHJvcGVydHkoJ29ubXNnZXN0dXJlY2hhbmdlJylcbmlucHV0VmVyYiAgICAgID0gaWYgaGFzVG91Y2hFdmVudHMgdGhlbiAndG91Y2hzdGFydCcgZWxzZSAnY2xpY2snXG5cbmNhbnZhcy5jbGFzc05hbWUgPSAnY2FudmFzJ1xuY2FudmFzLndpZHRoICAgICA9IGJvZHkuY2xpZW50V2lkdGhcbmNhbnZhcy5oZWlnaHQgICAgPSBib2R5LmNsaWVudEhlaWdodFxuXG5jb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoJzJkJylcblxuY29udGV4dC5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb24gPSAnc291cmNlLWF0b3AnXG5cbmRldmljZVBpeGVsUmF0aW8gID0gd2luZG93LmRldmljZVBpeGVsUmF0aW8gfHwgMVxuYmFja2luZ1N0b3JlUmF0aW8gPSBjb250ZXh0LndlYmtpdEJhY2tpbmdTdG9yZVBpeGVsUmF0aW8gfHwgY29udGV4dC5iYWNraW5nU3RvcmVQaXhlbFJhdGlvIHx8IDFcbnJhdGlvICAgICAgICAgICAgID0gZGV2aWNlUGl4ZWxSYXRpbyAvIGJhY2tpbmdTdG9yZVJhdGlvXG5cbmlmIGRldmljZVBpeGVsUmF0aW8gIT0gYmFja2luZ1N0b3JlUmF0aW9cbiAgb2xkV2lkdGggID0gY2FudmFzLndpZHRoXG4gIG9sZEhlaWdodCA9IGNhbnZhcy5oZWlnaHRcblxuICBjYW52YXMud2lkdGggID0gb2xkV2lkdGggICogcmF0aW9cbiAgY2FudmFzLmhlaWdodCA9IG9sZEhlaWdodCAqIHJhdGlvXG5cbiAgY2FudmFzLnN0eWxlLndpZHRoICA9IFwiI3tvbGRXaWR0aH1weFwiXG4gIGNhbnZhcy5zdHlsZS5oZWlnaHQgPSBcIiN7b2xkSGVpZ2h0fXB4XCJcblxuICBjb250ZXh0LnNjYWxlKHJhdGlvLCByYXRpbylcblxuIyBTZXQgZW52aXJvbm1lbnQgYW5kIGJhc2UgY29uZmlnIGV0Y1xuRGV2aWNlICAgICAgICAgID0gbmV3IERldmljZUNsYXNzKClcblV0aWxzICAgICAgICAgICA9IG5ldyBVdGlsc0NsYXNzKClcbkNvbmZpZyAgICAgICAgICA9IG5ldyBDb25maWdDbGFzcygpXG5JbnB1dCAgICAgICAgICAgPSBuZXcgSW5wdXRDbGFzcygpXG5cbiMgTG9hZCB0aGUgZ2FtZSBsb2dpYyBhbmQgYWxsIHRoYXRcbkJ1YmJsZUdlbmVyYXRvciA9IG5ldyBCdWJibGVHZW5lcmF0b3JDbGFzcygpXG5QbGF5U3RhdGUgICAgICAgPSBuZXcgUGxheVN0YXRlQ2xhc3MoKVxuVUkgICAgICAgICAgICAgID0gbmV3IFVJQ2xhc3MoKVxuU2NlbmVzICAgICAgICAgID0gbmV3IFNjZW5lc0NsYXNzKClcblxuIyBTZXQgb2ZmIHRoZSBjYW52YXMgYW5pbWF0aW9uIGxvb3BcbkFuaW1hdGlvbkxvb3AgICA9IG5ldyBBbmltYXRpb25Mb29wQ2xhc3MoKVxuXG4jIFN0YXJ0IHRoZSBhY3R1YWwgZ2FtZVxuR2FtZSAgICAgICAgICAgID0gbmV3IEdhbWVDbGFzcygpXG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=