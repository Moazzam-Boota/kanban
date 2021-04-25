import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { excel_sheet, intial_excel_sheet } from "../../redux/actions/actions";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import MultiSelect from './MultiSelect';
import {
  CInput,
  CLabel,
  CForm,
  CFormGroup,
  CFormText,
  CButton,
  CCol,
  CCard,
  CCardHeader,
  CCardFooter,
  CCardBody,
  CRow

} from '@coreui/react'
import TimeRangePicker from '@wojtekmaj/react-timerange-picker';
import CIcon from '@coreui/icons-react'
import {
  SortableContainer,
  SortableElement,
  sortableHandle,
} from 'react-sortable-hoc';
import Select, { components } from 'react-select';
import { cibLgtm } from '@coreui/icons';

const Dashboard = () => {

  const dispatch = useDispatch()
  const response = useSelector((state) => state.excelReducer.apiCalled);
  const parentsData = [];
  const success = useSelector((state) => state.excelReducer.response);
  console.log(success);

  if (success) {
    toast.success("File Uploaded Successfully");

  }
  const [selectedFile, setSelectedFile] = useState();

  const changeHandler = (event) => {
    setSelectedFile(event.target.files[0]);
    // setIsSelected(true);
  };
  const handleSubmit = () => {

    const formData = new FormData();
    formData.append("file", selectedFile);

    dispatch(excel_sheet(formData))
  };

  var unique = [];
  function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
  }
  if (response) {
    response.rows.map(row => {
      row.doc.values.map(values => {
        parentsData.push(values.line_VOPLGR_EF);
      });
    });
    unique = parentsData.filter(onlyUnique);
  }

  const shiftSet = [
    { shiftNumber: 1, time: ['08:00', '14:00'] },
  ]
  const breakSet = [
    { breakNumber: 2, time: ['08:00', '14:00'] },
  ]
  var [inputList, setInputList] = useState([
    shiftSet[0],
    breakSet[0]
  ]);
  // var [breakList, setBreakList] = useState(breakSet);

  // const [inputList, setInputList] = useState([1]);
  var [count, setCount] = useState(2);
  // var [breakCount, setBreakCount] = useState(1);


  const addShift = () => {
    count = count + 1;
    setCount(count)
    setInputList([...inputList, { ...shiftSet[0], shiftNumber: count }, { ...breakSet[0], breakNumber: count + 1 }])
    count = count + 1;
    setCount(count)
    // addBreakTime();
    // setInputList([...inputList, count])
  }
  const addBreakTime = () => {
    count = count + 1;
    setCount(count)
    // setBreakCount(breakCount)
    setInputList([...inputList, { ...breakSet[0], breakNumber: count }])
    // console.log(breakList);
  }
  console.log(inputList);
  const deleteShift = () => {
    if (count !== 1) {
      let checkCondition = false;
      // shiftSet.filter(k=>k.shiftNumber===count);
      // console.log(inputList.filter(function (e) { return e.shiftNumber !== count }), 'delete')
      // setInputList(inputList.filter(function (e) { return e.shiftNumber !== count }))
      inputList.filter(function (e) {
        if (e.shiftNumber == count) {
          checkCondition = true;
          setInputList(inputList.filter(function (e) { return e.shiftNumber !== count }))
        }
      })
      // setInputList(inputList.filter(function (e) { return e !== count }))
      if (checkCondition === true) {
        count = count - 1;
        setCount(count);
      }
    }
  }
  const deleteBreakTime = () => {
    if (count !== 2) {
      let checkCondition = false;
      // shiftSet.filter(k=>k.shiftNumber===count);
      // console.log(inputList.filter(function (e) { return e.shiftNumber !== count }), 'delete')
      // setInputList(inputList.filter(function (e) { return e.breakNumber !== count }))
      inputList.filter(function (e) {
        if (e.breakNumber == count) {
          checkCondition = true;
          setInputList(inputList.filter(function (e) { return e.breakNumber !== count }))
        }
      })
      // setInputList(inputList.filter(function (e) { return e !== count }))
      if (checkCondition === true) {
        count = count - 1;
        setCount(count);
      }
    }
  }
  const SortableSelect = SortableContainer(Select);
  const ShiftDays = () => {
    return (
      <SortableSelect
        // useDragHandle
        // react-sortable-hoc props:
        axis="xy"
        distance={4}
        // small fix for https://github.com/clauderic/react-sortable-hoc/pull/352:
        // getHelperDimensions={({ node }) => node.getBoundingClientRect()}
        // react-select props:
        hideSelectedOptions={false}
        isMulti
        options={[{ value: 'Monday', label: 'Monday', color: '#00B8D9', isFixed: true },
        { value: 'Tuesday', label: 'Tuesday', color: '#0052CC' },
        { value: 'Wednesday', label: 'Wednesday', color: '#5243AA' },
        { value: 'Thursday', label: 'Thursday', color: '#FF5630', isFixed: true },
        { value: 'Friday', label: 'Friday', color: '#FF8B00' },
        { value: 'Saturday', label: 'Saturday', color: '#FFC400' },
        { value: 'Sunday', label: 'Sunday', color: '#36B37E' }]}

        closeMenuOnSelect={false}
      />
    );
  }
  let countCheck = false;
  let shiftCount = 0;
  const ShiftTime = ({ shiftNumber }) => {
    shiftCount = shiftCount + 1;
    countCheck = true;
    // const [value, onChange] = useState(['08:00', '14:00']);
    // console.log(inputList.filter(e => { return e.shiftNumber === shiftNumber }), 'rnage')
    return (<CFormGroup >
      <CRow xs="2">
        <CCol xs="2"></CCol>
        <CCol xs="3">
          <ShiftDays />
        </CCol>
      </CRow>
      <br />
      <CRow xs="2">
        <CCol xs="2">
          <CLabel htmlFor="city">Shift : {shiftCount}</CLabel>
        </CCol>
        <CCol xs="3">
          <TimeRangePicker
            key={shiftNumber}
            onChange={(value) => {
              // console.log(value, 'timerange');
              // inputList
              var shiftRange = inputList.filter((e) => { return e.shiftNumber === shiftNumber });
              shiftRange[0].time = value;
              // console.log(shiftRange, 'shiftRange')
              setInputList([...inputList])

            }}
            value={inputList.filter(e => { return e.shiftNumber === shiftNumber })[0].time}
          />
        </CCol>
        <CCol xs="1">
          <CButton onClick={addShift} type="submit" size="sm" color="primary">Add</CButton>
        </CCol>
        <CCol xs="1">
          <CButton onClick={deleteShift} type="submit" size="sm" color="danger">Delete</CButton>
        </CCol>
      </CRow>
    </CFormGroup>
    )
  };
  let breakCount = 0;
  const BreakTime = ({ breakNumber }) => {
    countCheck == true ? breakCount = 0 : breakCount = breakCount;
    breakCount = breakCount + 1;
    countCheck = false;
    // const [value, onChange] = useState(['08:00', '14:00']);
    // console.log(inputList.filter(e => { return e.shiftNumber === shiftNumber }), 'rnage')
    return (<CFormGroup >
      <CRow>
        <CCol xs="2">
          <CLabel htmlFor="city">BreakTime : {breakCount}</CLabel>
        </CCol>
        <CCol xs="3">
          <TimeRangePicker
            key={breakNumber}
            onChange={(value) => {
              // console.log(value, 'timerange');
              // inputList
              var breakRange = inputList.filter((e) => { return e.breakNumber === breakNumber });
              breakRange[0].time = value;
              // console.log(shiftRange, 'shiftRange')
              setInputList([...inputList])

            }}
            value={inputList.filter(e => { return e.breakNumber === breakNumber })[0].time}
          />
        </CCol>
        {/* <CCol xs="3">
        <CInput type="time" id="appt" name="appt" min="09:00" max="18:00"></CInput>
      </CCol> */}
        <CCol xs="1">
          <CButton onClick={addBreakTime} type="submit" size="sm" color="primary">Add</CButton>
        </CCol>
        <CCol xs="1">
          <CButton onClick={deleteBreakTime} type="submit" size="sm" color="danger">Delete</CButton>
        </CCol>
      </CRow>
    </CFormGroup>
    )
  };


  useEffect(() => {
    dispatch(intial_excel_sheet());
  }, []);

  return (
    <CCard>
      <CCardHeader>
        Parameters
          </CCardHeader>
      <CCardBody>
        <CRow>
          {/* <CForm action="" method="post" className="form-horizontal">
            <CFormGroup row>
              <CInput type="file" name="hf-file" onChange={changeHandler} placeholder="Upload file..." autoComplete="file" />
              <CFormText className="help-block">Please enter your email</CFormText >
            </CFormGroup>
          </CForm>
          <CCardFooter>
            <CButton onClick={handleSubmit} type="submit" size="sm" color="primary"><CIcon name="cil-scrubber" /> Upload</CButton>
            <ToastContainer />
          </CCardFooter> */}
          <CCol xs="4" sm="4" md="4" lg="4">
            <CFormGroup row>
              <CCol xs="3">
                <CLabel htmlFor="city">Pitch :</CLabel>
              </CCol>
              <CCol xs="3">
                <CInput type="number" id="appt" name="appt" max="999" min="0"
                  onInput={(e) => {
                    e.target.value = Math.max(0, parseInt(e.target.value)).toString().slice(0, 3)
                  }}
                >
                </CInput>
              </CCol>
            </CFormGroup>
            <CFormGroup row>
              <CCol xs="3">
                <CLabel htmlFor="city">Download Hour :</CLabel>
              </CCol>
              <CCol xs="3">
                <CInput type="time" id="appt" name="appt" min="09:00" max="18:00"></CInput>
              </CCol>
            </CFormGroup>
            <CFormGroup row>
              <CCol xs="3">
                <CLabel htmlFor="city">Color :</CLabel>
              </CCol>
              <CCol xs="7">
                <MultiSelect></MultiSelect>
              </CCol>
            </CFormGroup>
          </CCol>
          <CCol xs="6" sm="6" md="6" lg="6">
            {unique.map(i => {
              return (
                <CCol xs="12">
                  <CLabel style={{ marginLeft: '-15px', fontWeight: 'Bold' }} htmlFor="city">{i}</CLabel>
                  {/* {inputList.map(k =>  <ShiftTime shiftNumber={k.shiftNumber} />)}
                  {inputList.map(k => <BreakTime breakNumber={k.breakNumber} />)} */}
                  {inputList.map(k =>
                    k.shiftNumber != undefined ? <ShiftTime shiftNumber={k.shiftNumber} /> : <BreakTime breakNumber={k.breakNumber} />
                  )}
                </CCol>
              )
            })}
          </CCol>
        </CRow>

      </CCardBody>
      <CCardFooter>
        <CButton type="submit" size="sm" color="primary">Save</CButton>
        <ToastContainer />
      </CCardFooter>
    </CCard>
  )
}

export default Dashboard;