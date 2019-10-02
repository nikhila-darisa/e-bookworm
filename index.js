var express = require('express')
var session = require('express-session');
var mongoClient = require('mongodb').MongoClient;
var session = require('express-session')
var bodyParser = require('body-parser');
var cloudinary = require('./config/cloudinary')
var upload = require('./config/multer.js')
require('dotenv').config()



// var multer = require('multer')
// var upload = multer({ dest: 'uploads/' })
// var cloudinary = require('cloudinary').v2;
var app = express();
const url = process.env.mongo_url;
var db;
mongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, function (error, client) {
    if (error) throw error
    db = client.db('schema');
    app.locals.db = db;
})
app.use(session({
    secret: 'this is secured login',
    resave: true,
    saveUninitialized: true
}))
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json())
app.use(express.static('assests'))
app.use(express.static('views'))
app.use(express.static('admin'))
app.use(express.static('scripts'))
app.use(express.static('routes'))
app.use('/images', express.static('images'))
app.set('view engine', 'hbs')
//cloudinary
// cloudinary.config({
//     cloud_name: process.env.CLOUD_NAME,
//     api_key: process.env.API_KEY,
//     api_secret: process.env.API_SECRET
// });
//end cloudinary


// Admin router
const adminAuth = require('./routes/adminAuth')

//ROuter middleware
app.use("/", adminAuth)
//routes
app.get('/login', function (req, res) {
    res.render('userlogin.hbs', {
        errmsg: req.session.errmsg
    })
})
app.get('/signUp', function (req, res) {
    res.sendFile(__dirname + "/forms/signUp.html")
})
app.post('/auth', function (req, res) {
    var flag = false;
    var username;
    db.collection('users').find({}).toArray(function (err, result) {
        for (var i = 0; i < result.length; i++) {
            if (result[i].username == req.body.username && result[i].password == req.body.password) {
                flag = true;
                userid = result[i]._id
                username = result[i].username
            }
        }
        if (flag == true) {
            req.session.loggedIn = true
            req.session.userid = userid
            db.collection("users").findOne({ _id: userid }, function (err, result) {
                if (err) throw error
                if (result) {
                    var cart = result.cart
                    var quantity = 0
                    for (var i = 0; i < cart.length; i++) {
                        quantity = quantity + parseInt(cart[i].quantity)
                    }
                    db.collection('users').findOne({ _id: userid }, function (err, result) {
                        if (err) throw err
                        if (result) {
                            const { name, username, emailid, password, phonenumber } = result
                            req.session.userdetails = { name, username, emailid, password, phonenumber }
                            req.session.address = result.address
                        }
                        req.session.username = username,
                            req.session.notification = quantity,
                            res.redirect('/')
                    })
                } else {
                    req.session.notification = 0
                    res.redirect('/')
                }
            })
        } else {
            res.render('userlogin', {
                errormsg: 'Invalid username or password'
            })
        }
    })
})
app.put('/updateuser', function (req, res) {
    db.collection('users').updateOne({ username: req.body.username }, { $set: { "password": req.body.password } }, function (error, result) {
        if (error) throw error;
        res.redirect('/login')
    })
})
app.get("/users", function (req, res) {
    if (req.session.loggedIn == true) {
        res.sendfile("./home.html");
    }
    else {
        res.redirect("/");
    }
});
app.get('/forgotpassword', function (req, res) {
    res.sendFile(__dirname + '/forms/forgotpassword.html')
})
app.post("/signup", function (req, res) {
    db.collection('users').insertOne({ ...req.body, cart: [], address: [] }, function (error, result) {
        if (error) throw error;
        res.redirect('/login')
    })
});
app.get('/', function (req, res) {
    db.collection('bookdetails').find({}).toArray(function (error, result) {
        if (result.length > 0) {
            res.render('home', {
                layout: 'main.hbs',
                style: "home.css",
                loggedin: req.session.loggedIn,
                username: req.session.username,
                adminloggin: req.session.adminloggin,
                userid: req.session.userid,
                userdetails: req.session.userdetails,
                data: result,
                notification: req.session.notification
            })
        } else {
            res.send("Sorry no books are available under this category")
        }
    })
})
app.get('/contact', function (req, res) {
    res.render('contact.hbs', {
        layout: 'main.hbs',
        title: "Contact Us",
        username: req.session.username,
        notification: req.session.notification,
        userid: req.session.userid,
        userdetails: req.session.userdetails,
        loggedin: req.session.loggedIn,
        style: "contact.css"
    })
})
app.get('/sell', function (req, res) {
    if (req.session.loggedIn) {
        res.render('sell.hbs', {
            layout: 'main.hbs',
            userid: req.session.userid,
            userdetails: req.session.userdetails,
            notification: req.session.notification,
            loggedin: req.session.loggedIn,
            title: "Sell your book",
        })
    } else {
        res.render('sell.hbs', {
            layout: 'main.hbs',
            title: "Sell your book",
        })
    }
})
app.get('/about', function (req, res) {
    res.render('about.hbs', {
        layout: 'main.hbs',
        username: req.session.username,
        userid: req.session.userid,
        userdetails: req.session.userdetails,
        notification: req.session.notification,
        loggedin: req.session.loggedIn,
        title: "About Us",
    })
})
app.get('/terms', function (req, res) {
    res.render('terms.hbs', {
        layout: 'main.hbs',
        userid: req.session.userid,
        userdetails: req.session.userdetails,
        username: req.session.username,
        notification: req.session.notification,
        loggedin: req.session.loggedIn,
        title: "Terms and Conditions",
    })
})
app.get('/cart', function (req, res) {
    res.render('cart.hbs', {
        userid: req.session.userid,
        userdetails: req.session.userdetails,
        username: req.session.username,
        loggedin: req.session.loggedIn,
        title: "Your cart",
    })
})
app.get('/privacy', function (req, res) {
    res.render('privacy.hbs', {
        layout: 'main.hbs',
        userid: req.session.userid,
        userdetails: req.session.userdetails,
        username: req.session.username,
        notification: req.session.notification,
        loggedin: req.session.loggedIn,
        title: "privacy",
    })
})
//end routes
//To upload data
app.get('/form', function (req, res) {
    res.sendFile(__dirname + '/forms/form.html')
});
//end upload data
//Crud operation->Book uploads
app.post('/details', upload.single('picture'), function (req, res, next) {
    cloudinary.uploader.upload(req.file.path, function (error, result) {
        var data = {
            name: req.body.name,
            author: req.body.author,
            category: req.body.category,
            price: req.body.price,
            ISBN: req.body.ISBN,
            count: req.body.count,
            Variation: req.body.Variation,
            imagepath: result.secure_url
        }
        db.collection('bookdetails').insertOne(data, function (error, result) {
            if (error) throw error
            res.send("Inserted")
        })
    });
})
//end uploading
//read
app.get('/getbooks', function (req, res, next) {
    db.collection('bookdetails').find({}).toArray(function (error, result) {
        if (error) throw (error)
        if (result.length > 0) {
            res.render('book.hbs', {
                title: "example",
                style: "book.css",
                loggedin: req.session.loggedIn,
                data: result
            })
        } else {
            res.send("Sorry books are not available")
        }
    })
});
app.put('/updatebook', function (req, res) {
    db.collection('bookdetails').updateOne({ '_id': require('mongodb').ObjectID(req.query.id) }, { $set: { "name": req.query.name } }, function (error, result) {
        if (error) throw (error)
        res.json(result)
    })
});
app.delete('/deletebook', function (req, res) {
    db.collection('bookdetails').deleteOne({ _id: require('mongodb').ObjectId(req.query.id) }, function (err, result) {
        if (err) throw err
        res.json(result)

    })
});
//End crud operations
//categories
app.get('/category/:category', function (req, res) {
    db.collection('bookdetails').find({ "category": req.params.category }).toArray(function (error, result) {
        if (result.length > 0) {
            res.render('book.hbs', {
                style: "../book.css",
                // script: "book.js",
                data: result,
                layout: 'main.hbs',
                userid: req.session.userid,
                userdetails: req.session.userdetails,
                username: req.session.username,
                notification: req.session.notification,
                loggedin: req.session.loggedIn
            })
        } else {
            res.send("Sorry no books are available under this category")
        }
    })
})

//end categories
//Get all Books
app.get('/details', function (req, res) {
    res.render('details.hbs', {
        layout: 'main.hbs',
        title: "Book Info",
        script: "book.js",
        style: "detail.css"
    })
})
//End 
//sell book
app.post('/sell', upload.single('picture'), function (req, res) {
    if (req.session.loggedIn == true) {
        cloudinary.uploader.upload(req.file.path, function (error, result) {
            var data = {
                email: req.body.email,
                name: req.body.name,
                author: req.body.author,
                category: req.body.category,
                price: req.body.price,
                ISBN: req.body.ISBN,
                count: req.body.count,
                Variation: req.body.Variation,
                imagepath: result.secure_url
            }
            db.collection('sell').insertOne(data, function (error, result) {
                if (error) throw error
                res.render('feedback.hbs', {
                    layout: 'main.hbs',
                    loggedin: req.session.loggedIn,
                    error: 'Thanks for selling Let you feedback'
                })
            })
        });
    } else {
        res.redirect('/login')
    }
})
//end sell book
//search bar
app.get('/search/:name', function (req, res) {
    db.collection('bookdetails').find({ "name": req.params.name }).toArray(function (error, result) {
        if (result.length > 0) {
            res.render('search/searchdata.hbs', {
                layout: 'main.hbs',
                style: "../book.css",
                data: result,
                loggedin: req.session.loggedIn,
                username: req.session.username,
                notification: req.session.notification
            })
        } else {
            res.render('search/searcherror.hbs', {
                style: "../book.css",
                layout: 'main.hbs',
                username: req.session.username,
                loggedin: req.session.loggedIn,
                error: "Oops not available!!"
            });
        }
    })
})
//end search bar
//details
app.get('/details/:id', function (req, res, next) {
    db.collection('bookdetails').find({ "_id": require('mongodb').ObjectId(req.params.id) }).toArray(function (error, result) {
        if (result.length > 0) {
            res.render('details/bookdetails.hbs', {
                title: 'details',
                layout: 'main.hbs',
                style: "../book.css",
                userid: req.session.userid,
                userdetails: req.session.userdetails,
                username: req.session.username,
                notification: req.session.notification,
                loggedin: req.session.loggedIn,
                data: result
            })
        }
    })
})
app.put('/deleteproduct/:deleteid', function (req, res) {
    var deleteid = req.params.deleteid
    // var username = req.session.username
    // console.log(deleteid)
    // console.log(userid)
    db.collection('users').updateOne({ _id: require('mongodb').ObjectId(userid) }, { $pull: { "cart": { _id: require('mongodb').ObjectId(deleteid) } } }, function (error, result) {
        if (error) throw error;
        res.json('deleted')
    })

});
app.post('/addbook/:cartid', function (req, res, next) {
    if (req.session.loggedIn == true) {
        var id = req.params.cartid
        var currentuser = req.session.username
        db.collection('bookdetails').findOne({ _id: require('mongodb').ObjectId(id) }, function (error, result) {
            if (result) {
                var bookresult = result
                db.collection('users').findOne({ $and: [{ _id: { $eq: userid } }, { cart: { $elemMatch: { _id: bookresult._id } } }] }, function (error, result) {
                    if (result) {
                        // console.log(bookresult._id)
                        // console.log(result)
                        res.send("Already in Cart")
                    } else {
                        bookresult.quantity = 1
                        // console.log(bookresult)
                        db.collection('users').updateOne({ _id: userid }, { $push: { cart: bookresult } }, function (error, result) {
                            if (error) throw error
                            res.send('inserted')
                        })
                    }
                })
            } else {
                res.send("Invalid")
            }
        })
    } else {
        res.send('Do login')
    }
})

app.get('/cart/usercart', function (req, res, next) {
    if (req.session.loggedIn == true) {
        var total = 0, quantity = 0;
        db.collection("users").findOne({ _id: userid }, function (err, result) {
            if (err) throw error
            if (result) {
                var cart = result.cart
                if (cart.length > 0) {
                    for (var i = 0; i < cart.length; i++) {
                        quantity = quantity + parseInt(cart[i].quantity)
                        total += parseInt(cart[i].price) * parseInt(cart[i].quantity)
                    }
                    req.session.total = total
                    req.session.notification = quantity
                    res.render('cart.hbs', {
                        data: cart,
                        Total: req.session.total,
                        layout: 'main.hbs',
                        username: req.session.username,
                        loggedin: req.session.loggedIn,
                        notification: req.session.notification,
                        userid: req.session.userid,
                        userdetails: req.session.userdetails,

                    })

                }
                else {
                    res.render('feedback.hbs', {
                        layout: 'main.hbs',
                        error: "Cart is Empty",
                        userid: req.session.userid,
                        userdetails: req.session.userdetails,
                        username: req.session.username,
                        notification: req.session.notification,
                        loggedin: req.session.loggedIn
                    })
                }
            }
        })
    } else {
        res.redirect('/login')
    }
})
app.put("/book/:quantity/:id", function (req, res) {
    db.collection('users').updateOne({ $and: [{ cart: { $elemMatch: { _id: require('mongodb').ObjectId(req.params.id) } } }, { _id: require('mongodb').ObjectId(userid) }] }, { $set: { "cart.$.quantity": req.params.quantity } }, function (error, result) {
        if (error) throw error;
        res.json('Updated')
    })
});
app.post('/updateprofile/:data', function (req, res) {
    var updatedetails = JSON.parse(req.params.data)
    var updatedetails = {
        name: updatedetails.name,
        emailid: updatedetails.emailid,
        password: updatedetails.password,
        confirmpassword: updatedetails.password,
        phonenumber: updatedetails.phonenumber
    }
    // console.log(updatedetails)
    db.collection('users').updateOne({ _id: require('mongodb').ObjectId(userid) }, { $set: updatedetails }, function (err, result) {
        if (err) throw err;
        req.session.userdetails = updatedetails;
        res.json('updated')
    })
})
app.get('/delivery', function (req, res) {
    if (req.session.loggedIn) {
        res.render('delivery', {
            userid: req.session.userid,
            userdetails: req.session.userdetails,
            username: req.session.username,
            address: req.session.address,
            loggedin: req.session.loggedIn,
            notification: req.session.notification,
            layout: 'main.hbs',
        })
    } else {
        res.redirect('/login')
    }
})
app.get('/userorders', function (req, res) {
    if (req.session.loggedIn) {
        db.collection('users').findOne({ _id: userid }, function (err, result) {
            if (err) throw err
            if (result.orders.length > 0) {
                var ordersData = result.orders
                var price = result.orders.price
                var orderData=result.address.orderData
                const total = (ordersData) => {
                    return ordersData.reduce((total, item) => total + parseInt(item.price), 0)
                }
                var Total = total(ordersData)
                req.session.Total = Total
                req.session.orderData=orderData
                // console.log(orderData)
                // console.log(req.session.Total)
                res.render('userorders', {
                    ordersData: ordersData,
                    orderTotal: req.session.Total,
                    layout: 'main.hbs',
                    orderData:req.session.orderData,
                    userdetails: req.session.userdetails,
                    username: req.session.username,
                    notification: req.session.notification,
                    loggedin: req.session.loggedIn,
                })
            } else {
                res.render('feedback.hbs', {
                    layout: 'main.hbs',
                    error: "No Orders",
                    userid: req.session.userid,
                    userdetails: req.session.userdetails,
                    username: req.session.username,
                    notification: req.session.notification,
                    loggedin: req.session.loggedIn
                })
            }
        })
    } else {
        res.redirect('/login')
    }
})
app.put('/deleteorderproduct/:deleteid', function (req, res) {
    var deleteid = req.params.deleteid
    // var username = req.session.username
    // console.log(deleteid)
    // console.log(userid)
    db.collection('users').updateOne({ _id: require('mongodb').ObjectId(userid) }, { $pull: { "orders": { _id: require('mongodb').ObjectId(deleteid) } } }, function (error, result) {
        if (error) throw error;
        res.json('canceled')
    })

});
app.post('/buyproduct/:data', function (req, res) {
    if (req.session.loggedIn) {
        var data = JSON.parse(req.params.data)
        const { name, mobilenumber, pincode, landmark, town, state, orderData } = data
        var address = { name, mobilenumber, pincode, landmark, town, state, orderData }
        db.collection("users").findOne({ _id: userid }, function (err, result) {
            if (err) throw error
            if (result) {
                var cart = result.cart
                var myOrders = result.orders
                db.collection('users').updateOne({ _id: userid }, { $set: { orders: [...myOrders, ...cart], address: address } }, function (error, result) {
                    if (error) throw error
                    if (result) {
                        db.collection('users').updateOne({ _id: userid }, { $pull: { cart: { $exists: true } } }, function (error, result) {
                            if (error) throw error
                            req.session.notification = 0
                            res.json({
                                success: "Ordered successfully"
                            })
                        })
                    }
                })
            }
        })
    } else {
        res.redirect('/login')
    }
})
app.post('/contactdata/:data', function (req, res) {
    var data = JSON.parse(req.params.data)
    db.collection('contactinfo').insertOne(data, function (err, result) {
        if (err) throw err
        if (result) {
            res.json({
                success: "Thanks for feedback+"
            })
        }
    })
})
app.get("/:name/logout", function (req, res) {
    req.session.destroy();
    res.redirect("/");
});
app.listen(process.env.PORT || 8000)