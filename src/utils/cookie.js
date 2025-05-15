const setCookieFunction = (name, value) => {
		let expires = "";
		document.cookie = name + "=" + value;

	};

	// Function to get a cookie by name
	const getCookie = (name) => {
		const value = `; ${document.cookie}`;
		const parts = value.split(`; ${name}=`);
		if (parts.length === 2) return parts.pop().split(";").shift();
		return null;
	};

	// Function to update the cookie
	const updateCookie = () => {
		setCookieFunction("custom-cookie", username, 7); // Set cookie for 7 days
	};

	// Function to retrieve cookie and display it
	const displayCookie = () => {
		const customCookie = getCookie("custom-cookie");
		if (customCookie) {
			setMessage(`Retrieved Cookie Value: ${customCookie}`);
		} else {
			setMessage('No cookie found with the name "custom-cookie".');
		}
	};