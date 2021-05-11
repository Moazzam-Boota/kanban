const express = require('express');
const PouchDB = require('pouchdb');
const Excel = require('exceljs');
PouchDB.plugin(require('pouchdb-find'));
const moment = require('moment');

var cors = require('cors')
const fileUpload = require('express-fileupload');
const app = express();
const port = process.env.PORT || 5000;

const schedule = require("node-schedule");
const lodash = require('lodash');

app.use(cors());
app.use(express.json({ limit: '200mb' }));
app.use(fileUpload());

const dbDetails = {
    // url: '192.168.1.21:5984',
    url: 'localhost:5984',
    user: 'admin',
    pass: 'admin',
    db: 'excel_files',
};

var pouchDBConnection = new PouchDB(dbDetails.db, { size: 100 });
pouchDBConnection.setMaxListeners(50);
var remoteURL = 'http://' + dbDetails.user + ':' + dbDetails.pass + '@' + dbDetails.url + '/' + dbDetails.db;

var remoteDB = new PouchDB(`${remoteURL}`);

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
            console.log(reversedShiftRows)
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
schedule.scheduleJob(" * * * * * ", function () {
    var downloadTime = [];
    remoteDB.find({
        selector: { type: 'shifts' }
    }).then(function (res) {
        res.docs.map(i => {
            downloadTime.push(i)
        });
        var sortedShifts = downloadTime.sort(function compare(a, b) {
            var dateA = new Date(a.values.createdAt);
            var dateB = new Date(b.values.createdAt);
            return dateA - dateB;
        });
        var reversedsortedShifs = sortedShifts.reverse();
        var timeString = lodash.get(reversedsortedShifs, '[0].values.downloadTime', '');
        // if (timeString) {

        //     var hours = timeString.substr(0, 2);
        //     var minutes = timeString.substr(3, 4);
        //     var seconds = 5;
        //     const time = new Date();
        //     var year = time.getFullYear();
        //     var month = time.getMonth();
        //     var day = time.getDate();
        //     const downloadingTime = new Date(year, month, day, hours, minutes, seconds);
        //     schedule.scheduleJob(downloadingTime, function () {
        //         var AWS = require('aws-sdk');
        //         var fs = require('fs');
        //         AWS.config.update(
        //             {
        //                 accessKeyId: "AKIAQA425EAVAE6OMI76",
        //                 secretAccessKey: "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",
        //                 region: 'eu-west-1'
        //             }
        //         );
        //         var s3 = new AWS.S3();
        //         var options = {
        //             Bucket: 'bestplantbucket',
        //             Key: 'META_SQL.xlsm',
        //         };
        //         s3.getObject(options, function (err, data) {
        //             if (err) {
        //                 throw err
        //             }
        //             fs.writeFileSync('./aws-files/' + options.Key, data.Body)
        //             console.log('file downloaded successfully')

        //             var workbook = new Excel.Workbook();

        //             workbook.xlsx.readFile('aws-files/META_SQL.xlsm')
        //                 .then(function () {
        //                     var worksheet = workbook.getWorksheet('Hoja1');

        //                     const promises = [];
        //                     worksheet.eachRow(function (row, rowNumber) {

        //                         var rowsData = [];

        //                         if (row.getCell('EF').value === "PERS044") {

        //                             rowsData.push({
        //                                 row_num: rowNumber,
        //                                 'shift_PPSHFT_IS': row.getCell('IS').value,
        //                                 'order_num_VHMFNO_D': row.getCell('D').value,
        //                                 'part_num_VHPRNO_C': row.getCell('C').value,
        //                                 'description_VHTXT1_W': row.getCell('W').value,
        //                                 'quantity_VHOROQ_AH': row.getCell('AH').value,
        //                                 'line_VOPLGR_EF': row.getCell('EF').value,
        //                                 'start_time_VHMSTI_CG': row.getCell('CG').value,
        //                                 'end_time_VHMFTI_CH': row.getCell('CH').value,
        //                                 'start_date_VHFSTD_Y': row.getCell('Y').value,
        //                                 'end_date_VHFFID_Z': row.getCell('Z').value,
        //                                 'per_box_qty_UNITCAIXA_IT': row.getCell('IT').value,
        //                                 'per_pallet_qty_UNITAPALET_IU': row.getCell('IU').value,
        //                                 'per_pack_sec_VOIPITI_FM': row.getCell('FM').value,
        //                             });

        //                             var data = {
        //                                 _id: new Date().toISOString().slice(0, 10) + Math.random().toString(36),
        //                                 type: 'excel',
        //                                 createdAt: moment().seconds(0).milliseconds(0).toISOString(),
        //                                 values: rowsData
        //                             };

        //                             const promise = pouchDBConnection
        //                                 .put(data, { force: true }).then(function (response) {
        //                                     rowsData = [];
        //                                 }).then(function (err) {

        //                                 }); // <-- whatever async operation you have here
        //                             promises.push(promise);

        //                         }

        //                     });

        //                     Promise.all(promises).then(() => {
        //                         // pouchDBConnection.sync(remoteDB);
        //                         getDocs(res, "excel", true);
        //                     }).catch((err) => {
        //                     });
        //                 });
        //         })

        //     })
        // }

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
                    .put(data, { force: true }).then(function (response) {
                        rowsData = [];
                    }).then(function (err) {

                    }); // <-- whatever async operation you have here
                promises.push(promise);

            }

        });

        Promise.all(promises).then(() => {
            // pouchDBConnection.sync(remoteDB);
            getDocs(res, "excel");
        }).catch((err) => {
        });
    });
});

app.post('/api/push-shifts-data', (req, res) => {

    const promises = [];
    var ShiftsData = {
        _id: new Date().toISOString().slice(0, 10) + Math.random().toString(36),
        type: 'shifts',
        values: req.body
    };
    const promise = pouchDBConnection
        .put(ShiftsData, { force: true }).then(function (response) {
        }).then(function (err) {

        });
    promises.push(promise);
    Promise.all(promises).then(() => {
        pouchDBConnection.sync(remoteDB);
        getDocs(res);
    }).catch((err) => {
    });
    // pouchDBConnection.sync(remoteDB);

});
app.get('/api/intial-excel-upload', (req, res) => {

    getDocs(res, "excel");

});
app.get('/api/get-chart-data', (req, res) => {
    getDocs(res, "shifts");
});

// app.get('/api/excel-upload-auto', (req, res) => {
//     var AWS = require('aws-sdk');
//     var fs = require('fs');
//     AWS.config.update(
//         {
//             accessKeyId: "AKIAQA425EAVAE6OMI76",
//             secretAccessKey: "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",
//             region: 'eu-west-1'
//         }
//     );
//     var s3 = new AWS.S3();
//     var options = {
//         Bucket: 'bestplantbucket',
//         Key: 'META_SQL (1).xlsm',
//     };
//     s3.getObject(options, function (err, data) {
//         if (err) {
//             throw err
//         }
//         fs.writeFileSync('./aws-files/' + options.Key, data.Body)
//         console.log('file downloaded successfully')
//     })
//     res.send("true");
//     // res.attachment('Dades sist Sequenciador MVP4 ruben 3 12.04.21.xlsx');
//     // var fileStream = s3.getObject(options).createReadStream();
//     // fileStream.pipe(res);
//     //     res.attachment('Dades sist Sequenciador MVP4 ruben 3 12.04.21.xlsx');
//     //     var fileStream = s3.getObject(options).createReadStream();
//     //     fileStream.pipe(res);
// });

app.listen(port, () => console.log(`Listening on port ${port}`));


// *****************************************************************************
// ************************ SOCKET Button Implmentation ************************ 
// *****************************************************************************

const http = require("http");
const socketIo = require("socket.io");
const socketPort = process.env.PORT || 4001;
const router = express.Router();

router.get("/", (req, res) => {
    res.send({ response: "I am alive" }).status(200);
});

app.use(router);

const server = http.createServer(app);

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
var Gpio = require('onoff').Gpio; //include onoff to interact with the Gpio
var LED_RED = new Gpio('21', 'out'); //use Gpio pin 21 as output for LED RED
var LED_GREEN = new Gpio('20', 'out'); //use Gpio pin 20 as output for LED GREEN
//var pushButton = new Gpio('26', 'in', 'both'); //use Gpio pin 26 as input, and 'both' button presses, and releases should be handled
var pushButton = new Gpio('26', 'in', 'rising', { debounceTimeout: 10 });

io.on("connection", (socket) => {
    console.log("New client connected");
    // if (interval) {
    //     clearInterval(interval);
    // }
    // interval = setInterval(() => getApiAndEmit(socket), 1000);


    var lightvalue = 0; // get from db
    var countValue = 0;
    pushButton.watch(function (err, value) { //Watch for hardware interrupts on pushButton
        if (err) { //if an error
            console.error('There was an error', err); //output error message to console
            return;
        }
        // lightvalue = value;

        countValue = countValue + 1;

        if (countValue === 2) {
            lightvalue = lightvalue + 1;
            socket.emit('lightgreen', lightvalue); //send button status to client
            // socket.emit('lightred', lightvalue); //send button status to client
            countValue = 0;
        }
    });
    socket.on('lightgreen', function (data) { //get light switch status from client
        lightvalue = data;
        if (lightvalue != LED_GREEN.readSync()) { //only change LED_GREEN if status has changed
            LED_GREEN.writeSync(lightvalue); //turn LED_GREEN on or off
        }
    });
    socket.on('lightred', function (data) { //get light switch status from client
        lightvalue = data;
        if (lightvalue != LED_RED.readSync()) { //only change LED_RED if status has changed
            LED_RED.writeSync(lightvalue); //turn LED_RED on or off
        }
    });


    socket.on("disconnect", () => {
        console.log("Client disconnected");
        clearInterval(interval);
    });
});

process.on('SIGINT', function () { //on ctrl+c
    LED_RED.writeSync(0); // Turn LED_RED off
    LED_RED.unexport(); // Unexport LED_RED Gpio to free resources
    LED_GREEN.writeSync(0); // Turn LED_GREEN off
    LED_GREEN.unexport(); // Unexport LED_GREEN Gpio to free resources
    pushButton.unexport(); // Unexport Button Gpio to free resources
    process.exit(); //exit completely
});

server.listen(socketPort, () => console.log(`Listening on port ${socketPort}`));