import * as path from "path";
import { promises as fs } from "fs";
import {default as minimist} from "minimist";
import { default as sizeOf } from "image-size";
import { default as sharp } from "sharp";
import {default as rimraf} from "rimraf";
import { default as imagemin } from "imagemin";
import { default as imageminMozjpeg } from "imagemin-mozjpeg";

let argv = minimist(process.argv.slice(2));
let __QUALITY__ = argv.quality ? argv.quality : 60;
let justMinify = argv._.includes('minify') ? true : false;
let imagePath = './imgs';
let outputDir = justMinify ? "./" : "./rez/";
let directoriesToDelete = [];
process.chdir(imagePath);

function onError(e) {
  console.error(e);
}

listFiles(".")
  .then((files) => {
    cleanUpBefore(directoriesToDelete)
    .then(makeRezDir, onError);
    resize(files)
      .then(minifyImages,onError)
      .then(cleanUpAfter,onError);
  })
  .catch((error) => {
    console.error(error);
  });

async function cleanUpAfter() {
  let files = await listFiles(".");
   for (const file of await files) {
   fs.unlink("./" + file);
  }    
}

async function listFiles(directory) {
  const dirents = await fs.readdir(directory, { withFileTypes: true });
  directoriesToDelete = dirents.filter((x)=>x.isDirectory()).map((x)=>x.name);
  console.log('got file names listfiles function')
  return dirents
    .filter((dirent) => dirent.isFile())
    .map((dirent) => dirent.name);
}

async function makeRezDir() {
    await fs.mkdir(outputDir);
}

async function resize(files) {
  if(!justMinify) {
    try {
      for (let img of files) {
        var dims = sizeOf(img);
        let settings =
          dims.height > dims.width ? { height: 1300 } : { width: 2000 };
        await sharp(img)
          .resize({
            ...settings,
          })
          .toFile(outputDir + img).then(_=>console.log('finished resizing'));
      }
    } catch (error) {
      console.log(error);
    }
  }
}

async function minifyImages(files) {
  await imagemin([outputDir + "*.jpg"], {
    destination: outputDir + "minified",
    plugins: [imageminMozjpeg({ quality: __QUALITY__ })],
  }).then(_=>console.log('finished minifying'));
}

async function cleanUpBefore(dirs) {
    for await (let dir of dirs) {
      rimraf.sync(dir);
    }
}

//$ node test.js 'C:\z\imageScript\imgs'
