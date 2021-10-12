const sqlite3 = require("sqlite3").verbose();
const express = require("express");
const path = require("path");

// Connect to SQLite database
const db_name = path.join(__dirname, "data", "database.db");
const db = new sqlite3.Database(db_name, err => {
  if (err) {
    return console.error(err.message);
  }
  console.log("Successful connection to the database 'database.db'");
});

// Create User table.  This can be done using SQLite cli or gui
// But for development including here
const sql_create = `CREATE TABLE IF NOT EXISTS users (
  ID INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  city VARCHAR(100) NOT NULL,
  country VARCHAR(100) NOT NULL
);`;

db.run(sql_create, err => {
  if (err) {
    return console.error(err.message);
  }
  console.log("Successful creation of the 'Users' table");
  // Database seeding
  // const sql_insert = `INSERT INTO users (ID, name, email, city, country) VALUES
  // (1, 'John Smith', 'john@smith.com', 'Perth', 'Australia'),
  // (2, 'Sue Bridges', 'suebridges@gmail.com', 'Sydney', 'Australia'),
  // (3, 'Toni Johns', 'tj@microsoft.com.au', 'Melbourne', 'Australia');`;
  // db.run(sql_insert, err => {
  //  if (err) {
  //    return console.error(err.message);
  //  }
  //  console.log("Successful creation of 3 users");
  // });
});


// Creating the Express server app
const app = express();

// Configure the server
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false })); // <--- middleware configuration

// Start the server
app.listen(3000, () => {
  console.log("Server started (http://localhost:3000/) !");
});

// Configure routes
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/data", (req, res) => {
  const sql = "SELECT * FROM users ORDER BY name"
  db.all(sql, [], (err, rows) => {
    if (err) {
      return console.error(err.message);
    }
    res.render("data", { model: rows });
  });
});

app.get("/edit/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM users WHERE ID = ?";
  db.get(sql, id, (err, row) => {
    // if (err) ...
    res.render("edit", { model: row });
  });
});

app.post("/edit/:id", (req, res) => {
  const id = req.params.id;
  const user = [req.body.Name, req.body.Email, req.body.City, req.body.Country, id];
  const sql = "UPDATE users SET Name = ?, Email = ?, City = ?, Country = ? WHERE (ID = ?)";
  db.run(sql, user, err => {
    // if (err) ...
    res.redirect("/data");
  });
});

app.get("/create", (req, res) => {
  res.render("create", { model: {} });
});

app.post("/create", (req, res) => {
  const sql = "INSERT INTO users (Name, Email, City, Country) VALUES (?, ?, ?, ?)";
  const user = [req.body.Name, req.body.Email, req.body.City, req.body.Country];
  db.run(sql, user, err => {
    // if (err) ...
    res.redirect("/data");
  });
});

app.get("/delete/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM users WHERE ID = ?";
  db.get(sql, id, (err, row) => {
    // if (err) ...
    res.render("delete", { model: row });
  });
});

// POST /delete/5
app.post("/delete/:id", (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM users WHERE ID = ?";
  db.run(sql, id, err => {
    // if (err) ...
    res.redirect("/data");
  });
});
