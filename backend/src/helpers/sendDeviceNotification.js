const { Expo } = require("expo-server-sdk");
const App = require("../models/App");
const Device = require("../models/Device");

const expo = new Expo(/*{ accessToken: process.env.EXPO_ACCESS_TOKEN }*/);

module.exports = async ({ title, body, isAdmin, ids }) => {
  let messages = [];

  if (isAdmin) {
    const devices = await Device.find();

    for (let pushToken of devices) {
      pushToken = pushToken.device;
      if (!Expo.isExpoPushToken(pushToken)) {
        console.error(`Push token ${pushToken} is not a valid Expo push token`);
        continue;
      }

      messages.push({
        to: pushToken,
        sound: "default",
        title,
        body,
      });
    }
  } else {
    for (let id of ids) {
      const device = await App.findOne({ id });

      if (device) {
        if (!Expo.isExpoPushToken(device.expo)) {
          console.error(`Push token ${device.expo} is not a valid Expo push token`);
          continue;
        }
  
        messages.push({
          to: device.expo,
          sound: "default",
          title,
          body,
        });
      }
    };
  }

  let chunks = expo.chunkPushNotifications(messages);
  let tickets = [];
  (async () => {
    for (let chunk of chunks) {
      try {
        let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        console.log(ticketChunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error(error);
      }
    }
  })();

  let receiptIds = [];
  for (let ticket of tickets) {
    if (ticket.id) {
      receiptIds.push(ticket.id);
    }
  }

  let receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);
  (async () => {
    for (let chunk of receiptIdChunks) {
      try {
        let receipts = await expo.getPushNotificationReceiptsAsync(chunk);
        console.log(receipts);

        for (let receiptId in receipts) {
          let { status, message, details } = receipts[receiptId];
          if (status === "ok") {
            continue;
          } else if (status === "error") {
            console.error(
              `There was an error sending a notification: ${message}`
            );
            if (details && details.error) {
              console.error(`The error code is ${details.error}`);
            }
          }
        }
      } catch (error) {
        console.error(error);
      }
    }
  })();
};
