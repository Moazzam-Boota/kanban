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
      console.log(action.data, "Reducer")
      return {
        ...state,
        pitchTime: action.data
      };
    default:
      return state;
  }
};
