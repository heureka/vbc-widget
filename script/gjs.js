(function () {
	const elementID = 'heureka-vbc-widget-root';
	const initID = 'heurekaVbCWidgetInitialized';

	// new widget config
	const newWidgetStorageID = 'heurekaNewVbCWidget';
	const expirationTime = 1000 * 60 * 60 * 24; // 24 hours
	const enableFlag = 'enableNewVbCWidget';
	const disableFlag = 'disableNewVbCWidget';

	const exists = document.querySelector(elementID);

	// deduplicate init
	if (exists || window[initID]) {
		return;
	}
	window[initID] = true;

	const href = window.location.href;

	if (href.includes(enableFlag)) {
		window.localStorage.setItem(
			newWidgetStorageID,
			Date.now() + expirationTime,
		);
	}

	if (href.includes(disableFlag)) {
		window.localStorage.clear(newWidgetStorageID);
	}

	let newVbCWidgetExpiresAt = Number(
		window.localStorage.getItem(newWidgetStorageID),
	);

	if (
		newVbCWidgetExpiresAt &&
		(isNaN(newVbCWidgetExpiresAt) || newVbCWidgetExpiresAt < Date.now())
	) {
		// disable new widget if invalid value or time expired
		window.localStorage.clear(newWidgetStorageID);
		newVbCWidgetExpiresAt = null;
	}

	const iframe = document.createElement('iframe');
	iframe.id = elementID;
	iframe.setAttribute('allowtransparency', 'true');
	iframe.setAttribute('frameBorder', 0);
	iframe.setAttribute('scrolling', 'no');
	iframe.style.position = 'fixed';
	iframe.style.left = '0';
	iframe.style.top = '50%';
	iframe.style.zIndex = '10000';
	iframe.style.transform = 'translateY(-50%)';

	if (newVbCWidgetExpiresAt) {
		console.log('new widget loaded');
		iframe.src = 'http://localhost:8000/widget.html';
	} else {
		iframe.src = 'http://localhost:8000/old-widget.html';
	}

	document.body.appendChild(iframe);
})();
