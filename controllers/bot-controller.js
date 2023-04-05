const { Telegraf } = require("telegraf");

const { Scenes, Stage, session } = require ('telegraf');
const Broadcast = require("../models/broadcast");


const Script = require("../models/script");
const User = require('../models/user')


const bot = new Telegraf(process.env.TOKEN);



const boardGameBot = () => {
  bot.start(async (ctx) => {
   
    ctx.replyWithHTML(
      `Привет, ${ctx.from.first_name}! Меня зовут Виктор, и я дилер в этом казино. Не хочешь сыграть?`
    );
    let user = []
        // console.log(ctx.from, ctx.chat.id)
    try {
        user = await User.find({
            chatId: ctx.chat.id
        })
        console.log(user)

        if (user.length === 0) {
            // console.log(user)
            let newUser = new User ({
                name: ctx.from.first_name,
                chatId: ctx.chat.id
            })
            await newUser.save()
            
        }
    } catch (err) {
        console.log(err);
      }

    // console.log(ctx.from, ctx.chat.id);
  });

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
        let broadcastsCodes = []
        broadcastsCodes = broadcasts.map(broadcast => broadcast.code)
        
      ctx.reply(`введите код команды для бродкаста, доступные коды: ${broadcastsCodes}`);
      ctx.wizard.state.data = {};
      return ctx.wizard.next();
    },
    async (ctx) => {
        ctx.wizard.state.data.code = ctx.message.text;
        let users;
        let broadcast;
        try {
            users = await User.find({});
            broadcast = await Broadcast.find({code: ctx.wizard.state.data.code})
        } catch (err) {
          console.log(err);
        }
      if (broadcast.length !==0) {
        let user_list  = users.map(user => user.chatId)
        for (i in user_list) {
          console.log(i)
          bot.telegram.sendMessage(user_list[i], broadcast[0].text)
        }
      }
   
      
      return ctx.wizard.next();
    },
    async (ctx) => {
        // ctx.reply('Thank you for your replies, we ll contact your soon');
        // console.log(ctx.wizard.state.data.code)
        return ctx.scene.leave();
    },
  );

  const stage = new Scenes.Stage([contactDataWizard]);

bot.use(session());
  bot.use(stage.middleware());
  bot.command("broadcasting", (ctx) => {
    ctx.scene.enter("broadcasting");
  });

//   bot.hears('/broadcast', async (ctx) => {
//     bot.telegram.sendMessage(306807986, 'крол привет')
//   })

  bot.on("text", async (ctx) => {
    let input_code = ctx.message.text;
    let script;
    try {
      //code: input_code
      script = await Script.find({ code: input_code });
    } catch (err) {
      console.log(err);
    }
    if (script.length != 0) {
        ctx.reply(script[0].text);
    }

  });
  

  // bot.on('text', ctx => {
  //     let btc_address = ctx.message.text
  //     ctx.replyWithHTML(
  //         btc_address
  //       )
  // })
  bot.launch(); // запуск бота
};

exports.boardGameBot = boardGameBot;
