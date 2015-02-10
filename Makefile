
deploy:
	make clear

	mkdir ./build
	cp -r ./public ./build/public
	cp ./index.html ./build

	cp -r ./build ./_targets/ios/Pop\ Rush/WebApp

clear:
	rm -rf ./build
	rm -rf ./_targets/ios/Pop\ Rush/WebApp
