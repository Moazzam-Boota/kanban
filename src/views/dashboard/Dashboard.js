import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { excel_sheet, intial_excel_sheet, pitch_Time, file_Download_Type, downlaod_Time } from "../../redux/actions/actions";
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

import socketIOClient from "socket.io-client";
const ENDPOINT = "http://127.0.0.1:4001";


const data = {
  PERS044: {  // assembly Line
    shift_1: {
      week_days: ['Wed', 'Fri'],
      time: {
        start: '08:00',
        end: '14:00',
      },
      break_1: {
        start: '08:00',
        end: '08:15',
      },
      break_2: {
        start: '10:00',
        end: '10:15',
      },
    },
    shift_2: {
      week_days: ['Mon', 'Thur'],
      time: {
        start: '14:00',
        end: '22:00',
      },
      break_1: {
        start: '14:00',
        end: '14:15',
      },
      break_2: {
        start: '16:00',
        end: '16:15',
      },
    },
  }
};

const Dashboard = () => {
  var [shiftCount, setShiftCount] = useState([1]);
  var [pitchTime, setPitchTime] = useState(15);
  var [fileDownloadType, setFileDownloadType] = useState('');
  var [downloadTime, setDownloadTime] = useState([]);
  const [socketResponse, setSocketResponse] = useState("");

  useEffect(() => {
    const socket = socketIOClient(ENDPOINT);
    // var socket = io(); //load socket.io-client and connect to the host that serves the page
    // window.addEventListener("load", function () { //when page loads
    // var lightboxgreen = document.getElementById("lightgreen");
    // lightboxgreen.addEventListener("change", function () { //add event listener for when checkbox changes
    //   socket.emit("lightgreen", Number(this.checked)); //send button status to server (as 1 or 0)
    // });
    // var lightboxred = document.getElementById("lightred");
    // lightboxred.addEventListener("change", function () { //add event listener for when checkbox changes
    //   socket.emit("lightred", Number(this.checked)); //send button status to server (as 1 or 0)
    // });
    // });
    socket.on('lightgreen', function (data) { //get button status from client
      // document.getElementById("lightgreen").checked = data; //change checkbox according to push button on Raspberry Pi
      // socket.emit("lightgreen", data); //send push button status to back to server
      console.log('data for frontend - green');
    });
    socket.on('lightred', function (data) { //get button status from client
      // document.getElementById("lightred").checked = data; //change checkbox according to push button on Raspberry Pi
      // socket.emit("lightred", data); //send push button status to back to server
      console.log('data for frontend - red');
    });

    // socket.on("FromAPI", data => {
    //   setSocketResponse(data);
    //   socket.emit("lightred", Number(Math.random() < 0.5));
    //   socket.emit("lightgreen", Number(Math.random() < 0.5));
    // });
  }, []);
  // handle shifts number here
  const dispatch = useDispatch()
  const response = useSelector((state) => state.excelReducer.apiCalled);
  const parentsData = [];
  const success = useSelector((state) => state.excelReducer.response);
  console.log(shiftCount);
  // console.log(response)
  // console.log(shiftCount);
  const fileType = useSelector((state) => state.fileDownloadTypeReducer);

  if (success) {
    toast.success("File Uploaded Successfully");

  }
  const [selectedFile, setSelectedFile] = useState();

  const changeHandler = (event) => {
    setSelectedFile(event.target.files[0]);
    // setIsSelected(true);
  };

  console.log(pitchTime, " PitchTime");
  console.log("File Download Type is ", fileDownloadType);
  console.log("Total Shifts are ", shiftCount);

  const saveParametersData = () => {
    dispatch(pitch_Time(pitchTime));
    dispatch(file_Download_Type(fileDownloadType));
    // get data from redux
  }
  const getTime = (value) => {
    // console.log(value);
    setDownloadTime(value);
  }
  console.log("Autmatic downlaod time", downloadTime);
  dispatch(downlaod_Time(downloadTime));

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
          <p>
            It's {socketResponse}
          </p>
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

              {fileDownloadType === 'automatic' ? <CCol md="3"><CInput onChange={(e) => { getTime(e.target.value) }} type="time" id="autoDownloadTime" name="autoDownloadTime" min="09:00" max="18:00"></CInput></CCol>
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
                <CLabel htmlFor="city">Colors :</CLabel>
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