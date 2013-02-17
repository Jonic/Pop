###jshint plusplus:false, forin:false ###
###global Class ###

'use strict'

Utils = Class.extend
	init: ->

		return

	randomInteger: (min, max) ->

		if max == undefined
			max = min
			min = 0

		Math.floor(Math.random() * (max + 1 - min)) + min

	random: (min, max) ->

		if min == undefined
			min = 0
			max = 1
		else if max == undefined
			max = min
			min = 0

		(Math.random() * (max - min)) + min;
