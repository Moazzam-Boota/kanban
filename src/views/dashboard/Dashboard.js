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
  const addShift = () => {
    setInputList(inputList.concat(<CFormGroup row>
      <CCol xs="2">
        <CLabel htmlFor="city">Shift : 1</CLabel>
      </CCol>
      <CCol xs="3">
        <CInput type="time" id="appt" name="appt" min="09:00" max="18:00"></CInput>
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
        <CButton type="submit" size="sm" color="danger">Delete</CButton>
      </CCol></CFormGroup>));
    console.log(inputList)
    // unique.push("Moazzam");
  }
  const [inputList, setInputList] = useState([<CFormGroup row>
    <CCol xs="2">
      <CLabel htmlFor="city">Shift : 1</CLabel>
    </CCol>
    <CCol xs="3">
      <CInput type="time" id="appt" name="appt" min="09:00" max="18:00"></CInput>
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
      <CButton type="submit" size="sm" color="danger">Delete</CButton>
    </CCol></CFormGroup>
  ]);

  useEffect(() => {
    dispatch(intial_excel_sheet());
  }, []);
  return (
    <>

      <CCard>
        <CCardHeader>
          Parameters
          </CCardHeader>
        <CCardBody>


          <CFormGroup row className="my-0">
            <CCol xs="4">
              <CFormGroup row>
                <CCol xs="2">
                  <CLabel htmlFor="city">Pitch : </CLabel>
                </CCol>
                <CCol xs="7">
                  <CInput type="time" id="appt" name="appt" min="09:00" max="18:00"></CInput>
                </CCol>
              </CFormGroup>
            </CCol>
            {unique.map(i => {
              return (
                <CCol xs="8">
                  <CLabel style={{ marginLeft: '-15px', fontWeight: 'Bold'}} htmlFor="city">{i}</CLabel>
                  <CFormGroup row>
                    {inputList}

                  </CFormGroup>
                </CCol>

              )
            })}
          </CFormGroup>

          <CFormGroup row className="my-0">
            <CCol xs="4">
              <CFormGroup row>
                <CCol xs="2">
                  <CLabel htmlFor="city">Color : </CLabel>
                </CCol>
                <CCol xs="7">
                  <MultiSelect></MultiSelect>
                </CCol>
              </CFormGroup>
            </CCol>
          </CFormGroup>
          <br></br>
          <CFormGroup row className="my-0">
            <CCol xs="4">
              <CFormGroup row>
                <CCol xs="2">
                  <CLabel htmlFor="city">Download Hour</CLabel>
                </CCol>
                <CCol xs="7">
                  <CInput type="time" id="appt" name="appt" min="09:00" max="18:00"></CInput>
                </CCol>
              </CFormGroup>
            </CCol>
          </CFormGroup>
        </CCardBody>
        <CCardFooter>
          <CButton type="submit" size="sm" color="primary">Save</CButton>
          <ToastContainer />
        </CCardFooter>
      </CCard>

    </>
  )
}

export default Dashboard
