const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient()
const {validationResult} = require('express-validator');
const formatMySQLDate = require('../middlewares/formattedDateSql');
const { hash } = require('bcrypt');

const updateUserByIdHandler = async (req, res) => {
  const {username, phone, address} = req.body;
  const {user_id} = req.params
  const updatedAt = formatMySQLDate(new Date());
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    return res.status(422).json({
      status: 'fail',
      error: errors.array()
    })
  }

  // const newPass = hash(password, 10)
  const payload = {
    username, phone, address, updated_at: new Date(updatedAt)
  }
  const result = await prisma.users.update({where: {user_id: Number(user_id)}, data: payload})
  if(!result){
    return res.status(500).json({
      status: 'fail',
      message: 'internal server error'
    })
  }

  return res.status(200).json({
    status: 'success',
    message: 'update user profile successfully',
    payload: result
  })
}

const updateSellerByIdHandler = async (req, res) => {
  const {name, email, phone, address} = req.body;
  const {seller_id} = req.params
  const updatedAt = formatMySQLDate(new Date());
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    return res.status(422).json({
      status: 'fail',
      error: errors.array()
    })
  }

  // const newPass = hash(password, 10)
  const payload = {
    name, phone, address, updated_at: new Date(updatedAt)
  }
  const result = await prisma.sellers.update({where: {seller_id: Number(seller_id)}, data: payload})
  if(!result){
    return res.status(500).json({
      status: 'fail',
      message: 'internal server error'
    })
  }

  return res.status(200).json({
    status: 'success',
    message: 'update seller profile successfully',
    payload: payload
  })
}

const deleteUserByIdHandler = async (req, res) => {
  const {user_id} = req.params;
  const {username} = req.query;
  let deleteUser;

  if(username != undefined) {
    deleteUser = await prisma.users.delete({where: {username: username}});
  } else if(user_id != undefined){
    deleteUser = await prisma.users.delete({where: {user_id: Number(user_id)}});
  } else {
    return res.status(500).json({
      status: 'fail',
      message: 'Internal server error'
    })
  }
  if(!deleteUser){
    return res.status(404).json({
      status: 'fail',
      message: 'user id atau username not found'
    })
  }

  return res.status(200).json({
    status: 'success',
    message: 'Delete user successfully'
  })
}

const deleteSellerByIdHandler = async (req, res) => {
  const {seller_id} = req.params;
  const {email} = req.query;
  let deleteSeller;

  if(email != undefined) {
    deleteSeller = await prisma.sellers.delete({where: {email}});
  } else if(seller_id != undefined){
    deleteSeller = await prisma.sellers.delete({where: {seller_id: Number(seller_id)}});
  } else {
    return res.status(500).json({
      status: 'fail',
      message: 'Internal server error'
    })
  }

  if(!deleteSeller){
    return res.status(404).json({
      status: 'fail',
      message: 'seller id atau name not found'
    })
  }

  return res.status(200).json({
    status: 'success',
    message: 'Delete seller successfully'
  })
}

const getUserByIdHandler = async (req, res) => {
  const {user_id} = req.params;
  const {username} = req.query;
  let result;

  if(username != undefined) {
    result = await prisma.users.findMany({where: {username}});
  } else if(user_id != undefined){
    result = await prisma.users.findMany({where: {user_id: Number(user_id)}});
  } else {
    return res.status(500).json({
      status: 'fail',
      message: 'Internal server error'
    })
  }

  if(!result){
    return res.status(404).json({
      status: 'fail',
      message: 'user not found'
    })
  }

  return res.status(200).json({
    status: 'success',
    message: 'get users has been successfully',
    payload: result
  })
}

const getSellerByIdHandler = async (req, res) => {
  const {seller_id} = req.params;
  const {name} = req.query;
  let result;

  if(name != undefined) {
    result = await prisma.sellers.findMany({where: {name}});
  } else if(seller_id != undefined){
    result = await prisma.sellers.findMany({where: {seller_id: Number(seller_id)}});
  } else {
    return res.status(500).json({
      status: 'fail',
      message: 'Internal server error'
    })
  }

  if(!result){
    return res.status(404).json({
      status: 'fail',
      message: 'user not found'
    })
  }

  return res.status(200).json({
    status: 'success',
    message: 'get seller has been successfully',
    payload: result
  })
}

module.exports = {updateUserByIdHandler, updateSellerByIdHandler, deleteUserByIdHandler, deleteSellerByIdHandler, getUserByIdHandler, getSellerByIdHandler}