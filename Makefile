
deploy:
	rm -rf ./build
	mkdir ./build

	cp -r ./public ./build/public
	cp ./index.html ./build

	rm -rf ./_targets/iOS/PopRush/WebApp

	mv ./build ./_targets/iOS/PopRush/WebApp
