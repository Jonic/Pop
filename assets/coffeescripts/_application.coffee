###jshint plusplus:false, forin:false ###
###global Game, HeadsUp, Input, ParticleGenerator, Screens ###

'use strict'

canvas = document.createElement('canvas')
context = canvas.getContext('2d')

document.body.appendChild(canvas)

canvas.width = document.width
canvas.height = document.height

config = new Config()
game = new Game()

headsUp = new HeadsUp()
input = new Input()
particleGenerator = new ParticleGenerator()
screens = new Screens()

game.run()
