const express = require('express');
const cors = require('cors');
const { default: mongoose } = require('mongoose');
const app = express();
require('dotenv').config();
const User = require('./models/User.js');
const bcrypt = require('bcryptjs');
const bcryptSalt = bcrypt.genSaltSync(10);
const jwt = require('jsonwebtoken');
const jwtSecret = 'eyJhbGciOiJIUz';
const cookieParser = require('cookie-parser');
const imageDownloader = require('image-downloader');
const multer = require('multer');
const fs = require('fs');
const {S3Client, PutObjectCommand} = require('@aws-sdk/client-s3');
const bucket = 'BookingApp';
const Place = require('./models/Places.js')
const Booking = require('./models/Booking.js')
const FormData = require('form-data');
const { resolve } = require('path');
const { rejects } = require('assert');


app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(__dirname+'/uploads'))

app.use(cors({
    credentials: true,
    origin: 'http://localhost:5173',
}));

mongoose.connect('mongodb://127.0.0.1:27017/BookingApp')

app.get('/test', (req,res)=>{
    res.json('test')
});


app.post('/register' , async(req,res)=>{
    mongoose.connect('mongodb://127.0.0.1:27017/BookingApp')
    const {name,email ,password} = req.body;
    try{
    const userDoc = await User.create({
        name,
        email,
        password: bcrypt.hashSync(password, bcryptSalt),
    });
    res.json(userDoc);
    }catch(e){
        res.status(422).json(e);
    }
});

app.post('/login', async(req,res)=>{
    mongoose.connect('mongodb://127.0.0.1:27017/BookingApp')
    const {email,password} = req.body;
    const userDoc = await User.findOne({email});
    if(userDoc){
        const passOK = bcrypt.compareSync(password, userDoc.password);
        if(passOK){
            jwt.sign({email: userDoc.email,
                id: userDoc._id , 
                }, jwtSecret , {} , (err,token)=>{
                if(err) throw err;
                res.cookie('token' , token).json(userDoc);
            });
        } else {
            res.status(422, 'Pass not ok');
        }
        } else {
            res.json('Not Found');
    }
})

app.get('/profile', (req,res)=>{
    mongoose.connect('mongodb://127.0.0.1:27017/BookingApp')
    const {token} = req.cookies;
    if(token){
        jwt.verify(token, jwtSecret, {} , async (err, userData)=>{
            if (err) throw err;
            const userDoc = await User.findById(userData.id);
            res.json(userDoc);
        });
    }else{
        res.json(null);
    }
})



async function uploadToS3(path, originalFilename, mimetype) {
    const client = new S3Client({
      region: 'us-east-1',
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
      },
    });

    
    const parts = originalFilename.split('.');
    const ext = parts[parts.length - 1];
    const newFilename = Date.now() + '.' + ext;
    await client.send(new PutObjectCommand({
      Bucket: bucket,
      Body: fs.readFileSync(path),
      Key: newFilename,
      ContentType: mimetype,
      ACL: 'public-read',
    }));
    return `https://${bucket}.s3.amazonaws.com/${newFilename}`;
  }

  app.post('/upload-by-link', async (req,res) => {
    const {link} = req.body;
    const newName = 'photo' + Date.now() + '.jpg';
    await imageDownloader.image({
      url: link,
      dest: __dirname +'/uploads/' +newName,
    });
    
    res.json(newName);
  });
  

  const photosMiddleware = multer({dest:'/uploads/'});
  app.post('/upload', photosMiddleware.array('photos', 100), async (req,res) => {
    const uploadedFiles = [];
    for (let i = 0; i < req.files.length; i++) {
      const {path,originalname,mimetype} = req.files[i];
      const url = await uploadToS3(path, originalname, mimetype);
      uploadedFiles.push(url);
    }
    res.json(uploadedFiles);
  });
  

app.post('/places' , (req, res) => {
    const {token} = req.cookies;
    const {title, address, addedPhotos,description
    ,perks, extraInfo, checkIn, checkOut,maxGuests,price} = req.body;
    jwt.verify(token, jwtSecret, {} , async (err, userData)=>{
        if(err) throw err;
    const placeDoc =  await Place.create({
        owner: userData.id,price,
        title, address, photos: addedPhotos,description
        ,perks, extraInfo, checkIn, checkOut,maxGuests,
    });
    res.json(placeDoc);
    });
});

app.get('/user-places',(req,res)=>{
    const {token} = req.cookies;
    jwt.verify(token, jwtSecret, {} , async (err, userData)=>{
        const {id} = userData;
        res.json(await Place.find({owner: id}) );
    });
});

app.get('/places/:id', async (req,res)=>{
    const {id}= req.params;
    res.json( await Place.findById(id))
});

app.put('/places', async (req,res) => {
    mongoose.connect('mongodb://127.0.0.1:27017/BookingApp');
    const {token} = req.cookies;
    const {
      id, title,address,addedPhotos,description,
      perks,extraInfo,checkIn,checkOut,maxGuests,price,
    } = req.body;
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
      if (err) throw err;
      const placeDoc = await Place.findById(id);
      if (userData.id === placeDoc.owner.toString()) {
        placeDoc.set({
          title,address,photos:addedPhotos,description,
          perks,extraInfo,checkIn,checkOut,maxGuests,price,
        });
        await placeDoc.save();
        res.json('ok');
      }
    });
  });
  

  app.post('/bookings', async (req, res) => {
    mongoose.connect('mongodb://127.0.0.1:27017/BookingApp');
    const userData = await getUserDataFromReq(req);
    const {
      place,checkIn,checkOut,numberOfGuests,name,phone,price,
    } = req.body;
    Booking.create({
      place,checkIn,checkOut,numberOfGuests,name,phone,price,
      user:userData.id,
    }).then((doc) => {
      res.json(doc);
    }).catch((err) => {
      throw err;
    });
  });
    
function getUserDataFromReq(req) {
  return new Promise((resolve,rejects) =>{
    jwt.verify(req.cookies.token,jwtSecret,{},async(err, userData)=>{
      if(err) throw err;
      resolve(userData);
    })
  })
  
}

app.get('/bookings', async (req,res) => {
  mongoose.connect('mongodb://127.0.0.1:27017/BookingApp');
  const userData = await getUserDataFromReq(req);
  res.json( await Booking.find({user:userData.id}).populate('place') );
});


app.get('/places', async (req, res) => {
  mongoose.connect('mongodb://127.0.0.1:27017/BookingApp');
    res.json(await Place.find());
  })


app.post('/logout', (req,res)=>{
    res.cookie('token' , '').json(true);
});
 


app.listen(4000);