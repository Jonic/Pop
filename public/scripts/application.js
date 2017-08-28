'use strict';

/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
var $ = function $(selector) {
  var elements = document.querySelectorAll(selector);

  if (elements.length === 1) {
    return elements[0];
  }
  return elements;
};

var callNativeApp = function callNativeApp(message) {
  try {
    return webkit.messageHandlers.callbackHandler.postMessage(message);
  } catch (err) {
    return console.log('The native context does not exist yet');
  }
};

var clamp = function clamp(value, min, max) {
  if (value < min) {
    value = min;
  } else if (value > max) {
    value = max;
  }

  return value;
};

var correctValueForDPR = function correctValueForDPR(value, integer) {
  if (integer == null) {
    integer = false;
  }
  value *= devicePixelRatio;

  if (integer) {
    value = Math.round(value);
  }

  return value;
};

var debugConsole = function debugConsole(message) {
  var element = $('.debugConsole');

  updateUITextNode(element, message);
  console.log(message);
  callNativeApp(message);
};

var formatWithComma = function formatWithComma(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

var fps = function fps(value) {
  return updateUITextNode($('.fps'), value);
};

var random = function random(min, max) {
  if (min === undefined) {
    min = 0;
    max = 1;
  } else if (max === undefined) {
    max = min;
    min = 0;
  }

  return Math.random() * (max - min) + min;
};

var randomColor = function randomColor() {
  var r = randomInteger(0, 200);
  var g = randomInteger(0, 200);
  var b = randomInteger(0, 200);

  return r + ', ' + g + ', ' + b;
};

var randomInteger = function randomInteger(min, max) {
  if (max === undefined) {
    max = min;
    min = 0;
  }

  return Math.floor(Math.random() * (max + 1 - min)) + min;
};

var randomPercentage = function randomPercentage() {
  return Math.floor(Math.random() * 100);
};

var rgba = function rgba(color, alpha) {
  if (alpha == null) {
    alpha = false;
  }
  if (!alpha) {
    alpha = 1;
  }

  return 'rgba(' + color + ', ' + alpha + ')';
};

var updateUITextNode = function updateUITextNode(element, value) {
  element.innerHTML = value;

  return this;
};
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
var AnimationLoopHelper = function () {
  function AnimationLoopHelper() {
    _classCallCheck(this, AnimationLoopHelper);
  }

  _createClass(AnimationLoopHelper, [{
    key: "load",
    value: function load() {
      this.animationLoopId = null;
      this.delta = 0;
      this.fps = 0;
      this.lastTime = 0;

      return this;
    }
  }, {
    key: "correctValue",
    value: function correctValue(value) {
      return value * this.delta * (60 / 1000);
    }
  }, {
    key: "frame",
    value: function frame(now) {
      var _this = this;

      this.delta = now - this.lastTime;
      this.fps = Math.round(1000 / this.delta);
      this.lastTime = now;

      fps(this.fps);

      App.update(this.delta);

      return this.animationLoopId = window.requestAnimationFrame(function (now) {
        _this.frame(now);
        return;

        return _this;
      });
    }
  }, {
    key: "start",
    value: function start() {
      this.frame();

      return this;
    }
  }, {
    key: "stop",
    value: function stop() {
      window.cancelAnimationFrame(this.animationLoopId);

      return this;
    }
  }]);

  return AnimationLoopHelper;
}();
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var CanvasHelper = function () {
  function CanvasHelper() {
    _classCallCheck(this, CanvasHelper);
  }

  _createClass(CanvasHelper, [{
    key: 'load',
    value: function load() {
      this.device = App.getHelper('device');
      this.input = App.getHelper('input');

      this.elementSelector = '.canvas';

      this.createCanvas();

      return this;
    }
  }, {
    key: 'clear',
    value: function clear() {
      // @element.width = @element.width
      this.context.clearRect(0, 0, this.element.width, this.element.height);

      return this;
    }
  }, {
    key: 'createCanvas',
    value: function createCanvas() {
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
    }
  }, {
    key: 'scaleCanvas',
    value: function scaleCanvas() {
      var backingStoreRatio = this.context.webkitBackingStorePixelRatio || this.context.backingStorePixelRatio || 1;

      if (this.device.pixelRatio !== backingStoreRatio) {
        var ratio = this.device.pixelRatio / backingStoreRatio;
        var oldWidth = this.element.width;
        var oldHeight = this.element.height;

        this.element.width = oldWidth * ratio;
        this.element.height = oldHeight * ratio;

        this.element.style.width = oldWidth + 'px';
        this.element.style.height = oldHeight + 'px';

        this.context.scale(ratio, ratio);
      }

      return this;
    }
  }]);

  return CanvasHelper;
}();
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*
 * decaffeinate suggestions:
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
var ConfigHelper = function () {
  function ConfigHelper() {
    _classCallCheck(this, ConfigHelper);
  }

  _createClass(ConfigHelper, [{
    key: 'load',
    value: function load() {
      this.values = {};

      return this;
    }
  }, {
    key: 'console',
    value: function console(path) {
      debugConsole(this.get(path));

      return this;
    }
  }, {
    key: 'dump',
    value: function dump(path) {
      var dumping = this.values;

      if (path) {
        dumping = 'Config.' + path + ': ' + this.get(path);
      }

      console.log(dumping);

      return this;
    }
  }, {
    key: 'get',
    value: function get(path) {
      var value = void 0;
      path = path.split('.');
      var array = this.values;

      for (var index = 0; index < path.length; index++) {
        var key = path[index];
        var nextKey = path[index + 1];

        if (nextKey != null) {
          array = array[key];
        } else {
          value = array[key];
        }
      }

      if (value != null) {
        return value;
      }
    }
  }, {
    key: 'set',
    value: function set(path, value) {
      path = path.split('.');
      var array = this.values;

      for (var index = 0; index < path.length; index++) {
        var key = path[index];
        var nextKey = path[index + 1];

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
    }
  }]);

  return ConfigHelper;
}();
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DeviceHelper = function () {
  function DeviceHelper() {
    _classCallCheck(this, DeviceHelper);
  }

  _createClass(DeviceHelper, [{
    key: 'load',
    value: function load() {
      this.screen = {
        height: document.body.clientHeight,
        width: document.body.clientWidth
      };

      this.android = Boolean(navigator.userAgent.match(/android/i));
      this.ios = !this.android;
      this.hasTouchEvents = window.hasOwnProperty('ontouchstart') || window.hasOwnProperty('onmsgesturechange');
      this.pixelRatio = window.devicePixelRatio || 1;

      return this;
    }
  }]);

  return DeviceHelper;
}();
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
var InputHelper = function () {
  function InputHelper() {
    _classCallCheck(this, InputHelper);

    this.device = new DeviceHelper();

    this.cancelTouchMoveEvents();

    // @setupConsole()

    return this;
  }

  _createClass(InputHelper, [{
    key: 'load',
    value: function load() {
      this.entityIds = [];
      this.entitiesToTest = [];
      this.entitiesPendingRemoval = [];

      return this;
    }
  }, {
    key: 'addCanvasTapEventListener',
    value: function addCanvasTapEventListener(canvasSelector) {
      var _this = this;

      this.addEventListener(canvasSelector, 'click', function () {
        _this.testEntitiesForEvents();
      });

      return this;
    }
  }, {
    key: 'addEntity',
    value: function addEntity(entity) {
      this.entityIds.push(entity.id);
      this.entitiesToTest.push(entity);

      return this;
    }
  }, {
    key: 'addEventListener',
    value: function addEventListener(selector, type, callback, consoleOutput) {
      if (selector == null) {
        selector = 'body';
      }
      if (consoleOutput == null) {
        consoleOutput = false;
      }
      type = this.convertClickToTouch(type);

      if (consoleOutput) {
        debugConsole('Input.addEventListener(' + selector + ', ' + type + ', ' + callback + ')');
      }

      $(selector).addEventListener(type, callback, false);

      return this;
    }
  }, {
    key: 'cancelTouchMoveEvents',
    value: function cancelTouchMoveEvents() {
      window.addEventListener('touchmove', function (event) {
        event.preventDefault();
      });

      return this;
    }
  }, {
    key: 'convertClickToTouch',
    value: function convertClickToTouch(type) {
      if (type === 'click' && this.device.hasTouchEvents) {
        return 'touchstart';
      }
      return type;
    }
  }, {
    key: 'getTouchData',
    value: function getTouchData(event) {
      var touchData = void 0;
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
    }
  }, {
    key: 'removeEventListener',
    value: function removeEventListener(selector, type, callback) {
      if (selector == null) {
        selector = 'body';
      }
      type = this.convertClickToTouch(type);

      debugConsole('Input.removeEventListener(' + selector + ', ' + type + ', ' + callback + ')');

      $(selector).removeEventListener(type, callback, false);

      return this;
    }
  }, {
    key: 'setupConsole',
    value: function setupConsole() {
      this.addEventListener('body', 'click', function (event) {
        var type = event.type;

        var node = event.target.nodeName.toLowerCase();
        var id = event.target.id || 'n/a';
        var classList = event.target.classList || 'n/a';

        debugConsole(type + ' on ' + node + ' - id: ' + id + ' - class: ' + classList);
      });

      return this;
    }
  }, {
    key: 'queueEntityForRemoval',
    value: function queueEntityForRemoval(id) {
      this.entitiesPendingRemoval.push(id);

      return this;
    }
  }, {
    key: 'removeAllEntities',
    value: function removeAllEntities() {
      this.entitiesToTest = [];

      return this;
    }
  }, {
    key: 'removeQueuedEntities',
    value: function removeQueuedEntities() {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = Array.from(this.entitiesPendingRemoval)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var id = _step.value;

          this.removeEntity(id);
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      this.entitiesPendingRemoval = [];

      return this;
    }
  }, {
    key: 'removeEntity',
    value: function removeEntity(id) {
      var index = this.entityIds.indexOf(id);

      if (index !== -1) {
        this.entityIds.splice(index, 1);
        this.entitiesToTest.splice(index, 1);
      }

      return this;
    }
  }, {
    key: 'testEntitiesForEvents',
    value: function testEntitiesForEvents() {
      this.touchData = this.getTouchData(event);

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = Array.from(this.entitiesToTest)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var entity = _step2.value;

          var tapped = entity.wasTapped();

          entity.tapHandler(tapped);
        }

        // break if tapped
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      this.removeQueuedEntities();

      return this;
    }
  }]);

  return InputHelper;
}();
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
var RendererHelper = function () {
  function RendererHelper() {
    _classCallCheck(this, RendererHelper);
  }

  _createClass(RendererHelper, [{
    key: "load",
    value: function load() {
      this.renderStack = [];

      return this;
    }
  }, {
    key: "enqueue",
    value: function enqueue(entity) {
      this.renderStack.push(entity);

      return this;
    }
  }, {
    key: "process",
    value: function process() {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = Array.from(this.renderStack)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var entity = _step.value;

          if (entity.isInsideCanvasBounds()) {
            entity.render();
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      this.reset();

      return this;
    }
  }, {
    key: "reset",
    value: function reset() {
      this.renderStack = [];

      return this;
    }
  }]);

  return RendererHelper;
}();
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*
 * decaffeinate suggestions:
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
var UserInterfaceHelper = function () {
  function UserInterfaceHelper() {
    _classCallCheck(this, UserInterfaceHelper);
  }

  _createClass(UserInterfaceHelper, [{
    key: 'load',
    value: function load() {
      this.elements = {};

      return this;
    }
  }, {
    key: 'element',
    value: function element(name) {
      return this.elements[name];
    }
  }, {
    key: 'removeAllElements',
    value: function removeAllElements(sceneName) {
      this.elements = {};

      return this;
    }
  }, {
    key: 'registerElement',
    value: function registerElement(name, selector) {
      this.elements[name] = $(selector);

      return this;
    }
  }, {
    key: 'removeElement',
    value: function removeElement(name) {
      if (this.elements[name] != null) {
        delete this.elements[name];
      }

      return this;
    }
  }, {
    key: 'transitionTo',
    value: function transitionTo(targetSceneID, instant) {
      if (instant == null) {
        instant = false;
      }
      var targetScene = App.scenes[targetSceneID];

      if (App.currentScene != null) {
        App.currentScene.unload();
      }
      // @updateBodyClass("scene-#{targetSceneID}-out")

      targetScene.load();

      this.updateBodyClass('scene-' + targetSceneID);

      App.currentScene = targetScene;

      return this;
    }
  }, {
    key: 'updateBodyClass',
    value: function updateBodyClass(className) {
      document.body.className = '';
      document.body.classList.add(className);

      return this;
    }
  }]);

  return UserInterfaceHelper;
}();
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
var Application = function () {
  function Application() {
    _classCallCheck(this, Application);

    this.currentScene = null;
    this.delta = 0;
    this.helpers = {};
    this.scenes = {};
    this.backgroundScenes = [];

    this.initHelpers();
    this.initScenes();

    return this;
  }

  _createClass(Application, [{
    key: 'load',
    value: function load() {
      callNativeApp('PopRush Loaded! Aww Yeah!');

      this.getHelper('animationLoop').start();
      this.getHelper('ui').transitionTo('ident');

      return this;
    }
  }, {
    key: 'initHelpers',
    value: function initHelpers() {
      this.helpers = {
        animationLoop: { object: new AnimationLoopHelper() },
        canvas: { object: new CanvasHelper() },
        config: { object: new ConfigHelper() },
        device: { object: new DeviceHelper() },
        input: { object: new InputHelper() },
        renderer: { object: new RendererHelper() },
        ui: { object: new UserInterfaceHelper() }
      };

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = Array.from(this.helpers)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var helper = _step.value;

          if (!helper.loaded) {
            this.loadHelper(helper);
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return this;
    }
  }, {
    key: 'loadHelper',
    value: function loadHelper(helper) {
      if (helper.object.load !== null) {
        console.log(helper.object);
        helper.object.load();
      }
      helper.loaded = true;

      return this;
    }
  }, {
    key: 'initScenes',
    value: function initScenes() {
      this.scenes = {
        ident: new IdentScene(),
        'game-over': new GameOverScene(),
        playing: new PlayingScene(),
        title: new TitleScene()
      };

      for (var sceneName in this.scenes) {
        var sceneObject = this.scenes[sceneName];
        if (sceneObject.updatesInBackGround) {
          this.backgroundScenes.push(sceneObject);
        }
      }

      return this;
    }
  }, {
    key: 'getHelper',
    value: function getHelper(name) {
      var helper = this.helpers[name];

      if (!helper.loaded) {
        this.loadHelper(helper);
      }

      return helper.object;
    }
  }, {
    key: 'update',
    value: function update(delta) {
      this.delta = delta;

      if (this.currentScene != null) {
        this.getHelper('canvas').clear();
        this.currentScene.update();

        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = Array.from(this.backgroundScenes)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var backgroundScene = _step2.value;

            if (backgroundScene.id !== this.currentScene.id) {
              backgroundScene.update();
            }
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2.return) {
              _iterator2.return();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }

        this.getHelper('renderer').process();
      }

      return this;
    }
  }]);

  return Application;
}();
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*
 * decaffeinate suggestions:
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
var Entity = function () {
  function Entity() {
    _classCallCheck(this, Entity);

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

  _createClass(Entity, [{
    key: 'addSelfToRenderQueue',
    value: function addSelfToRenderQueue() {
      this.renderer.enqueue(this);

      return this;
    }
  }, {
    key: 'canvasExitCallback',
    value: function canvasExitCallback() {
      return this;
    }
  }, {
    key: 'isInsideCanvasBounds',
    value: function isInsideCanvasBounds() {
      return !this.isOutsideCanvasBounds();
    }
  }, {
    key: 'isOutsideCanvasBounds',
    value: function isOutsideCanvasBounds() {
      var outsideLeft = this.position.x < -this.width;
      var outsideRight = this.position.x - this.width > this.canvas.element.realWidth;
      var outsideX = outsideLeft || outsideRight;
      var outsideTop = this.position.y < -this.height;
      var outsideBottom = this.position.y - this.height > this.canvas.element.realWheight;
      var outsideY = outsideTop || outsideBottom;

      return outsideX || outsideY;
    }
  }, {
    key: 'removeSelfFromParent',
    value: function removeSelfFromParent() {
      if (this.parent != null) {
        this.parent.removeEntity(this.id);
      }

      return this;
    }
  }, {
    key: 'update',
    value: function update() {
      if (this.isOutsideCanvasBounds()) {
        if (this.canvasExitCallback != null) {
          this.canvasExitCallback();
        }
        if (this.removeOnCanvasExit) {
          this.removeSelfFromParent();
        }
      }

      return this;
    }
  }]);

  return Entity;
}();
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
var Scene = function () {
  function Scene() {
    _classCallCheck(this, Scene);

    this.entitiesCount = 0;
    this.entityIds = [];
    this.entities = [];
    this.entitiesPendingRemoval = [];
    this.updatesInBackGround = false;

    return this;
  }

  _createClass(Scene, [{
    key: 'addEntity',
    value: function addEntity(entity, unshift) {
      if (unshift === null) {
        this.entityIds.push(entity.id);
        this.entities.push(entity);
      } else {
        this.entityIds.unshift(entity.id);
        this.entities.unshift(entity);
      }

      this.entitiesCount += 1;

      return this;
    }
  }, {
    key: 'load',
    value: function load() {
      this.config = App.getHelper('config');
      this.device = App.getHelper('device');
      this.input = App.getHelper('input');
      this.ui = App.getHelper('ui');

      return this;
    }
  }, {
    key: 'removeAllEntities',
    value: function removeAllEntities() {
      this.entitiesCount = 0;
      this.entities = [];
      this.entityIds = [];

      return this;
    }
  }, {
    key: 'removeEntity',
    value: function removeEntity(id) {
      this.entitiesPendingRemoval.push(id);

      return this;
    }
  }, {
    key: 'unload',
    value: function unload() {
      // @removeAllEntities()

      return this;
    }
  }, {
    key: 'update',
    value: function update() {
      if (this.entitiesCount > 0) {
        this.updateEntities();

        this.processEntitiesMarkedForRemoval();
      }

      return this;
    }
  }, {
    key: 'updateEntities',
    value: function updateEntities() {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = Array.from(this.entities)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var entity = _step.value;

          entity.update();
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return this;
    }
  }, {
    key: 'processEntitiesMarkedForRemoval',
    value: function processEntitiesMarkedForRemoval() {
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = Array.from(this.entitiesPendingRemoval)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var id = _step2.value;

          var index = this.entityIds.indexOf(id);

          this.entities.splice(index, 1);
          this.entityIds.splice(index, 1);

          this.entitiesCount -= 1;
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      this.entitiesPendingRemoval = [];

      if (this.entitiesCount < 0) {
        return this.entitiesCount = 0;
      }
    }
  }]);

  return Scene;
}();
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var GameOverScene = function (_Scene) {
  _inherits(GameOverScene, _Scene);

  function GameOverScene() {
    var _ret;

    _classCallCheck(this, GameOverScene);

    var _this = _possibleConstructorReturn(this, (GameOverScene.__proto__ || Object.getPrototypeOf(GameOverScene)).apply(this, arguments));

    _this.id = 'game-over';
    _this.playAgainEventBound = false;

    return _ret = _this, _possibleConstructorReturn(_this, _ret);
  }

  _createClass(GameOverScene, [{
    key: 'load',
    value: function load() {
      var _this2 = this;

      _get(GameOverScene.prototype.__proto__ || Object.getPrototypeOf(GameOverScene.prototype), 'load', this).apply(this, arguments);

      this.input.addEventListener('.play-again', 'click', function () {
        _this2.ui.transitionTo('playing');
      });

      return this;
    }
  }]);

  return GameOverScene;
}(Scene);
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
var IdentScene = function (_Scene) {
  _inherits(IdentScene, _Scene);

  function IdentScene() {
    var _ret;

    _classCallCheck(this, IdentScene);

    var _this = _possibleConstructorReturn(this, (IdentScene.__proto__ || Object.getPrototypeOf(IdentScene)).apply(this, arguments));

    _this.id = 'ident';

    return _ret = _this, _possibleConstructorReturn(_this, _ret);
  }

  _createClass(IdentScene, [{
    key: 'load',
    value: function load() {
      var _this2 = this;

      _get(IdentScene.prototype.__proto__ || Object.getPrototypeOf(IdentScene.prototype), 'load', this).apply(this, arguments);

      window.setTimeout(function () {
        return _this2.ui.transitionTo('title');
      }, 2500);

      return this;
    }
  }]);

  return IdentScene;
}(Scene);
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
var PlayingScene = function (_Scene) {
  _inherits(PlayingScene, _Scene);

  function PlayingScene() {
    var _ret;

    _classCallCheck(this, PlayingScene);

    var _this = _possibleConstructorReturn(this, (PlayingScene.__proto__ || Object.getPrototypeOf(PlayingScene)).apply(this, arguments));

    _this.id = 'playing';
    _this.updatesInBackGround = true;
    _this.levelUpInterval = 5000;
    _this.maxLevel = 50;
    _this.maxDiameterAsPercentageOfScreen = 15;
    _this.maxLineWidth = 5;
    _this.pointsPerPop = 10;

    return _ret = _this, _possibleConstructorReturn(_this, _ret);
  }

  _createClass(PlayingScene, [{
    key: 'load',
    value: function load() {
      _get(PlayingScene.prototype.__proto__ || Object.getPrototypeOf(PlayingScene.prototype), 'load', this).apply(this, arguments);

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
    }
  }, {
    key: 'decrementTargetBubblesCount',
    value: function decrementTargetBubblesCount() {
      this.targetBubblesCount -= 1;

      if (this.targetBubblesCount < 0) {
        this.targetBubblesCount = 0;
      }

      return this;
    }
  }, {
    key: 'gameOver',
    value: function gameOver() {
      this.ui.transitionTo('game-over');
      this.input.removeAllEntities();

      return this;
    }
  }, {
    key: 'generateBubble',
    value: function generateBubble() {
      if (this.playing && randomPercentage() < this.difficultyConfig.bubbleSpawnChance.current) {
        var bubbleConfig = this.newBubbleConfig();
        var bubble = new BubbleEntity(this, bubbleConfig);

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
    }
  }, {
    key: 'newBubbleConfig',
    value: function newBubbleConfig() {
      return {
        bubbleGrowthMultiplier: this.difficultyConfig.bubbleGrowthMultiplier.current,
        chanceBubbleIsTarget: this.difficultyConfig.chanceBubbleIsTarget.current,
        diameterMax: this.difficultyConfig.diameterMax.current,
        maxTargetsAtOnce: this.difficultyConfig.maxTargetsAtOnce.current,
        minTargetDiameter: this.difficultyConfig.minTargetDiameter.current,
        targetVelocityMultiplier: this.difficultyConfig.targetVelocityMultiplier.current,
        velocityMax: this.difficultyConfig.velocityMax.current,
        velocityMin: this.difficultyConfig.velocityMin.current,
        maxLineWidth: this.maxLineWidth,
        playing: this.playing,
        targetBubblesCount: this.targetBubblesCount
      };
    }
  }, {
    key: 'setupDifficultyConfig',
    value: function setupDifficultyConfig() {
      var maxDiameter = this.device.screen.width / 100 * this.maxDiameterAsPercentageOfScreen;

      this.difficultyConfig = {
        bubbleGrowthMultiplier: { current: 0, easy: 1.05, difficult: 1.1 },
        bubbleSpawnChance: { current: 0, easy: 60, difficult: 100 },
        chanceBubbleIsTarget: { current: 0, easy: 50, difficult: 90 },
        diameterMax: {
          current: 0,
          easy: maxDiameter,
          difficult: maxDiameter * 0.6
        },
        maxTargetsAtOnce: { current: 0, easy: 3, difficult: 6 },
        minTargetDiameter: {
          current: 0,
          easy: maxDiameter * 0.7,
          difficult: maxDiameter * 0.4
        },
        targetVelocityMultiplier: { current: 0, easy: 0.3, difficult: 0.5 },
        velocityMax: { current: 0, easy: 4, difficult: 7 },
        velocityMin: { current: 0, easy: -4, difficult: -7 }
      };

      this.updateValuesForDifficulty();

      return this;
    }
  }, {
    key: 'setHeadsUpValues',
    value: function setHeadsUpValues() {
      updateUITextNode(this.ui.element('comboMultiplierCounter'), this.comboMultiplier);
      updateUITextNode(this.ui.element('levelCounter'), this.level);
      updateUITextNode(this.ui.element('scoreCounter'), formatWithComma(this.score));

      return this;
    }
  }, {
    key: 'setupLevelUpIncrement',
    value: function setupLevelUpIncrement() {
      var _this2 = this;

      this.levelUpCounter = window.setInterval(function () {
        _this2.updateLevel();
      }, this.levelUpInterval);

      return this;
    }
  }, {
    key: 'stopLevelUpIncrement',
    value: function stopLevelUpIncrement() {
      window.clearInterval(this.levelUpCounter);

      return this;
    }
  }, {
    key: 'unload',
    value: function unload() {
      if (this.playing === true) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = Array.from(this.entities)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var bubble = _step.value;

            bubble.destroying = true;
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        this.playing = false;

        return this.stopLevelUpIncrement();
      }
    }
  }, {
    key: 'update',
    value: function update() {
      _get(PlayingScene.prototype.__proto__ || Object.getPrototypeOf(PlayingScene.prototype), 'update', this).apply(this, arguments);

      this.generateBubble();

      return this;
    }
  }, {
    key: 'updateComboMultiplier',
    value: function updateComboMultiplier(targetHit) {
      if (targetHit) {
        this.comboMultiplier += 1;
      } else {
        this.comboMultiplier = 0;
      }

      this.setHeadsUpValues();

      return this;
    }
  }, {
    key: 'updateLevel',
    value: function updateLevel() {
      this.level += 1;

      if (this.level >= this.maxLevel) {
        window.clearInterval(this.levelUpCounter);
      }

      this.setHeadsUpValues();

      this.updateValuesForDifficulty();

      return this;
    }
  }, {
    key: 'updateScore',
    value: function updateScore(sizeWhenTapped, sizeWhenFullyGrown) {
      // ((defaultScorePerPop + (100 - ((sizeWhenTapped / sizeWhenFullyGrown) * 100))) * comboMultiplier) * (levelNumber + 1)

      var targetSizeBonus = Math.round(100 - sizeWhenTapped / sizeWhenFullyGrown * 100);
      var popPointValue = this.pointsPerPop + targetSizeBonus;
      var levelMultiplier = this.level + 1;

      this.score += popPointValue * this.comboMultiplier * levelMultiplier;

      this.setHeadsUpValues();

      return this;
    }
  }, {
    key: 'updateValuesForDifficulty',
    value: function updateValuesForDifficulty() {
      var levelMulitplier = this.level / this.maxLevel;

      for (var propertyName in this.difficultyConfig) {
        var propertyValues = this.difficultyConfig[propertyName];
        var valueDifference = propertyValues.difficult - propertyValues.easy;
        var adjustedValue = valueDifference * levelMulitplier + propertyValues.easy;

        this.difficultyConfig[propertyName].current = adjustedValue;
      }

      return this;
    }
  }]);

  return PlayingScene;
}(Scene);
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TitleScene = function (_Scene) {
  _inherits(TitleScene, _Scene);

  function TitleScene() {
    var _ret;

    _classCallCheck(this, TitleScene);

    var _this = _possibleConstructorReturn(this, (TitleScene.__proto__ || Object.getPrototypeOf(TitleScene)).apply(this, arguments));

    _this.id = 'title';

    return _ret = _this, _possibleConstructorReturn(_this, _ret);
  }

  _createClass(TitleScene, [{
    key: 'load',
    value: function load() {
      var _this2 = this;

      _get(TitleScene.prototype.__proto__ || Object.getPrototypeOf(TitleScene.prototype), 'load', this).apply(this, arguments);

      this.input.addEventListener('.game-logo', 'click', function () {
        _this2.ui.transitionTo('playing');
      });

      return this;
    }
  }, {
    key: 'unload',
    value: function unload() {
      _get(TitleScene.prototype.__proto__ || Object.getPrototypeOf(TitleScene.prototype), 'unload', this).apply(this, arguments);

      return this;
    }
  }]);

  return TitleScene;
}(Scene);
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var BubbleEntity = function (_Entity) {
  _inherits(BubbleEntity, _Entity);

  function BubbleEntity(parent, configValues) {
    var _ret;

    _classCallCheck(this, BubbleEntity);

    var _this = _possibleConstructorReturn(this, (BubbleEntity.__proto__ || Object.getPrototypeOf(BubbleEntity)).apply(this, arguments));

    _this.parent = parent;
    _this.configValues = configValues;

    _this.height = 0;
    _this.id = 'bubble_' + Math.random().toString(36).substr(2, 5);
    _this.position = {
      x: _this.device.screen.width / 2,
      y: _this.device.screen.height / 2
    };
    _this.velocity = {
      x: random(_this.configValues.velocityMin, _this.configValues.velocityMax),
      y: random(_this.configValues.velocityMin, _this.configValues.velocityMax)
    };
    _this.width = 0;

    _this.alpha = 0.75;
    _this.color = randomColor();
    _this.destroying = false;
    _this.diameter = 1;
    _this.fillColor = _this.color;
    _this.strokeColor = _this.color;
    _this.finalDiameter = randomInteger(0, configValues.diameterMax);
    _this.isTarget = _this.determineTargetBubble();
    _this.radius = 0.5;
    _this.shrinkMultiplier = 0.9;

    if (_this.isTarget) {
      _this.alpha = 0.9;
      _this.fillColor = '240, 240, 240';
      _this.finalDiameter = randomInteger(_this.configValues.minTargetDiameter, _this.configValues.diameterMax);
      _this.lineWidth = _this.diameter / 10;

      _this.velocity.x *= _this.configValues.targetVelocityMultiplier;
      _this.velocity.y *= _this.configValues.targetVelocityMultiplier;
    }

    return _ret = _this, _possibleConstructorReturn(_this, _ret);
  }

  _createClass(BubbleEntity, [{
    key: 'canvasExitCallback',
    value: function canvasExitCallback() {
      _get(BubbleEntity.prototype.__proto__ || Object.getPrototypeOf(BubbleEntity.prototype), 'canvasExitCallback', this).apply(this, arguments);

      if (this.isTarget) {
        this.parent.gameOver();
      }

      return this;
    }
  }, {
    key: 'determineTargetBubble',
    value: function determineTargetBubble() {
      if (this.configValues.targetBubblesCount < this.configValues.maxTargetsAtOnce) {
        return randomPercentage() < this.configValues.chanceBubbleIsTarget;
      }

      return false;
    }
  }, {
    key: 'render',
    value: function render() {
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
    }
  }, {
    key: 'tapHandler',
    value: function tapHandler(targetHit) {
      this.parent.updateComboMultiplier(targetHit);

      if (targetHit) {
        this.parent.updateScore(this.diameter, this.finalDiameter);
        this.destroying = true;
        this.parent.decrementTargetBubblesCount();
        this.input.queueEntityForRemoval(this.id);
      }

      return this;
    }
  }, {
    key: 'update',
    value: function update() {
      _get(BubbleEntity.prototype.__proto__ || Object.getPrototypeOf(BubbleEntity.prototype), 'update', this).apply(this, arguments);

      if (this.destroying) {
        this.diameter *= this.parent.playing ? 0.6 : this.shrinkMultiplier;

        if (this.diameter < 1) {
          this.removeSelfFromParent();
        }
      } else if (this.diameter < this.finalDiameter) {
        this.diameter *= this.configValues.bubbleGrowthMultiplier;
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
    }
  }, {
    key: 'wasTapped',
    value: function wasTapped() {
      var message = void 0;
      var touchData = this.input.touchData;


      var tapX = touchData.x;
      var tapY = touchData.y;
      var distanceX = tapX - this.position.x;
      var distanceY = tapY - this.position.y;
      var tapped = distanceX * distanceX + distanceY * distanceY < this.radius * this.radius;

      if (tapped) {
        message = 'Bubble#' + this.id + ' tapped at ' + tapX + ', ' + tapY;
      } else {
        message = 'Combo Broken!';
      }

      debugConsole(message);

      return tapped;
    }
  }]);

  return BubbleEntity;
}(Entity);
"use strict";

// Load the main app wrapper
var App = new Application();

// Get up get on get up get on up stay on the scene etc etc
App.load();
//# sourceMappingURL=application.js.map
