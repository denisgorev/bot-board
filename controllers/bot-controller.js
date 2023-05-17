const { Telegraf } = require("telegraf");

const { Scenes, Stage, session } = require("telegraf");
const Broadcast = require("../models/broadcast");
const Role = require("../models/role");
const Script = require("../models/script");
const User = require("../models/user");
const { yesNoKeyboard } = require("../utils/keyboards");

const bot = new Telegraf(process.env.TOKEN);

const boardGameBot = () => {
  const startDataWizard = new Scenes.WizardScene(
    "start",
    async (ctx) => {
      // bot.start(async (ctx) => {
      ctx.replyWithHTML(
        `Привет, ${ctx.from.first_name}! Добро пожаловать в игру!`

        //   <A href="tg://user?id={числовой id}">link</a>`
      );
      let roles, role;
      let roles_name = [];
      try {
        roles = await Role.find({});
        for (i in roles) {
          // console.log(roles[i].role_name)
          roles_name.push(roles[i].role_name);
        }
      } catch (err) {
        console.log(err);
      }

      ctx.reply("Для начала выберите Вашу роль", yesNoKeyboard(roles_name));
      ctx.wizard.state.data = {};
      return ctx.wizard.next();
    },

    async (ctx) => {
      if (ctx.callbackQuery) {
        ctx.wizard.state.data.role = ctx.callbackQuery.data;
        ctx.reply(
          `Отлично, я тебя зарегистрировал, в картотеке НКВД ты проходишь как ${ctx.callbackQuery.data}`
        );

        let user = [];

        try {
          user = await User.find({
            chatId: ctx.chat.id,
          });

          if (user.length === 0) {
            if (ctx.from.username) {
              let newUser = new User({
                name: ctx.from.username,
                chatId: ctx.chat.id,
                role: ctx.wizard.state.data.role,
              });
              await newUser.save();
            } else {
              let newUser = new User({
                name: ctx.from.first_name,
                chatId: ctx.chat.id,
                role: ctx.wizard.state.data.role,
              });
              await newUser.save();
            }
          }
        } catch (err) {
          console.log(err);
        }
      } else {
        ctx.reply(
          "Дружище, нажимай, пожалуйста, на кнопки. Начинай регистрацию снова."
        );
      }

      return ctx.scene.leave();
    }
  );

  const contactDataWizard = new Scenes.WizardScene(
    "broadcasting",
    async (ctx) => {
      let broadcasts;
      try {
        //code: input_code
        broadcasts = await Broadcast.find({});
      } catch (err) {
        console.log(err);
      }
      let broadcastsCodes = [];
      broadcastsCodes = broadcasts.map((broadcast) => broadcast.code);

      ctx.reply(
        `введите код команды для бродкаста, доступные коды: ${broadcastsCodes}`
      );
      ctx.wizard.state.data = {};
      return ctx.wizard.next();
    },
    async (ctx) => {
      ctx.wizard.state.data.code = ctx.message.text;
      let users;
      let broadcast;
      try {
        users = await User.find({});
        broadcast = await Broadcast.find({ code: ctx.wizard.state.data.code });
      } catch (err) {
        console.log(err);
      }
      if (broadcast.length !== 0) {
        let user_list = users.map((user) => user.chatId);
        for (i in user_list) {
          bot.telegram.sendMessage(user_list[i], broadcast[0].text);
        }
      }

      return ctx.scene.leave();
    }
  );

  let personalText;
  const personalCall = new Scenes.WizardScene(
    "callpersonal",
    (ctx) => {
      ctx.reply(`введите текст для личного сообщения игроку:`);
      ctx.wizard.state.data = {};
      return ctx.wizard.next();
    },

    async (ctx) => {
      ctx.wizard.state.data.text = ctx.message.text;
      personalText = ctx.wizard.state.data.text;
      ctx.reply(`выберите игрока из списка`);
      let users;
      try {
        users = await User.find();
      } catch (err) {
        console.log(err);
      }
      let allUserNames = [];
      allUserNames = users.map((user) => ({
        name: user.name,
        id: user.chatId,
      }));
      let ids = [];
      //   console.log(allUserNames);

      allUserNames.forEach((element) => {
        ctx.reply(`имя игрока: ${element.name}, id: ${element.id}`);
        ids.push(element.id);
      });
      ctx.reply("выберите id игрока", yesNoKeyboard(ids));
      return ctx.wizard.next();
    },
    (ctx) => {
      ctx.wizard.state.data.id = ctx.callbackQuery.data;
      bot.telegram.sendMessage(ctx.wizard.state.data.id, personalText);
      ctx.reply("Отправлено!");

      return ctx.scene.leave();
    }
  );

  const stage = new Scenes.Stage([
    contactDataWizard,
    personalCall,
    startDataWizard,
  ]);

  bot.use(session());
  bot.use(stage.middleware());
  bot.command("broadcasting", (ctx) => {
    ctx.scene.enter("broadcasting");
  });

  bot.command("start", (ctx) => {
    ctx.scene.enter("start");
  });

  bot.command("callpersonal", (ctx) => {
    ctx.scene.enter("callpersonal");
  });

  bot.command("delete_users", async (ctx) => {
    try {
      await User.deleteMany({});
      ctx.replyWithHTML(`Я удалил всех игроков, я могу идти спать?`);
    } catch (err) {
      console.log(err);
    }
  });

  bot.command("help", (ctx) => {
    ctx.replyWithHTML(
      "Набор команд и их описание: \n" +
        "1. /start - команда, необходимая для запуска бота и авторизации нового игрока \n" +
        "2. /callpersonal - команда для написания личного сообщения игроку \n" +
        "3. /broadcasting - команда, позволяющая написать сообщение на всех игроков \n" +
        "4. /delete_users - команда для удаления всех пользователей из базы данных. Очень желательно не забывать ее использовать после каждой игры"
    );
  });

  bot.on("text", async (ctx) => {
    let input_code = ctx.message.text;
    let script;
    try {
      //code: input_code
      script = await Script.find({ code: input_code });
    } catch (err) {
      console.log(err);
    }
    if (script.length !== 0) {
      ctx.deleteMessage();
      ctx.reply(script[0].text, yesNoKeyboard(script[0].next_codes));
    } else {
      ctx.reply(
        `слушай, дружище, я такой команды не знаю, что еще за "${ctx.message.text}"`
      );
    }
  });

  //   bot.action(/^\d+$/, async (ctx) => {
  //     // console.log('action')
  //     let input_code = ctx.callbackQuery.data;
  //     console.log(input_code);
  //   });
  let checkButton = 0;
  
  bot.action(/.+/, async (ctx) => {

    // console.log("action");
    if (checkButton === 1) {
      // console.log("checkbutton", checkButton);
      ctx.deleteMessage();
    }

    let input_code = ctx.callbackQuery.data;
    let script;
    let user;
    try {
      script = await Script.find({ code: input_code });
      user = await User.find({ chatId: ctx.chat.id });
    } catch (err) {
      console.log(err);
    }

    if (script.length !== 0) {
      if (user.length == 0) {
        ctx.reply("Так дружище, сначала надо зарегистрироваться");
        return;
      }

      if (
        script[0].acceptable_role_codes.length == 0 ||
        script[0].acceptable_role_codes[0].includes(user[0].role)
      ) {
        checkButton = 1;
        ctx.reply(script[0].text, yesNoKeyboard(script[0].next_codes));
      } else {
        
        checkButton = 0;
        
        ctx.reply(
          "Так дружище, для твоей роли эта команда недоступна. Выбери другую и поехали дальше"
        );
     
        console.log(checkButton);
      }
    }
  });

  bot.launch(); // запуск бота
};

exports.boardGameBot = boardGameBot;
