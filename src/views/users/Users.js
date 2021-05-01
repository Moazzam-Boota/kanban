import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { intial_excel_sheet, get_chart_data } from "../../redux/actions/actions";
import CWidgetBrand from './CWidgetBrand';
import {
  CWidgetSimple,
  CFormGroup,
  CCol,
  CRow,
} from '@coreui/react'
import './index.css';
import socketIOClient from "socket.io-client";
const ENDPOINT = "http://127.0.0.1:4001";
const lodash = require('lodash');

const Users = () => {
  const dispatch = useDispatch()
  // const [socketResponse, setSocketResponse] = useState("");
  const [donePieces, setDonePieces] = useState(100);

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
    console.log('use effect - green');
    socket.on('lightgreen', function (data) { //get button status from client
      // var count = 0;
      // document.getElementById("lightgreen").checked = data; //change checkbox according to push button on Raspberry Pi
      socket.emit("lightgreen", data); //send push button status to back to server
      console.log('data for frontend - green', data);
      // setSocketResponse(true);
      var peices = 1 + donePieces;
      console.log(peices, data)
      setDonePieces(data);

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

  const queryPage = useLocation().search.match(/page=([0-9]+)/, '')
  const currentPage = Number(queryPage && queryPage[1] ? queryPage[1] : 1)
  const [page, setPage] = useState(currentPage)
  const successforgotmsg = useSelector((state) => state.excelReducer.apiCalled);
  const data = useSelector((state) => state.excelReducer.chartData);
  const parentsData = [];
  console.log(successforgotmsg, "Moazzam")

  // if (chartData) {
  //   console.log(chartData)
  // }
  if (successforgotmsg) {
    console.log(successforgotmsg);
    successforgotmsg.map(row => {
      // [].map(row => {
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
    dispatch(intial_excel_sheet());
    dispatch(get_chart_data());

    currentPage !== page && setPage(currentPage)
  }, [currentPage, page])

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

  const dataGroupByShift = lodash.chain(parentsData)
    // Group the elements of Array based on `color` property
    .groupBy("shift_PPSHFT_IS")
    // `key` is group's name (color), `value` is the array of objects
    .map((value, key) => ({ shiftNumber: key, data: value }))
    .value();

  const quantityPerBox = 3;   // .per_box_qty_UNITCAIXA_IT

  const dataGroupByProduct = lodash.chain(parentsData)
    // Group the elements of Array based on `color` property
    .groupBy("part_num_VHPRNO_C")
    // `key` is group's name (color), `value` is the array of objects
    .map((value, key) => ({
      product: key,
      data: value,
      color: getRandomColor(),
      sum: lodash.sumBy(value, 'quantity_VHOROQ_AH'),
      productsPerBox: lodash.sumBy(value, 'quantity_VHOROQ_AH') / quantityPerBox
    }))
    .value();
  console.log(dataGroupByOrder, 'newData', dataGroupByShift, 'product', dataGroupByProduct);
  // console.log(dataGroupByOrder, 'newData', parentsData.slice(0).reverse())

  const dailyHours = 8; //hours, sum of all shifts (1, 2, 3) - sum of breaks (15min, 20min)
  const pitchPeriod = 30; //minutes
  const totalQuantity = lodash.sumBy(parentsData, 'quantity_VHOROQ_AH'); //sum of all quantities
  const quantityPerHour = dailyHours / totalQuantity;   // quanitity per hour
  const quantityPerMinute = quantityPerHour * 60;   // quanitity per minute
  // const quantityPerSecond = quantityPerMinute * 60;   // quanitity per second

  const quantityPerBoxPerMinute = quantityPerBox * quantityPerMinute;  // per box time
  // const quantityPerBoxPerSecond = quantityPerBox * quantityPerSecond;  // per box time

  const boxesPerPitch = pitchPeriod / quantityPerBoxPerMinute;  //13.875 -> 13, 13, 13, 13, 14, when decimal equals 1, add to next one
  console.log(boxesPerPitch, 'boxesPerPitch', quantityPerBoxPerMinute)
  // console.log(totalQuantity, 'totalQuantity')
  // TODO:: sum of all orders, quantity
  // TODO:: sum of all orders, quantity
  // 
  // const donePieces = 100; //receive from clicking the button double click
  const skipBoxes = 3;
  const kanbanBoxes = (dailyHours * 60) / pitchPeriod;
  console.log(kanbanBoxes, 'kanbanBoxes');

  const cardsData = [];
  for (var i = kanbanBoxes - skipBoxes; i >= 1; i--) {
    console.log(i, 'data')
    var color = '';

    if (i <= 2) color = 'blue';
    else if (i > 2 && i <= 5) color = 'green';
    else if (i > 5 && i <= 8) color = 'orange';
    else if (i > 8 && i <= 11) color = 'red';
    else if (i > 11) color = 'black';

    const dataGroupRandom = dataGroupByProduct.slice(0, Math.floor(Math.random() * dataGroupByProduct.length) + 1);

    // dataGroupByProduct
    cardsData.push(<CWidgetBrand
      style={{ marginLeft: '5px', width: '150px' }}
      color={color}
      shift={Math.round(boxesPerPitch)}
      cardName={dataGroupRandom.map((product, index) => {
        console.log(product, i, dataGroupByProduct.length - 1, index, 'product')
        return (
          <span className="content-center" style={{
            backgroundColor: product.color,
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
            {Math.floor(product.productsPerBox / boxesPerPitch)}</span>
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
          <CWidgetSimple header="Total Pieces" text={totalQuantity} />
        </CCol>
        <CCol xs="2">
          <CWidgetSimple header="Done Pieces" text={donePieces} />
        </CCol>
        <CCol xs="2">
          <CWidgetSimple header="Pending Pieces" text={totalQuantity - donePieces} />
        </CCol>
        <CCol xs="2">
          <CWidgetSimple header="Pieces/Hour (On Time)" text={(totalQuantity - donePieces) / dailyHours} />
        </CCol>
        <CCol xs="2">
          <CWidgetSimple header="Pieces/Hour (Day)" text={totalQuantity / dailyHours} />
        </CCol>
        <CCol xs="2">
          <CWidgetSimple header="Pieces/Hour (Target)" text={totalQuantity / kanbanBoxes} />
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