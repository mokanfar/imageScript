import * as path from "path";
import { promises as fs } from "fs";
import { default as minimist } from "minimist";
import { default as sizeOf } from "image-size";
import { default as sharp } from "sharp";
import { default as rimraf } from "rimraf";
import { default as imagemin } from "imagemin";
import { default as imageminMozjpeg } from "imagemin-mozjpeg";

let argv = minimist(process.argv.slice(2));
let __QUALITY__ = argv.quality ? argv.quality : 70;
let justMinify = argv._.includes('minify') ? true : false;
let imagePath = './imgs';
let outputDir = justMinify ? "./" : "./rez/";
let directoriesToDelete = [];
process.chdir(imagePath);


Promise.all([
  //cleanUpBefore(),
  makeDir(),
  resize().then(_=>minify()).then(_=>cleanUpAfter())
  ]).then(_=>console.log('DONE'));

async function cleanUpBefore() {
   let dirs = await listFiles(".").then(data => data.dirs);
    for(let dir of await dirs) {
       rimraf.sync(dir);
    }
}

async function listFiles(directory) {
  const dirents = await fs.readdir(directory, { withFileTypes: true });
  directoriesToDelete = await dirents.filter((x)=>x.isDirectory()).map((x)=>x.name);
  let objj = {}
  objj.files = dirents
    .filter((dirent) => dirent.isFile())
    .map((dirent) => dirent.name);
    objj.dirs = directoriesToDelete;
    return objj;
}

async function cleanUpAfter() {
let files = await listFiles(".").then(data => data.files);
 try {
  for(const file of await files) {
    await fs.unlink("./" + file);
  }    
 } catch (e) {}
}

async function makeDir() {
    //await console.log('making dir ', outputDir);
    try {
    await fs.mkdir(outputDir);
    } catch (e) {}
}

async function resize() {
  if(!justMinify) {
    let files = await listFiles(".").then(data => data.files);
    try {
      for (let img of files) {
        var dims = sizeOf(img);
        let settings =
          dims.height > dims.width ? { height: 1100 } : { width: 1400 };
        await sharp(img)
          .resize({
            ...settings,
          })
          .toFile(outputDir + img)
          // .then(_=>console.log('finished resizing'));
      }
    } catch (error) {}
  }
}

async function minify() {
  try {
    await imagemin([outputDir + "*.jpg"], {
      destination: outputDir + "minified",
      plugins: [imageminMozjpeg({ quality: __QUALITY__ })],
    })
    // .then(_=>console.log('finished minifying'));
  } catch (e) {}
}

//$ node test.js 'C:\z\imageScript\imgs'
