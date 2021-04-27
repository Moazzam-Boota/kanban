import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CFormGroup, CButton, CCol, CRow } from "@coreui/react";
import BreakTime from "./BreakTime";
import Select from "react-select";
import { SortableContainer } from "react-sortable-hoc";
import TimeRangePicker from "@wojtekmaj/react-timerange-picker";
import { shift_Days, shift_Time } from "../../redux/actions/actions";

const SortableSelect = SortableContainer(Select);
const ShiftTime = ({
  assemblyLine,
  shiftCount,
  totalShifts,
  setShiftCount,
}) => {
  // const [selected, setSelected] = React.useState([]);
  // const [shiftTime, setShifttime] = React.useState([]);
  const onChange = (selectedOptions) => {
    // setSelected(selectedOptions);
    dispatch(
      shift_Days({ shiftDays: selectedOptions, shiftCount: shiftCount })
    );
  };
  const dispatch = useDispatch();

  console.log("Selected days are ");
  // shift breaks, handle here
  var [breakCount, setBreakCount] = useState([1]);

  const timeChange = (value) => {
    {
      console.log("Shift Time", value);
    }
    // setShifttime(value);
    dispatch(shift_Time({ shiftTime: value, shiftCount: shiftCount }));
  };

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
              {
                value: "Mon",
                label: "Mon",
                color: "#00B8D9",
                isFixed: true,
              },
              { value: "Tue", label: "Tue", color: "#0052CC" },
              { value: "Wed", label: "Wed", color: "#5243AA" },
              {
                value: "Thur",
                label: "Thur",
                color: "#FF5630",
                isFixed: true,
              },
              { value: "Fri", label: "Fri", color: "#FF8B00" },
              { value: "Sat", label: "Sat", color: "#FFC400" },
              { value: "Sun", label: "Sun", color: "#36B37E" },
            ]}
            closeMenuOnSelect={false}
            onChange={
              onChange
              // set week_days in redux for a assemblyLine
            }
          />
        </CCol>
        <CCol xs="4">
          <TimeRangePicker
            key={`shiftTimePicker_${shiftCount}`}
            onChange={(val) => {
              timeChange(val);
              // set time for a shift in redux
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
              if (newShifts.length >= 1) setShiftCount(newShifts);
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
