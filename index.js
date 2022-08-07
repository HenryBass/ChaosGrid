const {App} = require('@slack/bolt');
const getPixels = require('get-pixels');
const path = require('path');
const fs = require('fs');

require('dotenv').config();
const sharp = require('sharp');

const colors = {
    PrismaticVermilionCardinalRenewalAirbnbAlabamaRed: [202, 0, 33],
    NormalRed: [225, 0, 33],
    EvenMoreNormalRed: [225, 0, 0],
    CelesteTheColor: [178, 255, 255],
    CelesteThePerson: [178, 255, 255],
    Periwinkle: [178, 255, 255],
    Bluheheh: [255, 0, 0],
    IfYourUrineIsThisColorSeeADoctor: [57, 255, 20],
    GreenishGreen: [0, 255, 0],
    PakistanGreen: [0, 102, 0],
    Purpureus: [154, 78, 174],
    RedAndBlueButNotPurple: [255, 0, 255],
    DrinkMoreWaterPiss: [218, 165, 32],
    StillDrinkMoreWaterPiss: [253, 255, 0],
    GoodJobYouDrankEnoughWaterPiss: [255, 255, 224],
    ItsJustOrange: [240, 97, 5],
};

const token = process.env.TOKEN;
const signingSecret = process.env.SIGNING_SECRET;

const maxRows = 26;
const maxCols = 11;
let flashtime = 0;
let flash;
const ratelimit = true;

const helpText = `Please enter a cell and color in the form of \`/chaosgrid <row> <col> <r> <g> <b>\`\n
    Other Commands:\n
    \`/chaosflashbang\` (fun)`;

let recents = [];
let board = [];
let rawBoard = [];

sharp('rick.jpg')
    .resize(11, 26)
    .toFile('lowrick.jpg', function (err, info) {
        // console.log(err, ' - Error');
        // console.log(info, ' - Info');
    });

function ajustnum(n) {
    if (n <= 9) {
        return '0' + n;
    } else {
        return n;
    }
}

function rickcolor(pixels, row, col) {
    return rgb2emoji(
        pixels.get(col, row, 0),
        pixels.get(col, row, 1),
        pixels.get(col, row, 2),
    );
}

function randomcolor() {
    return rgb2emoji(
        Math.min(Math.floor(Math.random() * 255) + 200, 255),
        Math.min(Math.floor(Math.random() * 255) + 200, 255),
        Math.min(Math.floor(Math.random() * 255) + 300, 255),
    );
}

function rgb2emoji(r, g, b) {
    return (
        ':' +
        ajustnum(Math.floor(r / 25.5)) +
        ajustnum(Math.floor(g / 25.5)) +
        ajustnum(Math.floor(b / 25.5)) +
        ':'
    );
}

function initBoard() {
    getPixels('lowrick.jpg', function (err, pixels) {
        if (err) {
            console.log('Bad image path');
            return;
        }
        console.log('got pixels', pixels.shape.slice());
        board = [];
        rawBoard = [];

        for (let i = 0; i < 26; i++) {
            board.push([]);
            rawBoard.push([]);
            for (let j = 0; j < 11; j++) {
                board[i].push(rickcolor(pixels, i, j));
                rawBoard[i].push([
                    pixels.get(j, i, 0),
                    pixels.get(j, i, 1),
                    pixels.get(j, i, 2),
                ]);
            }
        }

        // console.log(rawBoard);
    });
}

function createFlash() {
    flash = [];

    for (let i = 0; i < 26; i++) {
        flash.push([]);
        for (let j = 0; j < 11; j++) {
            flash[i].push(randomcolor());
        }
    }
}

initBoard();
createFlash();

const app = new App({
    signingSecret,
    token,
    customRoutes: [
        {
            path: '/index',
            method: ['GET'],
            handler(req, res) {
                try {
                    res.setHeader('Content-Type', 'text/html');
                    // damn, good one!
                    fs.createReadStream('public/index.html').pipe(res, {
                        end: true,
                    });
                } catch (err) {
                    console.error(err);
                }
            },
        },
        {
            path: '/boardData',
            method: ['GET'],
            handler(req, res) {
                try {
                    res.setHeader('Content-Type', 'text/html');
                    // damn, good one!
                    const rb = JSON.stringify(rawBoard);

                    // rb.createReadStream().pipe(res, {end: true});

                    res.write(rb);
                    res.end();
                } catch (err) {
                    console.error(err);
                }
            },
        },
    ],
});

async function parsemsg(msg, respond) {
    // message format: row col r g b OR row col random

    msg = msg.split(' ').filter((x) => x); // remove extra spaces

    if (msg.length !== 5 && msg.length !== 3) {
        throw new Error('Invalid message');
    }

    // row is always a number
    let row = parseInt(msg[0]);
    // col is always a letter, but could be either case, make it a number
    let col = msg[1].toUpperCase().charCodeAt(0) - 65;

    // check in bounds
    if (row < 0 || row > maxRows) {
        throw new Error('Row out of bounds');
    }
    if (col < 0 || col > maxCols) {
        throw new Error('Column out of bounds');
    }

    if (msg.length === 3) {
        // random color
        board[row][col] = randomcolor();
        return;
    }

    let red = parseInt(msg[2]);
    let green = parseInt(msg[3]);
    let blue = parseInt(msg[4]);

    if (red < 0 || red > 255) {
        throw new Error('Red out of bounds');
    }
    if (green < 0 || green > 255) {
        throw new Error('Green out of bounds');
    }
    if (blue < 0 || blue > 255) {
        throw new Error('Blue out of bounds');
    }

    let random = Math.floor(Math.random() * 100);

    if (random % 13 === 0) {
        let row2 = row - 1;
        if (row2 >= 0) {
            board[row2][col] = rgb2emoji(255, 255, 255);
            rawBoard[row2][col] = [255, 255, 255];
        }
        let row3 = row + 1;
        if (row3 < board.length) {
            board[row3][col] = rgb2emoji(255, 255, 255);
            rawBoard[row3][col] = [255, 255, 255];
        }
        let col2 = col - 1;
        if (col2 >= 0) {
            board[row][col2] = rgb2emoji(255, 255, 255);
            rawBoard[row][col2] = [255, 255, 255];
        }
        let col3 = col + 1;
        if (col3 < board[row].length) {
            board[row][col3] = rgb2emoji(255, 255, 255);
            rawBoard[row][col3] = [255, 255, 255];
        }
        await respond({
            text: 'Neighbors are now white',
            response_type: 'ephemeral',
        });
    } else if (random % 7 === 0) {
        for (const i in board) {
            for (const j in board[i]) {
                board[i][j] = rgb2emoji(255, 255, 255);
                rawBoard[i][j] = [255, 255, 255];
            }
        }
        await respond({
            text: 'Flashbang',
            response_type: 'ephemeral',
        });
    }

    board[row][col] = rgb2emoji(red, green, blue);
    rawBoard[row][col] = [red, green, blue];
}

/* Add functionality here */

function createTitle() {
    let title = '*Chaos Grid - /chaoshelp*';

    return title;
}

function createMessage(board) {
    let msg = '      A    B    C    D    E    F     G    H    I      J     K';

    for (let i = 0; i < 26; i++)
        msg += '\n' + ajustnum(i) + ' ' + board[i].join(' ');

    return msg;
}

function updaterec() {
    for (let i = 0; i < recents.length; i++) {
        if (new Date() - recents[i][1] >= 29999) {
            recents.splice(i, 1);
            i--;
            console.log(recents);
        }
    }
}

(async () => {
    // Start the app
    await app.start(24569);

    setInterval(updaterec, 1000);

    console.log('Running');

    app.command('/chaosgrid', async ({body, ack, say, respond}) => {
        await ack();

        // console.log(body);

        let d = new Date();
        if (body.text == '') {
            await respond(`${createTitle()} \n${createMessage(board)}`);
            await respond({text: helpText, response_type: 'ephemeral'});
            return;
        }
        if (ratelimit && recents.some((recent) => recent[0] === body.user_id)) {
            await respond({
                text: 'You can only send a message once every 29.9999999 seconds',
                response_type: 'ephemeral',
            });
            return;
        }

        recents.push([body.user_id, d]);

        try {
            await parsemsg(body.text, respond);
        } catch (error) {
            await respond({
                text: `Zoinks, something went wrong: ${error}.\n\n${helpText}`,
                response_type: 'ephemeral',
            });
            return;
        }

        await say(`${createTitle()} \n${createMessage(board)}`);
    });

    app.command('/chaoshelp', async ({ack, respond}) => {
        await ack();

        await respond({text: helpText, response_type: 'ephemeral'});
    });

    app.command('/chaosflashbang', async ({body, ack, say}) => {
        await ack();
        flashtime = 5;
        await say(createMessage(flash) + '\n-FLASHBANG- (your eyes bleed)');
    });

    app.message('chaos', async ({message, say, ack}) => {
        await ack();

        await say(`grid`);
    });
})();

// console.log(createMessage())
