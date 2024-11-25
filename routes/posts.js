const express = require('express');
const router = express.Router();

// import db
const { body, validationResult } = require('express-validator');
const connection = require('../config/database');
const internalError = {
  status: 'fail',
  message: 'Internal server error'
}

router.get('/', (req, res) => {
  connection.query("SELECT * FROM posts ORDER BY id DESC", (err,  rows) => {
    if(err){
      return res.status(500).json(internalError);
    } else {
      return res.status(200).json({
        status: 'success',
        message: "List Data Posts",
        data: rows
      })
    }
  })
})

router.post('/', [
  // validation
  body('title').notEmpty().withMessage('Title is required'),
  body('content').notEmpty().withMessage('Content is required'),
  body('description').notEmpty().withMessage('Description is required'),
], (req, res) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(422).json({
      errors: errors.array()
    })
  }

  let data = {
    title: req.body.title,
    content: req.body.content,
    description: req.body.description
  }

  connection.query("INSERT INTO posts SET ?", data, (err, rows) => {
    if(err){
      return res.status(500).json(internalError)
    }
    return res.status(201).json({
      status: 'success',
      message: 'Insert data successfully',
      data: rows[0]
    })
  })
})

router.get("/(:id)", (req, res) => {
  const id = req.params.id;

  connection.query(`SELECT * FROM posts WHERE id=${id}`, (err, row) => {
    if(err){
      return res.status(500).json()
    }

    if(row.length <  1){
      return res.status(404).json({
        status: 'fail',
        message: 'Data post not found!'
      })
    }

    return res.status(200).json({
      status: 'success',
      message: 'Detail data Post',
      data: row[0]
    })
  })
})

router.put("/(:id)", [
  body('title').notEmpty().withMessage('Title is required'),
  body('content').notEmpty().withMessage('Content is required'),
  body('description').notEmpty().withMessage('Description is required'),
],(req, res) => {
  let errors = validationResult(req)
  
  if (!errors.isEmpty()) {
    return res.status(422).json({
      errors: errors.array()
    })
  }

  const id = req.params.id

  const data = {
    title: req.body.title,
    content: req.body.content,
    description: req.body.description,
  }

  connection.query(`SELECT * FROM posts WHERE id = ?`, id ,(err, row) => {
    if(row.length < 1){
      return res.status(404).json({
        status: 'fail',
        message: 'Data post not found!'
      })
    }

    connection.query(`UPDATE posts SET ? WHERE id =? `, [data, id], (err, rows) => {
      if(err){
        return res.status(500).json(internalError)
      }
  
      return res.status(200).json({
        status: 'success',
        message: 'updated data successfully',
      })
    })
  })
})

router.delete('/(:id)', (req, res) => {
  const id = req.params.id;

  connection.query("SELECT * FROM posts WHERE id = ?", id, (err, row) => {
    if(row.length < 1){
      return res.status(404).json({
        status: 'fail',
        message: 'data post not found!'
      })
    }

    connection.query("DELETE FROM posts WHERE id = ?", id, (err) => {
      if(err){
        return res.status(500).json(internalError)
      }
      return res.status(200).json({
        status: 'success',
        message: 'Deleted data post successfully'
      })
    })
  })
})
module.exports = router;
