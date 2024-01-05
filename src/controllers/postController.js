import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { postService } from '~/services/postService'

const getPost = async (req, res, next) => {
  try {
    const result = await postService.getPost(req.query);
    res.status(StatusCodes.OK).json({
      statusCode: StatusCodes.OK,
      data: result.posts || [],
      total: result.totalPosts || 0
    })
  } catch (error) {
    next(error)
  }
}

export const postController = {
  getPost
}