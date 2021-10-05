import PouchDB from 'pouchdb-browser';

var pouchDBConnection = new PouchDB('kanban_db', { revs_limit: 1, auto_compaction: true });

const helpers = {
    updatePouchDB: function (data) {
        // update for next times
        pouchDBConnection.get(data._id).then(function (doc) {
            // console.log(doc, 'doc');
            return pouchDBConnection.put({
                _id: doc._id,
                _rev: doc._rev,
                // pieces: data.pieces,
                data: data.data
            });
        }).then(function (response) {
            // console.log('response', response);
            // handle response
        }).catch(function (err) {
            // console.log(err, 'error found');
            // first time add
            pouchDBConnection.put(data, { force: true }).then(function (response) {
                // handle response
                // console.log(response, 'success here');
            }).catch(function (err) {
                // console.log(err, 'error here');
            });
        });
    },
    getDataPouchDB: function (data) {

    },
}


export default helpers;