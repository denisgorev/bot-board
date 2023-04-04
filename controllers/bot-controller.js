const { Telegraf } = require("telegraf");

const bot = new Telegraf(process.env.TOKEN)

const boardGameBot = () => {
    bot.start((ctx) =>
    ctx.replyWithHTML(
      `Привет, ${ctx.from.first_name}! Меня зовут Виктор, и я дилер в этом казино. Не хочешь сыграть?

      XGB – Ты как мешаешь? 
      SDF – Ай фак ёр булщит 
      OKL – Этот колоду чешет... `
      )
  );
  bot.hears('XGB', ctx => {
    ctx.reply('Мешаю так, чтобы честно было. А если какие вопросы будут - сразу можешь к боссу сходить. Не факт, что живым вернешься')
})
bot.on('text', ctx => {
    let btc_address = ctx.message.text
    ctx.replyWithHTML(
        btc_address
      )
})
bot.launch(); // запуск бота

}

exports.boardGameBot = boardGameBot;