import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { postValidation } from '~/validations/postValidation'
import { postController } from '~/controllers/postController'

const Router = express.Router()

Router.get('/status', (req, res) => {
  res.status(StatusCodes.OK).json({
    status: 'ok'
  })
})

Router.route('/')
  .get(postValidation.getPost, postController.getPost)

export const RouterPost = Router