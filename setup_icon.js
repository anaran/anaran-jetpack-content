(function () {
  const DEBUG_ADDON = true;
  function setupIcon(iconId, emitMessage, data, listener) {
    DEBUG_ADDON &&
      console.log("self.port.on show", self);
    DEBUG_ADDON &&
      console.log("data", data);
    var div = document.getElementById(iconId);
    if (div) {
      document.body.removeChild(div);
    }
    var efp = document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2);
    div = document.createElement('div');
    // var lastStyle = window.getComputedStyle(document.body.firstChild);
    div.style.position = 'fixed';
    // console.log(efp, window.getComputedStyle(efp));
    // div.style.background = 'transparent';
    let bodyBC = 'white';
    let efpBC = 'transparent';
    if (document && 'body' in document) {
      window.getComputedStyle(document.body).backgroundColor;
      window.getComputedStyle(efp).backgroundColor;
    }
    div.style.backgroundColor = (efpBC == 'transparent' ? bodyBC : efpBC);
    div.style.color = window.getComputedStyle(efp).color;
    div.style.padding = '0';
    div.style.width = '48px';
    div.style.height = '48px';
    div.style.fontSize = 'large';
    div.style.backgroundImage = `url('${chrome.extension.getURL(data.icon)}')`;
    div.style.borderRadius = '3px';
    div.style.borderColor = div.style.color;
    // div.style.border = '2px solid';
    // window.getComputedStyle(document.querySelector('a')).backgroundColor;
    // a.style.color = lastStyle.backgroundColor;
    // div.style.fontSize = window.getComputedStyle(document.querySelector('h1') || document.querySelector('h2') || document.querySelector('body')).fontSize;
    // div.style.fontSize = 'x-large';
    div.id = iconId;
    // window.alert(JSON.stringify(match, Object.getOwnPropertyNames(match), 2));
    //       knownSites[value].reporter(match[0]);
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
      // div.style.transition = 'left 0.5s linear 0s, top 0.5s linear 0s';
      // div.style.top = (window.innerHeight - div.getBoundingClientRect().height) / 2 + 'px';
      // div.style.left = "-40em";
      window.requestAnimationFrame(function(domHighResTimeStamp) {
        div.style.opacity = 0.7;
      });
    };
    browser.storage.local.get().then(res => {
      updateIconPosition(res);
    }).catch(err => {
      console.log(err);
    });
    // self.port.on('updateIconPosition', updateIconPosition);
    // NOTE Make sure to set element content before getting its client rect!
    DEBUG_ADDON &&
      console.log(div.getBoundingClientRect());
    div.addEventListener('click', listener || function (event) {
        // console.log("selection", window.getSelection().toString());
        event.preventDefault();
        event.stopPropagation();
        // if (this.children[0].style.display == 'none') {
        //   this.children[0].style.display = 'inline-block';
        // }
        // else {
        //   this.children[0].style.display = 'none';
      if (this.firstElementChild.style.display == 'none') {
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
        this.firstElementChild.style.display = 'inline-block';
      }
        else {
          this.firstElementChild.style.display = 'none';
        }
      });
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
	// reportError({bcr: bcr, props: props});
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
    // NOTE: See 
    // [1207595 – draggable APIs should not exist on elements until drag and drop is implemented on Android](https://bugzil.la/1207595)
    // reportError({"'draggable' in div": 'draggable' in div});
    if ('draggable' in div && "drag and drop") {
      // '<meta name="viewport" content="width=device-width,user-scalable=no">';
      // let meta = document.createElement('meta');
      // meta.name = 'viewport';
      // meta.content = 'width=device-width,initial-scale=1.0,user-scalable=no';
      // document.head.appendChild(meta);
      div.setAttribute('draggable', true);
      div.setAttribute('dropzone', 'move string:text/plain');
      div.setAttribute('title', 'drop me in place');
      // div.addEventListener('click', function (e) {
      //   reportError({ 'click': [ div.style.left, div.style.top ]});
      // });
      div.addEventListener('dragstart', function (e) {
        // e.stopPropagation();
        // e.preventDefault();
        // NOTE: the initial transition (the make the overlay noticed)
        // interferes with dragging it.
        div.style.transition = '';
        // e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', 'ok');
        // reportError('dragstart');
      });
      div.addEventListener('dragover', function (e) {
        e.stopPropagation();
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        e.dataTransfer.effectAllowed = 'move';
        // if (e.buttons == 1/* && e.currentTarget === move*/) {
        div.style.left = (e.clientX - div.offsetWidth / 2) + 'px';
        div.style.top = (e.clientY - div.offsetHeight / 2) + 'px';
        // reportError({ 'dragover': [ div.style.left, div.style.top ]});
        // }
      });
      div.addEventListener('drop', function (e) {
        e.stopPropagation();
        e.preventDefault();
        // reportError({ 'drop': [ div.style.left, div.style.top ]});
        e.dataTransfer.dropEffect = 'none';
        // e.dataTransfer.clearData();
        let bcr = new DOMRect();
        bcr = this.getBoundingClientRect();
        // reportError({ 'bcr': bcr, 'drop': [ div.style.left, div.style.top ]});
        // self.port.emit(emitMessage, constrainClosestEdges(bcr));
        browser.storage.local.set({
          position: constrainClosestEdges(bcr)
        }).then(res => {
          console.log(res);
        }).catch(err => {
          console.log(err);
        })
      });
    }
    if (true && "touch works on android too") {
      div.addEventListener('touchstart', function (e) {
        // (e.currentTarget == div) && e.preventDefault();
        div.style.transition = '';
        // reportError({ 'touchstart': [ div.style.left, div.style.top ]});
      });
      div.addEventListener('touchend', function (e) {
        // (e.currentTarget == div) && e.preventDefault();
        // Can't get this.getBoundingClientRect() to return a non-empty object.
        let bcr = new DOMRect();
        bcr = div.getBoundingClientRect();
        // reportError({ 'bcr': bcr, 'touchend': [ div.style.left, div.style.top ]});
        // self.port.emit(emitMessage, constrainClosestEdges(bcr));
        browser.storage.local.set({
          position: constrainClosestEdges(bcr)
        }).then(res => {
          console.log(res);
        }).catch(err => {
          console.log(err);
        })
      });
      div.addEventListener('touchmove', function (e) {
        // if ((e.clientX - taExtensions.offsetTop) < taExtensions.offsetHeight * 0.9 || (e.clientX - taExtensions.offsetLeft) < taExtensions.offsetWidth * 0.9) {
        var touchX = e.touches[e.touches.length - 1].clientX;
        var touchY = e.touches[e.touches.length - 1].clientY;
        // e.stopPropagation();
        // e.preventDefault();
        // e.dataTransfer.dropEffect = 'move';
        // e.dataTransfer.effectAllowed = 'move';
        // if (e.buttons == 1/* && e.currentTarget === move*/) {
        div.style.left = (touchX - div.offsetWidth / 2) + 'px';
        div.style.top = (touchY - div.offsetHeight / 2) + 'px';
        // reportError({ 'touchmove': [ div.style.left, div.style.top ]});
        // }
        // }
      });
    }
    if (false && "mouse for desktop without touchscreen") {
      div.addEventListener('mousedown', function (e) {
        // if ((e.currentTarget == div)) {
        e.preventDefault();
        div.style.transition = '';
        // reportError({ 'mousedown': [ div.style.left, div.style.top ]});
        // }
      });
      div.addEventListener('mouseup', function (e) {
        // if ((e.currentTarget == div)) {
        e.preventDefault();
        // Can't get this.getBoundingClientRect() to return a non-empty object.
        let bcr = new DOMRect();
        bcr = this.getBoundingClientRect();
        // self.port.emit(emitMessage, {
        //   left: this.style.left,
        //   right: this.style.right,
        //   top: this.style.top,
        //   bottom: this.style.bottom,
        //   width: this.style.width,
        //   height: this.style.height
        // });
        browser.storage.local.set({
          position: {
            left: this.style.left,
            right: this.style.right,
            top: this.style.top,
            bottom: this.style.bottom,
            width: this.style.width,
            height: this.style.height
          }
        }).then(res => {
          console.log(res);
        }).catch(err => {
          console.log(err);
        })
        // reportError({ 'mouseup': [ div.style.left, div.style.top ]});
        // }
      });
      div.addEventListener('mousemove', function (e) {
        // if ((e.currentTarget == div)) {
        // if ((e.clientX - taExtensions.offsetTop) < taExtensions.offsetHeight * 0.9 || (e.clientX - taExtensions.offsetLeft) < taExtensions.offsetWidth * 0.9) {
        // e.stopPropagation();
        e.preventDefault();
        // e.dataTransfer.dropEffect = 'move';
        // e.dataTransfer.effectAllowed = 'move';
        if (e.buttons == 1/* && e.currentTarget === move*/) {
          div.style.left = (e.clientX - div.offsetWidth / 2) + 'px';
          div.style.top = (e.clientY - div.offsetHeight / 2) + 'px';
          // reportError({ 'mousemove': [ div.style.left, div.style.top ]});
        }
        // }
        // }
      });
    }
    return div;
  }
  if (typeof window !== 'undefined') {
    window.setupIcon = setupIcon;
  }
})();
