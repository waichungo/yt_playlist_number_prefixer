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
            for (const video of list.entries) {
                counter++
                let id = video.id;
                for (const file of files) {
                    if (file.includes(id)) {
                        let dir = path.dirname(file)
                        let fBase = path.basename(file)
                        if (!/^\(\d+\)/gi.test(fBase)) {
                            let newName = `${dir}/(${counter.toString().padStart(maxZeroes, "0")}) ${fBase}`
                            fs.renameSync(file, newName);
                        }
                        break;
                    }
                }
            }
        });
    }
}