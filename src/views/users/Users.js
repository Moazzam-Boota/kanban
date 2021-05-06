import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { intialExcelSheet, getChartData } from "../../redux/actions/actions";
import CWidgetBrand from './CWidgetBrand';
import {
  CFormGroup,
  CCol,
  CRow,
} from '@coreui/react'
import CWidgetSimple from './CWidgetSimple';
import './index.css';
import socketIOClient from "socket.io-client";
import Swal from 'sweetalert2/dist/sweetalert2.js';
import 'sweetalert2/src/sweetalert2.scss';

const ENDPOINT = "http://127.0.0.1:4001";
const lodash = require('lodash');
const moment = require('moment');

const Users = () => {
  const dispatch = useDispatch()
  // const [socketResponse, setSocketResponse] = useState("");
  const [donePieces, setDonePieces] = useState(100);
  var headerWidgetColor = '';

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
      // var count = 0;
      // document.getElementById("lightgreen").checked = data; //change checkbox according to push button on Raspberry Pi
      socket.emit("lightgreen", data); //send push button status to back to server
      // setSocketResponse(true);
      // var peices = 1 + donePieces;
      setDonePieces(data);
      Swal.fire(
        'Updated',
        'Box is updated!',
        'success'
      )
    });
    socket.on('lightred', function (data) { //get button status from client
      // document.getElementById("lightred").checked = data; //change checkbox according to push button on Raspberry Pi
      // socket.emit("lightred", data); //send push button status to back to server
      Swal.fire(
        'Error',
        'Some Error Occured!',
        'error'
      )
    });

    // socket.on("FromAPI", data => {
    //   setSocketResponse(data);
    //   socket.emit("lightred", Number(Math.random() < 0.5));
    //   socket.emit("lightgreen", Number(Math.random() < 0.5));
    // });
  }, []);

  const queryPage = useLocation().search.match(/page=([0-9]+)/, '')
  const currentPage = Number(queryPage && queryPage[1] ? queryPage[1] : 1)
  const [page, setPage] = useState(currentPage)
  const successforgotmsg = useSelector((state) => state.excelReducer.apiCalled);
  const dbChartParams = useSelector((state) => state.excelReducer.chartParams);
  const chartParams = lodash.get(lodash.last(dbChartParams), 'values');
  const parentsData = [];
  const colorChartParams = lodash.get(chartParams, 'colors', {});
  const lineChartParams = lodash.get(chartParams, 'PERS044', {});
  if (successforgotmsg) {
    console.log(successforgotmsg);
    successforgotmsg.map(row => {
      row.values.map(values => {
        parentsData.push(values);
      });
    });
  }

  function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  useEffect(() => {
    dispatch(intialExcelSheet());
    dispatch(getChartData());

    currentPage !== page && setPage(currentPage)
  }, [dispatch, currentPage, page])

  const dataGroupByLine = lodash.chain(parentsData)
    // Group the elements of Array based on `color` property
    .groupBy("line_VOPLGR_EF")
    // `key` is group's name (color), `value` is the array of objects
    .map((value, key) => ({ lineNumber: key, data: value }))
    .value();

  const dataGroupByOrder = lodash.chain(parentsData)
    // Group the elements of Array based on `color` property
    .groupBy("order_num_VHMFNO_D")
    // `key` is group's name (color), `value` is the array of objects
    .map((value, key) => ({ orderNumber: key, data: value }))
    .value();

  // const dataGroupByShift = lodash.chain(parentsData)
  // .groupBy("shift_PPSHFT_IS")
  // .map((value, key) => ({ shiftNumber: key, data: value }))
  // .value();
  const quantityPerBox = 3;   // .per_box_qty_UNITCAIXA_IT

  const dataGroupByProduct = lodash.orderBy(lodash.chain(parentsData)
    // Group the elements of Array based on `color` property
    .groupBy("part_num_VHPRNO_C")
    // `key` is group's name (color), `value` is the array of objects
    .map((value, key) => ({
      product: key,
      data: value,
      color: getRandomColor(),
      sum: lodash.sumBy(value, 'quantity_VHOROQ_AH'),
      productsPerBox: lodash.sumBy(value, 'quantity_VHOROQ_AH') / quantityPerBox
    })).value(), ['sum'], ['desc']).filter(k => k.sum !== null);

  const dailyHours = 8; //hours, sum of all shifts (1, 2, 3) - sum of breaks (15min, 20min)
  const pitchPeriod = lodash.get(chartParams, 'pitchTime', 0); //minutes
  const totalQuantity = lodash.sumBy(parentsData, 'quantity_VHOROQ_AH'); //sum of all quantities
  const quantityPerHour = dailyHours / totalQuantity;   // quanitity per hour
  const quantityPerMinute = quantityPerHour * 60;   // quanitity per minute
  // const quantityPerSecond = quantityPerMinute * 60;   // quanitity per second

  const quantityPerBoxPerMinute = quantityPerBox * quantityPerMinute;  // per box time
  // const quantityPerBoxPerSecond = quantityPerBox * quantityPerSecond;  // per box time

  const boxesPerPitch = pitchPeriod / quantityPerBoxPerMinute;  //13.875 -> 13, 13, 13, 13, 14, when decimal equals 1, add to next one
  // TODO:: sum of all orders, quantity
  // TODO:: sum of all orders, quantity
  // 
  // const donePieces = 100; //receive from clicking the button double click
  // const skipBoxes = 3;
  const kanbanBoxes = (dailyHours * 60) / pitchPeriod;
  const blueColorChartParams = lodash.get(colorChartParams, 'blue', {});
  const greenColorChartParams = lodash.get(colorChartParams, 'green', {});
  const orangeColorChartParams = lodash.get(colorChartParams, 'orange', {});
  const redColorChartParams = lodash.get(colorChartParams, 'red', {});
  const blackColorChartParams = lodash.get(colorChartParams, 'black', {});

  const timeRange = lodash.get(lineChartParams, '[1].time', []);

  var format = 'HH:mm'
  // check if currentTime is between the pitchPeriod, add cards to that pitch
  // timeRange[0] add pitchPeriod, check if current time is between, old and new+shift time, show boxes
  // var time = moment() gives you current time. no format required.

  console.log(dataGroupByProduct, 'dataGroupByProduct')
  var time = moment('10:40', format);
  var startShiftTime = moment(timeRange[1], format);
  const cardsData = [];
  var activeShiftPeriod = 0;
  // for (var i = kanbanBoxes - skipBoxes; i >= 1; i--) {
  for (var i = blackColorChartParams.max; i >= 1; i--) {
    var color = '';

    var beforeTime = moment(startShiftTime.format('HH:mm'), format);
    var afterTime = moment(startShiftTime.subtract(pitchPeriod, 'minutes').format('HH:mm'), format);

    if (i <= parseInt(blueColorChartParams.min)) { color = 'blue'; }
    else if (i >= parseInt(greenColorChartParams.min) && i <= parseInt(greenColorChartParams.max)) { color = 'green'; }
    else if (i >= parseInt(orangeColorChartParams.min) && i <= parseInt(orangeColorChartParams.max)) { color = 'orange'; }
    else if (i >= parseInt(redColorChartParams.min) && i <= parseInt(redColorChartParams.max)) { color = 'red'; }
    else if (i >= parseInt(blackColorChartParams.min) && i <= parseInt(blackColorChartParams.max)) { color = 'black'; }

    // startShiftTime = startShiftTime.add(pitchPeriod, 'minutes').format('hh:mm');
    // console.log(time, afterTime, beforeTime, 'timeRange')
    if (time.isBetween(afterTime, beforeTime)) {
      activeShiftPeriod = i;
      headerWidgetColor = color;
      // console.log(i, activeShiftPeriod, time, beforeTime, afterTime, 'here is')
    }

    console.log(beforeTime, afterTime, 'startShiftTime')

    var dataGroupByProductRandom = [];
    if (i <= activeShiftPeriod) {
      console.log(dataGroupByProduct, 'dataGroupByProduct')
      dataGroupByProductRandom = dataGroupByProduct.map((product, index) => {

        // const singleProduct = Math.floor(product.sum / quantityPerBox); //quantityPerBox
        const singleProduct = Math.round(product.sum / quantityPerBox / boxesPerPitch);
        // check if sum 0, skip product
        // if sum of all products in a shift >=boxesPerPitch, skip
        // 
        dataGroupByProduct.filter(k => k.product === product.product)[0].sum = product.sum - singleProduct;
        console.log(product, boxesPerPitch, product.sum / quantityPerBox, singleProduct, 'singleProduct')
        return {
          record: product, singleProduct
        };
      });
    }
    console.log(dataGroupByProductRandom, 'dataGroupByProductRandom')

    // dataGroupByProduct
    cardsData.push(<CWidgetBrand
      style={{ marginLeft: '5px', width: '150px' }}
      color={color}
      shift={dataGroupByProductRandom.length != 0 ? Math.round(boxesPerPitch) : 0}
      cardName={dataGroupByProductRandom.map((product, index) => {
        return (
          <span className="content-center" style={{
            backgroundColor: product.record.color,
            padding: '5px',
            // marginLeft: '5px',
            // width: '10px',
            textAlign: 'center',
            textWeight: 'bold',
            fontSize: '24px',
            color: 'white',
            // display: 'flex',
            // flexDirection: 'column',
            display: 'inline-block',
            width: '40px',
            // fontSize: '30px',
            margin: '5px',
            border: (i === 1 && dataGroupByProduct.length - 1 === index) ? '5px solid black' : 'inherit'
          }}>
            {/* <span style={{
              padding: '5px'
            }}> */}
            {product.singleProduct}</span>
          // </span>
        )
      })
      }
      leftHeader="459"
      leftFooter="feeds"
    >
    </CWidgetBrand >);
  }

  const kanbanBoxWidgetStyle = { fontSize: '14px' };
  const metricStyle = { fontWeight: 'bold' };
  return (
    <CFormGroup>
      <CRow>
        <CCol xs="2">
          <CWidgetSimple style={{ backgroundColor: headerWidgetColor, color: 'white' }} header="Total Pieces" text={totalQuantity} />
        </CCol>
        <CCol xs="2">
          <CWidgetSimple style={{ backgroundColor: headerWidgetColor, color: 'white' }} header="Done Pieces" text={donePieces} />
        </CCol>
        <CCol xs="2">
          <CWidgetSimple style={{ backgroundColor: headerWidgetColor, color: 'white' }} header="Pending Pieces" text={totalQuantity - donePieces} />
        </CCol>
        <CCol xs="2">
          <CWidgetSimple style={{ backgroundColor: headerWidgetColor, color: 'white' }} header="Pieces/Hour (On Time)" text={parseFloat((totalQuantity - donePieces) / dailyHours).toFixed(2)} />
        </CCol>
        <CCol xs="2">
          <CWidgetSimple style={{ backgroundColor: headerWidgetColor, color: 'white' }} header="Pieces/Hour (Day)" text={parseFloat(totalQuantity / dailyHours).toFixed(2)} />
        </CCol>
        <CCol xs="2">
          <CWidgetSimple style={{ backgroundColor: headerWidgetColor, color: 'white' }} header="Pieces/Hour (Target)" text={parseFloat(totalQuantity / kanbanBoxes).toFixed(2)} />
        </CCol>
      </CRow>
      <h1>{lodash.get(dataGroupByLine, '[0].lineNumber')}</h1>
      <hr style={{ borderTop: '3px solid rgba(0, 0, 21, 0.2)' }}></hr>
      <CRow>
        {/* <CCol xl={12}> */}
        {cardsData}
        {/* </CCol> */}
      </CRow>
      <CRow>
        <CCol xs={{ offset: 9, size: 3 }} >
          <CWidgetSimple className='widgetBackground' header="Kanban en curs" text={
            <div style={{ textAlign: 'left' }}>
              <p style={kanbanBoxWidgetStyle}>Ordre de fabricació: <span style={metricStyle}>{lodash.get(dataGroupByOrder, '[0].orderNumber')}</span> </p>
              <p style={kanbanBoxWidgetStyle}>Referencia de producte: <span style={metricStyle}>{lodash.get(dataGroupByProduct, '[0].product')}</span> </p>
              <p style={kanbanBoxWidgetStyle}>Descripció de producte: <span style={metricStyle}>{lodash.get(dataGroupByProduct, '[0].data[0].description_VHTXT1_W')}</span> </p>
              <p style={kanbanBoxWidgetStyle}>Quantitat a produir total: <span style={metricStyle}>{lodash.get(dataGroupByProduct, '[0].sum')}</span> </p>
              <p style={kanbanBoxWidgetStyle}>Quantitat que falten per produit: <span style={metricStyle}>{lodash.get(dataGroupByProduct, '[0].sum') - 3}</span> </p>
              <p style={kanbanBoxWidgetStyle}>Quantitat per caixa: <span style={metricStyle}>{lodash.get(dataGroupByProduct, '[0].productsPerBox')}</span> </p>
            </div>
          } />
        </CCol>
      </CRow>
    </CFormGroup>
  )
}

export default Users;