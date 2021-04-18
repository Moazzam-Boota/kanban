import React, { lazy, useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { excel_sheet, intial_excel_sheet } from "../../redux/actions/actions";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import MultiSelect from './MultiSelect';
import {
  CInput,
  CContainer,
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
  CSelect,
  CDropdownMenu,
  CDropdownToggle,
  CDropdown,
  CInputGroup,
  CRow

} from '@coreui/react'
import TimeRangePicker from '@wojtekmaj/react-timerange-picker';
import CIcon from '@coreui/icons-react'

const Dashboard = () => {

  const dispatch = useDispatch()

  const queryPage = useLocation().search.match(/page=([0-9]+)/, '')
  const currentPage = Number(queryPage && queryPage[1] ? queryPage[1] : 1)
  const [page, setPage] = useState(currentPage)


  // const success = useSelector((state) => state.excelReducer.response);
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

  // console.log(success);

  // if (success) {
  //   toast.success("File Uploaded Successfully");

  // }
  // const [selectedFile, setSelectedFile] = useState();

  // const changeHandler = (event) => {
  //   setSelectedFile(event.target.files[0]);
  //   // setIsSelected(true);
  // };
  // const handleSubmit = () => {

  //   const formData = new FormData();
  //   formData.append("file", selectedFile);

  //   dispatch(excel_sheet(formData))
  // };
  var unique = [];
  function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
  }
  if (response) {
    console.log(response)
    response.rows.map(row => {
      row.doc.values.map(values => {
        parentsData.push(values.line_VOPLGR_EF);
      });
    });
    unique = parentsData.filter(onlyUnique);
    console.log(unique);
  }

  const shiftSet = [
    { shiftNumber: 1, time: ['08:00', '14:00'] },
  ]
  var [inputList, setInputList] = useState(shiftSet);

  // const [inputList, setInputList] = useState([1]);
  var [count, setCount] = useState(1);

  const addShift = () => {
    count = count + 1;
    setCount(count)

    setInputList([...inputList, { ...shiftSet[0], shiftNumber: count }])
    // setInputList([...inputList, count])
  }

  const deleteShift = () => {
    if (count !== 1) {
      // shiftSet.filter(k=>k.shiftNumber===count);
      console.log(inputList.filter(function (e) { return e.shiftNumber !== count }), 'delete')
      setInputList(inputList.filter(function (e) { return e.shiftNumber !== count }))
      // setInputList(inputList.filter(function (e) { return e !== count }))
      count = count - 1;
      setCount(count);
    }
  }

  const ShiftTime = ({ shiftNumber }) => {
    const [value, onChange] = useState(['08:00', '14:00']);
    console.log(inputList.filter(e => { return e.shiftNumber === shiftNumber }), 'rnage')
    return (<CFormGroup row>
      <CCol xs="2">
        <CLabel htmlFor="city">Shift : {shiftNumber}</CLabel>
      </CCol>
      <CCol xs="3">
        <TimeRangePicker
          key={shiftNumber}
          onChange={(value) => {
            console.log(value, 'timerange');
            // inputList
            var shiftRange = inputList.filter((e) => { return e.shiftNumber === shiftNumber });
            shiftRange[0].time = value;
            console.log(shiftRange, 'shiftRange')
            setInputList([...inputList])
            // setInputList(inputList.filter((e) => { return e.shiftNumber !== shiftNumber }))

          }}
          value={inputList.filter(e => { return e.shiftNumber === shiftNumber })[0].time}
        />
        {/* <CInput type="time" id="appt" name="appt" min="09:00" max="18:00"></CInput> */}
      </CCol>
      <CCol xs="2">
        <CLabel htmlFor="city">BreakTime</CLabel>
      </CCol>
      <CCol xs="3">
        <CInput type="time" id="appt" name="appt" min="09:00" max="18:00"></CInput>
      </CCol>
      <CCol xs="1">
        <CButton onClick={addShift} type="submit" size="sm" color="primary">Add</CButton>
      </CCol>
      <CCol xs="1">
        <CButton onClick={deleteShift} type="submit" size="sm" color="danger">Delete</CButton>
      </CCol>
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

export default Dashboard