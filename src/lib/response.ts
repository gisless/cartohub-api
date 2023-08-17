
export const success_response = <T = any>(data: T) => {
  const body = {
    success: true,
    data,
  }
  return {
    statusCode: 200,
    body: JSON.stringify(body),
    headers: {
      'content-type': 'application/json',
    },
  }
}

export const error_response = (
  statusCode: number,
  error_code: string,
  description?: string
) => {
  const body = { error: true, error_code, description }
  return {
    statusCode,
    body: JSON.stringify(body),
    headers: {
      'content-type': 'application/json',
    },
  }
}
