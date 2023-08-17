import { error_response, success_response } from '../../../lib/response'
import { APIGatewayProxyEventV2 } from 'aws-lambda'

import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import * as uuid from 'uuid'

const { MAP_STORE_BUCKET_NAME } = process.env

const allowedContentTypes = ['tiff', 'png', 'jpeg']

type Response = { [ext: string]: string }

export const handler = async (event: APIGatewayProxyEventV2) => {

  if(!MAP_STORE_BUCKET_NAME) {
    console.error('MAP_STORE_BUCKET_NAME is not defined')
    return error_response(500, 'Internal Server Error')
  }

  const map_id = uuid.v4().replace(/-/g, '')

  const client = new S3Client();

  const signedUrls: Response = {}

  for (const ext of allowedContentTypes) {
    const command = new PutObjectCommand({
      Bucket: MAP_STORE_BUCKET_NAME,
      Key: `maps/${map_id}/raw.${ext}`,
    })
    const url = await getSignedUrl(client, command, { expiresIn: 30 * 60 })
    signedUrls[ext] = url
  }

  return success_response<Response>(signedUrls)
}
