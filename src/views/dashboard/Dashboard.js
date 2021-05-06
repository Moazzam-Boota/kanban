import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { excelSheet, intialExcelSheet, pushShiftsData } from "../../redux/actions/actions";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import 'sweetalert2/src/sweetalert2.scss';
import {
  CInput,
  CLabel,
  CForm,
  CFormGroup,
  CInputRadio,
  CButton,
  CCol,
  CCard,
  CCardHeader,
  CCardFooter,
  CCardBody,
  CRow

} from '@coreui/react'
import CIcon from '@coreui/icons-react'

import ShiftTime from './Shift';

const Dashboard = () => {
  var [shiftCount, setShiftCount] = useState([1]);
  var [pitchTime, setPitchTime] = useState(30);
  var [blueColor, setBlueColor] = useState(2);
  var [greenMinColor, setGreenMinColor] = useState(3);
  var [greenMaxColor, setGreenMaxColor] = useState(5);
  var [orangeMinColor, setOrangeMinColor] = useState(6);
  var [orangeMaxColor, setOrangeMaxColor] = useState(8);
  var [redMinColor, setRedMinColor] = useState(9);
  var [redMaxColor, setRedMaxColor] = useState(11);
  var [blackMinColor, setBlackMinColor] = useState(12);
  var [blackMaxColor, setBlackMaxColor] = useState(13);
  var [fileDownloadType, setFileDownloadType] = useState('');
  var [downloadTime, setDownloadTime] = useState([]);

  // get data from redux
  const dispatch = useDispatch()
  const response = useSelector((state) => state.excelReducer.apiCalled);
  const parentsData = [];
  const success = useSelector((state) => state.excelReducer.response);
  const allState = useSelector((state) => state.excelReducer);

  if (success) {
    toast.success("File Uploaded Successfully");

  }
  const [selectedFile, setSelectedFile] = useState();

  const changeHandler = (event) => {
    setSelectedFile(event.target.files[0]);
    // setIsSelected(true);
  };

  const saveParametersData = () => {
    // pass data to database 
    const dataState = { ...allState };
    delete dataState.apiCalled;

    const parameters = {
      pitchTime: pitchTime,
      fileDownloadType: fileDownloadType,
      downloadTime: downloadTime, // in case of manual, undefined
      colors: {
        blue: {
          min: blueColor
        },
        green: {
          min: greenMinColor,
          max: greenMaxColor
        },
        orange: {
          min: orangeMinColor,
          max: orangeMaxColor
        },
        red: {
          min: redMinColor,
          max: redMaxColor
        },
        black: {
          min: blackMinColor,
          max: blackMaxColor
        }
      },
      PERS044: {  // assembly Line
        ...dataState
      },
      createdAt: new Date()
    };
    dispatch(pushShiftsData(parameters));
    Swal.fire(
      'Saved',
      'Shift data is saved!',
      'success'
    )
  }
  const getTime = (value) => {
    //set file download time
    setDownloadTime(value);
  }

  const fileFormSubmit = () => {
    const formData = new FormData();
    formData.append("file", selectedFile);

    dispatch(excelSheet(formData))
  };

  var uniqueAssemblyLines = [];
  function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
  }
  if (response) {
    response.forEach(row => {
      row.values.forEach(values => {
        parentsData.push(values.line_VOPLGR_EF);
      });
    });
    uniqueAssemblyLines = parentsData.filter(onlyUnique);
  }

  useEffect(() => {
    dispatch(intialExcelSheet());
  }, [dispatch]);

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
                <CForm action="" method="post" inline>
                  <CFormGroup className="pr-1">
                    <CInput type="number" id="pitchTime" name="pitchTime" min={1} max={999} value={pitchTime}
                      onChange={(e) => {
                        setPitchTime(Math.max(0, parseInt(e.target.value)).toString().slice(0, 3));
                      }}
                    />
                    <CLabel htmlFor="exampleInputName2" className="pr-1" style={{ marginLeft: '5px' }}>{`   mins`}</CLabel>
                  </CFormGroup>
                </CForm>

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

              {fileDownloadType === 'automatic' ? <CCol md="5"><CInput onChange={(e) => { getTime(e.target.value) }} type="datetime-local" id="autoDownloadTime" name="autoDownloadTime" min="09:00" max="18:00"></CInput></CCol>
                : fileDownloadType === 'manual' ? <CCol md="9">
                  <CFormGroup row>
                    <CCol md="7">

                      <CInput type="file" required name="hf-file" onChange={changeHandler} placeholder="Upload file..." autoComplete="file" />
                    </CCol>
                    <CCol md="5">
                      <CButton onClick={fileFormSubmit} type="submit" size="sm" color="primary"><CIcon name="cil-scrubber" /> Upload</CButton>
                      <ToastContainer />
                    </CCol>
                  </CFormGroup>
                </CCol> : ''}

            </CFormGroup>
            <CFormGroup row>
              <CCol xs="3">
                <CLabel htmlFor="city">Colors :</CLabel>
              </CCol>
              <CCol xs="7">
                <CRow>
                  <CCol lg="12">
                    <CForm action="" method="post" inline>
                      <CFormGroup className="pr-1">
                        <CLabel htmlFor="exampleInputName2" className="pr-1"><span><b>blau</b> </span> <span style={{ marginLeft: '33px' }}>{'<'}</span></CLabel>
                        <CInput type="number" id="blueColor" name="blueColor" min={0} max={13} step={1} value={blueColor}
                          onChange={(e) => {
                            setBlueColor(Math.max(0, parseInt(e.target.value)).toString().slice(0, 2));
                          }}
                        />
                        <CLabel htmlFor="exampleInputName2" className="pr-1" style={{ marginLeft: '5px' }}>{`   pitchs`}</CLabel>
                      </CFormGroup>
                    </CForm>
                  </CCol>
                </CRow>
                <br></br>
                <CRow>
                  <CCol lg="12">
                    <CForm action="" method="post" inline>
                      <CFormGroup className="pr-1">
                        <CLabel htmlFor="exampleInputName2" className="pr-1"><b>verd</b></CLabel>
                        <CInput type="number" name="greenMinColor" min={0} max={13} step={1} value={greenMinColor} style={{ marginLeft: '42px' }}
                          onChange={(e) => {
                            setGreenMinColor(Math.max(0, parseInt(e.target.value)).toString().slice(0, 2));
                          }}
                        />
                        {'   '}
                        <CLabel htmlFor="exampleInputName2" className="pr-1" style={{ marginLeft: '20px', marginRight: '20px' }}>a</CLabel>
                        <CInput type="number" name="greenMaxColor" min={0} max={13} step={1} value={greenMaxColor}
                          onChange={(e) => {
                            setGreenMaxColor(Math.max(0, parseInt(e.target.value)).toString().slice(0, 2));
                          }}
                        />
                        <CLabel htmlFor="exampleInputName2" className="pr-1" style={{ marginLeft: '5px' }}>{`   pitch`}</CLabel>
                      </CFormGroup>
                    </CForm>
                  </CCol>
                </CRow>
                <br></br>
                <CRow>
                  <CCol lg="12">
                    <CForm action="" method="post" inline>
                      <CFormGroup className="pr-1">
                        <CLabel htmlFor="exampleInputName2" className="pr-1"><b>taronja</b></CLabel>
                        <CInput type="number" name="orangeMinColor" min={0} max={13} step={1} value={orangeMinColor} style={{ marginLeft: '25px' }}
                          onChange={(e) => {
                            setOrangeMinColor(Math.max(0, parseInt(e.target.value)).toString().slice(0, 2));
                          }}
                        />
                        {'   '}
                        <CLabel htmlFor="exampleInputName2" className="pr-1" style={{ marginLeft: '20px', marginRight: '20px' }}>a</CLabel>
                        <CInput type="number" name="blueColor" min={0} max={13} step={1} value={orangeMaxColor}
                          onChange={(e) => {
                            setOrangeMaxColor(Math.max(0, parseInt(e.target.value)).toString().slice(0, 2));
                          }}
                        />
                        <CLabel htmlFor="exampleInputName2" className="pr-1" style={{ marginLeft: '5px' }}>{`   pitch`}</CLabel>
                      </CFormGroup>
                    </CForm>
                  </CCol>
                </CRow>
                <br></br>
                <CRow>
                  <CCol lg="12">
                    <CForm action="" method="post" inline>
                      <CFormGroup className="pr-1">
                        <CLabel htmlFor="exampleInputName2" className="pr-1"><b>vermell</b></CLabel>
                        <CInput type="number" name="blueColor" min={0} max={13} step={1} value={redMinColor} style={{ marginLeft: '25px' }}
                          onChange={(e) => {
                            setRedMinColor(Math.max(0, parseInt(e.target.value)).toString().slice(0, 2));
                          }}
                        />
                        {'   '}
                        <CLabel htmlFor="exampleInputName2" className="pr-1" style={{ marginLeft: '20px', marginRight: '20px' }}>a</CLabel>
                        <CInput type="number" name="blueColor" min={0} max={13} step={1} value={redMaxColor}
                          onChange={(e) => {
                            setRedMaxColor(Math.max(0, parseInt(e.target.value)).toString().slice(0, 2));
                          }}
                        />
                        <CLabel htmlFor="exampleInputName2" className="pr-1" style={{ marginLeft: '5px' }}>{`   pitch`}</CLabel>
                      </CFormGroup>
                    </CForm>
                  </CCol>
                </CRow>
                <br></br>
                <CRow>
                  <CCol lg="12">
                    <CForm action="" method="post" inline>
                      <CFormGroup className="pr-1">
                        <CLabel htmlFor="exampleInputName2" className="pr-1"><span><b>negre</b> </span> <span style={{ marginLeft: '28px' }}>{'>'}</span></CLabel>
                        <CInput type="number" id="blackMinColor" name="blackMinColor" min={0} max={13} step={1} value={blackMinColor}
                          onChange={(e) => {
                            setBlackMinColor(Math.max(0, parseInt(e.target.value)).toString().slice(0, 2));
                          }}
                        />
                        <CLabel htmlFor="exampleInputName2" className="pr-1" style={{ marginLeft: '20px', marginRight: '20px' }}>a</CLabel>
                        <CInput type="number" id="blackMaxColor" name="blackMaxColor" min={0} max={13} step={1} value={blackMaxColor}
                          onChange={(e) => {
                            setBlackMaxColor(Math.max(0, parseInt(e.target.value)).toString().slice(0, 2));
                          }}
                        />
                        <CLabel htmlFor="exampleInputName2" className="pr-1" style={{ paddingLeft: '5px' }}>{`   pitch`}</CLabel>

                      </CFormGroup>
                    </CForm>
                  </CCol>
                </CRow>
              </CCol>
            </CFormGroup>
          </CCol>
          <CCol xs="6" sm="6" md="6" lg="6">
            {uniqueAssemblyLines.map(assemblyLine => {
              return (
                <CCol xs="12">
                  <h3 style={{ textDecoration: 'underline' }}>{assemblyLine}</h3>
                  <br></br>
                  {shiftCount.map(k =>
                    <ShiftTime
                      assemblyLine={assemblyLine}
                      totalShifts={shiftCount}
                      shiftCount={k}
                      setShiftCount={setShiftCount} />
                  )}
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