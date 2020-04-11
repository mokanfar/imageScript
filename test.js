import * as path from "path";
import { promises as fs } from "fs";
import { default as sizeOf } from "image-size";
import { default as sharp } from "sharp";
import { default as imagemin } from "imagemin";
import { default as imageminMozjpeg } from "imagemin-mozjpeg";

let imagePath = path.win32.normalize(process.argv[2]);
let outputDir = "./rez/";
process.chdir(imagePath);

async function listFiles(directory) {
  const dirents = await fs.readdir(directory, { withFileTypes: true });
  return dirents
    .filter((dirent) => dirent.isFile())
    .map((dirent) => dirent.name);
}
async function makeRezDir() {
  try {
    await fs.mkdir(outputDir);
  } catch (error) {
    console.log(error);
  }
}
listFiles(".")
  .then((files) => {
    makeRezDir();
    resizeImages(files);
  })
  .then(() => minifyImages())
  .catch(function (error) {
    console.error(error);
  });

async function minifyImages() {
  await imagemin([outputDir + "*.jpg"], {
    destination: outputDir + "minified",
    plugins: [imageminMozjpeg()],
  });
}
const resizeImages = (files) => {
  for (let img of files) {
    var dims = sizeOf(img);
    if (dims.height > dims.width)
      sharp(img)
        .resize({
          height: 1300,
        })
        .toFile(outputDir + img);
    else
      sharp(img)
        .resize({
          width: 2000,
        })
        .toFile(outputDir + img);
  }
};

//$ node test.js 'C:\z\imageScript\imgs'
