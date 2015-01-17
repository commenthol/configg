all: v0.8 v0.10 v0.11

v0.8:
	n 0.8 && npm test

v0.10:
	n 0.10 && npm test

v0.11:
	n 0.11 && npm test

_readme:
	@ markedpp README.md > o.md; \
	mv o.md README.md;
	@ markedpp doc/documentation.md > o.md; \
	mv o.md doc/documentation.md;