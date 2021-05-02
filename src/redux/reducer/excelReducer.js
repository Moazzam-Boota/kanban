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

    case types.Excel: {

      return {
        ...state,
        apiCalled: action.data,
        response: action.response
      };
    }

    case types.Chart: {
      console.log(action.data)
      return {
        ...state,
        chartData: action.data
      };
    }

    case types.Push_Data: {
      console.log(action.data)
      return {
        ...state,
        // allState: action.data,
        // res: action.response
      };
    }

    case types.Pitch_Time: {

      //types.Pitch_Time
      // console.log(action.data, "pitchtime Reducer");
      return {
        ...state,
        pitchTime: action.data
      };
    }

    case types.File_Download_Type: {

      // console.log(action.data, " file download type Reducer");
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

    case types.Shift_Time: {

      // console.log(action.data, " Shift time Reducer");
      return {
        ...state,
        [action.data.shiftCount]: {
          ...state[action.data.shiftCount],
          time: action.data.shiftTime,
        }
      };
    }

    case types.Break_Time: {
      console.log(lodash.get(state, [action.data.shiftCount, 'breaks'], {}), " Break time Reducer");
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

    case types.Download_Time:
      // console.log(action.data, " Downlaod Time Reducer");
      return {
        ...state,
        downloadTime: action.data
      };

    case types.Shift_Days: {
      // console.log(state, action.data, " Shift Days Reducer");
      return {
        ...state,
        [action.data.shiftCount]: {
          ...state[action.data.shiftCount],
          days: action.data.shiftDays,
          // time: action.data.shiftDays,
        }
      };
    }

    case types.Colors_Range:
      console.log(action.data, " Colors Reducer");
      return {
        ...state,
        colors: action.data
      };

    default:
      return state;
  }
};