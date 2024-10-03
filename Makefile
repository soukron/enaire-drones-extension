VERSION ?= $(shell cat .version)

CLEAN_FILES := chromium firefox dist dist-webstore
CHROME := $(shell which chromium 2>/dev/null || which chromium-browser 2>/dev/null || which chrome 2>/dev/null || which google-chrome 2>/dev/null || which google-chrome-stable 2>/dev/null || which "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" 2>/dev/null)

#######################
# For local development

.PHONY: all
all: extension chromium firefox

.PHONY: extension
extension:
#	$(MAKE) -C src

EXTENSION_FILES := \
	src/icons/*.png
EXTENSION_FILES := \
    $(wildcard $(EXTENSION_FILES)) \
	src/content.js
CHROMIUM_FILES := $(patsubst src/%,chromium/%, $(EXTENSION_FILES))
FIREFOX_FILES  := $(patsubst src/%,firefox/%,  $(EXTENSION_FILES))

.PHONY: chromium
chromium: extension $(CHROMIUM_FILES) chromium/manifest.json

$(CHROMIUM_FILES) : chromium/% : src/%
	[ -d $(dir $@) ] || mkdir -p $(dir $@)
	cp $< $@

chromium/manifest.json : src/manifest-chromium.json
	[ -d $(dir $@) ] || mkdir -p $(dir $@)
	cp $< $@

.PHONY: firefox
firefox: extension $(FIREFOX_FILES) firefox/manifest.json

$(FIREFOX_FILES) : firefox/% : src/%
	[ -d $(dir $@) ] || mkdir -p $(dir $@)
	cp $< $@

firefox/manifest.json : src/manifest-firefox.json
	[ -d $(dir $@) ] || mkdir -p $(dir $@)
	cp $< $@

#######################
# For official releases

.PHONY: clean
clean:
	rm -rf $(CLEAN_FILES)
#	$(MAKE) -C src clean

.PHONY: dist
dist: clean extension chromium firefox
	mkdir -p dist

	git -c tar.tar.gz.command="gzip -cn" archive -o dist/drones-enaire-extension-$(VERSION).tar.gz --format tar.gz --prefix=drones-enaire-extension-$(VERSION)/ $(VERSION)

	(cd chromium && zip -r ../dist/drones-enaire-chromium-$(VERSION).zip *)
	(cd firefox  && zip -r ../dist/drones-enaire-firefox-$(VERSION).zip  *)

	mkdir -p dist-webstore

	cp dist/drones-enaire-firefox-$(VERSION).zip dist-webstore/firefox-$(VERSION).zip
	mv dist/drones-enaire-extension-$(VERSION).tar.gz dist-webstore/firefox-$(VERSION)-src.tar.gz
