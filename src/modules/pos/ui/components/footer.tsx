import React from 'react';

const FooterPOS = () => {
	return (
		<footer className="border-t bg-white px-6 py-3 text-center text-xs text-muted-foreground">
			&copy; {new Date().getFullYear()} Green Line Software &mdash; Food Order POS
		</footer>
	);
};

export default FooterPOS;
