import { postModel } from '~/models/postModel'

const getPost = async (query) => {
  return await postModel.getPostPagination(query)
}

export const postService = {
  getPost
}