;
'use strict';
//
// Replace /\b(const|let)\B/ with "$1 "
// Replace [/^( *)function (\w+)/] with [$1var $2 = function]
// Replace [/\Bof\s*/] With [ of ]
//
// Author: adrian.aichner@gmail.com
//
// Firefox Addon Content Script.
// require is not available in content scripts.
// let sp = require('sdk/simple-prefs');
(function() {
  let DEBUG_ADDON = false;

  // self is undefined when using require in jpm test.
  let tryConvertToJson = function(text) {
    let json = text.replace(/^\s*\/\/.+\n/gm, '');
    json = json.replace(/'([^']*)'/g, '"$1"');
    json = json.replace(/([^"\/])\b(\w(\w|\d)*):/g, '$1"$2":');
    return json;
  };
  (typeof self !== 'undefined') && self.port.on('load_settings', function(data) {
    if ('links' in data) {
      data.links.forEach(function (link) {
	let id = document.getElementById(link.id);
	id.href = link.href;
      });
    }
    Array.prototype.forEach.call(document.querySelectorAll('div.settings'), function(setting) {
      document.body.removeChild(setting);
    });
    data.localizedPreferences.forEach(function (prefDefinition) {
      if (prefDefinition.hidden) {
        return;
      }
      let content = document.querySelector('template.' + prefDefinition.type).content;
      let prefUI = document.importNode(content, "deep").firstElementChild;
      let label = prefUI.children[0];
      let element = prefUI.children[1];
      let description = prefUI.children[2];
      label.textContent = prefDefinition.title;
      description.textContent = prefDefinition.description;
      // label.setAttribute('data-l10n-id', prefDefinition.name + '_title');
      // description.setAttribute('data-l10n-id', prefDefinition.name + '_description');
      switch (prefDefinition.type) {
        case "bool": {
          element.checked = data.prefs[prefDefinition.name];
          element.addEventListener('change', function(event) {
            self.port.emit('save_setting', {
              name: prefDefinition.name,
              value: event.target.checked
            });
          });
          element.name = prefDefinition.name;
          break;
        }
        case "control": {
          element.value = prefDefinition.label;
          element.addEventListener('click', function(event) {
              self.port.emit('save_setting', {
                name: prefDefinition.name,
                value: event.target.textContent
              });
          });
          break;
        }
        case "string": {
          element.textContent = data.prefs[prefDefinition.name];
          // NOTE: Thanks
          // https://github.com/jrburke/gaia/commit/204a4b0c55eafbb20dfaa233fbbf2579a8f81915
          element.addEventListener('paste', function(event) {
            event.preventDefault();
            var text = tryConvertToJson(event.clipboardData.getData('text/plain'));
            // Only insert if text. If no text, the execCommand fails with an
            // error.
            if (text) {
              document.execCommand('insertText', false, text);
            }
          });
          element.addEventListener('blur', function(event) {
            try {
              event.target.textContent = event.target.textContent.trim();
              if (event.target.textContent.length == 0) {
                event.target.textContent = "{}";
              }
              // NOTE: This regexp might not catch all cases, so let's just try always
              // if (/'|:[^\/]|^\s*\/\//.test(event.target.textContent)) {
              event.target.textContent = tryConvertToJson(event.target.textContent);
              // }
              event.target.textContent = JSON.stringify(JSON.parse(event.target.textContent), null, 2);
              self.port.emit('save_setting', {
                name: prefDefinition.name,
                value: event.target.textContent
              });
              element.name = prefDefinition.name;
            }
            catch (e) {
              reportError(event.target);
            }
          });
          break;
        }
        case "menulist": {
          let content2 = document.querySelector('template.' + prefDefinition.type + '_item').content;
          prefDefinition.options.forEach(function (item) {
            let prefUI2 = document.importNode(content2, "deep").firstElementChild;
            prefUI2.textContent = item.label;
            prefUI2.value = item.value;
            if (data.prefs[prefDefinition.name] == item.value) {
              prefUI2.selected = true;
            }
            element.appendChild(prefUI2);
          });
          element.name = prefDefinition.name;
          element.addEventListener('change', function(event) {
            self.port.emit('save_setting', {
              name: prefDefinition.name,
              value: event.target.value
            });
          });
          break;
        }
        case "radio": {
          let content2 = document.querySelector('template.' + prefDefinition.type + '_item').content;
          prefDefinition.options.forEach(function (item) {
            let prefUI2 = document.importNode(content2, "deep");
            let radio = prefUI2.children[0];
            let label = prefUI2.children[1];
            radio.value = item.value;
            radio.id = prefDefinition.name + '.' + item.value;
            radio.name = prefDefinition.name;
            label.textContent = item.label;
            // O_Oh
            label.htmlFor = prefDefinition.name + '.' + item.value;
            if (data.prefs[prefDefinition.name] == radio.value) {
              radio.checked = true;
            }
            element.appendChild(prefUI2);
          });
          element.addEventListener('change', function(event) {
            self.port.emit('save_setting', {
              name: prefDefinition.name,
              value: event.target.value
            });
          });
          break;
        }
      }
      document.body.appendChild(prefUI);
    });
    data.prefs['diagnostics_overlay'] && window.showDiagnosticsOverlay({
      err: data,
      indent: 2
    });
  });
  // self is undefined when using require in jpm test.
  (typeof self !== 'undefined') && self.port.emit('request_settings');
})();
