import multer from 'multer'

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, __dirname + '/public/img')
  }
})

const uploader = multer({ storage})

export default uploader