// set multer in this file
const multer = require("multer");
// require "uuidv4" as a v4
const {v4:uuidv4} = require("uuid");
const path = require('path');

// copy from multer doc, search "multer npm" 
const storage = multer.diskStorage({
    destination : function(req, file, cb){
        cb(null,'./public/images/uploads')
    },
    filename : function(req, file, cb){
        //using uuid, it give unique names as "unique"
        const unique = uuidv4();
        //unique name haven't ext of file so we add ext using path.extname
        cb(null, unique + path.extname(file.originalname));
    }
})

const upload = multer({storage: storage})
module.exports = upload;