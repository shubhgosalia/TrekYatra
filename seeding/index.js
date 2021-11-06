const Trek=require('../models/trek');
const cities=require('./cities');

mongoose.connect("mongodb://localhost:27017/trek-yatra",
    err => {
        if(err) throw err;
        console.log('connected to MongoDB')
    });

    const db=mongoose.connection;
    db.on("error",console.error.bind(console,"connection error:"));
    db.once("open",()=>{
        console.log("Database connected");
    });

const seedDB=async()=>{
    await Trek.deleteMany({});

}

seedDB();