import Radar from 'radar-sdk-js';
Radar.initialize(import.meta.env.VITE_RADAR);

self.onmessage = async (event) => {
    const data = event.data;

    const sensorsValue = await Promise.all(data.map(async (item: { latSensor: any; longSensor: any; nameGas: any; }) => {
        let city = '';
        await Radar.reverseGeocode({ latitude: item.latSensor, longitude: item.longSensor })
            .then((result: { addresses: any; }) => {
                const { addresses } = result;
                let formattedAddress = addresses[0]?.formattedAddress || '';
                let addressParts = formattedAddress.split(',');
                if (addressParts.length >= 2) {
                    city = addressParts[0].trim() + ' | ' + addressParts[1].trim();
                } else {
                    city = formattedAddress;
                }
            })
            .catch((err: any) => {
                // handle error
            });

        return { name: item.nameGas, city: city };
    }));

    // Send the reverse geocoded sensor data back to the main thread
    self.postMessage(sensorsValue);
};
