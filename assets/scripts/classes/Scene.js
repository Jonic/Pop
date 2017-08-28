/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
class Scene {
  constructor() {
    this.entitiesCount = 0
    this.entityIds = []
    this.entities = []
    this.entitiesPendingRemoval = []
    this.updatesInBackGround = false

    return this
  }

  addEntity(entity, unshift) {
    if (unshift === null) {
      this.entityIds.push(entity.id)
      this.entities.push(entity)
    } else {
      this.entityIds.unshift(entity.id)
      this.entities.unshift(entity)
    }

    this.entitiesCount += 1

    return this
  }

  load() {
    this.config = App.getHelper('config')
    this.device = App.getHelper('device')
    this.input = App.getHelper('input')
    this.ui = App.getHelper('ui')

    return this
  }

  removeAllEntities() {
    this.entitiesCount = 0
    this.entities = []
    this.entityIds = []

    return this
  }

  removeEntity(id) {
    this.entitiesPendingRemoval.push(id)

    return this
  }

  unload() {
    // @removeAllEntities()

    return this
  }

  update() {
    if (this.entitiesCount > 0) {
      this.updateEntities()

      this.processEntitiesMarkedForRemoval()
    }

    return this
  }

  updateEntities() {
    for (let entity of Array.from(this.entities)) {
      entity.update()
    }

    return this
  }

  processEntitiesMarkedForRemoval() {
    for (let id of Array.from(this.entitiesPendingRemoval)) {
      const index = this.entityIds.indexOf(id)

      this.entities.splice(index, 1)
      this.entityIds.splice(index, 1)

      this.entitiesCount -= 1
    }

    this.entitiesPendingRemoval = []

    if (this.entitiesCount < 0) {
      return (this.entitiesCount = 0)
    }
  }
}
