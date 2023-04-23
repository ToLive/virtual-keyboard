develop:
	npx webpack serve

install:
	npm install

build:
	NODE_ENV=production npx webpack

test:
	npm test

lint:
	npx eslint .

.PHONY: test
