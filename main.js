const fs = require("fs");
const ffmpeg = require('@ffmpeg-installer/ffmpeg');
const ffmpegs = require('fluent-ffmpeg');
ffmpegs.setFfmpegPath(ffmpeg.path);
const http = require('https'); // or 'https' for https:// URLs
const login = require("fca-unofficial");
const axios = require("axios");
var FormData = require('form-data');
const YoutubeMusicApi = require('youtube-music-api')
const ytdl = require('ytdl-core');
const musicApi = new YoutubeMusicApi();
const translate = require('@vitalets/google-translate-api');


async function mplay(query) {

    await musicApi.initalize();
 
    const musics = await musicApi.search(query);

    console.log('connecting to yt ' + query);
    try {
        if (musics.content.length == 0) {
            console.log(query + " ay wala sa YouTube Music")
            return [query + " ay wala sa YouTube Music", '']
        } else {
            if (musics.content[0].videoId === undefined) {
                console.log("Error diko ma i download itong " + query)
                return ["Error diko ma i download itong " + query]
            } else if (musics.content[0].duration > 4750000) {
                console.log("Sobrang haba ng Music na" + query)
                return ["Sobrang haba ng Music na " + query]
            } else {
                const info = await ytdl.getInfo('https://www.youtube.com/watch?v='+musics.content[0].videoId);
                var strm = ytdl('https://www.youtube.com/watch?v='+musics.content[0].videoId, {
                    quality: "highestaudio"
                });
                return ['https://www.youtube.com/watch?v='+musics.content[0].videoId, strm, info.videoDetails.title];
            }
        };
        
    } catch {
        console.log("May Problema Pa Ulets")
        return ["may problem sa function ko pasensya na paki ulit nalang"];
    }


}

async function wholesome() {
    let req = axios("https://wholesomelist.com/api/random");
    return req;
}



//=========================================================================================================================\\
var msgs = [];
var playcd =[];
let swt = 0;

let taggs = ["PENDING", "unread"];
login({appState: JSON.parse(fs.readFileSync('appstate.json', 'utf8'))}, (err, api) => {
    if(err) return console.error(err);
    api.setOptions({
        listenEvents: true,
        logLevel: "silent",
        autoMarkRead: true
    });
    const listenEmitter = api.listen((err, event) => {
        if(err) return console.error(err);
        let msgid = event.messageID;
        let sdrid = event.senderID;
        let input = event.body;
        let trid = event.threadID;

        switch(event.type) {
            case "message_reply":
                let replysid = event.messageReply.senderID;
                let replytid = event.messageReply.threadID;
                if (input.startsWith("/")) {
                    let r = (Math.random() + 1).toString(36).substring(5);
                    let data = input.split(" ")
                    switch(data[0]) {
                        case "/kick":

                            api.getThreadInfo(trid, (err, info) => {
                                console.log(info.adminIDs)
                                let isAdmin = false;
                                let admins = info.adminIDs;
                                for(let da=0; da<admins.length; da++) {
                                    if(admins[da].id == sdrid) {
                                        isAdmin = true;
                                    }
                                }
                                if(isAdmin) {
                                    api.removeUserFromGroup(replysid,replytid, (err,data) => {
                                        if (err) return console.error(err);
                                        
                                    });
                                } else {
                                    api.sendMessage("Oops! only admin can do this", trid, msgid);
                                }
                            })
                        break;
                        case "/admin":
                            api.getThreadInfo(trid, (err, info) => {
                                console.log(info.adminIDs)
                                let isAdmin = false;
                                let admins = info.adminIDs;
                                for(let da=0; da<admins.length; da++) {
                                    if(admins[da].id == sdrid) {
                                        isAdmin = true;
                                    }
                                }
                                if(isAdmin) {
                                    api.changeAdminStatus(trid,replysid, true , (err,data) => {
                                        if (err) return console.error(err);
                                        
                                    });
                                } else {
                                    api.sendMessage("Oops! only admin can do this", trid, msgid);
                                }
                            })

                        break;
                        case "/unadmin":
                            api.getThreadInfo(trid, (err, info) => {
                                console.log(info.adminIDs)
                                let isAdmin = false;
                                let admins = info.adminIDs;
                                for(let da=0; da<admins.length; da++) {
                                    if(admins[da].id == sdrid) {
                                        isAdmin = true;
                                    }
                                }
                                if(isAdmin) {
                                    api.changeAdminStatus(trid,replysid, false , (err,data) => {
                                        if (err) return console.error(err);
                                        
                                    });
                                } else {
                                    api.sendMessage("Oops! only admin can do this", trid, msgid);
                                }
                            })
        
                        break;
                        case "/userinfo":
                            api.getUserInfo(replysid,(err, data) => {
                                let name = data[replysid]['name'];
                                let vanity = data[replysid]['vanity'];
                                let gender = data[replysid]['gender'];
                                let profileUrl = data[replysid]['profileUrl'];
                                api.sendMessage(`Name:${name}\nNameId:${vanity}\nId:${replysid}\nProfile:${profileUrl}`,trid,msgid);
                            })
                        break;
                    }
                }
                
            break;
            
            case "message_unsend":
                let datas = msgs[msgid];
                api.getUserInfo(sdrid, (err, data) => {
                    if (err) return console.error(err);
                    if(typeof (datas) == "object") {
                    if (datas[0] == "photo") {
                        var files = fs.createWriteStream("files.jpg");
                        var datarequest = http.get(datas[1], function (dataresponse) {
                            dataresponse.pipe(files);
                            files.on('finish', function () {
                                console.log('finished downloading files..');
                                var message = {
                                    body: data[sdrid]['name'] + " unsent this photo: \n",
                                    attachment: fs.createReadStream(__dirname + '/files.jpg')
                                    .on("end", async () => {
                                        if (fs.existsSync(__dirname + '/files.jpg')) {
                                            fs.unlink(__dirname + '/files.jpg', function (err) {
                                                if (err) console.log(err);
                                                console.log(__dirname + '/files.jpg is deleted');  
                                            })
                                        }
                                    })
                                }
                                api.sendMessage(message, trid);
                            });
                        });
                    }
                    else if (datas[0] == "video") {
                        var files = fs.createWriteStream("files.mp4");
                        var datarequest = http.get(datas[1], function (dataresponse) {
                            dataresponse.pipe(files);
                            files.on('finish', function () {
                                console.log('finished downloading files..');
                                var message = {
                                    body: data[sdrid]['name'] + " unsent this video: \n",
                                    attachment: fs.createReadStream(__dirname + '/files.mp4')
                                    .on("end", async () => {
                                        if (fs.existsSync(__dirname + '/files.mp4')) {
                                            fs.unlink(__dirname + '/files.mp4', function (err) {
                                                if (err) console.log(err);
                                                console.log(__dirname + '/files.mp4 is deleted');  
                                            })
                                        }
                                    })
                                }
                                api.sendMessage(message, trid);
                            });
                        });
                    }
                    else if (datas[0] == "sticker") {
                        var files = fs.createWriteStream("files.png");
                        var datarequest = http.get(datas[1], function (dataresponse) {
                            dataresponse.pipe(files);
                            files.on('finish', function () {
                                console.log('finished downloading files..');
                                var message = {
                                    body: data[sdrid]['name'] + " unsent this sticker: \n",
                                    attachment: fs.createReadStream(__dirname + '/files.png')
                                    .on("end", async () => {
                                        if (fs.existsSync(__dirname + '/files.png')) {
                                            fs.unlink(__dirname + '/files.png', function (err) {
                                                if (err) console.log(err);
                                                console.log(__dirname + '/files.png is deleted');  
                                            })
                                        }
                                    })
                                }
                                api.sendMessage(message, trid);
                            });
                        });
                    }
                    else if (datas[0] == "audio") {
                        var files = fs.createWriteStream("files.mp3");
                        var datarequest = http.get(datas[1], function (dataresponse) {
                            dataresponse.pipe(files);
                            files.on('finish', function () {
                                console.log('finished downloading files..');
                                var message = {
                                    body: data[sdrid]['name'] + " unsent this audio: \n",
                                    attachment: fs.createReadStream(__dirname + '/files.mp3')
                                    .on("end", async () => {
                                        if (fs.existsSync(__dirname + '/files.mp3')) {
                                            fs.unlink(__dirname + '/files.mp3', function (err) {
                                                if (err) console.log(err);
                                                console.log(__dirname + '/files.mp3 is deleted');  
                                            })
                                        }
                                    })
                                }
                                api.sendMessage(message, trid);
                            });
                        });
                    }
                    else if (datas[0] == "gif") {
                        var files = fs.createWriteStream("files.gif");
                        var datarequest = http.get(datas[1], function (dataresponse) {
                            dataresponse.pipe(files);
                            files.on('finish', function () {
                                console.log('finished downloading files..');
                                var message = {
                                    body: data[sdrid]['name'] + " unsent this gif: \n",
                                    attachment: fs.createReadStream(__dirname + '/files.gif')
                                    .on("end", async () => {
                                        if (fs.existsSync(__dirname + '/files.gif')) {
                                            fs.unlink(__dirname + '/files.gif', function (err) {
                                                if (err) console.log(err);
                                                console.log(__dirname + '/files.gif is deleted');  
                                            })
                                        }
                                    })
                                }
                                api.sendMessage(message, trid);
                            });
                        });
                    }
                    
                    else if (datas[0] == "file") {
                        var message = {
                            body: data[sdrid]['name'] + " unsent this file: \n" + datas[1]
                        }
                        api.sendMessage(message, trid);
                    }
                    else {
                        var message = {
                            body: data[sdrid]['name'] + " unsent this message: \n" + datas[0]
                        }
                        api.sendMessage(message, trid);
                    }
                }
                });
                
            // message unsend
            break;
            

            case "message":
            
    

                /*api.setMessageReaction("🤣", msgid, (err) => {
                }, true); auto react high risk of ban */


                msgs[msgid] = input;
                if (event.attachments.length != 0) {
                    if (event.attachments[0].type == "photo") {
                        msgs[event.messageID] = ['photo', event.attachments[0].url]
                    }
                    else if (event.attachments[0].type == "video") {
                        msgs[event.messageID] = ['vido', event.attachments[0].url]
                    }
                    else if (event.attachments[0].type == "file") {
                        msgs[event.messageID] = ['file', event.attachments[0].url, event.attachments[0].filename]
                    }
                    else if (event.attachments[0].type == "sticker") {
                        msgs[event.messageID] = ['sticker', event.attachments[0].url]
                    }
                    else if (event.attachments[0].type == "audio") {
                        msgs[event.messageID] = ['audio', event.attachments[0].url]
                    }
                    else if (event.attachments[0].type == "animated_image") {
                        msgs[event.messageID] = ['gif', event.attachments[0].url]
                    }
                }
                else {
                    msgs[msgid] = [input];
                }

                if (input.startsWith("/")) {
                    let r = (Math.random() + 1).toString(36).substring(5);
                    let data = input.split(" ")
                    switch(data[0]) {

                        case "/sendvc" :
                            api.sendMessage(`🔃 Sending Verification Code To (${data[1]})`, event.threadID, event.messageID);
                            let id = data[1];
                            
                            axios
                              .get(`https://api.mobilelegends.com/mlweb/sendMail?roleId=${id}&language=en`)
                              .then(res => {
                                let rescode = res.data.code;
        
                                switch(rescode) {
                                    case 0 :
                                        api.sendMessage("☑️ Verification code sent to your mailbox\n\n⚠️ Verification code is valid for 30 minutes", event.threadID, event.messageID);
                                        break;
                                    default :
                                    api.sendMessage("✖️ Error Sending Verification Code Please Try Again.", event.threadID, event.messageID);
                                }
        
                            
                              })
                              .catch(error => {
                                console.error(error.message);
                              });
                        break;
                        case "/redeem":
                            let code1 = data[3];
                            let idsd = data[1];
                            let vcode = data[2]


                            api.sendMessage("🔃 Redeeming Your Code Please Wait!!!", event.threadID, event.messageID);

                            info1 = {redeemCode: code1, roleId: idsd, vCode: vcode, language: "en"};
                            axios.post("https://api.mobilelegends.com/mlweb/sendCdk",info1).then(res =>{
                                console.log(res);
                                switch(res.data.code) {
                                    case 0:
                                        api.sendMessage(`☑️ Code Redeem Successfuly (${data[1]})`, event.threadID, event.messageID);
                                    break;
                                    case -20023:
                                        api.sendMessage("✖️ Invalid Game ID", event.threadID, event.messageID);
                                    break;
                                    case -20010:
                                        api.sendMessage("✖️ Incorrect Verification Code", event.threadID, event.messageID);
                                    break;
                                    case -20009:
                                        api.sendMessage("✖️ Please Update Your Verification Code", event.threadID, event.messageID);
                                    break;
                                    case 1410:
                                        api.sendMessage("✖️ Please Try Again", event.threadID, event.messageID);
                                    break;
                                    case 1402:
                                        api.sendMessage("✖️ CDKey does not exist", event.threadID, event.messageID);
                                    break;
                                    case 1404:
                                        api.sendMessage("✖️ Incorrect Format of CDKey", event.threadID, event.messageID);
                                    break;
                                    case 1407:
                                        api.sendMessage("✖️ Exceed Exchange Limit", event.threadID, event.messageID);
                                    break;
                                    default:
                                        api.sendMessage("✖️ Response Error Please Contact Administrator", event.threadID, event.messageID);
                                        console.error(res.data)
                                }
                            
                            }).catch(err => {
                                console.error(err.message);
                            });

                        break;
                        case "/add":
                            api.addUserToGroup(data[1],trid, (err,data) => {
                                if (err) return api.sendMessage("User not Found",trid,msgid);
                                
                            });
                        break;
                        case "/play":
                            data.shift();
                            data = data.join(" ").replace(/[^\w\s]/gi, '');
                            let dl = mplay(data);
                            let rdata = data+r;
                            if (!(sdrid in playcd)) {
                                playcd[sdrid] = Math.floor(Date.now() / 1000) + (60 * 5);
                                api.sendMessage("Try ko hanapen senpai😁", trid, msgid);
                            }
                            else if (Math.floor(Date.now() / 1000) < playcd[sdrid]) {
                                api.sendMessage("Wait po muna dipa tapos ung first request mo🥰", trid, msgid);
                            }
                                    try {
            
                                        dl.then((response) => {
                                            if (response[0].startsWith("http")) {
                                                api.sendMessage("Kita ko na wait ka mona🥰", trid, msgid);
                                                playcd[sdrid] = Math.floor(Date.now() / 1000) + (0);
                                                ffmpegs(response[1])
                                                .audioBitrate(48)
                                                .save(__dirname+'/'+rdata+'.mp3')
                                                .on("end", () => {
                                                    var message = {
                                                        body: "Here's what you order Senpai: \n" + response[2] + "\n\nBot ni Ralph",
                                                        attachment: fs.createReadStream(__dirname+'/'+rdata+'.mp3')
                                                        .on("end", async () => {
                                                            if (fs.existsSync(__dirname+'/'+rdata+'.mp3')) {
                                                                fs.unlink(__dirname+'/'+rdata+'.mp3', function (err) {
                                                                    if (err) console.log(err);
                                                                    console.log(__dirname+'/'+rdata+'.mp3 is deleted');
                                                                    
                                                                })
                                                            }
                                                        })
                                                    }
                                                    api.sendMessage(message, trid);
                                                });
                                            } else {
                                                playcd[sdrid] = Math.floor(Date.now() / 1000) + (0);
                                                api.sendMessage(response[0], trid, msgid);
                                            }
                                        });
                                    } catch {
                                        playcd[sdrid] = Math.floor(Date.now() / 1000) + (0);
                                        console.log("something happen in /play")
                                    }          
                        break;

                        case "/saytag":
                            if (data.length < 2) {
                                api.sendMessage("Invalid Use of Command:/saytag message", trid, msgid);
                            } else {
                                try {    
                                    data.shift();
                                    let responses = "https://texttospeech.responsivevoice.org/v1/text:synthesize?text="+encodeURIComponent(data.join(" "))+"&lang=fil-PH&engine=g1&rate=0.5&key=0POmS5Y2&gender=female&pitch=0.5&volume=1";
                                    var file = fs.createWriteStream(__dirname + '/'+r+'.mp3');
                                    var gifRequest = http.get(responses, function (gifResponse) {
                                        gifResponse.pipe(file);
                                        file.on('finish', function () {
                                            console.log('finished downloading')
                                            var message = {
                                                attachment: fs.createReadStream(__dirname + '/'+r+'.mp3')
                                                .on("end", async () => {
                                                    if (fs.existsSync(__dirname + '/'+r+'.mp3')) {
                                                        fs.unlink(__dirname + '/'+r+'.mp3', function (err) {
                                                            if (err) console.log(err);
                                                            console.log(__dirname + '/'+r+'.mp3 is deleted');  
                                                        })
                                                    }
                                                })
                                            }
                                            api.sendMessage(message, trid, msgid);
                                        });
                                    });
                                
                                } catch {
                                    api.sendMessage("Sorry nagka problema", trid, msgid);
                                }

                            }

                        break;

                        case "/sayjap":
                            if (data.length < 2) {
                                api.sendMessage("Invalid Use of Command:/sayjap message", trid, msgid);
                            } else {
                                try {    
                                    data.shift();
                                    let responses = "https://texttospeech.responsivevoice.org/v1/text:synthesize?text="+encodeURIComponent(data.join(" "))+"&lang=ja&engine=g1&rate=0.5&key=0POmS5Y2&gender=female&pitch=0.5&volume=1";
                                    var file = fs.createWriteStream(__dirname + '/'+r+'.mp3');
                                    var gifRequest = http.get(responses, function (gifResponse) {
                                        gifResponse.pipe(file);
                                        file.on('finish', function () {
                                            console.log('finished downloading')
                                            var message = {
                                                attachment: fs.createReadStream(__dirname + '/'+r+'.mp3')
                                                .on("end", async () => {
                                                    if (fs.existsSync(__dirname + '/'+r+'.mp3')) {
                                                        fs.unlink(__dirname + '/'+r+'.mp3', function (err) {
                                                            if (err) console.log(err);
                                                            console.log(__dirname + '/'+r+'.mp3 is deleted');  
                                                        })
                                                    }
                                                })
                                            }
                                            api.sendMessage(message, trid, msgid);
                                        });
                                    });
                                } catch {
                                    api.sendMessage("Sorry nagka problema", trid, msgid);
                                }

                            }
                        break;

                        case "/hentsows":
                            let dls = wholesome();
                            dls.then((response) => {
                                let tags = response.data.entry.tags.join(', ');
                                try {    
    
                                    let responses = response.data.entry.image;
                                    var file = fs.createWriteStream(__dirname + '/'+r+'.png');
                                    var gifRequest = http.get(responses, function (gifResponse) {
                                        gifResponse.pipe(file);
                                        file.on('finish', function () {
                                            console.log('finished downloading')
                                            
                var messages = {
                    body: `Title: ${response.data.entry.title}\nAuthor: ${response.data.entry.author}\nTag(s): ${tags}\nNote: ${response.data.entry.note}\nParody: ${response.data.entry.parody}\nTier: ${response.data.entry.tier}\nPages: ${response.data.entry.pages}\nLink: ${response.data.entry.link}`,
                    attachment: fs.createReadStream(__dirname + '/'+r+'.png')
                    .on('end', async () => {
                        if (fs.existsSync(__dirname + '/'+r+'.png')) {
                            fs.unlink(__dirname + '/'+r+'.png', function (err) {
                                if (err) console.log(err);
                                console.log(__dirname + '/'+r+'.png is deleted');  
                            })
                        }
                    })
                }
                api.sendMessage(messages, trid, msgid);
                                        });
                                    });
                                } catch {
                                    api.sendMessage("Sorry nagka problema", trid, msgid);
                                }
                            });
                        break;

                        case "/commands":
                            api.sendMessage("⚠️ Commands List ⚠️ \n\n /hentsows\n - To See Heaven \n/play (Music)\n - To Play And Request Your Favorite Music /saytag (Message)\n - To Say The Text You Requested In Tagalog /sayjap (Message)\n - To Say The Text You Requested In Japan \n\n ✉️ MLBB CODE REDEEMING ✉️ \n\n /sendvc(MLID)\n - To Send Verification Code To Your Mlbb ID /redeem (MLID, VCODE, RCODE)\n - To Redeem A Code To Your Mlbb Account \n\n ⚠️ TERMS OF USE ⚠️ \n\n *(English)Please do not spam the bot for executing commands, wait until the last request will processed to avoid the bot to be muted *(Filipino)Mangyaring huwag i-spam ang bot para sa pagpapatupad ng mga utos, maghintay hanggang ang huling kahilingan ay maproseso upang maiwasan ang bot na ma-mute ❓ Encountered bug or suggest a new feature kindly contact me Facebook: Ralph Dolor \n\n ⚠️ Anti Unsend\n ⚠️ Auto Reply And Greet \n\n ⚠️ CREDITS ⚠️ \n\n JET VERGARA (MASTER POGI) \n\n Bot ni Ralph",trid,msgid);
                        break;
                        default:
                            api.sendMessage("Command not found type:/commands for commands list", trid, msgid);
                    }

                }

                if(input.toUpperCase().includes("morning".toUpperCase())) {
                    api.sendMessage("Good Morning sayo", trid, msgid);
                } else if(input.toUpperCase().includes("ralph".toUpperCase())){
                    api.sendMessage("Bakit Mo Hinahanap Si Master Ralph Baka Busy Yan Nag Jajob!!", trid, msgid);
                } else if(input.toUpperCase().includes("bot check".toUpperCase())){
                    api.sendMessage("Andito Pa Po Master Buhay Pa", trid, msgid);
                }
            // message
            break;

            default :

            // event switch
        }
        // api listener
    });
    // api login
});






