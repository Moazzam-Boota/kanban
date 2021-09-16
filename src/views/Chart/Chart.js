import React, { useState, useEffect, useRef, useCallback } from 'react'
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

const colorsPalette = ['#F26430', '#009B72', '#F6E27F', '#E2C391', '#2A2D34', '#6761A8', '#009DDC', '#FAA916', '#96031A', '#710000', '#A63C06', '#7E7F9A', '#EB9486', '#C2B97F', '#88665D', '#20FC8F', '#99EDCC', '#FFA987', '#41D3BD', '#791E94'];


const Users = () => {
  const queryPage = useLocation().search.match(/page=([0-9]+)/, '')
  const currentPage = Number(queryPage && queryPage[1] ? queryPage[1] : 1)
  const [page, setPage] = useState(currentPage)
  const excelFileBackendResponse = useSelector((state) => state.excelReducer.apiCalled);
  const dbChartParams = useSelector((state) => state.excelReducer.chartParams);
  const chartParams = lodash.get(lodash.last(dbChartParams), 'values');
  const excelFileData = [];
  const colorChartParams = lodash.get(chartParams, 'colors', {});
  const lineChartParams = lodash.get(chartParams, 'PERS044', {});
  if (excelFileBackendResponse) {
    // console.log(excelFileBackendResponse, 'excelFileBackendResponse');
    excelFileBackendResponse.forEach(row => {
      row.values.forEach(values => {
        excelFileData.push(values);
      });
    });
  }

  const downloadAutoTime = lodash.get(chartParams, 'downloadTime');
  // console.log(lodash.get(excelFileData, '[0].per_box_qty_UNITCAIXA_IT'), 'excelFileData')
  var format = 'HH:mm';
  const pitchTime = lodash.get(chartParams, 'pitchTime', 0); //minutes
  // *************************** One Shift ***************************
  // 08:00 to 14:00
  const shiftTimeRange = lodash.get(lineChartParams, '[1].time', []);
  // const shiftDaysRange = lodash.get(lineChartParams, '[1].days', []);
  const shiftTimeBreaks = lodash.get(lineChartParams, '[1].breaks', []);
  // *************************** One Shift ***************************

  if (downloadAutoTime) {
    const autoDownloadTimeMoment = moment(downloadAutoTime, format).add(2, 'minutes');
    // console.log(downloadAutoTime, autoDownloadTimeMoment.hours(), autoDownloadTimeMoment.minutes(), 'downloadAutoTime');
    function refreshAt(hours, minutes, seconds) {
      var now = new Date();
      var then = new Date();

      if (now.getHours() > hours || (now.getHours() == hours && now.getMinutes() > minutes) || now.getHours() == hours && now.getMinutes() == minutes && now.getSeconds() >= seconds) {
        then.setDate(now.getDate() + 1);
      }
      then.setHours(hours);
      then.setMinutes(minutes);
      then.setSeconds(seconds);

      var timeout = (then.getTime() - now.getTime());
      setTimeout(function () { window.location.reload(true); }, timeout);
      // console.log('script refreshed')
    }

    refreshAt(autoDownloadTimeMoment.hours(), autoDownloadTimeMoment.minutes(), autoDownloadTimeMoment.seconds()); //Will refresh the page at 18:45pm
  }




  // 14:00 to 22:00
  // 23:00 to 17:00
  var sumOfBreaks = 0;
  for (const [key, value] of Object.entries(shiftTimeBreaks)) {
    if (value.time) {
      var breakStartTime = moment(value.time[0], format);
      var breakEndTime = moment(value.time[1], format);

      var breaksDuration = moment.duration(breakEndTime.diff(breakStartTime));
      sumOfBreaks += breaksDuration.asMinutes();
      // console.log(`${key}:`, key, value, 'hello', sumOfBreaks, breakStartTime, breakEndTime);
    }
  }

  var shiftStartTime = moment(shiftTimeRange[0], format);
  var shiftEndTime = moment(shiftTimeRange[1], format);

  // var shiftDuration = moment.duration(shiftEndTime.diff(shiftStartTime)).asMinutes() - sumOfBreaks;
  var shiftDuration = moment.duration(shiftEndTime.diff(shiftStartTime)).asMinutes();
  const totalPitchesLength = Math.round(shiftDuration / pitchTime);

  // const [quantityPerBox, setQuantityPerBox] = useState(1);
  // const quantityPerBox = 1;   // .per_box_qty_UNITCAIXA_IT
  // const quantityPerBox = lodash.get(excelFileData, '[0].per_box_qty_UNITCAIXA_IT');   // .per_box_qty_UNITCAIXA_IT
  // console.log(quantityPerBox, 'quantityPerBox');
  // const dailyHours = Math.round((shiftDuration - sumOfBreaks / 60) * 100) / 100; //hours, sum of all shifts (1, 2, 3) - sum of breaks (15min, 20min)
  const totalQuantity = lodash.sumBy(excelFileData, 'quantity_VHOROQ_AH'); //sum of all quantities

  const takTimeMinutes = (shiftDuration - sumOfBreaks) / totalQuantity;
  // console.log(takTimeMinutes, shiftDuration - sumOfBreaks, 'takTimeMinutes')
  // const takTimeSeconds = takTimeMinutes * 60;
  // const takTimeQuantity = Math.round((pitchTime * takTimeMinutes) * 100) / 100;
  const pitchTakTime = pitchTime / takTimeMinutes;
  var totalQuantityDynamic = lodash.sumBy(excelFileData, 'quantity_VHOROQ_AH'); //sum of all quantities
  // const quantityPerHour = dailyHours / totalQuantity;   // quanitity per hour
  // const quantityPerMinute = quantityPerHour * 60;   // quanitity per minute
  // const quantityPerBoxPerMinute = quantityPerBox * quantityPerMinute;  // per box time
  // const boxesPerPitch = pitchTime / quantityPerBoxPerMinute;  //13.875 -> 13, 13, 13, 13, 14, when decimal equals 1, add to next one

  const blueColorChartParams = lodash.get(colorChartParams, 'blue', {});
  const greenColorChartParams = lodash.get(colorChartParams, 'green', {});
  const orangeColorChartParams = lodash.get(colorChartParams, 'orange', {});
  const redColorChartParams = lodash.get(colorChartParams, 'red', {});
  const blackColorChartParams = lodash.get(colorChartParams, 'black', {});

  var maxColorPitch = 0;
  for (const [key, value] of Object.entries(colorChartParams)) {
    const minMaxNumber = Math.max(value.min, value.max);
    if (maxColorPitch < minMaxNumber) maxColorPitch = minMaxNumber;
  }

  const dispatch = useDispatch()
  // const [socketResponse, setSocketResponse] = useState("");
  const [donePieces, setDonePieces] = useState(0);
  const [localDonePieces, setLocalDonePieces] = useState(0);
  const [trackShiftsDone, setTrackShiftsDone] = useState(0);
  const [piecesPerHourOnTimeMoment, setPiecesPerHourOnTimeMoment] = useState(moment(moment(), format));
  const [piecesPerHourOnTime, setPiecesPerHourOnTime] = useState(0);
  const [piecesPerHourOnDay, setPiecesPerHourOnDay] = useState(0);
  const [pendingPiecesPerProduct, setPendingPiecesPerProduct] = useState(0);
  const [dataGroupByProduct, setDataGroupByProduct] = useState([]);
  var headerWidgetColor = '';

  const [currentTime, setTimeLeft] = useState(moment());

  // if (currentTime.isBetween(pitchRefreshIntervalStartPitchTime, pitchRefreshIntervalEndPitchTime)) {
  var pitchRefreshIntervalStartPitchTime = moment(shiftStartTime.format('HH:mm'), format);
  var pitchRefreshIntervalEndPitchTime = moment(shiftEndTime.format('HH:mm'), format);
  const pitchRefreshInterval = (currentTime.isBetween(pitchRefreshIntervalStartPitchTime, pitchRefreshIntervalEndPitchTime)) ? pitchTime : 0.5;
  // if ((currentTime.isBetween(pitchRefreshIntervalStartPitchTime, pitchRefreshIntervalEndPitchTime))) setPiecesPerHourOnDay(0);
  // console.log(pitchRefreshInterval, 'pitchTime');
  const MINUTE_MS = parseInt(pitchRefreshInterval) * 60 * 1000; // need to decide about 1st refresh and

  useEffect(() => {
    if (pitchTime !== 0 && !inBetweenBreaks) {
      const interval = setInterval(() => {
        setTimeLeft(moment());
        renderCards();
      }, MINUTE_MS);

      return () => clearInterval(interval); // This represents the unmount function, in which you need to clear your interval to prevent memory leaks.
    }
  }, [pitchTime])

  var inBetweenBreaks = false;
  for (const [key, value] of Object.entries(shiftTimeBreaks)) {
    if (value.time) {
      var breakStartTime = moment(value.time[0], format);
      var breakEndTime = moment(value.time[1], format);
      var endPitchTime = moment(breakEndTime.format('HH:mm'), format);
      var startPitchTime = moment(breakStartTime.format('HH:mm'), format);
      // console.log(startPitchTime, endPitchTime, 'hello')
      if (moment().isBetween(startPitchTime, endPitchTime)) {
        inBetweenBreaks = true;
        // console.log('inBetweenBreaks ')
      }
    }
  }
  // console.log(inBetweenBreaks, 'inBetweenBreaks')
  var activeShiftPeriod = 0;

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

    // console.log(excelFileData, 'excelFileData', dataGroupByProduct)


    socket.on('singleClick', function (data) { //get button status from client
      // document.getElementById("lightgreen").checked = data; //change checkbox according to push button on Raspberry Pi
      // socket.emit("singleClick", data); //send push button status to back to server
      // setSocketResponse(true);
      // setDonePieces(data);

      // console.log(data, 'data')
      const message = data === 0 ? '' : ' in 5 Seconds';
      Swal.fire(
        {
          position: 'top-end',
          icon: 'success',
          title: 'Single Click, Press Button Again' + message,
          showConfirmButton: false,
          timer: 5000
        }
      )
    });

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
    if (excelFileData.length !== 0 && dataGroupByProduct.length == 0) {
      const allShiftsData = [];
      const dataGroup = lodash.orderBy(lodash.chain(excelFileData)
        .groupBy((item) => `${item.order_num_VHMFNO_D}${'---'}${item.part_num_VHPRNO_C}`)
        .map((value, key) => {
          return {
            product: key,
            totalProducts: value.length,
            data: value,
            row_num: value[0].row_num,
            total: lodash.sumBy(value, 'quantity_VHOROQ_AH'),
            sum: lodash.sumBy(value, 'quantity_VHOROQ_AH'),
            productsPerBox: lodash.get(value, '0.per_box_qty_UNITCAIXA_IT')  //product quantity
          }
        }).value(), ['row_num'], ['asc']).filter(k => k.sum !== null);
      // console.log(dataGroup, totalPitchesLength, totalQuantityDynamic, 'dataGroup')
      var loadNextProductTotal = 0;
      var currentElement = 0;
      var runningTakTimeSum = 0;
      for (var i = totalPitchesLength; (i >= 1 && totalQuantityDynamic > 0 && dataGroup[currentElement]); i--) {
        const recordSet = [];
        // console.log(numberOfProducts, dataGroup[currentElement], 'numberOfProducts')
        const numberOfProducts = dataGroup[currentElement].totalProducts; //number of Products in current order
        // const numberOfProducts = 4; //number of Products in current order
        // console.log(dataGroup, 'dataGroup243')

        const currentShiftProducts = 0;
        // based on count, assign products
        // also subtract their sum value

        for (var j = 0; j < numberOfProducts; j++) {
          var currentElementData = dataGroup[currentElement];
          const singleProductColor = colorsPalette[currentElement];
          const currentShiftSum = Math.ceil(runningTakTimeSum + pitchTakTime) - Math.ceil(runningTakTimeSum);
          var productCountDynamic = currentShiftSum;
          const recordList = [];
          var nextProduct = 0;
          runningTakTimeSum += pitchTakTime;

          // console.log(productCountDynamic, 'productCountDynamic0')
          if (loadNextProductTotal + productCountDynamic >= currentElementData.sum) {  //nextProduct

            productCountDynamic = productCountDynamic - (loadNextProductTotal + productCountDynamic - currentElementData.sum);
            nextProduct = currentShiftSum - productCountDynamic;
            loadNextProductTotal = 0;
            currentElement = currentElement + 1;
            // console.log(productCountDynamic, nextProduct, 'productCountDynamic')
          } else {
            loadNextProductTotal += productCountDynamic;
          }

          totalQuantityDynamic = totalQuantityDynamic - productCountDynamic;
          // console.log(i, currentElement, currentElementData.sum, productCountDynamic, totalQuantityDynamic, loadNextProductTotal, loadNextProductTotal + productCountDynamic, 'dataGroupCurrent')

          recordSet.push({
            ...currentElementData,
            color: singleProductColor,
            record: currentElementData.data[j], //check sum, currentElementData.data[j]
            productCount: productCountDynamic, //for changing dynamic, on button push
            originalCount: productCountDynamic, //comparing with originalCount
          });

          if (nextProduct - lodash.get(dataGroup[currentElement], 'sum', 0))
            // console.log(nextProduct, currentShiftSum, currentShiftSum - nextProduct, nextProduct - lodash.get(dataGroup[currentElement], 'sum', 0), lodash.get(dataGroup[currentElement], 'sum', 0), 'nextProduct');
            if (nextProduct !== 0 && nextProduct !== currentShiftSum && dataGroup[currentElement]) {
              // console.log(currentElementData, 'currentElementData')
              var currentElementData = dataGroup[currentElement];
              // console.log(dataGroup[currentElement].sum, 'dataGroup[currentElement].sum')
              currentElementData.sum = currentElementData.sum - nextProduct;
              const singleProductColor = colorsPalette[currentElement];
              recordSet.push({
                ...currentElementData,
                color: singleProductColor,
                record: currentElementData.data[j], //check sum, currentElementData.data[j]
                productCount: nextProduct, //for changing dynamic, on button push
                originalCount: nextProduct, //comparing with originalCount
              });
              recordSet.reverse();
            }
          // console.log(recordSet, 'recordSet')
        }

        allShiftsData.push(recordSet)
      }
      // console.log(allShiftsData, 'allShiftsData', totalPitchesLength)
      setDataGroupByProduct(allShiftsData);
    }
  }, [excelFileData]);
  // console.log(0 / moment.duration(currentTime.diff(shiftStartTime)).asHours(), moment.duration(currentTime.diff(shiftStartTime)).asHours(), 'negative');

  useEffect(() => {
    if (!inBetweenBreaks && donePieces !== 0) {
      const allShiftsData = [...dataGroupByProduct];
      var allShiftsDataLength = lodash.get(allShiftsData, '[0].length', 0);
      var currentShiftOriginalCount = lodash.get(allShiftsData, [[0], [allShiftsDataLength - 1], 'originalCount']);

      const limitShift = currentShiftOriginalCount;
      const remainderDonePieces = (limitShift + localDonePieces) - donePieces;
      // const remainderDonePieces = donePieces % limitShift === 0 ? limitShift : donePieces % limitShift;
      // var allShiftsDataRemainder = currentShiftOriginalCount + localDonePieces;


      // console.log('updatedShiftData', activeShiftPeriod, limitShift, remainderDonePieces, localDonePieces)
      // if (allShiftsData[0] && limitShift - remainderDonePieces > limitShift - allShiftsDataRemainder) { //subtract on every button press
      // } else if (allShiftsData[0] && limitShift - remainderDonePieces <= limitShift - allShiftsDataRemainder) { //check for remove product or remove shift

      // press button calculate difference
      const currentTime = moment(moment(), format);
      // set value
      setPiecesPerHourOnDay(donePieces / moment.duration(currentTime.diff(shiftStartTime)).asHours());
      // console.log(1 / moment.duration(currentTime.diff(piecesPerHourOnTimeMoment)).asHours(), moment.duration(currentTime.diff(piecesPerHourOnTimeMoment)).asHours(), 'diff');
      // console.log(donePieces / moment.duration(currentTime.diff(shiftStartTime)).asHours(), 'timediff-1')
      // console.log(1 / moment.duration(currentTime.diff(piecesPerHourOnTimeMoment)).asHours(), 'timediff-2')
      setPiecesPerHourOnTime(1 / moment.duration(currentTime.diff(piecesPerHourOnTimeMoment)).asHours());
      setPiecesPerHourOnTimeMoment(currentTime);

      // lodash.get(currentCardBox, 'total')
      if ((lodash.get(currentCardBox, 'total') + pendingPiecesPerProduct) - donePieces === 0)
        setPendingPiecesPerProduct(pendingPiecesPerProduct + lodash.get(currentCardBox, 'total'));
      // console.log(piecesPerHourOnTime, 'piecesPerHourOnTime')
      if (allShiftsData[0] && remainderDonePieces > 0) { //subtract on every button press
        allShiftsData[0][allShiftsData[0].length - 1].productCount = allShiftsData[0][allShiftsData[0].length - 1].productCount - 1;
      } else if (allShiftsData[0] && remainderDonePieces === 0) { //check for remove product or remove shift
        setLocalDonePieces(localDonePieces + limitShift);
        // if (remainderDonePieces === limitShift) {
        // console.log(trackShiftsDone, activeShiftPeriod, 'trackShiftsDoneFinal')
        setTrackShiftsDone(trackShiftsDone + 1);
        // console.log(trackShiftsDone, ':::: done Piecess')
        if (allShiftsData[0].length > 1) { //remove product
          allShiftsData[0].pop();
        } else { //remove shift
          allShiftsData.splice(0, 1);
        }
      }
      // console.log('updatedShiftData', allShiftsData)

      setDataGroupByProduct(allShiftsData)
    }
  }, [donePieces]);

  useEffect(() => {
    dispatch(intialExcelSheet());
    dispatch(getChartData());

    currentPage !== page && setPage(currentPage)
  }, [dispatch, currentPage, page])

  const dataGroupByLine = lodash.chain(excelFileData)
    // Group the elements of Array based on `color` property
    .groupBy("line_VOPLGR_EF")
    // `key` is group's name (color), `value` is the array of objects
    .map((value, key) => ({ lineNumber: key, data: value }))
    .value();

  function filterColor(currentPointer) {
    if (currentPointer <= parseInt(blueColorChartParams.min) && parseInt(blueColorChartParams.min) !== 0) return 'blue';
    else if (currentPointer >= parseInt(greenColorChartParams.min) && currentPointer <= parseInt(greenColorChartParams.max) && parseInt(greenColorChartParams.min) !== 0 && parseInt(greenColorChartParams.max) !== 0) return 'green';
    else if (currentPointer >= parseInt(orangeColorChartParams.min) && currentPointer <= parseInt(orangeColorChartParams.max) && parseInt(orangeColorChartParams.min) !== 0 && parseInt(orangeColorChartParams.max) !== 0) return 'orange';
    else if (currentPointer >= parseInt(redColorChartParams.min) && currentPointer <= parseInt(redColorChartParams.max) && parseInt(redColorChartParams.min) !== 0 && parseInt(redColorChartParams.max) !== 0) return 'red';
    // else if (currentPointer >= parseInt(blackColorChartParams.min) && currentPointer <= parseInt(blackColorChartParams.max)) return 'black';
    else if (currentPointer > parseInt(blackColorChartParams.min) && parseInt(blackColorChartParams.min) !== 0) return 'black';
  }

  // console.log(totalPitchesLength, 'totalPitchesLength')
  var currentCardBox = {};
  var cardsData = [];
  function renderCards() {
    var counterTimeShift = 0;
    for (var i = 12; i >= 1; i--) {
      // totalPitchesLength
      var color = filterColor(i);
      counterTimeShift++;
      // var endPitchTime = moment(shiftEndTime.format('HH:mm'), format);
      // var startPitchTime = moment(shiftEndTime.subtract(pitchTime, 'minutes').format('HH:mm'), format);
      // console.log(totalPitchesLength, currentTime.format('HH:mm:ss'), startPitchTime.format('HH:mm:ss'), endPitchTime.format('HH:mm:ss'), 'hello', currentTime.isBetween(startPitchTime, endPitchTime))


      var startPitchTime = moment(shiftStartTime.format('HH:mm'), format);
      var endPitchTime = moment(shiftStartTime.add(pitchTime, 'minutes').format('HH:mm'), format);
      // console.log(totalPitchesLength, currentTime.format('HH:mm:ss'), startPitchTime.format('HH:mm:ss'), endPitchTime.format('HH:mm:ss'), 'hello-1', currentTime.isBetween(startPitchTime, endPitchTime))

      if (currentTime.isBetween(startPitchTime, endPitchTime)) {
        // also check for length of allShiftsData
        activeShiftPeriod = counterTimeShift - trackShiftsDone;
        headerWidgetColor = filterColor(activeShiftPeriod);
        // console.log(trackShiftsDone, "::::::::loop")
        // if (!headerWidgetColor) headerWidgetColor = filterColor(maxColorPitch);
        // console.log(headerWidgetColor, activeShiftPeriod, i, trackShiftsDone, maxColorPitch, counterTimeShift, 'here is active', currentTime.format('HH:mm:ss'), startPitchTime.format('HH:mm:ss'), endPitchTime.format('HH:mm:ss'))
      }
      var dataGroupByProductRandom = lodash.get(dataGroupByProduct, i - 1, []);

      // console.log(dataGroupByProductRandom, 'dataGroupByProductRandom');
      cardsData.push(<CWidgetBrand
        style={{ marginLeft: '5px', width: '150px' }}
        color={color}
        shift={i <= activeShiftPeriod ? dataGroupByProductRandom.map(k => k.productCount).reduce((a, b) => a + b, 0) : undefined}
        cardName={i <= activeShiftPeriod ? lodash.get(dataGroupByProduct, i - 1, []).map((product, index) => {
          currentCardBox = (i === 1 && dataGroupByProductRandom.length - 1 === index) ? product : {};
          // console.log(product.color, product.sum, product, color, 'singleProductColor')
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
              width: '50px',
              // fontSize: '30px',
              margin: '5px',
              border: (i === 1 && dataGroupByProductRandom.length - 1 === index) ? '5px solid black' : 'inherit'
            }}>
              {product.productCount}</span>
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
  // cardsData.splice(0, totalPitchesLength - (12) + (12 - maxColorPitch));
  cardsData.splice(0, totalPitchesLength - 12);
  // console.log(totalPitchesLength, cardsData.length, blackColorChartParams.min, 'cardsData')
  // console.log(allShiftsData, currentCardBox, 'currentCardBox')
  // console.log(currentCardBox, 'currentCardBox')
  const kanbanBoxWidgetStyle = { fontSize: '15px' };
  const metricStyle = { fontWeight: 'bold' };
  if (inBetweenBreaks) return (<div style={{ textAlign: 'center', marginTop: '10%' }}><h1>System in Break, Don't push the button.</h1></div>)
  // if (!checkCurrentDayShiftSelected) return (<div style={{ textAlign: 'center', marginTop: '10%' }}><h1>No Shift for Today.</h1></div>)
  return (
    <CFormGroup>
      <CRow >
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
          <CWidgetSimple style={{ backgroundColor: headerWidgetColor, color: 'white' }} header="Pieces/Hour (On Time)" text={parseFloat(piecesPerHourOnTime).toFixed(1)} />
        </CCol>
        <CCol xs="2">
          <CWidgetSimple style={{ backgroundColor: headerWidgetColor, color: 'white' }} header="Pieces/Hour (Day)" text={parseFloat(piecesPerHourOnDay).toFixed(1)} />
        </CCol>
        <CCol xs="2">
          <CWidgetSimple style={{ backgroundColor: headerWidgetColor, color: 'white' }} header="Pieces/Hour (Target)" text={parseFloat(((1 / takTimeMinutes) * 60)).toFixed(0)} />
        </CCol>
      </CRow>
      <h1>{lodash.get(dataGroupByLine, '[0].lineNumber')}</h1>
      <hr style={{ borderTop: '3px solid rgba(0, 0, 21, 0.2)' }}></hr>
      <CRow style={{ float: 'right' }} >
        {/* <CCol xl={12}> */}
        {cardsData}
        {/* </CCol> */}
      </CRow>
      <CRow style={{ display: 'block' }} >
        <CCol xs={{ offset: 9, size: 3 }}>
          <CWidgetSimple style={{ backgroundColor: lodash.get(currentCardBox, 'color'), color: 'white' }} className='widgetBackground' header="Kanban en curs" text={
            <div style={{ textAlign: 'left' }}>
              <p style={kanbanBoxWidgetStyle}>Ordre de fabricació: <span style={metricStyle}>{lodash.get(currentCardBox, 'record.order_num_VHMFNO_D')}</span> </p>
              <p style={kanbanBoxWidgetStyle}>Referència del producte: <span style={metricStyle}>{lodash.get(currentCardBox, 'record.part_num_VHPRNO_C')}</span> </p>
              <p style={kanbanBoxWidgetStyle}>Descripció del producte: <span style={metricStyle}>{lodash.get(currentCardBox, 'record.description_VHTXT1_W')}</span> </p>
              <p style={kanbanBoxWidgetStyle}>Quantitat a produir total: <span style={metricStyle}>{lodash.get(currentCardBox, 'total')}</span> </p>
              <p style={kanbanBoxWidgetStyle}>Quantitat que falta per produir: <span style={metricStyle}>{pendingPiecesPerProduct + lodash.get(currentCardBox, 'total') - donePieces}</span> </p>
              <p style={kanbanBoxWidgetStyle}>Quantitat per caixa: <span style={metricStyle}>{parseFloat(lodash.get(currentCardBox, 'productsPerBox')).toFixed(2)}</span> </p>
            </div>
          } />
        </CCol>
      </CRow>
    </CFormGroup>
  )
}

export default Users;