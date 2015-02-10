
# Load the main app wrapper
App = new Application()

# Get up get on get up get on up stay on the scene etc etc
App.load()

###
callNativeApp = ->
  try
      webkit.messageHandlers.callbackHandler.postMessage("Hello from JavaScript")
  catch err
      console.log('The native context does not exist yet')

window.setTimeout ->
    callNativeApp()
, 1000
###
