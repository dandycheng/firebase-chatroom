// Firebase

let admin = require('firebase-admin')
let serviceAccount = require('./chat-room-d1e5c-firebase-adminsdk-3uqzt-fac2e59a80.json')

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://chat-room-d1e5c.firebaseio.com"
});
let firestore = admin.firestore()
var db = admin.database();

// Express
let express = require('express')
let app = express()


// Send redirect link after login
app.use('/login',function(req,res){
    let userId = req.query.userId
    firestore.collection('users').doc(userId).get()
        .then(function(snapshot){
            if(snapshot.data() !== undefined)
                res.send(snapshot.data().isAdmin ? '/../admin-panel/admin-panel.html': '/../dashboard/dashboard.html')
        })
        .catch(function(err){
            console.log(err)
        })
})

// Fetch room data (JSON)
app.get('/rooms/:roomHostUserId',function(req,res){
    let roomId = req.params.roomHostUserId
    let ref = db.ref('rooms')
    ref.on('value',function(sn){
            let snapshot = sn.val()
            for(let x of Object.keys(snapshot)){
                if(snapshot[x].joinId === roomId){
                    res.write(JSON.stringify(snapshot[x],null,2))
                    res.end()
                }
            }
            // Only reachable when chatroom data is not found
            res.status(404).send()
        })
})

// Add user to cloud firestore
app.post('/signUp',function(req,res){
    firestore.collection('users').doc(req.query.userId).set({
        username:req.query.username,
        email:req.query.email,
        isAdmin:false
    })
        .then()
})

app.listen(8080)
