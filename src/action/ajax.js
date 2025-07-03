import axios from "axios";

export const ajax = (url, method = "get", data) => {

  // const headers = { 
  //   // 'Accept': 'application/json',
  //   'Accept': 'application/json, text/plain, */*',
  //   'Content-Type': 'application/x-www-form-urlencoded',
  //  };

  // const instance = axios.create({
  //   headers,
  //   // credentials: 'same-origin',
  //   credentials: true,
  //   timeout: 10000,
  // });

  // return instance[method](url, data)



  axios.defaults.timeout = 500000;
  axios.defaults.baseURL = "";
  return method === 'get'
   ? axios.get(url, { headers: { "Content-Type": "application/json" } })
   : axios.post(url, data, {headers: { "Content-Type": "application/x-www-form-urlencoded" }})
}