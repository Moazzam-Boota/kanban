import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CFormGroup, CButton, CCol, CRow } from "@coreui/react";
import BreakTime from "./BreakTime";
import Select from "react-select";
// import { SortableContainer } from "react-sortable-hoc";
import TimeRangePicker from "@wojtekmaj/react-timerange-picker";
import {
  shiftDays,
  shiftTime,
  addShift,
  deleteShift,
  getShiftData,
} from "../../redux/actions/actions";

// const SortableSelect = SortableContainer(Select);
const ShiftTime = ({
  shiftCount,
  totalShifts,
  setShiftCount,
  shiftsData,
  shiftInitialTime,
  shiftDaysValues,
  shiftInitialBreakTime,
}) => {
  const dispatch = useDispatch();
  const [value, onChange] = useState(shiftInitialTime);
  const [days, setDays] = useState([]);

  useEffect(() => {
    dispatch(shiftTime({ shiftTime: value, shiftCount: shiftCount }));
  }, [value]);

  useEffect(() => {
    dispatch(
      shiftDays({
        shiftDays: days,
        shiftCount: shiftCount,
      })
    );
  }, [days]);

  useEffect(() => {
    onChange(shiftInitialTime);
  }, [shiftInitialTime]);

  useEffect(() => {
    setDays(shiftDaysValues);
  }, [shiftDaysValues]);

  // useEffect(() => {
  //   dispatch(getShiftData(shiftCount));
  // }, []);

  // const singleShiftData = useSelector(
  //   (state) => state.excelReducer.chartParams
  // );
  // console.log(shiftInitialTime, "shiftInitialTime");
  // console.log(shiftInitialBreakTime, "shiftInitialBreakTime");
  // console.log(shiftDaysValues, "singleShiftData");
  // shift breaks, handle here
  var [breakCount, setBreakCount] = useState(
    shiftInitialBreakTime ? shiftInitialBreakTime.map((k, j) => j + 1) : [1]
  );

  return (
    <CFormGroup>
      <h5>Shift : {shiftCount}</h5>
      <hr></hr>
      <br />
      <CRow>
        <CCol xs="3">
          <Select
            key={`weekDays_${shiftCount}`}
            axis="xy"
            distance={4}
            hideSelectedOptions={false}
            isMulti
            // value={shiftDaysValues.map((k) => {
            //   return { value: k, label: k };
            // })}
            value={days}
            // required
            options={[
              { value: "Mon", label: "Mon" },
              { value: "Tue", label: "Tue" },
              { value: "Wed", label: "Wed" },
              { value: "Thu", label: "Thu" },
              { value: "Fri", label: "Fri" },
              { value: "Sat", label: "Sat" },
              { value: "Sun", label: "Sun" },
            ]}
            closeMenuOnSelect={false}
            onChange={setDays}
            // onChange={(selectedOptions) => {
            //   console.log(selectedOptions, "selectedOptions");
            //   // set week_days in redux for a assemblyLine
            //   dispatch(
            //     shiftDays({
            //       shiftDays: selectedOptions.map((k) => k.value),
            //       shiftCount: shiftCount,
            //     })
            //   );
            // }}
          />
        </CCol>
        <CCol xs="4">
          <TimeRangePicker
            key={`shiftTimePicker_${shiftCount}`}
            onChange={onChange}
            value={value}
          />
        </CCol>
        <CCol xs="1">
          <CButton
            key={`shiftAddBtn_${shiftCount}`}
            onClick={() => {
              // add shift-data to redux, for a assemblyLine

              let counter = shiftCount;
              counter++;
              let newShifts = [...totalShifts, counter];
              setShiftCount([...new Set(newShifts)]);

              dispatch(
                addShift({
                  addShift: counter,
                })
              );
            }}
            type="submit"
            size="sm"
            color="primary"
          >
            Add
          </CButton>
        </CCol>
        <CCol xs="1">
          <CButton
            key={`shiftRemoveBtn_${shiftCount}`}
            onClick={() => {
              // remove shift-data from redux, for a assemblyLine

              let newShifts = totalShifts.filter((k) => k !== shiftCount);
              if (newShifts.length >= 1) {
                setShiftCount(newShifts);

                dispatch(
                  deleteShift({
                    deleteShift: shiftCount,
                  })
                );
              }
            }}
            type="submit"
            size="sm"
            color="danger"
          >
            Delete
          </CButton>
        </CCol>
      </CRow>
      <br></br>
      <CRow>
        <CCol>
          {breakCount.map((k) => (
            <BreakTime
              shiftKey={shiftCount}
              breakCount={k}
              totalBreaks={breakCount}
              setBreakCount={setBreakCount}
              shiftInitialBreakTime={
                shiftInitialBreakTime ? shiftInitialBreakTime[k - 1] : []
              }
              // breaksData={shiftsData[shiftCount].breaks}
            />
          ))}
        </CCol>
      </CRow>
    </CFormGroup>
  );
};

export default ShiftTime;
