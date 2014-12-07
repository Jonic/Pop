class Utils

	correctValueForDPR: (value, integer = false) ->

		value *= devicePixelRatio

		if integer
			value = Math.round(value)

		return value

	formatWithComma: (num) ->

		num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")

	random: (min, max) ->

		if min == undefined
			min = 0
			max = 1
		else if max == undefined
			max = min
			min = 0

		return (Math.random() * (max - min)) + min;

	randomColor: (alpha = false) ->

		colors =
			r: this.randomInteger(0, 200)
			g: this.randomInteger(0, 200)
			b: this.randomInteger(0, 200)
			a: if !alpha then this.random(0.75, 1) else alpha

		return 'rgba(' + colors.r + ', ' + colors.g + ', ' + colors.b + ', ' + colors.a + ')'

	randomInteger: (min, max) ->

		if max == undefined
			max = min
			min = 0

		return Math.floor(Math.random() * (max + 1 - min)) + min

	randomPercentage: ->

		return Math.floor(Math.random() * 100)

	updateUITextNode: (element, value) ->

		element.innerHTML = value

		@