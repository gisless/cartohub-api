import type { APIGatewayProxyHandlerV2 } from 'aws-lambda'
import { handler as postLinksUploadCreateHandler } from './handler/links/upload/create'
import { error_response } from './lib/response'

export const lambdaHandler: APIGatewayProxyHandlerV2 = async (event) => {
  const { routeKey } = event

  // TODO: Origin guard
  if (routeKey === 'POST /links/upload/create') {
    return postLinksUploadCreateHandler(event)
  }

  return error_response(404, 'not found')
}
