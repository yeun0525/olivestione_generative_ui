document.addEventListener('DOMContentLoaded', () => {
	const maxLength = 100;
	const textElement = document.querySelector(
		'.widget--list__box.is--message .text'
	);

	const enforceLength = (event) => {
		const value = event.target.textContent;
		if (value.length > maxLength) {
			event.target.textContent = value.slice(0, maxLength);
		}
	};

	const initialText = textElement.textContent;
	if (initialText.length > maxLength) {
		textElement.textContent = initialText.slice(0, maxLength) + '...';
	}
});
