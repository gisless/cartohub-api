import { error_response, success_response } from '../../../lib/response'
import { APIGatewayProxyEventV2 } from 'aws-lambda'

import { createPresignedPost } from '@aws-sdk/s3-presigned-post'
import { S3Client } from '@aws-sdk/client-s3'
import * as uuid from 'uuid'

const { MAP_STORE_BUCKET_NAME } = process.env

const allowedContentTypes = ['image/png'] //, 'image/jpeg', 'image/tiff']

type Fields = Awaited<ReturnType<typeof createPresignedPost>>['fields']
type Response = {
  presignedPosts: {
    [contentType: string]: {
      url: string,
      fields: Fields,
    },
  },
  map_id: string,
}

export const handler = async (event: APIGatewayProxyEventV2) => {

  if(!MAP_STORE_BUCKET_NAME) {
    console.error('`MAP_STORE_BUCKET_NAME` is not defined')
    return error_response(500, 'Internal Server Error')
  }

  const map_id = uuid.v4().replace(/-/g, '')

  const client = new S3Client({ region: 'ap-northeast-1' });

  const presignedPosts: Response['presignedPosts'] = {}

  // TODO: parallelize
  for (const contentType of allowedContentTypes) {
    const ext = contentType.split('/')[1]
    const { url, fields } = await createPresignedPost(client, {
      Bucket: MAP_STORE_BUCKET_NAME,
      Key: `raw_image/${map_id}.${ext}`,
      Conditions: [
        ['content-length-range', 0, 1024 * 1024 * 200], // 200MB Limit for now
      ],
      Expires: 30 * 60,
    })
    presignedPosts[contentType] = { url, fields }
  }

  return success_response<Response>({ presignedPosts, map_id })
}
