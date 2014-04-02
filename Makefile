
build: components index.js
	@component build --dev

components: component.json
	@component install --dev

clean:
	rm -fr build components

release:
	@component build -o dist -n fs -s fs
	@uglifyjs dist/fs.js -o dist/fs.min.js

.PHONY: clean
