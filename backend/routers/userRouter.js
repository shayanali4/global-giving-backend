import express from 'express';  //importing express library
import expressAsyncHandler from 'express-async-handler'; //importing express-async-function library
import bcrypt from 'bcryptjs';  // importing bcrypt library which is used to hash the stored password so that it can not be readable
import User from '../models/userModel.js'; // importing User Schema from models
import { generateToken } from '../utils.js'; // importing generate token function from utils.js file
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const fs = require('fs');  // requiring the library for accessing the filesystem


// Defining the user Router so that is can be used whenever it is called
const userRouter = express.Router();

// this is the GET request for getting all users from mongoDB
userRouter.get('/', expressAsyncHandler(async (req, res) => {
    const users = await User.find({});  // MongoDB function to get all users
    res.send({ users });       // sending all users in response of request
}));

// this is the GET request for getting particular user from mongoDB
userRouter.get('/:id', expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id); // MongoDB function to find by id
    if (user) {
        res.send(user); // if user found, send user in response
    } else {
        res.status(404).send({ message: 'User not Found' }); // if user not found, send message in response
    }
}));

// this is the POST request for sigin in
// POST requests have body variable where receiving all data
userRouter.post('/signin', expressAsyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email }); // Finding the user by email (req.body.email means email in the body of the request)
    if (user) { // if user found
        if (bcrypt.compareSync(req.body.password, user.password)) { // Comparing the user entered password and stored password
            res.send({  //if passwords match, send user data in response
                _id: user._id,
                image: user.image,
                fullName: user.fullName,
                email: user.email,
                token: generateToken(user),
            });
        return;
        }
    }
    res.status(401).send({ // user not found or password is incorrect send message in response
        message: 'Invalid email or password'});
    })
);

// this is the POST request for registering new user
userRouter.post('/register', expressAsyncHandler(async (req, res) => {
    const user = new User({  // send received data according to the schema defined for User
        fullName: req.body.fullName,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 8),
    });
    const createdUser = await user.save();  // MongoDB function to save the save in database, await is for waiting until the user is saves
    res.send({ // Send Created user in response
        _id: createdUser._id,
        fullName: createdUser.fullName,
        image: createdUser.image,
        email: createdUser.email,
        token: generateToken(createdUser),
    });
}));

// This is the PUT request to update the user data
userRouter.put('/update/:id', expressAsyncHandler(async (req, res) => {
    User.findByIdAndUpdate({ _id: req.params.id }, req.body).then(function () { // finding user by id and updating it with the data received in the body
        User.findOne({ _id: req.params.id }).then(function (updatedUser) {
            res.send(updatedUser); // if user updated, send the user in response
        }).catch(() => {
            res.send({ message: 'User not Updated' }); //if user not updated due to some errors
        });
    }).catch(() => {
        res.send({ message: 'User not Found' }); // if user not found
    });
}));

// This is the DELETE request to delete the particular user by id
userRouter.delete('/delete/:id', expressAsyncHandler(async (req, res) => {
    User.findByIdAndDelete({ _id: req.params.id }).then(function () { // finding user by the id received in the link and deleting the user
        res.status(200).send({  // if user found and deleted
        message: 'User Deleted'});
    }).catch(() => {
        res.status(400).send({ message: 'User not Found' }); // if user not found
    });
}));

// This is the POST request to upload and save profile picture of the particular user
userRouter.post('/upload/:id', expressAsyncHandler(async (req, res) => {
    const __dirname = path.resolve();
    if (req.files === null) {  // Check if the file is received
        res.status(400).json({ message: 'No file uploaded' })
    }else{
        console.log("file==>", req.files)

    const file = req.files.myFile;
    const filename = req.files.myFile.name;
        let i = filename.lastIndexOf('.');
        const fileExt = filename.substr(i);

    fs.access(`${__dirname}/uploads`,  // Check if the uploads folder is present
        fs.constants.F_OK, async noFolder => {
            if (noFolder) {  // If not present, then create one
                fs.mkdir(`${__dirname}/uploads`, function (err) {
                    if (err) {
                        console.log(err)
                    } else {
                        console.log("New directory successfully created.")  // Folder created
                    }
                });
            }
    });
    const user = await User.findOne({ _id: req.params.id }); // Finding the user by _id
    user.image=`${req.params.id}${fileExt}`;
    await user.save();
    file.mv(`${__dirname}/uploads/${req.params.id}${fileExt}`, err => {  // if file is received then move the file to the uploads folder
        if (err) {
            console.error(err);
            res.send(500).send(err)
        }
        res.send({ message: "File uploaded successfully" });
    })
}
}
));

// This is the GET request to return the profile picture of the particular user
userRouter.get('/image/:id', expressAsyncHandler(async (req, res) => {
    const __dirname = path.resolve();
    const user = await User.findOne({ _id: req.params.id }); // Finding the user by _id
    if(user){
        const fileName = user.image;
        // const imagePath = `${__dirname}/uploads/profile.jpg`;
        if(fileName===''){
            res.sendFile(`${__dirname}/uploads/default.png`); //If no picture is uploaded then return the default image
        }else{
            const imagePath = `${__dirname}/uploads/${fileName}`;
            res.sendFile(imagePath);  // Return user image
        }
    }else{
        res.sendFile(`${__dirname}/uploads/default.png`);
    }

}));

export default userRouter;  // exporting the router so that it can be used in the server.js file
