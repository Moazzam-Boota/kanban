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
    // url: '192.168.1.53:5984',
    url: 'localhost:5984',
    user: 'admin',
    pass: 'admin',
    db: 'excel5',
};

var excel = new PouchDB(dbDetails.db);

var remoteURL = 'http://' + dbDetails.user + ':' + dbDetails.pass + '@' + dbDetails.url + '/' + dbDetails.db;

var remoteDB = new PouchDB(`${remoteURL}`);

function getDocs(res) {
    excel.allDocs({
        include_docs: true,
        attachments: true,
        // startkey: new Date().toISOString().slice(0, 10),
        // endkey: new Date().toISOString().slice(0, 10),
    }, function (err, response) {
        console.log(response);
        res.send(response)
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
                    'quantity_VHROQ_?': '10000',
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

        excel.sync(remoteDB);

        Promise.all(promises).then(() => {
            excel.sync(remoteDB);
            getDocs(res);
            console.log("Done")
        }).catch((err) => {
            console.log("An error occurred while inserting data", err);
        });
    });
});

app.get('/api/intial-excel-upload', (req, res) => {

    getDocs(res);
    
});

app.listen(port, () => console.log(`Listening on port ${port}`));