debug = true

android = if navigator.userAgent.match(/android/i) then true else false
iOS = if navigator.userAgent.match(/(iPad|iPhone|iPod)/i) then true else false
homeScreenApp = iOS and navigator.standalone

hasTouchEvents = window.hasOwnProperty('ontouchstart') || window.hasOwnProperty('onmsgesturechange')
inputVerb = if hasTouchEvents then 'touchstart' else 'click'

canvas = document.createElement('canvas')
canvas.width = document.body.clientWidth
canvas.height = document.body.clientHeight

document.body.appendChild(canvas)

context = canvas.getContext('2d')
context.globalCompositeOperation = 'source-atop'

devicePixelRatio = window.devicePixelRatio || 1
backingStoreRatio = context.webkitBackingStorePixelRatio || context.backingStorePixelRatio || 1
ratio = devicePixelRatio / backingStoreRatio

if devicePixelRatio != backingStoreRatio
	oldWidth = canvas.width
	oldHeight = canvas.height

	canvas.width = oldWidth * ratio
	canvas.height = oldHeight * ratio

	canvas.style.width = oldWidth + 'px'
	canvas.style.height = oldHeight + 'px'

	context.scale(ratio, ratio)

animationLoop = new AnimationLoop()
config = new Config()
game = new Game()
headsUp = new HeadsUp()
input = new Input()
particleGenerator = new ParticleGenerator()
utils = new Utils()
scenes = new Scenes()
state = new State()

if android or homeScreenApp or debug
	game.init()
else if iOS
	scenes.installationPrompt()
else
	scenes.mobilePrompt()