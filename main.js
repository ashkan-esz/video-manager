const fs = require('fs');

main();

function main() {
    let {files, folders} = split_file_folder();
    for (const fileIndex in files) {
        let fileName = files[fileIndex].toLowerCase();
        if (fileName.includes('mm--') || fileName.includes('mm-')) {
            move_mm(files[fileIndex]);
        } else {
            let find_season_episode = /(s\d\de\d\d)/g.exec(fileName);
            if (find_season_episode) {
                let find_serial_folder = false;
                let serialName, folderName;
                for (const folderIndex in folders) {
                    folderName = folders[folderIndex].toLowerCase();
                    serialName = fileName.slice(0, find_season_episode.index - 1).replace(/\./g, ' ');
                    if (folderName === serialName) {
                        find_serial_folder = true;
                        break;
                    }
                }
                move_serials_to_its_folder(folderName, files[fileIndex], find_season_episode[0], !find_serial_folder, serialName);
            }
        }
    }
}

function move_serials_to_its_folder(folderName, fileName, season_episode, newSerial, serialName) {
    let oldPath = `./${fileName}`;
    let newPath;
    let seasonNumber = parseInt(season_episode.slice(1, 3));
    if (newSerial) {
        folderName = serialName.split(' ').map((item) => item.charAt(0).toUpperCase() + item.slice(1)).join(" ");
        createPath(`./Unseen`);
        createPath(`./Unseen/${folderName}`);
        createPath(`./Unseen/${folderName}/season ${seasonNumber}`);
        newPath = `./Unseen/${folderName}/season ${seasonNumber}/${fileName}`;
    } else {
        createPath(`./${folderName}/season ${seasonNumber}`)
        newPath = `./${folderName}/season ${seasonNumber}/${fileName}`;
    }
    move_file(oldPath, newPath);
}

function move_mm(fileName) {
    let oldPath = `./${fileName}`;
    createPath(`./mm`);
    let newPath = `./mm/${fileName}`;
    move_file(oldPath, newPath);
}

function createPath(path) {
    if (!fs.existsSync(path))
        fs.mkdirSync(path);
}

function move_file(oldPath, newPath) {
    fs.rename(oldPath, newPath, function (err) {
        if (err) {
            if (err.code === 'EXDEV') {
                console.log('an error', err);
                copy();
            }
        }
    });

    function copy() {
        let readStream = fs.createReadStream(oldPath);
        let writeStream = fs.createWriteStream(newPath);
        readStream.on('close', function () {
            // fs.unlink(oldPath, callback);
            fs.unlink(oldPath);
        });
        readStream.pipe(writeStream);
    }
}

function split_file_folder() {
    let dirs = fs.readdirSync('./');
    let folders = [], files = [];
    for (const index in dirs) {
        let name = dirs[index];
        try {
            if (fs.lstatSync(`./${name}`).isFile()) files.push(name);
            else folders.push(name);
        } catch (e) {}
    }
    return {files: files, folders: folders};
}