export interface CustomError extends Error {
  response?: ErrorResponse;
}

export interface ErrorResponse {
  title: string;
  status: number;
  detail: string;
}
