import Cloud from './cloud';

self.onmessage = (event: MessageEvent<OffscreenCanvas>) => {
	const context = event.data.getContext('2d');
	if (!context) {
		throw new Error('Canvas 2D context is unavailable');
	}
	Cloud.drawCloud(context);
	self.postMessage({ type: 'complete' });
};
