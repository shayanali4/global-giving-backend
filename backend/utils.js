import jwt from 'jsonwebtoken'; // importing JSON web token to generate token

 //The utilities file to define all functions

export const generateToken = (user) => { //defining and exporting the function
    return jwt.sign({ // generating token
        _id: user._id,
        name: user.name,
        email: user.email,
    },
        process.env.JWT_SECRET || 'somethingsercret', // secret key for the token
    {
        expiresIn: '30d', // expiry time for the token
    });
};
