// Builds a URL with every value encoded
const withQuery = (base, params) => {
    const query = Object.entries(params)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&');

    return `${base}?${query}`;
};

// Fetches JSON; a refusal becomes an error that names the service
const getJson = async (fetchFn, url, options, service) => {
    const response = await fetchFn(url, options);

    if (!response.ok) {
        throw new Error(`${service} answered ${response.status}`);
    }

    return response.json();
};

export { withQuery, getJson }
