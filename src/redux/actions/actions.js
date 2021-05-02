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
export function push_shifts_data(data) {
  return function (dispatch) {
    console.log(data);
    return axios
      .post(process.env.REACT_APP_BASE_URL + "api/push-shifts-data", data, {})
      .then(({ data }) => {
        // console.log(data);
        dispatch({
          type: types.Push_Data,
          data: data,
          // response: true
        });
      })
      .catch((error) => {
        console.log("error")
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
export function get_chart_data() {
  return function (dispatch) {
    // console.log("actions", data.get('file'));
    return axios
      .get(process.env.REACT_APP_BASE_URL + "api/get-chart-data", {}, {})
      .then(({ data }) => {
        // console.log(data);
        dispatch({
          type: types.Chart,
          data: data,
        });
      })
      .catch((error) => {
        // toast.error(error.response.data.errors);
      });
  };
}
export function pitch_time(data) {
  // console.log(data, "Action pitchtime");
  return function (dispatch) {

    dispatch({
      type: types.Pitch_Time,
      data: data,
    });
  }
}
export function file_download_type(data) {
  // console.log(data, "Action file download type")
  return function (dispatch) {

    dispatch({
      type: types.File_Download_Type,
      data: data,
    });
  }
}
export function shift_days(data) {
  // console.log(data, "Action shift days");
  return function (dispatch) {

    dispatch({
      type: types.Shift_Days,
      data: data,
    });
  }
}
export function shift_time(data) {
  // console.log(data, "Action shift time");
  return function (dispatch) {

    dispatch({
      type: types.Shift_Time,
      data: data,
    });
  }
}

export function addShift(data) {
  // console.log(data, "Action shift time");
  return function (dispatch) {

    dispatch({
      type: types.ADD_SHIFT,
      data: data,
    });
  }
}

export function deleteShift(data) {
  // console.log(data, "Action shift time");
  return function (dispatch) {

    dispatch({
      type: types.DELETE_SHIFT,
      data: data,
    });
  }
}

export function addBreak(data) {
  // console.log(data, "Action shift time");
  return function (dispatch) {

    dispatch({
      type: types.ADD_BREAK,
      data: data,
    });
  }
}

export function deleteBreak(data) {
  // console.log(data, "Action shift time");
  return function (dispatch) {

    dispatch({
      type: types.DELETE_BREAK,
      data: data,
    });
  }
}
export function break_time(data) {
  console.log(data, "Action Break time");
  return function (dispatch) {

    dispatch({
      type: types.Break_Time,
      data: data,
    });
  }
}
export function download_time(data) {
  console.log(data, "Download Time Action");
  return function (dispatch) {

    dispatch({
      type: types.Download_Time,
      data: data,
    });
  }
}
export function colors_range(data) {
  console.log(data, "Colors Action");
  return function (dispatch) {

    dispatch({
      type: types.Colors_Range,
      data: data,
    });
  }
}