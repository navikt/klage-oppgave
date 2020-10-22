import axios, { AxiosRequestConfig, AxiosInstance, AxiosPromise } from "axios";
import qs from "qs";

const settOppAxios = (): AxiosInstance => {
  let axiosInstance = axios.create({
    paramsSerializer: function (params) {
      return qs.stringify(params, { indices: false });
    },
  });

  // Request interceptor for API calls
  /*
  axiosInstance.interceptors.request.use(
    async (config) => {
      const token = await axios.get(
        window.location.host.startsWith("localhost") ? "/api/token" : "/token"
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
*/
  return axiosInstance;
};

export { settOppAxios };
