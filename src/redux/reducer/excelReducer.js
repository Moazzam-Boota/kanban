import * as types from "../actions/actionTypes";

const initialBreak = {
  time: ["08:00", "14:00"]
};

const initialShift = {
  breaks: {
    1: { ...initialBreak }
  },
  days: [],
  time: ["08:00", "14:00"]
};

const initialState = {
  // loginStatus: true
  1: { ...initialShift }
}

const lodash = require('lodash');

export default function excelReducer(state = initialState, action) {
  switch (action.type) {

    case types.EXCEL: {

      return {
        ...state,
        apiCalled: action.data,
        response: action.response
      };
    }

    case types.GET_CHART_DATA: {
      return {
        ...state,
        chartParams: action.data
      };
    }

    case types.PUSH_DATA: {
      return {
        ...state,
        // allState: action.data,
        // res: action.response
      };
    }

    case types.PITCH_TIME: { //PITCH_TIME

      return {
        ...state,
        pitchTime: action.data
      };
    }

    case types.FILE_DOWNLOAD_TYPE: {

      return {
        ...state,
        fileDownloadType: action.data
      };
    }

    case types.ADD_SHIFT: {
      return {
        ...state,
        [action.data.addShift]: { ...initialShift }
      };
    }

    case types.DELETE_SHIFT: {
      const updateState = { ...state };
      delete updateState[action.data.deleteShift];
      return { ...updateState };
    }

    case types.ADD_BREAK: {

      return {
        ...state,
        [action.data.shiftCount]: {
          ...state[action.data.shiftCount],
          breaks: {
            ...lodash.get(state, [action.data.shiftCount, 'breaks'], {}),
            [action.data.addBreak]: { ...initialBreak }
          }
        }
      };
    }

    case types.DELETE_BREAK: {
      const updateState = { ...state };
      delete updateState[action.data.shiftCount].breaks[action.data.deleteBreak];
      return { ...updateState };
    }

    case types.SHIFT_TIME: {

      return {
        ...state,
        [action.data.shiftCount]: {
          ...state[action.data.shiftCount],
          time: action.data.shiftTime,
        }
      };
    }

    case types.BREAK_TIME: {
      return {
        ...state,
        [action.data.shiftCount]: {
          ...state[action.data.shiftCount],
          breaks: {
            ...lodash.get(state, [action.data.shiftCount, 'breaks'], {}),
            [action.data.breakCount]: { time: action.data.breakValue }
          }
        }
      };
    }

    case types.DOWNLOAD_TIME:
      return {
        ...state,
        downloadTime: action.data
      };

    case types.SHIFT_DAYS: {
      return {
        ...state,
        [action.data.shiftCount]: {
          ...state[action.data.shiftCount],
          days: action.data.shiftDays
        }
      };
    }

    case types.COLORS_RANGE:
      return {
        ...state,
        colors: action.data
      };

    default:
      return state;
  }
};