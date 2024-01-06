import { GET_DB } from '~/config/mongodb'
import { ObjectId} from 'mongodb'

const COMMENT_COLLECTION_NAME = 'comments'

const getCommentPaginationByPostID = async (fillter) => {
  const perPage = parseInt(fillter.query.perPage) || 10
  const page = parseInt(fillter.query.page) || 1

  const commentCollection = GET_DB().collection(COMMENT_COLLECTION_NAME)
  const match = {
    post: new ObjectId(fillter.postID)
  }
  const totalComment = await commentCollection.countDocuments(match)
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
      $project: {
        _id: 1,
        content: 1,
        created_at: 1,
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
    },
    { $skip: (page - 1) * perPage },
    { $limit: perPage }
  ]

  const comments = await commentCollection.aggregate(pipeline).toArray()

  return {
    comments: comments,
    totalComment: totalComment
  }
}

export const commentModel = {
  getCommentPaginationByPostID,
  COMMENT_COLLECTION_NAME
}