const { TelegramClient, Api } = require("telegram");
const { StringSession } = require("telegram/sessions");
const input = require("input");
const axios = require('axios');
const { NewMessage } = require('telegram/events');
const { Buffer } = require('buffer');
const moment = require('moment-timezone');


const apiId = 18706792;
const apiHash = "0f217ac2718c12bb46609c8300dc92d5";
const stringSession = new StringSession("1BAAOMTQ5LjE1NC4xNjcuOTEAUFqjzisSRj4Pmfi28NQWebPn2w21hwKF6t2l/hiDKq4JyVSnB9x3nSPNcl83/Ron2URxR7jBfCT/GwuEGZF4OOhzm/OBIGDvNA69jruC/YFFqbUNIpZoruFYVGs4FTj/8XfmVBreUGKz0EdhAoxI28CH791tl1lCptjlF/y6yzoYfAUtFnXciGmU3ewzJ+tNuMTN3gjOoQbi66QkDr/28XazNEo2lOFPnpyZBt7ZHGnp89u6jhoWxhm8R1mSLlkHG0WSd2HyVkQzi1Lfrj5bgRr8zAn1jVpeOmEsIsV9GjFcqihlkrHVzE2oNjq8vOsuuMKkIgdsrpEv/m8KOyyXbDw=");

(async () => {
  console.log("Loading interactive example...");
  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
  });
  await client.start({
    phoneNumber: async () => await input.text("Please enter your number: "),
    password: async () => await input.text("Please enter your password: "),
    phoneCode: async () =>
      await input.text("Please enter the code you received: "),
    onError: (err) => console.log(err),
  });
  console.log("You should now be connected.");
  console.log(client.session.save());

  client.addEventHandler(async (event) => {
    if (event.message && event.message.text.startsWith('gpt>')) {
      const text = event.message.text.slice(4);
      try {
        const response = await axios.post('https://chatgpt-api3.onrender.com', {
          text: text
        });

        if (response.status === 200) {
          const apiMessage = response.data.message;
          await client.sendMessage(event.message.chatId, { message: apiMessage, replyTo: event.message.id });

          // Create a buffer from the result
          const resultBuffer = Buffer.from(apiMessage, 'utf-8');

          // Send the buffer as a file
          await client.sendFile(event.message.chatId, { file: resultBuffer, caption: 'Your result as file', replyTo: event.message.id });
        }
      } catch (error) {
        console.error(error);
      }
    }
  }, new NewMessage({}));

  await client.sendMessage("me", { message: "Mystae is on!" });

  setInterval(async () => {
    const time = moment().tz('Asia/Tehran').format('HH:mm');
    const result = await client.invoke(new Api.account.UpdateProfile({
      about: `Time: ${time}`
    }));
    console.log(result);
  }, 30000);

})();