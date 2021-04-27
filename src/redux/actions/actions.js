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
          response: true

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
export function pitch_Time(data) {
  // console.log(data, "Action pitchtime")
  return function (dispatch) {

    dispatch({
      type: types.Pitch_Time,
      data: data,
    });
  }
}
export function file_Download_Type(data) {
  // console.log(data, "Action file download type")
  return function (dispatch) {

    dispatch({
      type: types.File_Download_Type,
      data: data,
    });
  }
}
export function shift_Days(data) {
  // console.log(data, "Action shift days");
  return function (dispatch) {

    dispatch({
      type: types.Shift_Days,
      data: data,
    });
  }
}
export function shift_Time(data) {
  // console.log(data, "Action shift time");
  return function (dispatch) {

    dispatch({
      type: types.Shift_Time,
      data: data,
    });
  }
}
export function break_Time(data) {
  // console.log(data, "Action Break time");
  return function (dispatch) {

    dispatch({
      type: types.Break_Time,
      data: data,
    });
  }
}
export function range_Select(data) {
  // console.log(data, "Range Action");
  return function (dispatch) {

    dispatch({
      type: types.Range_Select,
      data: data,
    });
  }
}
export function downlaod_Time(data) {
  // console.log(data, "Download Time Action");
  return function (dispatch) {

    dispatch({
      type: types.Download_Time,
      data: data,
    });
  }
}