const {PrismaClient} = require("@prisma/client");
const {Storage} = require("@google-cloud/storage");
const prisma = new PrismaClient();
const {validationResult} = require('express-validator');
const path = require('path')

const pathKey = path.resolve(__dirname, '../../serviceaccount.json');
const bucketName = "rtab-bucket-image";
const gcs = new Storage({
  projectId: process.env.PROJECT_ID,
  keyFilename: pathKey
});
const bucket = gcs.bucket(bucketName);

const postCategory = async (req, res) => {
  try {  
    const {name, description, address} = req.body;
    const errors = validationResult(req);
    
    if(!errors.isEmpty) {
      return res.status(422).json({
        status: 'fail',
        error: errors
      })
    }

    if(!req.file){
      return res.status(422).json({
        status: 'fail',
        error: 'image must be uploaded'
      })
    }

    const imageName = `category_images/${new Date().toISOString()}-${req.file.originalname.replace(/ /g, "_")}`;
    const file = bucket.file(imageName);

    const stream = file.createWriteStream({
      metadata: {
        contentType: req.file.mimetytpe,
      }
    })

    stream.on("error", (err) => {
      return res.status(500).json({
        status: 'fail',
        message: 'Failed to uplod image to GCS',
        error: err.message
      })
    })

    stream.on("finish", async() => {
      const publicUrl = `https://storage.googleapis.com/${bucketName}/${imageName}`;

      const payloads = {name, description, address, image_url:publicUrl};
      
      await prisma.categories.create({
        data: payloads
      })
  
      return res.status(201).json({
        status: 'success',
        message: 'Created data category successfully',
        payload: payloads
      });
    })

    stream.end(req.file.buffer)
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
      status: 'success',
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
     status: 'success',
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
    const {name, description, address} = req.body;
    const errors = validationResult(req);
    if(!errors.isEmpty()){
      return res.status(422).json({
        status: 'fail',
        error: errors.array() 
      })
    }
  
    const categoryExist = await prisma.categories.findUnique({where: {category_id: Number(id)}})
  
    if (!categoryExist) {
      return res.status(404).json({
        status: 'fail',
        message: 'data category not found'
      })
    }

    const imageUrl = categoryExist.image_url ?? 'null';

    if(!req.file){
      const imageName = `category_images/${new Date().toISOString()}-${req.file.originalname.replace(/ /g, "_")}`;
      const file = bucket.file(imageName);

      const stream = file.createWriteStream({
        metadata: {
          contentType: req.file.mimetytpe
        }
      })

      stream.on("error", (err) => {
        return res.status(500).json({
          status: 'fail',
          message: 'Failed to upload image to bcs',
          error: err.message
        })
      })

      await new Promise((resolve, reject) => {
        stream.on('finish', resolve);
        stream.on(req.file.buffer)
      })

      imageUrl = `https://storage.googleapis.com/${bucketName}/${imageName}`

      if(categoryExist.image_url){
        const oldFileName = categoryExist.image_url.spilt('/').pop();
        const oldFile = bucket.file(`category_images/${oldFileName}`);
        await oldFile.delete().catch((err) => {
          console.log('Failed to delete old image', err.message);
        })
      }
    }
  
    const payload = {
      name, description, address, image_url: imageUrl
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
    const checkCategory = await prisma.categories.findUnique({where: {category_id: Number(id)}});
    const checkProduct = await prisma.products.findMany({where: {category_id: Number(id)}});
    if (!checkCategory) {
      return res.status(404).json({
        status: 'fail',
        message: 'data category not found'
      })
    }
    
    if (checkProduct) {
      await prisma.products.update({data: {category_id: null}, where: {category_id: Number(id)}})
    }
  
    await prisma.categories.delete({where: {category_id: Number(id)}});

    if(checkCategory.image_url){
      const oldFileName = checkCategory.imageName.spilt('/').pop();
      const oldFile = bucket.file(`category_images/${oldFileName}`);
      await oldFile.delete().catch((err) => {
        console.log('Failed to delete old image', err.message);
        
      })
    }
  
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