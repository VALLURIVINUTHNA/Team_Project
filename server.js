const express = require("express");
const app = express();
const passwordHash = require("password-hash");
const bp = require("body-parser");

app.use(bp.json());
app.use(bp.urlencoded({ extended: true }));
app.set("view engine", "ejs");

const admin = require("firebase-admin");
const serviceAccount = require("./key.json");

const firebaseConfig = {
  credential: admin.credential.cert(serviceAccount),
};

admin.initializeApp(firebaseConfig);

const db = admin.firestore();

app.get("/signup.html", (req, res) => {
  res.sendFile(__dirname + "/signup.html");
});
app.get("/login.html",(req,res)=>{
    res.sendFile(__dirname+"/login.html");
})

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/home.html");
});
app.get("/home.html", function (req, res) {
  res.sendFile(__dirname + "/home.html");
});
app.get("/about.html", function (req, res) {
  res.sendFile(__dirname + "/about.html");
});
app.get("/contact.html", function (req, res) {
  res.sendFile(__dirname + "/contact.html");
});

app.get("/index.html", function (req, res) {
    res.sendFile(__dirname + "/index.html");
  });
app.get("/students.html",function(req,res){
    res.sendFile(__dirname+"/students.html");
});
app.get("/teachers.html",function(req,res){
    res.sendFile(__dirname+"/teachers.html");
});
app.get("/grades.html",function(req,res){
    res.sendFile(__dirname+"/grades.html");
});
app.get("/attendance.html",function(req,res){
    res.sendFile(__dirname+"/attendance.html");
});
app.get("/calendar.html",function(req,res){
    res.sendFile(__dirname+"/calendar.html");
});
app.get("/enrollments.html",function(req,res){
    res.sendFile(__dirname+"/enrollments.html");
});


app.post("/signupSubmit", function (req, res) {
    const fullname = req.body.fullname;
    const email = req.body.email;
    const password = req.body.pwd;
    if (!fullname || !email || !password) {
        return res.send("Please provide all required information.");
      }
  db.collection("userDemo")
    .where("email", "==", email)
    .get()
    .then((emailDocs) => {
      if (!emailDocs.empty) {
        res.send("An account with this email already exists.");
      } else {
        db.collection("userDemo")
          .where("fullname", "==", fullname)
          .get()
          .then((fullnameDocs) => {
            if (!fullnameDocs.empty) {
              res.send("An account with this fullname already exists.");
            } else {
              const hashedPassword = passwordHash.generate(password);
              db.collection("userDemo")
                .add({
                  fullname,
                  email,
                  password: hashedPassword,
                })
                .then(() => {
                  res.sendFile(__dirname + "/login.html");
                })
                .catch((error) => {
                  console.error("Error adding user: ", error);
                  res.send("Something went wrong");
                });
            }
          });
      }
    })
    .catch((error) => {
      console.error("Error checking for an existing user: ", error);
      res.send("Something went wrong");
    });
});




app.post("/loginsubmit", function (req, res) {
    const email = req.body.email;
    const password = req.body.pwd;
    console.log(password);
    if (!email || !password) {
      return res.send("Please provide both fullname and password.");
    }
    db.collection("userDemo")
      .where("email", "==", email)
      .get()
      .then((docs) => {
        if (!docs.empty) {
          const user = docs.docs[0].data();
          if (passwordHash.verify(password, user.password)) {
            res.sendFile(__dirname + "/index.html");
          } else {
            res.send("Authentication failed");
          }
        } else {
          res.send("User not found");
        }
      })
      .catch((error) => {
        console.error("Error searching for user: ", error);
        res.send("Something went wrong");
      });
  });
  

const port = process.env.PORT || 4001;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
