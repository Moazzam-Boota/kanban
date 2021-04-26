import { CLabel, CFormGroup, CButton, CCol, CRow } from "@coreui/react";
import TimeRangePicker from "@wojtekmaj/react-timerange-picker";

const BreakTime = ({ shiftKey, breakCount, totalBreaks, setBreakCount }) => {
  return (
    <CFormGroup>
      <CRow>
        <CCol xs="2">
          <CLabel htmlFor="city">Break : {breakCount}</CLabel>
        </CCol>
        <CCol xs="4">
          <TimeRangePicker
            key={`breakTimePicker_${shiftKey}_${breakCount}`}
            onChange={(value) => {
              { console.log("BreakTime is ", value) }
              // set time for a break in redux
            }}
            value={["08:00", "14:00"]}
          />
        </CCol>
        <CCol xs="1">
          <CButton
            key={`breakAddBtn_${shiftKey}_${breakCount}`}
            onClick={() => {
              // add break-data to redux, for a shift in assemblyLine

              let counter = breakCount;
              counter++;
              let newShifts = [...totalBreaks, counter];
              setBreakCount([...new Set(newShifts)]);
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
            key={`breakRemoveBtn_${shiftKey}_${breakCount}`}
            onClick={() => {
              // remove break-data from redux, for a shift in assemblyLine

              let newShifts = totalBreaks.filter((k) => k !== breakCount);
              if (newShifts.length >= 1) setBreakCount(newShifts);
            }}
            type="submit"
            size="sm"
            color="danger"
          >
            Delete
          </CButton>
        </CCol>
      </CRow>
    </CFormGroup>
  );
};

export default BreakTime;
