import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { CFormGroup, CButton, CCol, CRow } from "@coreui/react";
import BreakTime from "./BreakTime";
import Select from "react-select";
import { SortableContainer } from "react-sortable-hoc";
import TimeRangePicker from "@wojtekmaj/react-timerange-picker";
import {
  shift_days,
  shift_time,
  addShift,
  deleteShift,
} from "../../redux/actions/actions";

const SortableSelect = SortableContainer(Select);
const ShiftTime = ({
  shiftCount,
  totalShifts,
  setShiftCount,
}) => {

  const dispatch = useDispatch();
  // shift breaks, handle here
  var [breakCount, setBreakCount] = useState([1]);

  return (
    <CFormGroup>
      <h5>Shift : {shiftCount}</h5>
      <hr></hr>
      <br />
      <CRow>
        <CCol xs="3">
          <SortableSelect
            key={`weekDays_${shiftCount}`}
            axis="xy"
            distance={4}
            hideSelectedOptions={false}
            isMulti
            // required
            options={[
              { value: "Mon", label: "Mon" },
              { value: "Tue", label: "Tue" },
              { value: "Wed", label: "Wed" },
              { value: "Thur", label: "Thur" },
              { value: "Fri", label: "Fri" },
              { value: "Sat", label: "Sat" },
              { value: "Sun", label: "Sun" },
            ]}
            closeMenuOnSelect={false}
            onChange={(selectedOptions) => {
              // set week_days in redux for a assemblyLine
              dispatch(
                shift_days({
                  shiftDays: selectedOptions.map((k) => k.value),
                  shiftCount: shiftCount,
                })
              );
            }}
          />
        </CCol>
        <CCol xs="4">
          <TimeRangePicker
            key={`shiftTimePicker_${shiftCount}`}
            onChange={(value) => {
              // set time for a shift in redux
              dispatch(
                shift_time({ shiftTime: value, shiftCount: shiftCount })
              );
            }}
            value={["08:00", "14:00"]}
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
            />
          ))}
        </CCol>
      </CRow>
    </CFormGroup>
  );
};

export default ShiftTime;
