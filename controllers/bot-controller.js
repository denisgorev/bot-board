const { Telegraf } = require("telegraf");
const Script = require('../models/script')

const bot = new Telegraf(process.env.TOKEN)

const boardGameBot =  () => {
    bot.start((ctx) =>
    ctx.replyWithHTML(
      `Привет, ${ctx.from.first_name}! Меня зовут Виктор, и я дилер в этом казино. Не хочешь сыграть?

      XGB – Ты как мешаешь? 
      SDF – Ай фак ёр булщит 
      OKL – Этот колоду чешет... `
      )
  );
  bot.on('text', async (ctx) => {
    let input_code = ctx.message.text
    let script
    console.log(input_code)
    try {
        //code: input_code
        script = await Script.find({code: input_code})

    } catch (err) {
        console.log(err);
      }

      console.log(script)
    ctx.reply(script[0].text)

})
// bot.on('text', ctx => {
//     let btc_address = ctx.message.text
//     ctx.replyWithHTML(
//         btc_address
//       )
// })
bot.launch(); // запуск бота

}

exports.boardGameBot = boardGameBot;