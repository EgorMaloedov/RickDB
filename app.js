"use strict";

const fs = require("fs");
const pg = require("pg");
const axios = require("axios");

const config = {
  connectionString: "postgres://candidate:62I8anq3cFq5GYh2u4Lh@rc1b-r21uoagjy1t7k77h.mdb.yandexcloud.net:6432/db1",
  ssl: {
    rejectUnauthorized: true,
    ca: fs.readFileSync("/home/mrm/.postgresql/root.crt").toString(),
  },
};

const conn = new pg.Client(config);

// Функция для удаления таблицы "egormaloedov"
async function deleteTable() {
  try {
    await conn.query("DROP TABLE IF EXISTS egormaloedov");
    console.log("Table 'egormaloedov' deleted successfully.");
  } catch (error) {
    console.error("Error deleting table 'egormaloedov':", error);
  } finally {
    conn.end();
  }
}

// Функция для создания таблицы "egormaloedov", если она не существует
async function createTable() {
  try {
    await conn.query(`
      CREATE TABLE IF NOT EXISTS egormaloedov (
        id SERIAL PRIMARY KEY,
        name TEXT,
        data JSONB
      );
    `);
    console.log("Table 'egormaloedov' created successfully.");
    await saveCharacters(); // Замените на deleteTable, чтобы очистить таблицу
  } catch (error) {
    console.error("Error creating table 'egormaloedov':", error);
    conn.end();
  }
}

// Функция для получения данных о персонажах
async function getCharacters() {
  try {
    const response = await axios.get("https://rickandmortyapi.com/api/character");
    const characters = response.data.results;

    return characters;
  } catch (error) {
    console.error("Error fetching characters:", error);
    return [];
  }
}

// Основная функция для сохранения персонажей в базу данных
async function saveCharacters() {
  const characters = await getCharacters();
  for (const character of characters) {
    const query = {
      text: "INSERT INTO egormaloedov (name, data) VALUES ($1, $2)",
      values: [character.name, JSON.stringify(character)],
    };
    try {
      await conn.query(query);
      console.log(`Character '${character.name}' was succesfully created 👍`)
    } catch (error) {
      console.error(`Error saving character '${character.name}':`, error);
      conn.end();
    }
  }
}

// Функция для получения всех данных из таблицы egormaloedov и вывода их на экран
async function fetchAllDataFromTable() {
  try {
    const query = {
      text: "SELECT * FROM egormaloedov",
    };

    const result = await conn.query(query);
    const data = result.rows;

    data.forEach((row) => {
      console.log(row);
    });
  } catch (error) {
    console.error("Error fetching data from table:", error);
    conn.end();
  }
}

conn.connect((err) => {
  if (err) throw err;

  createTable()
    //.then(fetchAllDataFromTable) // <- Раскомментируйте для вывода значений из таблицы "egormaloedov"
    .catch((error) => console.error("Error:", error))
    .finally(() => conn.end());
});