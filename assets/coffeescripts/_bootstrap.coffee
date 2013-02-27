animationLoop = new AnimationLoop()
scenes = new Scenes()
config = new Config()
game = new Game()
headsUp = new HeadsUp()
input = new Input()
particleGenerator = new ParticleGenerator()
utils = new Utils()

if android or homeScreenApp or debug
    game.run()
else if iOS
    scenes.installationPrompt()
else
    scenes.mobilePrompt()