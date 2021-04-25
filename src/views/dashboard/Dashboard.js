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
  CInputRadio,
  CButton,
  CFormText,
  CCol,
  CCard,
  CCardHeader,
  CCardFooter,
  CCardBody,
  CRow

} from '@coreui/react'
import CIcon from '@coreui/icons-react'

import { cibLgtm } from '@coreui/icons';
import ShiftTime from './Shift';

const Dashboard = () => {
  var [shiftCount, setShiftCount] = useState([1]);
  var [pitchTime, setPitchTime] = useState(15);
  var [fileDownloadType, setFileDownloadType] = useState('');
  // handle shifts number here
  const dispatch = useDispatch()
  const response = useSelector((state) => state.excelReducer.apiCalled);
  const parentsData = [];
  const success = useSelector((state) => state.excelReducer.response);
  console.log(shiftCount);

  if (success) {
    toast.success("File Uploaded Successfully");

  }
  const [selectedFile, setSelectedFile] = useState();

  const changeHandler = (event) => {
    setSelectedFile(event.target.files[0]);
    // setIsSelected(true);
  };

  const saveParametersData = () => {

  }

  const fileFormSubmit = () => {
    const formData = new FormData();
    formData.append("file", selectedFile);

    dispatch(excel_sheet(formData))
  };

  var uniqueAssemblyLines = [];
  function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
  }
  if (response) {
    response.rows.map(row => {
      row.doc.values.map(values => {
        parentsData.push(values.line_VOPLGR_EF);
      });
    });
    uniqueAssemblyLines = parentsData.filter(onlyUnique);
  }

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

          <CCol xs="4" sm="4" md="4" lg="4">
            <CFormGroup row>
              <CCol xs="3">
                <CLabel htmlFor="city">Pitch :</CLabel>
              </CCol>
              <CCol xs="2">
                <CInput type="number" id="pitchTime" name="pitchTime" min={1} max={999} value={pitchTime}
                  onChange={(e) => {
                    setPitchTime(Math.max(0, parseInt(e.target.value)).toString().slice(0, 3));
                  }}
                >
                </CInput>
              </CCol>
            </CFormGroup>
            <CFormGroup row>
              <CCol xs="3">
                <CLabel htmlFor="city">Download :</CLabel>
              </CCol>
              <CCol md="9">
                <CFormGroup variant="custom-radio" inline>
                  <CInputRadio onClick={(e) => { setFileDownloadType('automatic'); }} custom id="inline-radio1" name="fileDownloadCheck" value="automatic" />
                  <CLabel variant="custom-checkbox" htmlFor="inline-radio1">Automatic</CLabel>
                </CFormGroup>
                <CFormGroup variant="custom-radio" inline>
                  <CInputRadio onClick={(e) => { setFileDownloadType('manual'); }} custom id="inline-radio2" name="fileDownloadCheck" value="manual" />
                  <CLabel variant="custom-checkbox" htmlFor="inline-radio2">Manual</CLabel>
                </CFormGroup>
              </CCol>
            </CFormGroup>
            <CFormGroup row>
              <CCol xs="3">
                <CLabel htmlFor="autoFile"></CLabel>
              </CCol>

              {fileDownloadType === 'automatic' ? <CCol md="3"><CInput type="time" id="autoDownloadTime" name="autoDownloadTime" min="09:00" max="18:00"></CInput></CCol>
                : fileDownloadType === 'manual' ? <CCol md="9">
                  <CForm name="fileSubmitForm" id="fileSubmitForm" action="" method="post" className="form-horizontal">
                    <CFormGroup row>
                      <CCol md="7">

                        <CInput type="file" required name="hf-file" onChange={changeHandler} placeholder="Upload file..." autoComplete="file" />
                      </CCol>
                      <CCol md="5">
                        <CButton onClick={fileFormSubmit} type="submit" size="sm" color="primary"><CIcon name="cil-scrubber" /> Upload</CButton>
                        <ToastContainer />
                      </CCol>
                    </CFormGroup>
                  </CForm>
                </CCol> : ''}

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
            {uniqueAssemblyLines.map(assemblyLine => {
              return (
                <CCol xs="12">
                  <h3 style={{ textDecoration: 'underline' }}>{assemblyLine}</h3>
                  <br></br>
                  {shiftCount.map(k => <ShiftTime totalShifts={shiftCount} shiftCount={k} setShiftCount={setShiftCount} />)}
                </CCol>
              )
            })}
          </CCol>
        </CRow>

      </CCardBody>
      <CCardFooter>
        <CButton onClick={saveParametersData} type="submit" size="sm" color="primary">Save Params</CButton>
        <ToastContainer />
      </CCardFooter>
    </CCard>
  )
}

export default Dashboard;