import axios from "axios";
import * as types from "./actionTypes";
// import { toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

export function excel_sheet(data) {
  return function (dispatch) {
    // console.log("actions", data.get('file'));
    return axios
      .post(process.env.REACT_APP_BASE_URL + "api/excel-upload", data, {})
      .then(({ data }) => {
        // console.log(data);
        dispatch({
          type: types.Excel,
          data: data,

        });


      })
      .catch((error) => {
        // toast.error(error.response.data.errors);
      });
  };
}
export function intial_excel_sheet() {
  return function (dispatch) {
    // console.log("actions", data.get('file'));
    return axios
      .get(process.env.REACT_APP_BASE_URL + "api/intial-excel-upload", {}, {})
      .then(({ data }) => {
        console.log(data);
        dispatch({
          type: types.Excel,
          data: data,

        });


      })
      .catch((error) => {
        // toast.error(error.response.data.errors);
      });
  };
}

