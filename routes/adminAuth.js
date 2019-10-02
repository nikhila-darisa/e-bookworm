const Router = require("express").Router
const router = Router()
var cloudinary = require('../config/cloudinary')
var upload = require('../config/multer')
require('dotenv').config()
router.get('/admin', function (req, res) {
    res.render('adminlogin')
})
router.post('/adminauth', function (req, res) {
    var db = req.app.locals.db;
    var flag = false;
    db.collection('admin').find({}).toArray(function (err, result) {
        for (var i = 0; i < result.length; i++) {
            if (result[i].username == req.body.username && result[i].password == req.body.password) {
                flag = true;
                adminid = result[i]._id
                username = result[i].username
                adminDetails = result[i]
            }
        }
        if (flag == true) {
            req.session.adminloggin = true
            req.session.adminname = username
            req.session.userid = adminid
            req.session.adminDetails = adminDetails
            db.collection('users').find({}).toArray(function (err, result) {
                if (err) throw err
                if (result.length > 0) {
                    req.session.userscount = parseInt(result.length);
                }
            })
            db.collection('users').find({}).toArray(function (err, result) {
                if (err) throw err
                const userOrder = []
                var orderLength = 0;
                if (result.length > 0) {
                    for (var i = 0; i < result.length; i++) {
                        userOrder
                        if (result[i].orders.length) {
                            orderLength = orderLength + result[i].orders.length
                            const { _id, name, emailid, address, orders } = result[i]
                            userOrder.push({ _id, name, emailid, address, orders })
                        }
                    }
                    req.session.orderQuantity = orderLength
                    req.session.userOrder = userOrder
                }
            })
            db.collection('bookdetails').find({}).toArray(function (err, result) {
                if (err) throw err
                if (result.length > 0) {
                    req.session.bookscount = parseInt(result.length);
                }
                req.session.adminDetails = adminDetails,
                    res.redirect('/dashboard')
            })
        } else {
            res.render('adminlogin', {
                errormsg: "Invalid username or password"
            })
        }
    })
});
router.get('/dashboard', function (req, res) {
    var db = req.app.locals.db;
    if (req.session.adminloggin) {
        db.collection('users').find({}).toArray(function (err, result) {
            if (err) throw err
            const userOrder = []
            var orderLength = 0;
            if (result.length > 0) {
                for (var i = 0; i < result.length; i++) {
                    if (result[i].orders.length) {
                        orderLength = orderLength + result[i].orders.length
                        const { _id, name, emailid, address, orders } = result[i]
                        userOrder.push({ _id, name, emailid, address, orders })
                    }
                }
                req.session.orderQuantity = orderLength
            }
        })
        res.render('dashboard.hbs', {
            style: "dashboard.css",
            layout: 'admin.hbs',
            useOrder: req.session.userOrder,
            adminname: req.session.adminname,
            userscount: req.session.userscount,
            bookscount: req.session.bookscount,
            notification: req.session.notification,
            adminDetails: req.session.adminDetails,
            orderQuantity: req.session.orderQuantity
        })
    } else {
        res.redirect('/admin')
    }
})
router.get('/categorytype/:category', function (req, res) {
    if (req.session.adminloggin) {
        var db = req.app.locals.db
        db.collection('bookdetails').find({ "category": req.params.category }).toArray(function (error, result) {
            if (result.length > 0) {
                res.render('category', {
                    style: "categorytype.css",
                    layout: 'admin.hbs',
                    data: result,
                    script: 'category.js',
                    adminDetails: req.session.adminDetails,
                    category: req.session.category,
                    adminname: req.session.adminname
                })
            // } else {
            //     res.send("Sorry no books are available under this category")
            }
        })
    } else {
        res.redirect('/admin')
    }
})
router.post('/addbook', upload.single('picture'), function (req, res, next) {
    cloudinary.uploader.upload(req.file.path, function (error, result) {
        if (req.session.adminloggin) {
            var db = req.app.locals.db
            var insertbook = {
                name: req.body.name,
                author: req.body.author,
                category: req.body.category,
                price: req.body.price,
                ISBN: req.body.ISBN,
                count: req.body.count,
                imagepath: result.secure_url
            }
            var category = insertbook.category
            req.session.category = category,
                db.collection('bookdetails').insertOne(insertbook, function (err, result) {
                    if (err) throw err;
                    req.session.category = category
                    res.redirect('/categorytype/' + category)
                })
        } else {
            res.redirect('/admin')
        }
    });
})
router.post('/updatebook/:bookid', upload.single('picture'), function (req, res, next) {
    if (req.session.adminloggin) {
        var db = req.app.locals.db
        var updatebook = {
            name: req.body.name,
            author: req.body.author,
            category: req.body.category,
            quantity: req.body.quantity,
            price: req.body.price,
            ISBN: req.body.ISBN,
            count: req.body.count,
        }
        // console.log(updatebook)
        var category = updatebook.category
        req.session.category = category,
            db.collection('bookdetails').updateOne({ _id: require('mongodb').ObjectId(req.params.bookid) }, { $set: updatebook }, function (err, result) {
                if (err) throw err;
                req.session.category = category
                res.redirect('/categorytype/' + category)
            })
    } else {
        res.redirect('/admin')
    }
})
// router.post('/addbook/:result', upload.single('picture'), function (req, res, next) {
//     cloudinary.uploader.upload(req.file.path, function (error, result) {
//         if (req.session.adminloggin) {
//             var data = JSON.parse(req.params.result)
//             var db = req.app.locals.db
//             console.log(data)
//             console.log('hhhh')
//             // var insertbook = {
//             //     name: data.name,
//             //     author: data.author,
//             //     category: data.category,
//             //     price: data.price,
//             //     ISBN: data.ISBN,
//             //     count: data.count,
//             //     imagepath: data.secure_url
//             // }
//             // var category = insertbook.category
//             // req.session.category = category,
//             //     console.log(insertbook)
//             // db.collection('sell').insertOne(insertbook, function (err, result) {
//             //     if (err) throw err;
//             //     req.session.category = category
//             //     res.redirect('/categorytype/' + category)
//             // })
//         } else {
//             res.redirect('/admin')
//         }
//     });
// })
router.delete('/deleteproduct/:val', function (req, res) {
    var id = req.params.val
    // console.log(id)
    var db = req.app.locals.db;
    db.collection('bookdetails').deleteOne({ _id: require('mongodb').ObjectId(id) }, function (err, result) {
        if (err) throw err
        res.json('deleted')
    })
})
router.get('/getdetails/:val', function (req, res) {
    if (req.session.adminloggin) {
        var id = req.params.val;
        var db = req.app.locals.db;
        db.collection("bookdetails").findOne({ _id: require('mongodb').ObjectId(req.params.val) }, function (err, result) {
            if (err) throw err
            if (result) {
                res.render('updatebook.hbs', {
                    layout: 'admin.hbs',
                    adminDetails: req.session.adminDetails,
                    bookdetails: result
                })
            }
        })
    } else {
        res.redirect('/admin')
    }
})
router.get('/adminusers', function (req, res) {
    if (req.session.adminloggin) {
        let db = req.app.locals.db;
        db.collection('admin').find({}).toArray(function (err, result) {
            if (err) throw err
            if (result.length > 0) {
                res.render('adminusers.hbs', {
                    adminusers: result,
                    layout: 'admin.hbs',
                    adminDetails: req.session.adminDetails,
                    script: 'adminusers.js',
                    style: 'adminusers.css'
                })
            }
        })
    } else {
        res.redirect('/admin')
    }
})
router.post('/addadmin/:newadmin', function (req, res) {
    if (req.session.adminloggin) {
        var db = req.app.locals.db
        var data = JSON.parse(req.params.newadmin)
        db.collection('admin').insertOne(data, function (err, result) {
            if (err) throw err
            if (result) {
                res.json('successmessage')
            }
        })
    } else {
        res.redirect('/login')
    }
})
router.get('/orders', function (req, res) {
    if (req.session.adminloggin) {
        var db = req.app.locals.db;
        db.collection('users').find({}).toArray(function (err, result) {
            if (err) throw err
            const userOrder = []
            if (result.length > 0) {
                for (var i = 0; i < result.length; i++) {
                    if (result[i].orders.length) {
                        const { _id, name, emailid, address, orders } = result[i]
                        userOrder.push({ _id, name, emailid, address, orders })
                    }
                }
                req.session.userOrder = userOrder
                res.render('orderquantity', {
                    layout: 'admin.hbs',
                    useOrders: req.session.userOrder,
                    adminname: req.session.adminname,
                    adminDetails: req.session.adminDetails,
                }
                )
            } else {
                res.render('feedback.hbs', {
                    layout: 'admin.hbs',
                    error: "No Orders",
                    adminDetails: req.session.adminDetails,
                    loggedin: req.session.adminloggin
                })
            }
        })
    } else {
        res.redirect('/admin')
    }
})
router.get('/query', function (req, res) {
    if (req.session.adminloggin) {
        var db = req.app.locals.db;
        db.collection('contactinfo').find({}).toArray(function (err, result) {
            if (err) throw err
            if (result.length > 0) {
                res.render('query.hbs', {
                    layout: 'admin.hbs',
                    adminDetails: req.session.adminDetails,
                    result: result
                })
            }
        })
    } else {
        res.redirect('/admin')
    }
})
router.get('/:bookId/userOrderCart', function (req, res) {
    if (req.session.adminloggin) {
        var db = req.app.locals.db;
        var userOrder = req.session.userOrder
        console.log(userOrder)
        db.collection('users').findOne({ _id: require('mongodb').ObjectId(req.params.bookId) }, function (err, result) {
            if (err) throw err
            if (result) {
                res.render('useradmincart.hbs', {
                    layout: 'admin.hbs',
                    result: result,
                    userOrder: req.session.userOrder,
                    adminDetails: req.session.adminDetails,
                    adminname: req.session.adminname
                })
            }
        })
    } else {
        res.redirect('/admin')
    }
})
router.post('/updateprofile', function (req, res) {
    if (req.session.adminloggin) {
        var db = req.app.locals.db;
        var updateDetails = req.body
        db.collection('admin').updateOne({ _id: require('mongodb').ObjectId(adminid) }, { $set: updateDetails }, function (err, result) {
            if (err) throw err;
            if (result) {
                req.session.adminDetails = updateDetails;
                res.json({success:"updated"})
            }
        })
    } else {
        res.redirect('/admin')
    }
})
router.get("/logout", function (req, res) {
    req.session.destroy();
    res.redirect("/admin");
});
//end admin routes
module.exports = router