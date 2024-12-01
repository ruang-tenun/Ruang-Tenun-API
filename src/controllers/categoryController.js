const {PrismaClient} = require("@prisma/client");
const prisma = new PrismaClient();
const {validationResult} = require('express-validator');

const postCategory = async (req, res) => {
  const {name, description} = req.body;
  const errors = validationResult(req);
  
  if(!errors.isEmpty) {
    return res.status(422).json({
      status: 'fail',
      error: errors
    })
  }

  const payloads = {name, description};
  const result = await prisma.categories.create({
    data: payloads
  })

  if(!result) {
    return res.status(500).json({
      status: 'fail',
      message: 'Internal server error'
    })
  }

  return res.status(201).json({
    status: 'fail',
    message: 'Created data category successfully',
    payload: payloads
  });
};

const getAllCategory = async (req, res) => {
  const result = await prisma.categories.findMany();
  if(!result){
    return res.status(500).json({
      status: 'fail',
      message: 'internal server error'
    })
  }

  return res.status(200).json({
    status: 'fail',
    message: 'get all data categories successfully',
    payload: result
  })
}

const getCategoryById = async (req, res) => {
   const {id} = req.params
   const result = await prisma.categories.findMany({
    where: {
      id: id
    }
   })

   if (!result) {
    return res.status(500).json({
      status: 'fail',
      message: 'internal server error'
    })
   }

   return res.status(200).json({
    status: 'fail',
    message: 'get detail category successfully',
    payload: result
   })
}

const updateCategoryById = async (req, res) => {
  const {id} = req.params;
  const {name, description} = req.body;
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    return res.status(422).json({
      status: 'fail',
      error: errors.array() 
    })
  }

  const checkId = await prisma.categories.findFirst({where: {id: id}})

  if (!checkId) {
    return res.status(404).json({
      status: 'fail',
      message: 'data category not found'
    })
  }

  const payload = {
    name, description
  }

  const result = await prisma.categories.update({
    where: {id: id},
    data: {payload}
  });

  if(!result) {
    return res.status(500).json({
      status: 'fail',
      message: 'internal server error'
    })
  }

  return res.status(200).json({
    status: 'success',
    message: 'updated data category successfully',
    payload: result
  });
}

const deleteCategoryById = async (req, res) => {
  const {id} = req.params;
  const checkId = await prisma.categories.findFirst({where: {id: id}});
  if (!checkId) {
    return res.status(404).json({
      status: 'fail',
      message: 'data category not found'
    })
  }

  const result = await prisma.categories.delete({where: {id}});
  if(!result) {
    return res.status(500).json({
      status: 'fail',
      message: 'internal server error'
    })
  }

  return res.status(200).json({
    status: 'success',
    message: 'delete data category successfully'
  });
}

module.exports = {postCategory, getAllCategory, getCategoryById, updateCategoryById, deleteCategoryById};