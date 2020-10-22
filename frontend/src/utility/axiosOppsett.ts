import axios, { AxiosInstance } from "axios";
import qs from "qs";

const settOppAxios = (): AxiosInstance => {
  return axios.create({
    paramsSerializer: function (params) {
      return qs.stringify(params, { indices: false });
    },
  });
};

export { settOppAxios };
