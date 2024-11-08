import axios from "axios";
import { join } from "path";
import { createBot, createFlow, addKeyword } from "@builderbot/bot";
import { BaileysProvider as Provider } from "@builderbot/provider-baileys";
import cors from "cors";
import { IDatabase, adapterDB } from "./database";
import { adapterProvider } from "./wppconect";

const PORT = process.env.PORT ?? 3008;

// const fetchDataFromAppsScript = async () => {
//   try {
//     const response = await axios.get(
//       "https://script.google.com/macros/s/AKfycbyD9u_jcX2z_hK_ZDf5SLqdzIiF0ygyKkFIAE4LUevR4q48aLLgTkQdX8_LBqUSR4H_/exec"
//     );
//     return response.data; // Assuming the endpoint returns JSON
//   } catch (error) {
//     console.error("Error fetching data from Apps Script:", error);
//     return null;
//   }
// };

const welcomeFlow = addKeyword<Provider, IDatabase>(["hi", "hello", "hola"])
  .addAnswer(`🙌 Bienvenido a Goa *007*`)
  .addAnswer("Menu", {
    media: "https://i.postimg.cc/DyHm5HWJ/PHOTO-2024-11-03-20-51-15-2.jpg",
  });

const menuFlow = addKeyword<Provider, IDatabase>(["menu"]).addAnswer("Menu", {
  media: "https://i.postimg.cc/DyHm5HWJ/PHOTO-2024-11-03-20-51-15-2.jpg",
});
// const registerFlow = addKeyword<Provider, IDatabase>(
const main = async () => {
  const adapterFlow = createFlow([welcomeFlow, menuFlow]);

  adapterProvider.server.use(cors("*"));

  const { handleCtx, httpServer } = await createBot({
    flow: adapterFlow,
    provider: adapterProvider,
    database: adapterDB,
  });

  adapterProvider.server.post(
    "/v1/first-contact",
    handleCtx(async (bot, req, res) => {
      const { number } = req.body;
      await bot.sendMessage(number, "hola bienvenido a Goa", {});
      return res.end("sended");
    })
  );
  adapterProvider.server.post(
    "/v1/messages",
    handleCtx(async (bot, req, res) => {
      const { number, message } = req.body;
      await bot.sendMessage(number, message, {});
      return res.end("sended");
    })
  );


  adapterProvider.server.post(
    "/v1/blacklist",
    handleCtx(async (bot, req, res) => {
      const { number, intent } = req.body;
      if (intent === "remove") bot.blacklist.remove(number);
      if (intent === "add") bot.blacklist.add(number);

      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ status: "ok", number, intent }));
    })
  );

  httpServer(+PORT);
};

main();
