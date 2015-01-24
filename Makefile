engines = 0.8 0.10 0.11
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
	@ markedpp $@ > o.md && \
	mv o.md $@;

.PHONY: all \
	engines $(engines) \
	test \
	mocha \
	doc $(docs)
