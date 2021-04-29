const express = require('express');
const PouchDB = require('pouchdb');
const Excel = require('exceljs');

var cors = require('cors')
const fileUpload = require('express-fileupload');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '200mb' }));
app.use(fileUpload());

const dbDetails = {
    // url: '192.168.1.15:5984',
    url: 'localhost:5984',
    user: 'admin',
    pass: 'admin',
    db: 'excel8',
};

var excel = new PouchDB(dbDetails.db);

var remoteURL = 'http://' + dbDetails.user + ':' + dbDetails.pass + '@' + dbDetails.url + '/' + dbDetails.db;

var remoteDB = new PouchDB(`${remoteURL}`);

function getDocs(res, type) {
    excel.sync(remoteDB);
    excel.allDocs({
        include_docs: true,
        attachments: true,
        // startkey: 'excel',
        endkey: 'excels',
    }, function (err, response) {
        var filterRows = [];
        // console.log(response.rows)
        response.rows.map(i => {
            if (i.doc.type === type) {
                filterRows.push(i.doc);

            }

        });
        // console.log(filterRows)
        res.send(filterRows)
        excel.sync(remoteDB);

        if (err) { return console.log(err); }
        // handle result
    });
}

app.post('/api/excel-upload', (req, res) => {

    var workbook = new Excel.Workbook();
    workbook.xlsx.load(req.files.file.data).then(function () {

        //Get sheet by Name
        var worksheet = workbook.getWorksheet('META_SQL');

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

                    "Date": new Date().toISOString().slice(0, 10)
                });

                var data = {
                    _id: new Date().toISOString().slice(0, 10) + Math.random().toString(36),
                    type: 'excel',
                    values: rowsData
                };

                const promise = excel
                    .put(data, { force: true }).then(function (response) {
                        rowsData = [];
                        console.log("Success", response)
                    }).then(function (err) {

                    }); // <-- whatever async operation you have here
                promises.push(promise);

            }

        });

        // excel.sync(remoteDB);

        Promise.all(promises).then(() => {
            excel.sync(remoteDB);
            getDocs(res, "excels");
            console.log("Done")
        }).catch((err) => {
            console.log("An error occurred while inserting data", err);
        });
    });
});

app.post('/api/push-shifts-data', (req, res) => {

    // console.log(req.body);
    const promises = [];
    var ShiftsData = {
        _id: new Date().toISOString().slice(0, 10) + Math.random().toString(36),
        type: 'shifts',
        values: req.body
    };
    const promise = excel
        .put(ShiftsData, { force: true }).then(function (response) {
            console.log("Success", response)
        }).then(function (err) {

        });
    promises.push(promise);
    Promise.all(promises).then(() => {
        excel.sync(remoteDB);
        getDocs(res);
        console.log("Done")
    }).catch((err) => {
        console.log("An error occurred while inserting data", err);
    });
    excel.sync(remoteDB);
    res.send("true")

});
app.get('/api/intial-excel-upload', (req, res) => {

    getDocs(res, "excels");

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

// let interval;
// var Gpio = require('onoff').Gpio; //include onoff to interact with the Gpio
// var LED_RED = new Gpio('21', 'out'); //use Gpio pin 21 as output for LED RED
// var LED_GREEN = new Gpio('20', 'out'); //use Gpio pin 20 as output for LED GREEN
// var pushButton = new Gpio('26', 'in', 'both'); //use Gpio pin 26 as input, and 'both' button presses, and releases should be handled


// io.on("connection", (socket) => {
//     console.log("New client connected");

//     var lightvalue = 0; //static variable for current status

//     pushButton.watch(function (err, value) { //Watch for hardware interrupts on pushButton
//         if (err) { //if an error
//             console.error('There was an error', err); //output error message to console
//             return;
//         }
//         // lightvalue = value;
//         lightvalue = lightvalue + 1;
//         socket.emit('lightgreen', lightvalue); //send button status to client
//         // socket.emit('lightred', lightvalue); //send button status to client
//     });

//     socket.on('lightgreen', function (data) { //get light switch status from client
//         lightvalue = data;
//         if (lightvalue != LED_GREEN.readSync()) { //only change LED_GREEN if status has changed
//             LED_GREEN.writeSync(lightvalue); //turn LED_GREEN on or off
//         }
//     });

//     socket.on('lightred', function (data) { //get light switch status from client
//         lightvalue = data;
//         if (lightvalue != LED_RED.readSync()) { //only change LED_RED if status has changed
//             LED_RED.writeSync(lightvalue); //turn LED_RED on or off
//         }
//     });

//     socket.on("disconnect", () => {
//         console.log("Client disconnected");
//         clearInterval(interval);
//     });
// });

// process.on('SIGINT', function () { //on ctrl+c
//     LED_RED.writeSync(0); // Turn LED_RED off
//     LED_RED.unexport(); // Unexport LED_RED Gpio to free resources
//     LED_GREEN.writeSync(0); // Turn LED_GREEN off
//     LED_GREEN.unexport(); // Unexport LED_GREEN Gpio to free resources
//     pushButton.unexport(); // Unexport Button Gpio to free resources
//     process.exit(); //exit completely
// });

// server.listen(socketPort, () => console.log(`Listening on port ${socketPort}`));