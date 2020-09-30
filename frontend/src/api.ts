import axios, { AxiosRequestConfig, AxiosInstance } from "axios";
import qs from "qs";

let instance = axios.create({
  paramsSerializer: function (params) {
    return qs.stringify(params, { indices: false });
  },
});

// Request interceptor for API calls
instance.interceptors.request.use(
  async (config) => {
    const token = await axios.get(
      process.env.NODE_ENV === "development" ? "/api/token" : "/token"
    );
    config.headers = {
      Authorization: `Bearer ${token.data}`,
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    };
    return config;
  },
  (error) => {
    Promise.reject(error);
  }
);

export async function get<T>(resource: string): Promise<T> {
  let response = await instance.get(resource);
  try {
    return response.data;
  } catch (error) {
    console.error(error, "Error from get call", { resource: resource });
    throw error;
  }
}
