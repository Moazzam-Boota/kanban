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

const colorsPalette = ['#2A2D34', '#009DDC', '#F26430', '#6761A8', '#009B72', '#F6E27F', '#E2C391'];


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
    console.log(successforgotmsg);
    successforgotmsg.forEach(row => {
      row.values.forEach(values => {
        parentsData.push(values);
      });
    });
  }

  const quantityPerBox = 3;   // .per_box_qty_UNITCAIXA_IT
  const dailyHours = 8; //hours, sum of all shifts (1, 2, 3) - sum of breaks (15min, 20min)
  const pitchPeriod = lodash.get(chartParams, 'pitchTime', 0); //minutes
  const totalQuantity = lodash.sumBy(parentsData, 'quantity_VHOROQ_AH'); //sum of all quantities
  var totalQuantityDynamic = lodash.sumBy(parentsData, 'quantity_VHOROQ_AH'); //sum of all quantities
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

  const dispatch = useDispatch()
  // const [socketResponse, setSocketResponse] = useState("");
  const [donePieces, setDonePieces] = useState(0);
  const [dataGroupByProduct, setDataGroupByProduct] = useState([]);
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

    console.log(parentsData, 'parentsData', dataGroupByProduct)

    socket.on('lightgreen', function (data) { //get button status from client
      // var count = 0;
      // document.getElementById("lightgreen").checked = data; //change checkbox according to push button on Raspberry Pi
      socket.emit("lightgreen", data); //send push button status to back to server
      // setSocketResponse(true);
      // var peices = 1 + donePieces;
      console.log(dataGroupByProduct, dataGroupByProduct[dataGroupByProduct.length - 1], 'dataGroupByProduct');
      // TODO:: last.last -1 
      // if (dataGroupByProduct[dataGroupByProduct.length - 1])
      //   dataGroupByProduct[dataGroupByProduct.length - 1][0].productCount = dataGroupByProduct[dataGroupByProduct.length - 1][0].productCount - 1;
      setDonePieces(data);
      // setDataGroupByProduct(dataGroupByProduct);

      // const dataGroup = dataGroupByProduct.forEach((record, index) => {
      //   // check if sum 0, skip product
      //   // if sum of all products in a shift >=boxesPerPitch, skip
      //   // dataGroupByProduct.filter(k => k.record === record.product)[0].sum = record.sum - quantityPerBox;
      //   if (index === dataGroupByProduct.length - 1)
      //     record.sum = record.sum - quantityPerBox;
      //   console.log(record.sum, boxesPerPitch, dataGroupByProduct, quantityPerBox, 'productCount')
      //   // return {
      //   //   record: record, productCount
      //   // };
      // });
      // setDataGroupByProduct(dataGroupByProduct);

      // lodash.orderBy(lodash.chain(parentsData)
      //   // Group the elements of Array based on `color` property
      //   .groupBy("part_num_VHPRNO_C")
      //   // `key` is group's name (color), `value` is the array of objects
      //   .map((value, key) => ({
      //     product: key,
      //     data: value,
      //     color: getRandomColor(),
      //     sum: lodash.sumBy(value, 'quantity_VHOROQ_AH'),
      //     productsPerBox: lodash.sumBy(value, 'quantity_VHOROQ_AH') / quantityPerBox
      //   })).value(), ['sum'], ['desc']).filter(k => k.sum !== null);

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
      const dataGroup = lodash.orderBy(lodash.chain(parentsData)
        // Group the elements of Array based on `color` property
        .groupBy("part_num_VHPRNO_C")
        // `key` is group's name (color), `value` is the array of objects
        .map((value, key) => {
          const color = colorsPalette[counter];
          ++counter;
          return {
            product: key,
            data: value,
            color: color,
            total: lodash.sumBy(value, 'quantity_VHOROQ_AH'),
            sum: lodash.sumBy(value, 'quantity_VHOROQ_AH'),
            productsPerBox: lodash.sumBy(value, 'quantity_VHOROQ_AH') / quantityPerBox
          }
        }).value(), ['sum'], ['desc']).filter(k => k.sum !== null);
      console.log(dataGroup, 'dataGroup');

      const dataGroupLength = dataGroup.length;
      const productCount = Math.round(boxesPerPitch / dataGroupLength * 10) / 10;
      var roundOffSlice = 0;
      // for (var i = blackColorChartParams.max; i >= 1; i--) {
      for (var i = blackColorChartParams.max; i >= 1; i--) {
        // allShiftsData.push(dataGroup.map((product, index) => {

        //   // const productCount = Math.floor(product.sum / quantityPerBox); //quantityPerBox
        //   // const productCount = Math.round(product.sum / quantityPerBox / boxesPerPitch);

        //   // check if sum 0, skip product
        //   // if sum of all products in a shift >=boxesPerPitch, skip
        //   // 
        //   dataGroup.filter(k => k.product === product.product)[0].sum = product.sum - productCount;
        //   console.log(product.sum, boxesPerPitch, boxesPerPitch / dataGroup.length, dataGroup, quantityPerBox, productCount, 'productCount')
        //   return {
        //     record: product, productCount: productCount
        //   };
        // })
        //   // .filter(k => {
        //   //   {
        //   //     console.log(k.record.sum, 'all')
        //   //     if (k.record.sum > 45 && k.record.sum < 100 && k.productCount < 2) return false;
        //   //     return true;
        //   //   }
        //   // });
        // );
        const numberOfProducts = 4;

        // const lastElement = dataGroup.length - 1;
        const lastElement = 0;
        dataGroup.filter(k => k.product === dataGroup[lastElement].product)[0].sum = dataGroup[lastElement].sum - Math.round(boxesPerPitch);
        roundOffSlice += Math.round(boxesPerPitch) - boxesPerPitch;
        if (roundOffSlice >= 1) {
          dataGroup.filter(k => k.product === dataGroup[lastElement].product)[0].sum = dataGroup[lastElement].sum + roundOffSlice;
          roundOffSlice = 0;
        }

        totalQuantityDynamic = totalQuantityDynamic - Math.round(boxesPerPitch);

        const recordSet = [];
        var multipleRoundOff = 0;
        for (var j = 0; j < numberOfProducts; j++) {
          multipleRoundOff += Math.round(Math.round(boxesPerPitch) / numberOfProducts) - Math.round(boxesPerPitch) / numberOfProducts;

          var productCountDynamic = Math.round(Math.round(boxesPerPitch) / numberOfProducts);
          console.log(roundOffSlice, multipleRoundOff, 'roundOffSlice', Math.round(boxesPerPitch) / numberOfProducts)

          recordSet.push({
            record: dataGroup[j],
            productCount: multipleRoundOff >= 1 ? productCountDynamic - multipleRoundOff : productCountDynamic,
            originalCount: multipleRoundOff >= 1 ? productCountDynamic - multipleRoundOff : productCountDynamic
          });

          if (multipleRoundOff >= 1) multipleRoundOff = 0;

        }

        console.log(dataGroup, recordSet, 'dataGroup', totalQuantityDynamic, roundOffSlice, dataGroup.filter(k => k.product === dataGroup[lastElement].product)[0].sum, boxesPerPitch)

        // set of products
        // const recordSet = {
        //   record: dataGroup[0], productCount: Math.round(boxesPerPitch), originalCount: Math.round(boxesPerPitch)
        // };
        // single product with highest count, 
        // with lesser counts
        allShiftsData.push(recordSet)
      }
      setDataGroupByProduct(allShiftsData);
    }
  }, [parentsData]);


  useEffect(() => {
    console.log(donePieces, 'donePieces')
    const allShiftsData = [...dataGroupByProduct];
    var allShiftsDataLength = lodash.get(allShiftsData, '[0].length', 0);
    var allShiftsDataRemainder = lodash.get(allShiftsData, [[0], [allShiftsDataLength - 1], 'originalCount'], 0);
    var shiftPieceDoneLimit = donePieces % (allShiftsDataRemainder + 1);
    var counter = 0;
    console.log('updatedShiftData', counter, shiftPieceDoneLimit, allShiftsDataRemainder)
    ++counter;
    if (allShiftsData[0] && allShiftsData[0][allShiftsData[0].length - 1].originalCount - shiftPieceDoneLimit <= 0) {
      if (allShiftsData[0].length > 1) {
        allShiftsData[0].pop();
        allShiftsDataLength = lodash.get(allShiftsData, '[0].length', 0);
        allShiftsDataRemainder = lodash.get(allShiftsData, [[0], [allShiftsDataLength - 1], 'originalCount'], 0);
        shiftPieceDoneLimit = donePieces % (allShiftsDataRemainder + 1);
      }
      else {
        allShiftsData.splice(0, 1);
      }
    }
    else if (allShiftsData[0] && allShiftsData[0][allShiftsData[0].length - 1].originalCount - shiftPieceDoneLimit > 0) {
      allShiftsData[0][allShiftsData[0].length - 1].productCount = allShiftsData[0][allShiftsData[0].length - 1].originalCount - shiftPieceDoneLimit;
    }
    console.log(allShiftsData, 'allShiftsData', shiftPieceDoneLimit, allShiftsDataRemainder)
    // const allShiftsData = dataGroupByProduct.map((product, index) => {
    //   console.log(product, 'product')
    //   if ((dataGroupByProduct.length - 1 === index && product.originalCount - donePieces >= 0))
    //     product[0].productCount = product[0].originalCount - donePieces;
    //   // else if ((i === 1 && dataGroupByProductRandom.length - 1 === index && product.originalCount - donePieces <= 0)) {
    //   //   // dataGroupByProduct[dataGroupByProduct.length - 1].pop();
    //   //   dataGroupByProduct.splice(-1, 1);
    //   // }

    // });

    setDataGroupByProduct(allShiftsData)
  }, [donePieces]);
  const allShiftsData = [...dataGroupByProduct];
  var allShiftsDataLength = lodash.get(allShiftsData, '[0].length', 0);
  var allShiftsDataRemainder = lodash.get(allShiftsData, [[0], [allShiftsDataLength - 1], 'originalCount'], 0);
  var shiftPieceDoneLimit = donePieces % (allShiftsDataRemainder + 1);
  console.log(allShiftsData, 'updatedShiftData', shiftPieceDoneLimit, allShiftsDataLength, allShiftsDataRemainder)


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


  // check if currentTime is between the pitchPeriod, add cards to that pitch
  // timeRange[0] add pitchPeriod, check if current time is between, old and new+shift time, show boxes
  // var time = moment() gives you current time. no format required.
  var format = 'HH:mm'
  const [time, setTimeLeft] = useState(moment('15:40', format));

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(moment());
    }, 1000);
    // Clear timeout if the component is unmounted
    return () => clearTimeout(timer);
  }, [dataGroupByProduct]);


  var startShiftTime = moment(timeRange[1], format);
  var initialShiftTime = moment(timeRange[0], format);


  var duration = moment.duration(startShiftTime.diff(initialShiftTime));
  // console.log(timeRange, 'timeRange', duration.asMinutes() / pitchPeriod, pitchPeriod)
  // duration subtract breaks

  const cardsData = [];
  var activeShiftPeriod = 0;
  // for (var i = kanbanBoxes - skipBoxes; i >= 1; i--) {
  for (var i = duration.asMinutes() / pitchPeriod; i >= 1; i--) {
    var color = '';

    var beforeTime = moment(startShiftTime.format('HH:mm'), format);
    var afterTime = moment(startShiftTime.subtract(pitchPeriod, 'minutes').format('HH:mm'), format);

    if (i <= parseInt(blueColorChartParams.min)) { color = 'blue'; }
    else if (i >= parseInt(greenColorChartParams.min) && i <= parseInt(greenColorChartParams.max)) { color = 'green'; }
    else if (i >= parseInt(orangeColorChartParams.min) && i <= parseInt(orangeColorChartParams.max)) { color = 'orange'; }
    else if (i >= parseInt(redColorChartParams.min) && i <= parseInt(redColorChartParams.max)) { color = 'red'; }
    else if (i >= parseInt(blackColorChartParams.min) && i <= parseInt(blackColorChartParams.max)) { color = 'black'; }

    console.log(time, afterTime, beforeTime, 'hello')
    if (time.isBetween(afterTime, beforeTime)) {
      activeShiftPeriod = i;
      headerWidgetColor = color;
      console.log(i, activeShiftPeriod, time, beforeTime, afterTime, 'here is')
    }
    var dataGroupByProductRandom = lodash.get(dataGroupByProduct, i - 1, []);
    var currentCardBox = {};

    console.log(dataGroupByProductRandom, 'dataGroupByProductRandom')

    cardsData.push(<CWidgetBrand
      style={{ marginLeft: '5px', width: '150px' }}
      color={color}
      shift={i <= activeShiftPeriod ? Math.round(boxesPerPitch) : undefined}
      cardName={i <= activeShiftPeriod ? lodash.get(dataGroupByProduct, i - 1, []).map((product, index) => {
        currentCardBox = (i === 1 && dataGroupByProductRandom.length - 1 === index) ? product : {};

        return (
          <span className="content-center" style={{
            backgroundColor: product.record.color,
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
  // console.log(allShiftsData, currentCardBox, 'currentCardBox')
  console.log(currentCardBox, 'currentCardBox')
  console.log(cardsData, 'cardsData')
  cardsData.splice(0, 4);
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
          <CWidgetSimple style={{ backgroundColor: lodash.get(currentCardBox, 'record.color'), color: 'white' }} className='widgetBackground' header="Kanban en curs" text={
            <div style={{ textAlign: 'left' }}>
              <p style={kanbanBoxWidgetStyle}>Ordre de fabricació: <span style={metricStyle}>{lodash.get(currentCardBox, 'record.data[0].order_num_VHMFNO_D')}</span> </p>
              <p style={kanbanBoxWidgetStyle}>Referencia de producte: <span style={metricStyle}>{lodash.get(currentCardBox, 'record.product')}</span> </p>
              <p style={kanbanBoxWidgetStyle}>Descripció de producte: <span style={metricStyle}>{lodash.get(currentCardBox, 'record.data[0].description_VHTXT1_W')}</span> </p>
              <p style={kanbanBoxWidgetStyle}>Quantitat a produir total: <span style={metricStyle}>{lodash.get(currentCardBox, 'record.total')}</span> </p>
              <p style={kanbanBoxWidgetStyle}>Quantitat que falten per produit: <span style={metricStyle}>{lodash.get(currentCardBox, 'record.total') - donePieces * 3}</span> </p>
              <p style={kanbanBoxWidgetStyle}>Quantitat per caixa: <span style={metricStyle}>{parseFloat(lodash.get(currentCardBox, 'record.productsPerBox')).toFixed(2)}</span> </p>
            </div>
          } />
        </CCol>
      </CRow>
    </CFormGroup>
  )
}

export default Users;