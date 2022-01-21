import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { intialExcelSheet } from "../../redux/actions/actions";
import CWidgetBrand from "./CWidgetBrand";
import { CFormGroup, CCol, CRow, CButton } from "@coreui/react";
import CWidgetSimple from "./CWidgetSimple";
import socketIOClient from "socket.io-client";
import Swal from "sweetalert2/dist/sweetalert2.js";
import "sweetalert2/src/sweetalert2.scss";
import helpers from "../../helpers/helpers";

import PouchDB from "pouchdb-browser";
const pouchDBConnection = new PouchDB("kanban_db", {
  revs_limit: 1,
  auto_compaction: true,
});

const ENDPOINT = "http://127.0.0.1:4001";
const lodash = require("lodash");
const moment = require("moment");

const colorsPalette = [
  "#F26430",
  "#009B72",
  "#F6E27F",
  "#E2C391",
  "#2A2D34",
  "#6761A8",
  "#009DDC",
  "#FAA916",
  "#96031A",
  "#710000",
  "#A63C06",
  "#7E7F9A",
  "#EB9486",
  "#C2B97F",
  "#88665D",
  "#20FC8F",
  "#99EDCC",
  "#FFA987",
  "#41D3BD",
  "#791E94",
];

const Users = () => {
  const queryPage = useLocation().search.match(/page=([0-9]+)/, "");
  const currentPage = Number(queryPage && queryPage[1] ? queryPage[1] : 1);
  const [page, setPage] = useState(currentPage);
  const [startOfBreak, setStartOfBreak] = useState("");
  // var initialTime = moment().format("hh:mm:ss A");
  // const [time, setTime] = useState(initialTime);
  const [endOfBreak, setEndOfBreak] = useState("");
  const [dbChartParams, setDbChartParams] = useState({});
  const excelFileBackendResponse = useSelector(
    (state) => state.excelReducer.apiCalled
  );
  var params = localStorage.getItem("params");
  params = JSON.parse(params);
  const weekDaysRun = localStorage.getItem("params")
    ? params.PERS044["1"].days.map((k) => k.value)
    : lodash.get(dbChartParams, ["PERS044", 1, "days"], []).map((k) => k.value);

  const excelFileData = [];
  // const colorChartParams = lodash.get(dbChartParams, "colors", {});
  const colorChartParams = localStorage.getItem("params")
    ? params.colors
    : lodash.get(dbChartParams, "colors", {});
  const lineChartParams = lodash.get(dbChartParams, "PERS044", {});
  if (excelFileBackendResponse) {
    // console.log(excelFileBackendResponse, 'excelFileBackendResponse');
    excelFileBackendResponse.forEach((row) => {
      row.values.forEach((values) => {
        excelFileData.push(values);
      });
    });
  }
  // useEffect(() => {
  //   setTime (moment().format("hh:mm:ss A"))
  // }, [time]);

  // const downloadAutoTime = lodash.get(dbChartParams, "downloadTime");
  const downloadAutoTime = localStorage.getItem("params")
    ? params.downloadTime
    : lodash.get(dbChartParams, "downloadTime");
  // console.log(lodash.get(excelFileData, '[0].per_box_qty_UNITCAIXA_IT'), 'excelFileData')
  var format = "HH:mm";
  // const pitchTime = lodash.get(dbChartParams, "pitchTime", 0); //minutes
  const pitchTime = localStorage.getItem("params")
    ? params.pitchTime
    : lodash.get(dbChartParams, "pitchTime", 0); //minutes
  // *************************** One Shift ***************************
  // 08:00 to 14:00
  // const shiftTimeRange = lodash.get(lineChartParams, "[1].time", []);
  const shiftTimeRange = localStorage.getItem("params")
    ? params.PERS044["1"].time
    : lodash.get(lineChartParams, "[1].time", []);
  // const shiftDaysRange = lodash.get(lineChartParams, '[1].days', []);
  // const shiftTimeBreaks = lodash.get(lineChartParams, "[1].breaks", []);
  const shiftTimeBreaks = localStorage.getItem("params")
    ? params.PERS044["1"].breaks
    : lodash.get(lineChartParams, "[1].breaks", []);

  // *************************** One Shift ***************************
  function refreshAt(hours, minutes, seconds, callFunction) {
    var now = new Date();
    var then = new Date();

    if (
      now.getHours() > hours ||
      (now.getHours() == hours && now.getMinutes() > minutes) ||
      (now.getHours() == hours &&
        now.getMinutes() == minutes &&
        now.getSeconds() >= seconds)
    ) {
      then.setDate(now.getDate() + 1);
    }
    then.setHours(hours);
    then.setMinutes(minutes);
    then.setSeconds(seconds);

    var timeout = then.getTime() - now.getTime();
    setTimeout(callFunction, timeout);
    // console.log('script refreshed')
  }

  var inBetweenBreaks = false;
  var allBreaks = [];
  function callBreaks() {
    var breakCounter = 0;
    for (const [key, value] of Object.entries(shiftTimeBreaks)) {
      if (value.time) {
        // if current time is less than break, set
        let breakStartTime = moment(value.time[0], format);
        let breakEndTime = moment(value.time[1], format);
        allBreaks.push([breakStartTime, breakEndTime]);
        let startPitchTime = moment(breakStartTime.format("HH:mm"), format);
        let endPitchTime = moment(breakEndTime.format("HH:mm"), format);
        if (
          moment(moment(), format).isSameOrBefore(endPitchTime) &&
          breakCounter === 0
        ) {
          // startOfBreak = startPitchTime;
          breakCounter++;
          if (startOfBreak === "") {
            setStartOfBreak(startPitchTime);
            setEndOfBreak(endPitchTime);
            console.log("break-set");
          }
          // endOfBreak = endPitchTime;
          console.log(
            moment(moment(), format),
            startPitchTime,
            endPitchTime,
            "nearest-break"
          );
        }
        if (moment(moment(), format).isBetween(startPitchTime, endPitchTime)) {
          console.log(
            moment(moment(), format),
            startPitchTime,
            endPitchTime,
            "hello-break"
          );
          inBetweenBreaks = true;
          // console.log('inBetweenBreaks ')
        }
      }
    }
  }
  /*******************************************************************************************
  ***************Deleting IndexDB Before 5 minutes when the file will download**************** 
  ***************************************************************************************** */
  var duration = moment.duration({ hours: 0, minutes: 5 });
  var sub = moment(downloadAutoTime, "HH:mm")
    .subtract(duration)
    .format("HH:mm");
  if(sub !== moment().format("HH:mm")) localStorage.removeItem("clearIndexDB")
  if (sub === moment().format("HH:mm") && !localStorage.getItem("clearIndexDB")) {
    localStorage.setItem("clearIndexDB", 1); // use to delete the indexDB for once time only
    console.log(
      "downloadTime",
      downloadAutoTime,
      " currentTime",
      moment().format("HH:mm"),
      "ok",
      sub
    );
    var req = indexedDB.deleteDatabase("_pouch_kanban_db");
    req.onsuccess = function () {
      console.log("Deleted database successfully");
    };
    req.onerror = function () {
      console.log("Couldn't delete database");
    };
    req.onblocked = function () {
      console.log(
        "Couldn't delete database due to the operation being blocked"
      );
    };
  }

  if (downloadAutoTime) {
    const autoDownloadTimeMoment = moment(downloadAutoTime, format).add(
      30,
      "seconds"
    );

    refreshAt(
      autoDownloadTimeMoment.hours(),
      autoDownloadTimeMoment.minutes(),
      autoDownloadTimeMoment.seconds(),
      function () {
        pouchDBConnection.get("count").then(function (doc) {
          pouchDBConnection.get("shiftsTrack").then(function (doc2) {
            return pouchDBConnection.remove(doc2);
          });
          return pouchDBConnection.remove(doc);
        });
        localStorage.removeItem("pendingPiecesPerProduct");
        
        window.location.reload(true);
      }
    ); //Will refresh the page at 18:45pm
  }

  // console.log(startOfBreak, endOfBreak, 'our-breaks')
  if (startOfBreak !== "") {
    refreshAt(
      startOfBreak.hours(),
      startOfBreak.minutes(),
      startOfBreak.seconds(),
      function () {
        window.location.reload(true);
      }
    );
  }

  if (endOfBreak !== "") {
    refreshAt(
      endOfBreak.hours(),
      endOfBreak.minutes(),
      endOfBreak.seconds(),
      function () {
        window.location.reload(true);
      }
    );
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
      // console.log(`${key}:`, key, value, 'hello-break', sumOfBreaks, breakStartTime, breakEndTime);
    }
  }

  // console.log('hello-break', sumOfBreaks);
  // TODO:: run hook at exact break time, check current time
  callBreaks();

  // console.log(inBetweenBreaks, 'inBetweenBreaks')

  var shiftStartTime = moment(shiftTimeRange[0], format);
  var shiftEndTime = moment(shiftTimeRange[1], format);
  var skipMinutes = 0;
  var whichBreak = 0; // decide which break ends previously (currentTime is between endPreviousBreak and EndShiftTime )
  let endBreak;
  if (allBreaks.length >= 1) {
    var objs = allBreaks.map(function (x) {
      return {
        breakStart: x[0],
        breakEnd: x[1],
      };
    });
    for (whichBreak; whichBreak < allBreaks.length; whichBreak++) {
      let breakStart = allBreaks[whichBreak][0];
      let breakEnd = allBreaks[whichBreak][1];
      if (
        moment().isBetween(breakStart, breakEnd) &&
        moment().isBetween(shiftStartTime, shiftEndTime)
      ) {
        localStorage.setItem("whichBreak", whichBreak + 1);
      }
    }

    console.log("previousBreak", localStorage.getItem("whichBreak"));
    if (localStorage.getItem("whichBreak")) {
      var previousBreak = localStorage.getItem("whichBreak");
      objs.slice(0, previousBreak).forEach((item) => {
        console.log(item.breakStart, item.breakEnd, "defchbdehcb");
        var BreakDiffInMinutes = moment
          .duration(item.breakEnd.diff(item.breakStart))
          .asMinutes();
        skipMinutes += BreakDiffInMinutes;
        console.log("length of breaks", allBreaks.length);
      });
    }
    console.log("allBrewaks", objs);
    console.log("previousBreak", previousBreak);
    console.log("allBreaks Length", allBreaks.length);

    objs.slice(0, 1).forEach((item) => {
      endBreak = item.breakEnd;
    });
    if (moment().isBetween(endBreak, shiftEndTime)) {
      // if firstBreak start skip firstBreak minutes if second add first and second and skip here
      console.log("inBetween", skipMinutes);
      shiftStartTime.add(skipMinutes, "m");
    }
  }

  if (
    !moment().isBetween(shiftStartTime, shiftEndTime) &&
    allBreaks.length >= 1
  ) {
    var objs1 = allBreaks.map(function (x) {
      return {
        breakStart: x[0],
        breakEnd: x[1],
      };
    });

    objs1.forEach((item) => {
      const breakStart = item.breakStart;
      const breakEnd = item.breakEnd;
      if (
        !moment().isBetween(shiftStartTime, shiftEndTime) &&
        !moment().isBetween(breakStart, breakEnd)
      ) {
        localStorage.removeItem("whichBreak");
      }
    });
  }
  if (!moment().isBetween(shiftStartTime, shiftEndTime) && !allBreaks) {
    localStorage.removeItem("whichBreak");
  }
  if (!moment().isBetween(shiftStartTime, shiftEndTime)) {
    localStorage.removeItem("pendingPiecesPerProduct");
  }

  // console.log('shift start time', shiftStartTime.add(10, 'm').minutes());

  // var shiftDuration = moment.duration(shiftEndTime.diff(shiftStartTime)).asMinutes() - sumOfBreaks;
  var shiftDuration = moment
    .duration(shiftEndTime.diff(shiftStartTime))
    .asMinutes();
  const totalPitchesLength = Math.round(shiftDuration / pitchTime);

  // const [quantityPerBox, setQuantityPerBox] = useState(1);
  // const quantityPerBox = 1;   // .per_box_qty_UNITCAIXA_IT
  // const quantityPerBox = lodash.get(excelFileData, '[0].per_box_qty_UNITCAIXA_IT');   // .per_box_qty_UNITCAIXA_IT
  // console.log(quantityPerBox, 'quantityPerBox');
  // const dailyHours = Math.round((shiftDuration - sumOfBreaks / 60) * 100) / 100; //hours, sum of all shifts (1, 2, 3) - sum of breaks (15min, 20min)
  const totalQuantity = lodash.sumBy(excelFileData, "quantity_VHOROQ_AH"); //sum of all quantities

  const takTimeMinutes = (shiftDuration - sumOfBreaks) / totalQuantity;
  // console.log(takTimeMinutes, shiftDuration - sumOfBreaks, 'takTimeMinutes')
  // const takTimeSeconds = takTimeMinutes * 60;
  // const takTimeQuantity = Math.round((pitchTime * takTimeMinutes) * 100) / 100;
  const pitchTakTime = pitchTime / takTimeMinutes;
  var totalQuantityDynamic = lodash.sumBy(excelFileData, "quantity_VHOROQ_AH"); //sum of all quantities
  // const quantityPerHour = dailyHours / totalQuantity;   // quanitity per hour
  // const quantityPerMinute = quantityPerHour * 60;   // quanitity per minute
  // const quantityPerBoxPerMinute = quantityPerBox * quantityPerMinute;  // per box time
  // const boxesPerPitch = pitchTime / quantityPerBoxPerMinute;  //13.875 -> 13, 13, 13, 13, 14, when decimal equals 1, add to next one

  const blueColorChartParams = lodash.get(colorChartParams, "blue", {});
  const greenColorChartParams = lodash.get(colorChartParams, "green", {});
  const orangeColorChartParams = lodash.get(colorChartParams, "orange", {});
  const redColorChartParams = lodash.get(colorChartParams, "red", {});
  const blackColorChartParams = lodash.get(colorChartParams, "black", {});

  var maxColorPitch = 0;
  for (const [key, value] of Object.entries(colorChartParams)) {
    const minMaxNumber = Math.max(value.min, value.max);
    if (maxColorPitch < minMaxNumber) maxColorPitch = minMaxNumber;
  }

  const dispatch = useDispatch();

  // const [socketResponse, setSocketResponse] = useState("");
  const [donePieces, setDonePieces] = useState(0);
  const [localDonePieces, setLocalDonePieces] = useState(0);
  const [trackShiftsDone, setTrackShiftsDone] = useState(0);
  const [piecesPerHourOnTimeMoment, setPiecesPerHourOnTimeMoment] = useState(
    moment(moment(), format)
  );
  const [piecesPerHourOnTime, setPiecesPerHourOnTime] = useState(0);
  const [piecesPerHourOnDay, setPiecesPerHourOnDay] = useState(0);
  var initialstate = localStorage.getItem("pendingPiecesPerProduct")
    ? parseInt(localStorage.getItem("pendingPiecesPerProduct"))
    : 0;
  const [pendingPiecesPerProduct, setPendingPiecesPerProduct] =
    useState(initialstate);
  const [dataGroupByProduct, setDataGroupByProduct] = useState([]);
  const [movingBreakSum, setMovingBreakSum] = useState(0);
  var headerWidgetColor = "";

  const [currentTime, setTimeLeft] = useState(moment());

  // if (currentTime.isBetween(pitchRefreshIntervalStartPitchTime, pitchRefreshIntervalEndPitchTime)) {
  var pitchRefreshIntervalStartPitchTime = moment(
    shiftStartTime.format("HH:mm"),
    format
  );
  var pitchRefreshIntervalEndPitchTime = moment(
    shiftEndTime.format("HH:mm"),
    format
  );
  const pitchRefreshInterval = currentTime.isBetween(
    pitchRefreshIntervalStartPitchTime,
    pitchRefreshIntervalEndPitchTime
  )
    ? pitchTime
    : 0.5;
  // if ((currentTime.isBetween(pitchRefreshIntervalStartPitchTime, pitchRefreshIntervalEndPitchTime))) setPiecesPerHourOnDay(0);
  // console.log(pitchRefreshInterval, 'pitchTime');
  const MINUTE_MS = parseInt(pitchRefreshInterval) * 60 * 1000; // need to decide about 1st refresh and

  useEffect(() => {
    if (pitchTime !== 0 && !inBetweenBreaks) {
      const interval = setInterval(() => {
        setTimeLeft(moment());
        if (
          currentTime.isBetween(
            moment(shiftStartTime.format("HH:mm"), format),
            moment(shiftEndTime.format("HH:mm"), format)
          )
        )
          renderCards();
      }, MINUTE_MS);

      return () => clearInterval(interval); // This represents the unmount function, in which you need to clear your interval to prevent memory leaks.
    }
  }, [pitchTime]);

  function updateDonePieces(count) {
    updateFirstDonePieces(count);
    setDonePieces(count);

    // Swal.fire(
    //   {
    //     position: 'top-end',
    //     icon: 'success',
    //     title: 'Card is updated!',
    //     showConfirmButton: false,
    //     timer: 1500
    //   }
    // );
  }

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

    socket.on("singleClick", function (data) {
      //get button status from client
      // document.getElementById("lightgreen").checked = data; //change checkbox according to push button on Raspberry Pi
      // socket.emit("singleClick", data); //send push button status to back to server
      // setSocketResponse(true);
      // setDonePieces(data);

      // console.log(data, 'data')
      const message = data === 0 ? "" : " in 5 Seconds";
      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Single Click, Press Button Again" + message,
        showConfirmButton: false,
        timer: 5000,
      });
    });

    socket.on("lightgreen", function (data) {
      //get button status from client
      // document.getElementById("lightgreen").checked = data; //change checkbox according to push button on Raspberry Pi
      //socket.emit("lightgreen", data); //send push button status to back to server
      // setSocketResponse(true);

      //console.log(donePieces + 1, data, 'lightgreen');
      //updateDonePieces(donePieces + 1);
      document.getElementById("newPieceDoneButton").click();
    });
    socket.on("lightred", function (data) {
      //get button status from client
      // document.getElementById("lightred").checked = data; //change checkbox according to push button on Raspberry Pi
      // socket.emit("lightred", data); //send push button status to back to server
      Swal.fire({
        position: "top-end",
        icon: "error",
        title: "Some Error Occured!",
        showConfirmButton: false,
        timer: 1500,
      });
    });

    // socket.on("FromAPI", data => {
    //   setSocketResponse(data);
    //   socket.emit("lightred", Number(Math.random() < 0.5));
    //   socket.emit("lightgreen", Number(Math.random() < 0.5))
    // });

    return function cleanup() {
      socket.disconnect();
    };
  }, []);
  //  ...................
  useEffect(() => {
    if (excelFileData.length !== 0 && dataGroupByProduct.length === 0) {
      const allShiftsData = [];
      const dataGroup = lodash
        .orderBy(
          lodash
            .chain(excelFileData)
            .groupBy(
              (item) =>
                `${item.order_num_VHMFNO_D}${"---"}${item.part_num_VHPRNO_C}`
            )
            .map((value, key) => {
              return {
                product: key,
                totalProducts: value.length,
                data: value,
                row_num: value[0].row_num,
                total: lodash.sumBy(value, "quantity_VHOROQ_AH"),
                sum: lodash.sumBy(value, "quantity_VHOROQ_AH"),
                productsPerBox: lodash.get(value, "0.per_box_qty_UNITCAIXA_IT"), //product quantity
              };
            })
            .value(),
          ["row_num"],
          ["asc"]
        )
        .filter((k) => k.sum !== null);
      console.log(
        dataGroup.map((k) => k.sum),
        totalPitchesLength,
        "t",
        totalQuantityDynamic,
        "dataGroup-base"
      );
      var loadNextProductTotal = 0;
      var currentElement = 0;
      var runningTakTimeSum = 0;
      var totalSum = 0;
      for (
        var i = totalPitchesLength;
        i >= 1 && totalQuantityDynamic > 0 && dataGroup[currentElement];
        i--
      ) {
        const recordSet = [];
        // console.log(numberOfProducts, dataGroup[currentElement], 'numberOfProducts')
        const numberOfProducts = dataGroup[currentElement].totalProducts; //number of Products in current order
        // const numberOfProducts = 4; //number of Products in current order
        // console.log(dataGroup, 'dataGroup243')

        // const currentShiftProducts = 0;
        // based on count, assign products
        // also subtract their sum value
        console.log(numberOfProducts, "numberOfProducts");
        console.log(dataGroup, "dataGroup");
        for (var j = 0; j < numberOfProducts; j++) {
          var currentElementData = dataGroup[currentElement];
          const singleProductColor = colorsPalette[currentElement];
          const currentShiftSum =
            Math.ceil(runningTakTimeSum + pitchTakTime) -
            Math.ceil(runningTakTimeSum);
          var productCountDynamic = currentShiftSum;
          // console.log(productCountDynamic, 'productCountDynamic', currentShiftSum, 'currentShiftSum', 'pitchTalktime', pitchTakTime, runningTakTimeSum)

          var nextProduct = 0;
          runningTakTimeSum += pitchTakTime;
          console.log(
            pitchTakTime,
            "pitchTakTime",
            runningTakTimeSum,
            "runningTakTime"
          );
          if (
            loadNextProductTotal + productCountDynamic >=
            currentElementData.sum
          ) {
            //nextProduct
            // console.log(loadNextProductTotal, productCountDynamic, loadNextProductTotal + productCountDynamic, 'loadNextProductTotal + productCountDynamic', productCountDynamic)

            productCountDynamic =
              productCountDynamic -
              (loadNextProductTotal +
                productCountDynamic -
                currentElementData.sum);
            nextProduct = currentShiftSum - productCountDynamic;
            console.log(
              productCountDynamic,
              "productCountDynamic",
              nextProduct,
              "nextProduct"
            );
            totalSum += productCountDynamic;
            loadNextProductTotal = 0;
            currentElement = currentElement + 1; //setting next product index
            console.log("currentElementData", currentElement);
            console.log(
              currentShiftSum,
              productCountDynamic,
              dataGroup[currentElement],
              "our next product"
            );
            // console.log(productCountDynamic, nextProduct, 'productCountDynamic')
          } else {
            loadNextProductTotal += productCountDynamic;
          }

          totalQuantityDynamic = totalQuantityDynamic - productCountDynamic;
          // console.log(i, currentElement, currentElementData.sum, productCountDynamic, totalQuantityDynamic, loadNextProductTotal, loadNextProductTotal + productCountDynamic, 'dataGroupCurrent')

          if (productCountDynamic !== 0)
            recordSet.push({
              ...currentElementData,
              color: singleProductColor,
              record: currentElementData.data[j], //check sum, currentElementData.data[j]
              productCount: productCountDynamic, //for changing dynamic, on button push
              originalCount: productCountDynamic, //comparing with originalCount
            });
          // recordSet.reverse();

          console.log(nextProduct, currentShiftSum, "jani");
          console.log(totalSum, "totalSum");
          if (nextProduct - lodash.get(dataGroup[currentElement], "sum", 0)) {
            // console.log(nextProduct, currentShiftSum, currentShiftSum - nextProduct, nextProduct - lodash.get(dataGroup[currentElement], 'sum', 0), lodash.get(dataGroup[currentElement], 'sum', 0), 'nextProduct');
            // currentElement = currentElement + 1;
            currentElementData = dataGroup[currentElement];
            if (
              nextProduct !== 0 &&
              nextProduct !== currentShiftSum &&
              dataGroup[currentElement]
            ) {
              // console.log(currentElementData, 'currentElementData')
              currentElementData = dataGroup[currentElement];
              // console.log(dataGroup[currentElement].sum, 'dataGroup[currentElement].sum')
              if (totalPitchesLength > 55) {
                currentElementData.sum = currentElementData.sum - nextProduct;
              }
              const singleProductColor1 = colorsPalette[currentElement];
              console.log(currentElementData.sum, "here we need");
              console.log("love", nextProduct, "p", productCountDynamic);
              if (totalPitchesLength < 55) {
                nextProduct =
                  productCountDynamic -
                  (loadNextProductTotal +
                    productCountDynamic -
                    dataGroup[currentElement].sum);
                nextProduct < 0
                  ? (nextProduct =
                      loadNextProductTotal +
                      productCountDynamic -
                      dataGroup[currentElement].sum -
                      productCountDynamic)
                  : (nextProduct = nextProduct);
              }

              console.log("np", nextProduct, productCountDynamic, "pc");
              recordSet.push({
                ...currentElementData,
                color: singleProductColor1,
                record: dataGroup[currentElement].data[j], //check sum, currentElementData.data[j]
                productCount: nextProduct, //for changing dynamic, on button push
                originalCount: nextProduct, //comparing with originalCount
              });
              if (totalPitchesLength < 55) {
                currentElement = currentElement + 1;
              }

              recordSet.reverse();
              // console.log(recordSet, 'recordSet')
            }
          }
          console.log(recordSet, "recordSet1213");
        }
        if (recordSet.length !== 0) allShiftsData.push(recordSet);
      }

      // console.log(allShiftsData, 'allShiftsData', totalPitchesLength)
      setDataGroupByProduct(allShiftsData);
    }
  }, [excelFileData]);

  var multipleProductCounter = 0;
  function updateFirstDonePieces(firstDonePieces = donePieces, type) {
    // console.log(firstDonePieces, 'firstDonePieces');
    const allShiftsData = [...dataGroupByProduct];
    var allShiftsDataLength = lodash.get(allShiftsData, "[0].length", 0);
    var currentShiftOriginalCount = lodash.get(allShiftsData, [
      [0],
      [allShiftsDataLength - 1],
      "originalCount",
    ]); // need to store

    const limitShift = currentShiftOriginalCount;
    const remainderDonePieces = limitShift + localDonePieces - firstDonePieces;
    // console.log(remainderDonePieces, localDonePieces, limitShift, 'remainderDonePieces')
    // const remainderDonePieces = firstDonePieces % limitShift === 0 ? limitShift : donePieces % limitShift;
    // var allShiftsDataRemainder = currentShiftOriginalCount + localDonePieces;

    // console.log('updatedShiftData', activeShiftPeriod, limitShift, remainderDonePieces, localDonePieces)
    // if (allShiftsData[0] && limitShift - remainderDonePieces > limitShift - allShiftsDataRemainder) { //subtract on every button press
    // } else if (allShiftsData[0] && limitShift - remainderDonePieces <= limitShift - allShiftsDataRemainder) { //check for remove product or remove shift

    // press button calculate difference
    const currentTime = moment(moment(), format);
    // set value
    setPiecesPerHourOnDay(
      firstDonePieces /
        moment.duration(currentTime.diff(shiftStartTime)).asHours()
    );
    // console.log(0 / moment.duration(currentTime.diff(shiftStartTime)).asHours(), moment.duration(currentTime.diff(shiftStartTime)).asHours(), currentTime.format('HH:mm:ss'), moment(shiftStartTime.format('HH:mm'), format).format('HH:mm:ss'), shiftTimeRange[1], 'negative');

    // console.log(1 / moment.duration(currentTime.diff(piecesPerHourOnTimeMoment)).asHours(), moment.duration(currentTime.diff(piecesPerHourOnTimeMoment)).asHours(), 'diff');
    // console.log(donePieces / moment.duration(currentTime.diff(shiftStartTime)).asHours(), 'timediff-1')
    // console.log(1 / moment.duration(currentTime.diff(piecesPerHourOnTimeMoment)).asHours(), 'timediff-2')
    setPiecesPerHourOnTime(
      1 / moment.duration(currentTime.diff(piecesPerHourOnTimeMoment)).asHours()
    );
    helpers.updatePouchDB({
      _id: "count",
      data: {
        count: firstDonePieces,
        piecesPerHourOnTime:
          1 /
          moment
            .duration(currentTime.diff(piecesPerHourOnTimeMoment))
            .asHours(),
        piecesPerHourOnDay:
          firstDonePieces /
          moment.duration(currentTime.diff(shiftStartTime)).asHours(),
      },
      _rev: "1-somerev" + firstDonePieces.toString(),
    });

    setPiecesPerHourOnTimeMoment(currentTime);

    // lodash.get(currentCardBox, 'total')
    console.log(
      lodash.get(currentCardBox, "total"),
      pendingPiecesPerProduct,
      firstDonePieces,
      lodash.get(currentCardBox, "total") +
        pendingPiecesPerProduct -
        firstDonePieces,
      "piecesPerHourOnTime"
    );
    if (
      lodash.get(currentCardBox, "total") +
        pendingPiecesPerProduct -
        firstDonePieces ===
      0
    ) {
      if (localStorage.getItem("pendingPiecesPerProduct"))
        setPendingPiecesPerProduct(
          parseInt(localStorage.getItem("pendingPiecesPerProduct")) +
            lodash.get(currentCardBox, "total")
        );
      else {
        setPendingPiecesPerProduct(
          pendingPiecesPerProduct + lodash.get(currentCardBox, "total")
        );
      }
    }

    if (allShiftsData[0] && remainderDonePieces > 0) {
      //subtract on every button press

      allShiftsData[0][allShiftsData[0].length - 1].productCount =
        allShiftsData[0][allShiftsData[0].length - 1].productCount - 1; //TODO: subtract dynamic
    } else if (allShiftsData[0] && remainderDonePieces === 0) {
      //check for remove product or remove shift
      setLocalDonePieces(localDonePieces + limitShift);
      // if (remainderDonePieces === limitShift) {
      // console.log(trackShiftsDone + 1, activeShiftPeriod, allShiftsData, 'shiftsTrack')

      // console.log(trackShiftsDone, ':::: done Piecess')
      if (allShiftsData[0].length > 1) {
        //remove product, dynamic remove

        // TODO: update in localdb
        // console.log(allShiftsData[0].length, 'allShiftsData[0].length')
        multipleProductCounter = allShiftsData[0].length - 1;
        helpers.updatePouchDB({
          _id: "shiftsTrack",
          data: {
            allData: allShiftsData,
            productDone: multipleProductCounter,
            localDonePieces: localDonePieces + limitShift,
            trackShift: trackShiftsDone,
          },
          _rev: "1-somerev",
        });
        allShiftsData[0].pop();
      } else {
        //remove shift, dynamic remove
        allShiftsData.splice(0, 1);
        setTrackShiftsDone(trackShiftsDone + 1); // only enter to shift done, when
        helpers.updatePouchDB({
          _id: "shiftsTrack",
          data: {
            allData: allShiftsData,
            productDone: multipleProductCounter,
            localDonePieces: localDonePieces + limitShift,
            trackShift: trackShiftsDone + 1,
          },
          _rev: "1-somerev",
        });
      }
    }

    // console.log('updatedShiftData', allShiftsData)
    setDataGroupByProduct(allShiftsData);
  }
  useEffect(() => {
    localStorage.setItem("pendingPiecesPerProduct", pendingPiecesPerProduct);
  }, [pendingPiecesPerProduct]);
  useEffect(() => {
    setPendingPiecesPerProduct(
      parseInt(localStorage.getItem("pendingPiecesPerProduct"))
    );
  }, []);
  useEffect(() => {
    if (donePieces === 0 && dataGroupByProduct.length !== 0) {
      pouchDBConnection
        .get("count", { latest: true })
        .then(function (countData) {
          setDonePieces(countData.data.count);
          setPiecesPerHourOnTime(countData.data.piecesPerHourOnTime);
          setPiecesPerHourOnDay(countData.data.piecesPerHourOnDay);

          pouchDBConnection
            .get("shiftsTrack", { latest: true })
            .then(function (shiftData) {
              console.log(
                shiftData.data.allData,
                countData.data.count,
                shiftData.data.localDonePieces,
                "receive-db data here"
              );
              // const lastCountSubtract = countData.data.count - shiftData.data.localDonePieces;
              // if (allShiftsData[0].length > 1) { //remove product, dynamic remove

              // } else { //remove shift, dynamic remove
              // allShiftsData.splice(0, shiftData.data.trackShift);
              // // for (var i = 0; i < shiftData.data.trackShift; i++) {
              // // allShiftsData.pop();
              // // }
              // if (shiftData.data.productDone > 0) { //remove product, dynamic remove
              //   //   console.log(shiftData.data, allShiftsData[i], 'shiftsTrack here');
              //   allShiftsData[0].pop();
              // }

              // console.log('shift-remove', allShiftsData);
              // }
              // console.log(shiftData.data, allShiftsData, 'shiftsTrack-0 here');
              // only subtract based on remaining count

              shiftData.data.allData[0][
                shiftData.data.allData[0].length - 1
              ].productCount =
                shiftData.data.allData[0][shiftData.data.allData[0].length - 1]
                  .productCount -
                countData.data.count +
                shiftData.data.localDonePieces;
              // allShiftsData[0][allShiftsData[0].length - 1].productCount = allShiftsData[0][allShiftsData[0].length - 1].productCount - countData.data.count + shiftData.data.localDonePieces;
              // allShiftsData[0][allShiftsData[0].length - 1].productCount = allShiftsData[0][allShiftsData[0].length - 1].productCount - lastCountSubtract;

              // console.log('shift-remove', allShiftsData);
              // setDataGroupByProduct(allShiftsData);
              setDataGroupByProduct(shiftData.data.allData);
              setLocalDonePieces(shiftData.data.localDonePieces);
              setTrackShiftsDone(shiftData.data.trackShift);
            })
            .catch(function (err) {
              const allShiftsData = [...dataGroupByProduct];
              // console.log(err, 'error here');
              // if (countData.data.count !== 0) {
              allShiftsData[0][allShiftsData[0].length - 1].productCount =
                allShiftsData[0][allShiftsData[0].length - 1].productCount -
                countData.data.count;
              setDataGroupByProduct(allShiftsData);
              // }
            });
        });
    }
  }, [dataGroupByProduct, donePieces]);

  // useEffect(() => {
  //   if (!inBetweenBreaks && donePieces !== 0) {
  //     console.log('hello-done')
  //     updateFirstDonePieces();
  //   }
  // }, [donePieces]);

  // useEffect(() => {

  // }, [localDonePieces]);

  useEffect(() => {
    dispatch(intialExcelSheet());
    // dispatch(getChartData());
    pouchDBConnection.get("params").then(function (doc) {
      // console.log(doc, 'receive here');
      setDbChartParams(doc.data);
    });

    currentPage !== page && setPage(currentPage);
  }, [dispatch, currentPage, page]);
  var shiftMovingTime = moment(shiftStartTime.format("HH:mm"), format);
  const dataGroupByLine = lodash
    .chain(excelFileData)
    // Group the elements of Array based on `color` property
    .groupBy("line_VOPLGR_EF")
    // `key` is group's name (color), `value` is the array of objects
    .map((value, key) => ({ lineNumber: key, data: value }))
    .value();

  function filterColor(currentPointer) {
    if (
      currentPointer <= parseInt(blueColorChartParams.min) &&
      parseInt(blueColorChartParams.min) !== 0
    )
      return "blue";
    else if (
      currentPointer >= parseInt(greenColorChartParams.min) &&
      currentPointer <= parseInt(greenColorChartParams.max) &&
      parseInt(greenColorChartParams.min) !== 0 &&
      parseInt(greenColorChartParams.max) !== 0
    )
      return "green";
    else if (
      currentPointer >= parseInt(orangeColorChartParams.min) &&
      currentPointer <= parseInt(orangeColorChartParams.max) &&
      parseInt(orangeColorChartParams.min) !== 0 &&
      parseInt(orangeColorChartParams.max) !== 0
    )
      return "orange";
    else if (
      currentPointer >= parseInt(redColorChartParams.min) &&
      currentPointer <= parseInt(redColorChartParams.max) &&
      parseInt(redColorChartParams.min) !== 0 &&
      parseInt(redColorChartParams.max) !== 0
    )
      return "red";
    // else if (currentPointer >= parseInt(blackColorChartParams.min) && currentPointer <= parseInt(blackColorChartParams.max)) return 'black';
    else if (
      currentPointer > parseInt(blackColorChartParams.min) &&
      parseInt(blackColorChartParams.min) !== 0
    )
      return "black";
  }

  // console.log(totalPitchesLength, 'totalPitchesLength')
  const alwaysTwelvePitches =
    totalPitchesLength < 12
      ? 12 - totalPitchesLength + totalPitchesLength
      : totalPitchesLength;
  var currentCardBox = {};
  var cardsData = [];
  function renderCards() {
    var counterTimeShift = 0;
    // console.log(dataGroupByProduct, 'dataGroupByProductUpdate')
    for (var i = alwaysTwelvePitches; i >= 1; i--) {
      // if (lodash.get(dataGroupByProduct, i - 1, []).length === 0) {
      //   console.log('dataGroupByProduct', lodash.get(dataGroupByProduct, i - 1, []).length)
      //   continue;
      // }
      // @TODO: totalPitchesLength
      var color = filterColor(i);
      counterTimeShift++;
      // var endPitchTime = moment(shiftEndTime.format('HH:mm'), format);
      // var startPitchTime = moment(shiftEndTime.subtract(pitchTime, 'minutes').format('HH:mm'), format);
      // console.log(totalPitchesLength, currentTime.format('HH:mm:ss'), startPitchTime.format('HH:mm:ss'), endPitchTime.format('HH:mm:ss'), 'hello', currentTime.isBetween(startPitchTime, endPitchTime))

      var startPitchTime = moment(shiftMovingTime.format("HH:mm"), format);
      var endPitchTime = moment(
        shiftMovingTime.add(pitchTime, "minutes").format("HH:mm"),
        format
      );

      //@TODO: check it's changing original shiftStartTime, like adding
      // console.log(totalPitchesLength, currentTime.format('HH:mm:ss'), startPitchTime.format('HH:mm:ss'), endPitchTime.format('HH:mm:ss'), 'hello-1', currentTime.isAfter(startPitchTime), currentTime.isBetween(startPitchTime, endPitchTime))

      // if (currentTime.isBetween(moment(shiftStartTime.format('HH:mm'), format), moment(shiftEndTime.format('HH:mm'), format))) {

      // currentTime.isBetween(moment(shiftStartTime.format('HH:mm'), format), moment(shiftEndTime.format('HH:mm'), format))
      // console.log(shiftStartTime.format('HH:mm'), shiftMovingTime.format('HH:mm'), 'hellow');

      // @TODO: Skip Break Time
      var breakStatus = false;
      for (var singleBreak = 0; singleBreak < allBreaks.length; singleBreak++) {
        let breakStart = allBreaks[singleBreak][0];
        let breakEnd = allBreaks[singleBreak][1];
        // currentTime.isBetween(breakStart, breakEnd) ||
        // currentTime.isAfter(breakStart),
        console.log(
          totalPitchesLength,
          currentTime.format("HH:mm:ss"),
          startPitchTime.format("HH:mm:ss"),
          endPitchTime.format("HH:mm:ss"),
          "hello-1",

          currentTime.isBetween(startPitchTime, endPitchTime),
          currentTime.isAfter(endPitchTime) && currentTime.isAfter(breakEnd),
          moment.duration(breakEnd.diff(breakStart))
        );

        if (currentTime.isBetween(breakStart, breakEnd)) {
          // startPitchTime -> add difference of breakStart, breakEnd) -> 13:30 + 5 = 13:35
          // endPitchTime -> add difference of breakStart, breakEnd) -> 13:35 + 5 = 13:40
          // startPitchTime.add() -> add difference of breakStart, breakEnd)
          breakStatus = true;
        }

        //  if (currentTime.isBetweenOrAfter(breakStart, breakEnd)) {
        // setMovingBreakSum(difference(breakStart, BreakEnd)); // 0, 1st break -> 5,  2nd break -> 10
      }

      // console.log('breakStatus', breakStatus);
      // console.log('sum of break mintes', sumOfBreaks);
      // console.log('start pitch time', startPitchTime);
      // console.log('end pitch time', endPitchTime);
      // console.log('active shift period', activeShiftPeriod);
      // console.log('counter time shift', counterTimeShift);
      // console.log('track shift period', trackShiftsDone);
      // console.log('start pitch time', startPitchTime);
      // console.log('end pitch time', endPitchTime)
      // console.log('shift start time', shiftStartTime);
      // console.log('shift end time', shiftEndTime);
      // console.log('all breaks', allBreaks);
      // if (currentTime.isBetween(startPitchTime, endPitchTime) && breakStatus === false) {
      if (
        currentTime.isBetween(startPitchTime, endPitchTime) &&
        breakStatus === false
      ) {
        // also check for length of allShiftsData
        activeShiftPeriod = counterTimeShift - trackShiftsDone;
        headerWidgetColor = filterColor(activeShiftPeriod);
        // console.log(trackShiftsDone, "::::::::loop")
        // if (!headerWidgetColor) headerWidgetColor = filterColor(maxColorPitch);
        // console.log(headerWidgetColor, activeShiftPeriod, i, trackShiftsDone, maxColorPitch, counterTimeShift, 'here is active', currentTime.format('HH:mm:ss'), startPitchTime.format('HH:mm:ss'), endPitchTime.format('HH:mm:ss'))
      }
      // }
      var dataGroupByProductRandom = lodash.get(dataGroupByProduct, i - 1, []);
      // console.log(dataGroupByProductRandom, 'dataGroupByProductRandom');

      // dataGroupByProductRandom.filter(l => {
      //   if (l.productCount === 0)
      //     continue;
      // });

      // if breaktime passed or in between(startPitchTime.format('HH:mm:ss'), endPitchTime.format('HH:mm:ss') don't push card
      // TODO:: skip card inBetween or After break time
      cardsData.push(
        <CWidgetBrand
          style={{ marginLeft: "5px", width: "150px" }}
          color={color}
          shift={
            i <= activeShiftPeriod
              ? dataGroupByProductRandom
                  .map((k) => k.productCount)
                  .reduce((a, b) => a + b, 0)
              : undefined
          }
          cardName={
            i <= activeShiftPeriod
              ? lodash
                  .get(dataGroupByProduct, i - 1, [])
                  .map((product, index) => {
                    currentCardBox =
                      i === 1 && dataGroupByProductRandom.length - 1 === index
                        ? product
                        : {};
                    // console.log(product.productCount, product, color, 'singleProductColor')
                    return (
                      <span
                        className="content-center"
                        style={{
                          backgroundColor: product.color,
                          padding:
                            i === 1 &&
                            dataGroupByProductRandom.length - 1 === index
                              ? ""
                              : "5px",
                          // marginLeft: '5px',
                          // width: '10px',
                          textAlign: "center",
                          textWeight: "bold",
                          fontSize: "24px",
                          color: "white",
                          // display: 'flex',
                          // flexDirection: 'column',
                          display: "inline-block",
                          width: "55px",
                          // fontSize: '30px',
                          margin: "5px",
                          border:
                            i === 1 &&
                            dataGroupByProductRandom.length - 1 === index
                              ? "5px solid black"
                              : "inherit",
                        }}
                      >
                        {product.productCount}
                      </span>
                    );
                  })
              : []
          }
          leftHeader="459"
          leftFooter="feeds"
        ></CWidgetBrand>
      );
    }
  }
  if (
    currentTime.isBetween(
      moment(shiftStartTime.format("HH:mm"), format),
      moment(shiftEndTime.format("HH:mm"), format)
    )
  ) {
    renderCards();
  }
  // cardsData.splice(0, totalPitchesLength - (12) + (12 - maxColorPitch));
  cardsData.splice(0, totalPitchesLength - 12);
  // console.log(totalPitchesLength, cardsData.length, blackColorChartParams.min, 'cardsData')
  // console.log(allShiftsData, currentCardBox, 'currentCardBox')
  // console.log(currentCardBox, 'currentCardBox')
  const kanbanBoxWidgetStyle = { fontSize: "15px" };
  const metricStyle = { fontWeight: "bold" };
  if (
    !currentTime.isBetween(
      moment(shiftStartTime.format("HH:mm"), format),
      moment(shiftEndTime.format("HH:mm"), format)
    )
  )
    return (
      <div style={{ textAlign: "center", marginTop: "10%" }}>
        <h1>Out of Shift</h1>
        {/* <h1>{currentTime.format("hh:mm:ss")}</h1> */}
      </div>
    );
  // if (Object.values(dbChartParams).length === 0)
  //   return (
  //     <div style={{ textAlign: "center", marginTop: "10%" }}>
  //       <h1>Please set Parameters</h1>
  //     </div>
  //   );
  if (!localStorage.getItem("params"))
    return (
      <div style={{ textAlign: "center", marginTop: "10%" }}>
        <h1>Please set Parameters</h1>
      </div>
    );
  if (cardsData.length === 0)
    return (
      <div style={{ textAlign: "center", marginTop: "10%" }}>
        <h1>Loading...</h1>
      </div>
    );
  if (!weekDaysRun.includes(moment().format("ddd")))
    return (
      <div style={{ textAlign: "center", marginTop: "10%" }}>
        <h1>No Shift for Today, Today not Set in Params.</h1>
      </div>
    );
  if (inBetweenBreaks)
    return (
      <div style={{ textAlign: "center", marginTop: "10%" }}>
        <h1>System in Break, Don't push the button.</h1>
        {/* <h1>{currentTime.format("hh:mm:ss")}</h1> */}
      </div>
    );
  return (
    <CFormGroup>
      {
        <CButton
          hidden
          id="newPieceDoneButton"
          style={{ float: "right", height: "80px" }}
          size="lg"
          onClick={() => {
            if (activeShiftPeriod > 0) {
              updateDonePieces(donePieces + 1);
            }
          }}
          color="danger"
        >
          Press
          <br /> Button
        </CButton>
      }
      <CRow className={"d-flex justify-content-between"}>
        <CCol>
          <CWidgetSimple
            style={{ backgroundColor: "rgb(214,51,132)", color: "white" }}
            header="Day"
            text={
              <>
                <strong>
                  {moment().format("dddd")}
                  {"\n"}
                  {moment().format("MMMM")}
                </strong>
                <strong>
                  {", "}
                  {moment().date()}
                </strong>
              </>
            }
          />
        </CCol>
        <CCol>
          <CWidgetSimple
            style={{
              backgroundColor: headerWidgetColor ? headerWidgetColor : "green",
              color: "white",
            }}
            header="Total Pieces"
            text={totalQuantity}
          />
        </CCol>
        <CCol>
          <CWidgetSimple
            style={{
              backgroundColor: headerWidgetColor ? headerWidgetColor : "green",
              color: "white",
            }}
            header="Done Pieces"
            text={donePieces}
          />
        </CCol>
        <CCol>
          <CWidgetSimple
            style={{
              backgroundColor: headerWidgetColor ? headerWidgetColor : "green",
              color: "white",
            }}
            header="Pending Pieces"
            text={totalQuantity - donePieces}
          />
        </CCol>
        <CCol>
          <CWidgetSimple
            style={{
              backgroundColor: headerWidgetColor ? headerWidgetColor : "green",
              color: "white",
            }}
            header="Pieces/Hour (On Time)"
            text={parseFloat(piecesPerHourOnTime).toFixed(1)}
          />
        </CCol>
        <CCol>
          <CWidgetSimple
            style={{
              backgroundColor: headerWidgetColor ? headerWidgetColor : "green",
              color: "white",
            }}
            header="Pieces/Hour (Day)"
            text={parseFloat(piecesPerHourOnDay).toFixed(1)}
          />
        </CCol>
        <CCol>
          <CWidgetSimple
            style={{
              backgroundColor: headerWidgetColor ? headerWidgetColor : "green",
              color: "white",
            }}
            header="Pieces/Hour (Target)"
            text={parseFloat((1 / takTimeMinutes) * 60).toFixed(0)}
          />
        </CCol>
      </CRow>

      {/* <h1>PERS012 Time: {moment().format("hh:mm")}pm</h1> */}
      <h1>PERS012</h1>
      <hr style={{ borderTop: "3px solid rgba(0, 0, 21, 0.2)" }}></hr>
      <CRow style={{ float: "right" }}>
        {/* <CCol xl={12}> */}
        {cardsData}
        {/* </CCol> */}
      </CRow>
      <CRow
        className={" mt-2 justify-content-end"}
        style={{ display: "block" }}
      >
        {/* ......................... */}
        {/* <CCol lg="3" xl="3">
          <CWidgetSimple
            header="PIEZAS DE PRODUCTO"
            text={
              <div style={{ textAlign: "left" }} className="widgetBackground">
                <p style={kanbanBoxWidgetStyle}>
                  número teórico de piezas: <span style={metricStyle}>{0}</span>{" "}
                </p>
                <p style={kanbanBoxWidgetStyle}>
                  número real de piezas: <span style={metricStyle}>{0}</span>{" "}
                </p>
              </div>
            }
            style={{
              backgroundColor: "green",
              color: "white",
            }}
          ></CWidgetSimple>
        </CCol> */}
        {/* ........................ */}
        <CCol lg="3" xl="3" xs={{ offset: 9, size: 3 }}>
          <CWidgetSimple
            header="Kanban en curs"
            text={
              <div style={{ textAlign: "left" }} className="widgetBackground">
                <p style={kanbanBoxWidgetStyle}>
                  Ordre de fabricació:{" "}
                  <span style={metricStyle}>
                    {lodash.get(currentCardBox, "record.order_num_VHMFNO_D")}
                  </span>{" "}
                </p>
                <p style={kanbanBoxWidgetStyle}>
                  Referència del producte:{" "}
                  <span style={metricStyle}>
                    {lodash.get(currentCardBox, "record.part_num_VHPRNO_C")}
                  </span>{" "}
                </p>
                <p style={kanbanBoxWidgetStyle}>
                  Descripció del producte:{" "}
                  <span style={metricStyle}>
                    {lodash.get(currentCardBox, "record.description_VHTXT1_W")}
                  </span>{" "}
                </p>
                <p style={kanbanBoxWidgetStyle}>
                  Quantitat a produir total:{" "}
                  <span style={metricStyle}>
                    {lodash.get(currentCardBox, "total")}
                  </span>{" "}
                </p>
                <p style={kanbanBoxWidgetStyle}>
                  Quantitat que falta per produir:{" "}
                  <span style={metricStyle}>
                    {pendingPiecesPerProduct +
                      lodash.get(currentCardBox, "total") -
                      donePieces}
                  </span>{" "}
                </p>
                <p style={kanbanBoxWidgetStyle}>
                  Quantitat per caixa:{" "}
                  <span style={metricStyle}>
                    {parseFloat(
                      lodash.get(currentCardBox, "productsPerBox") // this is null value not undefined please check
                    ).toFixed(2)}
                  </span>{" "}
                </p>
              </div>
            }
            style={{
              backgroundColor: lodash.get(currentCardBox, "color")
                ? lodash.get(currentCardBox, "color")
                : "#f26430",
              color: "white",
            }}
          ></CWidgetSimple>
        </CCol>
        {/* ..................... */}
      </CRow>
    </CFormGroup>
  );
};

export default Users;
