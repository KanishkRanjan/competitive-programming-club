import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.DB_URI|| '';

export const connect = async ()=>{
    try {
        if(!MONGO_URI){
            throw {errmsg :"Problem when getting MONGO URL. Check .env file"};
        }
        await mongoose.connect(MONGO_URI);
        console.log("connected successfully");
    } catch(err:any) {
        console.error(err.errmsg);
        process.exit(0);
    }
}

