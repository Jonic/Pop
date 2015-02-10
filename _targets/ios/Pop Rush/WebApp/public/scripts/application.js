var $, calcSpeed, correctValueForDPR, debugConsole, formatWithComma, random, randomColor, randomInteger, randomPercentage, rgba, updateUITextNode;

$ = function(selector) {
  var els;
  if (selector === 'body') {
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

debugConsole = function(content) {
  var element;
  element = $('.debugConsole');
  updateUITextNode(element, content);
  console.log(content);
};

calcSpeed = function(speed, delta) {
  return (speed * delta) * (60 / 1000);
};

correctValueForDPR = function(value, integer) {
  if (integer == null) {
    integer = false;
  }
  value *= devicePixelRatio;
  if (integer) {
    value = Math.round(value);
  }
  return value;
};

formatWithComma = function(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

random = function(min, max) {
  if (min === void 0) {
    min = 0;
    max = 1;
  } else if (max === void 0) {
    max = min;
    min = 0;
  }
  return (Math.random() * (max - min)) + min;
};

randomColor = function() {
  var b, g, r;
  r = this.randomInteger(0, 200);
  g = this.randomInteger(0, 200);
  b = this.randomInteger(0, 200);
  return "" + r + ", " + g + ", " + b;
};

randomInteger = function(min, max) {
  if (max === void 0) {
    max = min;
    min = 0;
  }
  return Math.floor(Math.random() * (max + 1 - min)) + min;
};

randomPercentage = function() {
  return Math.floor(Math.random() * 100);
};

rgba = function(color, alpha) {
  if (!alpha) {
    alpha = 1;
  }
  return "rgba(" + color + ", " + alpha + ")";
};

updateUITextNode = function(element, value) {
  element.innerHTML = value;
  return this;
};

var AnimationLoopHelper;

AnimationLoopHelper = (function() {
  function AnimationLoopHelper() {}

  AnimationLoopHelper.prototype.load = function() {
    this.animationLoopId = null;
    this.delta = 0;
    this.fps = 0;
    this.lastTime = 0;
    return this;
  };

  AnimationLoopHelper.prototype.start = function() {
    this.frame();
    return this;
  };

  AnimationLoopHelper.prototype.stop = function() {
    window.cancelAnimationFrame(this.animationLoopId);
    return this;
  };

  AnimationLoopHelper.prototype.frame = function(now) {
    this.delta = now - this.lastTime;
    this.fps = Math.round(1000 / this.delta);
    this.lastTime = now;
    App.update(this.delta);
    this.animationLoopId = window.requestAnimationFrame((function(_this) {
      return function(now) {
        _this.frame(now);
      };
    })(this));
    return this;
  };

  return AnimationLoopHelper;

})();

var CanvasHelper;

CanvasHelper = (function() {
  function CanvasHelper() {}

  CanvasHelper.prototype.load = function() {
    this.device = App.getHelper('device');
    console.log(this.device);
    this.input = App.getHelper('input');
    this.elementSelector = '.canvas';
    this.createCanvas();
    return this;
  };

  CanvasHelper.prototype.clear = function() {
    this.context.clearRect(0, 0, this.element.width, this.element.height);
    return this;
  };

  CanvasHelper.prototype.createCanvas = function() {
    this.element = document.querySelector(this.elementSelector);
    this.element.height = this.device.screen.height;
    this.element.width = this.device.screen.width;
    this.element.realHeight = this.element.height;
    this.element.realWidth = this.element.width;
    this.context = this.element.getContext('2d');
    this.context.globalCompositeOperation = 'source-atop';
    this.scaleCanvas();
    this.input.addCanvasTapEventListener(this.elementSelector);
    return this;
  };

  CanvasHelper.prototype.scaleCanvas = function() {
    var backingStoreRatio, oldHeight, oldWidth, ratio;
    backingStoreRatio = this.context.webkitBackingStorePixelRatio || this.context.backingStorePixelRatio || 1;
    if (this.device.pixelRatio !== backingStoreRatio) {
      ratio = this.device.pixelRatio / backingStoreRatio;
      oldWidth = this.element.width;
      oldHeight = this.element.height;
      this.element.width = oldWidth * ratio;
      this.element.height = oldHeight * ratio;
      this.element.style.width = "" + oldWidth + "px";
      this.element.style.height = "" + oldHeight + "px";
      this.context.scale(ratio, ratio);
    }
    return this;
  };

  return CanvasHelper;

})();

var ConfigHelper;

ConfigHelper = (function() {
  function ConfigHelper() {}

  ConfigHelper.prototype.load = function() {
    this.values = {};
    return this;
  };

  ConfigHelper.prototype.console = function(path) {
    debugConsole(this.get(path));
    return this;
  };

  ConfigHelper.prototype.dump = function(path) {
    var dumping;
    dumping = this.values;
    if (path) {
      dumping = "Config." + path + ": " + (this.get(path));
    }
    console.log(dumping);
    return this;
  };

  ConfigHelper.prototype.get = function(path) {
    var array, index, key, nextKey, value, _i, _len;
    path = path.split('.');
    array = this.values;
    for (index = _i = 0, _len = path.length; _i < _len; index = ++_i) {
      key = path[index];
      nextKey = path[index + 1];
      if (nextKey != null) {
        array = array[key];
      } else {
        value = array[key];
      }
    }
    if (value != null) {
      return value;
    }
  };

  ConfigHelper.prototype.set = function(path, value) {
    var array, index, key, nextKey, _i, _len;
    path = path.split('.');
    array = this.values;
    for (index = _i = 0, _len = path.length; _i < _len; index = ++_i) {
      key = path[index];
      nextKey = path[index + 1];
      if (!array[key]) {
        if (nextKey != null) {
          array[key] = {};
        } else {
          array[key] = value;
        }
      }
      array = array[key];
    }
    return this;
  };

  return ConfigHelper;

})();

var DeviceHelper;

DeviceHelper = (function() {
  function DeviceHelper() {
    this.screen = {
      height: document.body.clientHeight,
      width: document.body.clientWidth
    };
    this.android = navigator.userAgent.match(/android/i) ? true : false;
    this.ios = !this.android;
    this.hasTouchEvents = window.hasOwnProperty('ontouchstart') || window.hasOwnProperty('onmsgesturechange');
    this.pixelRatio = window.devicePixelRatio || 1;
    return this;
  }

  return DeviceHelper;

})();

var InputHelper;

InputHelper = (function() {
  function InputHelper() {}

  InputHelper.prototype.load = function() {
    this.device = App.getHelper('device');
    this.cancelTouchMoveEvents();
    this.setupConsole();
    return this;
  };

  InputHelper.prototype.addCanvasTapEventListener = function() {
    this.addEventListener(this.elementSelector, 'click', this.testEntitiesForTaps);
    return this;
  };

  InputHelper.prototype.addEventListener = function(selector, type, callback, consoleOutput) {
    if (selector == null) {
      selector = 'body';
    }
    if (consoleOutput == null) {
      consoleOutput = false;
    }
    type = this.convertClickToTouch(type);
    if (consoleOutput) {
      debugConsole("Input.addEventListener(" + selector + ", " + type + ", " + callback + ")");
    }
    $(selector).addEventListener(type, callback, false);
    return this;
  };

  InputHelper.prototype.cancelTouchMoveEvents = function() {
    window.addEventListener('touchmove', function(event) {
      event.preventDefault();
    });
    return this;
  };

  InputHelper.prototype.convertClickToTouch = function(type) {
    if (type === 'click' && this.device.hasTouchEvents) {
      return 'touchstart';
    } else {
      return type;
    }
  };

  InputHelper.prototype.getTouchData = function(event) {
    var touchData;
    if (this.device.hasTouchEvents) {
      touchData = {
        x: event.touches[0].pageX,
        y: event.touches[0].pageY
      };
    } else {
      touchData = {
        x: event.clientX,
        y: event.clientY
      };
    }
    return touchData;
  };

  InputHelper.prototype.removeEventListener = function(selector, type, callback) {
    if (selector == null) {
      selector = 'body';
    }
    type = this.convertClickToTouch(type);
    debugConsole("Input.removeEventListener(" + selector + ", " + type + ", " + callback + ")");
    $(selector).removeEventListener(type, callback, false);
    return this;
  };

  InputHelper.prototype.setupConsole = function() {
    this.addEventListener('body', 'click', function(event) {
      var classList, id, node, type;
      type = event.type;
      node = event.target.nodeName.toLowerCase();
      id = event.target.id || 'n/a';
      classList = event.target.classList || 'n/a';
      debugConsole("" + type + " on " + node + " - id: " + id + " - class: " + classList);
    });
    return this;
  };

  InputHelper.prototype.testEntitiesForTaps = function() {
    return this;
  };

  return InputHelper;

})();

var RendererHelper;

RendererHelper = (function() {
  function RendererHelper() {}

  RendererHelper.prototype.load = function() {
    this.renderStack = [];
    return this;
  };

  RendererHelper.prototype.enqueue = function(entity) {
    this.renderStack.push(entity);
    return this;
  };

  RendererHelper.prototype.process = function() {
    var entity, _i, _len, _ref;
    _ref = this.renderStack;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      entity = _ref[_i];
      if (entity.isInsideCanvasBounds()) {
        entity.render();
      }
    }
    this.reset();
    return this;
  };

  RendererHelper.prototype.reset = function() {
    this.renderStack = [];
    return this;
  };

  return RendererHelper;

})();

var UserInterfaceHelper;

UserInterfaceHelper = (function() {
  function UserInterfaceHelper() {}

  UserInterfaceHelper.prototype.load = function() {
    this.elements = {};
    return this;
  };

  UserInterfaceHelper.prototype.element = function(name) {
    return this.elements[name];
  };

  UserInterfaceHelper.prototype.removeAllElements = function(sceneName) {
    this.elements = {};
    return this;
  };

  UserInterfaceHelper.prototype.registerElement = function(name, selector) {
    this.elements[name] = $(selector);
    return this;
  };

  UserInterfaceHelper.prototype.removeElement = function(name) {
    if (this.elements[name] != null) {
      delete this.elements[name];
    }
    return this;
  };

  UserInterfaceHelper.prototype.transitionTo = function(targetScene, instant) {
    if (instant == null) {
      instant = false;
    }
    if ((App.currentScene != null) && typeof App.currentScene.unload === 'function') {
      App.scenes[currentScene].unload();
      this.updateBodyClass("scene-" + targetScene + "-out");
    }
    App.scenes[targetScene].load();
    App.currentScene = targetScene;
    this.updateBodyClass("scene-" + targetScene);
    return this;
  };

  UserInterfaceHelper.prototype.updateBodyClass = function(className) {
    document.body.className = '';
    document.body.classList.add(className);
    return this;
  };

  return UserInterfaceHelper;

})();

var Application;

Application = (function() {
  function Application() {
    this.currentScene = null;
    this.delta = 0;
    this.scenes = {};
    return this;
  }

  Application.prototype.load = function() {
    this.initHelpers();
    this.initScenes();
    this.helpers.animationLoop.start();
    this.helpers.ui.transitionTo('ident');
    return this;
  };

  Application.prototype.initHelpers = function() {
    var helperClass, helperName, _ref;
    this.helpers = {
      animationLoop: new AnimationLoopHelper(),
      canvas: new CanvasHelper(),
      config: new ConfigHelper(),
      device: new DeviceHelper(),
      input: new InputHelper(),
      renderer: new RendererHelper(),
      ui: new UserInterfaceHelper()
    };
    _ref = this.helpers;
    for (helperName in _ref) {
      helperClass = _ref[helperName];
      if (helperClass.load != null) {
        helperClass.load();
      }
    }
    return this;
  };

  Application.prototype.initScenes = function() {
    this.scenes = {
      ident: new IdentScene(),
      playing: new PlayingScene(),
      title: new TitleScene()
    };
    return this;
  };

  Application.prototype.getHelper = function(name) {
    return this.helpers[name];
  };

  Application.prototype.update = function(delta) {
    this.delta = delta;
    if (this.currentScene != null) {
      this.helpers.canvas.clear();
      this.scenes[this.currentScene].update();
      this.helpers.renderer.process();
    }
    return this;
  };

  return Application;

})();

var Entity;

Entity = (function() {
  function Entity() {
    this.canvas = App.getHelper('canvas');
    this.config = App.getHelper('config');
    this.device = App.getHelper('device');
    this.renderer = App.getHelper('renderer');
    this.id = null;
    this.parent = null;
    this.removeOnCanvasExit = true;
    this.height = 0;
    this.width = 0;
    this.position = {
      x: 0,
      y: 0
    };
    this.velocity = {
      x: 0,
      y: 0
    };
    return this;
  }

  Entity.prototype.addSelfToRenderQueue = function() {
    this.renderer.enqueue(this);
    return this;
  };

  Entity.prototype.canvasExitCallback = function() {
    this.removeSelfFromParent();
    return this;
  };

  Entity.prototype.isInsideCanvasBounds = function() {
    return !this.isOutsideCanvasBounds();
  };

  Entity.prototype.isOutsideCanvasBounds = function() {
    var outsideBottom, outsideLeft, outsideRight, outsideTop, outsideX, outsideY;
    outsideLeft = this.position.x < -this.width;
    outsideRight = this.position.x - this.width > this.canvas.element.realWidth;
    outsideX = outsideLeft || outsideRight;
    outsideTop = this.position.y < -this.height;
    outsideBottom = this.position.y - this.height > this.canvas.element.realWheight;
    outsideY = outsideTop || outsideBottom;
    return outsideX || outsideY;
  };

  Entity.prototype.removeSelfFromParent = function() {
    if (this.parent != null) {
      this.parent.removeEntity(this.id);
    }
    return this;
  };

  Entity.prototype.update = function() {
    if (this.outsideCanvasBouncds()) {
      if (this.canvasExitCallback != null) {
        this.canvasExitCallback();
      }
      if (this.removeOnCanvasExit) {
        this.removeSelfFromParent();
      }
    }
    return this;
  };

  return Entity;

})();

var Scene;

Scene = (function() {
  function Scene() {
    this.entitiesCount = 0;
    this.entity_ids = [];
    this.entities = [];
    return this;
  }

  Scene.prototype.addEntity = function(entity, unshift) {
    if (unshift != null) {
      this.entity_ids.unshift(entity.id);
      this.entities.unshift(entity);
    } else {
      this.entity_ids.push(entity.id);
      this.entities.push(entity);
    }
    this.entitiesCount += 1;
    return this;
  };

  Scene.prototype.load = function() {
    this.config = App.getHelper('config');
    this.device = App.getHelper('device');
    this.input = App.getHelper('input');
    this.ui = App.getHelper('ui');
    return this;
  };

  Scene.prototype.removeAllEntities = function() {
    this.entitiesCount = 0;
    this.entities = [];
    this.entity_ids = [];
    return this;
  };

  Scene.prototype.removeEntity = function(id) {
    var index;
    index = this.entity_ids.indexOf(id);
    this.entities.splice(index, 1);
    this.entity_ids.splice(index, 1);
    this.entitiesCount -= 1;
    return this;
  };

  Scene.prototype.unload = function() {
    this.removeAllEntities();
    return this;
  };

  Scene.prototype.update = function() {
    this.updateEntities();
    return this;
  };

  Scene.prototype.updateEntities = function() {
    var entity, _i, _len, _ref;
    _ref = this.entities;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      entity = _ref[_i];
      entity.update();
    }
    return this;
  };

  return Scene;

})();

var GameOverScene,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

GameOverScene = (function(_super) {
  __extends(GameOverScene, _super);

  function GameOverScene() {
    GameOverScene.__super__.constructor.apply(this, arguments);
    return this;
  }

  return GameOverScene;

})(Scene);

var IdentScene,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

IdentScene = (function(_super) {
  __extends(IdentScene, _super);

  function IdentScene() {
    IdentScene.__super__.constructor.apply(this, arguments);
    this.name = 'ident';
    return this;
  }

  IdentScene.prototype.load = function() {
    IdentScene.__super__.load.apply(this, arguments);
    window.setTimeout((function(_this) {
      return function() {
        return _this.ui.transitionTo('title');
      };
    })(this), 25);
    return this;
  };

  return IdentScene;

})(Scene);

var PlayingScene,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

PlayingScene = (function(_super) {
  __extends(PlayingScene, _super);

  function PlayingScene() {
    PlayingScene.__super__.constructor.apply(this, arguments);
    this.levelUpInterval = 5000;
    this.maxLevel = 50;
    this.name = 'playing';
    this.maxDiameterAsPercentageOfScreen = 15;
    this.maxLineWidth = 5;
    return this;
  }

  PlayingScene.prototype.load = function() {
    PlayingScene.__super__.load.apply(this, arguments);
    this.ui.registerElement('comboMultiplierCounter', '.hud-value-combo');
    this.ui.registerElement('levelCounter', '.hud-value-level');
    this.ui.registerElement('scoreCounter', '.hud-value-score');
    this.config.set('pointsPerPop', 10);
    this.comboMultiplier = 0;
    this.level = 1;
    this.score = 0;
    this.setupLevelUpIncrement();
    this.setHeadsUpValues();
    this.bubblesArray = [];
    this.bubblesArrayIds = [];
    this.bubblesToDelete = [];
    this.targetBubblesCount = 0;
    this.playing = true;
    this.setupDifficultyConfig();
    return this;
  };

  PlayingScene.prototype.gameOver = function() {
    this.stop();
    this.bubblesArray.map((function(_this) {
      return function(bubble) {
        return bubble.destroying = true;
      };
    })(this));
    this.config.set('bubbleSpawnChance', 0);
    this.stopLevelUpIncrement();
    return this;
  };

  PlayingScene.prototype.generateBubble = function() {
    var bubble, bubbleConfig;
    if (randomPercentage() < this.config.get('bubbleSpawnChance')) {
      bubbleConfig = this.newBubbleConfig();
      bubble = new BubbleEntity(this, bubbleConfig);
      this.addEntity(bubble, 'unshift');
      if (bubble.isTarget) {
        this.targetBubblesCount += 1;
      }
    }
    return this;
  };

  PlayingScene.prototype.newBubbleConfig = function() {
    return {
      bubbleGrowthMultiplier: this.config.get('bubbleGrowthMultiplier'),
      chanceBubbleIsTarget: this.config.get('chanceBubbleIsTarget'),
      maxLineWidth: this.maxLineWidth,
      maxTargetsAtOnce: this.config.get('maxTargetsAtOnce'),
      minTargetDiameter: this.config.get('minTargetDiameter'),
      targetBubblesCount: this.targetBubblesCount,
      playing: this.playing,
      diameterMax: this.config.get('diameterMax'),
      targetVelocityMultiplier: this.config.get('targetVelocityMultiplier'),
      velocityMax: this.config.get('velocityMax'),
      velocityMin: this.config.get('velocityMin')
    };
  };

  PlayingScene.prototype.setupDifficultyConfig = function() {
    var maxDiameter;
    maxDiameter = (this.device.screen.width / 100) * this.maxDiameterAsPercentageOfScreen;
    this.difficultyConfig = {
      bubbleGrowthMultiplier: {
        easy: 1.05,
        difficult: 1.10
      },
      bubbleSpawnChance: {
        easy: 60,
        difficult: 100
      },
      chanceBubbleIsTarget: {
        easy: 50,
        difficult: 90
      },
      maxTargetsAtOnce: {
        easy: 3,
        difficult: 6
      },
      minTargetDiameter: {
        easy: maxDiameter * 0.7,
        difficult: maxDiameter * 0.4
      },
      diameterMax: {
        easy: maxDiameter,
        difficult: maxDiameter * 0.6
      },
      targetVelocityMultiplier: {
        easy: 0.3,
        difficult: 0.5
      },
      velocityMax: {
        easy: 6,
        difficult: 10
      },
      velocityMin: {
        easy: -6,
        difficult: -10
      }
    };
    this.updateValuesForDifficulty();
    return this;
  };

  PlayingScene.prototype.setHeadsUpValues = function() {
    updateUITextNode(this.ui.element('comboMultiplierCounter'), this.comboMultiplier);
    updateUITextNode(this.ui.element('levelCounter'), this.level);
    updateUITextNode(this.ui.element('scoreCounter'), formatWithComma(this.score));
    return this;
  };

  PlayingScene.prototype.setupLevelUpIncrement = function() {
    this.levelUpCounter = window.setInterval((function(_this) {
      return function() {
        _this.updateLevel();
      };
    })(this), this.levelUpInterval);
    return this;
  };

  PlayingScene.prototype.stopLevelUpIncrement = function() {
    window.clearInterval(this.levelUpCounter);
    return this;
  };

  PlayingScene.prototype.update = function() {
    PlayingScene.__super__.update.apply(this, arguments);
    this.generateBubble();
    return this;
  };

  PlayingScene.prototype.updateComboMultiplier = function(targetHit) {
    this.comboMultiplier = targetHit ? this.comboMultiplier + 1 : this.defaults.comboMultiplier;
    return this;
  };

  PlayingScene.prototype.updateLevel = function() {
    this.level += 1;
    if (this.level >= this.maxLevel) {
      window.clearInterval(this.levelUpCounter);
    }
    this.setHeadsUpValues();
    this.updateValuesForDifficulty();
    return this;
  };

  PlayingScene.prototype.updateScore = function(sizeWhenTapped, sizeWhenFullyGrown) {
    var levelMultiplier, popPointValue, targetSizeBonus;
    targetSizeBonus = Math.round(100 - ((sizeWhenTapped / sizeWhenFullyGrown) * 100));
    popPointValue = Config.pointsPerPop + targetSizeBonus;
    levelMultiplier = this.level + 1;
    this.score += (popPointValue * this.comboMultiplier) * levelMultiplier;
    this.setHeadsUpValues();
    return this;
  };

  PlayingScene.prototype.updateValuesForDifficulty = function() {
    var adjustedValue, propertyName, propertyValues, valueDifference, _ref;
    _ref = this.difficultyConfig;
    for (propertyName in _ref) {
      propertyValues = _ref[propertyName];
      valueDifference = propertyValues.difficult - propertyValues.easy;
      adjustedValue = (valueDifference * this.level) + propertyValues.easy;
      this.config.set(propertyName, adjustedValue);
    }
    return this;
  };

  return PlayingScene;

})(Scene);

var TitleScene,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

TitleScene = (function(_super) {
  __extends(TitleScene, _super);

  function TitleScene() {
    TitleScene.__super__.constructor.apply(this, arguments);
    this.name = 'title';
    return this;
  }

  TitleScene.prototype.load = function() {
    TitleScene.__super__.load.apply(this, arguments);
    this.input.addEventListener('.game-logo', 'click', (function(_this) {
      return function() {
        _this.ui.transitionTo('playing');
      };
    })(this));
    return this;
  };

  TitleScene.prototype.unload = function() {
    TitleScene.__super__.unload.apply(this, arguments);
    return this;
  };

  return TitleScene;

})(Scene);

var BubbleEntity,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BubbleEntity = (function(_super) {
  __extends(BubbleEntity, _super);

  function BubbleEntity(parent, configValues) {
    BubbleEntity.__super__.constructor.apply(this, arguments);
    this.parent = parent;
    this.configValues = configValues;
    this.height = 0;
    this.id = "bubble_" + Math.random().toString(36).substr(2, 5);
    this.position = {
      x: this.device.screen.width / 2,
      y: this.device.screen.height / 2
    };
    this.velocity = {
      x: random(this.configValues.velocityMin, this.configValues.velocityMax),
      y: random(this.configValues.velocityMin, this.configValues.velocityMax)
    };
    this.width = 0;
    this.alpha = 0.75;
    this.color = randomColor();
    this.destroying = false;
    this.diameter = 1;
    this.finalDiameter = randomInteger(0, configValues.diameterMax);
    this.isTarget = this.determineTargetBubble();
    this.lineWidth = 0;
    this.radius = 0.5;
    if (this.isTarget) {
      this.alpha = 0.9;
      this.color = '247, 247, 247';
      this.finalDiameter = randomInteger(this.configValues.minTargetDiameter, this.configValues.diameterMax);
      this.velocity.x *= this.configValues.targetVelocityMultiplier;
      this.velocity.y *= this.configValues.targetVelocityMultiplier;
    }
    return this;
  }

  BubbleEntity.prototype.determineTargetBubble = function() {
    if (this.configValues.targetBubblesCount < this.configValues.maxTargetsAtOnce) {
      return randomPercentage() < this.configValues.chanceBubbleIsTarget;
    }
    return false;
  };

  BubbleEntity.prototype.render = function() {
    var context;
    context = this.canvas.context;
    context.fillStyle = rgba(this.color, this.alpha);
    context.strokeStyle = rgba(this.color, this.alpha);
    context.lineWidth = this.lineWidth;
    context.beginPath();
    context.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2, true);
    context.fill();
    if (this.isTarget) {
      context.stroke();
    }
    context.closePath();
    return this;
  };

  BubbleEntity.prototype.update = function() {
    var shrinkMultiplier;
    if (this.destroying) {
      shrinkMultiplier = this.configValues.playing ? 0.7 : 0.9;
      this.diameter *= shrinkMultiplier;
    } else {
      if (this.diameter < this.finalDiameter) {
        this.diameter *= this.configValues.bubbleGrowthMultiplier;
      }
      if (this.diameter > this.finalDiameter) {
        this.diameter = this.finalDiameter;
      }
    }
    if (this.isTarget) {
      this.lineWidth = this.diameter / 10;
      if (this.lineWidth > this.configValues.maxLineWidth) {
        this.lineWidth = this.configValues.maxLineWidth;
      }
    }
    this.height = this.diameter;
    this.width = this.diameter;
    this.radius = this.diameter / 2;
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    this.addSelfToRenderQueue();
    return this;
  };

  BubbleEntity.prototype.wasTapped = function(touchData) {
    var distanceX, distanceY, tapX, tapY, tapped;
    tapX = touchData.pageX * this.device.pixelRatio;
    tapY = touchData.pageY * this.device.pixelRatio;
    distanceX = tapX - this.position.x;
    distanceY = tapY - this.position.y;
    tapped = (distanceX * distanceX) + (distanceY * distanceY) < (this.radius * this.radius);
    if (tapped) {
      debugConsole("Bubble#" + this.id + " tapped at " + tapX + ", " + tapY);
    } else {
      debugConsole("Combo Broken!");
    }
    return tapped;
  };

  BubbleEntity.prototype.tapHandler = function() {
    parent.updateComboMultiplier(targetHit);
    if (targetHit) {
      parent.updateScore(bubble.diameter, bubble.finalDiameter);
    }
    return this;
  };

  return BubbleEntity;

})(Entity);

var App;

App = new Application();

App.load();


/*
callNativeApp = ->
  try
      webkit.messageHandlers.callbackHandler.postMessage("Hello from JavaScript")
  catch err
      console.log('The native context does not exist yet')

window.setTimeout ->
    callNativeApp()
, 1000
 */

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInV0aWxzLmNvZmZlZSIsIkFuaW1hdGlvbkxvb3BIZWxwZXIuY29mZmVlIiwiQ2FudmFzSGVscGVyLmNvZmZlZSIsIkNvbmZpZ0hlbHBlci5jb2ZmZWUiLCJEZXZpY2VIZWxwZXIuY29mZmVlIiwiSW5wdXRIZWxwZXIuY29mZmVlIiwiUmVuZGVyZXJIZWxwZXIuY29mZmVlIiwiVXNlckludGVyZmFjZUhlbHBlci5jb2ZmZWUiLCJBcHBsaWNhdGlvbi5jb2ZmZWUiLCJFbnRpdHkuY29mZmVlIiwiU2NlbmUuY29mZmVlIiwiR2FtZU92ZXJTY2VuZS5jb2ZmZWUiLCJJZGVudFNjZW5lLmNvZmZlZSIsIlBsYXlpbmdTY2VuZS5jb2ZmZWUiLCJUaXRsZVNjZW5lLmNvZmZlZSIsIkJ1YmJsZUVudGl0eS5jb2ZmZWUiLCJib290c3RyYXAuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLElBQUEsNklBQUE7O0FBQUEsQ0FBQSxHQUFJLFNBQUMsUUFBRCxHQUFBO0FBRUYsTUFBQSxHQUFBO0FBQUEsRUFBQSxJQUF3QixRQUFBLEtBQVksTUFBcEM7QUFBQSxXQUFPLFFBQVEsQ0FBQyxJQUFoQixDQUFBO0dBQUE7QUFFQSxFQUFBLElBQTRDLFFBQVEsQ0FBQyxNQUFULENBQWdCLENBQWhCLEVBQW1CLENBQW5CLENBQUEsS0FBeUIsR0FBckU7QUFBQSxXQUFPLFFBQVEsQ0FBQyxjQUFULENBQXdCLFFBQXhCLENBQVAsQ0FBQTtHQUZBO0FBQUEsRUFJQSxHQUFBLEdBQU0sUUFBUSxDQUFDLGdCQUFULENBQTBCLFFBQTFCLENBSk4sQ0FBQTtBQU1BLEVBQUEsSUFBaUIsR0FBRyxDQUFDLE1BQUosS0FBYyxDQUEvQjtBQUFBLFdBQU8sR0FBSSxDQUFBLENBQUEsQ0FBWCxDQUFBO0dBTkE7QUFRQSxTQUFPLEdBQVAsQ0FWRTtBQUFBLENBQUosQ0FBQTs7QUFBQSxZQVlBLEdBQWUsU0FBQyxPQUFELEdBQUE7QUFFYixNQUFBLE9BQUE7QUFBQSxFQUFBLE9BQUEs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QTs7QUFBQSx5QkFtR0EsVUFBQSxHQUFZLFNBQUEsR0FBQTtBQUVWLElBQUEsTUFBTSxDQUFDLHFCQUFQLENBQTZCLFNBQTdCLENBQUEsQ0FBQTtBQUNBLElBQUEsSUFBNkQsU0FBN0Q7QUFBQSxNQUFBLE1BQU0sQ0FBQyxXQUFQLENBQW1CLE1BQU0sQ0FBQyxRQUExQixFQUFvQyxNQUFNLENBQUMsYUFBM0MsQ0FBQSxDQUFBO0tBREE7QUFHQSxXQUFPLElBQVAsQ0FMVTtFQUFBLENBbkdaLENBQUE7O3NCQUFBOztHQUZ5QixPQUEzQixDQUFBOztBQ0NBLElBQUEsR0FBQTs7QUFBQSxHQUFBLEdBQVUsSUFBQSxXQUFBLENBQUEsQ0FBVixDQUFBOztBQUFBLEdBR0csQ0FBQyxJQUFKLENBQUEsQ0FIQSxDQUFBOztBQUtBO0FBQUE7Ozs7Ozs7Ozs7R0FMQSIsImZpbGUiOiJhcHBsaWNhdGlvbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIlxuJCA9IChzZWxlY3RvcikgLT5cblxuICByZXR1cm4gZG9jdW1lbnQuYm9keSBpZiBzZWxlY3RvciA9PSAnYm9keSdcblxuICByZXR1cm4gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoc2VsZWN0b3IpIGlmIHNlbGVjdG9yLnN1YnN0cigwLCAxKSA9PSAnIydcblxuICBlbHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKVxuXG4gIHJldHVybiBlbHNbMF0gaWYgZWxzLmxlbmd0aCA9PSAxXG5cbiAgcmV0dXJuIGVsc1xuXG5kZWJ1Z0NvbnNvbGUgPSAoY29udGVudCkgLT5cblxuICBlbGVtZW50ID0gJCgnLmRlYnVnQ29uc29sZScpXG5cbiAgdXBkYXRlVUlUZXh0Tm9kZShlbGVtZW50LCBjb250ZW50KVxuICBjb25zb2xlLmxvZyhjb250ZW50KVxuXG4gIHJldHVyblxuXG5jYWxjU3BlZWQgPSAoc3BlZWQsIGRlbHRhKSAtPlxuXG4gIHJldHVybiAoc3BlZWQgKiBkZWx0YSkgKiAoNjAgLyAxMDAwKVxuXG5jb3JyZWN0VmFsdWVGb3JEUFIgPSAodmFsdWUsIGludGVnZXIgPSBmYWxzZSkgLT5cblxuICB2YWx1ZSAqPSBkZXZpY2VQaXhlbFJhdGlvXG5cbiAgdmFsdWUgPSBNYXRoLnJvdW5kKHZhbHVlKSBpZiBpbnRlZ2VyXG5cbiAgcmV0dXJuIHZhbHVlXG5cbmZvcm1hdFdpdGhDb21tYSA9IChudW0pIC0+XG5cbiAgcmV0dXJuIG51bS50b1N0cmluZygpLnJlcGxhY2UoL1xcQig/PShcXGR7M30pKyg/IVxcZCkpL2csIFwiLFwiKVxuXG5yYW5kb20gPSAobWluLCBtYXgpIC0+XG5cbiAgaWYgbWluID09IHVuZGVmaW5lZFxuICAgIG1pbiA9IDBcbiAgICBtYXggPSAxXG4gIGVsc2UgaWYgbWF4ID09IHVuZGVmaW5lZFxuICAgIG1heCA9IG1pblxuICAgIG1pbiA9IDBcblxuICByZXR1cm4gKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluKSkgKyBtaW47XG5cbnJhbmRvbUNvbG9yID0gKCkgLT5cblxuICByID0gdGhpcy5yYW5kb21JbnRlZ2VyKDAsIDIwMClcbiAgZyA9IHRoaXMucmFuZG9tSW50ZWdlcigwLCAyMDApXG4gIGIgPSB0aGlzLnJhbmRvbUludGVnZXIoMCwgMjAwKVxuXG4gIHJldHVybiBcIiN7cn0sICN7Z30sICN7Yn1cIlxuXG5yYW5kb21JbnRlZ2VyID0gKG1pbiwgbWF4KSAtPlxuXG4gIGlmIG1heCA9PSB1bmRlZmluZWRcbiAgICBtYXggPSBtaW5cbiAgICBtaW4gPSAwXG5cbiAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChtYXggKyAxIC0gbWluKSkgKyBtaW5cblxucmFuZG9tUGVyY2VudGFnZSA9IC0+XG5cbiAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDEwMClcblxucmdiYSA9IChjb2xvciwgYWxwaGEpIC0+XG5cbiAgYWxwaGEgPSAxIGlmICFhbHBoYVxuXG4gIHJldHVybiBcInJnYmEoI3tjb2xvcn0sICN7YWxwaGF9KVwiXG5cbnVwZGF0ZVVJVGV4dE5vZGUgPSAoZWxlbWVudCwgdmFsdWUpIC0+XG5cbiAgZWxlbWVudC5pbm5lckhUTUwgPSB2YWx1ZVxuXG4gIHJldHVybiB0aGlzXG4iLCJcbmNsYXNzIEFuaW1hdGlvbkxvb3BIZWxwZXJcblxuICBsb2FkOiAtPlxuXG4gICAgQGFuaW1hdGlvbkxvb3BJZCA9IG51bGxcbiAgICBAZGVsdGEgICAgICAgICAgID0gMFxuICAgIEBmcHMgICAgICAgICAgICAgPSAwXG4gICAgQGxhc3RUaW1lICAgICAgICA9IDBcblxuICAgIHJldHVybiB0aGlzXG5cbiAgc3RhcnQ6IC0+XG5cbiAgICBAZnJhbWUoKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBzdG9wOiAtPlxuXG4gICAgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lKEBhbmltYXRpb25Mb29wSWQpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIGZyYW1lOiAobm93KSAtPlxuXG4gICAgQGRlbHRhICAgID0gbm93IC0gQGxhc3RUaW1lXG4gICAgQGZwcyAgICAgID0gTWF0aC5yb3VuZCgxMDAwIC8gQGRlbHRhKVxuICAgIEBsYXN0VGltZSA9IG5vd1xuXG4gICAgQXBwLnVwZGF0ZShAZGVsdGEpXG5cbiAgICBAYW5pbWF0aW9uTG9vcElkID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSAobm93KSA9PlxuICAgICAgQGZyYW1lKG5vdylcbiAgICAgIHJldHVyblxuXG4gICAgcmV0dXJuIHRoaXNcbiIsIlxuY2xhc3MgQ2FudmFzSGVscGVyXG5cbiAgbG9hZDogLT5cblxuICAgIEBkZXZpY2UgPSBBcHAuZ2V0SGVscGVyKCdkZXZpY2UnKVxuICAgIGNvbnNvbGUubG9nKEBkZXZpY2UpXG4gICAgQGlucHV0ICA9IEFwcC5nZXRIZWxwZXIoJ2lucHV0JylcblxuICAgIEBlbGVtZW50U2VsZWN0b3IgPSAnLmNhbnZhcydcblxuICAgIEBjcmVhdGVDYW52YXMoKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBjbGVhcjogLT5cblxuICAgICNAZWxlbWVudC53aWR0aCA9IEBlbGVtZW50LndpZHRoXG4gICAgQGNvbnRleHQuY2xlYXJSZWN0KDAsIDAsIEBlbGVtZW50LndpZHRoLCBAZWxlbWVudC5oZWlnaHQpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIGNyZWF0ZUNhbnZhczogLT5cblxuICAgIEBlbGVtZW50ICAgICAgICA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoQGVsZW1lbnRTZWxlY3RvcilcbiAgICBAZWxlbWVudC5oZWlnaHQgPSBAZGV2aWNlLnNjcmVlbi5oZWlnaHRcbiAgICBAZWxlbWVudC53aWR0aCAgPSBAZGV2aWNlLnNjcmVlbi53aWR0aFxuXG4gICAgQGVsZW1lbnQucmVhbEhlaWdodCA9IEBlbGVtZW50LmhlaWdodFxuICAgIEBlbGVtZW50LnJlYWxXaWR0aCAgPSBAZWxlbWVudC53aWR0aFxuXG4gICAgQGNvbnRleHQgPSBAZWxlbWVudC5nZXRDb250ZXh0KCcyZCcpXG5cbiAgICBAY29udGV4dC5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb24gPSAnc291cmNlLWF0b3AnXG5cbiAgICBAc2NhbGVDYW52YXMoKVxuXG4gICAgQGlucHV0LmFkZENhbnZhc1RhcEV2ZW50TGlzdGVuZXIoQGVsZW1lbnRTZWxlY3RvcilcblxuICAgIHJldHVybiB0aGlzXG5cbiAgc2NhbGVDYW52YXM6IC0+XG5cbiAgICBiYWNraW5nU3RvcmVSYXRpbyA9IEBjb250ZXh0LndlYmtpdEJhY2tpbmdTdG9yZVBpeGVsUmF0aW8gfHwgQGNvbnRleHQuYmFja2luZ1N0b3JlUGl4ZWxSYXRpbyB8fCAxXG5cbiAgICBpZiBAZGV2aWNlLnBpeGVsUmF0aW8gIT0gYmFja2luZ1N0b3JlUmF0aW9cbiAgICAgIHJhdGlvICAgICA9IEBkZXZpY2UucGl4ZWxSYXRpbyAvIGJhY2tpbmdTdG9yZVJhdGlvXG4gICAgICBvbGRXaWR0aCAgPSBAZWxlbWVudC53aWR0aFxuICAgICAgb2xkSGVpZ2h0ID0gQGVsZW1lbnQuaGVpZ2h0XG5cbiAgICAgIEBlbGVtZW50LndpZHRoICA9IG9sZFdpZHRoICAqIHJhdGlvXG4gICAgICBAZWxlbWVudC5oZWlnaHQgPSBvbGRIZWlnaHQgKiByYXRpb1xuXG4gICAgICBAZWxlbWVudC5zdHlsZS53aWR0aCAgPSBcIiN7b2xkV2lkdGh9cHhcIlxuICAgICAgQGVsZW1lbnQuc3R5bGUuaGVpZ2h0ID0gXCIje29sZEhlaWdodH1weFwiXG5cbiAgICAgIEBjb250ZXh0LnNjYWxlKHJhdGlvLCByYXRpbylcblxuICAgIHJldHVybiB0aGlzXG4iLCJcbmNsYXNzIENvbmZpZ0hlbHBlclxuXG4gIGxvYWQ6IC0+XG5cbiAgICBAdmFsdWVzID0ge31cblxuICAgIHJldHVybiB0aGlzXG5cbiAgY29uc29sZTogKHBhdGgpIC0+XG5cbiAgICBkZWJ1Z0NvbnNvbGUoQGdldChwYXRoKSlcblxuICAgIHJldHVybiB0aGlzXG5cbiAgZHVtcDogKHBhdGgpIC0+XG5cbiAgICBkdW1waW5nID0gQHZhbHVlc1xuXG4gICAgaWYgKHBhdGgpXG4gICAgICBkdW1waW5nID0gXCJDb25maWcuI3twYXRofTogI3tAZ2V0KHBhdGgpfVwiXG5cbiAgICBjb25zb2xlLmxvZyhkdW1waW5nKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBnZXQ6IChwYXRoKSAtPlxuXG4gICAgcGF0aCAgPSBwYXRoLnNwbGl0ICcuJ1xuICAgIGFycmF5ID0gQHZhbHVlc1xuXG4gICAgZm9yIGtleSwgaW5kZXggaW4gcGF0aFxuICAgICAgbmV4dEtleSA9IHBhdGhbaW5kZXggKyAxXVxuXG4gICAgICBpZiBuZXh0S2V5P1xuICAgICAgICBhcnJheSA9IGFycmF5W2tleV1cbiAgICAgIGVsc2VcbiAgICAgICAgdmFsdWUgPSBhcnJheVtrZXldXG5cbiAgICByZXR1cm4gdmFsdWUgaWYgdmFsdWU/XG5cbiAgc2V0OiAocGF0aCwgdmFsdWUpIC0+XG5cbiAgICBwYXRoICA9IHBhdGguc3BsaXQgJy4nXG4gICAgYXJyYXkgPSBAdmFsdWVzXG5cbiAgICBmb3Iga2V5LCBpbmRleCBpbiBwYXRoXG4gICAgICBuZXh0S2V5ID0gcGF0aFtpbmRleCArIDFdXG5cbiAgICAgIGlmICFhcnJheVtrZXldXG4gICAgICAgIGlmIG5leHRLZXk/XG4gICAgICAgICAgYXJyYXlba2V5XSA9IHt9XG4gICAgICAgIGVsc2VcbiAgICAgICAgICBhcnJheVtrZXldID0gdmFsdWVcblxuICAgICAgYXJyYXkgPSBhcnJheVtrZXldXG5cbiAgICByZXR1cm4gdGhpc1xuIiwiXG5jbGFzcyBEZXZpY2VIZWxwZXJcblxuICBjb25zdHJ1Y3RvcjogLT5cblxuICAgIEBzY3JlZW4gPVxuICAgICAgaGVpZ2h0OiBkb2N1bWVudC5ib2R5LmNsaWVudEhlaWdodFxuICAgICAgd2lkdGg6ICBkb2N1bWVudC5ib2R5LmNsaWVudFdpZHRoXG5cbiAgICBAYW5kcm9pZCAgICAgICAgPSBpZiBuYXZpZ2F0b3IudXNlckFnZW50Lm1hdGNoKC9hbmRyb2lkL2kpIHRoZW4gdHJ1ZSBlbHNlIGZhbHNlXG4gICAgQGlvcyAgICAgICAgICAgID0gIUBhbmRyb2lkXG4gICAgQGhhc1RvdWNoRXZlbnRzID0gd2luZG93Lmhhc093blByb3BlcnR5KCdvbnRvdWNoc3RhcnQnKSB8fCB3aW5kb3cuaGFzT3duUHJvcGVydHkoJ29ubXNnZXN0dXJlY2hhbmdlJylcbiAgICBAcGl4ZWxSYXRpbyAgICAgPSB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyB8fCAxXG5cbiAgICByZXR1cm4gdGhpc1xuIiwiXG5jbGFzcyBJbnB1dEhlbHBlclxuXG4gIGxvYWQ6IC0+XG5cbiAgICBAZGV2aWNlID0gQXBwLmdldEhlbHBlcignZGV2aWNlJylcblxuICAgIEBjYW5jZWxUb3VjaE1vdmVFdmVudHMoKVxuXG4gICAgQHNldHVwQ29uc29sZSgpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIGFkZENhbnZhc1RhcEV2ZW50TGlzdGVuZXI6IC0+XG5cbiAgICBAYWRkRXZlbnRMaXN0ZW5lciBAZWxlbWVudFNlbGVjdG9yLCAnY2xpY2snLCBAdGVzdEVudGl0aWVzRm9yVGFwc1xuXG4gICAgcmV0dXJuIHRoaXNcblxuICBhZGRFdmVudExpc3RlbmVyOiAoc2VsZWN0b3IgPSAnYm9keScsIHR5cGUsIGNhbGxiYWNrLCBjb25zb2xlT3V0cHV0ID0gZmFsc2UpIC0+XG5cbiAgICB0eXBlID0gQGNvbnZlcnRDbGlja1RvVG91Y2godHlwZSlcblxuICAgIGRlYnVnQ29uc29sZShcIklucHV0LmFkZEV2ZW50TGlzdGVuZXIoI3tzZWxlY3Rvcn0sICN7dHlwZX0sICN7Y2FsbGJhY2t9KVwiKSBpZiBjb25zb2xlT3V0cHV0XG5cbiAgICAkKHNlbGVjdG9yKS5hZGRFdmVudExpc3RlbmVyIHR5cGUsIGNhbGxiYWNrLCBmYWxzZVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBjYW5jZWxUb3VjaE1vdmVFdmVudHM6IC0+XG5cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciAndG91Y2htb3ZlJywgKGV2ZW50KSAtPlxuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgICAgcmV0dXJuXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIGNvbnZlcnRDbGlja1RvVG91Y2g6ICh0eXBlKSAtPlxuXG4gICAgcmV0dXJuIGlmIHR5cGUgPT0gJ2NsaWNrJyAmJiBAZGV2aWNlLmhhc1RvdWNoRXZlbnRzIHRoZW4gJ3RvdWNoc3RhcnQnIGVsc2UgdHlwZVxuXG4gIGdldFRvdWNoRGF0YTogKGV2ZW50KSAtPlxuXG4gICAgaWYgQGRldmljZS5oYXNUb3VjaEV2ZW50c1xuICAgICAgdG91Y2hEYXRhID1cbiAgICAgICAgeDogZXZlbnQudG91Y2hlc1swXS5wYWdlWCxcbiAgICAgICAgeTogZXZlbnQudG91Y2hlc1swXS5wYWdlWVxuICAgIGVsc2VcbiAgICAgIHRvdWNoRGF0YSA9XG4gICAgICAgIHg6IGV2ZW50LmNsaWVudFgsXG4gICAgICAgIHk6IGV2ZW50LmNsaWVudFlcblxuICAgIHJldHVybiB0b3VjaERhdGFcblxuICByZW1vdmVFdmVudExpc3RlbmVyOiAoc2VsZWN0b3IgPSAnYm9keScsIHR5cGUsIGNhbGxiYWNrKSAtPlxuXG4gICAgdHlwZSA9IEBjb252ZXJ0Q2xpY2tUb1RvdWNoKHR5cGUpXG5cbiAgICBkZWJ1Z0NvbnNvbGUoXCJJbnB1dC5yZW1vdmVFdmVudExpc3RlbmVyKCN7c2VsZWN0b3J9LCAje3R5cGV9LCAje2NhbGxiYWNrfSlcIilcblxuICAgICQoc2VsZWN0b3IpLnJlbW92ZUV2ZW50TGlzdGVuZXIgdHlwZSwgY2FsbGJhY2ssIGZhbHNlXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHNldHVwQ29uc29sZTogLT5cblxuICAgIEBhZGRFdmVudExpc3RlbmVyICdib2R5JywgJ2NsaWNrJywgKGV2ZW50KSAtPlxuICAgICAgdHlwZSAgICAgID0gZXZlbnQudHlwZVxuICAgICAgbm9kZSAgICAgID0gZXZlbnQudGFyZ2V0Lm5vZGVOYW1lLnRvTG93ZXJDYXNlKClcbiAgICAgIGlkICAgICAgICA9IGV2ZW50LnRhcmdldC5pZCB8fCAnbi9hJ1xuICAgICAgY2xhc3NMaXN0ID0gZXZlbnQudGFyZ2V0LmNsYXNzTGlzdCB8fCAnbi9hJ1xuXG4gICAgICBkZWJ1Z0NvbnNvbGUoXCIje3R5cGV9IG9uICN7bm9kZX0gLSBpZDogI3tpZH0gLSBjbGFzczogI3tjbGFzc0xpc3R9XCIpXG4gICAgICByZXR1cm5cblxuICAgIHJldHVybiB0aGlzXG5cbiAgdGVzdEVudGl0aWVzRm9yVGFwczogLT5cblxuXG5cbiAgICByZXR1cm4gdGhpc1xuIiwiXG5jbGFzcyBSZW5kZXJlckhlbHBlclxuXG4gIGxvYWQ6IC0+XG5cbiAgICBAcmVuZGVyU3RhY2sgPSBbXVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBlbnF1ZXVlOiAoZW50aXR5KSAtPlxuXG4gICAgQHJlbmRlclN0YWNrLnB1c2goZW50aXR5KVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBwcm9jZXNzOiAtPlxuXG4gICAgZm9yIGVudGl0eSBpbiBAcmVuZGVyU3RhY2tcbiAgICAgIGVudGl0eS5yZW5kZXIoKSBpZiBlbnRpdHkuaXNJbnNpZGVDYW52YXNCb3VuZHMoKVxuXG4gICAgQHJlc2V0KClcblxuICAgIHJldHVybiB0aGlzXG5cbiAgcmVzZXQ6IC0+XG5cbiAgICBAcmVuZGVyU3RhY2sgPSBbXVxuXG4gICAgcmV0dXJuIHRoaXNcbiIsIlxuY2xhc3MgVXNlckludGVyZmFjZUhlbHBlclxuXG4gIGxvYWQ6IC0+XG5cbiAgICBAZWxlbWVudHMgPSB7fVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBlbGVtZW50OiAobmFtZSkgLT5cblxuICAgIHJldHVybiBAZWxlbWVudHNbbmFtZV1cblxuICByZW1vdmVBbGxFbGVtZW50czogKHNjZW5lTmFtZSkgLT5cblxuICAgIEBlbGVtZW50cyA9IHt9XG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHJlZ2lzdGVyRWxlbWVudDogKG5hbWUsIHNlbGVjdG9yKSAtPlxuXG4gICAgQGVsZW1lbnRzW25hbWVdID0gJChzZWxlY3RvcilcblxuICAgIHJldHVybiB0aGlzXG5cbiAgcmVtb3ZlRWxlbWVudDogKG5hbWUpIC0+XG5cbiAgICBkZWxldGUgQGVsZW1lbnRzW25hbWVdIGlmIEBlbGVtZW50c1tuYW1lXT9cblxuICAgIHJldHVybiB0aGlzXG5cbiAgdHJhbnNpdGlvblRvOiAodGFyZ2V0U2NlbmUsIGluc3RhbnQgPSBmYWxzZSkgLT5cblxuICAgIGlmIEFwcC5jdXJyZW50U2NlbmU/ICYmIHR5cGVvZiBBcHAuY3VycmVudFNjZW5lLnVubG9hZCA9PSAnZnVuY3Rpb24nXG4gICAgICBBcHAuc2NlbmVzW2N1cnJlbnRTY2VuZV0udW5sb2FkKClcblxuICAgICAgQHVwZGF0ZUJvZHlDbGFzcyhcInNjZW5lLSN7dGFyZ2V0U2NlbmV9LW91dFwiKVxuXG4gICAgQXBwLnNjZW5lc1t0YXJnZXRTY2VuZV0ubG9hZCgpXG5cbiAgICBBcHAuY3VycmVudFNjZW5lID0gdGFyZ2V0U2NlbmVcblxuICAgIEB1cGRhdGVCb2R5Q2xhc3MoXCJzY2VuZS0je3RhcmdldFNjZW5lfVwiKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICB1cGRhdGVCb2R5Q2xhc3M6IChjbGFzc05hbWUpIC0+XG5cbiAgICBkb2N1bWVudC5ib2R5LmNsYXNzTmFtZSA9ICcnXG4gICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuYWRkKGNsYXNzTmFtZSlcblxuICAgIHJldHVybiB0aGlzXG4iLCJcbmNsYXNzIEFwcGxpY2F0aW9uXG5cbiAgY29uc3RydWN0b3I6IC0+XG5cbiAgICBAY3VycmVudFNjZW5lICA9IG51bGxcbiAgICBAZGVsdGEgICAgICAgICA9IDBcbiAgICBAc2NlbmVzICAgICAgICA9IHt9XG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIGxvYWQ6IC0+XG5cbiAgICBAaW5pdEhlbHBlcnMoKVxuICAgIEBpbml0U2NlbmVzKClcblxuICAgIEBoZWxwZXJzLmFuaW1hdGlvbkxvb3Auc3RhcnQoKVxuICAgIEBoZWxwZXJzLnVpLnRyYW5zaXRpb25UbygnaWRlbnQnKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBpbml0SGVscGVyczogLT5cblxuICAgIEBoZWxwZXJzID0ge1xuICAgICAgYW5pbWF0aW9uTG9vcDogbmV3IEFuaW1hdGlvbkxvb3BIZWxwZXIoKVxuICAgICAgY2FudmFzOiAgICAgICAgbmV3IENhbnZhc0hlbHBlcigpXG4gICAgICBjb25maWc6ICAgICAgICBuZXcgQ29uZmlnSGVscGVyKClcbiAgICAgIGRldmljZTogICAgICAgIG5ldyBEZXZpY2VIZWxwZXIoKVxuICAgICAgaW5wdXQ6ICAgICAgICAgbmV3IElucHV0SGVscGVyKClcbiAgICAgIHJlbmRlcmVyOiAgICAgIG5ldyBSZW5kZXJlckhlbHBlcigpXG4gICAgICB1aTogICAgICAgICAgICBuZXcgVXNlckludGVyZmFjZUhlbHBlcigpXG4gICAgfVxuXG4gICAgZm9yIGhlbHBlck5hbWUsIGhlbHBlckNsYXNzIG9mIEBoZWxwZXJzXG4gICAgICBoZWxwZXJDbGFzcy5sb2FkKCkgaWYgaGVscGVyQ2xhc3MubG9hZD9cblxuICAgIHJldHVybiB0aGlzXG5cbiAgaW5pdFNjZW5lczogLT5cblxuICAgIEBzY2VuZXMgPSB7XG4gICAgICBpZGVudDogICBuZXcgSWRlbnRTY2VuZSgpXG4gICAgICBwbGF5aW5nOiBuZXcgUGxheWluZ1NjZW5lKClcbiAgICAgIHRpdGxlOiAgIG5ldyBUaXRsZVNjZW5lKClcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIGdldEhlbHBlcjogKG5hbWUpIC0+XG5cbiAgICByZXR1cm4gQGhlbHBlcnNbbmFtZV1cblxuICB1cGRhdGU6IChkZWx0YSkgLT5cblxuICAgIEBkZWx0YSA9IGRlbHRhXG5cbiAgICBpZiBAY3VycmVudFNjZW5lP1xuICAgICAgQGhlbHBlcnMuY2FudmFzLmNsZWFyKClcbiAgICAgIEBzY2VuZXNbQGN1cnJlbnRTY2VuZV0udXBkYXRlKClcbiAgICAgIEBoZWxwZXJzLnJlbmRlcmVyLnByb2Nlc3MoKVxuXG4gICAgcmV0dXJuIHRoaXNcbiIsIlxuY2xhc3MgRW50aXR5XG5cbiAgY29uc3RydWN0b3I6IC0+XG5cbiAgICBAY2FudmFzICAgPSBBcHAuZ2V0SGVscGVyKCdjYW52YXMnKVxuICAgIEBjb25maWcgICA9IEFwcC5nZXRIZWxwZXIoJ2NvbmZpZycpXG4gICAgQGRldmljZSAgID0gQXBwLmdldEhlbHBlcignZGV2aWNlJylcbiAgICBAcmVuZGVyZXIgPSBBcHAuZ2V0SGVscGVyKCdyZW5kZXJlcicpXG5cbiAgICBAaWQgICAgICAgICAgICAgICAgID0gbnVsbFxuICAgIEBwYXJlbnQgICAgICAgICAgICAgPSBudWxsXG4gICAgQHJlbW92ZU9uQ2FudmFzRXhpdCA9IHRydWVcblxuICAgIEBoZWlnaHQgPSAwXG4gICAgQHdpZHRoICA9IDBcblxuICAgIEBwb3NpdGlvbiA9IHtcbiAgICAgIHg6IDBcbiAgICAgIHk6IDBcbiAgICB9XG5cbiAgICBAdmVsb2NpdHkgPSB7XG4gICAgICB4OiAwXG4gICAgICB5OiAwXG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBhZGRTZWxmVG9SZW5kZXJRdWV1ZTogLT5cblxuICAgIEByZW5kZXJlci5lbnF1ZXVlKHRoaXMpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIGNhbnZhc0V4aXRDYWxsYmFjazogLT5cblxuICAgIEByZW1vdmVTZWxmRnJvbVBhcmVudCgpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIGlzSW5zaWRlQ2FudmFzQm91bmRzOiAtPlxuXG4gICAgcmV0dXJuICFAaXNPdXRzaWRlQ2FudmFzQm91bmRzKClcblxuICBpc091dHNpZGVDYW52YXNCb3VuZHM6IC0+XG5cbiAgICBvdXRzaWRlTGVmdCAgPSBAcG9zaXRpb24ueCA8IC1Ad2lkdGhcbiAgICBvdXRzaWRlUmlnaHQgPSBAcG9zaXRpb24ueCAtIEB3aWR0aCA+IEBjYW52YXMuZWxlbWVudC5yZWFsV2lkdGhcbiAgICBvdXRzaWRlWCAgICAgPSBvdXRzaWRlTGVmdCB8fCBvdXRzaWRlUmlnaHRcblxuICAgIG91dHNpZGVUb3AgICAgPSBAcG9zaXRpb24ueSA8IC1AaGVpZ2h0XG4gICAgb3V0c2lkZUJvdHRvbSA9IEBwb3NpdGlvbi55IC0gQGhlaWdodCA+IEBjYW52YXMuZWxlbWVudC5yZWFsV2hlaWdodFxuICAgIG91dHNpZGVZICAgICAgPSBvdXRzaWRlVG9wIHx8IG91dHNpZGVCb3R0b21cblxuICAgIHJldHVybiBvdXRzaWRlWCB8fCBvdXRzaWRlWVxuXG4gIHJlbW92ZVNlbGZGcm9tUGFyZW50OiAtPlxuXG4gICAgQHBhcmVudC5yZW1vdmVFbnRpdHkoQGlkKSBpZiBAcGFyZW50P1xuXG4gICAgcmV0dXJuIHRoaXNcblxuICB1cGRhdGU6IC0+XG5cbiAgICBpZiBAb3V0c2lkZUNhbnZhc0JvdW5jZHMoKVxuICAgICAgQGNhbnZhc0V4aXRDYWxsYmFjaygpICAgaWYgQGNhbnZhc0V4aXRDYWxsYmFjaz9cbiAgICAgIEByZW1vdmVTZWxmRnJvbVBhcmVudCgpIGlmIEByZW1vdmVPbkNhbnZhc0V4aXRcblxuICAgICAgIyBpZiBoYXMgZXZlbnQgaGFuZGxlclxuICAgICAgICAjIHBhc3MgZXZlbnQgdG8gaW5wdXQgaGVscGVyLCB3aXRoIGVudGl0eSwgZXZlbnQgYW5kIGNhbGxiYWNrXG5cbiAgICByZXR1cm4gdGhpc1xuIiwiXG5jbGFzcyBTY2VuZVxuXG4gIGNvbnN0cnVjdG9yOiAtPlxuXG4gICAgQGVudGl0aWVzQ291bnQgPSAwXG4gICAgQGVudGl0eV9pZHMgICAgPSBbXVxuICAgIEBlbnRpdGllcyAgICAgID0gW11cblxuICAgIHJldHVybiB0aGlzXG5cbiAgYWRkRW50aXR5OiAoZW50aXR5LCB1bnNoaWZ0KSAtPlxuXG4gICAgaWYgdW5zaGlmdD9cbiAgICAgIEBlbnRpdHlfaWRzLnVuc2hpZnQoZW50aXR5LmlkKVxuICAgICAgQGVudGl0aWVzLnVuc2hpZnQoZW50aXR5KVxuICAgIGVsc2VcbiAgICAgIEBlbnRpdHlfaWRzLnB1c2goZW50aXR5LmlkKVxuICAgICAgQGVudGl0aWVzLnB1c2goZW50aXR5KVxuXG4gICAgQGVudGl0aWVzQ291bnQgKz0gMVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBsb2FkOiAtPlxuXG4gICAgQGNvbmZpZyA9IEFwcC5nZXRIZWxwZXIoJ2NvbmZpZycpXG4gICAgQGRldmljZSA9IEFwcC5nZXRIZWxwZXIoJ2RldmljZScpXG4gICAgQGlucHV0ICA9IEFwcC5nZXRIZWxwZXIoJ2lucHV0JylcbiAgICBAdWkgICAgID0gQXBwLmdldEhlbHBlcigndWknKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICByZW1vdmVBbGxFbnRpdGllczogLT5cblxuICAgIEBlbnRpdGllc0NvdW50ID0gMFxuICAgIEBlbnRpdGllcyAgICAgID0gW11cbiAgICBAZW50aXR5X2lkcyAgICA9IFtdXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHJlbW92ZUVudGl0eTogKGlkKSAtPlxuXG4gICAgaW5kZXggPSBAZW50aXR5X2lkcy5pbmRleE9mKGlkKVxuXG4gICAgQGVudGl0aWVzLnNwbGljZShpbmRleCwgMSlcbiAgICBAZW50aXR5X2lkcy5zcGxpY2UoaW5kZXgsIDEpXG5cbiAgICBAZW50aXRpZXNDb3VudCAtPSAxXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHVubG9hZDogLT5cblxuICAgIEByZW1vdmVBbGxFbnRpdGllcygpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHVwZGF0ZTogLT5cblxuICAgIEB1cGRhdGVFbnRpdGllcygpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHVwZGF0ZUVudGl0aWVzOiAtPlxuXG4gICAgZW50aXR5LnVwZGF0ZSgpIGZvciBlbnRpdHkgaW4gQGVudGl0aWVzXG5cbiAgICByZXR1cm4gdGhpc1xuIiwiXG5jbGFzcyBHYW1lT3ZlclNjZW5lIGV4dGVuZHMgU2NlbmVcblxuICBjb25zdHJ1Y3RvcjogLT5cblxuICAgIHN1cGVyXG5cbiAgICByZXR1cm4gdGhpc1xuIiwiXG5jbGFzcyBJZGVudFNjZW5lIGV4dGVuZHMgU2NlbmVcblxuICBjb25zdHJ1Y3RvcjogLT5cblxuICAgIHN1cGVyXG5cbiAgICBAbmFtZSA9ICdpZGVudCdcblxuICAgIHJldHVybiB0aGlzXG5cbiAgbG9hZDogLT5cblxuICAgIHN1cGVyXG5cbiAgICB3aW5kb3cuc2V0VGltZW91dCA9PlxuICAgICAgQHVpLnRyYW5zaXRpb25UbygndGl0bGUnKVxuICAgICwgMjVcblxuICAgIHJldHVybiB0aGlzXG4iLCJcbmNsYXNzIFBsYXlpbmdTY2VuZSBleHRlbmRzIFNjZW5lXG5cbiAgY29uc3RydWN0b3I6IC0+XG5cbiAgICBzdXBlclxuXG4gICAgQGxldmVsVXBJbnRlcnZhbCA9IDUwMDBcbiAgICBAbWF4TGV2ZWwgICAgICAgID0gNTBcbiAgICBAbmFtZSAgICAgICAgICAgID0gJ3BsYXlpbmcnXG5cbiAgICBAbWF4RGlhbWV0ZXJBc1BlcmNlbnRhZ2VPZlNjcmVlbiA9IDE1XG4gICAgQG1heExpbmVXaWR0aCAgICAgICAgICAgICAgICAgICAgPSA1XG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIGxvYWQ6IC0+XG5cbiAgICBzdXBlclxuXG4gICAgQHVpLnJlZ2lzdGVyRWxlbWVudCgnY29tYm9NdWx0aXBsaWVyQ291bnRlcicsICcuaHVkLXZhbHVlLWNvbWJvJylcbiAgICBAdWkucmVnaXN0ZXJFbGVtZW50KCdsZXZlbENvdW50ZXInLCAgICAgICAgICAgJy5odWQtdmFsdWUtbGV2ZWwnKVxuICAgIEB1aS5yZWdpc3RlckVsZW1lbnQoJ3Njb3JlQ291bnRlcicsICAgICAgICAgICAnLmh1ZC12YWx1ZS1zY29yZScpXG5cbiAgICBAY29uZmlnLnNldCgncG9pbnRzUGVyUG9wJywgMTApXG5cbiAgICBAY29tYm9NdWx0aXBsaWVyID0gMFxuICAgIEBsZXZlbCAgICAgICAgICAgPSAxXG4gICAgQHNjb3JlICAgICAgICAgICA9IDBcblxuICAgIEBzZXR1cExldmVsVXBJbmNyZW1lbnQoKVxuXG4gICAgQHNldEhlYWRzVXBWYWx1ZXMoKVxuXG4gICAgQGJ1YmJsZXNBcnJheSAgICAgICA9IFtdXG4gICAgQGJ1YmJsZXNBcnJheUlkcyAgICA9IFtdXG4gICAgQGJ1YmJsZXNUb0RlbGV0ZSAgICA9IFtdXG4gICAgQHRhcmdldEJ1YmJsZXNDb3VudCA9IDBcblxuICAgIEBwbGF5aW5nID0gdHJ1ZVxuXG4gICAgQHNldHVwRGlmZmljdWx0eUNvbmZpZygpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIGdhbWVPdmVyOiAtPlxuXG4gICAgQHN0b3AoKVxuXG4gICAgQGJ1YmJsZXNBcnJheS5tYXAgKGJ1YmJsZSkgPT5cbiAgICAgIGJ1YmJsZS5kZXN0cm95aW5nID0gdHJ1ZVxuXG4gICAgQGNvbmZpZy5zZXQoJ2J1YmJsZVNwYXduQ2hhbmNlJywgMClcblxuICAgIEBzdG9wTGV2ZWxVcEluY3JlbWVudCgpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIGdlbmVyYXRlQnViYmxlOiAtPlxuXG4gICAgaWYgcmFuZG9tUGVyY2VudGFnZSgpIDwgQGNvbmZpZy5nZXQoJ2J1YmJsZVNwYXduQ2hhbmNlJylcbiAgICAgIGJ1YmJsZUNvbmZpZyA9IEBuZXdCdWJibGVDb25maWcoKVxuICAgICAgYnViYmxlICAgICAgID0gbmV3IEJ1YmJsZUVudGl0eSh0aGlzLCBidWJibGVDb25maWcpXG5cbiAgICAgIEBhZGRFbnRpdHkoYnViYmxlLCAndW5zaGlmdCcpXG5cbiAgICAgIEB0YXJnZXRCdWJibGVzQ291bnQgKz0gMSBpZiBidWJibGUuaXNUYXJnZXRcblxuICAgIHJldHVybiB0aGlzXG5cbiAgbmV3QnViYmxlQ29uZmlnOiAtPlxuXG4gICAgcmV0dXJuIHtcbiAgICAgIGJ1YmJsZUdyb3d0aE11bHRpcGxpZXI6ICAgQGNvbmZpZy5nZXQoJ2J1YmJsZUdyb3d0aE11bHRpcGxpZXInKVxuICAgICAgY2hhbmNlQnViYmxlSXNUYXJnZXQ6ICAgICBAY29uZmlnLmdldCgnY2hhbmNlQnViYmxlSXNUYXJnZXQnKVxuICAgICAgbWF4TGluZVdpZHRoOiAgICAgICAgICAgICBAbWF4TGluZVdpZHRoXG4gICAgICBtYXhUYXJnZXRzQXRPbmNlOiAgICAgICAgIEBjb25maWcuZ2V0KCdtYXhUYXJnZXRzQXRPbmNlJylcbiAgICAgIG1pblRhcmdldERpYW1ldGVyOiAgICAgICAgQGNvbmZpZy5nZXQoJ21pblRhcmdldERpYW1ldGVyJylcbiAgICAgIHRhcmdldEJ1YmJsZXNDb3VudDogICAgICAgQHRhcmdldEJ1YmJsZXNDb3VudFxuICAgICAgcGxheWluZzogICAgICAgICAgICAgICAgICBAcGxheWluZ1xuICAgICAgZGlhbWV0ZXJNYXg6ICAgICAgICAgICAgICBAY29uZmlnLmdldCgnZGlhbWV0ZXJNYXgnKVxuICAgICAgdGFyZ2V0VmVsb2NpdHlNdWx0aXBsaWVyOiBAY29uZmlnLmdldCgndGFyZ2V0VmVsb2NpdHlNdWx0aXBsaWVyJylcbiAgICAgIHZlbG9jaXR5TWF4OiAgICAgICAgICAgICAgQGNvbmZpZy5nZXQoJ3ZlbG9jaXR5TWF4JylcbiAgICAgIHZlbG9jaXR5TWluOiAgICAgICAgICAgICAgQGNvbmZpZy5nZXQoJ3ZlbG9jaXR5TWluJylcbiAgICB9XG5cbiAgc2V0dXBEaWZmaWN1bHR5Q29uZmlnOiAtPlxuXG4gICAgbWF4RGlhbWV0ZXIgPSAoQGRldmljZS5zY3JlZW4ud2lkdGggLyAxMDApICogQG1heERpYW1ldGVyQXNQZXJjZW50YWdlT2ZTY3JlZW5cblxuICAgIEBkaWZmaWN1bHR5Q29uZmlnID1cbiAgICAgIGJ1YmJsZUdyb3d0aE11bHRpcGxpZXI6ICAgeyBlYXN5OiAxLjA1LCAgICAgICAgICAgICAgZGlmZmljdWx0OiAxLjEwICAgICAgICAgICAgICB9XG4gICAgICBidWJibGVTcGF3bkNoYW5jZTogICAgICAgIHsgZWFzeTogNjAsICAgICAgICAgICAgICAgIGRpZmZpY3VsdDogMTAwICAgICAgICAgICAgICAgfVxuICAgICAgY2hhbmNlQnViYmxlSXNUYXJnZXQ6ICAgICB7IGVhc3k6IDUwLCAgICAgICAgICAgICAgICBkaWZmaWN1bHQ6IDkwICAgICAgICAgICAgICAgIH1cbiAgICAgIG1heFRhcmdldHNBdE9uY2U6ICAgICAgICAgeyBlYXN5OiAzLCAgICAgICAgICAgICAgICAgZGlmZmljdWx0OiA2ICAgICAgICAgICAgICAgICB9XG4gICAgICBtaW5UYXJnZXREaWFtZXRlcjogICAgICAgIHsgZWFzeTogbWF4RGlhbWV0ZXIgKiAwLjcsIGRpZmZpY3VsdDogbWF4RGlhbWV0ZXIgKiAwLjQgfVxuICAgICAgZGlhbWV0ZXJNYXg6ICAgICAgICAgICAgICB7IGVhc3k6IG1heERpYW1ldGVyLCAgICAgICBkaWZmaWN1bHQ6IG1heERpYW1ldGVyICogMC42IH1cbiAgICAgIHRhcmdldFZlbG9jaXR5TXVsdGlwbGllcjogeyBlYXN5OiAwLjMsICAgICAgICAgICAgICAgZGlmZmljdWx0OiAwLjUgICAgICAgICAgICAgICB9XG4gICAgICB2ZWxvY2l0eU1heDogICAgICAgICAgICAgIHsgZWFzeTogNiwgICAgICAgICAgICAgICAgIGRpZmZpY3VsdDogMTAgICAgICAgICAgICAgICAgfVxuICAgICAgdmVsb2NpdHlNaW46ICAgICAgICAgICAgICB7IGVhc3k6IC02LCAgICAgICAgICAgICAgICBkaWZmaWN1bHQ6IC0xMCAgICAgICAgICAgICAgIH1cblxuICAgIEB1cGRhdGVWYWx1ZXNGb3JEaWZmaWN1bHR5KClcblxuICAgIHJldHVybiB0aGlzXG5cbiAgc2V0SGVhZHNVcFZhbHVlczogLT5cblxuICAgIHVwZGF0ZVVJVGV4dE5vZGUoQHVpLmVsZW1lbnQoJ2NvbWJvTXVsdGlwbGllckNvdW50ZXInKSwgQGNvbWJvTXVsdGlwbGllcilcbiAgICB1cGRhdGVVSVRleHROb2RlKEB1aS5lbGVtZW50KCdsZXZlbENvdW50ZXInKSwgICAgICAgICAgIEBsZXZlbClcbiAgICB1cGRhdGVVSVRleHROb2RlKEB1aS5lbGVtZW50KCdzY29yZUNvdW50ZXInKSwgICAgICAgICAgIGZvcm1hdFdpdGhDb21tYShAc2NvcmUpKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBzZXR1cExldmVsVXBJbmNyZW1lbnQ6IC0+XG5cbiAgICBAbGV2ZWxVcENvdW50ZXIgPSB3aW5kb3cuc2V0SW50ZXJ2YWwgPT5cbiAgICAgIEB1cGRhdGVMZXZlbCgpXG4gICAgICByZXR1cm5cbiAgICAsIEBsZXZlbFVwSW50ZXJ2YWxcblxuICAgIHJldHVybiB0aGlzXG5cbiAgc3RvcExldmVsVXBJbmNyZW1lbnQ6IC0+XG5cbiAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbChAbGV2ZWxVcENvdW50ZXIpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHVwZGF0ZTogLT5cblxuICAgIHN1cGVyXG5cbiAgICBAZ2VuZXJhdGVCdWJibGUoKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICB1cGRhdGVDb21ib011bHRpcGxpZXI6ICh0YXJnZXRIaXQpIC0+XG5cbiAgICBAY29tYm9NdWx0aXBsaWVyID0gaWYgdGFyZ2V0SGl0IHRoZW4gQGNvbWJvTXVsdGlwbGllciArIDEgZWxzZSBAZGVmYXVsdHMuY29tYm9NdWx0aXBsaWVyXG5cbiAgICAjVUkudXBkYXRlQ29tYm9NdWx0aXBsaWVyQ291bnRlcigpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHVwZGF0ZUxldmVsOiAtPlxuXG4gICAgQGxldmVsICs9IDFcblxuICAgIGlmIEBsZXZlbCA+PSBAbWF4TGV2ZWxcbiAgICAgIHdpbmRvdy5jbGVhckludGVydmFsKEBsZXZlbFVwQ291bnRlcilcblxuICAgIEBzZXRIZWFkc1VwVmFsdWVzKClcblxuICAgIEB1cGRhdGVWYWx1ZXNGb3JEaWZmaWN1bHR5KClcblxuICAgIHJldHVybiB0aGlzXG5cbiAgdXBkYXRlU2NvcmU6IChzaXplV2hlblRhcHBlZCwgc2l6ZVdoZW5GdWxseUdyb3duKSAtPlxuXG4gICAgIygoZGVmYXVsdFNjb3JlUGVyUG9wICsgKDEwMCAtICgoc2l6ZVdoZW5UYXBwZWQgLyBzaXplV2hlbkZ1bGx5R3Jvd24pICogMTAwKSkpICogY29tYm9NdWx0aXBsaWVyKSAqIChsZXZlbE51bWJlciArIDEpXG5cbiAgICB0YXJnZXRTaXplQm9udXMgPSBNYXRoLnJvdW5kKDEwMCAtICgoc2l6ZVdoZW5UYXBwZWQgLyBzaXplV2hlbkZ1bGx5R3Jvd24pICogMTAwKSlcbiAgICBwb3BQb2ludFZhbHVlICAgPSBDb25maWcucG9pbnRzUGVyUG9wICsgdGFyZ2V0U2l6ZUJvbnVzXG4gICAgbGV2ZWxNdWx0aXBsaWVyID0gQGxldmVsICsgMVxuXG4gICAgQHNjb3JlICs9IChwb3BQb2ludFZhbHVlICogQGNvbWJvTXVsdGlwbGllcikgKiBsZXZlbE11bHRpcGxpZXJcblxuICAgIEBzZXRIZWFkc1VwVmFsdWVzKClcblxuICAgIHJldHVybiB0aGlzXG5cbiAgdXBkYXRlVmFsdWVzRm9yRGlmZmljdWx0eTogLT5cblxuICAgIGZvciBwcm9wZXJ0eU5hbWUsIHByb3BlcnR5VmFsdWVzIG9mIEBkaWZmaWN1bHR5Q29uZmlnXG4gICAgICB2YWx1ZURpZmZlcmVuY2UgPSBwcm9wZXJ0eVZhbHVlcy5kaWZmaWN1bHQgLSBwcm9wZXJ0eVZhbHVlcy5lYXN5XG4gICAgICBhZGp1c3RlZFZhbHVlICAgPSAodmFsdWVEaWZmZXJlbmNlICogQGxldmVsKSArIHByb3BlcnR5VmFsdWVzLmVhc3lcblxuICAgICAgQGNvbmZpZy5zZXQocHJvcGVydHlOYW1lLCBhZGp1c3RlZFZhbHVlKVxuXG4gICAgcmV0dXJuIHRoaXNcbiIsIlxuY2xhc3MgVGl0bGVTY2VuZSBleHRlbmRzIFNjZW5lXG5cbiAgY29uc3RydWN0b3I6IC0+XG5cbiAgICBzdXBlclxuXG4gICAgQG5hbWUgPSAndGl0bGUnXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIGxvYWQ6IC0+XG5cbiAgICBzdXBlclxuXG4gICAgQGlucHV0LmFkZEV2ZW50TGlzdGVuZXIgJy5nYW1lLWxvZ28nLCAnY2xpY2snLCA9PlxuICAgICAgQHVpLnRyYW5zaXRpb25UbygncGxheWluZycpXG4gICAgICByZXR1cm5cblxuICAgIHJldHVybiB0aGlzXG5cbiAgdW5sb2FkOiAtPlxuXG4gICAgc3VwZXJcblxuICAgIHJldHVybiB0aGlzXG4iLCJcbmNsYXNzIEJ1YmJsZUVudGl0eSBleHRlbmRzIEVudGl0eVxuXG4gIGNvbnN0cnVjdG9yOiAocGFyZW50LCBjb25maWdWYWx1ZXMpIC0+XG5cbiAgICBzdXBlclxuXG4gICAgQHBhcmVudCAgICAgICA9IHBhcmVudFxuICAgIEBjb25maWdWYWx1ZXMgPSBjb25maWdWYWx1ZXNcblxuICAgIEBoZWlnaHQgICA9IDBcbiAgICBAaWQgICAgICAgPSBcImJ1YmJsZV9cIiArIE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cigyLCA1KVxuICAgIEBwb3NpdGlvbiA9XG4gICAgICB4OiBAZGV2aWNlLnNjcmVlbi53aWR0aCAgLyAyXG4gICAgICB5OiBAZGV2aWNlLnNjcmVlbi5oZWlnaHQgLyAyXG4gICAgQHZlbG9jaXR5ID1cbiAgICAgIHg6IHJhbmRvbShAY29uZmlnVmFsdWVzLnZlbG9jaXR5TWluLCBAY29uZmlnVmFsdWVzLnZlbG9jaXR5TWF4KVxuICAgICAgeTogcmFuZG9tKEBjb25maWdWYWx1ZXMudmVsb2NpdHlNaW4sIEBjb25maWdWYWx1ZXMudmVsb2NpdHlNYXgpXG4gICAgQHdpZHRoICAgID0gMFxuXG4gICAgQGFscGhhICAgICAgICAgPSAwLjc1XG4gICAgQGNvbG9yICAgICAgICAgPSByYW5kb21Db2xvcigpXG4gICAgQGRlc3Ryb3lpbmcgICAgPSBmYWxzZVxuICAgIEBkaWFtZXRlciAgICAgID0gMVxuICAgIEBmaW5hbERpYW1ldGVyID0gcmFuZG9tSW50ZWdlcigwLCBjb25maWdWYWx1ZXMuZGlhbWV0ZXJNYXgpXG4gICAgQGlzVGFyZ2V0ICAgICAgPSBAZGV0ZXJtaW5lVGFyZ2V0QnViYmxlKClcbiAgICBAbGluZVdpZHRoICAgICA9IDBcbiAgICBAcmFkaXVzICAgICAgICA9IDAuNVxuXG4gICAgaWYgQGlzVGFyZ2V0XG4gICAgICBAYWxwaGEgICAgICAgICA9IDAuOVxuICAgICAgQGNvbG9yICAgICAgICAgPSAnMjQ3LCAyNDcsIDI0NydcbiAgICAgIEBmaW5hbERpYW1ldGVyID0gcmFuZG9tSW50ZWdlcihAY29uZmlnVmFsdWVzLm1pblRhcmdldERpYW1ldGVyLCBAY29uZmlnVmFsdWVzLmRpYW1ldGVyTWF4KVxuXG4gICAgICBAdmVsb2NpdHkueCAqPSBAY29uZmlnVmFsdWVzLnRhcmdldFZlbG9jaXR5TXVsdGlwbGllclxuICAgICAgQHZlbG9jaXR5LnkgKj0gQGNvbmZpZ1ZhbHVlcy50YXJnZXRWZWxvY2l0eU11bHRpcGxpZXJcblxuICAgIHJldHVybiB0aGlzXG5cbiAgZGV0ZXJtaW5lVGFyZ2V0QnViYmxlOiAtPlxuXG4gICAgaWYgQGNvbmZpZ1ZhbHVlcy50YXJnZXRCdWJibGVzQ291bnQgPCBAY29uZmlnVmFsdWVzLm1heFRhcmdldHNBdE9uY2VcbiAgICAgIHJldHVybiByYW5kb21QZXJjZW50YWdlKCkgPCBAY29uZmlnVmFsdWVzLmNoYW5jZUJ1YmJsZUlzVGFyZ2V0XG5cbiAgICByZXR1cm4gZmFsc2VcblxuICByZW5kZXI6IC0+XG5cbiAgICBjb250ZXh0ID0gQGNhbnZhcy5jb250ZXh0XG5cbiAgICBjb250ZXh0LmZpbGxTdHlsZSAgID0gcmdiYShAY29sb3IsIEBhbHBoYSlcbiAgICBjb250ZXh0LnN0cm9rZVN0eWxlID0gcmdiYShAY29sb3IsIEBhbHBoYSlcbiAgICBjb250ZXh0LmxpbmVXaWR0aCAgID0gQGxpbmVXaWR0aFxuXG4gICAgY29udGV4dC5iZWdpblBhdGgoKVxuICAgIGNvbnRleHQuYXJjKEBwb3NpdGlvbi54LCBAcG9zaXRpb24ueSwgQHJhZGl1cywgMCwgTWF0aC5QSSAqIDIsIHRydWUpXG4gICAgY29udGV4dC5maWxsKClcbiAgICBjb250ZXh0LnN0cm9rZSgpIGlmIEBpc1RhcmdldFxuICAgIGNvbnRleHQuY2xvc2VQYXRoKClcblxuICAgIHJldHVybiB0aGlzXG5cbiAgdXBkYXRlOiAtPlxuXG4gICAgaWYgQGRlc3Ryb3lpbmdcbiAgICAgIHNocmlua011bHRpcGxpZXIgPSBpZiBAY29uZmlnVmFsdWVzLnBsYXlpbmcgdGhlbiAwLjcgZWxzZSAwLjlcblxuICAgICAgQGRpYW1ldGVyICo9IHNocmlua011bHRpcGxpZXJcbiAgICBlbHNlXG4gICAgICBAZGlhbWV0ZXIgKj0gQGNvbmZpZ1ZhbHVlcy5idWJibGVHcm93dGhNdWx0aXBsaWVyIGlmIEBkaWFtZXRlciA8IEBmaW5hbERpYW1ldGVyXG4gICAgICBAZGlhbWV0ZXIgPSBAZmluYWxEaWFtZXRlciBpZiBAZGlhbWV0ZXIgPiBAZmluYWxEaWFtZXRlclxuXG4gICAgaWYgQGlzVGFyZ2V0XG4gICAgICBAbGluZVdpZHRoID0gQGRpYW1ldGVyIC8gMTBcbiAgICAgIEBsaW5lV2lkdGggPSBAY29uZmlnVmFsdWVzLm1heExpbmVXaWR0aCBpZiBAbGluZVdpZHRoID4gQGNvbmZpZ1ZhbHVlcy5tYXhMaW5lV2lkdGhcblxuICAgIEBoZWlnaHQgPSBAZGlhbWV0ZXJcbiAgICBAd2lkdGggID0gQGRpYW1ldGVyXG4gICAgQHJhZGl1cyA9IEBkaWFtZXRlciAvIDJcblxuICAgIEBwb3NpdGlvbi54ICs9IEB2ZWxvY2l0eS54XG4gICAgQHBvc2l0aW9uLnkgKz0gQHZlbG9jaXR5LnlcblxuICAgIEBhZGRTZWxmVG9SZW5kZXJRdWV1ZSgpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHdhc1RhcHBlZDogKHRvdWNoRGF0YSkgLT5cblxuICAgIHRhcFggICAgICA9IHRvdWNoRGF0YS5wYWdlWCAqIEBkZXZpY2UucGl4ZWxSYXRpb1xuICAgIHRhcFkgICAgICA9IHRvdWNoRGF0YS5wYWdlWSAqIEBkZXZpY2UucGl4ZWxSYXRpb1xuICAgIGRpc3RhbmNlWCA9IHRhcFggLSBAcG9zaXRpb24ueFxuICAgIGRpc3RhbmNlWSA9IHRhcFkgLSBAcG9zaXRpb24ueVxuICAgIHRhcHBlZCAgICA9IChkaXN0YW5jZVggKiBkaXN0YW5jZVgpICsgKGRpc3RhbmNlWSAqIGRpc3RhbmNlWSkgPCAoQHJhZGl1cyAqIEByYWRpdXMpXG5cbiAgICBpZiB0YXBwZWRcbiAgICAgIGRlYnVnQ29uc29sZShcIkJ1YmJsZSMje0BpZH0gdGFwcGVkIGF0ICN7dGFwWH0sICN7dGFwWX1cIilcbiAgICBlbHNlXG4gICAgICBkZWJ1Z0NvbnNvbGUoXCJDb21ibyBCcm9rZW4hXCIpXG5cbiAgICByZXR1cm4gdGFwcGVkXG5cbiAgdGFwSGFuZGxlcjogLT5cblxuICAgIHBhcmVudC51cGRhdGVDb21ib011bHRpcGxpZXIodGFyZ2V0SGl0KVxuICAgIHBhcmVudC51cGRhdGVTY29yZShidWJibGUuZGlhbWV0ZXIsIGJ1YmJsZS5maW5hbERpYW1ldGVyKSBpZiB0YXJnZXRIaXRcblxuICAgIHJldHVybiB0aGlzXG4iLCJcbiMgTG9hZCB0aGUgbWFpbiBhcHAgd3JhcHBlclxuQXBwID0gbmV3IEFwcGxpY2F0aW9uKClcblxuIyBHZXQgdXAgZ2V0IG9uIGdldCB1cCBnZXQgb24gdXAgc3RheSBvbiB0aGUgc2NlbmUgZXRjIGV0Y1xuQXBwLmxvYWQoKVxuXG4jIyNcbmNhbGxOYXRpdmVBcHAgPSAtPlxuICB0cnlcbiAgICAgIHdlYmtpdC5tZXNzYWdlSGFuZGxlcnMuY2FsbGJhY2tIYW5kbGVyLnBvc3RNZXNzYWdlKFwiSGVsbG8gZnJvbSBKYXZhU2NyaXB0XCIpXG4gIGNhdGNoIGVyclxuICAgICAgY29uc29sZS5sb2coJ1RoZSBuYXRpdmUgY29udGV4dCBkb2VzIG5vdCBleGlzdCB5ZXQnKVxuXG53aW5kb3cuc2V0VGltZW91dCAtPlxuICAgIGNhbGxOYXRpdmVBcHAoKVxuLCAxMDAwXG4jIyNcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==