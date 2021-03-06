const mongoose = require("mongoose");
const Trek = require('../models/treks');
//const cities = require('./cities');
//const { places, descriptors } = require('./trek_title');


mongoose.connect("mongodb://localhost:27017/trek-yatra",
    err => {
        if (err) throw err;
        console.log('connected to MongoDB')
    });

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const example = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Trek.deleteMany({});
    for (let i = 0; i < 300; i++) {
        const rand = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 3000) + 1000
        const tk = new Trek({
            author: '619fbaf226fcc3c49e8d1907',
            location: `${cities[rand].city},${cities[rand].state}`,
            title: `${example(descriptors)} ${example(places)}`,
            description: "mysterious mountains of kanhala",
            organization: "Kansuri Private Ltd.",
            price,
            geometry:{
                type:"Point",
                coordinates:[
                    cities[rand].longitude,
                    cities[rand].latitude
                ],
            },
            images:[
                {
                    url: 'https://res.cloudinary.com/dnkeb5bcx/image/upload/v1637954507/trek-yatra/bves58csb0gkj1g8ehvi.jpg',
                    filename: 'trek-yatra/bves58csb0gkj1g8ehvi',
                    
                },
                {
                    url: 'https://res.cloudinary.com/dnkeb5bcx/image/upload/v1637954507/trek-yatra/lg1h3ectnb3cafyy35yx.jpg',
                    filename: 'trek-yatra/lg1h3ectnb3cafyy35yx',
                    
                }
            ]
        })
        await tk.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})