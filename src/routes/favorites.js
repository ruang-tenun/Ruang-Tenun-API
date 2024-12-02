const router = require("express").Router();
const {body} = require("express-validator");
const accessMiddleware = require("../middlewares/accessValidation");
const favoriteController = require("../controllers/favoriteController");

router.get("/", accessMiddleware, favoriteController.getAllFavoriteHandler);

router.post("/", [
  body("user_id").notEmpty().withMessage("userid is not required"),
  body("product_id").notEmpty().withMessage("product id is not required")
], accessMiddleware, favoriteController.postFavoriteByIdHandler);

router.put("/(:favorite_id)", [
  body("user_id").notEmpty().withMessage("userid is not required"),
  body("product_id").notEmpty().withMessage("product id is not required")
], accessMiddleware, favoriteController.updateFavoriteByIdHandler);

router.get("/(:favorite_id)", accessMiddleware, favoriteController.getFavoriteByIdHandler);

router.delete("/(:favorite_id)", accessMiddleware, favoriteController.deleteFavoriteHandler);

module.exports = router
