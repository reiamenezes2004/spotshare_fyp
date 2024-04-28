const express = require('express');
const app = express();
const MongoClient = require('mongodb').MongoClient;
const { ObjectId } = require('mongodb');
const path = require('path');


// Logger middleware function
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next(); // Pass control to the next middleware function
});

// CORS middleware
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');
    next();
});

app.use(express.json());


let db;


MongoClient.connect('mongodb+srv://reia2004:reia1326@cluster0.ykxntib.mongodb.net/', (err, client) => {
    if (err) {
        console.error('Error connecting to MongoDB:', err);
        return;
    }
    console.log('Connected to MongoDB');
    db = client.db('spotshare');
});



app.get('/', (req, res) => {
    res.send('Select a collection, e.g., /collection/messages');
});

// app.param('collectionName', (req, res, next, collectionName) => {
//     req.collection = db.collection(collectionName);
//     return next();
// });

app.param('id', (req, res, next, id) => {
    req.id = ObjectId(id);
    next();
  });


app.get('/collection/:collectionName', (req, res, next) => {
    req.collection.find({}).toArray((err, results) => {
        if (err) return next(err);
        res.send(results);
    });
});


// Handle form submission
app.post('/renterregistrations', (req, res) => {
    const formData = req.body;

    const name = formData.name,
        email = formData.email,
        password = formData.password,
        phone = formData.phone,
        gender = formData.gender, 
        age = formData.age,
        nationality = formData.nationality,
        parkingSpaces = formData.parkingSpaces;

    // Insert the registration data into the renterregistrations collection
    db.collection('renterregistrations').insertOne({
        name,
        email,
        password,
        phone,
        gender,
        age,
        nationality,
        parkingSpaces,
    }, (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error saving registration data');
        } else {
            console.log('Renter Registration data saved successfully');
            res.send("successfull");
        }
    });
});

  // Handle search listings
  app.post('/searchlistings', (req, res) => {
    const query = req.body.query.trim().toLowerCase();

    // Search for listings that match the query
    db.collection('renterlistings').find({
        $or: [
            { parkingName: { $regex: query, $options: 'i' } }, // Case-insensitive search for parkingName
            { spaceType: { $regex: query, $options: 'i' } }, // Case-insensitive search for spaceType
            { locationDetails: { $regex: query, $options: 'i' } }, // Case-insensitive search for locationDetails
            // Add more fields to search here if needed
        ]
    }).toArray((err, listings) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error searching listings');
        } else {
            res.json(listings);
        }
    });
});


// Handle form submission
app.post('/userregistrations', (req, res) => {
    const formData = req.body;

    const name = formData.name,
        email = formData.email,
        password = formData.password,
        phone = formData.phone,
        gender = formData.gender, 
        age = formData.age,
        nationality = formData.nationality

    // Insert the registration data into the renterregistrations collection
    db.collection('userregistrations').insertOne({
        name,
        email,
        password,
        phone,
        gender,
        age,
        nationality,
    }, (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error saving registration data');
        } else {
            console.log('User Registration data saved successfully');
            res.send("successfull");
        }
    });
});

app.post('/loginrenter', (req, res) => {
    const formData = req.body;

    const email = formData.email;
    const password = formData.password;

    // Insert the login data into the loginrenter collection
    db.collection('loginrenter').insertOne({
        email: email,
        password: password,
    }, (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error saving login data');
        } else {
            console.log('Renter Login data saved successfully');
            res.send("successful");
            // Redirect to the login page
        }
    });
});

app.post('/loginuser', (req, res) => {
    const formData = req.body;

    const email = formData.email;
    const password = formData.password;

    // Insert the login data into the loginrenter collection
    db.collection('loginuser').insertOne({
        email: email,
        password: password,
    }, (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error saving login data');
        } else {
            console.log('User Login data saved successfully');
            res.send("successful");
            // Redirect to the login page
        }
    });
});
// Handle form submission for updating listings
app.put('/renterlistings/:id', (req, res) => {
    const listingId = req.params.id;
    const formData = req.body;

    // Update the listing in the renterlistings collection
    db.collection('renterlistings').updateOne(
        { _id: ObjectId(listingId) }, // Filter
        { $set: formData }, // Update fields
        (err, result) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error updating listing');
            } else {
                console.log('Listing updated successfully');
                res.send('successful');
            }
        }
    );
});

app.get('/renter/renter-dashboard.html', (req, res) => {
    db.collection('listings').find().toArray((err, listings) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error fetching listings');
        } else {
            res.sendFile(path.join(__dirname, 'renter-dashboard.html'), { listings });
        }
    });
});
app.post('/renterlistings', (req, res) => {
    const formData = req.body; // Check if req.body contains the form data correctly

    // Log formData to see if it contains the expected data
    console.log(formData);

    // Assuming formData contains the expected keys
    const newListing = {
        parkingName: formData.parkingName,
        spaceType: formData.spaceType,
        capacity: parseInt(formData.capacity),
        dayTimePricing: formData.dayTimePricing,
        locationDetails: formData.locationDetails,
        price: formData.price,
    };

    db.collection('renterlistings').insertOne(newListing, (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error saving new listing');
        } else {
            console.log('New listing saved successfully');
            res.send('successful');
        }
    });
});

app.post('/renter-requests', (req, res) => {
    // Handle the renter request here
    const requestData = req.body;

    // Send a response back to the client
    res.send('Renter request received successfully');
});

app.delete('/renterlistings', (req, res) => {
    const listingId = req.params.id;
  
    // Delete the listing from the renterlistings collection
    db.collection('renterlistings').deleteOne(
      { _id: ObjectId(listingId) }, // Filter
      (err, result) => {
        if (err) {
          console.error(err);
          res.status(500).send('Error deleting listing');
        } else {
          console.log('Listing deleted successfully');
          res.send('successful');
        }
      }
    );
  });




const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});