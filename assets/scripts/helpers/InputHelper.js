/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
class InputHelper {
  constructor() {
    this.device = new DeviceHelper()

    this.cancelTouchMoveEvents()

    // @setupConsole()

    return this
  }

  load() {
    this.entityIds = []
    this.entitiesToTest = []
    this.entitiesPendingRemoval = []

    return this
  }

  addCanvasTapEventListener(canvasSelector) {
    this.addEventListener(canvasSelector, 'click', () => {
      this.testEntitiesForEvents()
    })

    return this
  }

  addEntity(entity) {
    this.entityIds.push(entity.id)
    this.entitiesToTest.push(entity)

    return this
  }

  addEventListener(selector, type, callback, consoleOutput) {
    if (selector == null) {
      selector = 'body'
    }
    if (consoleOutput == null) {
      consoleOutput = false
    }
    type = this.convertClickToTouch(type)

    if (consoleOutput) {
      debugConsole(`Input.addEventListener(${selector}, ${type}, ${callback})`)
    }

    $(selector).addEventListener(type, callback, false)

    return this
  }

  cancelTouchMoveEvents() {
    window.addEventListener('touchmove', function(event) {
      event.preventDefault()
    })

    return this
  }

  convertClickToTouch(type) {
    if (type === 'click' && this.device.hasTouchEvents) {
      return 'touchstart'
    }
    return type
  }

  getTouchData(event) {
    let touchData
    if (this.device.hasTouchEvents) {
      touchData = {
        x: event.touches[0].pageX,
        y: event.touches[0].pageY,
      }
    } else {
      touchData = {
        x: event.clientX,
        y: event.clientY,
      }
    }

    return touchData
  }

  removeEventListener(selector, type, callback) {
    if (selector == null) {
      selector = 'body'
    }
    type = this.convertClickToTouch(type)

    debugConsole(`Input.removeEventListener(${selector}, ${type}, ${callback})`)

    $(selector).removeEventListener(type, callback, false)

    return this
  }

  setupConsole() {
    this.addEventListener('body', 'click', function(event) {
      const { type } = event
      const node = event.target.nodeName.toLowerCase()
      const id = event.target.id || 'n/a'
      const classList = event.target.classList || 'n/a'

      debugConsole(`${type} on ${node} - id: ${id} - class: ${classList}`)
    })

    return this
  }

  queueEntityForRemoval(id) {
    this.entitiesPendingRemoval.push(id)

    return this
  }

  removeAllEntities() {
    this.entitiesToTest = []

    return this
  }

  removeQueuedEntities() {
    for (let id of Array.from(this.entitiesPendingRemoval)) {
      this.removeEntity(id)
    }

    this.entitiesPendingRemoval = []

    return this
  }

  removeEntity(id) {
    const index = this.entityIds.indexOf(id)

    if (index !== -1) {
      this.entityIds.splice(index, 1)
      this.entitiesToTest.splice(index, 1)
    }

    return this
  }

  testEntitiesForEvents() {
    this.touchData = this.getTouchData(event)

    for (let entity of Array.from(this.entitiesToTest)) {
      const tapped = entity.wasTapped()

      entity.tapHandler(tapped)
    }

    // break if tapped

    this.removeQueuedEntities()

    return this
  }
}
