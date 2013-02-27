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
	game.run()
else if iOS
	scenes.installationPrompt()
else
	scenes.mobilePrompt()