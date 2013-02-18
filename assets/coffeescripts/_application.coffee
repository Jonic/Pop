###jshint plusplus:false, forin:false ###
###global Game, HeadsUp, Input, ParticleGenerator, Screens, Utils ###

'use strict'

android = if navigator.userAgent.match(/android/i) then true else false
iOS = if navigator.userAgent.match(/(iPad|iPhone|iPod)/i) then true else false
homeScreenApp = iOS and navigator.standalone

# MOVE THIS ONE OF THESE BLOODY DAYS
headsUp = new HeadsUp()

if android or homeScreenApp
	canvas = document.createElement('canvas')
	context = canvas.getContext('2d')

	document.body.appendChild(canvas)

	canvas.width = document.width
	canvas.height = document.height

	game = new Game()

	input = new Input()
	particleGenerator = new ParticleGenerator()
	screens = new Screens()
	utils = new Utils()

	game.run()
else if iOS
	headsUp.installPrompt()
else
	headsUp.mobilePrompt()
