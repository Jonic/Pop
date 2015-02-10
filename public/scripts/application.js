var $, calcSpeed, clamp, correctValueForDPR, debugConsole, formatWithComma, fps, random, randomColor, randomInteger, randomPercentage, rgba, updateUITextNode;

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

calcSpeed = function(speed, delta) {
  return (speed * delta) * (60 / 1000);
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
        easy: 6,
        difficult: 10
      },
      velocityMin: {
        current: 0,
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
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInV0aWxzLmNvZmZlZSIsIkFuaW1hdGlvbkxvb3BIZWxwZXIuY29mZmVlIiwiQ2FudmFzSGVscGVyLmNvZmZlZSIsIkNvbmZpZ0hlbHBlci5jb2ZmZWUiLCJEZXZpY2VIZWxwZXIuY29mZmVlIiwiSW5wdXRIZWxwZXIuY29mZmVlIiwiUmVuZGVyZXJIZWxwZXIuY29mZmVlIiwiVXNlckludGVyZmFjZUhlbHBlci5jb2ZmZWUiLCJBcHBsaWNhdGlvbi5jb2ZmZWUiLCJFbnRpdHkuY29mZmVlIiwiU2NlbmUuY29mZmVlIiwiR2FtZU92ZXJTY2VuZS5jb2ZmZWUiLCJJZGVudFNjZW5lLmNvZmZlZSIsIlBsYXlpbmdTY2VuZS5jb2ZmZWUiLCJUaXRsZVNjZW5lLmNvZmZlZSIsIkJ1YmJsZUVudGl0eS5jb2ZmZWUiLCJib290c3RyYXAuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLElBQUEseUpBQUE7O0FBQUEsQ0FBQSxHQUFJLFNBQUMsUUFBRCxHQUFBO0FBRUYsTUFBQSxHQUFBO0FBQUEsRUFBQSxJQUF3QixRQUFBLEtBQVksTUFBcEM7QUFBQSxXQUFPLFFBQVEsQ0FBQyxJQUFoQixDQUFBO0dBQUE7QUFFQSxFQUFBLElBQTRDLFFBQVEsQ0FBQyxNQUFULENBQWdCLENBQWhCLEVBQW1CLENBQW5CLENBQUEsS0FBeUIsR0FBckU7QUFBQSxXQUFPLFFBQVEsQ0FBQyxjQUFULENBQXdCLFFBQXhCLENBQVAsQ0FBQTtHQUZBO0FBQUEsRUFJQSxHQUFBLEdBQU0sUUFBUSxDQUFDLGdCQUFULENBQTBCLFFBQTFCLENBSk4sQ0FBQTtBQU1BLEVBQUEsSUFBaUIsR0FBRyxDQUFDLE1BQUosS0FBYyxDQUEvQjtBQUFBLFdBQU8sR0FBSSxDQUFBLENBQUEsQ0FBWCxDQUFBO0dBTkE7QUFRQSxTQUFPLEdBQVAsQ0FWRTtBQUFBLENBQUosQ0FBQTs7QUFBQSxTQVlBLEdBQVksU0FBQyxLQUFELEVBQVEsS0FBUixHQUFBO0FBRVYsU0FBTyxDQUFDLEtBQUEs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UkE7QUFlQSxXQUFPLE1BQVAsQ0FqQlM7RUFBQSxDQTdGWCxDQUFBOztBQUFBLHlCQWdIQSxVQUFBLEdBQVksU0FBQyxTQUFELEdBQUE7QUFFVixJQUFBLElBQUMsQ0FBQSxNQUFNLENBQUMscUJBQVIsQ0FBOEIsU0FBOUIsQ0FBQSxDQUFBO0FBRUEsSUFBQSxJQUFHLFNBQUg7QUFDRSxNQUFBLElBQUMsQ0FBQSxNQUFNLENBQUMsV0FBUixDQUFvQixJQUFDLENBQUEsUUFBckIsRUFBK0IsSUFBQyxDQUFBLGFBQWhDLENBQUEsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLFVBQUQsR0FBYyxJQURkLENBQUE7QUFBQSxNQUVBLElBQUMsQ0FBQSxNQUFNLENBQUMsMkJBQVIsQ0FBQSxDQUZBLENBQUE7QUFBQSxNQUdBLElBQUMsQ0FBQSxLQUFLLENBQUMscUJBQVAsQ0FBNkIsSUFBQyxDQUFBLEVBQTlCLENBSEEsQ0FERjtLQUZBO0FBUUEsV0FBTyxJQUFQLENBVlU7RUFBQSxDQWhIWixDQUFBOztzQkFBQTs7R0FGeUIsT0FBM0IsQ0FBQTs7QUNDQSxJQUFBLEdBQUE7O0FBQUEsR0FBQSxHQUFVLElBQUEsV0FBQSxDQUFBLENBQVYsQ0FBQTs7QUFBQSxHQUdHLENBQUMsSUFBSixDQUFBLENBSEEsQ0FBQTs7QUFLQTtBQUFBOzs7Ozs7Ozs7O0dBTEEiLCJmaWxlIjoiYXBwbGljYXRpb24uanMiLCJzb3VyY2VzQ29udGVudCI6WyJcbiQgPSAoc2VsZWN0b3IpIC0+XG5cbiAgcmV0dXJuIGRvY3VtZW50LmJvZHkgaWYgc2VsZWN0b3IgPT0gJ2JvZHknXG5cbiAgcmV0dXJuIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHNlbGVjdG9yKSBpZiBzZWxlY3Rvci5zdWJzdHIoMCwgMSkgPT0gJyMnXG5cbiAgZWxzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcilcblxuICByZXR1cm4gZWxzWzBdIGlmIGVscy5sZW5ndGggPT0gMVxuXG4gIHJldHVybiBlbHNcblxuY2FsY1NwZWVkID0gKHNwZWVkLCBkZWx0YSkgLT5cblxuICByZXR1cm4gKHNwZWVkICogZGVsdGEpICogKDYwIC8gMTAwMClcblxuY2xhbXAgPSAodmFsdWUsIG1pbiwgbWF4KSAtPlxuXG4gIGlmIHZhbHVlIDwgbWluXG4gICAgdmFsdWUgPSBtaW5cbiAgZWxzZSBpZiB2YWx1ZSA+IG1heFxuICAgIHZhbHVlID0gbWF4XG5cbiAgcmV0dXJuIHZhbHVlXG5cbmNvcnJlY3RWYWx1ZUZvckRQUiA9ICh2YWx1ZSwgaW50ZWdlciA9IGZhbHNlKSAtPlxuXG4gIHZhbHVlICo9IGRldmljZVBpeGVsUmF0aW9cblxuICB2YWx1ZSA9IE1hdGgucm91bmQodmFsdWUpIGlmIGludGVnZXJcblxuICByZXR1cm4gdmFsdWVcblxuZGVidWdDb25zb2xlID0gKGNvbnRlbnQpIC0+XG5cbiAgZWxlbWVudCA9ICQoJy5kZWJ1Z0NvbnNvbGUnKVxuXG4gIHVwZGF0ZVVJVGV4dE5vZGUoZWxlbWVudCwgY29udGVudClcbiAgY29uc29sZS5sb2coY29udGVudClcblxuICByZXR1cm5cblxuZm9ybWF0V2l0aENvbW1hID0gKG51bSkgLT5cblxuICByZXR1cm4gbnVtLnRvU3RyaW5nKCkucmVwbGFjZSgvXFxCKD89KFxcZHszfSkrKD8hXFxkKSkvZywgXCIsXCIpXG5cbmZwcyA9ICh2YWx1ZSkgLT5cblxuICBlbGVtZW50ID0gJCgnLmZwcycpXG5cbiAgdXBkYXRlVUlUZXh0Tm9kZShlbGVtZW50LCB2YWx1ZSlcblxuICByZXR1cm5cblxucmFuZG9tID0gKG1pbiwgbWF4KSAtPlxuXG4gIGlmIG1pbiA9PSB1bmRlZmluZWRcbiAgICBtaW4gPSAwXG4gICAgbWF4ID0gMVxuICBlbHNlIGlmIG1heCA9PSB1bmRlZmluZWRcbiAgICBtYXggPSBtaW5cbiAgICBtaW4gPSAwXG5cbiAgcmV0dXJuIChNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbikpICsgbWluO1xuXG5yYW5kb21Db2xvciA9ICgpIC0+XG5cbiAgciA9IHJhbmRvbUludGVnZXIoMCwgMjAwKVxuICBnID0gcmFuZG9tSW50ZWdlcigwLCAyMDApXG4gIGIgPSByYW5kb21JbnRlZ2VyKDAsIDIwMClcblxuICByZXR1cm4gXCIje3J9LCAje2d9LCAje2J9XCJcblxucmFuZG9tSW50ZWdlciA9IChtaW4sIG1heCkgLT5cblxuICBpZiBtYXggPT0gdW5kZWZpbmVkXG4gICAgbWF4ID0gbWluXG4gICAgbWluID0gMFxuXG4gIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAobWF4ICsgMSAtIG1pbikpICsgbWluXG5cbnJhbmRvbVBlcmNlbnRhZ2UgPSAtPlxuXG4gIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxMDApXG5cbnJnYmEgPSAoY29sb3IsIGFscGhhID0gZmFsc2UpIC0+XG5cbiAgYWxwaGEgPSAxIGlmICFhbHBoYVxuXG4gIHJldHVybiBcInJnYmEoI3tjb2xvcn0sICN7YWxwaGF9KVwiXG5cbnVwZGF0ZVVJVGV4dE5vZGUgPSAoZWxlbWVudCwgdmFsdWUpIC0+XG5cbiAgZWxlbWVudC5pbm5lckhUTUwgPSB2YWx1ZVxuXG4gIHJldHVybiB0aGlzXG4iLCJcbmNsYXNzIEFuaW1hdGlvbkxvb3BIZWxwZXJcblxuICBjb25zdHJ1Y3RvcjogLT5cblxuICAgIEBhbmltYXRpb25Mb29wSWQgPSBudWxsXG4gICAgQGRlbHRhICAgICAgICAgICA9IDBcbiAgICBAZnBzICAgICAgICAgICAgID0gMFxuICAgIEBsYXN0VGltZSAgICAgICAgPSAwXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHN0YXJ0OiAtPlxuXG4gICAgQGZyYW1lKClcblxuICAgIHJldHVybiB0aGlzXG5cbiAgc3RvcDogLT5cblxuICAgIHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZShAYW5pbWF0aW9uTG9vcElkKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBmcmFtZTogKG5vdykgLT5cblxuICAgIEBkZWx0YSAgICA9IG5vdyAtIEBsYXN0VGltZVxuICAgIEBmcHMgICAgICA9IE1hdGgucm91bmQoMTAwMCAvIEBkZWx0YSlcbiAgICBAbGFzdFRpbWUgPSBub3dcblxuICAgICNmcHMoQGZwcylcblxuICAgIEFwcC51cGRhdGUoQGRlbHRhKVxuXG4gICAgQGFuaW1hdGlvbkxvb3BJZCA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgKG5vdykgPT5cbiAgICAgIEBmcmFtZShub3cpXG4gICAgICByZXR1cm5cblxuICAgIHJldHVybiB0aGlzXG4iLCJcbmNsYXNzIENhbnZhc0hlbHBlclxuXG4gIGxvYWQ6IC0+XG5cbiAgICBAZGV2aWNlID0gQXBwLmdldEhlbHBlcignZGV2aWNlJylcbiAgICBAaW5wdXQgID0gQXBwLmdldEhlbHBlcignaW5wdXQnKVxuXG4gICAgQGVsZW1lbnRTZWxlY3RvciA9ICcuY2FudmFzJ1xuXG4gICAgQGNyZWF0ZUNhbnZhcygpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIGNsZWFyOiAtPlxuXG4gICAgI0BlbGVtZW50LndpZHRoID0gQGVsZW1lbnQud2lkdGhcbiAgICBAY29udGV4dC5jbGVhclJlY3QoMCwgMCwgQGVsZW1lbnQud2lkdGgsIEBlbGVtZW50LmhlaWdodClcblxuICAgIHJldHVybiB0aGlzXG5cbiAgY3JlYXRlQ2FudmFzOiAtPlxuXG4gICAgQGVsZW1lbnQgICAgICAgID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihAZWxlbWVudFNlbGVjdG9yKVxuICAgIEBlbGVtZW50LmhlaWdodCA9IEBkZXZpY2Uuc2NyZWVuLmhlaWdodFxuICAgIEBlbGVtZW50LndpZHRoICA9IEBkZXZpY2Uuc2NyZWVuLndpZHRoXG5cbiAgICBAZWxlbWVudC5yZWFsSGVpZ2h0ID0gQGVsZW1lbnQuaGVpZ2h0XG4gICAgQGVsZW1lbnQucmVhbFdpZHRoICA9IEBlbGVtZW50LndpZHRoXG5cbiAgICBAY29udGV4dCA9IEBlbGVtZW50LmdldENvbnRleHQoJzJkJylcblxuICAgIEBjb250ZXh0Lmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9ICdkZXN0aW5hdGlvbi1hdG9wJ1xuXG4gICAgQHNjYWxlQ2FudmFzKClcblxuICAgIEBpbnB1dC5hZGRDYW52YXNUYXBFdmVudExpc3RlbmVyKEBlbGVtZW50U2VsZWN0b3IpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHNjYWxlQ2FudmFzOiAtPlxuXG4gICAgYmFja2luZ1N0b3JlUmF0aW8gPSBAY29udGV4dC53ZWJraXRCYWNraW5nU3RvcmVQaXhlbFJhdGlvIHx8IEBjb250ZXh0LmJhY2tpbmdTdG9yZVBpeGVsUmF0aW8gfHwgMVxuXG4gICAgaWYgQGRldmljZS5waXhlbFJhdGlvICE9IGJhY2tpbmdTdG9yZVJhdGlvXG4gICAgICByYXRpbyAgICAgPSBAZGV2aWNlLnBpeGVsUmF0aW8gLyBiYWNraW5nU3RvcmVSYXRpb1xuICAgICAgb2xkV2lkdGggID0gQGVsZW1lbnQud2lkdGhcbiAgICAgIG9sZEhlaWdodCA9IEBlbGVtZW50LmhlaWdodFxuXG4gICAgICBAZWxlbWVudC53aWR0aCAgPSBvbGRXaWR0aCAgKiByYXRpb1xuICAgICAgQGVsZW1lbnQuaGVpZ2h0ID0gb2xkSGVpZ2h0ICogcmF0aW9cblxuICAgICAgQGVsZW1lbnQuc3R5bGUud2lkdGggID0gXCIje29sZFdpZHRofXB4XCJcbiAgICAgIEBlbGVtZW50LnN0eWxlLmhlaWdodCA9IFwiI3tvbGRIZWlnaHR9cHhcIlxuXG4gICAgICBAY29udGV4dC5zY2FsZShyYXRpbywgcmF0aW8pXG5cbiAgICByZXR1cm4gdGhpc1xuIiwiXG5jbGFzcyBDb25maWdIZWxwZXJcblxuICBsb2FkOiAtPlxuXG4gICAgQHZhbHVlcyA9IHt9XG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIGNvbnNvbGU6IChwYXRoKSAtPlxuXG4gICAgZGVidWdDb25zb2xlKEBnZXQocGF0aCkpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIGR1bXA6IChwYXRoKSAtPlxuXG4gICAgZHVtcGluZyA9IEB2YWx1ZXNcblxuICAgIGlmIChwYXRoKVxuICAgICAgZHVtcGluZyA9IFwiQ29uZmlnLiN7cGF0aH06ICN7QGdldChwYXRoKX1cIlxuXG4gICAgY29uc29sZS5sb2coZHVtcGluZylcblxuICAgIHJldHVybiB0aGlzXG5cbiAgZ2V0OiAocGF0aCkgLT5cblxuICAgIHBhdGggID0gcGF0aC5zcGxpdCAnLidcbiAgICBhcnJheSA9IEB2YWx1ZXNcblxuICAgIGZvciBrZXksIGluZGV4IGluIHBhdGhcbiAgICAgIG5leHRLZXkgPSBwYXRoW2luZGV4ICsgMV1cblxuICAgICAgaWYgbmV4dEtleT9cbiAgICAgICAgYXJyYXkgPSBhcnJheVtrZXldXG4gICAgICBlbHNlXG4gICAgICAgIHZhbHVlID0gYXJyYXlba2V5XVxuXG4gICAgcmV0dXJuIHZhbHVlIGlmIHZhbHVlP1xuXG4gIHNldDogKHBhdGgsIHZhbHVlKSAtPlxuXG4gICAgcGF0aCAgPSBwYXRoLnNwbGl0ICcuJ1xuICAgIGFycmF5ID0gQHZhbHVlc1xuXG4gICAgZm9yIGtleSwgaW5kZXggaW4gcGF0aFxuICAgICAgbmV4dEtleSA9IHBhdGhbaW5kZXggKyAxXVxuXG4gICAgICBpZiAhYXJyYXlba2V5XVxuICAgICAgICBpZiBuZXh0S2V5P1xuICAgICAgICAgIGFycmF5W2tleV0gPSB7fVxuICAgICAgICBlbHNlXG4gICAgICAgICAgYXJyYXlba2V5XSA9IHZhbHVlXG5cbiAgICAgIGFycmF5ID0gYXJyYXlba2V5XVxuXG4gICAgcmV0dXJuIHRoaXNcbiIsIlxuY2xhc3MgRGV2aWNlSGVscGVyXG5cbiAgY29uc3RydWN0b3I6IC0+XG5cbiAgICBAc2NyZWVuID1cbiAgICAgIGhlaWdodDogZG9jdW1lbnQuYm9keS5jbGllbnRIZWlnaHRcbiAgICAgIHdpZHRoOiAgZG9jdW1lbnQuYm9keS5jbGllbnRXaWR0aFxuXG4gICAgQGFuZHJvaWQgICAgICAgID0gaWYgbmF2aWdhdG9yLnVzZXJBZ2VudC5tYXRjaCgvYW5kcm9pZC9pKSB0aGVuIHRydWUgZWxzZSBmYWxzZVxuICAgIEBpb3MgICAgICAgICAgICA9ICFAYW5kcm9pZFxuICAgIEBoYXNUb3VjaEV2ZW50cyA9IHdpbmRvdy5oYXNPd25Qcm9wZXJ0eSgnb250b3VjaHN0YXJ0JykgfHwgd2luZG93Lmhhc093blByb3BlcnR5KCdvbm1zZ2VzdHVyZWNoYW5nZScpXG4gICAgQHBpeGVsUmF0aW8gICAgID0gd2luZG93LmRldmljZVBpeGVsUmF0aW8gfHwgMVxuXG4gICAgcmV0dXJuIHRoaXNcbiIsIlxuY2xhc3MgSW5wdXRIZWxwZXJcblxuICBjb25zdHJ1Y3RvcjogLT5cblxuICAgIEBkZXZpY2UgPSBuZXcgRGV2aWNlSGVscGVyKClcblxuICAgIEBjYW5jZWxUb3VjaE1vdmVFdmVudHMoKVxuXG4gICAgI0BzZXR1cENvbnNvbGUoKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBsb2FkOiAtPlxuXG4gICAgQGVudGl0eUlkcyAgICAgICAgICAgICAgPSBbXVxuICAgIEBlbnRpdGllc1RvVGVzdCAgICAgICAgID0gW11cbiAgICBAZW50aXRpZXNQZW5kaW5nUmVtb3ZhbCA9IFtdXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIGFkZENhbnZhc1RhcEV2ZW50TGlzdGVuZXI6IChjYW52YXNTZWxlY3RvcikgLT5cblxuICAgIEBhZGRFdmVudExpc3RlbmVyIGNhbnZhc1NlbGVjdG9yLCAnY2xpY2snLCA9PlxuICAgICAgQHRlc3RFbnRpdGllc0ZvckV2ZW50cygpXG4gICAgICByZXR1cm5cblxuICAgIHJldHVybiB0aGlzXG5cbiAgYWRkRXZlbnRMaXN0ZW5lcjogKHNlbGVjdG9yID0gJ2JvZHknLCB0eXBlLCBjYWxsYmFjaywgY29uc29sZU91dHB1dCA9IGZhbHNlKSAtPlxuXG4gICAgdHlwZSA9IEBjb252ZXJ0Q2xpY2tUb1RvdWNoKHR5cGUpXG5cbiAgICBkZWJ1Z0NvbnNvbGUoXCJJbnB1dC5hZGRFdmVudExpc3RlbmVyKCN7c2VsZWN0b3J9LCAje3R5cGV9LCAje2NhbGxiYWNrfSlcIikgaWYgY29uc29sZU91dHB1dFxuXG4gICAgJChzZWxlY3RvcikuYWRkRXZlbnRMaXN0ZW5lciB0eXBlLCBjYWxsYmFjaywgZmFsc2VcblxuICAgIHJldHVybiB0aGlzXG5cbiAgY2FuY2VsVG91Y2hNb3ZlRXZlbnRzOiAtPlxuXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIgJ3RvdWNobW92ZScsIChldmVudCkgLT5cbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICAgIHJldHVyblxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBjb252ZXJ0Q2xpY2tUb1RvdWNoOiAodHlwZSkgLT5cblxuICAgIGlmIHR5cGUgPT0gJ2NsaWNrJyAmJiBAZGV2aWNlLmhhc1RvdWNoRXZlbnRzXG4gICAgICByZXR1cm4gJ3RvdWNoc3RhcnQnXG4gICAgZWxzZVxuICAgICAgcmV0dXJuIHR5cGVcblxuICBnZXRUb3VjaERhdGE6IChldmVudCkgLT5cblxuICAgIGlmIEBkZXZpY2UuaGFzVG91Y2hFdmVudHNcbiAgICAgIHRvdWNoRGF0YSA9XG4gICAgICAgIHg6IGV2ZW50LnRvdWNoZXNbMF0ucGFnZVgsXG4gICAgICAgIHk6IGV2ZW50LnRvdWNoZXNbMF0ucGFnZVlcbiAgICBlbHNlXG4gICAgICB0b3VjaERhdGEgPVxuICAgICAgICB4OiBldmVudC5jbGllbnRYLFxuICAgICAgICB5OiBldmVudC5jbGllbnRZXG5cbiAgICByZXR1cm4gdG91Y2hEYXRhXG5cbiAgcmVtb3ZlRXZlbnRMaXN0ZW5lcjogKHNlbGVjdG9yID0gJ2JvZHknLCB0eXBlLCBjYWxsYmFjaykgLT5cblxuICAgIHR5cGUgPSBAY29udmVydENsaWNrVG9Ub3VjaCh0eXBlKVxuXG4gICAgZGVidWdDb25zb2xlKFwiSW5wdXQucmVtb3ZlRXZlbnRMaXN0ZW5lcigje3NlbGVjdG9yfSwgI3t0eXBlfSwgI3tjYWxsYmFja30pXCIpXG5cbiAgICAkKHNlbGVjdG9yKS5yZW1vdmVFdmVudExpc3RlbmVyIHR5cGUsIGNhbGxiYWNrLCBmYWxzZVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBzZXR1cENvbnNvbGU6IC0+XG5cbiAgICBAYWRkRXZlbnRMaXN0ZW5lciAnYm9keScsICdjbGljaycsIChldmVudCkgLT5cbiAgICAgIHR5cGUgICAgICA9IGV2ZW50LnR5cGVcbiAgICAgIG5vZGUgICAgICA9IGV2ZW50LnRhcmdldC5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpXG4gICAgICBpZCAgICAgICAgPSBldmVudC50YXJnZXQuaWQgfHwgJ24vYSdcbiAgICAgIGNsYXNzTGlzdCA9IGV2ZW50LnRhcmdldC5jbGFzc0xpc3QgfHwgJ24vYSdcblxuICAgICAgZGVidWdDb25zb2xlKFwiI3t0eXBlfSBvbiAje25vZGV9IC0gaWQ6ICN7aWR9IC0gY2xhc3M6ICN7Y2xhc3NMaXN0fVwiKVxuICAgICAgcmV0dXJuXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIGFkZEVudGl0eTogKGVudGl0eSkgLT5cblxuICAgIEBlbnRpdHlJZHMucHVzaChlbnRpdHkuaWQpXG4gICAgQGVudGl0aWVzVG9UZXN0LnB1c2goZW50aXR5KVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBxdWV1ZUVudGl0eUZvclJlbW92YWw6IChpZCkgLT5cblxuICAgIEBlbnRpdGllc1BlbmRpbmdSZW1vdmFsLnB1c2goaWQpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHJlbW92ZUFsbEVudGl0aWVzOiAtPlxuXG4gICAgQGVudGl0aWVzVG9UZXN0ID0gW11cblxuICAgIHJldHVybiB0aGlzXG5cbiAgcmVtb3ZlUXVldWVkRW50aXRpZXM6IC0+XG5cbiAgICBAcmVtb3ZlRW50aXR5KGlkKSBmb3IgaWQgaW4gQGVudGl0aWVzUGVuZGluZ1JlbW92YWxcbiAgICBAZW50aXRpZXNQZW5kaW5nUmVtb3ZhbCA9IFtdXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHJlbW92ZUVudGl0eTogKGlkKSAtPlxuXG4gICAgaW5kZXggPSBAZW50aXR5SWRzLmluZGV4T2YoaWQpO1xuXG4gICAgaWYgaW5kZXggIT0gLTFcbiAgICAgIEBlbnRpdHlJZHMuc3BsaWNlKGluZGV4LCAxKVxuICAgICAgQGVudGl0aWVzVG9UZXN0LnNwbGljZShpbmRleCwgMSlcblxuICAgIHJldHVybiB0aGlzXG5cbiAgdGVzdEVudGl0aWVzRm9yRXZlbnRzOiAtPlxuXG4gICAgQHRvdWNoRGF0YSA9IEBnZXRUb3VjaERhdGEoZXZlbnQpXG5cbiAgICBmb3IgZW50aXR5IGluIEBlbnRpdGllc1RvVGVzdFxuICAgICAgdGFwcGVkID0gZW50aXR5Lndhc1RhcHBlZCgpXG5cbiAgICAgIGVudGl0eS50YXBIYW5kbGVyKHRhcHBlZClcblxuICAgICAgYnJlYWsgaWYgdGFwcGVkXG5cbiAgICBAcmVtb3ZlUXVldWVkRW50aXRpZXMoKVxuXG4gICAgcmV0dXJuIHRoaXNcbiIsIlxuY2xhc3MgUmVuZGVyZXJIZWxwZXJcblxuICBsb2FkOiAtPlxuXG4gICAgQHJlbmRlclN0YWNrID0gW11cblxuICAgIHJldHVybiB0aGlzXG5cbiAgZW5xdWV1ZTogKGVudGl0eSkgLT5cblxuICAgIEByZW5kZXJTdGFjay5wdXNoKGVudGl0eSlcblxuICAgIHJldHVybiB0aGlzXG5cbiAgcHJvY2VzczogLT5cblxuICAgIGZvciBlbnRpdHkgaW4gQHJlbmRlclN0YWNrXG4gICAgICBlbnRpdHkucmVuZGVyKCkgaWYgZW50aXR5LmlzSW5zaWRlQ2FudmFzQm91bmRzKClcblxuICAgIEByZXNldCgpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHJlc2V0OiAtPlxuXG4gICAgQHJlbmRlclN0YWNrID0gW11cblxuICAgIHJldHVybiB0aGlzXG4iLCJcbmNsYXNzIFVzZXJJbnRlcmZhY2VIZWxwZXJcblxuICBsb2FkOiAtPlxuXG4gICAgQGVsZW1lbnRzID0ge31cblxuICAgIHJldHVybiB0aGlzXG5cbiAgZWxlbWVudDogKG5hbWUpIC0+XG5cbiAgICByZXR1cm4gQGVsZW1lbnRzW25hbWVdXG5cbiAgcmVtb3ZlQWxsRWxlbWVudHM6IChzY2VuZU5hbWUpIC0+XG5cbiAgICBAZWxlbWVudHMgPSB7fVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICByZWdpc3RlckVsZW1lbnQ6IChuYW1lLCBzZWxlY3RvcikgLT5cblxuICAgIEBlbGVtZW50c1tuYW1lXSA9ICQoc2VsZWN0b3IpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHJlbW92ZUVsZW1lbnQ6IChuYW1lKSAtPlxuXG4gICAgZGVsZXRlIEBlbGVtZW50c1tuYW1lXSBpZiBAZWxlbWVudHNbbmFtZV0/XG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHRyYW5zaXRpb25UbzogKHRhcmdldFNjZW5lLCBpbnN0YW50ID0gZmFsc2UpIC0+XG5cbiAgICBpZiBBcHAuY3VycmVudFNjZW5lPyAmJiB0eXBlb2YgQXBwLmN1cnJlbnRTY2VuZS51bmxvYWQgPT0gJ2Z1bmN0aW9uJ1xuICAgICAgQXBwLmN1cnJlbnRTY2VuZS51bmxvYWQoKVxuXG4gICAgICAjQHVwZGF0ZUJvZHlDbGFzcyhcInNjZW5lLSN7dGFyZ2V0U2NlbmV9LW91dFwiKVxuXG4gICAgQXBwLmN1cnJlbnRTY2VuZSA9IEFwcC5zY2VuZXNbdGFyZ2V0U2NlbmVdXG5cbiAgICBBcHAuY3VycmVudFNjZW5lLmxvYWQoKVxuXG4gICAgQHVwZGF0ZUJvZHlDbGFzcyhcInNjZW5lLSN7QXBwLmN1cnJlbnRTY2VuZS5pZH1cIilcblxuICAgIHJldHVybiB0aGlzXG5cbiAgdXBkYXRlQm9keUNsYXNzOiAoY2xhc3NOYW1lKSAtPlxuXG4gICAgZG9jdW1lbnQuYm9keS5jbGFzc05hbWUgPSAnJ1xuICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZChjbGFzc05hbWUpXG5cbiAgICByZXR1cm4gdGhpc1xuIiwiXG5jbGFzcyBBcHBsaWNhdGlvblxuXG4gIGNvbnN0cnVjdG9yOiAtPlxuXG4gICAgQGN1cnJlbnRTY2VuZSAgICAgPSBudWxsXG4gICAgQGRlbHRhICAgICAgICAgICAgPSAwXG4gICAgQGhlbHBlcnMgICAgICAgICAgPSB7fVxuICAgIEBzY2VuZXMgICAgICAgICAgID0ge31cbiAgICBAYmFja2dyb3VuZFNjZW5lcyA9IFtdXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIGxvYWQ6IC0+XG5cbiAgICBAaW5pdEhlbHBlcnMoKVxuICAgIEBpbml0U2NlbmVzKClcblxuICAgIEBnZXRIZWxwZXIoJ2FuaW1hdGlvbkxvb3AnKS5zdGFydCgpXG4gICAgQGdldEhlbHBlcigndWknKS50cmFuc2l0aW9uVG8oJ2lkZW50JylcblxuICAgIHJldHVybiB0aGlzXG5cbiAgaW5pdEhlbHBlcnM6IC0+XG5cbiAgICBAaGVscGVycyA9IHtcbiAgICAgIGFuaW1hdGlvbkxvb3A6IHsgb2JqZWN0OiBuZXcgQW5pbWF0aW9uTG9vcEhlbHBlcigpIH1cbiAgICAgIGNhbnZhczogICAgICAgIHsgb2JqZWN0OiBuZXcgQ2FudmFzSGVscGVyKCkgICAgICAgIH1cbiAgICAgIGNvbmZpZzogICAgICAgIHsgb2JqZWN0OiBuZXcgQ29uZmlnSGVscGVyKCkgICAgICAgIH1cbiAgICAgIGRldmljZTogICAgICAgIHsgb2JqZWN0OiBuZXcgRGV2aWNlSGVscGVyKCkgICAgICAgIH1cbiAgICAgIGlucHV0OiAgICAgICAgIHsgb2JqZWN0OiBuZXcgSW5wdXRIZWxwZXIoKSAgICAgICAgIH1cbiAgICAgIHJlbmRlcmVyOiAgICAgIHsgb2JqZWN0OiBuZXcgUmVuZGVyZXJIZWxwZXIoKSAgICAgIH1cbiAgICAgIHVpOiAgICAgICAgICAgIHsgb2JqZWN0OiBuZXcgVXNlckludGVyZmFjZUhlbHBlcigpIH1cbiAgICB9XG5cbiAgICBmb3IgaGVscGVyIGluIEBoZWxwZXJzXG4gICAgICBAbG9hZEhlbHBlcihoZWxwZXIpIGlmICFoZWxwZXIubG9hZGVkXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIGxvYWRIZWxwZXI6IChoZWxwZXIpIC0+XG5cbiAgICBoZWxwZXIub2JqZWN0LmxvYWQoKSBpZiBoZWxwZXIub2JqZWN0LmxvYWQ/XG4gICAgaGVscGVyLmxvYWRlZCA9IHRydWVcblxuICAgIHJldHVybiB0aGlzXG5cbiAgaW5pdFNjZW5lczogLT5cblxuICAgIEBzY2VuZXMgPSB7XG4gICAgICAnaWRlbnQnOiAgICAgbmV3IElkZW50U2NlbmUoKVxuICAgICAgJ2dhbWUtb3Zlcic6IG5ldyBHYW1lT3ZlclNjZW5lKClcbiAgICAgICdwbGF5aW5nJzogICBuZXcgUGxheWluZ1NjZW5lKClcbiAgICAgICd0aXRsZSc6ICAgICBuZXcgVGl0bGVTY2VuZSgpXG4gICAgfVxuXG4gICAgZm9yIHNjZW5lTmFtZSwgc2NlbmVPYmplY3Qgb2YgQHNjZW5lc1xuICAgICAgQGJhY2tncm91bmRTY2VuZXMucHVzaChzY2VuZU9iamVjdCkgaWYgc2NlbmVPYmplY3QudXBkYXRlc0luQmFja0dyb3VuZFxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBnZXRIZWxwZXI6IChuYW1lKSAtPlxuXG4gICAgaGVscGVyID0gQGhlbHBlcnNbbmFtZV1cblxuICAgIGlmICFoZWxwZXIubG9hZGVkXG4gICAgICBAbG9hZEhlbHBlcihoZWxwZXIpXG5cbiAgICByZXR1cm4gaGVscGVyLm9iamVjdFxuXG4gIHVwZGF0ZTogKGRlbHRhKSAtPlxuXG4gICAgQGRlbHRhID0gZGVsdGFcblxuICAgIGlmIEBjdXJyZW50U2NlbmU/XG4gICAgICBAZ2V0SGVscGVyKCdjYW52YXMnKS5jbGVhcigpXG4gICAgICBAY3VycmVudFNjZW5lLnVwZGF0ZSgpXG5cbiAgICAgIGZvciBiYWNrZ3JvdW5kU2NlbmUgaW4gQGJhY2tncm91bmRTY2VuZXNcbiAgICAgICAgYmFja2dyb3VuZFNjZW5lLnVwZGF0ZSgpIGlmIGJhY2tncm91bmRTY2VuZS5pZCAhPSBAY3VycmVudFNjZW5lLmlkXG5cbiAgICAgIEBnZXRIZWxwZXIoJ3JlbmRlcmVyJykucHJvY2VzcygpXG5cbiAgICByZXR1cm4gdGhpc1xuIiwiXG5jbGFzcyBFbnRpdHlcblxuICBjb25zdHJ1Y3RvcjogLT5cblxuICAgIEBjYW52YXMgICA9IEFwcC5nZXRIZWxwZXIoJ2NhbnZhcycpXG4gICAgQGNvbmZpZyAgID0gQXBwLmdldEhlbHBlcignY29uZmlnJylcbiAgICBAaW5wdXQgICAgPSBBcHAuZ2V0SGVscGVyKCdpbnB1dCcpXG4gICAgQGRldmljZSAgID0gQXBwLmdldEhlbHBlcignZGV2aWNlJylcbiAgICBAcmVuZGVyZXIgPSBBcHAuZ2V0SGVscGVyKCdyZW5kZXJlcicpXG5cbiAgICBAY29udGV4dCA9IEBjYW52YXMuY29udGV4dFxuXG4gICAgQGlkICAgICAgICAgICAgICAgICA9IG51bGxcbiAgICBAcGFyZW50ICAgICAgICAgICAgID0gbnVsbFxuICAgIEByZW1vdmVPbkNhbnZhc0V4aXQgPSB0cnVlXG5cbiAgICBAaGVpZ2h0ID0gMFxuICAgIEB3aWR0aCAgPSAwXG5cbiAgICBAcG9zaXRpb24gPSB7XG4gICAgICB4OiAwXG4gICAgICB5OiAwXG4gICAgfVxuXG4gICAgQHZlbG9jaXR5ID0ge1xuICAgICAgeDogMFxuICAgICAgeTogMFxuICAgIH1cblxuICAgIHJldHVybiB0aGlzXG5cbiAgYWRkU2VsZlRvUmVuZGVyUXVldWU6IC0+XG5cbiAgICBAcmVuZGVyZXIuZW5xdWV1ZSh0aGlzKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBjYW52YXNFeGl0Q2FsbGJhY2s6IC0+XG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIGlzSW5zaWRlQ2FudmFzQm91bmRzOiAtPlxuXG4gICAgcmV0dXJuICFAaXNPdXRzaWRlQ2FudmFzQm91bmRzKClcblxuICBpc091dHNpZGVDYW52YXNCb3VuZHM6IC0+XG5cbiAgICBvdXRzaWRlTGVmdCAgPSBAcG9zaXRpb24ueCA8IC1Ad2lkdGhcbiAgICBvdXRzaWRlUmlnaHQgPSBAcG9zaXRpb24ueCAtIEB3aWR0aCA+IEBjYW52YXMuZWxlbWVudC5yZWFsV2lkdGhcbiAgICBvdXRzaWRlWCAgICAgPSBvdXRzaWRlTGVmdCB8fCBvdXRzaWRlUmlnaHRcblxuICAgIG91dHNpZGVUb3AgICAgPSBAcG9zaXRpb24ueSA8IC1AaGVpZ2h0XG4gICAgb3V0c2lkZUJvdHRvbSA9IEBwb3NpdGlvbi55IC0gQGhlaWdodCA+IEBjYW52YXMuZWxlbWVudC5yZWFsV2hlaWdodFxuICAgIG91dHNpZGVZICAgICAgPSBvdXRzaWRlVG9wIHx8IG91dHNpZGVCb3R0b21cblxuICAgIHJldHVybiBvdXRzaWRlWCB8fCBvdXRzaWRlWVxuXG4gIHJlbW92ZVNlbGZGcm9tUGFyZW50OiAtPlxuXG4gICAgQHBhcmVudC5yZW1vdmVFbnRpdHkoQGlkKSBpZiBAcGFyZW50P1xuXG4gICAgcmV0dXJuIHRoaXNcblxuICB1cGRhdGU6IC0+XG5cbiAgICBpZiBAaXNPdXRzaWRlQ2FudmFzQm91bmRzKClcbiAgICAgIEBjYW52YXNFeGl0Q2FsbGJhY2soKSAgIGlmIEBjYW52YXNFeGl0Q2FsbGJhY2s/XG4gICAgICBAcmVtb3ZlU2VsZkZyb21QYXJlbnQoKSBpZiBAcmVtb3ZlT25DYW52YXNFeGl0XG5cbiAgICByZXR1cm4gdGhpc1xuIiwiXG5jbGFzcyBTY2VuZVxuXG4gIGNvbnN0cnVjdG9yOiAtPlxuXG4gICAgQGVudGl0aWVzQ291bnQgICAgICAgICAgPSAwXG4gICAgQGVudGl0eUlkcyAgICAgICAgICAgICAgPSBbXVxuICAgIEBlbnRpdGllcyAgICAgICAgICAgICAgID0gW11cbiAgICBAZW50aXRpZXNQZW5kaW5nUmVtb3ZhbCA9IFtdXG4gICAgQHVwZGF0ZXNJbkJhY2tHcm91bmQgICAgPSBmYWxzZVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBhZGRFbnRpdHk6IChlbnRpdHksIHVuc2hpZnQgPSBmYWxzZSkgLT5cblxuICAgIGlmICF1bnNoaWZ0XG4gICAgICBAZW50aXR5SWRzLnB1c2goZW50aXR5LmlkKVxuICAgICAgQGVudGl0aWVzLnB1c2goZW50aXR5KVxuICAgIGVsc2VcbiAgICAgIEBlbnRpdHlJZHMudW5zaGlmdChlbnRpdHkuaWQpXG4gICAgICBAZW50aXRpZXMudW5zaGlmdChlbnRpdHkpXG5cbiAgICBAZW50aXRpZXNDb3VudCArPSAxXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIGxvYWQ6IC0+XG5cbiAgICBAY29uZmlnID0gQXBwLmdldEhlbHBlcignY29uZmlnJylcbiAgICBAZGV2aWNlID0gQXBwLmdldEhlbHBlcignZGV2aWNlJylcbiAgICBAaW5wdXQgID0gQXBwLmdldEhlbHBlcignaW5wdXQnKVxuICAgIEB1aSAgICAgPSBBcHAuZ2V0SGVscGVyKCd1aScpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHJlbW92ZUFsbEVudGl0aWVzOiAtPlxuXG4gICAgQGVudGl0aWVzQ291bnQgPSAwXG4gICAgQGVudGl0aWVzICAgICAgPSBbXVxuICAgIEBlbnRpdHlJZHMgICAgID0gW11cblxuICAgIHJldHVybiB0aGlzXG5cbiAgcmVtb3ZlRW50aXR5OiAoaWQpIC0+XG5cbiAgICBAZW50aXRpZXNQZW5kaW5nUmVtb3ZhbC5wdXNoKGlkKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICB1bmxvYWQ6IC0+XG5cbiAgICAjQHJlbW92ZUFsbEVudGl0aWVzKClcblxuICAgIHJldHVybiB0aGlzXG5cbiAgdXBkYXRlOiAtPlxuXG4gICAgaWYgQGVudGl0aWVzQ291bnQgPiAwXG4gICAgICBAdXBkYXRlRW50aXRpZXMoKVxuXG4gICAgICBAcHJvY2Vzc0VudGl0aWVzTWFya2VkRm9yUmVtb3ZhbCgpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHVwZGF0ZUVudGl0aWVzOiAtPlxuXG4gICAgZW50aXR5LnVwZGF0ZSgpIGZvciBlbnRpdHkgaW4gQGVudGl0aWVzXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHByb2Nlc3NFbnRpdGllc01hcmtlZEZvclJlbW92YWw6IC0+XG5cbiAgICBmb3IgaWQgaW4gQGVudGl0aWVzUGVuZGluZ1JlbW92YWxcbiAgICAgIGluZGV4ID0gQGVudGl0eUlkcy5pbmRleE9mKGlkKVxuXG4gICAgICBAZW50aXRpZXMuc3BsaWNlKGluZGV4LCAxKVxuICAgICAgQGVudGl0eUlkcy5zcGxpY2UoaW5kZXgsIDEpXG5cbiAgICAgIEBlbnRpdGllc0NvdW50IC09IDFcblxuICAgIEBlbnRpdGllc1BlbmRpbmdSZW1vdmFsID0gW11cblxuICAgIEBlbnRpdGllc0NvdW50ID0gMCBpZiBAZW50aXRpZXNDb3VudCA8IDBcbiIsIlxuY2xhc3MgR2FtZU92ZXJTY2VuZSBleHRlbmRzIFNjZW5lXG5cbiAgY29uc3RydWN0b3I6IC0+XG5cbiAgICBzdXBlclxuXG4gICAgQGlkICAgICAgICAgICAgICAgICAgPSAnZ2FtZS1vdmVyJ1xuICAgIEBwbGF5QWdhaW5FdmVudEJvdW5kID0gZmFsc2VcblxuICAgIHJldHVybiB0aGlzXG5cbiAgbG9hZDogLT5cblxuICAgIHN1cGVyXG5cbiAgICBAaW5wdXQuYWRkRXZlbnRMaXN0ZW5lciAnLnBsYXktYWdhaW4nLCAnY2xpY2snLCA9PlxuICAgICAgQHVpLnRyYW5zaXRpb25UbygncGxheWluZycpXG4gICAgICByZXR1cm5cblxuICAgIHJldHVybiB0aGlzXG4iLCJcbmNsYXNzIElkZW50U2NlbmUgZXh0ZW5kcyBTY2VuZVxuXG4gIGNvbnN0cnVjdG9yOiAtPlxuXG4gICAgc3VwZXJcblxuICAgIEBpZCA9ICdpZGVudCdcblxuICAgIHJldHVybiB0aGlzXG5cbiAgbG9hZDogLT5cblxuICAgIHN1cGVyXG5cbiAgICB3aW5kb3cuc2V0VGltZW91dCA9PlxuICAgICAgQHVpLnRyYW5zaXRpb25UbygndGl0bGUnKVxuICAgICwgMjVcblxuICAgIHJldHVybiB0aGlzXG4iLCJcbmNsYXNzIFBsYXlpbmdTY2VuZSBleHRlbmRzIFNjZW5lXG5cbiAgY29uc3RydWN0b3I6IC0+XG5cbiAgICBzdXBlclxuXG4gICAgQGlkICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPSAncGxheWluZydcbiAgICBAdXBkYXRlc0luQmFja0dyb3VuZCAgICAgICAgICAgICA9IHRydWVcbiAgICBAbGV2ZWxVcEludGVydmFsICAgICAgICAgICAgICAgICA9IDUwMDBcbiAgICBAbWF4TGV2ZWwgICAgICAgICAgICAgICAgICAgICAgICA9IDUwXG4gICAgQG1heERpYW1ldGVyQXNQZXJjZW50YWdlT2ZTY3JlZW4gPSAxNVxuICAgIEBtYXhMaW5lV2lkdGggICAgICAgICAgICAgICAgICAgID0gNVxuICAgIEBwb2ludHNQZXJQb3AgICAgICAgICAgICAgICAgICAgID0gMTBcblxuICAgIHJldHVybiB0aGlzXG5cbiAgbG9hZDogLT5cblxuICAgIHN1cGVyXG5cbiAgICBAdWkucmVnaXN0ZXJFbGVtZW50KCdjb21ib011bHRpcGxpZXJDb3VudGVyJywgJy5odWQtdmFsdWUtY29tYm8nKVxuICAgIEB1aS5yZWdpc3RlckVsZW1lbnQoJ2xldmVsQ291bnRlcicsICAgICAgICAgICAnLmh1ZC12YWx1ZS1sZXZlbCcpXG4gICAgQHVpLnJlZ2lzdGVyRWxlbWVudCgnc2NvcmVDb3VudGVyJywgICAgICAgICAgICcuaHVkLXZhbHVlLXNjb3JlJylcblxuICAgIEBjb21ib011bHRpcGxpZXIgPSAwXG4gICAgQGxldmVsICAgICAgICAgICA9IDFcbiAgICBAc2NvcmUgICAgICAgICAgID0gMFxuXG4gICAgQHNldHVwTGV2ZWxVcEluY3JlbWVudCgpXG5cbiAgICBAc2V0SGVhZHNVcFZhbHVlcygpXG5cbiAgICBAdGFyZ2V0QnViYmxlc0NvdW50ID0gMFxuXG4gICAgQHBsYXlpbmcgPSB0cnVlXG5cbiAgICBAc2V0dXBEaWZmaWN1bHR5Q29uZmlnKClcblxuICAgIHJldHVybiB0aGlzXG5cbiAgZGVjcmVtZW50VGFyZ2V0QnViYmxlc0NvdW50OiAtPlxuXG4gICAgQHRhcmdldEJ1YmJsZXNDb3VudCAtPSAxXG5cbiAgICBpZiBAdGFyZ2V0QnViYmxlc0NvdW50IDwgMFxuICAgICAgQHRhcmdldEJ1YmJsZXNDb3VudCA9IDBcblxuICAgIHJldHVybiB0aGlzXG5cbiAgZ2FtZU92ZXI6IC0+XG5cbiAgICBAdWkudHJhbnNpdGlvblRvKCdnYW1lLW92ZXInKVxuICAgIEBpbnB1dC5yZW1vdmVBbGxFbnRpdGllcygpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIGdlbmVyYXRlQnViYmxlOiAtPlxuXG4gICAgaWYgQHBsYXlpbmcgJiYgcmFuZG9tUGVyY2VudGFnZSgpIDwgQGRpZmZpY3VsdHlDb25maWdbJ2J1YmJsZVNwYXduQ2hhbmNlJ10uY3VycmVudFxuICAgICAgYnViYmxlQ29uZmlnID0gQG5ld0J1YmJsZUNvbmZpZygpXG4gICAgICBidWJibGUgICAgICAgPSBuZXcgQnViYmxlRW50aXR5KHRoaXMsIGJ1YmJsZUNvbmZpZylcblxuICAgICAgaWYgYnViYmxlLmlzVGFyZ2V0XG4gICAgICAgIEBhZGRFbnRpdHkoYnViYmxlKVxuICAgICAgICBAaW5wdXQuYWRkRW50aXR5KGJ1YmJsZSlcbiAgICAgIGVsc2VcbiAgICAgICAgQGFkZEVudGl0eShidWJibGUsIHRydWUpXG5cbiAgICAgIEB0YXJnZXRCdWJibGVzQ291bnQgKz0gMSBpZiBidWJibGUuaXNUYXJnZXRcblxuICAgIHJldHVybiB0aGlzXG5cbiAgbmV3QnViYmxlQ29uZmlnOiAtPlxuXG4gICAgcmV0dXJuIHtcbiAgICAgIGJ1YmJsZUdyb3d0aE11bHRpcGxpZXI6ICAgQGRpZmZpY3VsdHlDb25maWdbJ2J1YmJsZUdyb3d0aE11bHRpcGxpZXInXS5jdXJyZW50XG4gICAgICBjaGFuY2VCdWJibGVJc1RhcmdldDogICAgIEBkaWZmaWN1bHR5Q29uZmlnWydjaGFuY2VCdWJibGVJc1RhcmdldCddLmN1cnJlbnRcbiAgICAgIGRpYW1ldGVyTWF4OiAgICAgICAgICAgICAgQGRpZmZpY3VsdHlDb25maWdbJ2RpYW1ldGVyTWF4J10uY3VycmVudFxuICAgICAgbWF4VGFyZ2V0c0F0T25jZTogICAgICAgICBAZGlmZmljdWx0eUNvbmZpZ1snbWF4VGFyZ2V0c0F0T25jZSddLmN1cnJlbnRcbiAgICAgIG1pblRhcmdldERpYW1ldGVyOiAgICAgICAgQGRpZmZpY3VsdHlDb25maWdbJ21pblRhcmdldERpYW1ldGVyJ10uY3VycmVudFxuICAgICAgdGFyZ2V0VmVsb2NpdHlNdWx0aXBsaWVyOiBAZGlmZmljdWx0eUNvbmZpZ1sndGFyZ2V0VmVsb2NpdHlNdWx0aXBsaWVyJ10uY3VycmVudFxuICAgICAgdmVsb2NpdHlNYXg6ICAgICAgICAgICAgICBAZGlmZmljdWx0eUNvbmZpZ1sndmVsb2NpdHlNYXgnXS5jdXJyZW50XG4gICAgICB2ZWxvY2l0eU1pbjogICAgICAgICAgICAgIEBkaWZmaWN1bHR5Q29uZmlnWyd2ZWxvY2l0eU1pbiddLmN1cnJlbnRcbiAgICAgIG1heExpbmVXaWR0aDogICAgICAgICAgICAgQG1heExpbmVXaWR0aFxuICAgICAgcGxheWluZzogICAgICAgICAgICAgICAgICBAcGxheWluZ1xuICAgICAgdGFyZ2V0QnViYmxlc0NvdW50OiAgICAgICBAdGFyZ2V0QnViYmxlc0NvdW50XG4gICAgfVxuXG4gIHNldHVwRGlmZmljdWx0eUNvbmZpZzogLT5cblxuICAgIG1heERpYW1ldGVyID0gKEBkZXZpY2Uuc2NyZWVuLndpZHRoIC8gMTAwKSAqIEBtYXhEaWFtZXRlckFzUGVyY2VudGFnZU9mU2NyZWVuXG5cbiAgICBAZGlmZmljdWx0eUNvbmZpZyA9XG4gICAgICBidWJibGVHcm93dGhNdWx0aXBsaWVyOiAgIHsgY3VycmVudDogMCwgZWFzeTogMS4wNSwgICAgICAgICAgICAgIGRpZmZpY3VsdDogMS4xMCAgICAgICAgICAgICAgfVxuICAgICAgYnViYmxlU3Bhd25DaGFuY2U6ICAgICAgICB7IGN1cnJlbnQ6IDAsIGVhc3k6IDYwLCAgICAgICAgICAgICAgICBkaWZmaWN1bHQ6IDEwMCAgICAgICAgICAgICAgIH1cbiAgICAgIGNoYW5jZUJ1YmJsZUlzVGFyZ2V0OiAgICAgeyBjdXJyZW50OiAwLCBlYXN5OiA1MCwgICAgICAgICAgICAgICAgZGlmZmljdWx0OiA5MCAgICAgICAgICAgICAgICB9XG4gICAgICBkaWFtZXRlck1heDogICAgICAgICAgICAgIHsgY3VycmVudDogMCwgZWFzeTogbWF4RGlhbWV0ZXIsICAgICAgIGRpZmZpY3VsdDogbWF4RGlhbWV0ZXIgKiAwLjYgfVxuICAgICAgbWF4VGFyZ2V0c0F0T25jZTogICAgICAgICB7IGN1cnJlbnQ6IDAsIGVhc3k6IDMsICAgICAgICAgICAgICAgICBkaWZmaWN1bHQ6IDYgICAgICAgICAgICAgICAgIH1cbiAgICAgIG1pblRhcmdldERpYW1ldGVyOiAgICAgICAgeyBjdXJyZW50OiAwLCBlYXN5OiBtYXhEaWFtZXRlciAqIDAuNywgZGlmZmljdWx0OiBtYXhEaWFtZXRlciAqIDAuNCB9XG4gICAgICB0YXJnZXRWZWxvY2l0eU11bHRpcGxpZXI6IHsgY3VycmVudDogMCwgZWFzeTogMC4zLCAgICAgICAgICAgICAgIGRpZmZpY3VsdDogMC41ICAgICAgICAgICAgICAgfVxuICAgICAgdmVsb2NpdHlNYXg6ICAgICAgICAgICAgICB7IGN1cnJlbnQ6IDAsIGVhc3k6IDYsICAgICAgICAgICAgICAgICBkaWZmaWN1bHQ6IDEwICAgICAgICAgICAgICAgIH1cbiAgICAgIHZlbG9jaXR5TWluOiAgICAgICAgICAgICAgeyBjdXJyZW50OiAwLCBlYXN5OiAtNiwgICAgICAgICAgICAgICAgZGlmZmljdWx0OiAtMTAgICAgICAgICAgICAgICB9XG5cbiAgICBAdXBkYXRlVmFsdWVzRm9yRGlmZmljdWx0eSgpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHNldEhlYWRzVXBWYWx1ZXM6IC0+XG5cbiAgICB1cGRhdGVVSVRleHROb2RlKEB1aS5lbGVtZW50KCdjb21ib011bHRpcGxpZXJDb3VudGVyJyksIEBjb21ib011bHRpcGxpZXIpXG4gICAgdXBkYXRlVUlUZXh0Tm9kZShAdWkuZWxlbWVudCgnbGV2ZWxDb3VudGVyJyksICAgICAgICAgICBAbGV2ZWwpXG4gICAgdXBkYXRlVUlUZXh0Tm9kZShAdWkuZWxlbWVudCgnc2NvcmVDb3VudGVyJyksICAgICAgICAgICBmb3JtYXRXaXRoQ29tbWEoQHNjb3JlKSlcblxuICAgIHJldHVybiB0aGlzXG5cbiAgc2V0dXBMZXZlbFVwSW5jcmVtZW50OiAtPlxuXG4gICAgQGxldmVsVXBDb3VudGVyID0gd2luZG93LnNldEludGVydmFsID0+XG4gICAgICBAdXBkYXRlTGV2ZWwoKVxuICAgICAgcmV0dXJuXG4gICAgLCBAbGV2ZWxVcEludGVydmFsXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHN0b3BMZXZlbFVwSW5jcmVtZW50OiAtPlxuXG4gICAgd2luZG93LmNsZWFySW50ZXJ2YWwoQGxldmVsVXBDb3VudGVyKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICB1bmxvYWQ6IC0+XG5cbiAgICBpZiBAcGxheWluZyA9PSB0cnVlXG4gICAgICBmb3IgYnViYmxlIGluIEBlbnRpdGllc1xuICAgICAgICBidWJibGUuZGVzdHJveWluZyA9IHRydWVcblxuICAgICAgQHBsYXlpbmcgPSBmYWxzZVxuXG4gICAgICBAc3RvcExldmVsVXBJbmNyZW1lbnQoKVxuXG4gIHVwZGF0ZTogLT5cblxuICAgIHN1cGVyXG5cbiAgICBAZ2VuZXJhdGVCdWJibGUoKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICB1cGRhdGVDb21ib011bHRpcGxpZXI6ICh0YXJnZXRIaXQpIC0+XG5cbiAgICBpZiB0YXJnZXRIaXRcbiAgICAgIEBjb21ib011bHRpcGxpZXIgKz0gMVxuICAgIGVsc2VcbiAgICAgIEBjb21ib011bHRpcGxpZXIgPSAwXG5cbiAgICBAc2V0SGVhZHNVcFZhbHVlcygpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHVwZGF0ZUxldmVsOiAtPlxuXG4gICAgQGxldmVsICs9IDFcblxuICAgIGlmIEBsZXZlbCA+PSBAbWF4TGV2ZWxcbiAgICAgIHdpbmRvdy5jbGVhckludGVydmFsKEBsZXZlbFVwQ291bnRlcilcblxuICAgIEBzZXRIZWFkc1VwVmFsdWVzKClcblxuICAgIEB1cGRhdGVWYWx1ZXNGb3JEaWZmaWN1bHR5KClcblxuICAgIHJldHVybiB0aGlzXG5cbiAgdXBkYXRlU2NvcmU6IChzaXplV2hlblRhcHBlZCwgc2l6ZVdoZW5GdWxseUdyb3duKSAtPlxuXG4gICAgIygoZGVmYXVsdFNjb3JlUGVyUG9wICsgKDEwMCAtICgoc2l6ZVdoZW5UYXBwZWQgLyBzaXplV2hlbkZ1bGx5R3Jvd24pICogMTAwKSkpICogY29tYm9NdWx0aXBsaWVyKSAqIChsZXZlbE51bWJlciArIDEpXG5cbiAgICB0YXJnZXRTaXplQm9udXMgPSBNYXRoLnJvdW5kKDEwMCAtICgoc2l6ZVdoZW5UYXBwZWQgLyBzaXplV2hlbkZ1bGx5R3Jvd24pICogMTAwKSlcbiAgICBwb3BQb2ludFZhbHVlICAgPSBAcG9pbnRzUGVyUG9wICsgdGFyZ2V0U2l6ZUJvbnVzXG4gICAgbGV2ZWxNdWx0aXBsaWVyID0gQGxldmVsICsgMVxuXG4gICAgQHNjb3JlICs9IChwb3BQb2ludFZhbHVlICogQGNvbWJvTXVsdGlwbGllcikgKiBsZXZlbE11bHRpcGxpZXJcblxuICAgIEBzZXRIZWFkc1VwVmFsdWVzKClcblxuICAgIHJldHVybiB0aGlzXG5cbiAgdXBkYXRlVmFsdWVzRm9yRGlmZmljdWx0eTogLT5cblxuICAgIGxldmVsTXVsaXRwbGllciA9IEBsZXZlbCAvIEBtYXhMZXZlbFxuXG4gICAgZm9yIHByb3BlcnR5TmFtZSwgcHJvcGVydHlWYWx1ZXMgb2YgQGRpZmZpY3VsdHlDb25maWdcbiAgICAgIHZhbHVlRGlmZmVyZW5jZSA9IHByb3BlcnR5VmFsdWVzLmRpZmZpY3VsdCAtIHByb3BlcnR5VmFsdWVzLmVhc3lcbiAgICAgIGFkanVzdGVkVmFsdWUgICA9ICh2YWx1ZURpZmZlcmVuY2UgKiBsZXZlbE11bGl0cGxpZXIpICsgcHJvcGVydHlWYWx1ZXMuZWFzeVxuXG4gICAgICBAZGlmZmljdWx0eUNvbmZpZ1twcm9wZXJ0eU5hbWVdLmN1cnJlbnQgPSBhZGp1c3RlZFZhbHVlXG5cbiAgICByZXR1cm4gdGhpc1xuIiwiXG5jbGFzcyBUaXRsZVNjZW5lIGV4dGVuZHMgU2NlbmVcblxuICBjb25zdHJ1Y3RvcjogLT5cblxuICAgIHN1cGVyXG5cbiAgICBAaWQgPSAndGl0bGUnXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIGxvYWQ6IC0+XG5cbiAgICBzdXBlclxuXG4gICAgQGlucHV0LmFkZEV2ZW50TGlzdGVuZXIgJy5nYW1lLWxvZ28nLCAnY2xpY2snLCA9PlxuICAgICAgQHVpLnRyYW5zaXRpb25UbygncGxheWluZycpXG4gICAgICByZXR1cm5cblxuICAgIHJldHVybiB0aGlzXG5cbiAgdW5sb2FkOiAtPlxuXG4gICAgc3VwZXJcblxuICAgIHJldHVybiB0aGlzXG4iLCJcbmNsYXNzIEJ1YmJsZUVudGl0eSBleHRlbmRzIEVudGl0eVxuXG4gIGNvbnN0cnVjdG9yOiAocGFyZW50LCBjb25maWdWYWx1ZXMpIC0+XG5cbiAgICBzdXBlclxuXG4gICAgQHBhcmVudCAgICAgICA9IHBhcmVudFxuICAgIEBjb25maWdWYWx1ZXMgPSBjb25maWdWYWx1ZXNcblxuICAgIEBoZWlnaHQgICA9IDBcbiAgICBAaWQgICAgICAgPSBcImJ1YmJsZV9cIiArIE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cigyLCA1KVxuICAgIEBwb3NpdGlvbiA9XG4gICAgICB4OiBAZGV2aWNlLnNjcmVlbi53aWR0aCAgLyAyXG4gICAgICB5OiBAZGV2aWNlLnNjcmVlbi5oZWlnaHQgLyAyXG4gICAgQHZlbG9jaXR5ID1cbiAgICAgIHg6IHJhbmRvbShAY29uZmlnVmFsdWVzLnZlbG9jaXR5TWluLCBAY29uZmlnVmFsdWVzLnZlbG9jaXR5TWF4KVxuICAgICAgeTogcmFuZG9tKEBjb25maWdWYWx1ZXMudmVsb2NpdHlNaW4sIEBjb25maWdWYWx1ZXMudmVsb2NpdHlNYXgpXG4gICAgQHdpZHRoICAgID0gMFxuXG4gICAgQGFscGhhICAgICAgICAgICAgPSAwLjc1XG4gICAgQGNvbG9yICAgICAgICAgICAgPSByYW5kb21Db2xvcigpXG4gICAgQGRlc3Ryb3lpbmcgICAgICAgPSBmYWxzZVxuICAgIEBkaWFtZXRlciAgICAgICAgID0gMVxuICAgIEBmaWxsQ29sb3IgICAgICAgID0gQGNvbG9yXG4gICAgQHN0cm9rZUNvbG9yICAgICAgPSBAY29sb3JcbiAgICBAZmluYWxEaWFtZXRlciAgICA9IHJhbmRvbUludGVnZXIoMCwgY29uZmlnVmFsdWVzLmRpYW1ldGVyTWF4KVxuICAgIEBpc1RhcmdldCAgICAgICAgID0gQGRldGVybWluZVRhcmdldEJ1YmJsZSgpXG4gICAgQHJhZGl1cyAgICAgICAgICAgPSAwLjVcbiAgICBAc2hyaW5rTXVsdGlwbGllciA9IDAuOVxuXG4gICAgaWYgQGlzVGFyZ2V0XG4gICAgICBAYWxwaGEgICAgICAgICA9IDAuOVxuICAgICAgQGZpbGxDb2xvciAgICAgPSBcIjI0MCwgMjQwLCAyNDBcIlxuICAgICAgQGZpbmFsRGlhbWV0ZXIgPSByYW5kb21JbnRlZ2VyKEBjb25maWdWYWx1ZXMubWluVGFyZ2V0RGlhbWV0ZXIsIEBjb25maWdWYWx1ZXMuZGlhbWV0ZXJNYXgpXG4gICAgICBAbGluZVdpZHRoICAgICA9IEBkaWFtZXRlciAvIDEwXG5cbiAgICAgIEB2ZWxvY2l0eS54ICo9IEBjb25maWdWYWx1ZXMudGFyZ2V0VmVsb2NpdHlNdWx0aXBsaWVyXG4gICAgICBAdmVsb2NpdHkueSAqPSBAY29uZmlnVmFsdWVzLnRhcmdldFZlbG9jaXR5TXVsdGlwbGllclxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBjYW52YXNFeGl0Q2FsbGJhY2s6IC0+XG5cbiAgICBzdXBlclxuXG4gICAgQHBhcmVudC5nYW1lT3ZlcigpIGlmIEBpc1RhcmdldFxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBkZXRlcm1pbmVUYXJnZXRCdWJibGU6IC0+XG5cbiAgICBpZiBAY29uZmlnVmFsdWVzLnRhcmdldEJ1YmJsZXNDb3VudCA8IEBjb25maWdWYWx1ZXMubWF4VGFyZ2V0c0F0T25jZVxuICAgICAgcmV0dXJuIHJhbmRvbVBlcmNlbnRhZ2UoKSA8IEBjb25maWdWYWx1ZXMuY2hhbmNlQnViYmxlSXNUYXJnZXRcblxuICAgIHJldHVybiBmYWxzZVxuXG4gIHJlbmRlcjogLT5cblxuICAgIEBjb250ZXh0LmxpbmVXaWR0aCAgID0gQGxpbmVXaWR0aFxuICAgIEBjb250ZXh0LmZpbGxTdHlsZSAgID0gcmdiYShAZmlsbENvbG9yLCAgIEBhbHBoYSlcbiAgICBAY29udGV4dC5zdHJva2VTdHlsZSA9IHJnYmEoQHN0cm9rZUNvbG9yLCBAYWxwaGEpXG5cbiAgICBAY29udGV4dC5iZWdpblBhdGgoKVxuICAgIEBjb250ZXh0LmFyYyhAcG9zaXRpb24ueCwgQHBvc2l0aW9uLnksIEByYWRpdXMsIDAsIE1hdGguUEkgKiAyLCB0cnVlKVxuICAgIEBjb250ZXh0LmZpbGwoKVxuICAgIEBjb250ZXh0LnN0cm9rZSgpIGlmIEBpc1RhcmdldFxuICAgIEBjb250ZXh0LmNsb3NlUGF0aCgpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHVwZGF0ZTogLT5cblxuICAgIHN1cGVyXG5cbiAgICBpZiBAZGVzdHJveWluZ1xuICAgICAgQGRpYW1ldGVyICo9IChpZiBAcGFyZW50LnBsYXlpbmcgdGhlbiAwLjYgZWxzZSBAc2hyaW5rTXVsdGlwbGllcilcblxuICAgICAgQHJlbW92ZVNlbGZGcm9tUGFyZW50KCkgaWYgQGRpYW1ldGVyIDwgMVxuICAgIGVsc2VcbiAgICAgIEBkaWFtZXRlciAqPSBAY29uZmlnVmFsdWVzLmJ1YmJsZUdyb3d0aE11bHRpcGxpZXIgaWYgQGRpYW1ldGVyIDwgQGZpbmFsRGlhbWV0ZXJcblxuICAgIEBkaWFtZXRlciAgPSBjbGFtcChAZGlhbWV0ZXIsIDAsIEBmaW5hbERpYW1ldGVyKVxuICAgIEBsaW5lV2lkdGggPSBjbGFtcChAZGlhbWV0ZXIgLyAxMCwgMCwgQGNvbmZpZ1ZhbHVlcy5tYXhMaW5lV2lkdGgpIGlmIEBpc1RhcmdldFxuXG4gICAgQGhlaWdodCA9IEBkaWFtZXRlclxuICAgIEB3aWR0aCAgPSBAZGlhbWV0ZXJcbiAgICBAcmFkaXVzID0gQGRpYW1ldGVyIC8gMlxuXG4gICAgQHBvc2l0aW9uLnggKz0gQHZlbG9jaXR5LnhcbiAgICBAcG9zaXRpb24ueSArPSBAdmVsb2NpdHkueVxuXG4gICAgQGFkZFNlbGZUb1JlbmRlclF1ZXVlKClcblxuICAgIHJldHVybiB0aGlzXG5cbiAgd2FzVGFwcGVkOiAoKSAtPlxuXG4gICAgdG91Y2hEYXRhID0gQGlucHV0LnRvdWNoRGF0YVxuXG4gICAgdGFwWCAgICAgID0gdG91Y2hEYXRhLnhcbiAgICB0YXBZICAgICAgPSB0b3VjaERhdGEueVxuICAgIGRpc3RhbmNlWCA9IHRhcFggLSBAcG9zaXRpb24ueFxuICAgIGRpc3RhbmNlWSA9IHRhcFkgLSBAcG9zaXRpb24ueVxuICAgIHRhcHBlZCAgICA9IChkaXN0YW5jZVggKiBkaXN0YW5jZVgpICsgKGRpc3RhbmNlWSAqIGRpc3RhbmNlWSkgPCAoQHJhZGl1cyAqIEByYWRpdXMpXG5cbiAgICAjIyNcbiAgICBpZiB0YXBwZWRcbiAgICAgIGRlYnVnQ29uc29sZShcIkJ1YmJsZSMje0BpZH0gdGFwcGVkIGF0ICN7dGFwWH0sICN7dGFwWX1cIilcbiAgICBlbHNlXG4gICAgICBkZWJ1Z0NvbnNvbGUoXCJDb21ibyBCcm9rZW4hXCIpXG4gICAgIyMjXG5cbiAgICByZXR1cm4gdGFwcGVkXG5cbiAgdGFwSGFuZGxlcjogKHRhcmdldEhpdCkgLT5cblxuICAgIEBwYXJlbnQudXBkYXRlQ29tYm9NdWx0aXBsaWVyKHRhcmdldEhpdClcblxuICAgIGlmIHRhcmdldEhpdFxuICAgICAgQHBhcmVudC51cGRhdGVTY29yZShAZGlhbWV0ZXIsIEBmaW5hbERpYW1ldGVyKVxuICAgICAgQGRlc3Ryb3lpbmcgPSB0cnVlXG4gICAgICBAcGFyZW50LmRlY3JlbWVudFRhcmdldEJ1YmJsZXNDb3VudCgpXG4gICAgICBAaW5wdXQucXVldWVFbnRpdHlGb3JSZW1vdmFsKEBpZClcblxuICAgIHJldHVybiB0aGlzXG4iLCJcbiMgTG9hZCB0aGUgbWFpbiBhcHAgd3JhcHBlclxuQXBwID0gbmV3IEFwcGxpY2F0aW9uKClcblxuIyBHZXQgdXAgZ2V0IG9uIGdldCB1cCBnZXQgb24gdXAgc3RheSBvbiB0aGUgc2NlbmUgZXRjIGV0Y1xuQXBwLmxvYWQoKVxuXG4jIyNcbmNhbGxOYXRpdmVBcHAgPSAtPlxuICB0cnlcbiAgICAgIHdlYmtpdC5tZXNzYWdlSGFuZGxlcnMuY2FsbGJhY2tIYW5kbGVyLnBvc3RNZXNzYWdlKFwiSGVsbG8gZnJvbSBKYXZhU2NyaXB0XCIpXG4gIGNhdGNoIGVyclxuICAgICAgY29uc29sZS5sb2coJ1RoZSBuYXRpdmUgY29udGV4dCBkb2VzIG5vdCBleGlzdCB5ZXQnKVxuXG53aW5kb3cuc2V0VGltZW91dCAtPlxuICAgIGNhbGxOYXRpdmVBcHAoKVxuLCAxMDAwXG4jIyNcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==