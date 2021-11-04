const mongoose = require('mongoose');
require('dotenv').config();

module.exports = {
  connect: function () {
    mongoose.connect(process.env.DB_URL || "mongodb+srv://auctioneer:auctioneer@auctioneer.8a46i.mongodb.net/my_app?retryWrites=true&w=majority", { 'useNewUrlParser': true, 'useUnifiedTopology': true }).then(() => {
      console.log('Database connected successfully')
    }).catch(err => {
      console.log('Error', err);
    });
    return mongoose.connection;
  }
};