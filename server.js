const express = require('express');
// const bodyParser = require('body-parser');
// const NodeCouchDb = require('node-couchdb');
const PouchDB = require('pouchdb');
const Excel = require('exceljs');

var cors = require('cors')
const fileUpload = require('express-fileupload');
// const { update } = require('plotly.js');
const app = express();
const port = process.env.PORT || 5000;
app.use(cors());

app.use(express.json({ limit: '200mb' }));



app.use(fileUpload());

app.post('/api/excel-upload', (req, res) => {

    var excel = new PouchDB('excel5');
    // var remoteDB;
    // excel.allDocs({
    //     include_docs: true,
    //     attachments: true
    // }).then(function (doc) {
    //     console.log(doc)
    // })
    //     .catch(function (err) {
    //         console.log(err)
    //     })
    var remoteDB = new PouchDB('http://admin:admin@localhost:5984/excel5');
    // excel.sync(remoteDB);
    // excel.setMaxListeners(5000);
    // function update(){
    //     excel.get("1").then(function(d){
    //         d.value += 1;
    //         return excel.put(d);
    //     }).catch(function(e){
    //         console.log(e);
    //         update();
    //     });
    // }
    // excel.sync(remoteDB);


    var workbook = new Excel.Workbook();
    workbook.xlsx.load(req.files.file.data).then(function () {

        //Get sheet by Name
        var worksheet = workbook.getWorksheet('Hoja1');

        const promises = [];
        worksheet.eachRow(function (row, rowNumber) {
            // console.log(row)
            var rowsData = [];
            // var rowsData = [];
            // var row6 = worksheet.getRow(6);
            // console.log(row6.getCell('IS').value)
            // for (var i = 0; i < row6.names.length; i++) {
            //     console.log(row6.names)
            // }
            if (row.getCell('EF').value === "PERS044") {
                // console.log(row.value)
                // matchs.push(row.values);
                //    row.eachRow(function (row, colNumber) {
                //         // console.log('Cell ' + cell.name + ' = ' + cell.value);
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
                // console.log(row.getCell('IS').value);
                //         // matchs.push(row.value);

                //         // matchs.push({ [keys]: value });

                //     });
                // console.log(row.values);

                // for (var i = 0; i <= column.length; i++) {
                //     // console.log(row.values[i])
                //     rowsData.push({
                //         [column[i]]: row.values[i]
                //     })
                // }

                // matchs = [];
                // tomorrow.setDate(tomorrow.getDate() + 1)
                var data = {
                    _id: new Date().toISOString().slice(0, 10) + Math.random().toString(36),
                    values: rowsData
                };
                // console.log('Row ' + rowNumber + ' = ' + JSON.stringify(row.values));
                // const promise = excel.allDocs({include_docs: true,attachments: true}).then(function (doc) {
                //     return excel.put({
                //         _id: doc._id,
                //         _rev: doc._rev,
                //         title: JSON.stringify(row.values)
                //     });
                // }).then(function (response) {
                const promise = excel
                    .put(data, { force: true }).then(function (response) {
                        rowsData = [];
                        console.log("rowsData", rowsData);
                        console.log("Success", response)
                    }).then(function (err) {

                    }); // <-- whatever async operation you have here
                promises.push(promise);
                console.log(rowsData);



            }
            //   excel.sync(remoteDB);

        });
        excel.sync(remoteDB);
        Promise.all(promises).then((result) => {
            excel.sync(remoteDB);

            console.log("Done")
        }).catch((err) => {
            // update(err.id);

            console.log("An error occurred while inserting data", err);
        });

        // excel.allDocs({
        //     include_docs: true,
        //     attachments: true,
        //     startkey: new Date().toISOString().slice(0, 10),
        //     endkey: new Date().toISOString().slice(0, 10),
        // }, function (err, response) {
        //     res.send(response)
        //     if (err) { return console.log(err); }
        //     // handle result
        // });

        //     worksheet.eachRow({ includeEmpty: true }, async function (row, rowNumber) {
        //         console.log("Row " + rowNumber + " = " + JSON.stringify(row.values));
        //         excel
        //             .put({
        //                 _id: rowNumber,
        //                 title: JSON.stringify(row.values),
        //                 director: 'Christopher Nolansssss'
        //             }).then(function (response) {
        //                 console.log("Success", response)
        //             }).then(function (err) {
        //                 console.log("Error", err)
        //             });

        //     });

    });



});

app.get('/api/intial-excel-upload', (req, res) => {
    var excel = new PouchDB('excel5');
    var remoteDB = new PouchDB('http://admin:admin@localhost:5984/excel5');

    excel.allDocs({
        include_docs: true,
        attachments: true,
        startkey: new Date().toISOString().slice(0, 10),
        // endkey: new Date().toISOString().slice(0, 10),
    }, function (err, response) {
        console.log(response);
        res.send(response)
        excel.sync(remoteDB);

        if (err) { return console.log(err); }
        // handle result
    });
});

app.listen(port, () => console.log(`Listening on port ${port}`));