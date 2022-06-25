all: build_node_app

build_node_app:
	@echo "Update node binary..." 
	
	cd src/ && \
	npm install && \
	npm run build && \
	# mv *.AppImage ./hamonikr-auth && cd ../ && \
	cp  ./build/Hamonikr-auth-1.0.0.AppImage ../usr/share/hamonikr-auth/hamonikr-auth && \
	cp -r ./linux/ ../usr/share/hamonikr-auth/

clean:
	rm -fv usr/share/hamonikr-auth/hamonikr-auth 
	rm -fr usr/share/hamonikr-auth/linux