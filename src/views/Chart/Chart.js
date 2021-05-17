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
import socketIOClient from "socket.io-client";
import Swal from 'sweetalert2/dist/sweetalert2.js';
import 'sweetalert2/src/sweetalert2.scss';

const ENDPOINT = "http://127.0.0.1:4001";
const lodash = require('lodash');
const moment = require('moment');

const colorsPalette = ['#F26430', '#009B72', '#F6E27F', '#E2C391', '#2A2D34', '#6761A8', '#009DDC'];


const Users = () => {
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
    // console.log(successforgotmsg);
    successforgotmsg.forEach(row => {
      row.values.forEach(values => {
        parentsData.push(values);
      });
    });
  }

  const quantityPerBox = 3;   // .per_box_qty_UNITCAIXA_IT
  const dailyHours = 8; //hours, sum of all shifts (1, 2, 3) - sum of breaks (15min, 20min)
  const pitchTime = lodash.get(chartParams, 'pitchTime', 0); //minutes
  const totalQuantity = lodash.sumBy(parentsData, 'quantity_VHOROQ_AH'); //sum of all quantities
  var totalQuantityDynamic = lodash.sumBy(parentsData, 'quantity_VHOROQ_AH'); //sum of all quantities
  const quantityPerHour = dailyHours / totalQuantity;   // quanitity per hour
  const quantityPerMinute = quantityPerHour * 60;   // quanitity per minute
  // const quantityPerSecond = quantityPerMinute * 60;   // quanitity per second

  const quantityPerBoxPerMinute = quantityPerBox * quantityPerMinute;  // per box time
  // const quantityPerBoxPerSecond = quantityPerBox * quantityPerSecond;  // per box time

  const boxesPerPitch = pitchTime / quantityPerBoxPerMinute;  //13.875 -> 13, 13, 13, 13, 14, when decimal equals 1, add to next one
  // TODO:: sum of all orders, quantity
  // TODO:: sum of all orders, quantity
  // 
  // const donePieces = 100; //receive from clicking the button double click
  // const skipBoxes = 3;
  const kanbanBoxes = (dailyHours * 60) / pitchTime;
  const blueColorChartParams = lodash.get(colorChartParams, 'blue', {});
  const greenColorChartParams = lodash.get(colorChartParams, 'green', {});
  const orangeColorChartParams = lodash.get(colorChartParams, 'orange', {});
  const redColorChartParams = lodash.get(colorChartParams, 'red', {});
  const blackColorChartParams = lodash.get(colorChartParams, 'black', {});

  const timeRange = lodash.get(lineChartParams, '[1].time', []);

  const dispatch = useDispatch()
  // const [socketResponse, setSocketResponse] = useState("");
  const [donePieces, setDonePieces] = useState(0);
  const [localDonePieces, setLocalDonePieces] = useState(0);
  const [trackShiftsDone, setTrackShiftsDone] = useState(0);
  const [dataGroupByProduct, setDataGroupByProduct] = useState([]);
  var headerWidgetColor = '';

  var format = 'HH:mm'
  // const [currentTime, setTimeLeft] = useState(moment('18:40', format));
  const [currentTime, setTimeLeft] = useState(moment());

  // console.log(currentTime, 'time-current')

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(moment());
      // setTrackShiftsDone(trackShiftsDone - 1);
      cardsData = [];
      renderCards();
      // }, pitchTime * 60 * 1000);
    }, 1 * 60 * 1000);
    // }, 1000);
    // Clear timeout if the component is unmounted
    return () => clearTimeout(timer);
  });


  var startShiftTime = moment(timeRange[1], format);
  var initialShiftTime = moment(timeRange[0], format);


  var duration = moment.duration(startShiftTime.diff(initialShiftTime));
  // console.log(timeRange, 'timeRange', duration.asMinutes(), duration.asMinutes() / pitchTime, pitchTime)
  // duration subtract breaks

  var activeShiftPeriod = 0;
  const totalPitchesLength = duration.asMinutes() / pitchTime;


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

    // console.log(parentsData, 'parentsData', dataGroupByProduct)

    socket.on('lightgreen', function (data) { //get button status from client
      // document.getElementById("lightgreen").checked = data; //change checkbox according to push button on Raspberry Pi
      socket.emit("lightgreen", data); //send push button status to back to server
      // setSocketResponse(true);
      setDonePieces(data);

      Swal.fire(
        {
          position: 'top-end',
          icon: 'success',
          title: 'Card is updated!',
          showConfirmButton: false,
          timer: 1500
        }
      )
    });
    socket.on('lightred', function (data) { //get button status from client
      // document.getElementById("lightred").checked = data; //change checkbox according to push button on Raspberry Pi
      // socket.emit("lightred", data); //send push button status to back to server
      Swal.fire(
        {
          position: 'top-end',
          icon: 'error',
          title: 'Some Error Occured!',
          showConfirmButton: false,
          timer: 1500
        }
      )
    });

    // socket.on("FromAPI", data => {
    //   setSocketResponse(data);
    //   socket.emit("lightred", Number(Math.random() < 0.5));
    //   socket.emit("lightgreen", Number(Math.random() < 0.5));
    // });
  }, []);


  useEffect(() => {
    if (parentsData.length !== 0 && dataGroupByProduct.length == 0) {
      var counter = 0;
      const allShiftsData = [];


      const dataGroupColors = lodash.orderBy(lodash.chain(parentsData)
        // Group the elements of Array based on `color` property
        .groupBy("part_num_VHPRNO_C")
        // `key` is group's name (color), `value` is the array of objects
        .map((value, key) => {
          // console.log(value, 'product')
          const color = colorsPalette[counter];
          ++counter;
          return {
            product: key,
            data: value,
            color: color,
            sum: lodash.sumBy(value, 'quantity_VHOROQ_AH'),
          }
        }).value(), ['sum'], ['desc']).filter(k => k.sum !== null);
      // console.log(dataGroupColors, 'dataGroupColors')
      const dataGroup = lodash.orderBy(lodash.chain(parentsData)
        // Group the elements of Array based on `color` property
        .groupBy("order_num_VHMFNO_D")
        // `key` is group's name (color), `value` is the array of objects
        .map((value, key) => {
          // console.log(value, lodash.get(dataGroupColors.filter(q => q.product === value[0].part_num_VHPRNO_C), [0, 'color']), 'order')
          const color = lodash.get(dataGroupColors.filter(q => q.product === value[0].part_num_VHPRNO_C), [0, 'color']);
          // ++counter;

          return {
            product: key,
            totalProducts: value.length,
            // data: value.map(k => {
            //   const productColor = lodash.get(dataGroupColors.filter(q => q.product === k.part_num_VHPRNO_C), [0, 'color']);
            //   // console.log(k.part_num_VHPRNO_C, lodash.get(dataGroupColors.filter(q => q.product === k.part_num_VHPRNO_C), [0, 'color']), 'pp1')
            //   return { ...k, productColor: productColor };
            // }),
            data: value,
            color: color,
            // color: lodash.get(dataGroupColors.filter(q => q.product === value[0].part_num_VHPRNO_C), [0, 'color']),
            row_num: value[0].row_num,
            total: lodash.sumBy(value, 'quantity_VHOROQ_AH'),
            sum: lodash.sumBy(value, 'quantity_VHOROQ_AH'),
            productsPerBox: lodash.sumBy(value, 'quantity_VHOROQ_AH') / quantityPerBox
          }
        }).value(), ['row_num'], ['asc']).filter(k => k.sum !== null);

      // const dataGroupOriginal = lodash.orderBy(parentsData, ['row_num'], ['asc']).filter(k => k.quantity_VHOROQ_AH !== null);

      // console.log(dataGroup, 'dataGroup');

      const dataGroupLength = dataGroup.length;
      const productCount = Math.round(boxesPerPitch / dataGroupLength * 10) / 10;
      var roundOffSlice = 0;
      // for (var i = blackColorChartParams.max; i >= 1; i--) {
      // for (var i = totalPitchesLength; i >= 1; i--) {
      //   console.log(dataGroup, 'dataGroup2', i)

      // }
      var currentElement = 0;
      // for (var i = blackColorChartParams.max; i >= 1; i--) {
      for (var i = totalPitchesLength; i >= 1; i--) {


        // const currentElement = dataGroup.length - 1;

        // currentElement = dataGroup[currentElement].sum - Math.round(boxesPerPitch) >= 0 ? currentElement : currentElement + 1;
        if (dataGroup[currentElement].sum - Math.round(boxesPerPitch) <= 0) currentElement = currentElement + 1;
        // Difference of order from 0, 9 - 14 -> -5
        // foreach pitch, subtract the boxesPerPitch
        // if sum - boxesPerPitch !<= 0, then subtract, else move to next order
        // console.log(dataGroup, 'dataGroup2', i, currentElement, dataGroup[currentElement])



        roundOffSlice += Math.round(boxesPerPitch) - boxesPerPitch;

        if (roundOffSlice >= 1) {
          dataGroup[currentElement].sum = dataGroup[currentElement].sum + roundOffSlice;  //add roundoff value into the sum
          roundOffSlice = 0;
        }

        dataGroup[currentElement].sum = dataGroup[currentElement].sum - Math.round(boxesPerPitch);
        totalQuantityDynamic = totalQuantityDynamic - Math.round(boxesPerPitch);

        const recordSet = [];
        var multipleRoundOff = 0;
        // const numberOfProducts = dataGroup[currentElement].totalProducts; //number of Products in current order
        const numberOfProducts = 4; //number of Products in current order

        for (var j = 0; j < numberOfProducts; j++) {
          multipleRoundOff += Math.round(Math.round(boxesPerPitch) / numberOfProducts) - Math.round(boxesPerPitch) / numberOfProducts;
          // console.log(j, dataGroup[currentElement].data[j], 'dataGroupLoop')
          var productCountDynamic = Math.round(Math.round(boxesPerPitch) / numberOfProducts);
          // console.log(roundOffSlice, multipleRoundOff, 'roundOffSlice', Math.round(boxesPerPitch) / numberOfProducts)
          const singleProductColor = lodash.get(dataGroupColors.filter(q => q.product === lodash.get(dataGroup[currentElement].data[j], 'part_num_VHPRNO_C')), [0, 'color']);

          console.log(multipleRoundOff >= 1, productCountDynamic, productCountDynamic, 'singleProductColor')
          recordSet.push({
            ...dataGroup[currentElement],
            color: singleProductColor ? singleProductColor : colorsPalette[j + 1],
            record: dataGroup[currentElement].data[j], //check sum, dataGroup[currentElement].data[j]
            productCount: multipleRoundOff >= 1 ? productCountDynamic - multipleRoundOff : productCountDynamic, //for changing dynamic, on button push
            originalCount: multipleRoundOff >= 1 ? productCountDynamic - multipleRoundOff : productCountDynamic //comparing with originalCount
          });

          if (multipleRoundOff >= 1) multipleRoundOff = 0;

        }

        // console.log(dataGroup, recordSet, 'dataGroup', totalQuantityDynamic, roundOffSlice, dataGroup.filter(k => k.product === dataGroup[currentElement].product)[0].sum, boxesPerPitch)

        allShiftsData.push(recordSet)
      }

      // console.log(allShiftsData, 'allShiftsData')
      setDataGroupByProduct(allShiftsData);
    }
  }, [parentsData]);

  useEffect(() => {
    // console.log(donePieces, 'donePieces')
    const limitShift = 14;
    const remainderDonePieces = donePieces % limitShift === 0 ? 14 : donePieces % limitShift;
    const allShiftsData = [...dataGroupByProduct];
    var allShiftsDataLength = lodash.get(allShiftsData, '[0].length', 0);
    var currentShiftOriginalCount = lodash.get(allShiftsData, [[0], [allShiftsDataLength - 1], 'originalCount'], 0);
    var allShiftsDataRemainder = currentShiftOriginalCount + localDonePieces;



    // console.log('updatedShiftData', limitShift - remainderDonePieces, limitShift - allShiftsDataRemainder, remainderDonePieces)
    if (allShiftsData[0] && limitShift - remainderDonePieces > limitShift - allShiftsDataRemainder) {
      allShiftsData[0][allShiftsData[0].length - 1].productCount = allShiftsData[0][allShiftsData[0].length - 1].productCount - 1;
    } else if (allShiftsData[0] && limitShift - remainderDonePieces <= limitShift - allShiftsDataRemainder) {
      setLocalDonePieces(allShiftsDataRemainder);
      if (remainderDonePieces === 14) {
        setLocalDonePieces(0);
        setTrackShiftsDone(trackShiftsDone + 1);
      }

      if (allShiftsData[0].length > 1) {
        allShiftsData[0].pop();
      }
      else {
        allShiftsData.splice(0, 1);
      }
    }
    // console.log('updatedShiftData', allShiftsData)

    setDataGroupByProduct(allShiftsData)
  }, [donePieces]);

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


  // check if currentTime is between the pitchTime, add cards to that pitch
  // timeRange[0] add pitchTime, check if current time is between, old and new+shift time, show boxes
  // var time = moment() gives you current time. no format required.

  // console.log(totalPitchesLength, 'totalPitchesLength', dataGroupByProduct)
  // for (var i = kanbanBoxes - skipBoxes; i >= 1; i--) {
  var currentCardBox = {};
  var cardsData = [];
  function renderCards() {
    for (var i = totalPitchesLength; i >= 1; i--) {
      var color = '';

      var beforeTime = moment(startShiftTime.format('HH:mm'), format);
      var afterTime = moment(startShiftTime.subtract(pitchTime, 'minutes').format('HH:mm'), format);
      const currentPointer = i - trackShiftsDone;
      if (currentPointer <= parseInt(blueColorChartParams.min)) { color = 'blue'; }
      else if (currentPointer >= parseInt(greenColorChartParams.min) && currentPointer <= parseInt(greenColorChartParams.max)) { color = 'green'; }
      else if (currentPointer >= parseInt(orangeColorChartParams.min) && currentPointer <= parseInt(orangeColorChartParams.max)) { color = 'orange'; }
      else if (currentPointer >= parseInt(redColorChartParams.min) && currentPointer <= parseInt(redColorChartParams.max)) { color = 'red'; }
      else if (currentPointer >= parseInt(blackColorChartParams.min) && currentPointer <= parseInt(blackColorChartParams.max)) { color = 'black'; }

      // console.log(currentTime, afterTime, beforeTime, 'hello')
      if (currentTime.isBetween(afterTime, beforeTime)) {
        // also check for length of allShiftsData
        activeShiftPeriod = currentPointer;
        headerWidgetColor = color;
        console.log(i - trackShiftsDone, 'here is')
      }
      var dataGroupByProductRandom = lodash.get(dataGroupByProduct, i - 1, []);

      // console.log(dataGroupByProductRandom, 'dataGroupByProductRandom');
      // console.log(dataGroupByProductRandom.map(k => k.productCount).reduce((a, b) => a + b, 0), 'dataGroupByProductRandom', i - 1, activeShiftPeriod)

      cardsData.push(<CWidgetBrand
        style={{ marginLeft: '5px', width: '150px' }}
        color={color}
        shift={i <= activeShiftPeriod ? dataGroupByProductRandom.map(k => k.productCount).reduce((a, b) => a + b, 0) : undefined}
        cardName={i <= activeShiftPeriod ? lodash.get(dataGroupByProduct, i - 1, []).map((product, index) => {
          currentCardBox = (i === 1 && dataGroupByProductRandom.length - 1 === index) ? product : {};
          console.log(product.productCount, 'singleProduct')
          return (
            <span className="content-center" style={{
              backgroundColor: product.color,
              padding: (i === 1 && dataGroupByProductRandom.length - 1 === index) ? '' : '5px',
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
              border: (i === 1 && dataGroupByProductRandom.length - 1 === index) ? '5px solid black' : 'inherit'
            }}>
              {/* <span style={{
              padding: '5px'
            }}> */}
              {product.productCount}</span>
            // </span>
          )
        }) : []
        }
        leftHeader="459"
        leftFooter="feeds"
      >
      </CWidgetBrand >);
    }
  }

  renderCards();
  cardsData.splice(0, totalPitchesLength - 12);
  // console.log(allShiftsData, currentCardBox, 'currentCardBox')
  // console.log(currentCardBox, 'currentCardBox', headerWidgetColor)
  const kanbanBoxWidgetStyle = { fontSize: '15px' };
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
          <CWidgetSimple style={{ backgroundColor: lodash.get(currentCardBox, 'color'), color: 'white' }} className='widgetBackground' header="Kanban en curs" text={
            <div style={{ textAlign: 'left' }}>
              <p style={kanbanBoxWidgetStyle}>Ordre de fabricació: <span style={metricStyle}>{lodash.get(currentCardBox, 'record.order_num_VHMFNO_D')}</span> </p>
              <p style={kanbanBoxWidgetStyle}>Referencia de producte: <span style={metricStyle}>{lodash.get(currentCardBox, 'record.part_num_VHPRNO_C')}</span> </p>
              <p style={kanbanBoxWidgetStyle}>Descripció de producte: <span style={metricStyle}>{lodash.get(currentCardBox, 'record.description_VHTXT1_W')}</span> </p>
              <p style={kanbanBoxWidgetStyle}>Quantitat a produir total: <span style={metricStyle}>{lodash.get(currentCardBox, 'total')}</span> </p>
              <p style={kanbanBoxWidgetStyle}>Quantitat que falten per produit: <span style={metricStyle}>{lodash.get(currentCardBox, 'total') - donePieces}</span> </p>
              <p style={kanbanBoxWidgetStyle}>Quantitat per caixa: <span style={metricStyle}>{parseFloat(lodash.get(currentCardBox, 'productsPerBox')).toFixed(2)}</span> </p>
            </div>
          } />
        </CCol>
      </CRow>
    </CFormGroup>
  )
}

export default Users;