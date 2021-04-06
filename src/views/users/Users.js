import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { intial_excel_sheet } from "../../redux/actions/actions";


import Plot from 'react-plotly.js';
import {
  CBadge,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CDataTable,
  CRow,
  CPagination
} from '@coreui/react'

import usersData from './UsersData'

const getBadge = status => {
  switch (status) {
    case 'Active': return 'success'
    case 'Inactive': return 'secondary'
    case 'Pending': return 'warning'
    case 'Banned': return 'danger'
    default: return 'primary'
  }
}

const Users = () => {
  const dispatch = useDispatch()

  // const history = useHistory()
  const queryPage = useLocation().search.match(/page=([0-9]+)/, '')
  const currentPage = Number(queryPage && queryPage[1] ? queryPage[1] : 1)
  const [page, setPage] = useState(currentPage)
  const successforgotmsg = useSelector((state) => state.excelReducer.apiCalled);
  const parentsData = [""];
  const labelsData = [];
  const valuesData = [];
  const unique = [];
  // let history = useHistory()
  if (successforgotmsg) {
    // toast.success("API Called Successfully")
    // console.log(successforgotmsg)
    // successforgotmsg.prototype.unique = function() {
    //   var arr = [];

    //   console.log(arr);
    // }
    // successforgotmsg.rows.map(row => {
    //   row.doc.values.map(value => {

    //     console.log(value.Data)
    //     parentsData.push(value.Data);
    //     labelsData.push(value.Data);
    //   });
    // });
    successforgotmsg.rows.map(row => {
      row.doc.values.map(values => {

        console.log(values)
        // parentsData.push(value.Data);
        // let unique = values.filter((item, i, ar) => ar.indexOf(item) === i);

        labelsData.push(values.VHTXT1);
        parentsData.push(values.VHPRNO);
        valuesData.push(values.row_num);
      });
    });
    // let unique = [dataSearch.map(item => item.VHMFNO)];

    // for (var i = 0; i < dataSearch.length; i++) {
    //   if (!dataSearch.contains(this[i])) {
    //     unique.push(this[i]);
    //   }
    // }
    // let unique = Array.from(new Set(dataSearch));

    // FORGOT_PASSWORD(false)
    // console.log(dataSearch);
    // console.log(unique);
    // console.log(labelsData);

    // history.push("/login");
  }
  // const pageChange = newPage => {
  //   currentPage !== newPage && history.push(`/users?page=${newPage}`)
  // }
  // parentsData.slice(0, 10);
  // console.log(labelsData.slice(0, 10), "labelsData");
  // parentsData.slice(0, 10);
  // console.log(parentsData.slice(0, 10));
  useEffect(() => {
    dispatch(intial_excel_sheet());

    currentPage !== page && setPage(currentPage)
  }, [currentPage, page])

  return (
    <CRow>
      <CCol xl={12}>
        <CCard>
          <CCardHeader>
            Visualization
          </CCardHeader>
          <Plot
            data={[{
              type: "treemap",
              labels:parentsData.slice(1, 11),
              // labels: ["A1", "A2", "A3", "A4", "A5", "B1", "B2","B3","B4"],
              // values: valuesData,
              // parents: ["", "AGAR.(0,5mts)C/PLET.316.S/PULI"]
              parents: parentsData.slice(0, 10)
              // parents: ["", "A1"]
            }]}
          // layout={{ width: 320, height: 240, title: 'A Fancy Plot' }}
          />

        </CCard>
      </CCol>
    </CRow>
  )
}

export default Users
