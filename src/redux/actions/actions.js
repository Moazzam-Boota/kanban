import axios from "axios";
import * as types from "./actionTypes";

export function excelSheet(data) { 
  return function (dispatch) {
    return axios
      .post(process.env.REACT_APP_BASE_URL + "api/excel-upload", data, {})
      .then(({ data }) => {
        dispatch({
          type: types.EXCEL,
          data: data,
          response: true

        });

      })
      .catch((error) => {
      });
  };
}
export function pushShiftsData(data) { 
  return function (dispatch) {
    return axios
      .post(process.env.REACT_APP_BASE_URL + "api/push-shifts-data", data, {})
      .then(({ data }) => {
        dispatch({
          type: types.PUSH_DATA,
          data: data,
        });
      })
      .catch((error) => {
      });
  };
}
export function intialExcelSheet() {
  return function (dispatch) {
    return axios
      .get(process.env.REACT_APP_BASE_URL + "api/intial-excel-upload", {}, {})
      .then(({ data }) => {
        dispatch({
          type: types.EXCEL,
          data: data,
        });
      })
      .catch((error) => {
      });
  };
}
export function getChartData() {
  return function (dispatch) {
    return axios
      .get(process.env.REACT_APP_BASE_URL + "api/get-chart-data", {}, {})
      .then(({ data }) => {
        dispatch({
          type: types.GET_CHART_DATA,
          data: data,
        });
      })
      .catch((error) => {
      });
  };
}
export function pitchTime(data) {
  return function (dispatch) {

    dispatch({
      type: types.PITCH_TIME,
      data: data,
    });
  }
}
export function fileDownloadType(data) {
  return function (dispatch) {

    dispatch({
      type: types.FILE_DOWNLOAD_TYPE,
      data: data,
    });
  }
}
export function shiftDays(data) {
  return function (dispatch) {

    dispatch({
      type: types.SHIFT_DAYS,
      data: data,
    });
  }
}
export function shiftTime(data) {
  return function (dispatch) {

    dispatch({
      type: types.SHIFT_TIME,
      data: data,
    });
  }
}

export function addShift(data) {
  return function (dispatch) {

    dispatch({
      type: types.ADD_SHIFT,
      data: data,
    });
  }
}

export function deleteShift(data) {
  return function (dispatch) {

    dispatch({
      type: types.DELETE_SHIFT,
      data: data,
    });
  }
}

export function addBreak(data) {
  return function (dispatch) {

    dispatch({
      type: types.ADD_BREAK,
      data: data,
    });
  }
}

export function deleteBreak(data) {
  return function (dispatch) {

    dispatch({
      type: types.DELETE_BREAK,
      data: data,
    });
  }
}
export function breakTime(data) {
  return function (dispatch) {

    dispatch({
      type: types.BREAK_TIME,
      data: data,
    });
  }
}
export function downloadTime(data) {
  return function (dispatch) {

    dispatch({
      type: types.DOWNLOAD_TIME,
      data: data,
    });
  }
}
export function colorsRange(data) {
  return function (dispatch) {

    dispatch({
      type: types.COLORS_RANGE,
      data: data,
    });
  }
}