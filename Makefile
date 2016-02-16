engines = 0.12 4.3 5.6
docs = README.md doc/documentation.md

all: engines

engines: $(engines)

$(engines):
	@ n $@
	@ $(MAKE) test

test: mocha

mocha:
	@ mocha test/*.mocha.js

doc: $(docs)

$(docs):
	@ echo $@
	@ markedpp -i $@ -o $@

.PHONY: all \
	engines $(engines) \
	test \
	mocha \
	doc $(docs)
