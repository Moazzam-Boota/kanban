import React, { useState, useEffect } from "react";
import { CFormGroup, CButton, CCol, CRow } from "@coreui/react";
import BreakTime from "./BreakTime";
import Select from "react-select";
import { SortableContainer } from "react-sortable-hoc";
import TimeRangePicker from "@wojtekmaj/react-timerange-picker";

const SortableSelect = SortableContainer(Select);
const ShiftTime = ({ shiftCount, totalShifts, setShiftCount }) => {
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
          />
        </CCol>
        <CCol xs="4">
          <TimeRangePicker
            key={`shiftTimePicker_${shiftCount}`}
            onChange={(value) => {
              // set in redux
            }}
            value={["08:00", "14:00"]}
          />
        </CCol>
        <CCol xs="1">
          <CButton
            key={`shiftAddBtn_${shiftCount}`}
            onClick={() => {
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
