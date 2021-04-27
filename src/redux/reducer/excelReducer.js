import * as types from "../actions/actionTypes";

const init = {
  // loginStatus: true
}

const lodash = require('lodash');

export default function excelReducer(state = init, action) {
  switch (action.type) {

    case "Excel": {

      return {
        ...state,
        apiCalled: action.data,
        response: action.response
      };
    }

    case types.Pitch_Time: {

      //types.Pitch_Time
      console.log(action.data, "pitchtime Reducer");
      return {
        ...state,
        pitchTime: action.data
      };
    }

    case "File_Download_Type": {

      console.log(action.data, " file download type Reducer");
      return {
        ...state,
        fileDownloadType: action.data
      };
    }

    case "Shift_Time": {

      console.log(action.data, " Shift time Reducer");
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
    // case "Range_Select":
    //   console.log(action.data, " Range select Reducer");
    //   return {
    //     ...state,
    //     range: action.data
    //   };

    // case types.Download_Time:
    //   console.log(action.data, " Downlaod Time Reducer");
    //   return {
    //     ...state,
    //     downloadTime: action.data
    //   };

    case "Shift_Days": {
      console.log(state, action.data, " Shift Days Reducer");
      return {
        ...state,
        [action.data.shiftCount]: {
          ...state[action.data.shiftCount],
          days: action.data.shiftDays,
          // time: action.data.shiftDays,
        }
      };
    }

    default:
      return state;
  }
};