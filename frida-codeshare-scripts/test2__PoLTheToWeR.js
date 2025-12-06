
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-906850090 @PoLTheToWeR/test2
Java.perform(function () {
    const SensorManager = Java.use("android.hardware.SensorManager");
    const Sensor = Java.use("android.hardware.Sensor");

    // Hook getDefaultSensor to make it look like all sensors are available
    SensorManager.getDefaultSensor.overload('int').implementation = function (type) {
        console.log("Intercepted getDefaultSensor for type: " + type);

        // Return a non-null Sensor object to spoof sensor availability
        const sensor = this.getDefaultSensor(type);
        if (sensor === null) {
            console.log("Spoofing sensor type: " + type);
            const fakeSensor = Sensor.$new();
            return fakeSensor;  // Return a dummy Sensor object
        }
        return sensor;
    };

    // Hook registerListener to pretend the sensors are providing data
    SensorManager.registerListener.overload(
        "android.hardware.SensorEventListener",
        "android.hardware.Sensor",
        "int"
    ).implementation = function (listener, sensor, delay) {
        console.log("Spoofing sensor data for sensor: " + sensor.getType());

        // Call the original registerListener method
        const result = this.registerListener(listener, sensor, delay);

        // Mock data for each sensor type
        if (sensor.getType() === Sensor.TYPE_ACCELEROMETER) {
            setTimeout(function () {
                sendSensorData(listener, [0.0, 9.8, 0.0]);  // Example values for gravity
            }, 1000);
        } else if (sensor.getType() === Sensor.TYPE_GYROSCOPE) {
            setTimeout(function () {
                sendSensorData(listener, [0.1, 0.2, 0.3]);  // Example rotation values
            }, 1000);
        } else if (sensor.getType() === Sensor.TYPE_MAGNETIC_FIELD) {
            setTimeout(function () {
                sendSensorData(listener, [30.0, 60.0, 90.0]);  // Example magnetic field values
            }, 1000);
        }

        return result;
    };

    // Helper function to simulate sensor event data
    function sendSensorData(listener, values) {
        Java.scheduleOnMainThread(function () {
            const SensorEvent = Java.use("android.hardware.SensorEvent");
            const sensorEvent = SensorEvent.$new(values.length);
            sensorEvent.values = values;
            listener.onSensorChanged(sensorEvent);
            console.log("Sent spoofed sensor data: " + values);
        });
    }

    console.log("Sensor check bypass set up successfully.");
});

Java.perform(() => {
    const WifiInfo = Java.use("android.net.wifi.WifiInfo");
    const NetworkInfo = Java.use("android.net.NetworkInfo");

    // Spoof MAC address to look like a real device
    WifiInfo.getMacAddress.implementation = function () {
        console.log("Spoofing MAC address check");
        return "00:11:22:33:44:55";  // Typical MAC format
    };

    // Spoof IP address to a typical LAN address
    WifiInfo.getIpAddress.implementation = function () {
        console.log("Spoofing IP address check");
        return 3232235777;  // Represents 192.168.1.1 in integer format
    };

    // Spoof network connection state to always connected
    NetworkInfo.isConnected.implementation = function () {
        console.log("Spoofing network connection state");
        return true;
    };
});

Java.perform(function () {
    const File = Java.use("java.io.File");

    File.exists.implementation = function () {
        const path = this.getAbsolutePath();
        if (path.includes("qemu_pipe") || path.includes("genyd") || path.includes("libc_malloc_debug_qemu")) {
            console.log(`Bypassing file check for ${path}`);
            return false;  // Pretend the file doesn’t exist
        }
        return this.exists();
    };
});

Java.perform(() => {
    const SystemProperties = Java.use("android.os.SystemProperties");

    SystemProperties.get.overload("java.lang.String").implementation = function (key) {
        if (key === "ro.kernel.qemu") {
            console.log(`Bypassing check on property: ${key}`);
            return "0";  // Pretend it's not an emulator
        } else if (key === "ro.hardware") {
            return "qcom";  // Common hardware identifier
        } else if (key === "ro.product.device") {
            return "Pixel_4";  // Typical physical device model
        }
        return this.get(key);
    };
});
//https://github.com/zengfr/frida-codeshare-scripts QQGroup: 143824179 .
//hash:-906850090 @PoLTheToWeR/test2
