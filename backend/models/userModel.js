import mongoose from 'mongoose';

// The user Schema defined for mongodb using mongoose
// Defining the fields and their types also if unique and mandatory

const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    image: { type: String, default:''  },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
}, {
    timestamps: true,  // The timestamp which will store the creation date and update date of the record
});

const User = mongoose.model('User', userSchema);
export default User;  // Export this schema so that it can be used anywhere
