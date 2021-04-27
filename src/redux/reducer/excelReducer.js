const init = {
  // loginStatus: true
}
export const excelReducer = (state = init, action) => {
  switch (action.type) {
    case "Excel":
      return {
        ...state,
        apiCalled: action.data,
        response: action.response
      };
    default:
      return state;
  }
};
export const pitchTimeReducer = (state = init, action) => {
  switch (action.type) {
    case "Pitch_Time":
      console.log(action.data, "pitchtime Reducer");
      return {
        ...state,
        pitchTime: action.data
      };
    default:
      return state;
  }
};
export const fileDownloadTypeReducer = (state = init, action) => {
  switch (action.type) {
    case "File_Download_Type":
      console.log(action.data, " file download type Reducer");
      return {
        ...state,
        fileDownloadType: action.data
      };
    default:
      return state;
  }
};
export const shiftDaysReducer = (state = init, action) => {
  switch (action.type) {
    case "Shift_Days":
      console.log(action.data, " Shift Days Reducer");
      return {
        ...state,
        selected: action.data
      };
    default:
      return state;
  }
};
export const shiftTimeReducer = (state = init, action) => {
  switch (action.type) {
    case "Shift_Time":
      console.log(action.data, " Shift time Reducer");
      return {
        ...state,
        shiftTime: action.data
      };
    default:
      return state;
  }
};
export const breakTimeReducer = (state = init, action) => {
  switch (action.type) {
    case "Break_Time":
      console.log(action.data, " Break time Reducer");
      return {
        ...state,
        breakTime: action.data
      };
    default:
      return state;
  }
};
export const rangeSelectReducer = (state = init, action) => {
  switch (action.type) {
    case "Range_Select":
      console.log(action.data, " Range select Reducer");
      return {
        ...state,
        range: action.data
      };
    default:
      return state;
  }
};
export const downlaodTimeReducer = (state = init, action) => {
  switch (action.type) {
    case "Download_Time":
      console.log(action.data, " Downlaod Time Reducer");
      return {
        ...state,
        downloadTime: action.data
      };
    default:
      return state;
  }
};
