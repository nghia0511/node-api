import { GET_DB } from '~/config/mongodb'
import { ObjectId } from 'mongodb'

const POST_COLLECTION_NAME = 'posts'

const getPostPagination = async (query) => {
  const perPage = parseInt(query.perPage) || 10
  const page = parseInt(query.page) || 1

  const match = {}
  if (query.title) {
    match.title = { $regex: query.title, $options: 'i' }
  }

  const postsCollection = GET_DB().collection(POST_COLLECTION_NAME)

  const totalPosts = await postsCollection.countDocuments(match)

  const pipeline = [
    { $match: match },
    {
      $lookup: {
        from: 'users',
        localField: 'owner',
        foreignField: '_id',
        as: 'userInfo'
      }
    },
    {
      $lookup: {
        from: 'comments',
        localField: '_id',
        foreignField: 'post',
        as: 'comments'
      }
    },
    {
      $addFields: {
        numberOfComments: { $size: '$comments' }
      }
    },
    {
      $project: {
        _id: 1,
        title: 1,
        content: 1,
        owner: 1,
        created_at: 1,
        tags: 1,
        userInfo: {
          $arrayElemAt: [
            {
              $map: {
                input: '$userInfo',
                in: { _id: '$$this._id', name: '$$this.name' }
              }
            },
            0
          ]
        },
        numberOfComments: 1
      }
    },
    { $skip: (page - 1) * perPage },
    { $limit: perPage }
  ]

  const posts = await postsCollection.aggregate(pipeline).toArray()

  return {
    posts: posts,
    totalPosts: totalPosts
  }
}

const getPostDetail = async (id) => {
  const pipeline = [
    {
      $match: { _id: new ObjectId(id) }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'owner',
        foreignField: '_id',
        as: 'userInfo'
      }
    },
    {
      $project: {
        _id: 1,
        title: 1,
        content: 1,
        owner: 1,
        created_at: 1,
        tags: 1,
        userInfo: {
          $arrayElemAt: [
            {
              $map: {
                input: '$userInfo',
                in: { _id: '$$this._id', name: '$$this.name' }
              }
            },
            0
          ]
        }
      }
    }
  ]

  const post = await GET_DB().collection(POST_COLLECTION_NAME).aggregate(pipeline).toArray()
  return post[0] || null;
}

export const postModel = {
  getPostPagination,
  getPostDetail
}