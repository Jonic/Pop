/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const $ = function(selector) {
  const elements = document.querySelectorAll(selector)

  if (elements.length === 1) {
    return elements[0]
  }
  return elements
}

const callNativeApp = function(message) {
  try {
    return webkit.messageHandlers.callbackHandler.postMessage(message)
  } catch (err) {
    return console.log('The native context does not exist yet')
  }
}

const clamp = function(value, min, max) {
  if (value < min) {
    value = min
  } else if (value > max) {
    value = max
  }

  return value
}

const correctValueForDPR = function(value, integer) {
  if (integer == null) {
    integer = false
  }
  value *= devicePixelRatio

  if (integer) {
    value = Math.round(value)
  }

  return value
}

const debugConsole = function(message) {
  const element = $('.debugConsole')

  updateUITextNode(element, message)
  console.log(message)
  callNativeApp(message)
}

const formatWithComma = num =>
  num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')

const fps = value => updateUITextNode($('.fps'), value)

const random = function(min, max) {
  if (min === undefined) {
    min = 0
    max = 1
  } else if (max === undefined) {
    max = min
    min = 0
  }

  return Math.random() * (max - min) + min
}

const randomColor = function() {
  const r = randomInteger(0, 200)
  const g = randomInteger(0, 200)
  const b = randomInteger(0, 200)

  return `${r}, ${g}, ${b}`
}

var randomInteger = function(min, max) {
  if (max === undefined) {
    max = min
    min = 0
  }

  return Math.floor(Math.random() * (max + 1 - min)) + min
}

const randomPercentage = () => Math.floor(Math.random() * 100)

const rgba = function(color, alpha) {
  if (alpha == null) {
    alpha = false
  }
  if (!alpha) {
    alpha = 1
  }

  return `rgba(${color}, ${alpha})`
}

var updateUITextNode = function(element, value) {
  element.innerHTML = value

  return this
}
