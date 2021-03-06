const router = require('express').Router();
const chickenTinderController = require('../../controllers/chickenTinderController');
const axios = require('axios');
const _ = require('underscore');
const mysql = require('mysql2');

let connection;
if (process.env.JAWSDB_URL) {
  connection = mysql.createConnection(process.env.JAWSDB_URL);
} else {
  connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'password',
    database: 'chicken_tinder_db',
  }).promise();
}
// const API_BASE_URL = 'https://api.yelp.com/v3/businesses/search?term=restaurant';
// SAVE THIS TO A HIDDEN FILE ** DO NOT FINISH PROJECT WITH THIS ** 
router.route('/room')
  .get(chickenTinderController.getRoomId)
  .post(chickenTinderController.createRoom)
  .patch(chickenTinderController.closeRoom);

router.route('/restaurant')
  .get(chickenTinderController.getRestaurants)
  .post(chickenTinderController.addRestaurant)
  .patch(chickenTinderController.addYes);

router.route('/restaurant/1/:restId')
  .get(chickenTinderController.getRestaurantById);

router.route('/restaurant/:roomId')
  .get(chickenTinderController.getRestaurantsByRoomId);

router.route('/yelp')
  .post((req, res) => {
    const { roomId, city } = req.body;
    axios.get(`https://api.yelp.com/v3/businesses/search`, {
      headers: {
        authorization: process.env.BEARER_TOKEN,
      },
      params: {
        location: city,
        term: 'Restaurants'
      },
    }).then(async (response) => {
      const restaurantData = response.data.businesses.map((restaurant) => { return [restaurant.name, restaurant.image_url, restaurant.rating, restaurant.location.city, restaurant.url] });
      const query = 'INSERT INTO restaurants (room_number, restaurant_name, restaurant_image_url, rating, city, rest_url) VALUES (?, ?, ?, ?, ?,?);';
      for (let i = 0; i < restaurantData.length; i++) {
        try {
          await connection.query(query, [roomId, ...restaurantData[i]]);
        } catch (e) {
          console.log(e);
        }
      }
      res.status(200).json({ success: true });
    })
      .catch((e) => {
        console.log(e);
      });
  });

module.exports = router;