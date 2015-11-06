n = litdown
pdf = doc/$(n).pdf
min = lib/$(n).min.js

all: pdf min

pdf: $(pdf)
min: $(min)

figures: $(patsubst %.dot,%.png,$(wildcard doc/fig/*.dot))
%.png: %.dot; dot -Tpng $< >$@

clean:
	rm -f $(tex)
	rm -f $(pdf)
	rm -f $(min)
	rm -f doc/fig/*.png

$(pdf): README.md figures
	cd doc && pandoc ../$< -o $(n).pdf

doc:
	mkdir doc

$(min): lib/$(n).js
	uglifyjs -c -m -o $@ $<

.PHONY: all clean pdf tex min figures
