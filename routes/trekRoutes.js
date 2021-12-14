const express=require('express');
const router=express.Router();
const catchAsync = require('../utils/catchAsync');
const Trek = require("../models/treks");
const trekController=require('../controllers/trekController');
const {isLoggedIn,isAuthor}=require('../middleware');
const {storage}=require('../cloudinary');
const multer=require('multer');
const upload=multer({storage});
const {trekSchema}=require('../schema');
const ExpressError=require('../utils/ExpressError');


const validateTrek=(req,res,next)=>{
  const {error}=trekSchema.validate(req.body);
  if(error){
      const msg=error.details.map(el=>el.message).join(',')
      throw new ExpressError(msg,400)
  }
  else{
     next();
  }
}

router.route('/')
  .get(catchAsync(trekController.index))
  .post(isLoggedIn,upload.array('image'),validateTrek,catchAsync(trekController.createTrek))
  // .post(upload.single('image'),(req,res)=>{
  //     res.send(req.body,req.file)
  //   }
  // )
  
router.route('/new')
  .get(isLoggedIn, trekController.renderNewForm);

router.route('/:id')
  .get(catchAsync(trekController.showTrek))
  .put(isLoggedIn,isAuthor,upload.array('image'),validateTrek,catchAsync( trekController.updateTrek))
  .delete(isLoggedIn,isAuthor, catchAsync(trekController.deleteTrek))

router.route('/:id/edit')
  .get(isLoggedIn,isAuthor,catchAsync(trekController.renderEditForm));

router.route('/payment')
  .get(isLoggedIn,catchAsync(trekController.enrollPayment));

module.exports=router;