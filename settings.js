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
  const DEBUG_ADDON = false;
  try {
    // Save settings in memory if browser.storage.local.set
    // turns out to be slow.
    // let settings = {};
    let tryConvertToJson = function(text) {
      let json = text.replace(/^\s*\/\/.+\n/gm, '');
      json = json.replace(/'([^']*)'/g, '"$1"');
      json = json.replace(/^(\s*)(\w(\w|\d)*):/gm, '$1"$2":');
      return json;
    };
    // self is undefined when using require in jpm test.
    //browser.runtime.onMessage.addListener((data, sender, sendResponse) => {
    //  if (data.type === 'load_settings') {
    browser.storage.local.get().then(res => {
      DEBUG_ADDON && console.log(res);
      browser.runtime.getBackgroundPage().then((w) => {
        let _ = (key) => {
          return browser.i18n.getMessage(key);
        };
        let localizedPreferences = w.optionsDefinitions.preferences.map(function(pref) {
          pref.title = _(pref.name + '_title');
          pref.description = _(pref.name + '_description');
          return pref;
        });
        let data = {
          localizedPreferences: localizedPreferences,
          prefs: w.optionsDefinitions.preferences,
          links: [
            {
              textContent: _('help_menu_entry'),
              href: browser.extension.getURL(_('help_path')),
              id: 'help_link',
            }, {
              textContent: _('known_origins'),
              href: browser.extension.getURL(_('known_origins_path')),
              id: 'known_origins_link',
            }
          ]
        };
        const manifest = browser.runtime.getManifest();
        document.getElementById('favicon').href
          = browser.extension.getURL(manifest.icons["48"]);
        let versionInfo = document.getElementById('version_info');
        versionInfo.textContent = `${_('addon_title')} ${manifest.version}`;
        let applicationDescription = document.getElementById('application_description');
        // NOTE: Keep this first, before adding nodes to document.
        Array.prototype.forEach.call(document.querySelectorAll('div.settings'), function(setting) {
          document.body.removeChild(setting);
        });
        if ('links' in data && applicationDescription) {
          let linksContent = document.querySelector('template.links').content;
          let linksDiv = document.importNode(linksContent, "deep").firstElementChild;
          // let label = prefUI.children[0];
          // let element = prefUI.children[1];
          // let description = prefUI.children[2];
          data.links.forEach(function (link) {
            let linkContent = document.querySelector('template.link').content;
            let linkA = document.importNode(linkContent, "deep").firstElementChild;
            linkA.href = link.href;
            linkA.id = link.id;
            // Better to set textContent directly, since we have to pass the value anyway.
            // linkA.dataL10nId = link.dataL10nId;
            linkA.textContent = link.textContent;
            linksDiv.appendChild(linkA);
          });
          document.body.insertBefore(linksDiv, applicationDescription);
        }
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
            element.checked = res[prefDefinition.name];
            element.addEventListener('change', function(event) {
              let item = {};
              item[prefDefinition.name] = event.target.checked;
              // settings[prefDefinition.name] = event.target.checked;
              browser.storage.local.set(item).then(res => {
                DEBUG_ADDON && console.log(res);
              });
            });
            element.name = prefDefinition.name;
            break;
          }
          case "control": {
            element.value = prefDefinition.label;
            element.addEventListener('click', function(event) {
              // For a control we save its textContent so we can listen to onChanged events.
              let item = {};
              item[prefDefinition.name] = event.target.textContent;
              // settings[prefDefinition.name] = event.target.textContent;
              browser.storage.local.set(item).then(res => {
                DEBUG_ADDON && console.log(res);
              });
              // browser.runtime.sendMessage({
              //   type: 'save_setting',
              //   name: prefDefinition.name,
              //   value: event.target.textContent
              // });
            });
            break;
          }
          case "string": {
            // NOTE: We JSON.parse preferences starting with JSON and report errors.
            let isJson = /^JSON/.test(prefDefinition.name);
            element.textContent = res[prefDefinition.name];
            // NOTE: Thanks
            // https://github.com/jrburke/gaia/commit/204a4b0c55eafbb20dfaa233fbbf2579a8f81915
            element.addEventListener('paste', function(event) {
              event.preventDefault();
              var text = event.clipboardData.getData('text/plain');
              if (isJson) {
                text = tryConvertToJson(text);
              }
              // Only insert if text. If no text, the execCommand fails with an
              // error.
              if (text) {
                document.execCommand('insertText', false, text);
              }
            });
            element.addEventListener('blur', function(event) {
              try {
                event.target.textContent = event.target.textContent.trim();
                if (isJson) {
                  if (event.target.textContent.length == 0) {
                    event.target.textContent = "{}";
                  }
                  // NOTE: This regexp might not catch all cases, so let's just try always
                  // if (/'|:[^\/]|^\s*\/\//.test(event.target.textContent)) {
                  event.target.textContent = tryConvertToJson(event.target.textContent);
                  // }
                  event.target.textContent = JSON.stringify(JSON.parse(event.target.textContent), null, 2);
                }
                let item = {};
                item[prefDefinition.name] = event.target.textContent;
                // settings[prefDefinition.name] = event.target.textContent;
                browser.storage.local.set(item).then(res => {
                  DEBUG_ADDON && console.log(res);
                });
                // browser.runtime.sendMessage({
                //   type: 'save_setting',
                //   name: prefDefinition.name,
                //   value: event.target.textContent
                // });
                element.name = prefDefinition.name;
              }
              catch (e) {
                window.reportError(event.target);
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
              if (res[prefDefinition.name] == item.value) {
                prefUI2.selected = true;
              }
              element.appendChild(prefUI2);
            });
            element.name = prefDefinition.name;
            element.addEventListener('change', function(event) {
              let item = {};
              item[prefDefinition.name] = event.target.value;
              // settings[prefDefinition.name] = event.target.value;
              browser.storage.local.set(item).then(res => {
                DEBUG_ADDON && console.log(res);
              });
              // browser.runtime.sendMessage({
              //   type: 'save_setting',
              //   name: prefDefinition.name,
              //   value: event.target.value
              // });
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
              if (res[prefDefinition.name] == radio.value) {
                radio.checked = true;
              }
              element.appendChild(prefUI2);
            });
            element.addEventListener('change', function(event) {
              let item = {};
              item[prefDefinition.name] = event.target.value;
              // settings[prefDefinition.name] = event.target.value;
              browser.storage.local.set(item).then(res => {
                DEBUG_ADDON && console.log(res);
              });
              // browser.runtime.sendMessage({
              //   type: 'save_setting',
              //   name: prefDefinition.name,
              //   value: event.target.value
              // });
            });
            break;
          }
          }
          document.body.appendChild(prefUI);
        });
        window.setTimeout(() => {
          let diag = window.showDiagnosticsOverlay;
          // console.log(diag.toSource());
          res['diagnostics_overlay'] && diag({
            err: { settings: res, preferences: data },
            indent: 2
          });
        }, 1000);
      });
    });
    // }
    // });
    // self is undefined when using require in jpm test.
    // browser.runtime.sendMessage({
    //   type: 'request_settings'
    // }).then(res => {
    //   console.log(res);
    // });
  }
  catch (exception) {
    DEBUG_ADDON && console.error(exception);
    DEBUG_ADDON && window.alert(exception.message + '\n\n' + exception.stack);
    // handleErrors(exception);
  }
})();
