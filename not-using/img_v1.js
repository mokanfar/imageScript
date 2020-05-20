import * as path from "path";
import { promises as fs } from "fs";
import {default as minimist} from "minimist";
import { default as sizeOf } from "image-size";
import { default as sharp } from "sharp";
import { default as imagemin } from "imagemin";
import { default as imageminMozjpeg } from "imagemin-mozjpeg";

//let argv = minimist(process.argv.slice(2));

let justMinify = process.argv[2] == 'minify' ? true : false;

//let imagePath = process.argv[2] ? path.win32.normalize(process.argv[2]) : './imgs';

let imagePath = './imgs';
let outputDir = justMinify ? "./" : "./rez/";

process.chdir(imagePath);

listFiles(".")
  .then((files) => {
    cleanUpBefore();
    makeRezDir();
    return files;
  })
  .then((files) => processArray(files))
  .catch(function (error) {
    console.error(error);
  })
  .then(() => minifyImages())
  .catch(function (error) {
    console.error(error);
  })
  .then(() => cleanUpAfter())
  .catch(function (error) {
    console.error(error);
  });

async function listFiles(directory) {
  const dirents = await fs.readdir(directory, { withFileTypes: true });
  return dirents
    .filter((dirent) => dirent.isFile())
    .map((dirent) => dirent.name);
}
async function makeRezDir() {
  try {
    await fs.mkdir(outputDir);
    //console.log(`created directory rez`);
  } catch (error) {
    console.log(error);
  }
}
async function processArray(files) {
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
        .toFile(outputDir + img);
      //console.log(`processing resize in for loop for image`);
    }
  } catch (error) {
    console.log(error);
  }
}
}
async function minifyImages() {
  await imagemin([outputDir + "*.jpg"], {
    destination: outputDir + "minified",
    plugins: [imageminMozjpeg({ quality: 60 })],
  });
  //console.log(`minifyImages() function run`);
}

async function cleanUpBefore() {
  //TODO: clean up before running script if any dirs exist 
}
async function cleanUpAfter() {
  //TODO: clean up after running script big images in './imgs'
}
//$ node test.js 'C:\z\imageScript\imgs'
