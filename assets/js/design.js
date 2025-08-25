document.addEventListener('DOMContentLoaded', () => {
	const maxLength = 100;
	const textElement = document.querySelector(
		'.widget--list__box.is--message .text'
	);

	if (textElement) {
		const initialText = textElement.textContent;
		if (initialText.length > maxLength) {
			const truncatedText = initialText.slice(0, maxLength).trimEnd();
			textElement.textContent = truncatedText + '...';
		}
	}
});
