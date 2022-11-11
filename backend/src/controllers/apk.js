const Device = require("../models/Device");
const App = require("../models/App");
const { randomName } = require("../helpers/libs");
const sendEmail = require("../helpers/sendEmail");

const ctrl = {};

ctrl.addDevice = async (req, res) => {
  const { deviceID } = req.body;

  const device = await Device.findOne({ device: deviceID });

  if (!device) {
    const newDevice = new Device({ device: deviceID });
    await newDevice.save();
  }

  res.send(
    !device ? `Registered device: ${deviceID}` : "Device already registered"
  );
};

ctrl.verificationCode = async (req, res) => {
  const { email, name } = req.body;

  const CODE = randomName(6, { Number: true });

  const contentHTML = `
        <div style="width: 100%; margin: 0;" >
            <img src="cid:penssum" style="display: block; margin: 20px auto; width: 120px; border-radius: 16px;" />
            <p style="display: block; width: 90%; margin: 0 auto; text-align: center; font-family: sans-serif; font-size: 22px; color: #666;">
                Hola, ${name}: <br/><br/>
                Por favor digite este código para finalizar su registro: <br/><br/>
                <div style="display: block; text-align: center;">
                    <div style="display: inline-block; padding: 0 20px; border-radius: 12px; border: 1px solid #0F4C75; background: #3282B822;">
                        <p style="font-size: 16px;"><b>${CODE}</b></p>
                    </div>
                </div>
            </p>
            <p style="display: block; width: 90%; margin: 0 auto; color: #666; font-size: 18px; text-align: center;"><b>¿No se ha registrado en penssum?</b><br/> puede ignorar este correo.</p>
            <footer style="width: 100%; margin-top: 20px;">
                <p style="display: block; width: 90%; margin: 0 auto; color: #666; font-size: 18px; text-align: center;">Síguenos en nuestras redes sociales</p>
                <div style="display: block; width: 90%; margin: 20px auto; color: #666; font-size: 18px; text-align: center;">
                  <a href="https://www.facebook.com/Penssum-103217072423786/" style="margin: 0 10px"><img src="cid:facebook" style="width: 35px; height: 35px;"/></a>
                  <a href="https://twitter.com/penssum?t=seJ7n3XjHGKSx8zNBLexmQ&s=09" style="margin: 0 10px"><img src="cid:twitter" style="width: 35px; height: 35px;"/></a>
                  <a href="https://www.instagram.com/penssum/" style="margin: 0 10px"><img src="cid:instagram" style="width: 35px; height: 35px;"/></a>
                </div>
              </footer>
        </div>
    `;

  const informationToSend = {
    to: email,
    subject: `Tu código de verificación es ${CODE}`,
    html: contentHTML,
    attachments: [
      {
        filename: "penssum-transparent.png",
        path: `${process.env.API_PENSSUM}/penssum-transparent.png`,
        cid: "penssum",
      },
      {
        filename: "facebook.png",
        path: `${process.env.API_PENSSUM}/facebook.png`,
        cid: "facebook",
      },
      {
        filename: "instagram.png",
        path: `${process.env.API_PENSSUM}/instagram.png`,
        cid: "instagram",
      },
      {
        filename: "twitter.png",
        path: `${process.env.API_PENSSUM}/twitter.png`,
        cid: "twitter",
      },
    ],
  };

  const result = await sendEmail(informationToSend);

  res.send({ code: CODE, message: result });
};

ctrl.newUser = async (req, res) => {
  const { id, expo } = req.body;
  console.log(id);

  const user = await App.findOne({ id });

  if (!user) {
    const newUser = new App({ id, expo });
    await newUser.save();
  } else await App.findByIdAndUpdate(user._id, { id, expo });

  res.send(!user ? `Registered device: ${expo}` : "Device updated");
};

module.exports = ctrl;
