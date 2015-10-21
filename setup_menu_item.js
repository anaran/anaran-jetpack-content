(function () {
  function setupMenu(div, data) {
    var menu = div.appendChild(document.createElement('div'));
    menu.style.position = 'fixed';
    menu.className = 'menu';
    menu.style.display = 'none';
    menu.style.opacity = 0.7;
    // menu.style.backgroundColor = (efpBC == 'transparent' ? bodyBC : efpBC);
    menu.style.borderRadius = '3px';
    menu.style.borderColor = menu.style.color;
    menu.style.border = '2px solid';
    let divClose = document.createElement('span');
    let close = document.createElement('a');
    close.href = 'close';
    close.innerHTML = '&times;'
    close.addEventListener('click', function(event) {
      event.preventDefault();
      event.target.parentElement.parentElement.parentElement.removeChild(event.target.parentElement.parentElement);
    });
    divClose.appendChild(close);
    div.appendChild(divClose);
    return menu;
  }
  function setupMenuItem(menu, href, text, listener) {
    let item = menu.appendChild(document.createElement('div')).appendChild(document.createElement('a'));
    item.style.display = 'inline-block';
    item.textContent = text;
    item.href = href;
    item.addEventListener('click', listener || function (event) {
      event.preventDefault();
      event.stopPropagation();
      self.port.emit(href);
    });
  }
  if (typeof window !== 'undefined') {
    window.setupMenuItem = setupMenuItem;
    window.setupMenu = setupMenu;
  }
})();
