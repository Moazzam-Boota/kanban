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
    { breakNumber: 1, time: ['08:00', '14:00'] },
  ]
  var [inputList, setInputList] = useState(shiftSet);
  var [breakList, setBreakList] = useState(breakSet);

  // const [inputList, setInputList] = useState([1]);
  var [count, setCount] = useState(1);
  var [breakCount, setBreakCount] = useState(1);


  const addShift = () => {
    count = count + 1;
    setCount(count)

    setInputList([...inputList, { ...shiftSet[0], shiftNumber: count }])
    addBreakTime();
    // setInputList([...inputList, count])
  }
  const addBreakTime = () => {
    breakCount = breakCount + 1;
    setBreakCount(breakCount)

    setBreakList([...breakList, { ...breakSet[0], breakNumber: breakCount }])
    // console.log(breakList);
  }
  const deleteShift = () => {
    if (count !== 1) {
      // shiftSet.filter(k=>k.shiftNumber===count);
      // console.log(inputList.filter(function (e) { return e.shiftNumber !== count }), 'delete')
      setInputList(inputList.filter(function (e) { return e.shiftNumber !== count }))
      // setInputList(inputList.filter(function (e) { return e !== count }))
      count = count - 1;
      setCount(count);
    }
  }
  const deleteBreakTime = () => {
    if (breakCount !== 1) {
      // shiftSet.filter(k=>k.shiftNumber===count);
      // console.log(inputList.filter(function (e) { return e.shiftNumber !== count }), 'delete')
      setBreakList(breakList.filter(function (e) { return e.breakNumber !== breakCount }))
      // setInputList(inputList.filter(function (e) { return e !== count }))
      breakCount = breakCount - 1;
      setBreakCount(breakCount);
    }
  }


  const ShiftTime = ({ shiftNumber }) => {
    // const [value, onChange] = useState(['08:00', '14:00']);
    // console.log(inputList.filter(e => { return e.shiftNumber === shiftNumber }), 'rnage')
    return (<CFormGroup >
      <CRow xs="2">
        <CCol xs="2">
          <CLabel htmlFor="city">Shift : {shiftNumber}</CLabel>
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
  const BreakTime = ({ breakNumber }) => {
    // const [value, onChange] = useState(['08:00', '14:00']);
    // console.log(inputList.filter(e => { return e.shiftNumber === shiftNumber }), 'rnage')
    return (<CFormGroup >
      <CRow>
        <CCol xs="2">
          <CLabel htmlFor="city">BreakTime</CLabel>
        </CCol>
        <CCol xs="3">
          <TimeRangePicker
            key={breakNumber}
            onChange={(value) => {
              // console.log(value, 'timerange');
              // inputList
              var breakRange = breakList.filter((e) => { return e.breakNumber === breakNumber });
              breakRange[0].time = value;
              // console.log(shiftRange, 'shiftRange')
              setBreakList([...breakList])

            }}
            value={breakList.filter(e => { return e.breakNumber === breakNumber })[0].time}
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
                <CInput type="time" id="appt" name="appt" min="09:00" max="18:00"></CInput>
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
                  {inputList.map(k => <ShiftTime shiftNumber={k.shiftNumber} />)}
                  {breakList.map(k => <BreakTime breakNumber={k.breakNumber} />)}
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