class ConfigHelper

  load: ->

    @values = {}

    return this

  console: (path) ->

    debugConsole(@get(path))

    return this

  dump: (path) ->

    dumping = @values

    if (path)
      dumping = "Config.#{path}: #{@get(path)}"

    console.log(dumping)

    return this

  get: (path) ->

    path  = path.split '.'
    array = @values

    for key, index in path
      nextKey = path[index + 1]

      if nextKey?
        array = array[key]
      else
        value = array[key]

    return value if value?

  set: (path, value) ->

    path  = path.split '.'
    array = @values

    for key, index in path
      nextKey = path[index + 1]

      if !array[key]
        if nextKey?
          array[key] = {}
        else
          array[key] = value

      array = array[key]

    return this
