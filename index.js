const fs = require("fs")
const path = require("path")
const { spawn } = require('node:child_process');
var args = process.argv
if (args.length > 3) {
    var dir = args[2]
    var playlistId = args[3]
    if (fs.existsSync(dir)) {
        var playlist = ''
        var files = fs.readdirSync(dir).map(e => `${dir}/${e}`);
        proc = spawn("yt-dlp.exe", ["--skip-download", "--flat-playlist", "-J", playlistId])


        proc.stdout.on('data', (data) => {
            playlist += data;
        });

        proc.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });

        proc.on('close', (code) => {
            console.log(`child process exited with code ${code}`);

            let list = JSON.parse(playlist)
            let maxZeroes = `${files.length}`.length
            let counter = 0;
            let ids = list.entries.map(e => e.id)
            for (const id of ids) {
                counter++
                for (const file of files) {
                    if (file.includes(id)) {
                        let dir = path.dirname(file)
                        let fBase = path.basename(file)
                        if (!/^\(\d+\)/gi.test(fBase)) {
                            let newName = `${dir}/(${counter.toString().padStart(maxZeroes, "0")}) ${fBase}`
                            try {
                                fs.renameSync(file, newName);
                            } catch (e) { }
                        }
                        break;
                    }
                }
            }
        });
    }
} else if (args.length == 3) {
    var dir = args[2]
    if (fs.existsSync(dir)) {
        let files = fs.readdirSync(dir).map(e => `${dir}/${e}`);
        for (const file of files) {
            let dir = path.dirname(file)
            let fBase = path.basename(file)
            if (/^\(\d+\)/gi.test(fBase)) {
                let newName = `${dir}/${(fBase.replace(/^\(\d+\)/gi, "").trim())}`
                try {
                    fs.renameSync(file, newName);
                } catch (e) { }
            }
        }
    }
}