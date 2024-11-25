const mysql = require("mysql");

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'ruangtenun_db'
});

connection.connect((err) => {
  if(err){
    console.log(err);
  } else {
    console.log('DB Connection Successfully');
  }
})

module.exports = connection;