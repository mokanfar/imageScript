#!/usr/bin/env node
import * as path from "path";
import { promises as fs } from "fs";
import { default as minimist } from "minimist";
import { default as sizeOf } from "image-size";
import { default as sharp } from "sharp";
import { default as rimraf } from "rimraf";
import { default as imagemin } from "imagemin";
import { default as imageminMozjpeg } from "imagemin-mozjpeg";

let argv = minimist(process.argv.slice(2));

let __QUALITY__ = typeof argv.quality == 'number' ? argv.quality : 80;
let __CLOSEUPS__ = argv.quality == 'closeups'
let __RESIZED__ = (argv.quality == 'closeups' || !argv.quality)
let resHeight = __CLOSEUPS__ ? 1000 : 1400;
let resWidth = __CLOSEUPS__ ? 1400 : 2500;

let imagePath = './imgs';

switch(argv.quality) {
  case 90:
   imagePath = imagePath.concat('/90')
    break;
  case 80:
    imagePath = imagePath.concat('/80')
    break;
  case 70:
    imagePath = imagePath.concat('/70')
    break;
  case 'closeups':
    imagePath = imagePath.concat('/closeups')
    break;
  default:
  imagePath = imagePath.concat('/resmin')
}

let outputDir = __RESIZED__ ? 'res' : '../done';

let directoriesToDelete = [];
process.chdir(imagePath);


Promise.all([
  cleanUpBefore(),
  makeDir(),
  resize().then(_=>minify()).then(_=>cleanUpAfter())
  ]).then(_=> process.exit(0));

async function cleanUpBefore() {
   rimraf.sync("../done");
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

   if(__RESIZED__) {
    process.chdir('../');
    rimraf.sync("res");
  }  

  for(const file of await files) {
    await fs.unlink("./" + file);
  }

 } catch (e) {}
}

async function makeDir() {
    //await console.log('making dir ', outputDir);
    try {
    await fs.mkdir("../done");
    } catch (e) {}
}

async function resize() {
  if(typeof argv.quality !== 'number') {

    let files = await listFiles(".").then(data => data.files);

    try {
      await fs.mkdir("res");
      for (let img of files) {
        var dims = sizeOf(img);
      
        let settings = dims.height > dims.width ? { height: resHeight } : { width: resWidth };
       
        await sharp(img)
          .resize({
            ...settings,
          })
          .toFile(outputDir + '/' + img)
          // .then(_=>console.log('finished resizing'));
      }
    } catch (error) {}
  }
}

async function minify() {
  
    if(__RESIZED__) {
      process.chdir(outputDir);  
      outputDir = "../../done"
    }

  
  try {
    await imagemin(["*.jpg"], {
      destination: outputDir,
      plugins: [imageminMozjpeg({ quality: __QUALITY__ })],
    })
    // .then(_=>console.log('finished minifying'));
  } catch (e) {}
}

//$ node test.js 'C:\z\imageScript\imgs'
