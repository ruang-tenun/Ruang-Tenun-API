const routes = require("express").Router();
const {body} = require("express-validator");
const accessMiddleware = require("../middlewares/accessValidation");
const profileController = require("../controllers/profileController");

routes.put("/user/:user_id", [
  body('username').notEmpty().withMessage('username is required'),
  // body('email').notEmpty().withMessage('email is required'),
], accessMiddleware, profileController.updateUserByIdHandler);

routes.put("/seller/:seller_id", [
  body('name').notEmpty().withMessage('name is required'),
  // body('email').notEmpty().withMessage('email is required'),
], accessMiddleware, profileController.updateSellerByIdHandler);

routes.delete("/user/:user_id", accessMiddleware, profileController.deleteUserByIdHandler);
routes.delete("/user", accessMiddleware, profileController.deleteUserByIdHandler);

routes.get("/user/:user_id", accessMiddleware, profileController.getUserByIdHandler);
routes.get("/user", accessMiddleware, profileController.getUserByIdHandler);

routes.delete("/seller/:seller_id", accessMiddleware, profileController.deleteSellerByIdHandler);
routes.delete("/seller", accessMiddleware, profileController.deleteSellerByIdHandler);

routes.get("/seller/:seller_id", accessMiddleware, profileController.getSellerByIdHandler);
routes.get("/seller", accessMiddleware, profileController.getSellerByIdHandler);

module.exports = routes;