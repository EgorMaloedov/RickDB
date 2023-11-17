"use strict";
const fs = require("fs");
const pg = require("pg");
const config = {
    connectionString: "postgres://candidate:62I8anq3cFq5GYh2u4Lh@rc1b-r21uoagjy1t7k77h.mdb.yandexcloud.net:6432/db1",
    ssl: {
        rejectUnauthorized: true,
        ca: fs
        .readFileSync("/home/mrm/.postgresql/root.crt")
        .toString(),
    },
};
    const conn = new pg.Client(config);
    conn.connect((err) => {
    if (err) throw err;
    });
    conn.query("SELECT version()", (err, q) => {
    if (err) throw err;
    console.log(q.rows[0]);
    conn.end();
});