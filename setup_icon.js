(function () {
  const DEBUG_ADDON = true;
  function setupIcon(iconId, emitMessage, message, listener) {
    DEBUG_ADDON &&
      console.log("message", message);
    var div = document.getElementById(iconId);
    if (div) {
      document.body.removeChild(div);
    }
    var efp = document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2);
    div = document.createElement('div');
    div.style.position = 'fixed';
    let bodyBC = 'white';
    let efpBC = 'transparent';
    if (document && 'body' in document) {
      bodyBC = window.getComputedStyle(document.body).backgroundColor;
      efpBC = window.getComputedStyle(efp).backgroundColor;
    }
    div.style.backgroundColor = (efpBC == 'transparent' ? bodyBC : efpBC);
    div.style.color = window.getComputedStyle(efp).color;
    div.style.padding = '0';
    div.style.width = '48px';
    div.style.height = '48px';
    div.style.fontSize = 'large';
    div.style.backgroundImage = `url('${browser.extension.getURL(message.icon)}')`;
    div.style.borderRadius = '3px';
    div.style.borderColor = div.style.color;
    div.id = iconId;
    if (document && 'body' in document) {
      document.body.appendChild(div);
    }
    let updateIconPosition = function(data) {
      div.style.transition = 'opacity 2s linear 0s';
      div.style.opacity = 0;
      let keys = data && data.position && Object.keys(data.position);
      if (keys && keys.length == 2) {
        keys.forEach(function(prop) {
          div.style[prop] = data.position[prop] + 'px';
        });
      }
      else {
        div.style.top = (window.innerHeight - div.getBoundingClientRect().height) / 2 + 'px';
        div.style.left = (window.innerWidth - div.getBoundingClientRect().width) / 2 + 'px';
      }
      window.requestAnimationFrame(function(domHighResTimeStamp) {
        div.style.opacity = 0.7;
      });
    };
    browser.storage.local.get('position').then(res => {
      DEBUG_ADDON && console.log(res);
      updateIconPosition(res);
    }).catch(err => {
      DEBUG_ADDON && console.log(err);
    });
    // NOTE Make sure to set element content before getting its client rect!
    DEBUG_ADDON &&
      console.log(div.getBoundingClientRect());
    let constrainClosestEdges = function(bcr) {
      let props = {};
      if (bcr.left + bcr.width / 2 > window.innerWidth / 2) {
        props.right = window.innerWidth - bcr.left - bcr.width;
      }
      else {
        props.left = bcr.left;
      }
      if (bcr.top + bcr.height / 2 > window.innerHeight / 2) {
        props.bottom = window.innerHeight - bcr.top - bcr.height;
      }
      else {
        props.top = bcr.top;
      }
	let updateStyle = function(element, props) {
	    let keys = Object.keys(props);
	    element.style.bottom = '';
	    element.style.left = '';
	    element.style.right = '';
	    element.style.top = '';
	    keys.forEach(function(prop) {
		element.style[prop] = props[prop] + 'px';
	    });
	};
	updateStyle(div, props);
	updateStyle(div.firstElementChild, props);
      return props;
    };
    div.addEventListener('click',  function (event) {
      DEBUG_ADDON && console.log(event.type, this);
      event.preventDefault();
      event.stopPropagation();
      if (this.firstElementChild.style.display == 'none') {
        this.firstElementChild.style.display = 'block';
        this.querySelector('span').style.display = 'none';
      }
      else {
        this.firstElementChild.style.display = 'none';
        this.querySelector('span').style.display = 'inline';
      }
      if (listener) {
        listener(event);
      }
    });
    let moved = false;
    if (true && "touch works on android too") {
      div.addEventListener('touchstart', function (event) {
        DEBUG_ADDON && console.log(event.type);
        event.preventDefault();
        event.stopPropagation();
        div.style.transition = '';
      });
      div.addEventListener('touchmove', function (event) {
        DEBUG_ADDON && console.log(event.type);
        event.preventDefault();
        event.stopPropagation();
          moved = true;
        var touchX = event.touches[event.touches.length - 1].clientX;
        var touchY = event.touches[event.touches.length - 1].clientY;
        div.style.left = (touchX - div.offsetWidth / 2) + 'px';
        div.style.top = (touchY - div.offsetHeight / 2) + 'px';
      });
      div.addEventListener('touchend', function (event) {
        DEBUG_ADDON && console.log(event.type);
        event.preventDefault();
        event.stopPropagation();
        // (event.currentTarget == div) && event.preventDefault();
        // Can't get this.getBoundingClientRect() to return a non-empty object.
        let bcr = new DOMRect();
        bcr = div.getBoundingClientRect();
        if (moved) {
          div.firstElementChild.style.display = 'block';
          browser.storage.local.set({
            position: constrainClosestEdges(bcr)
          }).then(res => {
            DEBUG_ADDON && console.log(res);
          }).catch(err => {
            DEBUG_ADDON && console.log(err);
          });
          // div.firstElementChild.style.display = 'none';
        var touchX = event.changedTouches[event.changedTouches.length - 1].clientX;
        var touchY = event.changedTouches[event.changedTouches.length - 1].clientY;
          if (touchX > window.innerWidth / 2) {
            this.firstElementChild.style.right = `${window.innerWidth - touchX}px`;
          }
          else {
            this.firstElementChild.style.left = `${touchX}px`;
          }
          if (touchY > window.innerHeight / 2) {
            this.firstElementChild.style.bottom = `${window.innerHeight - touchY}px`;
          }
          else {
            this.firstElementChild.style.top = `${touchY}px`;
          }
          moved = false;
        }
        event.target.click();
      });
    }
    if (true && "mouse for desktop without touchscreen") {
      div.addEventListener('mousedown', function (event) {
        // Avoid losing current text selection (used by fly menu entry).
        event.preventDefault();
        event.stopPropagation();
        DEBUG_ADDON && console.log(event.type);
        div.style.transition = '';
      });
      div.addEventListener('mousemove', function (event) {
        DEBUG_ADDON && console.log(event.type, event);
        if (event.buttons == 1 && (event.movementX || event.movementY)/* && event.currentTarget === move*/) {
          moved = true;
          DEBUG_ADDON && console.log(event.movementX, event.movementY);
          div.style.left = (event.clientX - div.offsetWidth / 2) + 'px';
          div.style.top = (event.clientY - div.offsetHeight / 2) + 'px';
        }
      });
      div.addEventListener('mouseup', function (event) {
        DEBUG_ADDON && console.log(event.type);
        let bcr = new DOMRect();
        bcr = div.getBoundingClientRect();
        if (moved) {
          div.firstElementChild.style.display = 'block';
          browser.storage.local.set({
            position: constrainClosestEdges(bcr)
          }).then(res => {
            DEBUG_ADDON && console.log(res);
          }).catch(err => {
            DEBUG_ADDON && console.log(err);
          });
          if (event.clientX > window.innerWidth / 2) {
            this.firstElementChild.style.right = `${window.innerWidth - event.clientX}px`;
          }
          else {
            this.firstElementChild.style.left = `${event.clientX}px`;
          }
          if (event.clientY > window.innerHeight / 2) {
            this.firstElementChild.style.bottom = `${window.innerHeight - event.clientY}px`;
          }
          else {
            this.firstElementChild.style.top = `${event.clientY}px`;
          }
          moved = false;
        }
      });
    }
    return div;
  }
  if (typeof window !== 'undefined') {
    window.setupIcon = setupIcon;
  }
})();
