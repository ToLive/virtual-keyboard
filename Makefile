develop:
	npx webpack serve

install:
	npm install

build:
	NODE_ENV=production npx webpack

deploy:
	npx gh-pages -d dist

test:
	npm test

lint:
	npx eslint .

.PHONY: test
