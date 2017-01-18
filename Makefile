engines = 0.8 0.12 4. 6. 7.
docs = README.md doc/documentation.md

all: engines

engines: $(engines)

$(engines):
	@ n $@
	@ $(MAKE) test

test:
	@ npm test

doc: $(docs)

$(docs):
	@ echo $@
	@ markedpp -i $@ -o $@

.PHONY: all \
	engines $(engines) \
	test \
	mocha \
	doc $(docs)
