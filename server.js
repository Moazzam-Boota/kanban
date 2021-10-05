const express = require('express');
const PouchDB = require('pouchdb');
const Excel = require('exceljs');
PouchDB.plugin(require('pouchdb-find'));
const moment = require('moment');
// const PouchDB2 = require('pouchdb-browser');
var cors = require('cors')
const fileUpload = require('express-fileupload');
const app = express();
const port = process.env.PORT || 5000;

const schedule = require("node-schedule");
const lodash = require('lodash');

app.use(cors());
app.use(express.json({
    limit: '200mb'
}));
app.use(fileUpload());

const dbDetails = {
    // url: '192.168.1.21:5984',
    url: 'localhost:5984',
    user: 'admin',
    pass: 'admin',
    db: 'excel_files',
};

var pouchDBConnection = new PouchDB(dbDetails.db, {
    size: 100
});
pouchDBConnection.setMaxListeners(100);
var remoteURL = 'http://' + dbDetails.user + ':' + dbDetails.pass + '@' + dbDetails.url + '/' + dbDetails.db;

var remoteDB = new PouchDB(`${remoteURL}`);
remoteDB.setMaxListeners(100);

function getDocs(res, type, cronjob = false) {
    pouchDBConnection.sync(remoteDB);
    pouchDBConnection.allDocs({
        include_docs: true,
        attachments: true
    }, function (err, response) {
        var filterRows = [];
        var excelRows = [];
        let filterRowsMaxDate = response.rows.filter(i => i.doc.type === 'excel').map(d => moment(d.doc.createdAt)),
            singleMaxDate = moment.max(filterRowsMaxDate);

        response.rows.map(i => {
            if (i.doc.type === 'shifts') {
                filterRows.push(i.doc);
            }
            if (i.doc.type === 'excel' && singleMaxDate.isSame(moment(i.doc.createdAt))) {
                excelRows.push(i.doc);
            }
        });

        if (type === 'shifts') {
            var shiftRows = filterRows.sort(function compare(a, b) {
                var dateA = new Date(a.values.createdAt);
                var dateB = new Date(b.values.createdAt);
                return dateA - dateB;
            });
            var reversedShiftRows = shiftRows.reverse();
            res.send([reversedShiftRows[0]]);
            // console.log(reversedShiftRows)
        }
        if (type === 'excel') {
            if (cronjob) console.log('Cron Job Excel Records Saved Successfully!')
            if (!cronjob) res.send(excelRows)
        }
        pouchDBConnection.sync(remoteDB);

        if (err) { }
        // handle result
    });
}

function deleteDocs(type) {
    remoteDB.find({
        selector: {
            type: type
        }
    }).then(function (res) {
        // console.log(res)
        res.docs.map(k => {
            remoteDB.remove(k)

        })
    });
}

// var scheduleDownloadingTime = new Date(year, month, day, hours, minutes, seconds);
// var scheduleDownloadingTime = new Date();
schedule.scheduleJob(" * * * * * ", function () {
    var downloadTime = [];
    remoteDB.find({
        selector: {
            type: 'shifts'
        }
    }).then(function (res) {
        // console.log(res)
        res.docs.map(i => {
            downloadTime.push(i)
        });
        var sortedShifts = downloadTime.sort(function compare(a, b) {
            var dateA = new Date(a.values.createdAt);
            var dateB = new Date(b.values.createdAt);
            return dateA - dateB;
        });
        var reversedsortedShifs = sortedShifts.reverse();
        var timeString = "";
        timeString = lodash.get(reversedsortedShifs, '[0].values.downloadTime', '');
        // var currentTime = new Date().getHours() + ':' + new Date().getMinutes();
        // console.log(new Date().getHours() + ':' + new Date().getMinutes(), 'timeString')
        // console.log(timeString, 'timeString', currentTime, moment().format('HH:mm'), timeString === moment().format('HH:mm'))
        if (timeString === moment().format('HH:mm')) {

            var hours = timeString.substr(0, 2);
            // var hours = '14';
            // var minutes = '00';
            var minutes = timeString.substr(3, 4);
            var seconds = 5;
            const time = new Date();
            var year = time.getFullYear();
            var month = time.getMonth();
            var day = time.getDate();
            const downloadingTime = new Date(year, month, day, hours, minutes, seconds);
            // console.log(downloadingTime, moment(), 'downloadingTime')
            schedule.scheduleJob(downloadingTime, function () {
                // console.log('cron runs')
                var AWS = require('aws-sdk');
                var fs = require('fs');
                AWS.config.update({
                    accessKeyId: "AKIAQA425EAVAE6OMI76",
                    secretAccessKey: "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",
                    region: 'eu-west-1'
                });
                var s3 = new AWS.S3();
                var options = {
                    Bucket: 'bestplantbucket',
                    Key: 'META_SQL.xlsm',
                };
                s3.getObject(options, function (err, data) {
                    if (err) {
                        throw err
                    }
                    fs.writeFileSync('/home/gestlean/kanban/aws-files/' + options.Key, data.Body)
                    console.log('file downloaded successfully')

                    var workbook = new Excel.Workbook();

                    workbook.xlsx.readFile('/home/gestlean/kanban/aws-files/META_SQL.xlsm')
                        .then(function () {
                            var worksheet = workbook.getWorksheet('Hoja1');

                            const promises = [];
                            worksheet.eachRow(function (row, rowNumber) {

                                var rowsData = [];

                                if (row.getCell('EF').value === "PERS044") {

                                    rowsData.push({
                                        row_num: rowNumber,
                                        'shift_PPSHFT_IS': row.getCell('IS').value,
                                        'order_num_VHMFNO_D': row.getCell('D').value,
                                        'part_num_VHPRNO_C': row.getCell('C').value,
                                        'description_VHTXT1_W': row.getCell('W').value,
                                        'quantity_VHOROQ_AH': row.getCell('AH').value,
                                        'line_VOPLGR_EF': row.getCell('EF').value,
                                        'start_time_VHMSTI_CG': row.getCell('CG').value,
                                        'end_time_VHMFTI_CH': row.getCell('CH').value,
                                        'start_date_VHFSTD_Y': row.getCell('Y').value,
                                        'end_date_VHFFID_Z': row.getCell('Z').value,
                                        'per_box_qty_UNITCAIXA_IT': row.getCell('IT').value,
                                        'per_pallet_qty_UNITAPALET_IU': row.getCell('IU').value,
                                        'per_pack_sec_VOIPITI_FM': row.getCell('FM').value,
                                    });

                                    var data = {
                                        _id: new Date().toISOString().slice(0, 10) + Math.random().toString(36),
                                        type: 'excel',
                                        createdAt: moment().seconds(0).milliseconds(0).toISOString(),
                                        values: rowsData
                                    };

                                    const promise = pouchDBConnection
                                        .put(data, {
                                            force: true
                                        }).then(function (response) {
                                            rowsData = [];
                                        }).then(function (err) {

                                        }); // <-- whatever async operation you have here
                                    promises.push(promise);

                                }

                            });

                            Promise.all(promises).then(() => {
                                // pouchDBConnection.sync(remoteDB);
                                getDocs(res, "excel", true);
                            }).catch((err) => { });
                        });
                })

            })
        }
        timeString = "";

    });
});
app.post('/api/excel-upload', (req, res) => {

    var workbook = new Excel.Workbook();
    workbook.xlsx.load(req.files.file.data).then(function () {

        //Get sheet by Name
        var worksheet = workbook.getWorksheet('Hoja1'); //Hoja1

        const promises = [];
        worksheet.eachRow(function (row, rowNumber) {

            var rowsData = [];

            if (row.getCell('EF').value === "PERS044") {

                rowsData.push({
                    row_num: rowNumber,
                    'shift_PPSHFT_IS': row.getCell('IS').value,
                    'order_num_VHMFNO_D': row.getCell('D').value,
                    'part_num_VHPRNO_C': row.getCell('C').value,
                    'description_VHTXT1_W': row.getCell('W').value,
                    'quantity_VHOROQ_AH': row.getCell('AH').value,
                    'line_VOPLGR_EF': row.getCell('EF').value,
                    'start_time_VHMSTI_CG': row.getCell('CG').value,
                    'end_time_VHMFTI_CH': row.getCell('CH').value,
                    'start_date_VHFSTD_Y': row.getCell('Y').value,
                    'end_date_VHFFID_Z': row.getCell('Z').value,
                    'per_box_qty_UNITCAIXA_IT': row.getCell('IT').value,
                    'per_pallet_qty_UNITAPALET_IU': row.getCell('IU').value,
                    'per_pack_sec_VOIPITI_FM': row.getCell('FM').value,
                });

                var data = {
                    _id: new Date().toISOString().slice(0, 10) + Math.random().toString(36),
                    type: 'excel',
                    createdAt: moment().seconds(0).milliseconds(0).toISOString(),
                    values: rowsData
                };

                const promise = pouchDBConnection
                    .put(data, {
                        force: true
                    }).then(function (response) {
                        rowsData = [];
                    }).then(function (err) {

                    }); // <-- whatever async operation you have here
                promises.push(promise);

            }

        });

        Promise.all(promises).then(() => {
            // pouchDBConnection.sync(remoteDB);
            getDocs(res, "excel");
        }).catch((err) => { });
    });
});

// const rule = new schedule.RecurrenceRule();
// rule.dayOfWeek = [0, new schedule.Range(4, 6)];
// rule.hour = 17;
// rule.minute = 0;

// const weekDays = {
//     'Sun': 0,
//     'Mon': 1,
//     'Tue': 2,
//     'Wed': 3,
//     'Thu': 4,
//     'Fri': 5,
//     'Sat': 6
// };
// schedule.scheduleJob(rule, function () {
//     console.log('Today is recognized by Rebecca Black!');
// });

app.post('/api/push-shifts-data', (req, res) => {

    deleteDocs('shifts')

    const promises = [];
    var ShiftsData = {
        _id: new Date().toISOString().slice(0, 10) + Math.random().toString(36),
        type: 'shifts',
        values: req.body
    };
    // console.log('im here')
    // console.log(ShiftsData)
    // scheduleDownloadingTime = moment(req.body.downloadTime, 'HH:mm');
    // rule.dayOfWeek = req.body.PERS044[1].days.map(k => weekDays[k.value]).sort();
    // rule.hour = scheduleDownloadingTime.get('hours');
    // rule.minute = scheduleDownloadingTime.get('minutes');
    // console.log(rule, req.body.downloadTime, scheduleDownloadingTime.get('hours'), scheduleDownloadingTime.get('minutes'), 'req.body');
    const promise = pouchDBConnection
        .put(ShiftsData, {
            force: true
        }).then(function (response) { }).then(function (err) {
            console.log('params updated successfully')
        });
    promises.push(promise);
    Promise.all(promises).then(() => {
        pouchDBConnection.sync(remoteDB);
        getDocs(res);
    }).catch((err) => { });
    // pouchDBConnection.sync(remoteDB);

});

app.get('/api/intial-excel-upload', (req, res) => {

    getDocs(res, "excel");

});
app.get('/api/get-chart-data', (req, res) => {
    getDocs(res, "shifts");
});

app.listen(port, () => console.log(`Listening on port ${port}`));


// *****************************************************************************
// ************************ SOCKET Button Implmentation ************************ 
// *****************************************************************************

const http = require("http");
const socketIo = require("socket.io");
const socketPort = process.env.PORT || 4001;
const router = express.Router();

router.get("/", (req, res) => {
    res.send({
        response: "I am alive"
    }).status(200);
});

app.use(router);

const server = http.createServer(app);

const serialPort = require('serialport')
var previousTime = new Date().getTime();
const buttonPort = new serialPort('/dev/ttyUSB0', { baudRate: 110 })
var EventEmitter = require('events');

const io = socketIo(server, {
    cors: {
        origin: "*",
        // origin: "http://localhost:8080",
        methods: ["GET", "POST"],
        transports: ['websocket', 'polling'],
        credentials: true
    },
    allowEIO3: true
});

let interval;
// var Gpio = require('onoff').Gpio; //include onoff to interact with the Gpio
// var LED_RED = new Gpio('21', 'out'); //use Gpio pin 21 as output for LED RED
// var LED_GREEN = new Gpio('20', 'out'); //use Gpio pin 20 as output for LED GREEN
// var pushButton = new Gpio('26', 'in', 'both'); //use Gpio pin 26 as input, and 'both' button presses, and releases should be handled
// var pushButton = new Gpio('26', 'in', 'rising', { debounceTimeout: 10 });
var lightvalue = 0; // get from db
var triggerButton = new EventEmitter(); // Event used to send a packet to the Frontend when the button is pressed.

// Open socket with the Frontend:
io.on("connection", (socket) => {
    console.log("New client connected");

    triggerButton.on("triggerButton", function () {
        socket.emit('lightgreen', lightvalue); // Send button status to client
    });

    socket.on("disconnect", () => {
        console.log("Client disconnected");
        clearInterval(interval);
    });
});

// Open UART port for the button:
buttonPort.on("open", function () {
    // Send dummy data, used to detect when the button is pressed:
    setInterval(function () {
        buttonPort.write("\n", function (err, results) {
            // It happens when the button is not pressed.
        });
    }, 100);

    // Run when the button is pressed:
    buttonPort.on("data", function (data) {
        // Check whether enough time has passed from the previous button press:
        const currentTime = new Date().getTime();
        if (currentTime - previousTime > 500) {
            previousTime = currentTime;

            lightvalue = lightvalue + 1;
            triggerButton.emit("triggerButton");
        }
    });
});

// On CTRL+C:
process.on('SIGINT', function () {
    buttonPort.close(); // Close UART port.
    process.exit(); // Exit completely
});

/*buttonPort.on("open", function () {
    io.on("connection", (socket) => {
        console.log("New client connected");
        // if (interval) {
        //     clearInterval(interval);
        // }
        // interval = setInterval(() => getApiAndEmit(socket), 1000);

        var lightvalue = 0; // get from db
        // var countValue = 0;
        // var startPressButton = '';

        //socket.emit('lightgreen', -1); //send button status to client
        // Run when the button is pressed:
        buttonPort.on("data", function (data) {
            // Check whether enough time has passed from the previous button press:
            const currentTime = new Date().getTime();
            if (currentTime - previousTime > 500) {
                previousTime = currentTime;
                console.log('Button pressed');

                lightvalue = lightvalue + 1;
                socket.emit('lightgreen', lightvalue); //send button status to client
            }
        });
        
        // Interval to send continuous data to detect button being pressed:
        setInterval(function () {
            buttonPort.write("\n", function (err, results) {
                // It happens when the button is not pressed.
            });
        }, 100);

        // pushButton.watch(function (err, value) { //Watch for hardware interrupts on pushButton
        //     if (err) { //if an error
        //         console.error('There was an error', err); //output error message to console
        //         return;
        //     }
        // lightvalue = value;

        // var endPressButton = moment();
        // var diffInSeconds = moment.duration(endPressButton.diff(startPressButton)).asSeconds();
        // countValue = countValue + 1;

        // if (countValue === 2 && diffInSeconds < 5) {
        // if (diffInSeconds < 5) {

        // socket.emit('lightred', lightvalue); //send button status to client
        // countValue = 0;
        // } else if (diffInSeconds > 5) {
        // countValue = 1;
        //     startPressButton = moment();
        //     socket.emit('singleClick', 1);
        // } else {
        //     startPressButton = moment();
        //     socket.emit('singleClick', 0);
        // }
        // });
        // socket.on('lightgreen', function (data) { //get light switch status from client
        //     lightvalue = data;
        //     if (lightvalue != LED_GREEN.readSync()) { //only change LED_GREEN if status has changed
        //         LED_GREEN.writeSync(lightvalue); //turn LED_GREEN on or off
        //     }
        // });
        // socket.on('lightred', function (data) { //get light switch status from client
        //     lightvalue = data;
        //     if (lightvalue != LED_RED.readSync()) { //only change LED_RED if status has changed
        //         LED_RED.writeSync(lightvalue); //turn LED_RED on or off
        //     }
        // });


        socket.on("disconnect", () => {
            console.log("Client disconnected");
            clearInterval(interval);
        });
    });
});*/

// process.on('SIGINT', function () { //on ctrl+c
//     LED_RED.writeSync(0); // Turn LED_RED off
//     LED_RED.unexport(); // Unexport LED_RED Gpio to free resources
//     LED_GREEN.writeSync(0); // Turn LED_GREEN off
//     LED_GREEN.unexport(); // Unexport LED_GREEN Gpio to free resources
//     pushButton.unexport(); // Unexport Button Gpio to free resources
//     process.exit(); //exit completely
// });

server.listen(socketPort, () => console.log(`Listening on port ${socketPort}`));
