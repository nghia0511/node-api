import { GET_DB } from '~/config/mongodb'

const POST_COLLECTION_NAME = 'posts'

const getPostPagination = async (query) => {
  const perPage = parseInt(query.perPage) || 10
  const page = parseInt(query.page)
  const postsCollection = GET_DB().collection(POST_COLLECTION_NAME)
  const totalPosts = await postsCollection.countDocuments()

  const matchStage = {}
  if (query.title) {
    matchStage.$match = { title: { $regex: query.title, $options: 'i' } }
  }

  const lookupUser = {
    $lookup: {
      from: 'users',
      localField: 'owner',
      foreignField: 'id',
      as: 'userData'
    }
  }

  const projectStage = {
    $project: {
      _id: 1,
      title: 1,
      content: 1,
      owner: 1,
      created_at: 1,
      tags: 1,
      user: {
        $arrayElemAt: [
          {
            $map: {
              input: '$userData',
              in: {
                _id: '$$this._id',
                name: '$$this.name'
              }
            }
          },
          0
        ]
      }
    }
  }

  const pipeline = [
    matchStage,
    lookupUser,
    projectStage,
    {
      $skip: (page - 1) * perPage
    },
    {
      $limit: perPage
    }
  ]

  const posts = await postsCollection.aggregate(pipeline).toArray()

  return {
    posts: posts,
    totalPosts: totalPosts
  }
}

export const postModel = {
  getPostPagination
}