const { Telegraf, Markup } = require("telegraf");

const yesNoKeyboard = (buttons) => {
    // console.log(buttons)
    return Markup.inlineKeyboard([
        buttons.map(button => Markup.button.callback(button, button))
    ])
}

exports.yesNoKeyboard = yesNoKeyboard;