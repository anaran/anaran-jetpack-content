(function () {
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
	}
})();
