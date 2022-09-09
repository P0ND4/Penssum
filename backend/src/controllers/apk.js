const Device = require("../models/Device");
const ctrl = {};

ctrl.addDevice = async (req, res) => {
  const { deviceID } = req.body;

  const device = await Device.findOne({ device: deviceID });

  if (!device) {
    const newDevice = new Device({ device: deviceID });
    await newDevice.save();
  };

  res.send(!device ? `Registered device: ${deviceID}` : 'Device already registered');
};

module.exports = ctrl;
