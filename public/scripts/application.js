var $, clamp, correctValueForDPR, debugConsole, formatWithComma, fps, random, randomColor, randomInteger, randomPercentage, rgba, updateUITextNode;

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

clamp = function(value, min, max) {
  if (value < min) {
    value = min;
  } else if (value > max) {
    value = max;
  }
  return value;
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

debugConsole = function(content) {
  var element;
  element = $('.debugConsole');
  updateUITextNode(element, content);
  console.log(content);
};

formatWithComma = function(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

fps = function(value) {
  var element;
  element = $('.fps');
  updateUITextNode(element, value);
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
  r = randomInteger(0, 200);
  g = randomInteger(0, 200);
  b = randomInteger(0, 200);
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
  if (alpha == null) {
    alpha = false;
  }
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
  function AnimationLoopHelper() {
    this.animationLoopId = null;
    this.delta = 0;
    this.fps = 0;
    this.lastTime = 0;
    return this;
  }

  AnimationLoopHelper.prototype.correctValue = function(value) {
    return (value * this.delta) * (60 / 1000);
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
    this.context.globalCompositeOperation = 'destination-atop';
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
  function InputHelper() {
    this.device = new DeviceHelper();
    this.cancelTouchMoveEvents();
    return this;
  }

  InputHelper.prototype.load = function() {
    this.entityIds = [];
    this.entitiesToTest = [];
    this.entitiesPendingRemoval = [];
    return this;
  };

  InputHelper.prototype.addCanvasTapEventListener = function(canvasSelector) {
    this.addEventListener(canvasSelector, 'click', (function(_this) {
      return function() {
        _this.testEntitiesForEvents();
      };
    })(this));
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

  InputHelper.prototype.addEntity = function(entity) {
    this.entityIds.push(entity.id);
    this.entitiesToTest.push(entity);
    return this;
  };

  InputHelper.prototype.queueEntityForRemoval = function(id) {
    this.entitiesPendingRemoval.push(id);
    return this;
  };

  InputHelper.prototype.removeAllEntities = function() {
    this.entitiesToTest = [];
    return this;
  };

  InputHelper.prototype.removeQueuedEntities = function() {
    var id, _i, _len, _ref;
    _ref = this.entitiesPendingRemoval;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      id = _ref[_i];
      this.removeEntity(id);
    }
    this.entitiesPendingRemoval = [];
    return this;
  };

  InputHelper.prototype.removeEntity = function(id) {
    var index;
    index = this.entityIds.indexOf(id);
    if (index !== -1) {
      this.entityIds.splice(index, 1);
      this.entitiesToTest.splice(index, 1);
    }
    return this;
  };

  InputHelper.prototype.testEntitiesForEvents = function() {
    var entity, tapped, _i, _len, _ref;
    this.touchData = this.getTouchData(event);
    _ref = this.entitiesToTest;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      entity = _ref[_i];
      tapped = entity.wasTapped();
      entity.tapHandler(tapped);
      if (tapped) {
        break;
      }
    }
    this.removeQueuedEntities();
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
      App.currentScene.unload();
    }
    App.currentScene = App.scenes[targetScene];
    App.currentScene.load();
    this.updateBodyClass("scene-" + App.currentScene.id);
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
    this.helpers = {};
    this.scenes = {};
    this.backgroundScenes = [];
    return this;
  }

  Application.prototype.load = function() {
    this.initHelpers();
    this.initScenes();
    this.getHelper('animationLoop').start();
    this.getHelper('ui').transitionTo('ident');
    return this;
  };

  Application.prototype.initHelpers = function() {
    var helper, _i, _len, _ref;
    this.helpers = {
      animationLoop: {
        object: new AnimationLoopHelper()
      },
      canvas: {
        object: new CanvasHelper()
      },
      config: {
        object: new ConfigHelper()
      },
      device: {
        object: new DeviceHelper()
      },
      input: {
        object: new InputHelper()
      },
      renderer: {
        object: new RendererHelper()
      },
      ui: {
        object: new UserInterfaceHelper()
      }
    };
    _ref = this.helpers;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      helper = _ref[_i];
      if (!helper.loaded) {
        this.loadHelper(helper);
      }
    }
    return this;
  };

  Application.prototype.loadHelper = function(helper) {
    if (helper.object.load != null) {
      helper.object.load();
    }
    helper.loaded = true;
    return this;
  };

  Application.prototype.initScenes = function() {
    var sceneName, sceneObject, _ref;
    this.scenes = {
      'ident': new IdentScene(),
      'game-over': new GameOverScene(),
      'playing': new PlayingScene(),
      'title': new TitleScene()
    };
    _ref = this.scenes;
    for (sceneName in _ref) {
      sceneObject = _ref[sceneName];
      if (sceneObject.updatesInBackGround) {
        this.backgroundScenes.push(sceneObject);
      }
    }
    return this;
  };

  Application.prototype.getHelper = function(name) {
    var helper;
    helper = this.helpers[name];
    if (!helper.loaded) {
      this.loadHelper(helper);
    }
    return helper.object;
  };

  Application.prototype.update = function(delta) {
    var backgroundScene, _i, _len, _ref;
    this.delta = delta;
    if (this.currentScene != null) {
      this.getHelper('canvas').clear();
      this.currentScene.update();
      _ref = this.backgroundScenes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        backgroundScene = _ref[_i];
        if (backgroundScene.id !== this.currentScene.id) {
          backgroundScene.update();
        }
      }
      this.getHelper('renderer').process();
    }
    return this;
  };

  return Application;

})();

var Entity;

Entity = (function() {
  function Entity() {
    this.animationLoop = App.getHelper('animationLoop');
    this.canvas = App.getHelper('canvas');
    this.config = App.getHelper('config');
    this.input = App.getHelper('input');
    this.device = App.getHelper('device');
    this.renderer = App.getHelper('renderer');
    this.context = this.canvas.context;
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
    if (this.isOutsideCanvasBounds()) {
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
    this.entityIds = [];
    this.entities = [];
    this.entitiesPendingRemoval = [];
    this.updatesInBackGround = false;
    return this;
  }

  Scene.prototype.addEntity = function(entity, unshift) {
    if (unshift == null) {
      unshift = false;
    }
    if (!unshift) {
      this.entityIds.push(entity.id);
      this.entities.push(entity);
    } else {
      this.entityIds.unshift(entity.id);
      this.entities.unshift(entity);
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
    this.entityIds = [];
    return this;
  };

  Scene.prototype.removeEntity = function(id) {
    this.entitiesPendingRemoval.push(id);
    return this;
  };

  Scene.prototype.unload = function() {
    return this;
  };

  Scene.prototype.update = function() {
    if (this.entitiesCount > 0) {
      this.updateEntities();
      this.processEntitiesMarkedForRemoval();
    }
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

  Scene.prototype.processEntitiesMarkedForRemoval = function() {
    var id, index, _i, _len, _ref;
    _ref = this.entitiesPendingRemoval;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      id = _ref[_i];
      index = this.entityIds.indexOf(id);
      this.entities.splice(index, 1);
      this.entityIds.splice(index, 1);
      this.entitiesCount -= 1;
    }
    this.entitiesPendingRemoval = [];
    if (this.entitiesCount < 0) {
      return this.entitiesCount = 0;
    }
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
    this.id = 'game-over';
    this.playAgainEventBound = false;
    return this;
  }

  GameOverScene.prototype.load = function() {
    GameOverScene.__super__.load.apply(this, arguments);
    this.input.addEventListener('.play-again', 'click', (function(_this) {
      return function() {
        _this.ui.transitionTo('playing');
      };
    })(this));
    return this;
  };

  return GameOverScene;

})(Scene);

var IdentScene,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

IdentScene = (function(_super) {
  __extends(IdentScene, _super);

  function IdentScene() {
    IdentScene.__super__.constructor.apply(this, arguments);
    this.id = 'ident';
    return this;
  }

  IdentScene.prototype.load = function() {
    IdentScene.__super__.load.apply(this, arguments);
    window.setTimeout((function(_this) {
      return function() {
        return _this.ui.transitionTo('title');
      };
    })(this), 2500);
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
    this.id = 'playing';
    this.updatesInBackGround = true;
    this.levelUpInterval = 5000;
    this.maxLevel = 50;
    this.maxDiameterAsPercentageOfScreen = 15;
    this.maxLineWidth = 5;
    this.pointsPerPop = 10;
    return this;
  }

  PlayingScene.prototype.load = function() {
    PlayingScene.__super__.load.apply(this, arguments);
    this.ui.registerElement('comboMultiplierCounter', '.hud-value-combo');
    this.ui.registerElement('levelCounter', '.hud-value-level');
    this.ui.registerElement('scoreCounter', '.hud-value-score');
    this.comboMultiplier = 0;
    this.level = 1;
    this.score = 0;
    this.setupLevelUpIncrement();
    this.setHeadsUpValues();
    this.targetBubblesCount = 0;
    this.playing = true;
    this.setupDifficultyConfig();
    return this;
  };

  PlayingScene.prototype.decrementTargetBubblesCount = function() {
    this.targetBubblesCount -= 1;
    if (this.targetBubblesCount < 0) {
      this.targetBubblesCount = 0;
    }
    return this;
  };

  PlayingScene.prototype.gameOver = function() {
    this.ui.transitionTo('game-over');
    this.input.removeAllEntities();
    return this;
  };

  PlayingScene.prototype.generateBubble = function() {
    var bubble, bubbleConfig;
    if (this.playing && randomPercentage() < this.difficultyConfig['bubbleSpawnChance'].current) {
      bubbleConfig = this.newBubbleConfig();
      bubble = new BubbleEntity(this, bubbleConfig);
      if (bubble.isTarget) {
        this.addEntity(bubble);
        this.input.addEntity(bubble);
      } else {
        this.addEntity(bubble, true);
      }
      if (bubble.isTarget) {
        this.targetBubblesCount += 1;
      }
    }
    return this;
  };

  PlayingScene.prototype.newBubbleConfig = function() {
    return {
      bubbleGrowthMultiplier: this.difficultyConfig['bubbleGrowthMultiplier'].current,
      chanceBubbleIsTarget: this.difficultyConfig['chanceBubbleIsTarget'].current,
      diameterMax: this.difficultyConfig['diameterMax'].current,
      maxTargetsAtOnce: this.difficultyConfig['maxTargetsAtOnce'].current,
      minTargetDiameter: this.difficultyConfig['minTargetDiameter'].current,
      targetVelocityMultiplier: this.difficultyConfig['targetVelocityMultiplier'].current,
      velocityMax: this.difficultyConfig['velocityMax'].current,
      velocityMin: this.difficultyConfig['velocityMin'].current,
      maxLineWidth: this.maxLineWidth,
      playing: this.playing,
      targetBubblesCount: this.targetBubblesCount
    };
  };

  PlayingScene.prototype.setupDifficultyConfig = function() {
    var maxDiameter;
    maxDiameter = (this.device.screen.width / 100) * this.maxDiameterAsPercentageOfScreen;
    this.difficultyConfig = {
      bubbleGrowthMultiplier: {
        current: 0,
        easy: 1.05,
        difficult: 1.10
      },
      bubbleSpawnChance: {
        current: 0,
        easy: 60,
        difficult: 100
      },
      chanceBubbleIsTarget: {
        current: 0,
        easy: 50,
        difficult: 90
      },
      diameterMax: {
        current: 0,
        easy: maxDiameter,
        difficult: maxDiameter * 0.6
      },
      maxTargetsAtOnce: {
        current: 0,
        easy: 3,
        difficult: 6
      },
      minTargetDiameter: {
        current: 0,
        easy: maxDiameter * 0.7,
        difficult: maxDiameter * 0.4
      },
      targetVelocityMultiplier: {
        current: 0,
        easy: 0.3,
        difficult: 0.5
      },
      velocityMax: {
        current: 0,
        easy: 4,
        difficult: 7
      },
      velocityMin: {
        current: 0,
        easy: -4,
        difficult: -7
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

  PlayingScene.prototype.unload = function() {
    var bubble, _i, _len, _ref;
    if (this.playing === true) {
      _ref = this.entities;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        bubble = _ref[_i];
        bubble.destroying = true;
      }
      this.playing = false;
      return this.stopLevelUpIncrement();
    }
  };

  PlayingScene.prototype.update = function() {
    PlayingScene.__super__.update.apply(this, arguments);
    this.generateBubble();
    return this;
  };

  PlayingScene.prototype.updateComboMultiplier = function(targetHit) {
    if (targetHit) {
      this.comboMultiplier += 1;
    } else {
      this.comboMultiplier = 0;
    }
    this.setHeadsUpValues();
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
    popPointValue = this.pointsPerPop + targetSizeBonus;
    levelMultiplier = this.level + 1;
    this.score += (popPointValue * this.comboMultiplier) * levelMultiplier;
    this.setHeadsUpValues();
    return this;
  };

  PlayingScene.prototype.updateValuesForDifficulty = function() {
    var adjustedValue, levelMulitplier, propertyName, propertyValues, valueDifference, _ref;
    levelMulitplier = this.level / this.maxLevel;
    _ref = this.difficultyConfig;
    for (propertyName in _ref) {
      propertyValues = _ref[propertyName];
      valueDifference = propertyValues.difficult - propertyValues.easy;
      adjustedValue = (valueDifference * levelMulitplier) + propertyValues.easy;
      this.difficultyConfig[propertyName].current = adjustedValue;
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
    this.id = 'title';
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
    this.fillColor = this.color;
    this.strokeColor = this.color;
    this.finalDiameter = randomInteger(0, configValues.diameterMax);
    this.isTarget = this.determineTargetBubble();
    this.radius = 0.5;
    this.shrinkMultiplier = 0.9;
    if (this.isTarget) {
      this.alpha = 0.9;
      this.fillColor = "240, 240, 240";
      this.finalDiameter = randomInteger(this.configValues.minTargetDiameter, this.configValues.diameterMax);
      this.lineWidth = this.diameter / 10;
      this.velocity.x *= this.configValues.targetVelocityMultiplier;
      this.velocity.y *= this.configValues.targetVelocityMultiplier;
    }
    return this;
  }

  BubbleEntity.prototype.canvasExitCallback = function() {
    BubbleEntity.__super__.canvasExitCallback.apply(this, arguments);
    if (this.isTarget) {
      this.parent.gameOver();
    }
    return this;
  };

  BubbleEntity.prototype.determineTargetBubble = function() {
    if (this.configValues.targetBubblesCount < this.configValues.maxTargetsAtOnce) {
      return randomPercentage() < this.configValues.chanceBubbleIsTarget;
    }
    return false;
  };

  BubbleEntity.prototype.render = function() {
    this.context.lineWidth = this.lineWidth;
    this.context.fillStyle = rgba(this.fillColor, this.alpha);
    this.context.strokeStyle = rgba(this.strokeColor, this.alpha);
    this.context.beginPath();
    this.context.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2, true);
    this.context.fill();
    if (this.isTarget) {
      this.context.stroke();
    }
    this.context.closePath();
    return this;
  };

  BubbleEntity.prototype.update = function() {
    BubbleEntity.__super__.update.apply(this, arguments);
    if (this.destroying) {
      this.diameter *= (this.parent.playing ? 0.6 : this.shrinkMultiplier);
      if (this.diameter < 1) {
        this.removeSelfFromParent();
      }
    } else {
      if (this.diameter < this.finalDiameter) {
        this.diameter *= this.configValues.bubbleGrowthMultiplier;
      }
    }
    this.diameter = clamp(this.diameter, 0, this.finalDiameter);
    if (this.isTarget) {
      this.lineWidth = clamp(this.diameter / 10, 0, this.configValues.maxLineWidth);
    }
    this.height = this.diameter;
    this.width = this.diameter;
    this.radius = this.diameter / 2;
    this.position.x += this.animationLoop.correctValue(this.velocity.x);
    this.position.y += this.animationLoop.correctValue(this.velocity.y);
    this.addSelfToRenderQueue();
    return this;
  };

  BubbleEntity.prototype.wasTapped = function() {
    var distanceX, distanceY, tapX, tapY, tapped, touchData;
    touchData = this.input.touchData;
    tapX = touchData.x;
    tapY = touchData.y;
    distanceX = tapX - this.position.x;
    distanceY = tapY - this.position.y;
    tapped = (distanceX * distanceX) + (distanceY * distanceY) < (this.radius * this.radius);

    /*
    if tapped
      debugConsole("Bubble##{@id} tapped at #{tapX}, #{tapY}")
    else
      debugConsole("Combo Broken!")
     */
    return tapped;
  };

  BubbleEntity.prototype.tapHandler = function(targetHit) {
    this.parent.updateComboMultiplier(targetHit);
    if (targetHit) {
      this.parent.updateScore(this.diameter, this.finalDiameter);
      this.destroying = true;
      this.parent.decrementTargetBubblesCount();
      this.input.queueEntityForRemoval(this.id);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInV0aWxzLmNvZmZlZSIsIkFuaW1hdGlvbkxvb3BIZWxwZXIuY29mZmVlIiwiQ2FudmFzSGVscGVyLmNvZmZlZSIsIkNvbmZpZ0hlbHBlci5jb2ZmZWUiLCJEZXZpY2VIZWxwZXIuY29mZmVlIiwiSW5wdXRIZWxwZXIuY29mZmVlIiwiUmVuZGVyZXJIZWxwZXIuY29mZmVlIiwiVXNlckludGVyZmFjZUhlbHBlci5jb2ZmZWUiLCJBcHBsaWNhdGlvbi5jb2ZmZWUiLCJFbnRpdHkuY29mZmVlIiwiU2NlbmUuY29mZmVlIiwiR2FtZU92ZXJTY2VuZS5jb2ZmZWUiLCJJZGVudFNjZW5lLmNvZmZlZSIsIlBsYXlpbmdTY2VuZS5jb2ZmZWUiLCJUaXRsZVNjZW5lLmNvZmZlZSIsIkJ1YmJsZUVudGl0eS5jb2ZmZWUiLCJib290c3RyYXAuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLElBQUEsOElBQUE7O0FBQUEsQ0FBQSxHQUFJLFNBQUMsUUFBRCxHQUFBO0FBRUYsTUFBQSxHQUFBO0FBQUEsRUFBQSxJQUF3QixRQUFBLEtBQVksTUFBcEM7QUFBQSxXQUFPLFFBQVEsQ0FBQyxJQUFoQixDQUFBO0dBQUE7QUFFQSxFQUFBLElBQTRDLFFBQVEsQ0FBQyxNQUFULENBQWdCLENBQWhCLEVBQW1CLENBQW5CLENBQUEsS0FBeUIsR0FBckU7QUFBQSxXQUFPLFFBQVEsQ0FBQyxjQUFULENBQXdCLFFBQXhCLENBQVAsQ0FBQTtHQUZBO0FBQUEsRUFJQSxHQUFBLEdBQU0sUUFBUSxDQUFDLGdCQUFULENBQTBCLFFBQTFCLENBSk4sQ0FBQTtBQU1BLEVBQUEsSUFBaUIsR0FBRyxDQUFDLE1BQUosS0FBYyxDQUEvQjtBQUFBLFdBQU8sR0FBSSxDQUFBLENBQUEsQ0FBWCxDQUFBO0dBTkE7QUFRQSxTQUFPLEdBQVAsQ0FWRTtBQUFBLENBQUosQ0FBQTs7QUFBQSxLQVlBLEdBQVEsU0FBQyxLQUFELEVBQVEsR0FBUixFQUFhLEdBQWIsR0FBQTtBQUVOLEVBQUEs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QixDQUFBO0FBQUEsSUFNQSxNQUFBLEdBQVksQ0FBQyxTQUFBLEdBQVksU0FBYixDQUFBLEdBQTBCLENBQUMsU0FBQSxHQUFZLFNBQWIsQ0FBMUIsR0FBb0QsQ0FBQyxJQUFDLENBQUEsTUFBRCxHQUFVLElBQUMsQ0FBQSxNQUFaLENBTmhFLENBQUE7QUFRQTtBQUFBOzs7OztPQVJBO0FBZUEsV0FBTyxNQUFQLENBakJTO0VBQUEsQ0E3RlgsQ0FBQTs7QUFBQSx5QkFnSEEsVUFBQSxHQUFZLFNBQUMsU0FBRCxHQUFBO0FBRVYsSUFBQSxJQUFDLENBQUEsTUFBTSxDQUFDLHFCQUFSLENBQThCLFNBQTlCLENBQUEsQ0FBQTtBQUVBLElBQUEsSUFBRyxTQUFIO0FBQ0UsTUFBQSxJQUFDLENBQUEsTUFBTSxDQUFDLFdBQVIsQ0FBb0IsSUFBQyxDQUFBLFFBQXJCLEVBQStCLElBQUMsQ0FBQSxhQUFoQyxDQUFBLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxVQUFELEdBQWMsSUFEZCxDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsTUFBTSxDQUFDLDJCQUFSLENBQUEsQ0FGQSxDQUFBO0FBQUEsTUFHQSxJQUFDLENBQUEsS0FBSyxDQUFDLHFCQUFQLENBQTZCLElBQUMsQ0FBQSxFQUE5QixDQUhBLENBREY7S0FGQTtBQVFBLFdBQU8sSUFBUCxDQVZVO0VBQUEsQ0FoSFosQ0FBQTs7c0JBQUE7O0dBRnlCLE9BQTNCLENBQUE7O0FDQ0EsSUFBQSxHQUFBOztBQUFBLEdBQUEsR0FBVSxJQUFBLFdBQUEsQ0FBQSxDQUFWLENBQUE7O0FBQUEsR0FHRyxDQUFDLElBQUosQ0FBQSxDQUhBLENBQUE7O0FBS0E7QUFBQTs7Ozs7Ozs7OztHQUxBIiwiZmlsZSI6ImFwcGxpY2F0aW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXG4kID0gKHNlbGVjdG9yKSAtPlxuXG4gIHJldHVybiBkb2N1bWVudC5ib2R5IGlmIHNlbGVjdG9yID09ICdib2R5J1xuXG4gIHJldHVybiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChzZWxlY3RvcikgaWYgc2VsZWN0b3Iuc3Vic3RyKDAsIDEpID09ICcjJ1xuXG4gIGVscyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpXG5cbiAgcmV0dXJuIGVsc1swXSBpZiBlbHMubGVuZ3RoID09IDFcblxuICByZXR1cm4gZWxzXG5cbmNsYW1wID0gKHZhbHVlLCBtaW4sIG1heCkgLT5cblxuICBpZiB2YWx1ZSA8IG1pblxuICAgIHZhbHVlID0gbWluXG4gIGVsc2UgaWYgdmFsdWUgPiBtYXhcbiAgICB2YWx1ZSA9IG1heFxuXG4gIHJldHVybiB2YWx1ZVxuXG5jb3JyZWN0VmFsdWVGb3JEUFIgPSAodmFsdWUsIGludGVnZXIgPSBmYWxzZSkgLT5cblxuICB2YWx1ZSAqPSBkZXZpY2VQaXhlbFJhdGlvXG5cbiAgdmFsdWUgPSBNYXRoLnJvdW5kKHZhbHVlKSBpZiBpbnRlZ2VyXG5cbiAgcmV0dXJuIHZhbHVlXG5cbmRlYnVnQ29uc29sZSA9IChjb250ZW50KSAtPlxuXG4gIGVsZW1lbnQgPSAkKCcuZGVidWdDb25zb2xlJylcblxuICB1cGRhdGVVSVRleHROb2RlKGVsZW1lbnQsIGNvbnRlbnQpXG4gIGNvbnNvbGUubG9nKGNvbnRlbnQpXG5cbiAgcmV0dXJuXG5cbmZvcm1hdFdpdGhDb21tYSA9IChudW0pIC0+XG5cbiAgcmV0dXJuIG51bS50b1N0cmluZygpLnJlcGxhY2UoL1xcQig/PShcXGR7M30pKyg/IVxcZCkpL2csIFwiLFwiKVxuXG5mcHMgPSAodmFsdWUpIC0+XG5cbiAgZWxlbWVudCA9ICQoJy5mcHMnKVxuXG4gIHVwZGF0ZVVJVGV4dE5vZGUoZWxlbWVudCwgdmFsdWUpXG5cbiAgcmV0dXJuXG5cbnJhbmRvbSA9IChtaW4sIG1heCkgLT5cblxuICBpZiBtaW4gPT0gdW5kZWZpbmVkXG4gICAgbWluID0gMFxuICAgIG1heCA9IDFcbiAgZWxzZSBpZiBtYXggPT0gdW5kZWZpbmVkXG4gICAgbWF4ID0gbWluXG4gICAgbWluID0gMFxuXG4gIHJldHVybiAoTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4pKSArIG1pbjtcblxucmFuZG9tQ29sb3IgPSAoKSAtPlxuXG4gIHIgPSByYW5kb21JbnRlZ2VyKDAsIDIwMClcbiAgZyA9IHJhbmRvbUludGVnZXIoMCwgMjAwKVxuICBiID0gcmFuZG9tSW50ZWdlcigwLCAyMDApXG5cbiAgcmV0dXJuIFwiI3tyfSwgI3tnfSwgI3tifVwiXG5cbnJhbmRvbUludGVnZXIgPSAobWluLCBtYXgpIC0+XG5cbiAgaWYgbWF4ID09IHVuZGVmaW5lZFxuICAgIG1heCA9IG1pblxuICAgIG1pbiA9IDBcblxuICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKG1heCArIDEgLSBtaW4pKSArIG1pblxuXG5yYW5kb21QZXJjZW50YWdlID0gLT5cblxuICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTAwKVxuXG5yZ2JhID0gKGNvbG9yLCBhbHBoYSA9IGZhbHNlKSAtPlxuXG4gIGFscGhhID0gMSBpZiAhYWxwaGFcblxuICByZXR1cm4gXCJyZ2JhKCN7Y29sb3J9LCAje2FscGhhfSlcIlxuXG51cGRhdGVVSVRleHROb2RlID0gKGVsZW1lbnQsIHZhbHVlKSAtPlxuXG4gIGVsZW1lbnQuaW5uZXJIVE1MID0gdmFsdWVcblxuICByZXR1cm4gdGhpc1xuIiwiXG5jbGFzcyBBbmltYXRpb25Mb29wSGVscGVyXG5cbiAgY29uc3RydWN0b3I6IC0+XG5cbiAgICBAYW5pbWF0aW9uTG9vcElkID0gbnVsbFxuICAgIEBkZWx0YSAgICAgICAgICAgPSAwXG4gICAgQGZwcyAgICAgICAgICAgICA9IDBcbiAgICBAbGFzdFRpbWUgICAgICAgID0gMFxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBjb3JyZWN0VmFsdWU6ICh2YWx1ZSkgLT5cblxuICAgIHJldHVybiAodmFsdWUgKiBAZGVsdGEpICogKDYwIC8gMTAwMClcblxuICBzdGFydDogLT5cblxuICAgIEBmcmFtZSgpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHN0b3A6IC0+XG5cbiAgICB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUoQGFuaW1hdGlvbkxvb3BJZClcblxuICAgIHJldHVybiB0aGlzXG5cbiAgZnJhbWU6IChub3cpIC0+XG5cbiAgICBAZGVsdGEgICAgPSBub3cgLSBAbGFzdFRpbWVcbiAgICBAZnBzICAgICAgPSBNYXRoLnJvdW5kKDEwMDAgLyBAZGVsdGEpXG4gICAgQGxhc3RUaW1lID0gbm93XG5cbiAgICAjZnBzKEBmcHMpXG5cbiAgICBBcHAudXBkYXRlKEBkZWx0YSlcblxuICAgIEBhbmltYXRpb25Mb29wSWQgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lIChub3cpID0+XG4gICAgICBAZnJhbWUobm93KVxuICAgICAgcmV0dXJuXG5cbiAgICByZXR1cm4gdGhpc1xuIiwiXG5jbGFzcyBDYW52YXNIZWxwZXJcblxuICBsb2FkOiAtPlxuXG4gICAgQGRldmljZSA9IEFwcC5nZXRIZWxwZXIoJ2RldmljZScpXG4gICAgQGlucHV0ICA9IEFwcC5nZXRIZWxwZXIoJ2lucHV0JylcblxuICAgIEBlbGVtZW50U2VsZWN0b3IgPSAnLmNhbnZhcydcblxuICAgIEBjcmVhdGVDYW52YXMoKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBjbGVhcjogLT5cblxuICAgICNAZWxlbWVudC53aWR0aCA9IEBlbGVtZW50LndpZHRoXG4gICAgQGNvbnRleHQuY2xlYXJSZWN0KDAsIDAsIEBlbGVtZW50LndpZHRoLCBAZWxlbWVudC5oZWlnaHQpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIGNyZWF0ZUNhbnZhczogLT5cblxuICAgIEBlbGVtZW50ICAgICAgICA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoQGVsZW1lbnRTZWxlY3RvcilcbiAgICBAZWxlbWVudC5oZWlnaHQgPSBAZGV2aWNlLnNjcmVlbi5oZWlnaHRcbiAgICBAZWxlbWVudC53aWR0aCAgPSBAZGV2aWNlLnNjcmVlbi53aWR0aFxuXG4gICAgQGVsZW1lbnQucmVhbEhlaWdodCA9IEBlbGVtZW50LmhlaWdodFxuICAgIEBlbGVtZW50LnJlYWxXaWR0aCAgPSBAZWxlbWVudC53aWR0aFxuXG4gICAgQGNvbnRleHQgPSBAZWxlbWVudC5nZXRDb250ZXh0KCcyZCcpXG5cbiAgICBAY29udGV4dC5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb24gPSAnZGVzdGluYXRpb24tYXRvcCdcblxuICAgIEBzY2FsZUNhbnZhcygpXG5cbiAgICBAaW5wdXQuYWRkQ2FudmFzVGFwRXZlbnRMaXN0ZW5lcihAZWxlbWVudFNlbGVjdG9yKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBzY2FsZUNhbnZhczogLT5cblxuICAgIGJhY2tpbmdTdG9yZVJhdGlvID0gQGNvbnRleHQud2Via2l0QmFja2luZ1N0b3JlUGl4ZWxSYXRpbyB8fCBAY29udGV4dC5iYWNraW5nU3RvcmVQaXhlbFJhdGlvIHx8IDFcblxuICAgIGlmIEBkZXZpY2UucGl4ZWxSYXRpbyAhPSBiYWNraW5nU3RvcmVSYXRpb1xuICAgICAgcmF0aW8gICAgID0gQGRldmljZS5waXhlbFJhdGlvIC8gYmFja2luZ1N0b3JlUmF0aW9cbiAgICAgIG9sZFdpZHRoICA9IEBlbGVtZW50LndpZHRoXG4gICAgICBvbGRIZWlnaHQgPSBAZWxlbWVudC5oZWlnaHRcblxuICAgICAgQGVsZW1lbnQud2lkdGggID0gb2xkV2lkdGggICogcmF0aW9cbiAgICAgIEBlbGVtZW50LmhlaWdodCA9IG9sZEhlaWdodCAqIHJhdGlvXG5cbiAgICAgIEBlbGVtZW50LnN0eWxlLndpZHRoICA9IFwiI3tvbGRXaWR0aH1weFwiXG4gICAgICBAZWxlbWVudC5zdHlsZS5oZWlnaHQgPSBcIiN7b2xkSGVpZ2h0fXB4XCJcblxuICAgICAgQGNvbnRleHQuc2NhbGUocmF0aW8sIHJhdGlvKVxuXG4gICAgcmV0dXJuIHRoaXNcbiIsIlxuY2xhc3MgQ29uZmlnSGVscGVyXG5cbiAgbG9hZDogLT5cblxuICAgIEB2YWx1ZXMgPSB7fVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBjb25zb2xlOiAocGF0aCkgLT5cblxuICAgIGRlYnVnQ29uc29sZShAZ2V0KHBhdGgpKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBkdW1wOiAocGF0aCkgLT5cblxuICAgIGR1bXBpbmcgPSBAdmFsdWVzXG5cbiAgICBpZiAocGF0aClcbiAgICAgIGR1bXBpbmcgPSBcIkNvbmZpZy4je3BhdGh9OiAje0BnZXQocGF0aCl9XCJcblxuICAgIGNvbnNvbGUubG9nKGR1bXBpbmcpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIGdldDogKHBhdGgpIC0+XG5cbiAgICBwYXRoICA9IHBhdGguc3BsaXQgJy4nXG4gICAgYXJyYXkgPSBAdmFsdWVzXG5cbiAgICBmb3Iga2V5LCBpbmRleCBpbiBwYXRoXG4gICAgICBuZXh0S2V5ID0gcGF0aFtpbmRleCArIDFdXG5cbiAgICAgIGlmIG5leHRLZXk/XG4gICAgICAgIGFycmF5ID0gYXJyYXlba2V5XVxuICAgICAgZWxzZVxuICAgICAgICB2YWx1ZSA9IGFycmF5W2tleV1cblxuICAgIHJldHVybiB2YWx1ZSBpZiB2YWx1ZT9cblxuICBzZXQ6IChwYXRoLCB2YWx1ZSkgLT5cblxuICAgIHBhdGggID0gcGF0aC5zcGxpdCAnLidcbiAgICBhcnJheSA9IEB2YWx1ZXNcblxuICAgIGZvciBrZXksIGluZGV4IGluIHBhdGhcbiAgICAgIG5leHRLZXkgPSBwYXRoW2luZGV4ICsgMV1cblxuICAgICAgaWYgIWFycmF5W2tleV1cbiAgICAgICAgaWYgbmV4dEtleT9cbiAgICAgICAgICBhcnJheVtrZXldID0ge31cbiAgICAgICAgZWxzZVxuICAgICAgICAgIGFycmF5W2tleV0gPSB2YWx1ZVxuXG4gICAgICBhcnJheSA9IGFycmF5W2tleV1cblxuICAgIHJldHVybiB0aGlzXG4iLCJcbmNsYXNzIERldmljZUhlbHBlclxuXG4gIGNvbnN0cnVjdG9yOiAtPlxuXG4gICAgQHNjcmVlbiA9XG4gICAgICBoZWlnaHQ6IGRvY3VtZW50LmJvZHkuY2xpZW50SGVpZ2h0XG4gICAgICB3aWR0aDogIGRvY3VtZW50LmJvZHkuY2xpZW50V2lkdGhcblxuICAgIEBhbmRyb2lkICAgICAgICA9IGlmIG5hdmlnYXRvci51c2VyQWdlbnQubWF0Y2goL2FuZHJvaWQvaSkgdGhlbiB0cnVlIGVsc2UgZmFsc2VcbiAgICBAaW9zICAgICAgICAgICAgPSAhQGFuZHJvaWRcbiAgICBAaGFzVG91Y2hFdmVudHMgPSB3aW5kb3cuaGFzT3duUHJvcGVydHkoJ29udG91Y2hzdGFydCcpIHx8IHdpbmRvdy5oYXNPd25Qcm9wZXJ0eSgnb25tc2dlc3R1cmVjaGFuZ2UnKVxuICAgIEBwaXhlbFJhdGlvICAgICA9IHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvIHx8IDFcblxuICAgIHJldHVybiB0aGlzXG4iLCJcbmNsYXNzIElucHV0SGVscGVyXG5cbiAgY29uc3RydWN0b3I6IC0+XG5cbiAgICBAZGV2aWNlID0gbmV3IERldmljZUhlbHBlcigpXG5cbiAgICBAY2FuY2VsVG91Y2hNb3ZlRXZlbnRzKClcblxuICAgICNAc2V0dXBDb25zb2xlKClcblxuICAgIHJldHVybiB0aGlzXG5cbiAgbG9hZDogLT5cblxuICAgIEBlbnRpdHlJZHMgICAgICAgICAgICAgID0gW11cbiAgICBAZW50aXRpZXNUb1Rlc3QgICAgICAgICA9IFtdXG4gICAgQGVudGl0aWVzUGVuZGluZ1JlbW92YWwgPSBbXVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBhZGRDYW52YXNUYXBFdmVudExpc3RlbmVyOiAoY2FudmFzU2VsZWN0b3IpIC0+XG5cbiAgICBAYWRkRXZlbnRMaXN0ZW5lciBjYW52YXNTZWxlY3RvciwgJ2NsaWNrJywgPT5cbiAgICAgIEB0ZXN0RW50aXRpZXNGb3JFdmVudHMoKVxuICAgICAgcmV0dXJuXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIGFkZEV2ZW50TGlzdGVuZXI6IChzZWxlY3RvciA9ICdib2R5JywgdHlwZSwgY2FsbGJhY2ssIGNvbnNvbGVPdXRwdXQgPSBmYWxzZSkgLT5cblxuICAgIHR5cGUgPSBAY29udmVydENsaWNrVG9Ub3VjaCh0eXBlKVxuXG4gICAgZGVidWdDb25zb2xlKFwiSW5wdXQuYWRkRXZlbnRMaXN0ZW5lcigje3NlbGVjdG9yfSwgI3t0eXBlfSwgI3tjYWxsYmFja30pXCIpIGlmIGNvbnNvbGVPdXRwdXRcblxuICAgICQoc2VsZWN0b3IpLmFkZEV2ZW50TGlzdGVuZXIgdHlwZSwgY2FsbGJhY2ssIGZhbHNlXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIGNhbmNlbFRvdWNoTW92ZUV2ZW50czogLT5cblxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyICd0b3VjaG1vdmUnLCAoZXZlbnQpIC0+XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICByZXR1cm5cblxuICAgIHJldHVybiB0aGlzXG5cbiAgY29udmVydENsaWNrVG9Ub3VjaDogKHR5cGUpIC0+XG5cbiAgICBpZiB0eXBlID09ICdjbGljaycgJiYgQGRldmljZS5oYXNUb3VjaEV2ZW50c1xuICAgICAgcmV0dXJuICd0b3VjaHN0YXJ0J1xuICAgIGVsc2VcbiAgICAgIHJldHVybiB0eXBlXG5cbiAgZ2V0VG91Y2hEYXRhOiAoZXZlbnQpIC0+XG5cbiAgICBpZiBAZGV2aWNlLmhhc1RvdWNoRXZlbnRzXG4gICAgICB0b3VjaERhdGEgPVxuICAgICAgICB4OiBldmVudC50b3VjaGVzWzBdLnBhZ2VYLFxuICAgICAgICB5OiBldmVudC50b3VjaGVzWzBdLnBhZ2VZXG4gICAgZWxzZVxuICAgICAgdG91Y2hEYXRhID1cbiAgICAgICAgeDogZXZlbnQuY2xpZW50WCxcbiAgICAgICAgeTogZXZlbnQuY2xpZW50WVxuXG4gICAgcmV0dXJuIHRvdWNoRGF0YVxuXG4gIHJlbW92ZUV2ZW50TGlzdGVuZXI6IChzZWxlY3RvciA9ICdib2R5JywgdHlwZSwgY2FsbGJhY2spIC0+XG5cbiAgICB0eXBlID0gQGNvbnZlcnRDbGlja1RvVG91Y2godHlwZSlcblxuICAgIGRlYnVnQ29uc29sZShcIklucHV0LnJlbW92ZUV2ZW50TGlzdGVuZXIoI3tzZWxlY3Rvcn0sICN7dHlwZX0sICN7Y2FsbGJhY2t9KVwiKVxuXG4gICAgJChzZWxlY3RvcikucmVtb3ZlRXZlbnRMaXN0ZW5lciB0eXBlLCBjYWxsYmFjaywgZmFsc2VcblxuICAgIHJldHVybiB0aGlzXG5cbiAgc2V0dXBDb25zb2xlOiAtPlxuXG4gICAgQGFkZEV2ZW50TGlzdGVuZXIgJ2JvZHknLCAnY2xpY2snLCAoZXZlbnQpIC0+XG4gICAgICB0eXBlICAgICAgPSBldmVudC50eXBlXG4gICAgICBub2RlICAgICAgPSBldmVudC50YXJnZXQubm9kZU5hbWUudG9Mb3dlckNhc2UoKVxuICAgICAgaWQgICAgICAgID0gZXZlbnQudGFyZ2V0LmlkIHx8ICduL2EnXG4gICAgICBjbGFzc0xpc3QgPSBldmVudC50YXJnZXQuY2xhc3NMaXN0IHx8ICduL2EnXG5cbiAgICAgIGRlYnVnQ29uc29sZShcIiN7dHlwZX0gb24gI3tub2RlfSAtIGlkOiAje2lkfSAtIGNsYXNzOiAje2NsYXNzTGlzdH1cIilcbiAgICAgIHJldHVyblxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBhZGRFbnRpdHk6IChlbnRpdHkpIC0+XG5cbiAgICBAZW50aXR5SWRzLnB1c2goZW50aXR5LmlkKVxuICAgIEBlbnRpdGllc1RvVGVzdC5wdXNoKGVudGl0eSlcblxuICAgIHJldHVybiB0aGlzXG5cbiAgcXVldWVFbnRpdHlGb3JSZW1vdmFsOiAoaWQpIC0+XG5cbiAgICBAZW50aXRpZXNQZW5kaW5nUmVtb3ZhbC5wdXNoKGlkKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICByZW1vdmVBbGxFbnRpdGllczogLT5cblxuICAgIEBlbnRpdGllc1RvVGVzdCA9IFtdXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHJlbW92ZVF1ZXVlZEVudGl0aWVzOiAtPlxuXG4gICAgQHJlbW92ZUVudGl0eShpZCkgZm9yIGlkIGluIEBlbnRpdGllc1BlbmRpbmdSZW1vdmFsXG4gICAgQGVudGl0aWVzUGVuZGluZ1JlbW92YWwgPSBbXVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICByZW1vdmVFbnRpdHk6IChpZCkgLT5cblxuICAgIGluZGV4ID0gQGVudGl0eUlkcy5pbmRleE9mKGlkKTtcblxuICAgIGlmIGluZGV4ICE9IC0xXG4gICAgICBAZW50aXR5SWRzLnNwbGljZShpbmRleCwgMSlcbiAgICAgIEBlbnRpdGllc1RvVGVzdC5zcGxpY2UoaW5kZXgsIDEpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHRlc3RFbnRpdGllc0ZvckV2ZW50czogLT5cblxuICAgIEB0b3VjaERhdGEgPSBAZ2V0VG91Y2hEYXRhKGV2ZW50KVxuXG4gICAgZm9yIGVudGl0eSBpbiBAZW50aXRpZXNUb1Rlc3RcbiAgICAgIHRhcHBlZCA9IGVudGl0eS53YXNUYXBwZWQoKVxuXG4gICAgICBlbnRpdHkudGFwSGFuZGxlcih0YXBwZWQpXG5cbiAgICAgIGJyZWFrIGlmIHRhcHBlZFxuXG4gICAgQHJlbW92ZVF1ZXVlZEVudGl0aWVzKClcblxuICAgIHJldHVybiB0aGlzXG4iLCJcbmNsYXNzIFJlbmRlcmVySGVscGVyXG5cbiAgbG9hZDogLT5cblxuICAgIEByZW5kZXJTdGFjayA9IFtdXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIGVucXVldWU6IChlbnRpdHkpIC0+XG5cbiAgICBAcmVuZGVyU3RhY2sucHVzaChlbnRpdHkpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHByb2Nlc3M6IC0+XG5cbiAgICBmb3IgZW50aXR5IGluIEByZW5kZXJTdGFja1xuICAgICAgZW50aXR5LnJlbmRlcigpIGlmIGVudGl0eS5pc0luc2lkZUNhbnZhc0JvdW5kcygpXG5cbiAgICBAcmVzZXQoKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICByZXNldDogLT5cblxuICAgIEByZW5kZXJTdGFjayA9IFtdXG5cbiAgICByZXR1cm4gdGhpc1xuIiwiXG5jbGFzcyBVc2VySW50ZXJmYWNlSGVscGVyXG5cbiAgbG9hZDogLT5cblxuICAgIEBlbGVtZW50cyA9IHt9XG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIGVsZW1lbnQ6IChuYW1lKSAtPlxuXG4gICAgcmV0dXJuIEBlbGVtZW50c1tuYW1lXVxuXG4gIHJlbW92ZUFsbEVsZW1lbnRzOiAoc2NlbmVOYW1lKSAtPlxuXG4gICAgQGVsZW1lbnRzID0ge31cblxuICAgIHJldHVybiB0aGlzXG5cbiAgcmVnaXN0ZXJFbGVtZW50OiAobmFtZSwgc2VsZWN0b3IpIC0+XG5cbiAgICBAZWxlbWVudHNbbmFtZV0gPSAkKHNlbGVjdG9yKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICByZW1vdmVFbGVtZW50OiAobmFtZSkgLT5cblxuICAgIGRlbGV0ZSBAZWxlbWVudHNbbmFtZV0gaWYgQGVsZW1lbnRzW25hbWVdP1xuXG4gICAgcmV0dXJuIHRoaXNcblxuICB0cmFuc2l0aW9uVG86ICh0YXJnZXRTY2VuZSwgaW5zdGFudCA9IGZhbHNlKSAtPlxuXG4gICAgaWYgQXBwLmN1cnJlbnRTY2VuZT8gJiYgdHlwZW9mIEFwcC5jdXJyZW50U2NlbmUudW5sb2FkID09ICdmdW5jdGlvbidcbiAgICAgIEFwcC5jdXJyZW50U2NlbmUudW5sb2FkKClcblxuICAgICAgI0B1cGRhdGVCb2R5Q2xhc3MoXCJzY2VuZS0je3RhcmdldFNjZW5lfS1vdXRcIilcblxuICAgIEFwcC5jdXJyZW50U2NlbmUgPSBBcHAuc2NlbmVzW3RhcmdldFNjZW5lXVxuXG4gICAgQXBwLmN1cnJlbnRTY2VuZS5sb2FkKClcblxuICAgIEB1cGRhdGVCb2R5Q2xhc3MoXCJzY2VuZS0je0FwcC5jdXJyZW50U2NlbmUuaWR9XCIpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHVwZGF0ZUJvZHlDbGFzczogKGNsYXNzTmFtZSkgLT5cblxuICAgIGRvY3VtZW50LmJvZHkuY2xhc3NOYW1lID0gJydcbiAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQoY2xhc3NOYW1lKVxuXG4gICAgcmV0dXJuIHRoaXNcbiIsIlxuY2xhc3MgQXBwbGljYXRpb25cblxuICBjb25zdHJ1Y3RvcjogLT5cblxuICAgIEBjdXJyZW50U2NlbmUgICAgID0gbnVsbFxuICAgIEBkZWx0YSAgICAgICAgICAgID0gMFxuICAgIEBoZWxwZXJzICAgICAgICAgID0ge31cbiAgICBAc2NlbmVzICAgICAgICAgICA9IHt9XG4gICAgQGJhY2tncm91bmRTY2VuZXMgPSBbXVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBsb2FkOiAtPlxuXG4gICAgQGluaXRIZWxwZXJzKClcbiAgICBAaW5pdFNjZW5lcygpXG5cbiAgICBAZ2V0SGVscGVyKCdhbmltYXRpb25Mb29wJykuc3RhcnQoKVxuICAgIEBnZXRIZWxwZXIoJ3VpJykudHJhbnNpdGlvblRvKCdpZGVudCcpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIGluaXRIZWxwZXJzOiAtPlxuXG4gICAgQGhlbHBlcnMgPSB7XG4gICAgICBhbmltYXRpb25Mb29wOiB7IG9iamVjdDogbmV3IEFuaW1hdGlvbkxvb3BIZWxwZXIoKSB9XG4gICAgICBjYW52YXM6ICAgICAgICB7IG9iamVjdDogbmV3IENhbnZhc0hlbHBlcigpICAgICAgICB9XG4gICAgICBjb25maWc6ICAgICAgICB7IG9iamVjdDogbmV3IENvbmZpZ0hlbHBlcigpICAgICAgICB9XG4gICAgICBkZXZpY2U6ICAgICAgICB7IG9iamVjdDogbmV3IERldmljZUhlbHBlcigpICAgICAgICB9XG4gICAgICBpbnB1dDogICAgICAgICB7IG9iamVjdDogbmV3IElucHV0SGVscGVyKCkgICAgICAgICB9XG4gICAgICByZW5kZXJlcjogICAgICB7IG9iamVjdDogbmV3IFJlbmRlcmVySGVscGVyKCkgICAgICB9XG4gICAgICB1aTogICAgICAgICAgICB7IG9iamVjdDogbmV3IFVzZXJJbnRlcmZhY2VIZWxwZXIoKSB9XG4gICAgfVxuXG4gICAgZm9yIGhlbHBlciBpbiBAaGVscGVyc1xuICAgICAgQGxvYWRIZWxwZXIoaGVscGVyKSBpZiAhaGVscGVyLmxvYWRlZFxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBsb2FkSGVscGVyOiAoaGVscGVyKSAtPlxuXG4gICAgaGVscGVyLm9iamVjdC5sb2FkKCkgaWYgaGVscGVyLm9iamVjdC5sb2FkP1xuICAgIGhlbHBlci5sb2FkZWQgPSB0cnVlXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIGluaXRTY2VuZXM6IC0+XG5cbiAgICBAc2NlbmVzID0ge1xuICAgICAgJ2lkZW50JzogICAgIG5ldyBJZGVudFNjZW5lKClcbiAgICAgICdnYW1lLW92ZXInOiBuZXcgR2FtZU92ZXJTY2VuZSgpXG4gICAgICAncGxheWluZyc6ICAgbmV3IFBsYXlpbmdTY2VuZSgpXG4gICAgICAndGl0bGUnOiAgICAgbmV3IFRpdGxlU2NlbmUoKVxuICAgIH1cblxuICAgIGZvciBzY2VuZU5hbWUsIHNjZW5lT2JqZWN0IG9mIEBzY2VuZXNcbiAgICAgIEBiYWNrZ3JvdW5kU2NlbmVzLnB1c2goc2NlbmVPYmplY3QpIGlmIHNjZW5lT2JqZWN0LnVwZGF0ZXNJbkJhY2tHcm91bmRcblxuICAgIHJldHVybiB0aGlzXG5cbiAgZ2V0SGVscGVyOiAobmFtZSkgLT5cblxuICAgIGhlbHBlciA9IEBoZWxwZXJzW25hbWVdXG5cbiAgICBpZiAhaGVscGVyLmxvYWRlZFxuICAgICAgQGxvYWRIZWxwZXIoaGVscGVyKVxuXG4gICAgcmV0dXJuIGhlbHBlci5vYmplY3RcblxuICB1cGRhdGU6IChkZWx0YSkgLT5cblxuICAgIEBkZWx0YSA9IGRlbHRhXG5cbiAgICBpZiBAY3VycmVudFNjZW5lP1xuICAgICAgQGdldEhlbHBlcignY2FudmFzJykuY2xlYXIoKVxuICAgICAgQGN1cnJlbnRTY2VuZS51cGRhdGUoKVxuXG4gICAgICBmb3IgYmFja2dyb3VuZFNjZW5lIGluIEBiYWNrZ3JvdW5kU2NlbmVzXG4gICAgICAgIGJhY2tncm91bmRTY2VuZS51cGRhdGUoKSBpZiBiYWNrZ3JvdW5kU2NlbmUuaWQgIT0gQGN1cnJlbnRTY2VuZS5pZFxuXG4gICAgICBAZ2V0SGVscGVyKCdyZW5kZXJlcicpLnByb2Nlc3MoKVxuXG4gICAgcmV0dXJuIHRoaXNcbiIsIlxuY2xhc3MgRW50aXR5XG5cbiAgY29uc3RydWN0b3I6IC0+XG5cbiAgICBAYW5pbWF0aW9uTG9vcCA9IEFwcC5nZXRIZWxwZXIoJ2FuaW1hdGlvbkxvb3AnKVxuICAgIEBjYW52YXMgICAgICAgID0gQXBwLmdldEhlbHBlcignY2FudmFzJylcbiAgICBAY29uZmlnICAgICAgICA9IEFwcC5nZXRIZWxwZXIoJ2NvbmZpZycpXG4gICAgQGlucHV0ICAgICAgICAgPSBBcHAuZ2V0SGVscGVyKCdpbnB1dCcpXG4gICAgQGRldmljZSAgICAgICAgPSBBcHAuZ2V0SGVscGVyKCdkZXZpY2UnKVxuICAgIEByZW5kZXJlciAgICAgID0gQXBwLmdldEhlbHBlcigncmVuZGVyZXInKVxuXG4gICAgQGNvbnRleHQgPSBAY2FudmFzLmNvbnRleHRcblxuICAgIEBpZCAgICAgICAgICAgICAgICAgPSBudWxsXG4gICAgQHBhcmVudCAgICAgICAgICAgICA9IG51bGxcbiAgICBAcmVtb3ZlT25DYW52YXNFeGl0ID0gdHJ1ZVxuXG4gICAgQGhlaWdodCA9IDBcbiAgICBAd2lkdGggID0gMFxuXG4gICAgQHBvc2l0aW9uID0ge1xuICAgICAgeDogMFxuICAgICAgeTogMFxuICAgIH1cblxuICAgIEB2ZWxvY2l0eSA9IHtcbiAgICAgIHg6IDBcbiAgICAgIHk6IDBcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIGFkZFNlbGZUb1JlbmRlclF1ZXVlOiAtPlxuXG4gICAgQHJlbmRlcmVyLmVucXVldWUodGhpcylcblxuICAgIHJldHVybiB0aGlzXG5cbiAgY2FudmFzRXhpdENhbGxiYWNrOiAtPlxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBpc0luc2lkZUNhbnZhc0JvdW5kczogLT5cblxuICAgIHJldHVybiAhQGlzT3V0c2lkZUNhbnZhc0JvdW5kcygpXG5cbiAgaXNPdXRzaWRlQ2FudmFzQm91bmRzOiAtPlxuXG4gICAgb3V0c2lkZUxlZnQgID0gQHBvc2l0aW9uLnggPCAtQHdpZHRoXG4gICAgb3V0c2lkZVJpZ2h0ID0gQHBvc2l0aW9uLnggLSBAd2lkdGggPiBAY2FudmFzLmVsZW1lbnQucmVhbFdpZHRoXG4gICAgb3V0c2lkZVggICAgID0gb3V0c2lkZUxlZnQgfHwgb3V0c2lkZVJpZ2h0XG5cbiAgICBvdXRzaWRlVG9wICAgID0gQHBvc2l0aW9uLnkgPCAtQGhlaWdodFxuICAgIG91dHNpZGVCb3R0b20gPSBAcG9zaXRpb24ueSAtIEBoZWlnaHQgPiBAY2FudmFzLmVsZW1lbnQucmVhbFdoZWlnaHRcbiAgICBvdXRzaWRlWSAgICAgID0gb3V0c2lkZVRvcCB8fCBvdXRzaWRlQm90dG9tXG5cbiAgICByZXR1cm4gb3V0c2lkZVggfHwgb3V0c2lkZVlcblxuICByZW1vdmVTZWxmRnJvbVBhcmVudDogLT5cblxuICAgIEBwYXJlbnQucmVtb3ZlRW50aXR5KEBpZCkgaWYgQHBhcmVudD9cblxuICAgIHJldHVybiB0aGlzXG5cbiAgdXBkYXRlOiAtPlxuXG4gICAgaWYgQGlzT3V0c2lkZUNhbnZhc0JvdW5kcygpXG4gICAgICBAY2FudmFzRXhpdENhbGxiYWNrKCkgICBpZiBAY2FudmFzRXhpdENhbGxiYWNrP1xuICAgICAgQHJlbW92ZVNlbGZGcm9tUGFyZW50KCkgaWYgQHJlbW92ZU9uQ2FudmFzRXhpdFxuXG4gICAgcmV0dXJuIHRoaXNcbiIsIlxuY2xhc3MgU2NlbmVcblxuICBjb25zdHJ1Y3RvcjogLT5cblxuICAgIEBlbnRpdGllc0NvdW50ICAgICAgICAgID0gMFxuICAgIEBlbnRpdHlJZHMgICAgICAgICAgICAgID0gW11cbiAgICBAZW50aXRpZXMgICAgICAgICAgICAgICA9IFtdXG4gICAgQGVudGl0aWVzUGVuZGluZ1JlbW92YWwgPSBbXVxuICAgIEB1cGRhdGVzSW5CYWNrR3JvdW5kICAgID0gZmFsc2VcblxuICAgIHJldHVybiB0aGlzXG5cbiAgYWRkRW50aXR5OiAoZW50aXR5LCB1bnNoaWZ0ID0gZmFsc2UpIC0+XG5cbiAgICBpZiAhdW5zaGlmdFxuICAgICAgQGVudGl0eUlkcy5wdXNoKGVudGl0eS5pZClcbiAgICAgIEBlbnRpdGllcy5wdXNoKGVudGl0eSlcbiAgICBlbHNlXG4gICAgICBAZW50aXR5SWRzLnVuc2hpZnQoZW50aXR5LmlkKVxuICAgICAgQGVudGl0aWVzLnVuc2hpZnQoZW50aXR5KVxuXG4gICAgQGVudGl0aWVzQ291bnQgKz0gMVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBsb2FkOiAtPlxuXG4gICAgQGNvbmZpZyA9IEFwcC5nZXRIZWxwZXIoJ2NvbmZpZycpXG4gICAgQGRldmljZSA9IEFwcC5nZXRIZWxwZXIoJ2RldmljZScpXG4gICAgQGlucHV0ICA9IEFwcC5nZXRIZWxwZXIoJ2lucHV0JylcbiAgICBAdWkgICAgID0gQXBwLmdldEhlbHBlcigndWknKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICByZW1vdmVBbGxFbnRpdGllczogLT5cblxuICAgIEBlbnRpdGllc0NvdW50ID0gMFxuICAgIEBlbnRpdGllcyAgICAgID0gW11cbiAgICBAZW50aXR5SWRzICAgICA9IFtdXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHJlbW92ZUVudGl0eTogKGlkKSAtPlxuXG4gICAgQGVudGl0aWVzUGVuZGluZ1JlbW92YWwucHVzaChpZClcblxuICAgIHJldHVybiB0aGlzXG5cbiAgdW5sb2FkOiAtPlxuXG4gICAgI0ByZW1vdmVBbGxFbnRpdGllcygpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHVwZGF0ZTogLT5cblxuICAgIGlmIEBlbnRpdGllc0NvdW50ID4gMFxuICAgICAgQHVwZGF0ZUVudGl0aWVzKClcblxuICAgICAgQHByb2Nlc3NFbnRpdGllc01hcmtlZEZvclJlbW92YWwoKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICB1cGRhdGVFbnRpdGllczogLT5cblxuICAgIGVudGl0eS51cGRhdGUoKSBmb3IgZW50aXR5IGluIEBlbnRpdGllc1xuXG4gICAgcmV0dXJuIHRoaXNcblxuICBwcm9jZXNzRW50aXRpZXNNYXJrZWRGb3JSZW1vdmFsOiAtPlxuXG4gICAgZm9yIGlkIGluIEBlbnRpdGllc1BlbmRpbmdSZW1vdmFsXG4gICAgICBpbmRleCA9IEBlbnRpdHlJZHMuaW5kZXhPZihpZClcblxuICAgICAgQGVudGl0aWVzLnNwbGljZShpbmRleCwgMSlcbiAgICAgIEBlbnRpdHlJZHMuc3BsaWNlKGluZGV4LCAxKVxuXG4gICAgICBAZW50aXRpZXNDb3VudCAtPSAxXG5cbiAgICBAZW50aXRpZXNQZW5kaW5nUmVtb3ZhbCA9IFtdXG5cbiAgICBAZW50aXRpZXNDb3VudCA9IDAgaWYgQGVudGl0aWVzQ291bnQgPCAwXG4iLCJcbmNsYXNzIEdhbWVPdmVyU2NlbmUgZXh0ZW5kcyBTY2VuZVxuXG4gIGNvbnN0cnVjdG9yOiAtPlxuXG4gICAgc3VwZXJcblxuICAgIEBpZCAgICAgICAgICAgICAgICAgID0gJ2dhbWUtb3ZlcidcbiAgICBAcGxheUFnYWluRXZlbnRCb3VuZCA9IGZhbHNlXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIGxvYWQ6IC0+XG5cbiAgICBzdXBlclxuXG4gICAgQGlucHV0LmFkZEV2ZW50TGlzdGVuZXIgJy5wbGF5LWFnYWluJywgJ2NsaWNrJywgPT5cbiAgICAgIEB1aS50cmFuc2l0aW9uVG8oJ3BsYXlpbmcnKVxuICAgICAgcmV0dXJuXG5cbiAgICByZXR1cm4gdGhpc1xuIiwiXG5jbGFzcyBJZGVudFNjZW5lIGV4dGVuZHMgU2NlbmVcblxuICBjb25zdHJ1Y3RvcjogLT5cblxuICAgIHN1cGVyXG5cbiAgICBAaWQgPSAnaWRlbnQnXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIGxvYWQ6IC0+XG5cbiAgICBzdXBlclxuXG4gICAgd2luZG93LnNldFRpbWVvdXQgPT5cbiAgICAgIEB1aS50cmFuc2l0aW9uVG8oJ3RpdGxlJylcbiAgICAsIDI1MDBcblxuICAgIHJldHVybiB0aGlzXG4iLCJcbmNsYXNzIFBsYXlpbmdTY2VuZSBleHRlbmRzIFNjZW5lXG5cbiAgY29uc3RydWN0b3I6IC0+XG5cbiAgICBzdXBlclxuXG4gICAgQGlkICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPSAncGxheWluZydcbiAgICBAdXBkYXRlc0luQmFja0dyb3VuZCAgICAgICAgICAgICA9IHRydWVcbiAgICBAbGV2ZWxVcEludGVydmFsICAgICAgICAgICAgICAgICA9IDUwMDBcbiAgICBAbWF4TGV2ZWwgICAgICAgICAgICAgICAgICAgICAgICA9IDUwXG4gICAgQG1heERpYW1ldGVyQXNQZXJjZW50YWdlT2ZTY3JlZW4gPSAxNVxuICAgIEBtYXhMaW5lV2lkdGggICAgICAgICAgICAgICAgICAgID0gNVxuICAgIEBwb2ludHNQZXJQb3AgICAgICAgICAgICAgICAgICAgID0gMTBcblxuICAgIHJldHVybiB0aGlzXG5cbiAgbG9hZDogLT5cblxuICAgIHN1cGVyXG5cbiAgICBAdWkucmVnaXN0ZXJFbGVtZW50KCdjb21ib011bHRpcGxpZXJDb3VudGVyJywgJy5odWQtdmFsdWUtY29tYm8nKVxuICAgIEB1aS5yZWdpc3RlckVsZW1lbnQoJ2xldmVsQ291bnRlcicsICAgICAgICAgICAnLmh1ZC12YWx1ZS1sZXZlbCcpXG4gICAgQHVpLnJlZ2lzdGVyRWxlbWVudCgnc2NvcmVDb3VudGVyJywgICAgICAgICAgICcuaHVkLXZhbHVlLXNjb3JlJylcblxuICAgIEBjb21ib011bHRpcGxpZXIgPSAwXG4gICAgQGxldmVsICAgICAgICAgICA9IDFcbiAgICBAc2NvcmUgICAgICAgICAgID0gMFxuXG4gICAgQHNldHVwTGV2ZWxVcEluY3JlbWVudCgpXG5cbiAgICBAc2V0SGVhZHNVcFZhbHVlcygpXG5cbiAgICBAdGFyZ2V0QnViYmxlc0NvdW50ID0gMFxuXG4gICAgQHBsYXlpbmcgPSB0cnVlXG5cbiAgICBAc2V0dXBEaWZmaWN1bHR5Q29uZmlnKClcblxuICAgIHJldHVybiB0aGlzXG5cbiAgZGVjcmVtZW50VGFyZ2V0QnViYmxlc0NvdW50OiAtPlxuXG4gICAgQHRhcmdldEJ1YmJsZXNDb3VudCAtPSAxXG5cbiAgICBpZiBAdGFyZ2V0QnViYmxlc0NvdW50IDwgMFxuICAgICAgQHRhcmdldEJ1YmJsZXNDb3VudCA9IDBcblxuICAgIHJldHVybiB0aGlzXG5cbiAgZ2FtZU92ZXI6IC0+XG5cbiAgICBAdWkudHJhbnNpdGlvblRvKCdnYW1lLW92ZXInKVxuICAgIEBpbnB1dC5yZW1vdmVBbGxFbnRpdGllcygpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIGdlbmVyYXRlQnViYmxlOiAtPlxuXG4gICAgaWYgQHBsYXlpbmcgJiYgcmFuZG9tUGVyY2VudGFnZSgpIDwgQGRpZmZpY3VsdHlDb25maWdbJ2J1YmJsZVNwYXduQ2hhbmNlJ10uY3VycmVudFxuICAgICAgYnViYmxlQ29uZmlnID0gQG5ld0J1YmJsZUNvbmZpZygpXG4gICAgICBidWJibGUgICAgICAgPSBuZXcgQnViYmxlRW50aXR5KHRoaXMsIGJ1YmJsZUNvbmZpZylcblxuICAgICAgaWYgYnViYmxlLmlzVGFyZ2V0XG4gICAgICAgIEBhZGRFbnRpdHkoYnViYmxlKVxuICAgICAgICBAaW5wdXQuYWRkRW50aXR5KGJ1YmJsZSlcbiAgICAgIGVsc2VcbiAgICAgICAgQGFkZEVudGl0eShidWJibGUsIHRydWUpXG5cbiAgICAgIEB0YXJnZXRCdWJibGVzQ291bnQgKz0gMSBpZiBidWJibGUuaXNUYXJnZXRcblxuICAgIHJldHVybiB0aGlzXG5cbiAgbmV3QnViYmxlQ29uZmlnOiAtPlxuXG4gICAgcmV0dXJuIHtcbiAgICAgIGJ1YmJsZUdyb3d0aE11bHRpcGxpZXI6ICAgQGRpZmZpY3VsdHlDb25maWdbJ2J1YmJsZUdyb3d0aE11bHRpcGxpZXInXS5jdXJyZW50XG4gICAgICBjaGFuY2VCdWJibGVJc1RhcmdldDogICAgIEBkaWZmaWN1bHR5Q29uZmlnWydjaGFuY2VCdWJibGVJc1RhcmdldCddLmN1cnJlbnRcbiAgICAgIGRpYW1ldGVyTWF4OiAgICAgICAgICAgICAgQGRpZmZpY3VsdHlDb25maWdbJ2RpYW1ldGVyTWF4J10uY3VycmVudFxuICAgICAgbWF4VGFyZ2V0c0F0T25jZTogICAgICAgICBAZGlmZmljdWx0eUNvbmZpZ1snbWF4VGFyZ2V0c0F0T25jZSddLmN1cnJlbnRcbiAgICAgIG1pblRhcmdldERpYW1ldGVyOiAgICAgICAgQGRpZmZpY3VsdHlDb25maWdbJ21pblRhcmdldERpYW1ldGVyJ10uY3VycmVudFxuICAgICAgdGFyZ2V0VmVsb2NpdHlNdWx0aXBsaWVyOiBAZGlmZmljdWx0eUNvbmZpZ1sndGFyZ2V0VmVsb2NpdHlNdWx0aXBsaWVyJ10uY3VycmVudFxuICAgICAgdmVsb2NpdHlNYXg6ICAgICAgICAgICAgICBAZGlmZmljdWx0eUNvbmZpZ1sndmVsb2NpdHlNYXgnXS5jdXJyZW50XG4gICAgICB2ZWxvY2l0eU1pbjogICAgICAgICAgICAgIEBkaWZmaWN1bHR5Q29uZmlnWyd2ZWxvY2l0eU1pbiddLmN1cnJlbnRcbiAgICAgIG1heExpbmVXaWR0aDogICAgICAgICAgICAgQG1heExpbmVXaWR0aFxuICAgICAgcGxheWluZzogICAgICAgICAgICAgICAgICBAcGxheWluZ1xuICAgICAgdGFyZ2V0QnViYmxlc0NvdW50OiAgICAgICBAdGFyZ2V0QnViYmxlc0NvdW50XG4gICAgfVxuXG4gIHNldHVwRGlmZmljdWx0eUNvbmZpZzogLT5cblxuICAgIG1heERpYW1ldGVyID0gKEBkZXZpY2Uuc2NyZWVuLndpZHRoIC8gMTAwKSAqIEBtYXhEaWFtZXRlckFzUGVyY2VudGFnZU9mU2NyZWVuXG5cbiAgICBAZGlmZmljdWx0eUNvbmZpZyA9XG4gICAgICBidWJibGVHcm93dGhNdWx0aXBsaWVyOiAgIHsgY3VycmVudDogMCwgZWFzeTogMS4wNSwgICAgICAgICAgICAgIGRpZmZpY3VsdDogMS4xMCAgICAgICAgICAgICAgfVxuICAgICAgYnViYmxlU3Bhd25DaGFuY2U6ICAgICAgICB7IGN1cnJlbnQ6IDAsIGVhc3k6IDYwLCAgICAgICAgICAgICAgICBkaWZmaWN1bHQ6IDEwMCAgICAgICAgICAgICAgIH1cbiAgICAgIGNoYW5jZUJ1YmJsZUlzVGFyZ2V0OiAgICAgeyBjdXJyZW50OiAwLCBlYXN5OiA1MCwgICAgICAgICAgICAgICAgZGlmZmljdWx0OiA5MCAgICAgICAgICAgICAgICB9XG4gICAgICBkaWFtZXRlck1heDogICAgICAgICAgICAgIHsgY3VycmVudDogMCwgZWFzeTogbWF4RGlhbWV0ZXIsICAgICAgIGRpZmZpY3VsdDogbWF4RGlhbWV0ZXIgKiAwLjYgfVxuICAgICAgbWF4VGFyZ2V0c0F0T25jZTogICAgICAgICB7IGN1cnJlbnQ6IDAsIGVhc3k6IDMsICAgICAgICAgICAgICAgICBkaWZmaWN1bHQ6IDYgICAgICAgICAgICAgICAgIH1cbiAgICAgIG1pblRhcmdldERpYW1ldGVyOiAgICAgICAgeyBjdXJyZW50OiAwLCBlYXN5OiBtYXhEaWFtZXRlciAqIDAuNywgZGlmZmljdWx0OiBtYXhEaWFtZXRlciAqIDAuNCB9XG4gICAgICB0YXJnZXRWZWxvY2l0eU11bHRpcGxpZXI6IHsgY3VycmVudDogMCwgZWFzeTogMC4zLCAgICAgICAgICAgICAgIGRpZmZpY3VsdDogMC41ICAgICAgICAgICAgICAgfVxuICAgICAgdmVsb2NpdHlNYXg6ICAgICAgICAgICAgICB7IGN1cnJlbnQ6IDAsIGVhc3k6IDQsICAgICAgICAgICAgICAgICBkaWZmaWN1bHQ6IDcgICAgICAgICAgICAgICAgIH1cbiAgICAgIHZlbG9jaXR5TWluOiAgICAgICAgICAgICAgeyBjdXJyZW50OiAwLCBlYXN5OiAtNCwgICAgICAgICAgICAgICAgZGlmZmljdWx0OiAtNyAgICAgICAgICAgICAgICB9XG5cbiAgICBAdXBkYXRlVmFsdWVzRm9yRGlmZmljdWx0eSgpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHNldEhlYWRzVXBWYWx1ZXM6IC0+XG5cbiAgICB1cGRhdGVVSVRleHROb2RlKEB1aS5lbGVtZW50KCdjb21ib011bHRpcGxpZXJDb3VudGVyJyksIEBjb21ib011bHRpcGxpZXIpXG4gICAgdXBkYXRlVUlUZXh0Tm9kZShAdWkuZWxlbWVudCgnbGV2ZWxDb3VudGVyJyksICAgICAgICAgICBAbGV2ZWwpXG4gICAgdXBkYXRlVUlUZXh0Tm9kZShAdWkuZWxlbWVudCgnc2NvcmVDb3VudGVyJyksICAgICAgICAgICBmb3JtYXRXaXRoQ29tbWEoQHNjb3JlKSlcblxuICAgIHJldHVybiB0aGlzXG5cbiAgc2V0dXBMZXZlbFVwSW5jcmVtZW50OiAtPlxuXG4gICAgQGxldmVsVXBDb3VudGVyID0gd2luZG93LnNldEludGVydmFsID0+XG4gICAgICBAdXBkYXRlTGV2ZWwoKVxuICAgICAgcmV0dXJuXG4gICAgLCBAbGV2ZWxVcEludGVydmFsXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHN0b3BMZXZlbFVwSW5jcmVtZW50OiAtPlxuXG4gICAgd2luZG93LmNsZWFySW50ZXJ2YWwoQGxldmVsVXBDb3VudGVyKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICB1bmxvYWQ6IC0+XG5cbiAgICBpZiBAcGxheWluZyA9PSB0cnVlXG4gICAgICBmb3IgYnViYmxlIGluIEBlbnRpdGllc1xuICAgICAgICBidWJibGUuZGVzdHJveWluZyA9IHRydWVcblxuICAgICAgQHBsYXlpbmcgPSBmYWxzZVxuXG4gICAgICBAc3RvcExldmVsVXBJbmNyZW1lbnQoKVxuXG4gIHVwZGF0ZTogLT5cblxuICAgIHN1cGVyXG5cbiAgICBAZ2VuZXJhdGVCdWJibGUoKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICB1cGRhdGVDb21ib011bHRpcGxpZXI6ICh0YXJnZXRIaXQpIC0+XG5cbiAgICBpZiB0YXJnZXRIaXRcbiAgICAgIEBjb21ib011bHRpcGxpZXIgKz0gMVxuICAgIGVsc2VcbiAgICAgIEBjb21ib011bHRpcGxpZXIgPSAwXG5cbiAgICBAc2V0SGVhZHNVcFZhbHVlcygpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHVwZGF0ZUxldmVsOiAtPlxuXG4gICAgQGxldmVsICs9IDFcblxuICAgIGlmIEBsZXZlbCA+PSBAbWF4TGV2ZWxcbiAgICAgIHdpbmRvdy5jbGVhckludGVydmFsKEBsZXZlbFVwQ291bnRlcilcblxuICAgIEBzZXRIZWFkc1VwVmFsdWVzKClcblxuICAgIEB1cGRhdGVWYWx1ZXNGb3JEaWZmaWN1bHR5KClcblxuICAgIHJldHVybiB0aGlzXG5cbiAgdXBkYXRlU2NvcmU6IChzaXplV2hlblRhcHBlZCwgc2l6ZVdoZW5GdWxseUdyb3duKSAtPlxuXG4gICAgIygoZGVmYXVsdFNjb3JlUGVyUG9wICsgKDEwMCAtICgoc2l6ZVdoZW5UYXBwZWQgLyBzaXplV2hlbkZ1bGx5R3Jvd24pICogMTAwKSkpICogY29tYm9NdWx0aXBsaWVyKSAqIChsZXZlbE51bWJlciArIDEpXG5cbiAgICB0YXJnZXRTaXplQm9udXMgPSBNYXRoLnJvdW5kKDEwMCAtICgoc2l6ZVdoZW5UYXBwZWQgLyBzaXplV2hlbkZ1bGx5R3Jvd24pICogMTAwKSlcbiAgICBwb3BQb2ludFZhbHVlICAgPSBAcG9pbnRzUGVyUG9wICsgdGFyZ2V0U2l6ZUJvbnVzXG4gICAgbGV2ZWxNdWx0aXBsaWVyID0gQGxldmVsICsgMVxuXG4gICAgQHNjb3JlICs9IChwb3BQb2ludFZhbHVlICogQGNvbWJvTXVsdGlwbGllcikgKiBsZXZlbE11bHRpcGxpZXJcblxuICAgIEBzZXRIZWFkc1VwVmFsdWVzKClcblxuICAgIHJldHVybiB0aGlzXG5cbiAgdXBkYXRlVmFsdWVzRm9yRGlmZmljdWx0eTogLT5cblxuICAgIGxldmVsTXVsaXRwbGllciA9IEBsZXZlbCAvIEBtYXhMZXZlbFxuXG4gICAgZm9yIHByb3BlcnR5TmFtZSwgcHJvcGVydHlWYWx1ZXMgb2YgQGRpZmZpY3VsdHlDb25maWdcbiAgICAgIHZhbHVlRGlmZmVyZW5jZSA9IHByb3BlcnR5VmFsdWVzLmRpZmZpY3VsdCAtIHByb3BlcnR5VmFsdWVzLmVhc3lcbiAgICAgIGFkanVzdGVkVmFsdWUgICA9ICh2YWx1ZURpZmZlcmVuY2UgKiBsZXZlbE11bGl0cGxpZXIpICsgcHJvcGVydHlWYWx1ZXMuZWFzeVxuXG4gICAgICBAZGlmZmljdWx0eUNvbmZpZ1twcm9wZXJ0eU5hbWVdLmN1cnJlbnQgPSBhZGp1c3RlZFZhbHVlXG5cbiAgICByZXR1cm4gdGhpc1xuIiwiXG5jbGFzcyBUaXRsZVNjZW5lIGV4dGVuZHMgU2NlbmVcblxuICBjb25zdHJ1Y3RvcjogLT5cblxuICAgIHN1cGVyXG5cbiAgICBAaWQgPSAndGl0bGUnXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIGxvYWQ6IC0+XG5cbiAgICBzdXBlclxuXG4gICAgQGlucHV0LmFkZEV2ZW50TGlzdGVuZXIgJy5nYW1lLWxvZ28nLCAnY2xpY2snLCA9PlxuICAgICAgQHVpLnRyYW5zaXRpb25UbygncGxheWluZycpXG4gICAgICByZXR1cm5cblxuICAgIHJldHVybiB0aGlzXG5cbiAgdW5sb2FkOiAtPlxuXG4gICAgc3VwZXJcblxuICAgIHJldHVybiB0aGlzXG4iLCJcbmNsYXNzIEJ1YmJsZUVudGl0eSBleHRlbmRzIEVudGl0eVxuXG4gIGNvbnN0cnVjdG9yOiAocGFyZW50LCBjb25maWdWYWx1ZXMpIC0+XG5cbiAgICBzdXBlclxuXG4gICAgQHBhcmVudCAgICAgICA9IHBhcmVudFxuICAgIEBjb25maWdWYWx1ZXMgPSBjb25maWdWYWx1ZXNcblxuICAgIEBoZWlnaHQgICA9IDBcbiAgICBAaWQgICAgICAgPSBcImJ1YmJsZV9cIiArIE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cigyLCA1KVxuICAgIEBwb3NpdGlvbiA9XG4gICAgICB4OiBAZGV2aWNlLnNjcmVlbi53aWR0aCAgLyAyXG4gICAgICB5OiBAZGV2aWNlLnNjcmVlbi5oZWlnaHQgLyAyXG4gICAgQHZlbG9jaXR5ID1cbiAgICAgIHg6IHJhbmRvbShAY29uZmlnVmFsdWVzLnZlbG9jaXR5TWluLCBAY29uZmlnVmFsdWVzLnZlbG9jaXR5TWF4KVxuICAgICAgeTogcmFuZG9tKEBjb25maWdWYWx1ZXMudmVsb2NpdHlNaW4sIEBjb25maWdWYWx1ZXMudmVsb2NpdHlNYXgpXG4gICAgQHdpZHRoICAgID0gMFxuXG4gICAgQGFscGhhICAgICAgICAgICAgPSAwLjc1XG4gICAgQGNvbG9yICAgICAgICAgICAgPSByYW5kb21Db2xvcigpXG4gICAgQGRlc3Ryb3lpbmcgICAgICAgPSBmYWxzZVxuICAgIEBkaWFtZXRlciAgICAgICAgID0gMVxuICAgIEBmaWxsQ29sb3IgICAgICAgID0gQGNvbG9yXG4gICAgQHN0cm9rZUNvbG9yICAgICAgPSBAY29sb3JcbiAgICBAZmluYWxEaWFtZXRlciAgICA9IHJhbmRvbUludGVnZXIoMCwgY29uZmlnVmFsdWVzLmRpYW1ldGVyTWF4KVxuICAgIEBpc1RhcmdldCAgICAgICAgID0gQGRldGVybWluZVRhcmdldEJ1YmJsZSgpXG4gICAgQHJhZGl1cyAgICAgICAgICAgPSAwLjVcbiAgICBAc2hyaW5rTXVsdGlwbGllciA9IDAuOVxuXG4gICAgaWYgQGlzVGFyZ2V0XG4gICAgICBAYWxwaGEgICAgICAgICA9IDAuOVxuICAgICAgQGZpbGxDb2xvciAgICAgPSBcIjI0MCwgMjQwLCAyNDBcIlxuICAgICAgQGZpbmFsRGlhbWV0ZXIgPSByYW5kb21JbnRlZ2VyKEBjb25maWdWYWx1ZXMubWluVGFyZ2V0RGlhbWV0ZXIsIEBjb25maWdWYWx1ZXMuZGlhbWV0ZXJNYXgpXG4gICAgICBAbGluZVdpZHRoICAgICA9IEBkaWFtZXRlciAvIDEwXG5cbiAgICAgIEB2ZWxvY2l0eS54ICo9IEBjb25maWdWYWx1ZXMudGFyZ2V0VmVsb2NpdHlNdWx0aXBsaWVyXG4gICAgICBAdmVsb2NpdHkueSAqPSBAY29uZmlnVmFsdWVzLnRhcmdldFZlbG9jaXR5TXVsdGlwbGllclxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBjYW52YXNFeGl0Q2FsbGJhY2s6IC0+XG5cbiAgICBzdXBlclxuXG4gICAgQHBhcmVudC5nYW1lT3ZlcigpIGlmIEBpc1RhcmdldFxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBkZXRlcm1pbmVUYXJnZXRCdWJibGU6IC0+XG5cbiAgICBpZiBAY29uZmlnVmFsdWVzLnRhcmdldEJ1YmJsZXNDb3VudCA8IEBjb25maWdWYWx1ZXMubWF4VGFyZ2V0c0F0T25jZVxuICAgICAgcmV0dXJuIHJhbmRvbVBlcmNlbnRhZ2UoKSA8IEBjb25maWdWYWx1ZXMuY2hhbmNlQnViYmxlSXNUYXJnZXRcblxuICAgIHJldHVybiBmYWxzZVxuXG4gIHJlbmRlcjogLT5cblxuICAgIEBjb250ZXh0LmxpbmVXaWR0aCAgID0gQGxpbmVXaWR0aFxuICAgIEBjb250ZXh0LmZpbGxTdHlsZSAgID0gcmdiYShAZmlsbENvbG9yLCAgIEBhbHBoYSlcbiAgICBAY29udGV4dC5zdHJva2VTdHlsZSA9IHJnYmEoQHN0cm9rZUNvbG9yLCBAYWxwaGEpXG5cbiAgICBAY29udGV4dC5iZWdpblBhdGgoKVxuICAgIEBjb250ZXh0LmFyYyhAcG9zaXRpb24ueCwgQHBvc2l0aW9uLnksIEByYWRpdXMsIDAsIE1hdGguUEkgKiAyLCB0cnVlKVxuICAgIEBjb250ZXh0LmZpbGwoKVxuICAgIEBjb250ZXh0LnN0cm9rZSgpIGlmIEBpc1RhcmdldFxuICAgIEBjb250ZXh0LmNsb3NlUGF0aCgpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHVwZGF0ZTogLT5cblxuICAgIHN1cGVyXG5cbiAgICBpZiBAZGVzdHJveWluZ1xuICAgICAgQGRpYW1ldGVyICo9IChpZiBAcGFyZW50LnBsYXlpbmcgdGhlbiAwLjYgZWxzZSBAc2hyaW5rTXVsdGlwbGllcilcblxuICAgICAgQHJlbW92ZVNlbGZGcm9tUGFyZW50KCkgaWYgQGRpYW1ldGVyIDwgMVxuICAgIGVsc2VcbiAgICAgIEBkaWFtZXRlciAqPSBAY29uZmlnVmFsdWVzLmJ1YmJsZUdyb3d0aE11bHRpcGxpZXIgaWYgQGRpYW1ldGVyIDwgQGZpbmFsRGlhbWV0ZXJcblxuICAgIEBkaWFtZXRlciAgPSBjbGFtcChAZGlhbWV0ZXIsIDAsIEBmaW5hbERpYW1ldGVyKVxuICAgIEBsaW5lV2lkdGggPSBjbGFtcChAZGlhbWV0ZXIgLyAxMCwgMCwgQGNvbmZpZ1ZhbHVlcy5tYXhMaW5lV2lkdGgpIGlmIEBpc1RhcmdldFxuXG4gICAgQGhlaWdodCA9IEBkaWFtZXRlclxuICAgIEB3aWR0aCAgPSBAZGlhbWV0ZXJcbiAgICBAcmFkaXVzID0gQGRpYW1ldGVyIC8gMlxuXG4gICAgQHBvc2l0aW9uLnggKz0gQGFuaW1hdGlvbkxvb3AuY29ycmVjdFZhbHVlKEB2ZWxvY2l0eS54KVxuICAgIEBwb3NpdGlvbi55ICs9IEBhbmltYXRpb25Mb29wLmNvcnJlY3RWYWx1ZShAdmVsb2NpdHkueSlcblxuICAgIEBhZGRTZWxmVG9SZW5kZXJRdWV1ZSgpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHdhc1RhcHBlZDogKCkgLT5cblxuICAgIHRvdWNoRGF0YSA9IEBpbnB1dC50b3VjaERhdGFcblxuICAgIHRhcFggICAgICA9IHRvdWNoRGF0YS54XG4gICAgdGFwWSAgICAgID0gdG91Y2hEYXRhLnlcbiAgICBkaXN0YW5jZVggPSB0YXBYIC0gQHBvc2l0aW9uLnhcbiAgICBkaXN0YW5jZVkgPSB0YXBZIC0gQHBvc2l0aW9uLnlcbiAgICB0YXBwZWQgICAgPSAoZGlzdGFuY2VYICogZGlzdGFuY2VYKSArIChkaXN0YW5jZVkgKiBkaXN0YW5jZVkpIDwgKEByYWRpdXMgKiBAcmFkaXVzKVxuXG4gICAgIyMjXG4gICAgaWYgdGFwcGVkXG4gICAgICBkZWJ1Z0NvbnNvbGUoXCJCdWJibGUjI3tAaWR9IHRhcHBlZCBhdCAje3RhcFh9LCAje3RhcFl9XCIpXG4gICAgZWxzZVxuICAgICAgZGVidWdDb25zb2xlKFwiQ29tYm8gQnJva2VuIVwiKVxuICAgICMjI1xuXG4gICAgcmV0dXJuIHRhcHBlZFxuXG4gIHRhcEhhbmRsZXI6ICh0YXJnZXRIaXQpIC0+XG5cbiAgICBAcGFyZW50LnVwZGF0ZUNvbWJvTXVsdGlwbGllcih0YXJnZXRIaXQpXG5cbiAgICBpZiB0YXJnZXRIaXRcbiAgICAgIEBwYXJlbnQudXBkYXRlU2NvcmUoQGRpYW1ldGVyLCBAZmluYWxEaWFtZXRlcilcbiAgICAgIEBkZXN0cm95aW5nID0gdHJ1ZVxuICAgICAgQHBhcmVudC5kZWNyZW1lbnRUYXJnZXRCdWJibGVzQ291bnQoKVxuICAgICAgQGlucHV0LnF1ZXVlRW50aXR5Rm9yUmVtb3ZhbChAaWQpXG5cbiAgICByZXR1cm4gdGhpc1xuIiwiXG4jIExvYWQgdGhlIG1haW4gYXBwIHdyYXBwZXJcbkFwcCA9IG5ldyBBcHBsaWNhdGlvbigpXG5cbiMgR2V0IHVwIGdldCBvbiBnZXQgdXAgZ2V0IG9uIHVwIHN0YXkgb24gdGhlIHNjZW5lIGV0YyBldGNcbkFwcC5sb2FkKClcblxuIyMjXG5jYWxsTmF0aXZlQXBwID0gLT5cbiAgdHJ5XG4gICAgICB3ZWJraXQubWVzc2FnZUhhbmRsZXJzLmNhbGxiYWNrSGFuZGxlci5wb3N0TWVzc2FnZShcIkhlbGxvIGZyb20gSmF2YVNjcmlwdFwiKVxuICBjYXRjaCBlcnJcbiAgICAgIGNvbnNvbGUubG9nKCdUaGUgbmF0aXZlIGNvbnRleHQgZG9lcyBub3QgZXhpc3QgeWV0Jylcblxud2luZG93LnNldFRpbWVvdXQgLT5cbiAgICBjYWxsTmF0aXZlQXBwKClcbiwgMTAwMFxuIyMjXG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=