self.onmessage = async (event) => {
    const data = event.data;

    const sensorsValue = await Promise.all(data.map(async (item: { latSensor: any; longSensor: any; nameGas: any; }) => {
        let city = '';
        const response = await fetch(`https://browse.search.hereapi.com/v1/browse?at=${item.latSensor},${item.longSensor}&apiKey=${import.meta.env.VITE_HERE_API_KEY}`);
        const data = await response.json();
        const address = data.items[0]?.address;
        if (address) {
            city = `${address.city} | ${address.state}`;
        }

        return { name: item.nameGas, city: city };
    }));

    // Send the reverse geocoded sensor data back to the main thread
    self.postMessage(sensorsValue);
};
