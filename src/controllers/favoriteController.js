const {PrismaClient} = require("@prisma/client");
const prisma = new PrismaClient();
const {validationResult} = require("express-validator");
const serverError = require("../middlewares/serverError");
const notFoundError = require("../middlewares/notFoundError");
const formatMySQLDate = require("../middlewares/formattedDateSql");

const getAllFavoriteHandler = async (req, res) => {
  try {
    const result = await prisma.favorites.findMany();

    return res.status(200).json({
      status: 'success',
      message: 'get all data favorites',
      payload: result
    })
  } catch (error) {
    return res.status(500).json(serverError("Internal server error", error));
  }
}

const getFavoriteByIdHandler = async (req, res) => {
  try {
    const {favorite_id} = req.params;
    const checkId = await prisma.favorites.findUnique({where: {favorite_id: Number(favorite_id)}})
    if(!checkId){
      return res.status(404).json(notFoundError("id data favorite is not found"))
    }

    const result = await prisma.favorites.findMany({where: {favorite_id: Number(favorite_id)}});
    return res.status(200).json({
      status: 'success',
      message: 'get data favorites by id is successfully',
      payload: result
    })
  } catch (error) {
    return res.status(500).json(serverError("Internal server error", error));
  }
}

const postFavoriteByIdHandler = async (req, res) => {
  try {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
      return res.status(422).json({
        status: 'fail',
        error: errors.array()
      })
    }
    const {user_id, product_id} = req.body;
    const favoriteAt = formatMySQLDate(new Date);
    const payloads = {
      user_id: Number(user_id), product_id: Number(product_id), favorited_at: new Date(favoriteAt)
    }

    await prisma.favorites.create({ data: payloads})

    return res.status(201).json({
      status: 'success',
      message: 'post data favorite has been successfully',
      payload: payloads
    })
  } catch (error) {
    return res.status(500).json(serverError("Internal server error", error));
  }
}

const updateFavoriteByIdHandler = async (req, res) => {
  try {
    const {favorite_id} = req.params;
    const errors = validationResult(req);
    if(!errors.isEmpty()){
      return res.status(422).json({
        status: 'fail',
        error: errors.array()
      })
    }
    const {user_id, product_id} = req.body;
    const favoriteAt = formatMySQLDate(new Date);
    const payloads = {
      user_id: Number(user_id), product_id: Number(product_id), favorited_at: new Date(favoriteAt)
    }
    
    const checkId = await prisma.favorites.findUnique({where: {favorite_id: Number(favorite_id)}});

    if(!checkId) {
      return res.status(404).json(notFoundError("data favorite is not found"))
    }

    await prisma.favorites.update({ where: {favorite_id: Number(favorite_id)}, data: payloads})

    return res.status(201).json({
      status: 'success',
      message: 'update data favorite has been successfully',
      payload: payloads
    })
  } catch (error) {
    return res.status(500).json(serverError("Internal server error", error));
  }
}

const deleteFavoriteHandler = async (req, res) => {
  try {
    const {favorite_id} = req.params;
    const checkId = await prisma.favorites.findUnique({where: {favorite_id: Number(favorite_id)}})
    if(!checkId){
      return res.status(404).json(notFoundError("id data favorite is not found"))
    }

    await prisma.favorites.delete({where: {favorite_id: Number(favorite_id)}});
    return res.status(200).json({
      status: 'success',
      message: 'delete data favorites successfully'
    })
  } catch (error) {
    return res.status(500).json(serverError("Internal server error", error));
  }
}

module.exports = {getAllFavoriteHandler, getFavoriteByIdHandler, postFavoriteByIdHandler, updateFavoriteByIdHandler, deleteFavoriteHandler}