

const { App } = require('@slack/bolt');

require('dotenv').config()

const token = process.env.TOKEN;
const signingSecret = process.env.SIGNING_SECRET;
// const token = "xoxb-2210535565-3907973686004-YTkw5rjTEJD6v56pMqtIPZyz";
const chanid = "C03TB5RJBL0"

let board = []

function initBoard() {
    board = []
    for (let i = 0; i < 26; i++){
        board.push([])
        for (let j = 0; j < 11; j++) {
            board[i].push("")
        }
    }
}

function ajustnum(n) {
    if (n <= 9) {
        return "0" + n
    } else {
        return n
    }
}

function rgb2emoji(r, g, b) {
    return ":" + ajustnum(Math.floor(r/25.5)) + ajustnum(Math.floor(g/25.5)) + ajustnum(Math.floor(b/25.5)) + ": "
}

initBoard()

const app = new App({
  signingSecret,
  token
});

function parsemsg(msg) {
    output = []
    msg = msg.split(", ")
}

/* Add functionality here */

(async () => {
  // Start the app
  await app.start(process.env.PORT || 3000);

  console.log('Running')

  app.command('/ChaosGrid', async ({ message }) => {
    console.log(message)
    await say("'ello!")
  })

  app.message('chaos', async ({ message, say }) => {
    await say(`grid`);
  });

})();