/**
 * server.js
 * csc 337
 * adler nguyen
 * this file holds the backend code for the ostaa project.
 * handles different routes with express and addsd to the database with
 * mongoose 
 */
// require dependencies
const express = require('express');
const mongoose = require('mongoose');
var bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();

app.use(express.static('public_html'));
app.use(cookieParser());
// constants that make editing easier
const uri = "mongodb+srv://adler:ostaa@ostaa-1.mrphvhy.mongodb.net/test";
const port = 5000;
const Schema = mongoose.Schema;

// connect to mongoose
mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

// User Schema
const userSchema = new Schema({
    userName: {
      type: String,
    },
    password: {
      type: String,
    },
    listings: [{
      type: Schema.Types.ObjectId,
      ref: 'Item'
    }],
    purchases: [{
      type: Schema.Types.ObjectId,
      ref: 'Item'
    }]
  });
  
const User = mongoose.model('User', userSchema);
// Item Schema
const itemSchema = new Schema({
  title: String,
  description: String,
  image: String,
  price: Number,
  stat: String
});

const Item = mongoose.model('Item', itemSchema);

app.use(bodyParser.json());

// add a user 
app.post('/add/user/', (req, res) => {
  const user = new User(req.body);
  user.save()
  .then(user => res.send(200))
  .catch(error => console.error('Error adding user to database:', error));
});

// adding an item
app.post('/add/item/:username', async (req, res) => {
  const username = req.params.username;
  const itemData = req.body;
  try{
    // looks through db for someone with that username
    User.findOne({userName: username})
      .then((user) =>{
        // if no user exists
        if(!(user)){
          throw new Error("User not Found")
        }
        // if a user exists
        // make new item
        const item = new Item(itemData);
        // add item to user's listings
        user.listings.push(item._id);
        // save the changes
        item.save()
        .then(item => {
          console.log('item added to database:', item)
          user.save()
        })
        .catch(error => console.error('Error adding item to database:', error));
      })
      .catch((err) =>{
        console.log(err)
      });
  }
  catch(error){
    console.log(error);
    res.status(500)
  }
});

/*
handles request for getting all users. returns a json array of all the users
*/
app.get("/get/users/", (req,res) => {
  // get every user in databse
  User.find()
  .then(users => {
    // send to front end
    res.json(users);
  })
  .catch(error => {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  })
});
/*
handles request for getting all itmes. returns a json array of all the items
*/
app.get("/get/items/", (req,res) => {
  // get every item in db
  Item.find()
  .then(items => {
    // send to frontend
    res.json(items);
  })
  .catch(error => {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  })
});
/**
 * handles request for  getting  all the listings of a specific username
 * returns as json array
 */
app.get("/get/listings/:username", (req,res) =>{
  // gets username from dynamic variable
  const username = req.params.username;
  // get the user document
  User.findOne({userName:username})
    // fill the array of ids with an array of item objects
    .populate("listings")
    .then( user => {
      // when the user doesnt exist
      if (!user) {
        return res.status(404).json({ message: `User ${username} not found` });
      }
      const listings = user.listings;
      // Convert the array of item documents to an array of plain objects
      const items = listings.map(listing => {
        return listing.toObject({ getters: true }); 
      });
      // send to the front end
      res.json(items);
    })
    .catch(error => {
      console.error(error);
      res.status(500).json({ message: 'Error' });
    });
});
/**
 * handles request for getting every purchase a user made
 *  returns a json array of the purchase. array is filled
 * with actual item objects not just ids
 */
app.get("/get/purchases/:username", (req,res) =>{
  const username = req.params.username;
  // get the user document
  User.findOne({userName:username})
    // fill the array of ids with an array of item objects
    .populate("purchases")
    .then( user => {
      // when the user doesnt exist
      if (!user) {
        return res.status(404).json({ message: "User ${username} not found"});
      }
      const purchases = user.purchases;
      // Convert the array of item documents to an array of plain objects
      const items = purchases.map(purchase => {
        return purchase.toObject({ getters: true });
      });
      res.json(items);
    })
    .catch(error => {
      console.error(error);
      res.status(500).json({ message: 'Error' });
    });
});
/**
 * handles request for finding every user that has a keyword in their name
 * returns a json array of every user that has that keyword in their name
 */
app.get('/search/users/:keyword', async (req, res) => {
  
  try {
    
    const keyword = req.params.keyword;
    // finds the users with the regex keyword
    const users = await User.find({ userName: { $regex: keyword} });
    // send to front end
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error' });
  }
});
/**
 * handles request for finding every item that has a keyword in their decriptions
 * returns a json array of every item that has that keyword in their description
 */
app.get('/search/items/:keyword', async (req, res) => {
  
  try {
    // handles the dynamic variable  
    const keyword = req.params.keyword;
    // find the items with the reegex keyword
    const items = await Item.find({ description: { $regex: keyword} });
    // send to front end
    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'error' });
  }
});
/*
handles a user login request
*/
app.get('/account/login/:username/:password',(req,res)=>{
    let u = req.params.username;
    let p = req.params.password;
    let p1 = User.find({username: u, password: p}).exec();
    p1.then((results) =>{
        if (results.length > 0){
            res.cookie("login", {username:u},{maxAge:120000});
            res.send(200);
        }
        else{
            res.end("login failed");
        }
    });
    p1.catch( (error) =>{
        res.end("login failed");
    });

});
// put the server live
app.listen(port, () => {
  console.log('Server started on port'+port);
});