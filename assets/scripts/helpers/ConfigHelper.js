/*
 * decaffeinate suggestions:
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
class ConfigHelper {
  load() {
    this.values = {}

    return this
  }

  console(path) {
    debugConsole(this.get(path))

    return this
  }

  dump(path) {
    let dumping = this.values

    if (path) {
      dumping = `Config.${path}: ${this.get(path)}`
    }

    console.log(dumping)

    return this
  }

  get(path) {
    let value
    path = path.split('.')
    let array = this.values

    for (let index = 0; index < path.length; index++) {
      const key = path[index]
      const nextKey = path[index + 1]

      if (nextKey != null) {
        array = array[key]
      } else {
        value = array[key]
      }
    }

    if (value != null) {
      return value
    }
  }

  set(path, value) {
    path = path.split('.')
    let array = this.values

    for (let index = 0; index < path.length; index++) {
      const key = path[index]
      const nextKey = path[index + 1]

      if (!array[key]) {
        if (nextKey != null) {
          array[key] = {}
        } else {
          array[key] = value
        }
      }

      array = array[key]
    }

    return this
  }
}
