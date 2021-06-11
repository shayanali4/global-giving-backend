import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import userRouter from './routers/userRouter.js'
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const fileUpload = require('express-fileupload');  // Requiring package for file upload

dotenv.config(); // getting data from .env file

const app = express(); // defining express app
app.use(fileUpload()); // Handling image upload in app

app.use(cors()) // After the variable declaration

app.use(express.json({ extended: false }));
app.use(express.urlencoded({ extended: true })); //handling data received in the request

// Defining mongoDB database location
mongoose.connect('mongodb+srv://Sarah01:user123456789@cluster0.z24j8.mongodb.net/DonationProject?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
})
    .then(() => console.log("MongoDB Connected"))  // if mongoDB is connected
    .catch(error => console.log("MongoDB Error : ", error)); // if any mongoDB error, send error in console

app.use('/users', userRouter);  //handle all user related requests and redirect to user router

app.get('/', (req, res) => {  // if everything is OK the server will run and will get "Server is Ready " in response
    res.send('Server is ready');
});

app.use((err, req, res, next)=> {  //if any error in the app, sending the particular error in the response
    res.status(500).send({message:err.message});
});

//This part is for local hosting, if locally host the app will run on port 5000
const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Serve at http://localhost:${port}`);
});
