const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host:'localhost',
    database: 'cell',
    user: 'root',
    password: 'Mramizsaud98%'
});

module.exports = {
    db: pool,
    mysql: mysql
};