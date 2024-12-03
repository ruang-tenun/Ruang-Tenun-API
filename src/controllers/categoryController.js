const {PrismaClient} = require("@prisma/client");
const prisma = new PrismaClient();
const {validationResult} = require('express-validator');

const postCategory = async (req, res) => {
  try {  
    const {name, description} = req.body;
    const errors = validationResult(req);
    
    if(!errors.isEmpty) {
      return res.status(422).json({
        status: 'fail',
        error: errors
      })
    }

    const payloads = {name, description};
    
    await prisma.categories.create({
      data: payloads
    })

    return res.status(201).json({
      status: 'fail',
      message: 'Created data category successfully',
      payload: payloads
    });
  } catch (error) {
    return res.status(500).json({
      status: 'fail',
      message: 'Internal server error',
      error: error.message
    })
  }
};

const getAllCategory = async (req, res) => {
  try {
    const result = await prisma.categories.findMany();
  
    return res.status(200).json({
      status: 'fail',
      message: 'get all data categories successfully',
      payload: result
    })
  } catch (error) {
    return res.status(500).json({
      status: 'fail',
      message: 'internal server error',
      error: error.message
    })
  }
}

const getCategoryById = async (req, res) => {
  try {
    const {id} = req.params
    const result = await prisma.categories.findUnique({
     where: {
       category_id: Number(id)
     }
    })
 
    if (!result) {
     return res.status(404).json({
       status: 'fail',
       message: 'data category is not found'
     })
    }
 
    return res.status(200).json({
     status: 'fail',
     message: 'get detail category successfully',
     payload: result
    })
  } catch (error) {
    return res.status(500).json({
      status: 'fail',
      message: 'internal server error',
      error: error.message
    })
  }
}

const updateCategoryById = async (req, res) => {
  try {
    const {id} = req.params;
    const {name, description} = req.body;
    const errors = validationResult(req);
    if(!errors.isEmpty()){
      return res.status(422).json({
        status: 'fail',
        error: errors.array() 
      })
    }
  
    const checkId = await prisma.categories.findUnique({where: {category_id: Number(id)}})
  
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
      where: {category_id: Number(id)},
      data: payload
    });
  
    return res.status(200).json({
      status: 'success',
      message: 'updated data category successfully',
      payload: result
    });
  } catch (error) {
    return res.status(500).json({
      status: 'fail',
      message: 'internal server error',
      error: error.message
    })
  }
}

const deleteCategoryById = async (req, res) => {
  try {
    const {id} = req.params;
    const checkId = await prisma.categories.findUnique({where: {category_id: Number(id)}});
    if (!checkId) {
      return res.status(404).json({
        status: 'fail',
        message: 'data category not found'
      })
    }
  
    const result = await prisma.categories.delete({where: {category_id: Number(id)}});
  
    return res.status(200).json({
      status: 'success',
      message: 'delete data category successfully'
    });
  } catch (error) {
    return res.status(500).json({
      status: 'fail',
      message: 'internal server error',
      error: error.message
    })
  }
}

module.exports = {postCategory, getAllCategory, getCategoryById, updateCategoryById, deleteCategoryById};