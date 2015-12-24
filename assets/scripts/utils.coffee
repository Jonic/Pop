$ = (selector) ->

  return document.body if selector == 'body'

  return document.getElementById(selector) if selector.substr(0, 1) == '#'

  els = document.querySelectorAll(selector)

  return els[0] if els.length == 1

  return els

callNativeApp = (message) ->
  try
    webkit.messageHandlers.callbackHandler.postMessage(message)
  catch err
    console.log('The native context does not exist yet')

clamp = (value, min, max) ->

  if value < min
    value = min
  else if value > max
    value = max

  return value

correctValueForDPR = (value, integer = false) ->

  value *= devicePixelRatio

  value = Math.round(value) if integer

  return value

debugConsole = (message) ->

  element = $('.debugConsole')

  updateUITextNode(element, message)
  console.log(message)
  callNativeApp(message)

  return

formatWithComma = (num) ->

  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")

fps = (value) ->

  return updateUITextNode($('.fps'), value)

random = (min, max) ->

  if min == undefined
    min = 0
    max = 1
  else if max == undefined
    max = min
    min = 0

  return (Math.random() * (max - min)) + min;

randomColor = () ->

  r = randomInteger(0, 200)
  g = randomInteger(0, 200)
  b = randomInteger(0, 200)

  return "#{r}, #{g}, #{b}"

randomInteger = (min, max) ->

  if max == undefined
    max = min
    min = 0

  return Math.floor(Math.random() * (max + 1 - min)) + min

randomPercentage = ->

  return Math.floor(Math.random() * 100)

rgba = (color, alpha = false) ->

  alpha = 1 if !alpha

  return "rgba(#{color}, #{alpha})"

updateUITextNode = (element, value) ->

  element.innerHTML = value

  return this
