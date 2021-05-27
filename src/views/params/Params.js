import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { excelSheet, getChartData, intialExcelSheet, pushShiftsData, startApp } from "../../redux/actions/actions";
import { ToastContainer } from 'react-toastify';
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

const lodash = require('lodash');

const Params = () => {
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
  // var [blackMaxColor, setBlackMaxColor] = useState(13);
  var [shiftInitialTime, setShiftInitialTime] = useState([["09:00", "12:00"]]);
  var [shiftDaysValues, setShiftDaysValues] = useState([[]]);
  var [shiftInitialBreakTime, setShiftInitialBreakTime] = useState([["11:00", "11:15"]]);
  var [fileDownloadType, setFileDownloadType] = useState('');
  var [downloadTime, setDownloadTime] = useState([]);

  // get data from redux
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getChartData());
  }, []);
  // const response = useSelector((state) => state.excelReducer.apiCalled);
  const dbChartParams = useSelector((state) => state.excelReducer.chartParams);
  const allState = useSelector((state) => state.excelReducer);
  console.log(dbChartParams, 'dbChartParams')
  // console.log(response, 'response');

  const [selectedFile, setSelectedFile] = useState();

  const changeHandler = (event) => {
    setSelectedFile(event.target.files[0]);
    // setIsSelected(true);
  };

  const getParameters = (lineData) => {
    return {
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
          // max: blackMaxColor
        }
      },
      PERS044: {  // assembly Line
        ...lineData
      },
      createdAt: new Date().toISOString()
    }
  }


  const saveParametersData = () => {
    let autoDownloadTime = document.getElementById("autoDownloadTime");
    if (autoDownloadTime == null || autoDownloadTime.value === "") {
      Swal.fire(
        {
          icon: "error",
          title: "Error",
          text: "Please enter automatic time"
        }
      )
    } else {
      // pass data to database 
      // pass data to database 
      // pass data to database 
      const dataState = { ...allState };
      delete dataState.apiCalled;
      delete dataState.chartParams;
      delete dataState.response;
      console.log(dataState, 'dataState')

      dispatch(pushShiftsData(getParameters(dataState)));
      Swal.fire(
        'Saved',
        'Shift data is saved!',
        'success'
      )
    }
  }
  const getTime = (value) => {
    console.log(value, 'value')
    //set file download time
    setDownloadTime(value);
  }

  const fileFormSubmit = () => {
    const formData = new FormData();
    formData.append("file", selectedFile);

    dispatch(excelSheet(formData))
    Swal.fire(
      'Uploaded',
      'File Uploaded Successfully!',
      'success'
    )
  };

  // var uniqueAssemblyLines = [];
  // function onlyUnique(value, index, self) {
  //   return self.indexOf(value) === index;
  // }
  // if (response) {
  //   response.forEach(row => {
  //     parentsData.push(row.values[0].line_VOPLGR_EF);
  //   });
  //   uniqueAssemblyLines = parentsData.filter(onlyUnique);
  // }



  useEffect(() => {

    const chartParamsData = lodash.get(dbChartParams, [0, 'values']);
    console.log(chartParamsData, 'dbChartParams')
    if (chartParamsData) {
      setPitchTime(chartParamsData.pitchTime)
      setFileDownloadType(chartParamsData.fileDownloadType)
      setDownloadTime(chartParamsData.downloadTime)
      setBlueColor(chartParamsData.colors.blue.min)
      setGreenMinColor(chartParamsData.colors.green.min)
      setGreenMaxColor(chartParamsData.colors.green.max)
      setOrangeMinColor(chartParamsData.colors.orange.min)
      setOrangeMaxColor(chartParamsData.colors.orange.max)
      setRedMinColor(chartParamsData.colors.red.min)
      setRedMaxColor(chartParamsData.colors.red.max)
      setBlackMinColor(chartParamsData.colors.black.min)
      // setBlackMinColor(chartParamsData.colors.black.max)
      let shiftsData = chartParamsData.PERS044;
      console.log(shiftsData)
      const shiftTimes = [];
      const shiftDays = [];
      const breakTimes = [];
      for (const [shiftKey, shiftsData] of Object.entries(shiftsData)) {
        console.log(shiftKey, shiftsData.breaks, 'hello');
        const singleBreakTimes = [];

        for (const [breakKey, breakData] of Object.entries(shiftsData.breaks)) {
          console.log(breakKey, breakData.time, 'hello2');
          singleBreakTimes.push(breakData.time);
        }
        breakTimes.push(singleBreakTimes);
        shiftTimes.push(shiftsData.time);
        shiftDays.push(shiftsData.days);
      }
      console.log(shiftTimes, breakTimes, 'hiwww');
      // setShiftInitialTime(shiftsData[1].time);
      setShiftInitialTime(shiftTimes);
      setShiftInitialBreakTime(breakTimes);
      setShiftDaysValues(shiftDays);
      console.log('shift', shiftDays);


      dispatch(startApp(shiftsData));
    }
  }, [dbChartParams]);

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
                  <CInputRadio checked={fileDownloadType === 'automatic' ? true : false} onClick={(e) => { setFileDownloadType('automatic'); }} custom id="inline-radio1" name="fileDownloadCheck" value="automatic" />
                  <CLabel variant="custom-checkbox" htmlFor="inline-radio1">Automatic</CLabel>
                </CFormGroup>
                <CFormGroup variant="custom-radio" inline>
                  <CInputRadio checked={fileDownloadType === 'manual' ? true : false} onClick={(e) => { setFileDownloadType('manual'); }} custom id="inline-radio2" name="fileDownloadCheck" value="manual" />
                  <CLabel variant="custom-checkbox" htmlFor="inline-radio2">Manual</CLabel>
                </CFormGroup>
              </CCol>
            </CFormGroup>
            <CFormGroup row>
              <CCol xs="3">
                <CLabel htmlFor="autoFile"></CLabel>
              </CCol>

              {fileDownloadType === 'automatic' ? <CCol md="3"><CInput value={downloadTime} onChange={(e) => { getTime(e.target.value) }} type="time" id="autoDownloadTime" name="autoDownloadTime" min="09:00" max="18:00"></CInput></CCol>
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
                        <CInput type="number" id="blackMinColor" name="blackMinColor" min={0} max={13} step={1} value={parseInt(blackMinColor)}
                          onChange={(e) => {
                            setBlackMinColor(Math.max(0, parseInt(e.target.value)).toString().slice(0, 2));
                          }}
                        />
                        {/* <CLabel htmlFor="exampleInputName2" className="pr-1" style={{ marginLeft: '20px', marginRight: '20px' }}>a</CLabel> */}
                        {/* <CInput type="number" id="blackMaxColor" name="blackMaxColor" min={0} max={13} step={1} value={blackMaxColor}
                          onChange={(e) => {
                            setBlackMaxColor(Math.max(0, parseInt(e.target.value)).toString().slice(0, 2));
                          }}
                        />
                        <CLabel htmlFor="exampleInputName2" className="pr-1" style={{ paddingLeft: '5px' }}>{`   pitch`}</CLabel> */}

                      </CFormGroup>
                    </CForm>
                  </CCol>
                </CRow>
              </CCol>
            </CFormGroup>
          </CCol>
          <CCol xs="6" sm="6" md="6" lg="6">
            {/* {uniqueAssemblyLines.map(assemblyLine => { */}
            {/* return ( */}
            <CCol xs="12">
              <h3 style={{ textDecoration: 'underline' }}>PERS044</h3>
              <br></br>
              {shiftCount.map(k =>
                <ShiftTime
                  // assemblyLine={assemblyLine}
                  totalShifts={shiftCount}
                  shiftCount={k}
                  setShiftCount={setShiftCount}
                  shiftInitialTime={shiftInitialTime[k - 1]}
                  shiftDaysValues={shiftDaysValues[k - 1]}
                  shiftInitialBreakTime={shiftInitialBreakTime[k - 1]}
                // shiftsData={chartParamsData.values.PERS044}
                />
              )}
            </CCol>
            {/* )
            })} */}
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

export default Params;