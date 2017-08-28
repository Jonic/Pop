/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
class RendererHelper {
  load() {
    this.renderStack = []

    return this
  }

  enqueue(entity) {
    this.renderStack.push(entity)

    return this
  }

  process() {
    for (let entity of Array.from(this.renderStack)) {
      if (entity.isInsideCanvasBounds()) {
        entity.render()
      }
    }

    this.reset()

    return this
  }

  reset() {
    this.renderStack = []

    return this
  }
}
