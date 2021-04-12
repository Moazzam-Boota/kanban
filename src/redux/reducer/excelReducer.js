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
