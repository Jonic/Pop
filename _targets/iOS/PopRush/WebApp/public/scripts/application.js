var $, callNativeApp, clamp, correctValueForDPR, debugConsole, formatWithComma, fps, random, randomColor, randomInteger, randomPercentage, rgba, updateUITextNode;

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

callNativeApp = function(message) {
  var err;
  try {
    return webkit.messageHandlers.callbackHandler.postMessage(message);
  } catch (_error) {
    err = _error;
    return console.log('The native context does not exist yet');
  }
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

debugConsole = function(message) {
  var element;
  element = $('.debugConsole');
  updateUITextNode(element, message);
  console.log(message);
  callNativeApp(message);
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
  return r + ", " + g + ", " + b;
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
      this.element.style.width = oldWidth + "px";
      this.element.style.height = oldHeight + "px";
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
    var array, i, index, key, len, nextKey, value;
    path = path.split('.');
    array = this.values;
    for (index = i = 0, len = path.length; i < len; index = ++i) {
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
    var array, i, index, key, len, nextKey;
    path = path.split('.');
    array = this.values;
    for (index = i = 0, len = path.length; i < len; index = ++i) {
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
      debugConsole(type + " on " + node + " - id: " + id + " - class: " + classList);
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
    var i, id, len, ref;
    ref = this.entitiesPendingRemoval;
    for (i = 0, len = ref.length; i < len; i++) {
      id = ref[i];
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
    var entity, i, len, ref, tapped;
    this.touchData = this.getTouchData(event);
    ref = this.entitiesToTest;
    for (i = 0, len = ref.length; i < len; i++) {
      entity = ref[i];
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
    var entity, i, len, ref;
    ref = this.renderStack;
    for (i = 0, len = ref.length; i < len; i++) {
      entity = ref[i];
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

  UserInterfaceHelper.prototype.transitionTo = function(targetSceneID, instant) {
    var targetScene;
    if (instant == null) {
      instant = false;
    }
    targetScene = App.scenes[targetSceneID];
    if (App.currentScene != null) {
      App.currentScene.unload();
    }
    targetScene.load();
    this.updateBodyClass("scene-" + targetSceneID);
    App.currentScene = targetScene;
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
    this.initHelpers();
    this.initScenes();
    return this;
  }

  Application.prototype.load = function() {
    this.getHelper('animationLoop').start();
    this.getHelper('ui').transitionTo('ident');
    return this;
  };

  Application.prototype.initHelpers = function() {
    var helper, i, len, ref;
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
    ref = this.helpers;
    for (i = 0, len = ref.length; i < len; i++) {
      helper = ref[i];
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
    var ref, sceneName, sceneObject;
    this.scenes = {
      'ident': new IdentScene(),
      'game-over': new GameOverScene(),
      'playing': new PlayingScene(),
      'title': new TitleScene()
    };
    ref = this.scenes;
    for (sceneName in ref) {
      sceneObject = ref[sceneName];
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
    var backgroundScene, i, len, ref;
    this.delta = delta;
    if (this.currentScene != null) {
      this.getHelper('canvas').clear();
      this.currentScene.update();
      ref = this.backgroundScenes;
      for (i = 0, len = ref.length; i < len; i++) {
        backgroundScene = ref[i];
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
    var entity, i, len, ref;
    ref = this.entities;
    for (i = 0, len = ref.length; i < len; i++) {
      entity = ref[i];
      entity.update();
    }
    return this;
  };

  Scene.prototype.processEntitiesMarkedForRemoval = function() {
    var i, id, index, len, ref;
    ref = this.entitiesPendingRemoval;
    for (i = 0, len = ref.length; i < len; i++) {
      id = ref[i];
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
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

GameOverScene = (function(superClass) {
  extend(GameOverScene, superClass);

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
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

IdentScene = (function(superClass) {
  extend(IdentScene, superClass);

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
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PlayingScene = (function(superClass) {
  extend(PlayingScene, superClass);

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
    var bubble, i, len, ref;
    if (this.playing === true) {
      ref = this.entities;
      for (i = 0, len = ref.length; i < len; i++) {
        bubble = ref[i];
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
    var adjustedValue, levelMulitplier, propertyName, propertyValues, ref, valueDifference;
    levelMulitplier = this.level / this.maxLevel;
    ref = this.difficultyConfig;
    for (propertyName in ref) {
      propertyValues = ref[propertyName];
      valueDifference = propertyValues.difficult - propertyValues.easy;
      adjustedValue = (valueDifference * levelMulitplier) + propertyValues.easy;
      this.difficultyConfig[propertyName].current = adjustedValue;
    }
    return this;
  };

  return PlayingScene;

})(Scene);

var TitleScene,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

TitleScene = (function(superClass) {
  extend(TitleScene, superClass);

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
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

BubbleEntity = (function(superClass) {
  extend(BubbleEntity, superClass);

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
    var distanceX, distanceY, message, tapX, tapY, tapped, touchData;
    touchData = this.input.touchData;
    tapX = touchData.x;
    tapY = touchData.y;
    distanceX = tapX - this.position.x;
    distanceY = tapY - this.position.y;
    tapped = (distanceX * distanceX) + (distanceY * distanceY) < (this.radius * this.radius);
    if (tapped) {
      message = "Bubble#" + this.id + " tapped at " + tapX + ", " + tapY;
    } else {
      message = "Combo Broken!";
    }
    debugConsole(message);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInV0aWxzLmNvZmZlZSIsIkFuaW1hdGlvbkxvb3BIZWxwZXIuY29mZmVlIiwiQ2FudmFzSGVscGVyLmNvZmZlZSIsIkNvbmZpZ0hlbHBlci5jb2ZmZWUiLCJEZXZpY2VIZWxwZXIuY29mZmVlIiwiSW5wdXRIZWxwZXIuY29mZmVlIiwiUmVuZGVyZXJIZWxwZXIuY29mZmVlIiwiVXNlckludGVyZmFjZUhlbHBlci5jb2ZmZWUiLCJBcHBsaWNhdGlvbi5jb2ZmZWUiLCJFbnRpdHkuY29mZmVlIiwiU2NlbmUuY29mZmVlIiwiR2FtZU92ZXJTY2VuZS5jb2ZmZWUiLCJJZGVudFNjZW5lLmNvZmZlZSIsIlBsYXlpbmdTY2VuZS5jb2ZmZWUiLCJUaXRsZVNjZW5lLmNvZmZlZSIsIkJ1YmJsZUVudGl0eS5jb2ZmZWUiLCJib290c3RyYXAuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLElBQUE7O0FBQUEsQ0FBQSxHQUFJLFNBQUMsUUFBRDtBQUVGLE1BQUE7RUFBQSxJQUF3QixRQUFBLEtBQVksTUFBcEM7QUFBQSxXQUFPLFFBQVEsQ0FBQyxLQUFoQjs7RUFFQSxJQUE0QyxRQUFRLENBQUMsTUFBVCxDQUFnQixDQUFoQixFQUFtQixDQUFuQixDQUFBLEtBQXlCLEdBQXJFO0FBQUEsV0FBTyxRQUFRLENBQUMsY0FBVCxDQUF3QixRQUF4QixFQUFQOztFQUVBLEdBQUEsR0FBTSxRQUFRLENBQUMsZ0JBQVQsQ0FBMEIsUUFBMUI7RUFFTixJQUFpQixHQUFHLENBQUMsTUFBSixLQUFjLENBQS9CO0FBQUEsV0FBTyxHQUFJLENBQUEsQ0FBQSxFQUFYOztBQUVBLFNBQU87QUFWTDs7QUFZSixhQUFBLEdBQWdCLFNBQUMsT0FBRDtBQUNkLE1BQUE7QUFBQTtXQUNFLE1BQU0sQ0FBQyxlQUFlLENBQUMsZUFBZSxDQUFDLFdBQXZDLENBQW1ELE9BQW5ELEVBREY7R0FBQSxjQUFBO0lBRU07V0FDSixPQUFPLENBQUMsR0FBUixDQUFZLHVDQUFaLEVBSEY7O0FB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LElBQUcsU0FBSDtNQUNFLElBQUMsQ0FBQSxNQUFNLENBQUMsV0FBUixDQUFvQixJQUFDLENBQUEsUUFBckIsRUFBK0IsSUFBQyxDQUFBLGFBQWhDO01BQ0EsSUFBQyxDQUFBLFVBQUQsR0FBYztNQUNkLElBQUMsQ0FBQSxNQUFNLENBQUMsMkJBQVIsQ0FBQTtNQUNBLElBQUMsQ0FBQSxLQUFLLENBQUMscUJBQVAsQ0FBNkIsSUFBQyxDQUFBLEVBQTlCLEVBSkY7O0FBTUEsV0FBTztFQVZHOzs7O0dBbEhhOztBQ0MzQixJQUFBOztBQUFBLEdBQUEsR0FBVSxJQUFBLFdBQUEsQ0FBQTs7QUFHVixHQUFHLENBQUMsSUFBSixDQUFBIiwiZmlsZSI6ImFwcGxpY2F0aW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXG4kID0gKHNlbGVjdG9yKSAtPlxuXG4gIHJldHVybiBkb2N1bWVudC5ib2R5IGlmIHNlbGVjdG9yID09ICdib2R5J1xuXG4gIHJldHVybiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChzZWxlY3RvcikgaWYgc2VsZWN0b3Iuc3Vic3RyKDAsIDEpID09ICcjJ1xuXG4gIGVscyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpXG5cbiAgcmV0dXJuIGVsc1swXSBpZiBlbHMubGVuZ3RoID09IDFcblxuICByZXR1cm4gZWxzXG5cbmNhbGxOYXRpdmVBcHAgPSAobWVzc2FnZSkgLT5cbiAgdHJ5XG4gICAgd2Via2l0Lm1lc3NhZ2VIYW5kbGVycy5jYWxsYmFja0hhbmRsZXIucG9zdE1lc3NhZ2UobWVzc2FnZSlcbiAgY2F0Y2ggZXJyXG4gICAgY29uc29sZS5sb2coJ1RoZSBuYXRpdmUgY29udGV4dCBkb2VzIG5vdCBleGlzdCB5ZXQnKVxuXG5jbGFtcCA9ICh2YWx1ZSwgbWluLCBtYXgpIC0+XG5cbiAgaWYgdmFsdWUgPCBtaW5cbiAgICB2YWx1ZSA9IG1pblxuICBlbHNlIGlmIHZhbHVlID4gbWF4XG4gICAgdmFsdWUgPSBtYXhcblxuICByZXR1cm4gdmFsdWVcblxuY29ycmVjdFZhbHVlRm9yRFBSID0gKHZhbHVlLCBpbnRlZ2VyID0gZmFsc2UpIC0+XG5cbiAgdmFsdWUgKj0gZGV2aWNlUGl4ZWxSYXRpb1xuXG4gIHZhbHVlID0gTWF0aC5yb3VuZCh2YWx1ZSkgaWYgaW50ZWdlclxuXG4gIHJldHVybiB2YWx1ZVxuXG5kZWJ1Z0NvbnNvbGUgPSAobWVzc2FnZSkgLT5cblxuICBlbGVtZW50ID0gJCgnLmRlYnVnQ29uc29sZScpXG5cbiAgdXBkYXRlVUlUZXh0Tm9kZShlbGVtZW50LCBtZXNzYWdlKVxuICBjb25zb2xlLmxvZyhtZXNzYWdlKVxuICBjYWxsTmF0aXZlQXBwKG1lc3NhZ2UpXG5cbiAgcmV0dXJuXG5cbmZvcm1hdFdpdGhDb21tYSA9IChudW0pIC0+XG5cbiAgcmV0dXJuIG51bS50b1N0cmluZygpLnJlcGxhY2UoL1xcQig/PShcXGR7M30pKyg/IVxcZCkpL2csIFwiLFwiKVxuXG5mcHMgPSAodmFsdWUpIC0+XG5cbiAgZWxlbWVudCA9ICQoJy5mcHMnKVxuXG4gIHVwZGF0ZVVJVGV4dE5vZGUoZWxlbWVudCwgdmFsdWUpXG5cbiAgcmV0dXJuXG5cbnJhbmRvbSA9IChtaW4sIG1heCkgLT5cblxuICBpZiBtaW4gPT0gdW5kZWZpbmVkXG4gICAgbWluID0gMFxuICAgIG1heCA9IDFcbiAgZWxzZSBpZiBtYXggPT0gdW5kZWZpbmVkXG4gICAgbWF4ID0gbWluXG4gICAgbWluID0gMFxuXG4gIHJldHVybiAoTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4pKSArIG1pbjtcblxucmFuZG9tQ29sb3IgPSAoKSAtPlxuXG4gIHIgPSByYW5kb21JbnRlZ2VyKDAsIDIwMClcbiAgZyA9IHJhbmRvbUludGVnZXIoMCwgMjAwKVxuICBiID0gcmFuZG9tSW50ZWdlcigwLCAyMDApXG5cbiAgcmV0dXJuIFwiI3tyfSwgI3tnfSwgI3tifVwiXG5cbnJhbmRvbUludGVnZXIgPSAobWluLCBtYXgpIC0+XG5cbiAgaWYgbWF4ID09IHVuZGVmaW5lZFxuICAgIG1heCA9IG1pblxuICAgIG1pbiA9IDBcblxuICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKG1heCArIDEgLSBtaW4pKSArIG1pblxuXG5yYW5kb21QZXJjZW50YWdlID0gLT5cblxuICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTAwKVxuXG5yZ2JhID0gKGNvbG9yLCBhbHBoYSA9IGZhbHNlKSAtPlxuXG4gIGFscGhhID0gMSBpZiAhYWxwaGFcblxuICByZXR1cm4gXCJyZ2JhKCN7Y29sb3J9LCAje2FscGhhfSlcIlxuXG51cGRhdGVVSVRleHROb2RlID0gKGVsZW1lbnQsIHZhbHVlKSAtPlxuXG4gIGVsZW1lbnQuaW5uZXJIVE1MID0gdmFsdWVcblxuICByZXR1cm4gdGhpc1xuIiwiXG5jbGFzcyBBbmltYXRpb25Mb29wSGVscGVyXG5cbiAgY29uc3RydWN0b3I6IC0+XG5cbiAgICBAYW5pbWF0aW9uTG9vcElkID0gbnVsbFxuICAgIEBkZWx0YSAgICAgICAgICAgPSAwXG4gICAgQGZwcyAgICAgICAgICAgICA9IDBcbiAgICBAbGFzdFRpbWUgICAgICAgID0gMFxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBjb3JyZWN0VmFsdWU6ICh2YWx1ZSkgLT5cblxuICAgIHJldHVybiAodmFsdWUgKiBAZGVsdGEpICogKDYwIC8gMTAwMClcblxuICBzdGFydDogLT5cblxuICAgIEBmcmFtZSgpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHN0b3A6IC0+XG5cbiAgICB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUoQGFuaW1hdGlvbkxvb3BJZClcblxuICAgIHJldHVybiB0aGlzXG5cbiAgZnJhbWU6IChub3cpIC0+XG5cbiAgICBAZGVsdGEgICAgPSBub3cgLSBAbGFzdFRpbWVcbiAgICBAZnBzICAgICAgPSBNYXRoLnJvdW5kKDEwMDAgLyBAZGVsdGEpXG4gICAgQGxhc3RUaW1lID0gbm93XG5cbiAgICAjZnBzKEBmcHMpXG5cbiAgICBBcHAudXBkYXRlKEBkZWx0YSlcblxuICAgIEBhbmltYXRpb25Mb29wSWQgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lIChub3cpID0+XG4gICAgICBAZnJhbWUobm93KVxuICAgICAgcmV0dXJuXG5cbiAgICByZXR1cm4gdGhpc1xuIiwiXG5jbGFzcyBDYW52YXNIZWxwZXJcblxuICBsb2FkOiAtPlxuXG4gICAgQGRldmljZSA9IEFwcC5nZXRIZWxwZXIoJ2RldmljZScpXG4gICAgQGlucHV0ICA9IEFwcC5nZXRIZWxwZXIoJ2lucHV0JylcblxuICAgIEBlbGVtZW50U2VsZWN0b3IgPSAnLmNhbnZhcydcblxuICAgIEBjcmVhdGVDYW52YXMoKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBjbGVhcjogLT5cblxuICAgICNAZWxlbWVudC53aWR0aCA9IEBlbGVtZW50LndpZHRoXG4gICAgQGNvbnRleHQuY2xlYXJSZWN0KDAsIDAsIEBlbGVtZW50LndpZHRoLCBAZWxlbWVudC5oZWlnaHQpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIGNyZWF0ZUNhbnZhczogLT5cblxuICAgIEBlbGVtZW50ICAgICAgICA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoQGVsZW1lbnRTZWxlY3RvcilcbiAgICBAZWxlbWVudC5oZWlnaHQgPSBAZGV2aWNlLnNjcmVlbi5oZWlnaHRcbiAgICBAZWxlbWVudC53aWR0aCAgPSBAZGV2aWNlLnNjcmVlbi53aWR0aFxuXG4gICAgQGVsZW1lbnQucmVhbEhlaWdodCA9IEBlbGVtZW50LmhlaWdodFxuICAgIEBlbGVtZW50LnJlYWxXaWR0aCAgPSBAZWxlbWVudC53aWR0aFxuXG4gICAgQGNvbnRleHQgPSBAZWxlbWVudC5nZXRDb250ZXh0KCcyZCcpXG5cbiAgICBAY29udGV4dC5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb24gPSAnZGVzdGluYXRpb24tYXRvcCdcblxuICAgIEBzY2FsZUNhbnZhcygpXG5cbiAgICBAaW5wdXQuYWRkQ2FudmFzVGFwRXZlbnRMaXN0ZW5lcihAZWxlbWVudFNlbGVjdG9yKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBzY2FsZUNhbnZhczogLT5cblxuICAgIGJhY2tpbmdTdG9yZVJhdGlvID0gQGNvbnRleHQud2Via2l0QmFja2luZ1N0b3JlUGl4ZWxSYXRpbyB8fCBAY29udGV4dC5iYWNraW5nU3RvcmVQaXhlbFJhdGlvIHx8IDFcblxuICAgIGlmIEBkZXZpY2UucGl4ZWxSYXRpbyAhPSBiYWNraW5nU3RvcmVSYXRpb1xuICAgICAgcmF0aW8gICAgID0gQGRldmljZS5waXhlbFJhdGlvIC8gYmFja2luZ1N0b3JlUmF0aW9cbiAgICAgIG9sZFdpZHRoICA9IEBlbGVtZW50LndpZHRoXG4gICAgICBvbGRIZWlnaHQgPSBAZWxlbWVudC5oZWlnaHRcblxuICAgICAgQGVsZW1lbnQud2lkdGggID0gb2xkV2lkdGggICogcmF0aW9cbiAgICAgIEBlbGVtZW50LmhlaWdodCA9IG9sZEhlaWdodCAqIHJhdGlvXG5cbiAgICAgIEBlbGVtZW50LnN0eWxlLndpZHRoICA9IFwiI3tvbGRXaWR0aH1weFwiXG4gICAgICBAZWxlbWVudC5zdHlsZS5oZWlnaHQgPSBcIiN7b2xkSGVpZ2h0fXB4XCJcblxuICAgICAgQGNvbnRleHQuc2NhbGUocmF0aW8sIHJhdGlvKVxuXG4gICAgcmV0dXJuIHRoaXNcbiIsIlxuY2xhc3MgQ29uZmlnSGVscGVyXG5cbiAgbG9hZDogLT5cblxuICAgIEB2YWx1ZXMgPSB7fVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBjb25zb2xlOiAocGF0aCkgLT5cblxuICAgIGRlYnVnQ29uc29sZShAZ2V0KHBhdGgpKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBkdW1wOiAocGF0aCkgLT5cblxuICAgIGR1bXBpbmcgPSBAdmFsdWVzXG5cbiAgICBpZiAocGF0aClcbiAgICAgIGR1bXBpbmcgPSBcIkNvbmZpZy4je3BhdGh9OiAje0BnZXQocGF0aCl9XCJcblxuICAgIGNvbnNvbGUubG9nKGR1bXBpbmcpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIGdldDogKHBhdGgpIC0+XG5cbiAgICBwYXRoICA9IHBhdGguc3BsaXQgJy4nXG4gICAgYXJyYXkgPSBAdmFsdWVzXG5cbiAgICBmb3Iga2V5LCBpbmRleCBpbiBwYXRoXG4gICAgICBuZXh0S2V5ID0gcGF0aFtpbmRleCArIDFdXG5cbiAgICAgIGlmIG5leHRLZXk/XG4gICAgICAgIGFycmF5ID0gYXJyYXlba2V5XVxuICAgICAgZWxzZVxuICAgICAgICB2YWx1ZSA9IGFycmF5W2tleV1cblxuICAgIHJldHVybiB2YWx1ZSBpZiB2YWx1ZT9cblxuICBzZXQ6IChwYXRoLCB2YWx1ZSkgLT5cblxuICAgIHBhdGggID0gcGF0aC5zcGxpdCAnLidcbiAgICBhcnJheSA9IEB2YWx1ZXNcblxuICAgIGZvciBrZXksIGluZGV4IGluIHBhdGhcbiAgICAgIG5leHRLZXkgPSBwYXRoW2luZGV4ICsgMV1cblxuICAgICAgaWYgIWFycmF5W2tleV1cbiAgICAgICAgaWYgbmV4dEtleT9cbiAgICAgICAgICBhcnJheVtrZXldID0ge31cbiAgICAgICAgZWxzZVxuICAgICAgICAgIGFycmF5W2tleV0gPSB2YWx1ZVxuXG4gICAgICBhcnJheSA9IGFycmF5W2tleV1cblxuICAgIHJldHVybiB0aGlzXG4iLCJcbmNsYXNzIERldmljZUhlbHBlclxuXG4gIGNvbnN0cnVjdG9yOiAtPlxuXG4gICAgQHNjcmVlbiA9XG4gICAgICBoZWlnaHQ6IGRvY3VtZW50LmJvZHkuY2xpZW50SGVpZ2h0XG4gICAgICB3aWR0aDogIGRvY3VtZW50LmJvZHkuY2xpZW50V2lkdGhcblxuICAgIEBhbmRyb2lkICAgICAgICA9IGlmIG5hdmlnYXRvci51c2VyQWdlbnQubWF0Y2goL2FuZHJvaWQvaSkgdGhlbiB0cnVlIGVsc2UgZmFsc2VcbiAgICBAaW9zICAgICAgICAgICAgPSAhQGFuZHJvaWRcbiAgICBAaGFzVG91Y2hFdmVudHMgPSB3aW5kb3cuaGFzT3duUHJvcGVydHkoJ29udG91Y2hzdGFydCcpIHx8IHdpbmRvdy5oYXNPd25Qcm9wZXJ0eSgnb25tc2dlc3R1cmVjaGFuZ2UnKVxuICAgIEBwaXhlbFJhdGlvICAgICA9IHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvIHx8IDFcblxuICAgIHJldHVybiB0aGlzXG4iLCJcbmNsYXNzIElucHV0SGVscGVyXG5cbiAgY29uc3RydWN0b3I6IC0+XG5cbiAgICBAZGV2aWNlID0gbmV3IERldmljZUhlbHBlcigpXG5cbiAgICBAY2FuY2VsVG91Y2hNb3ZlRXZlbnRzKClcblxuICAgICNAc2V0dXBDb25zb2xlKClcblxuICAgIHJldHVybiB0aGlzXG5cbiAgbG9hZDogLT5cblxuICAgIEBlbnRpdHlJZHMgICAgICAgICAgICAgID0gW11cbiAgICBAZW50aXRpZXNUb1Rlc3QgICAgICAgICA9IFtdXG4gICAgQGVudGl0aWVzUGVuZGluZ1JlbW92YWwgPSBbXVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBhZGRDYW52YXNUYXBFdmVudExpc3RlbmVyOiAoY2FudmFzU2VsZWN0b3IpIC0+XG5cbiAgICBAYWRkRXZlbnRMaXN0ZW5lciBjYW52YXNTZWxlY3RvciwgJ2NsaWNrJywgPT5cbiAgICAgIEB0ZXN0RW50aXRpZXNGb3JFdmVudHMoKVxuICAgICAgcmV0dXJuXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIGFkZEV2ZW50TGlzdGVuZXI6IChzZWxlY3RvciA9ICdib2R5JywgdHlwZSwgY2FsbGJhY2ssIGNvbnNvbGVPdXRwdXQgPSBmYWxzZSkgLT5cblxuICAgIHR5cGUgPSBAY29udmVydENsaWNrVG9Ub3VjaCh0eXBlKVxuXG4gICAgZGVidWdDb25zb2xlKFwiSW5wdXQuYWRkRXZlbnRMaXN0ZW5lcigje3NlbGVjdG9yfSwgI3t0eXBlfSwgI3tjYWxsYmFja30pXCIpIGlmIGNvbnNvbGVPdXRwdXRcblxuICAgICQoc2VsZWN0b3IpLmFkZEV2ZW50TGlzdGVuZXIgdHlwZSwgY2FsbGJhY2ssIGZhbHNlXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIGNhbmNlbFRvdWNoTW92ZUV2ZW50czogLT5cblxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyICd0b3VjaG1vdmUnLCAoZXZlbnQpIC0+XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICByZXR1cm5cblxuICAgIHJldHVybiB0aGlzXG5cbiAgY29udmVydENsaWNrVG9Ub3VjaDogKHR5cGUpIC0+XG5cbiAgICBpZiB0eXBlID09ICdjbGljaycgJiYgQGRldmljZS5oYXNUb3VjaEV2ZW50c1xuICAgICAgcmV0dXJuICd0b3VjaHN0YXJ0J1xuICAgIGVsc2VcbiAgICAgIHJldHVybiB0eXBlXG5cbiAgZ2V0VG91Y2hEYXRhOiAoZXZlbnQpIC0+XG5cbiAgICBpZiBAZGV2aWNlLmhhc1RvdWNoRXZlbnRzXG4gICAgICB0b3VjaERhdGEgPVxuICAgICAgICB4OiBldmVudC50b3VjaGVzWzBdLnBhZ2VYLFxuICAgICAgICB5OiBldmVudC50b3VjaGVzWzBdLnBhZ2VZXG4gICAgZWxzZVxuICAgICAgdG91Y2hEYXRhID1cbiAgICAgICAgeDogZXZlbnQuY2xpZW50WCxcbiAgICAgICAgeTogZXZlbnQuY2xpZW50WVxuXG4gICAgcmV0dXJuIHRvdWNoRGF0YVxuXG4gIHJlbW92ZUV2ZW50TGlzdGVuZXI6IChzZWxlY3RvciA9ICdib2R5JywgdHlwZSwgY2FsbGJhY2spIC0+XG5cbiAgICB0eXBlID0gQGNvbnZlcnRDbGlja1RvVG91Y2godHlwZSlcblxuICAgIGRlYnVnQ29uc29sZShcIklucHV0LnJlbW92ZUV2ZW50TGlzdGVuZXIoI3tzZWxlY3Rvcn0sICN7dHlwZX0sICN7Y2FsbGJhY2t9KVwiKVxuXG4gICAgJChzZWxlY3RvcikucmVtb3ZlRXZlbnRMaXN0ZW5lciB0eXBlLCBjYWxsYmFjaywgZmFsc2VcblxuICAgIHJldHVybiB0aGlzXG5cbiAgc2V0dXBDb25zb2xlOiAtPlxuXG4gICAgQGFkZEV2ZW50TGlzdGVuZXIgJ2JvZHknLCAnY2xpY2snLCAoZXZlbnQpIC0+XG4gICAgICB0eXBlICAgICAgPSBldmVudC50eXBlXG4gICAgICBub2RlICAgICAgPSBldmVudC50YXJnZXQubm9kZU5hbWUudG9Mb3dlckNhc2UoKVxuICAgICAgaWQgICAgICAgID0gZXZlbnQudGFyZ2V0LmlkIHx8ICduL2EnXG4gICAgICBjbGFzc0xpc3QgPSBldmVudC50YXJnZXQuY2xhc3NMaXN0IHx8ICduL2EnXG5cbiAgICAgIGRlYnVnQ29uc29sZShcIiN7dHlwZX0gb24gI3tub2RlfSAtIGlkOiAje2lkfSAtIGNsYXNzOiAje2NsYXNzTGlzdH1cIilcbiAgICAgIHJldHVyblxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBhZGRFbnRpdHk6IChlbnRpdHkpIC0+XG5cbiAgICBAZW50aXR5SWRzLnB1c2goZW50aXR5LmlkKVxuICAgIEBlbnRpdGllc1RvVGVzdC5wdXNoKGVudGl0eSlcblxuICAgIHJldHVybiB0aGlzXG5cbiAgcXVldWVFbnRpdHlGb3JSZW1vdmFsOiAoaWQpIC0+XG5cbiAgICBAZW50aXRpZXNQZW5kaW5nUmVtb3ZhbC5wdXNoKGlkKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICByZW1vdmVBbGxFbnRpdGllczogLT5cblxuICAgIEBlbnRpdGllc1RvVGVzdCA9IFtdXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHJlbW92ZVF1ZXVlZEVudGl0aWVzOiAtPlxuXG4gICAgQHJlbW92ZUVudGl0eShpZCkgZm9yIGlkIGluIEBlbnRpdGllc1BlbmRpbmdSZW1vdmFsXG4gICAgQGVudGl0aWVzUGVuZGluZ1JlbW92YWwgPSBbXVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICByZW1vdmVFbnRpdHk6IChpZCkgLT5cblxuICAgIGluZGV4ID0gQGVudGl0eUlkcy5pbmRleE9mKGlkKTtcblxuICAgIGlmIGluZGV4ICE9IC0xXG4gICAgICBAZW50aXR5SWRzLnNwbGljZShpbmRleCwgMSlcbiAgICAgIEBlbnRpdGllc1RvVGVzdC5zcGxpY2UoaW5kZXgsIDEpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHRlc3RFbnRpdGllc0ZvckV2ZW50czogLT5cblxuICAgIEB0b3VjaERhdGEgPSBAZ2V0VG91Y2hEYXRhKGV2ZW50KVxuXG4gICAgZm9yIGVudGl0eSBpbiBAZW50aXRpZXNUb1Rlc3RcbiAgICAgIHRhcHBlZCA9IGVudGl0eS53YXNUYXBwZWQoKVxuXG4gICAgICBlbnRpdHkudGFwSGFuZGxlcih0YXBwZWQpXG5cbiAgICAgIGJyZWFrIGlmIHRhcHBlZFxuXG4gICAgQHJlbW92ZVF1ZXVlZEVudGl0aWVzKClcblxuICAgIHJldHVybiB0aGlzXG4iLCJcbmNsYXNzIFJlbmRlcmVySGVscGVyXG5cbiAgbG9hZDogLT5cblxuICAgIEByZW5kZXJTdGFjayA9IFtdXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIGVucXVldWU6IChlbnRpdHkpIC0+XG5cbiAgICBAcmVuZGVyU3RhY2sucHVzaChlbnRpdHkpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHByb2Nlc3M6IC0+XG5cbiAgICBmb3IgZW50aXR5IGluIEByZW5kZXJTdGFja1xuICAgICAgZW50aXR5LnJlbmRlcigpIGlmIGVudGl0eS5pc0luc2lkZUNhbnZhc0JvdW5kcygpXG5cbiAgICBAcmVzZXQoKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICByZXNldDogLT5cblxuICAgIEByZW5kZXJTdGFjayA9IFtdXG5cbiAgICByZXR1cm4gdGhpc1xuIiwiXG5jbGFzcyBVc2VySW50ZXJmYWNlSGVscGVyXG5cbiAgbG9hZDogLT5cblxuICAgIEBlbGVtZW50cyA9IHt9XG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIGVsZW1lbnQ6IChuYW1lKSAtPlxuXG4gICAgcmV0dXJuIEBlbGVtZW50c1tuYW1lXVxuXG4gIHJlbW92ZUFsbEVsZW1lbnRzOiAoc2NlbmVOYW1lKSAtPlxuXG4gICAgQGVsZW1lbnRzID0ge31cblxuICAgIHJldHVybiB0aGlzXG5cbiAgcmVnaXN0ZXJFbGVtZW50OiAobmFtZSwgc2VsZWN0b3IpIC0+XG5cbiAgICBAZWxlbWVudHNbbmFtZV0gPSAkKHNlbGVjdG9yKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICByZW1vdmVFbGVtZW50OiAobmFtZSkgLT5cblxuICAgIGRlbGV0ZSBAZWxlbWVudHNbbmFtZV0gaWYgQGVsZW1lbnRzW25hbWVdP1xuXG4gICAgcmV0dXJuIHRoaXNcblxuICB0cmFuc2l0aW9uVG86ICh0YXJnZXRTY2VuZUlELCBpbnN0YW50ID0gZmFsc2UpIC0+XG5cbiAgICB0YXJnZXRTY2VuZSA9IEFwcC5zY2VuZXNbdGFyZ2V0U2NlbmVJRF1cblxuICAgIGlmIEFwcC5jdXJyZW50U2NlbmU/XG4gICAgICBBcHAuY3VycmVudFNjZW5lLnVubG9hZCgpXG4gICAgICAjQHVwZGF0ZUJvZHlDbGFzcyhcInNjZW5lLSN7dGFyZ2V0U2NlbmVJRH0tb3V0XCIpXG5cbiAgICB0YXJnZXRTY2VuZS5sb2FkKClcblxuICAgIEB1cGRhdGVCb2R5Q2xhc3MoXCJzY2VuZS0je3RhcmdldFNjZW5lSUR9XCIpXG5cbiAgICBBcHAuY3VycmVudFNjZW5lID0gdGFyZ2V0U2NlbmVcblxuICAgIHJldHVybiB0aGlzXG5cbiAgdXBkYXRlQm9keUNsYXNzOiAoY2xhc3NOYW1lKSAtPlxuXG4gICAgZG9jdW1lbnQuYm9keS5jbGFzc05hbWUgPSAnJ1xuICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZChjbGFzc05hbWUpXG5cbiAgICByZXR1cm4gdGhpc1xuIiwiXG5jbGFzcyBBcHBsaWNhdGlvblxuXG4gIGNvbnN0cnVjdG9yOiAtPlxuXG4gICAgQGN1cnJlbnRTY2VuZSAgICAgPSBudWxsXG4gICAgQGRlbHRhICAgICAgICAgICAgPSAwXG4gICAgQGhlbHBlcnMgICAgICAgICAgPSB7fVxuICAgIEBzY2VuZXMgICAgICAgICAgID0ge31cbiAgICBAYmFja2dyb3VuZFNjZW5lcyA9IFtdXG5cbiAgICBAaW5pdEhlbHBlcnMoKVxuICAgIEBpbml0U2NlbmVzKClcblxuICAgIHJldHVybiB0aGlzXG5cbiAgbG9hZDogLT5cblxuICAgIEBnZXRIZWxwZXIoJ2FuaW1hdGlvbkxvb3AnKS5zdGFydCgpXG4gICAgQGdldEhlbHBlcigndWknKS50cmFuc2l0aW9uVG8oJ2lkZW50JylcblxuICAgIHJldHVybiB0aGlzXG5cbiAgaW5pdEhlbHBlcnM6IC0+XG5cbiAgICBAaGVscGVycyA9IHtcbiAgICAgIGFuaW1hdGlvbkxvb3A6IHsgb2JqZWN0OiBuZXcgQW5pbWF0aW9uTG9vcEhlbHBlcigpIH1cbiAgICAgIGNhbnZhczogICAgICAgIHsgb2JqZWN0OiBuZXcgQ2FudmFzSGVscGVyKCkgICAgICAgIH1cbiAgICAgIGNvbmZpZzogICAgICAgIHsgb2JqZWN0OiBuZXcgQ29uZmlnSGVscGVyKCkgICAgICAgIH1cbiAgICAgIGRldmljZTogICAgICAgIHsgb2JqZWN0OiBuZXcgRGV2aWNlSGVscGVyKCkgICAgICAgIH1cbiAgICAgIGlucHV0OiAgICAgICAgIHsgb2JqZWN0OiBuZXcgSW5wdXRIZWxwZXIoKSAgICAgICAgIH1cbiAgICAgIHJlbmRlcmVyOiAgICAgIHsgb2JqZWN0OiBuZXcgUmVuZGVyZXJIZWxwZXIoKSAgICAgIH1cbiAgICAgIHVpOiAgICAgICAgICAgIHsgb2JqZWN0OiBuZXcgVXNlckludGVyZmFjZUhlbHBlcigpIH1cbiAgICB9XG5cbiAgICBmb3IgaGVscGVyIGluIEBoZWxwZXJzXG4gICAgICBAbG9hZEhlbHBlcihoZWxwZXIpIGlmICFoZWxwZXIubG9hZGVkXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIGxvYWRIZWxwZXI6IChoZWxwZXIpIC0+XG5cbiAgICBoZWxwZXIub2JqZWN0LmxvYWQoKSBpZiBoZWxwZXIub2JqZWN0LmxvYWQ/XG4gICAgaGVscGVyLmxvYWRlZCA9IHRydWVcblxuICAgIHJldHVybiB0aGlzXG5cbiAgaW5pdFNjZW5lczogLT5cblxuICAgIEBzY2VuZXMgPSB7XG4gICAgICAnaWRlbnQnOiAgICAgbmV3IElkZW50U2NlbmUoKVxuICAgICAgJ2dhbWUtb3Zlcic6IG5ldyBHYW1lT3ZlclNjZW5lKClcbiAgICAgICdwbGF5aW5nJzogICBuZXcgUGxheWluZ1NjZW5lKClcbiAgICAgICd0aXRsZSc6ICAgICBuZXcgVGl0bGVTY2VuZSgpXG4gICAgfVxuXG4gICAgZm9yIHNjZW5lTmFtZSwgc2NlbmVPYmplY3Qgb2YgQHNjZW5lc1xuICAgICAgQGJhY2tncm91bmRTY2VuZXMucHVzaChzY2VuZU9iamVjdCkgaWYgc2NlbmVPYmplY3QudXBkYXRlc0luQmFja0dyb3VuZFxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBnZXRIZWxwZXI6IChuYW1lKSAtPlxuXG4gICAgaGVscGVyID0gQGhlbHBlcnNbbmFtZV1cblxuICAgIGlmICFoZWxwZXIubG9hZGVkXG4gICAgICBAbG9hZEhlbHBlcihoZWxwZXIpXG5cbiAgICByZXR1cm4gaGVscGVyLm9iamVjdFxuXG4gIHVwZGF0ZTogKGRlbHRhKSAtPlxuXG4gICAgQGRlbHRhID0gZGVsdGFcblxuICAgIGlmIEBjdXJyZW50U2NlbmU/XG4gICAgICBAZ2V0SGVscGVyKCdjYW52YXMnKS5jbGVhcigpXG4gICAgICBAY3VycmVudFNjZW5lLnVwZGF0ZSgpXG5cbiAgICAgIGZvciBiYWNrZ3JvdW5kU2NlbmUgaW4gQGJhY2tncm91bmRTY2VuZXNcbiAgICAgICAgYmFja2dyb3VuZFNjZW5lLnVwZGF0ZSgpIGlmIGJhY2tncm91bmRTY2VuZS5pZCAhPSBAY3VycmVudFNjZW5lLmlkXG5cbiAgICAgIEBnZXRIZWxwZXIoJ3JlbmRlcmVyJykucHJvY2VzcygpXG5cbiAgICByZXR1cm4gdGhpc1xuIiwiXG5jbGFzcyBFbnRpdHlcblxuICBjb25zdHJ1Y3RvcjogLT5cblxuICAgIEBhbmltYXRpb25Mb29wID0gQXBwLmdldEhlbHBlcignYW5pbWF0aW9uTG9vcCcpXG4gICAgQGNhbnZhcyAgICAgICAgPSBBcHAuZ2V0SGVscGVyKCdjYW52YXMnKVxuICAgIEBjb25maWcgICAgICAgID0gQXBwLmdldEhlbHBlcignY29uZmlnJylcbiAgICBAaW5wdXQgICAgICAgICA9IEFwcC5nZXRIZWxwZXIoJ2lucHV0JylcbiAgICBAZGV2aWNlICAgICAgICA9IEFwcC5nZXRIZWxwZXIoJ2RldmljZScpXG4gICAgQHJlbmRlcmVyICAgICAgPSBBcHAuZ2V0SGVscGVyKCdyZW5kZXJlcicpXG5cbiAgICBAY29udGV4dCA9IEBjYW52YXMuY29udGV4dFxuXG4gICAgQGlkICAgICAgICAgICAgICAgICA9IG51bGxcbiAgICBAcGFyZW50ICAgICAgICAgICAgID0gbnVsbFxuICAgIEByZW1vdmVPbkNhbnZhc0V4aXQgPSB0cnVlXG5cbiAgICBAaGVpZ2h0ID0gMFxuICAgIEB3aWR0aCAgPSAwXG5cbiAgICBAcG9zaXRpb24gPSB7XG4gICAgICB4OiAwXG4gICAgICB5OiAwXG4gICAgfVxuXG4gICAgQHZlbG9jaXR5ID0ge1xuICAgICAgeDogMFxuICAgICAgeTogMFxuICAgIH1cblxuICAgIHJldHVybiB0aGlzXG5cbiAgYWRkU2VsZlRvUmVuZGVyUXVldWU6IC0+XG5cbiAgICBAcmVuZGVyZXIuZW5xdWV1ZSh0aGlzKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBjYW52YXNFeGl0Q2FsbGJhY2s6IC0+XG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIGlzSW5zaWRlQ2FudmFzQm91bmRzOiAtPlxuXG4gICAgcmV0dXJuICFAaXNPdXRzaWRlQ2FudmFzQm91bmRzKClcblxuICBpc091dHNpZGVDYW52YXNCb3VuZHM6IC0+XG5cbiAgICBvdXRzaWRlTGVmdCAgPSBAcG9zaXRpb24ueCA8IC1Ad2lkdGhcbiAgICBvdXRzaWRlUmlnaHQgPSBAcG9zaXRpb24ueCAtIEB3aWR0aCA+IEBjYW52YXMuZWxlbWVudC5yZWFsV2lkdGhcbiAgICBvdXRzaWRlWCAgICAgPSBvdXRzaWRlTGVmdCB8fCBvdXRzaWRlUmlnaHRcblxuICAgIG91dHNpZGVUb3AgICAgPSBAcG9zaXRpb24ueSA8IC1AaGVpZ2h0XG4gICAgb3V0c2lkZUJvdHRvbSA9IEBwb3NpdGlvbi55IC0gQGhlaWdodCA+IEBjYW52YXMuZWxlbWVudC5yZWFsV2hlaWdodFxuICAgIG91dHNpZGVZICAgICAgPSBvdXRzaWRlVG9wIHx8IG91dHNpZGVCb3R0b21cblxuICAgIHJldHVybiBvdXRzaWRlWCB8fCBvdXRzaWRlWVxuXG4gIHJlbW92ZVNlbGZGcm9tUGFyZW50OiAtPlxuXG4gICAgQHBhcmVudC5yZW1vdmVFbnRpdHkoQGlkKSBpZiBAcGFyZW50P1xuXG4gICAgcmV0dXJuIHRoaXNcblxuICB1cGRhdGU6IC0+XG5cbiAgICBpZiBAaXNPdXRzaWRlQ2FudmFzQm91bmRzKClcbiAgICAgIEBjYW52YXNFeGl0Q2FsbGJhY2soKSAgIGlmIEBjYW52YXNFeGl0Q2FsbGJhY2s/XG4gICAgICBAcmVtb3ZlU2VsZkZyb21QYXJlbnQoKSBpZiBAcmVtb3ZlT25DYW52YXNFeGl0XG5cbiAgICByZXR1cm4gdGhpc1xuIiwiXG5jbGFzcyBTY2VuZVxuXG4gIGNvbnN0cnVjdG9yOiAtPlxuXG4gICAgQGVudGl0aWVzQ291bnQgICAgICAgICAgPSAwXG4gICAgQGVudGl0eUlkcyAgICAgICAgICAgICAgPSBbXVxuICAgIEBlbnRpdGllcyAgICAgICAgICAgICAgID0gW11cbiAgICBAZW50aXRpZXNQZW5kaW5nUmVtb3ZhbCA9IFtdXG4gICAgQHVwZGF0ZXNJbkJhY2tHcm91bmQgICAgPSBmYWxzZVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBhZGRFbnRpdHk6IChlbnRpdHksIHVuc2hpZnQgPSBmYWxzZSkgLT5cblxuICAgIGlmICF1bnNoaWZ0XG4gICAgICBAZW50aXR5SWRzLnB1c2goZW50aXR5LmlkKVxuICAgICAgQGVudGl0aWVzLnB1c2goZW50aXR5KVxuICAgIGVsc2VcbiAgICAgIEBlbnRpdHlJZHMudW5zaGlmdChlbnRpdHkuaWQpXG4gICAgICBAZW50aXRpZXMudW5zaGlmdChlbnRpdHkpXG5cbiAgICBAZW50aXRpZXNDb3VudCArPSAxXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIGxvYWQ6IC0+XG5cbiAgICBAY29uZmlnID0gQXBwLmdldEhlbHBlcignY29uZmlnJylcbiAgICBAZGV2aWNlID0gQXBwLmdldEhlbHBlcignZGV2aWNlJylcbiAgICBAaW5wdXQgID0gQXBwLmdldEhlbHBlcignaW5wdXQnKVxuICAgIEB1aSAgICAgPSBBcHAuZ2V0SGVscGVyKCd1aScpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHJlbW92ZUFsbEVudGl0aWVzOiAtPlxuXG4gICAgQGVudGl0aWVzQ291bnQgPSAwXG4gICAgQGVudGl0aWVzICAgICAgPSBbXVxuICAgIEBlbnRpdHlJZHMgICAgID0gW11cblxuICAgIHJldHVybiB0aGlzXG5cbiAgcmVtb3ZlRW50aXR5OiAoaWQpIC0+XG5cbiAgICBAZW50aXRpZXNQZW5kaW5nUmVtb3ZhbC5wdXNoKGlkKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICB1bmxvYWQ6IC0+XG5cbiAgICAjQHJlbW92ZUFsbEVudGl0aWVzKClcblxuICAgIHJldHVybiB0aGlzXG5cbiAgdXBkYXRlOiAtPlxuXG4gICAgaWYgQGVudGl0aWVzQ291bnQgPiAwXG4gICAgICBAdXBkYXRlRW50aXRpZXMoKVxuXG4gICAgICBAcHJvY2Vzc0VudGl0aWVzTWFya2VkRm9yUmVtb3ZhbCgpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHVwZGF0ZUVudGl0aWVzOiAtPlxuXG4gICAgZW50aXR5LnVwZGF0ZSgpIGZvciBlbnRpdHkgaW4gQGVudGl0aWVzXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHByb2Nlc3NFbnRpdGllc01hcmtlZEZvclJlbW92YWw6IC0+XG5cbiAgICBmb3IgaWQgaW4gQGVudGl0aWVzUGVuZGluZ1JlbW92YWxcbiAgICAgIGluZGV4ID0gQGVudGl0eUlkcy5pbmRleE9mKGlkKVxuXG4gICAgICBAZW50aXRpZXMuc3BsaWNlKGluZGV4LCAxKVxuICAgICAgQGVudGl0eUlkcy5zcGxpY2UoaW5kZXgsIDEpXG5cbiAgICAgIEBlbnRpdGllc0NvdW50IC09IDFcblxuICAgIEBlbnRpdGllc1BlbmRpbmdSZW1vdmFsID0gW11cblxuICAgIEBlbnRpdGllc0NvdW50ID0gMCBpZiBAZW50aXRpZXNDb3VudCA8IDBcbiIsIlxuY2xhc3MgR2FtZU92ZXJTY2VuZSBleHRlbmRzIFNjZW5lXG5cbiAgY29uc3RydWN0b3I6IC0+XG5cbiAgICBzdXBlclxuXG4gICAgQGlkICAgICAgICAgICAgICAgICAgPSAnZ2FtZS1vdmVyJ1xuICAgIEBwbGF5QWdhaW5FdmVudEJvdW5kID0gZmFsc2VcblxuICAgIHJldHVybiB0aGlzXG5cbiAgbG9hZDogLT5cblxuICAgIHN1cGVyXG5cbiAgICBAaW5wdXQuYWRkRXZlbnRMaXN0ZW5lciAnLnBsYXktYWdhaW4nLCAnY2xpY2snLCA9PlxuICAgICAgQHVpLnRyYW5zaXRpb25UbygncGxheWluZycpXG4gICAgICByZXR1cm5cblxuICAgIHJldHVybiB0aGlzXG4iLCJcbmNsYXNzIElkZW50U2NlbmUgZXh0ZW5kcyBTY2VuZVxuXG4gIGNvbnN0cnVjdG9yOiAtPlxuXG4gICAgc3VwZXJcblxuICAgIEBpZCA9ICdpZGVudCdcblxuICAgIHJldHVybiB0aGlzXG5cbiAgbG9hZDogLT5cblxuICAgIHN1cGVyXG5cbiAgICB3aW5kb3cuc2V0VGltZW91dCA9PlxuICAgICAgQHVpLnRyYW5zaXRpb25UbygndGl0bGUnKVxuICAgICwgMjUwMFxuXG4gICAgcmV0dXJuIHRoaXNcbiIsIlxuY2xhc3MgUGxheWluZ1NjZW5lIGV4dGVuZHMgU2NlbmVcblxuICBjb25zdHJ1Y3RvcjogLT5cblxuICAgIHN1cGVyXG5cbiAgICBAaWQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA9ICdwbGF5aW5nJ1xuICAgIEB1cGRhdGVzSW5CYWNrR3JvdW5kICAgICAgICAgICAgID0gdHJ1ZVxuICAgIEBsZXZlbFVwSW50ZXJ2YWwgICAgICAgICAgICAgICAgID0gNTAwMFxuICAgIEBtYXhMZXZlbCAgICAgICAgICAgICAgICAgICAgICAgID0gNTBcbiAgICBAbWF4RGlhbWV0ZXJBc1BlcmNlbnRhZ2VPZlNjcmVlbiA9IDE1XG4gICAgQG1heExpbmVXaWR0aCAgICAgICAgICAgICAgICAgICAgPSA1XG4gICAgQHBvaW50c1BlclBvcCAgICAgICAgICAgICAgICAgICAgPSAxMFxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBsb2FkOiAtPlxuXG4gICAgc3VwZXJcblxuICAgIEB1aS5yZWdpc3RlckVsZW1lbnQoJ2NvbWJvTXVsdGlwbGllckNvdW50ZXInLCAnLmh1ZC12YWx1ZS1jb21ibycpXG4gICAgQHVpLnJlZ2lzdGVyRWxlbWVudCgnbGV2ZWxDb3VudGVyJywgICAgICAgICAgICcuaHVkLXZhbHVlLWxldmVsJylcbiAgICBAdWkucmVnaXN0ZXJFbGVtZW50KCdzY29yZUNvdW50ZXInLCAgICAgICAgICAgJy5odWQtdmFsdWUtc2NvcmUnKVxuXG4gICAgQGNvbWJvTXVsdGlwbGllciA9IDBcbiAgICBAbGV2ZWwgICAgICAgICAgID0gMVxuICAgIEBzY29yZSAgICAgICAgICAgPSAwXG5cbiAgICBAc2V0dXBMZXZlbFVwSW5jcmVtZW50KClcblxuICAgIEBzZXRIZWFkc1VwVmFsdWVzKClcblxuICAgIEB0YXJnZXRCdWJibGVzQ291bnQgPSAwXG5cbiAgICBAcGxheWluZyA9IHRydWVcblxuICAgIEBzZXR1cERpZmZpY3VsdHlDb25maWcoKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBkZWNyZW1lbnRUYXJnZXRCdWJibGVzQ291bnQ6IC0+XG5cbiAgICBAdGFyZ2V0QnViYmxlc0NvdW50IC09IDFcblxuICAgIGlmIEB0YXJnZXRCdWJibGVzQ291bnQgPCAwXG4gICAgICBAdGFyZ2V0QnViYmxlc0NvdW50ID0gMFxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBnYW1lT3ZlcjogLT5cblxuICAgIEB1aS50cmFuc2l0aW9uVG8oJ2dhbWUtb3ZlcicpXG4gICAgQGlucHV0LnJlbW92ZUFsbEVudGl0aWVzKClcblxuICAgIHJldHVybiB0aGlzXG5cbiAgZ2VuZXJhdGVCdWJibGU6IC0+XG5cbiAgICBpZiBAcGxheWluZyAmJiByYW5kb21QZXJjZW50YWdlKCkgPCBAZGlmZmljdWx0eUNvbmZpZ1snYnViYmxlU3Bhd25DaGFuY2UnXS5jdXJyZW50XG4gICAgICBidWJibGVDb25maWcgPSBAbmV3QnViYmxlQ29uZmlnKClcbiAgICAgIGJ1YmJsZSAgICAgICA9IG5ldyBCdWJibGVFbnRpdHkodGhpcywgYnViYmxlQ29uZmlnKVxuXG4gICAgICBpZiBidWJibGUuaXNUYXJnZXRcbiAgICAgICAgQGFkZEVudGl0eShidWJibGUpXG4gICAgICAgIEBpbnB1dC5hZGRFbnRpdHkoYnViYmxlKVxuICAgICAgZWxzZVxuICAgICAgICBAYWRkRW50aXR5KGJ1YmJsZSwgdHJ1ZSlcblxuICAgICAgQHRhcmdldEJ1YmJsZXNDb3VudCArPSAxIGlmIGJ1YmJsZS5pc1RhcmdldFxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBuZXdCdWJibGVDb25maWc6IC0+XG5cbiAgICByZXR1cm4ge1xuICAgICAgYnViYmxlR3Jvd3RoTXVsdGlwbGllcjogICBAZGlmZmljdWx0eUNvbmZpZ1snYnViYmxlR3Jvd3RoTXVsdGlwbGllciddLmN1cnJlbnRcbiAgICAgIGNoYW5jZUJ1YmJsZUlzVGFyZ2V0OiAgICAgQGRpZmZpY3VsdHlDb25maWdbJ2NoYW5jZUJ1YmJsZUlzVGFyZ2V0J10uY3VycmVudFxuICAgICAgZGlhbWV0ZXJNYXg6ICAgICAgICAgICAgICBAZGlmZmljdWx0eUNvbmZpZ1snZGlhbWV0ZXJNYXgnXS5jdXJyZW50XG4gICAgICBtYXhUYXJnZXRzQXRPbmNlOiAgICAgICAgIEBkaWZmaWN1bHR5Q29uZmlnWydtYXhUYXJnZXRzQXRPbmNlJ10uY3VycmVudFxuICAgICAgbWluVGFyZ2V0RGlhbWV0ZXI6ICAgICAgICBAZGlmZmljdWx0eUNvbmZpZ1snbWluVGFyZ2V0RGlhbWV0ZXInXS5jdXJyZW50XG4gICAgICB0YXJnZXRWZWxvY2l0eU11bHRpcGxpZXI6IEBkaWZmaWN1bHR5Q29uZmlnWyd0YXJnZXRWZWxvY2l0eU11bHRpcGxpZXInXS5jdXJyZW50XG4gICAgICB2ZWxvY2l0eU1heDogICAgICAgICAgICAgIEBkaWZmaWN1bHR5Q29uZmlnWyd2ZWxvY2l0eU1heCddLmN1cnJlbnRcbiAgICAgIHZlbG9jaXR5TWluOiAgICAgICAgICAgICAgQGRpZmZpY3VsdHlDb25maWdbJ3ZlbG9jaXR5TWluJ10uY3VycmVudFxuICAgICAgbWF4TGluZVdpZHRoOiAgICAgICAgICAgICBAbWF4TGluZVdpZHRoXG4gICAgICBwbGF5aW5nOiAgICAgICAgICAgICAgICAgIEBwbGF5aW5nXG4gICAgICB0YXJnZXRCdWJibGVzQ291bnQ6ICAgICAgIEB0YXJnZXRCdWJibGVzQ291bnRcbiAgICB9XG5cbiAgc2V0dXBEaWZmaWN1bHR5Q29uZmlnOiAtPlxuXG4gICAgbWF4RGlhbWV0ZXIgPSAoQGRldmljZS5zY3JlZW4ud2lkdGggLyAxMDApICogQG1heERpYW1ldGVyQXNQZXJjZW50YWdlT2ZTY3JlZW5cblxuICAgIEBkaWZmaWN1bHR5Q29uZmlnID1cbiAgICAgIGJ1YmJsZUdyb3d0aE11bHRpcGxpZXI6ICAgeyBjdXJyZW50OiAwLCBlYXN5OiAxLjA1LCAgICAgICAgICAgICAgZGlmZmljdWx0OiAxLjEwICAgICAgICAgICAgICB9XG4gICAgICBidWJibGVTcGF3bkNoYW5jZTogICAgICAgIHsgY3VycmVudDogMCwgZWFzeTogNjAsICAgICAgICAgICAgICAgIGRpZmZpY3VsdDogMTAwICAgICAgICAgICAgICAgfVxuICAgICAgY2hhbmNlQnViYmxlSXNUYXJnZXQ6ICAgICB7IGN1cnJlbnQ6IDAsIGVhc3k6IDUwLCAgICAgICAgICAgICAgICBkaWZmaWN1bHQ6IDkwICAgICAgICAgICAgICAgIH1cbiAgICAgIGRpYW1ldGVyTWF4OiAgICAgICAgICAgICAgeyBjdXJyZW50OiAwLCBlYXN5OiBtYXhEaWFtZXRlciwgICAgICAgZGlmZmljdWx0OiBtYXhEaWFtZXRlciAqIDAuNiB9XG4gICAgICBtYXhUYXJnZXRzQXRPbmNlOiAgICAgICAgIHsgY3VycmVudDogMCwgZWFzeTogMywgICAgICAgICAgICAgICAgIGRpZmZpY3VsdDogNiAgICAgICAgICAgICAgICAgfVxuICAgICAgbWluVGFyZ2V0RGlhbWV0ZXI6ICAgICAgICB7IGN1cnJlbnQ6IDAsIGVhc3k6IG1heERpYW1ldGVyICogMC43LCBkaWZmaWN1bHQ6IG1heERpYW1ldGVyICogMC40IH1cbiAgICAgIHRhcmdldFZlbG9jaXR5TXVsdGlwbGllcjogeyBjdXJyZW50OiAwLCBlYXN5OiAwLjMsICAgICAgICAgICAgICAgZGlmZmljdWx0OiAwLjUgICAgICAgICAgICAgICB9XG4gICAgICB2ZWxvY2l0eU1heDogICAgICAgICAgICAgIHsgY3VycmVudDogMCwgZWFzeTogNCwgICAgICAgICAgICAgICAgIGRpZmZpY3VsdDogNyAgICAgICAgICAgICAgICAgfVxuICAgICAgdmVsb2NpdHlNaW46ICAgICAgICAgICAgICB7IGN1cnJlbnQ6IDAsIGVhc3k6IC00LCAgICAgICAgICAgICAgICBkaWZmaWN1bHQ6IC03ICAgICAgICAgICAgICAgIH1cblxuICAgIEB1cGRhdGVWYWx1ZXNGb3JEaWZmaWN1bHR5KClcblxuICAgIHJldHVybiB0aGlzXG5cbiAgc2V0SGVhZHNVcFZhbHVlczogLT5cblxuICAgIHVwZGF0ZVVJVGV4dE5vZGUoQHVpLmVsZW1lbnQoJ2NvbWJvTXVsdGlwbGllckNvdW50ZXInKSwgQGNvbWJvTXVsdGlwbGllcilcbiAgICB1cGRhdGVVSVRleHROb2RlKEB1aS5lbGVtZW50KCdsZXZlbENvdW50ZXInKSwgICAgICAgICAgIEBsZXZlbClcbiAgICB1cGRhdGVVSVRleHROb2RlKEB1aS5lbGVtZW50KCdzY29yZUNvdW50ZXInKSwgICAgICAgICAgIGZvcm1hdFdpdGhDb21tYShAc2NvcmUpKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICBzZXR1cExldmVsVXBJbmNyZW1lbnQ6IC0+XG5cbiAgICBAbGV2ZWxVcENvdW50ZXIgPSB3aW5kb3cuc2V0SW50ZXJ2YWwgPT5cbiAgICAgIEB1cGRhdGVMZXZlbCgpXG4gICAgICByZXR1cm5cbiAgICAsIEBsZXZlbFVwSW50ZXJ2YWxcblxuICAgIHJldHVybiB0aGlzXG5cbiAgc3RvcExldmVsVXBJbmNyZW1lbnQ6IC0+XG5cbiAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbChAbGV2ZWxVcENvdW50ZXIpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHVubG9hZDogLT5cblxuICAgIGlmIEBwbGF5aW5nID09IHRydWVcbiAgICAgIGZvciBidWJibGUgaW4gQGVudGl0aWVzXG4gICAgICAgIGJ1YmJsZS5kZXN0cm95aW5nID0gdHJ1ZVxuXG4gICAgICBAcGxheWluZyA9IGZhbHNlXG5cbiAgICAgIEBzdG9wTGV2ZWxVcEluY3JlbWVudCgpXG5cbiAgdXBkYXRlOiAtPlxuXG4gICAgc3VwZXJcblxuICAgIEBnZW5lcmF0ZUJ1YmJsZSgpXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIHVwZGF0ZUNvbWJvTXVsdGlwbGllcjogKHRhcmdldEhpdCkgLT5cblxuICAgIGlmIHRhcmdldEhpdFxuICAgICAgQGNvbWJvTXVsdGlwbGllciArPSAxXG4gICAgZWxzZVxuICAgICAgQGNvbWJvTXVsdGlwbGllciA9IDBcblxuICAgIEBzZXRIZWFkc1VwVmFsdWVzKClcblxuICAgIHJldHVybiB0aGlzXG5cbiAgdXBkYXRlTGV2ZWw6IC0+XG5cbiAgICBAbGV2ZWwgKz0gMVxuXG4gICAgaWYgQGxldmVsID49IEBtYXhMZXZlbFxuICAgICAgd2luZG93LmNsZWFySW50ZXJ2YWwoQGxldmVsVXBDb3VudGVyKVxuXG4gICAgQHNldEhlYWRzVXBWYWx1ZXMoKVxuXG4gICAgQHVwZGF0ZVZhbHVlc0ZvckRpZmZpY3VsdHkoKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICB1cGRhdGVTY29yZTogKHNpemVXaGVuVGFwcGVkLCBzaXplV2hlbkZ1bGx5R3Jvd24pIC0+XG5cbiAgICAjKChkZWZhdWx0U2NvcmVQZXJQb3AgKyAoMTAwIC0gKChzaXplV2hlblRhcHBlZCAvIHNpemVXaGVuRnVsbHlHcm93bikgKiAxMDApKSkgKiBjb21ib011bHRpcGxpZXIpICogKGxldmVsTnVtYmVyICsgMSlcblxuICAgIHRhcmdldFNpemVCb251cyA9IE1hdGgucm91bmQoMTAwIC0gKChzaXplV2hlblRhcHBlZCAvIHNpemVXaGVuRnVsbHlHcm93bikgKiAxMDApKVxuICAgIHBvcFBvaW50VmFsdWUgICA9IEBwb2ludHNQZXJQb3AgKyB0YXJnZXRTaXplQm9udXNcbiAgICBsZXZlbE11bHRpcGxpZXIgPSBAbGV2ZWwgKyAxXG5cbiAgICBAc2NvcmUgKz0gKHBvcFBvaW50VmFsdWUgKiBAY29tYm9NdWx0aXBsaWVyKSAqIGxldmVsTXVsdGlwbGllclxuXG4gICAgQHNldEhlYWRzVXBWYWx1ZXMoKVxuXG4gICAgcmV0dXJuIHRoaXNcblxuICB1cGRhdGVWYWx1ZXNGb3JEaWZmaWN1bHR5OiAtPlxuXG4gICAgbGV2ZWxNdWxpdHBsaWVyID0gQGxldmVsIC8gQG1heExldmVsXG5cbiAgICBmb3IgcHJvcGVydHlOYW1lLCBwcm9wZXJ0eVZhbHVlcyBvZiBAZGlmZmljdWx0eUNvbmZpZ1xuICAgICAgdmFsdWVEaWZmZXJlbmNlID0gcHJvcGVydHlWYWx1ZXMuZGlmZmljdWx0IC0gcHJvcGVydHlWYWx1ZXMuZWFzeVxuICAgICAgYWRqdXN0ZWRWYWx1ZSAgID0gKHZhbHVlRGlmZmVyZW5jZSAqIGxldmVsTXVsaXRwbGllcikgKyBwcm9wZXJ0eVZhbHVlcy5lYXN5XG5cbiAgICAgIEBkaWZmaWN1bHR5Q29uZmlnW3Byb3BlcnR5TmFtZV0uY3VycmVudCA9IGFkanVzdGVkVmFsdWVcblxuICAgIHJldHVybiB0aGlzXG4iLCJcbmNsYXNzIFRpdGxlU2NlbmUgZXh0ZW5kcyBTY2VuZVxuXG4gIGNvbnN0cnVjdG9yOiAtPlxuXG4gICAgc3VwZXJcblxuICAgIEBpZCA9ICd0aXRsZSdcblxuICAgIHJldHVybiB0aGlzXG5cbiAgbG9hZDogLT5cblxuICAgIHN1cGVyXG5cbiAgICBAaW5wdXQuYWRkRXZlbnRMaXN0ZW5lciAnLmdhbWUtbG9nbycsICdjbGljaycsID0+XG4gICAgICBAdWkudHJhbnNpdGlvblRvKCdwbGF5aW5nJylcbiAgICAgIHJldHVyblxuXG4gICAgcmV0dXJuIHRoaXNcblxuICB1bmxvYWQ6IC0+XG5cbiAgICBzdXBlclxuXG4gICAgcmV0dXJuIHRoaXNcbiIsIlxuY2xhc3MgQnViYmxlRW50aXR5IGV4dGVuZHMgRW50aXR5XG5cbiAgY29uc3RydWN0b3I6IChwYXJlbnQsIGNvbmZpZ1ZhbHVlcykgLT5cblxuICAgIHN1cGVyXG5cbiAgICBAcGFyZW50ICAgICAgID0gcGFyZW50XG4gICAgQGNvbmZpZ1ZhbHVlcyA9IGNvbmZpZ1ZhbHVlc1xuXG4gICAgQGhlaWdodCAgID0gMFxuICAgIEBpZCAgICAgICA9IFwiYnViYmxlX1wiICsgTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyKDIsIDUpXG4gICAgQHBvc2l0aW9uID1cbiAgICAgIHg6IEBkZXZpY2Uuc2NyZWVuLndpZHRoICAvIDJcbiAgICAgIHk6IEBkZXZpY2Uuc2NyZWVuLmhlaWdodCAvIDJcbiAgICBAdmVsb2NpdHkgPVxuICAgICAgeDogcmFuZG9tKEBjb25maWdWYWx1ZXMudmVsb2NpdHlNaW4sIEBjb25maWdWYWx1ZXMudmVsb2NpdHlNYXgpXG4gICAgICB5OiByYW5kb20oQGNvbmZpZ1ZhbHVlcy52ZWxvY2l0eU1pbiwgQGNvbmZpZ1ZhbHVlcy52ZWxvY2l0eU1heClcbiAgICBAd2lkdGggICAgPSAwXG5cbiAgICBAYWxwaGEgICAgICAgICAgICA9IDAuNzVcbiAgICBAY29sb3IgICAgICAgICAgICA9IHJhbmRvbUNvbG9yKClcbiAgICBAZGVzdHJveWluZyAgICAgICA9IGZhbHNlXG4gICAgQGRpYW1ldGVyICAgICAgICAgPSAxXG4gICAgQGZpbGxDb2xvciAgICAgICAgPSBAY29sb3JcbiAgICBAc3Ryb2tlQ29sb3IgICAgICA9IEBjb2xvclxuICAgIEBmaW5hbERpYW1ldGVyICAgID0gcmFuZG9tSW50ZWdlcigwLCBjb25maWdWYWx1ZXMuZGlhbWV0ZXJNYXgpXG4gICAgQGlzVGFyZ2V0ICAgICAgICAgPSBAZGV0ZXJtaW5lVGFyZ2V0QnViYmxlKClcbiAgICBAcmFkaXVzICAgICAgICAgICA9IDAuNVxuICAgIEBzaHJpbmtNdWx0aXBsaWVyID0gMC45XG5cbiAgICBpZiBAaXNUYXJnZXRcbiAgICAgIEBhbHBoYSAgICAgICAgID0gMC45XG4gICAgICBAZmlsbENvbG9yICAgICA9IFwiMjQwLCAyNDAsIDI0MFwiXG4gICAgICBAZmluYWxEaWFtZXRlciA9IHJhbmRvbUludGVnZXIoQGNvbmZpZ1ZhbHVlcy5taW5UYXJnZXREaWFtZXRlciwgQGNvbmZpZ1ZhbHVlcy5kaWFtZXRlck1heClcbiAgICAgIEBsaW5lV2lkdGggICAgID0gQGRpYW1ldGVyIC8gMTBcblxuICAgICAgQHZlbG9jaXR5LnggKj0gQGNvbmZpZ1ZhbHVlcy50YXJnZXRWZWxvY2l0eU11bHRpcGxpZXJcbiAgICAgIEB2ZWxvY2l0eS55ICo9IEBjb25maWdWYWx1ZXMudGFyZ2V0VmVsb2NpdHlNdWx0aXBsaWVyXG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIGNhbnZhc0V4aXRDYWxsYmFjazogLT5cblxuICAgIHN1cGVyXG5cbiAgICBAcGFyZW50LmdhbWVPdmVyKCkgaWYgQGlzVGFyZ2V0XG5cbiAgICByZXR1cm4gdGhpc1xuXG4gIGRldGVybWluZVRhcmdldEJ1YmJsZTogLT5cblxuICAgIGlmIEBjb25maWdWYWx1ZXMudGFyZ2V0QnViYmxlc0NvdW50IDwgQGNvbmZpZ1ZhbHVlcy5tYXhUYXJnZXRzQXRPbmNlXG4gICAgICByZXR1cm4gcmFuZG9tUGVyY2VudGFnZSgpIDwgQGNvbmZpZ1ZhbHVlcy5jaGFuY2VCdWJibGVJc1RhcmdldFxuXG4gICAgcmV0dXJuIGZhbHNlXG5cbiAgcmVuZGVyOiAtPlxuXG4gICAgQGNvbnRleHQubGluZVdpZHRoICAgPSBAbGluZVdpZHRoXG4gICAgQGNvbnRleHQuZmlsbFN0eWxlICAgPSByZ2JhKEBmaWxsQ29sb3IsICAgQGFscGhhKVxuICAgIEBjb250ZXh0LnN0cm9rZVN0eWxlID0gcmdiYShAc3Ryb2tlQ29sb3IsIEBhbHBoYSlcblxuICAgIEBjb250ZXh0LmJlZ2luUGF0aCgpXG4gICAgQGNvbnRleHQuYXJjKEBwb3NpdGlvbi54LCBAcG9zaXRpb24ueSwgQHJhZGl1cywgMCwgTWF0aC5QSSAqIDIsIHRydWUpXG4gICAgQGNvbnRleHQuZmlsbCgpXG4gICAgQGNvbnRleHQuc3Ryb2tlKCkgaWYgQGlzVGFyZ2V0XG4gICAgQGNvbnRleHQuY2xvc2VQYXRoKClcblxuICAgIHJldHVybiB0aGlzXG5cbiAgdXBkYXRlOiAtPlxuXG4gICAgc3VwZXJcblxuICAgIGlmIEBkZXN0cm95aW5nXG4gICAgICBAZGlhbWV0ZXIgKj0gKGlmIEBwYXJlbnQucGxheWluZyB0aGVuIDAuNiBlbHNlIEBzaHJpbmtNdWx0aXBsaWVyKVxuXG4gICAgICBAcmVtb3ZlU2VsZkZyb21QYXJlbnQoKSBpZiBAZGlhbWV0ZXIgPCAxXG4gICAgZWxzZVxuICAgICAgQGRpYW1ldGVyICo9IEBjb25maWdWYWx1ZXMuYnViYmxlR3Jvd3RoTXVsdGlwbGllciBpZiBAZGlhbWV0ZXIgPCBAZmluYWxEaWFtZXRlclxuXG4gICAgQGRpYW1ldGVyICA9IGNsYW1wKEBkaWFtZXRlciwgMCwgQGZpbmFsRGlhbWV0ZXIpXG4gICAgQGxpbmVXaWR0aCA9IGNsYW1wKEBkaWFtZXRlciAvIDEwLCAwLCBAY29uZmlnVmFsdWVzLm1heExpbmVXaWR0aCkgaWYgQGlzVGFyZ2V0XG5cbiAgICBAaGVpZ2h0ID0gQGRpYW1ldGVyXG4gICAgQHdpZHRoICA9IEBkaWFtZXRlclxuICAgIEByYWRpdXMgPSBAZGlhbWV0ZXIgLyAyXG5cbiAgICBAcG9zaXRpb24ueCArPSBAYW5pbWF0aW9uTG9vcC5jb3JyZWN0VmFsdWUoQHZlbG9jaXR5LngpXG4gICAgQHBvc2l0aW9uLnkgKz0gQGFuaW1hdGlvbkxvb3AuY29ycmVjdFZhbHVlKEB2ZWxvY2l0eS55KVxuXG4gICAgQGFkZFNlbGZUb1JlbmRlclF1ZXVlKClcblxuICAgIHJldHVybiB0aGlzXG5cbiAgd2FzVGFwcGVkOiAoKSAtPlxuXG4gICAgdG91Y2hEYXRhID0gQGlucHV0LnRvdWNoRGF0YVxuXG4gICAgdGFwWCAgICAgID0gdG91Y2hEYXRhLnhcbiAgICB0YXBZICAgICAgPSB0b3VjaERhdGEueVxuICAgIGRpc3RhbmNlWCA9IHRhcFggLSBAcG9zaXRpb24ueFxuICAgIGRpc3RhbmNlWSA9IHRhcFkgLSBAcG9zaXRpb24ueVxuICAgIHRhcHBlZCAgICA9IChkaXN0YW5jZVggKiBkaXN0YW5jZVgpICsgKGRpc3RhbmNlWSAqIGRpc3RhbmNlWSkgPCAoQHJhZGl1cyAqIEByYWRpdXMpXG5cbiAgICBpZiB0YXBwZWRcbiAgICAgIG1lc3NhZ2UgPSBcIkJ1YmJsZSMje0BpZH0gdGFwcGVkIGF0ICN7dGFwWH0sICN7dGFwWX1cIlxuICAgIGVsc2VcbiAgICAgIG1lc3NhZ2UgPSBcIkNvbWJvIEJyb2tlbiFcIlxuXG4gICAgZGVidWdDb25zb2xlKG1lc3NhZ2UpXG5cbiAgICByZXR1cm4gdGFwcGVkXG5cbiAgdGFwSGFuZGxlcjogKHRhcmdldEhpdCkgLT5cblxuICAgIEBwYXJlbnQudXBkYXRlQ29tYm9NdWx0aXBsaWVyKHRhcmdldEhpdClcblxuICAgIGlmIHRhcmdldEhpdFxuICAgICAgQHBhcmVudC51cGRhdGVTY29yZShAZGlhbWV0ZXIsIEBmaW5hbERpYW1ldGVyKVxuICAgICAgQGRlc3Ryb3lpbmcgPSB0cnVlXG4gICAgICBAcGFyZW50LmRlY3JlbWVudFRhcmdldEJ1YmJsZXNDb3VudCgpXG4gICAgICBAaW5wdXQucXVldWVFbnRpdHlGb3JSZW1vdmFsKEBpZClcblxuICAgIHJldHVybiB0aGlzXG4iLCJcbiMgTG9hZCB0aGUgbWFpbiBhcHAgd3JhcHBlclxuQXBwID0gbmV3IEFwcGxpY2F0aW9uKClcblxuIyBHZXQgdXAgZ2V0IG9uIGdldCB1cCBnZXQgb24gdXAgc3RheSBvbiB0aGUgc2NlbmUgZXRjIGV0Y1xuQXBwLmxvYWQoKVxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9