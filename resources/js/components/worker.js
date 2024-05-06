self.onmessage = async (event) => {
    const data = event.data;

    const sensorsValue = await Promise.all(data.map(async (item) => {
        let city = '';
        await fetch(`https://api.radar.io/v1/geocode/reverse?coordinates=${item.latSensor},${item.longSensor}`)
            .then(response => response.json())
            .then((result) => {
                const { addresses } = result;
                let formattedAddress = addresses[0]?.formattedAddress || '';
                let addressParts = formattedAddress.split(',');
                if (addressParts.length >= 2) {
                    city = addressParts[0].trim() + ' | ' + addressParts[1].trim();
                } else {
                    city = formattedAddress;
                }
            })
            .catch((err) => {
                // handle error
            });

        return { name: item.nameGas, city: city };
    }));

    // Send the reverse geocoded sensor data back to the main thread
    self.postMessage(sensorsValue);
};
