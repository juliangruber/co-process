
test:
	@node_modules/.bin/mocha \
		--reporter spec \
		--harmony \
		--bail

example:
	@node --harmony example

.PHONY: test example
