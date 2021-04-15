import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { intial_excel_sheet } from "../../redux/actions/actions";
import CIcon from '@coreui/icons-react';
import { freeSet } from '@coreui/icons'
import CWidgetBrand from './CWidgetBrand';
import Plot from 'react-plotly.js';

import {
  CBadge,
  CWidgetSimple,

  CFormGroup,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CDataTable,
  CRow,
  CPagination
} from '@coreui/react'

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

  const queryPage = useLocation().search.match(/page=([0-9]+)/, '')
  const currentPage = Number(queryPage && queryPage[1] ? queryPage[1] : 1)
  const [page, setPage] = useState(currentPage)
  const successforgotmsg = useSelector((state) => state.excelReducer.apiCalled);
  const parentsData = [];
  if (successforgotmsg) {

    const colors = ['royalBlue', 'royalBlue', 'green', 'green', 'green', 'orange', 'orange', 'orange', 'red', 'red', 'red', 'black', 'black', 'black', 'black', 'black'];

    successforgotmsg.rows.map(row => {

      row.doc.values.map(values => {

        parentsData.push(values);

      });

    });

    for (var i = 0; i <= parentsData.length; i++) {
      if (parentsData[i] !== undefined) {
        parentsData[i].color = colors[i];

      }

    }

  }

  useEffect(() => {
    dispatch(intial_excel_sheet());

    currentPage !== page && setPage(currentPage)
  }, [currentPage, page])

  const cards = ['red', 'lightgreen'];

  const cardsData = parentsData.slice(0).reverse().map(k => {

    return (

      <CWidgetBrand
        style={{ marginLeft:'5px'}}
        color={k.color}
        shift={k.shift_PPSHFT_IS}

        cardName={cards.map(i => {
          return (

            // <CIcon
            //   title="5"
            //   content={freeSet.cilSquare}
            //   height="50"
            //   // style
            //   style={{ color: i, backgroundColor: i, marginLeft:'5px' }}
            //   width="50"
            //   className="my-4"
            // ></CIcon>  
            <span style={{
              backgroundColor: i,
              padding: '5px',
              width: '10px',
              marginLeft: '5px',
              textAlign: 'center',
              textWeight: 'bold',
              fontSize: '24px'
            }}>5</span>
            // <CFormGroup row>
            //   <div
            //     className="col-sm"
            //     // title="5"
            //     // content={freeSet.cilSquare}
            //     // height="50"
            //     // style
            //     style={{ color: i, backgroundColor: i, width: '5px', height: '50px', marginTop: '5px' }}
            //   // width="50"
            //   // className="my-4"
            //   ><p style={{ color: 'Yellow' }}>5</p></div></CFormGroup>

          )
        })}

        leftHeader="459"
        leftFooter="feeds"
      >
      </CWidgetBrand>


    );
  });


  return (
    <CFormGroup>
      <CRow>
        <CCol xs="2">
          <CWidgetSimple header="Total Peices" text="1400" />
        </CCol>
        <CCol xs="2">
          <CWidgetSimple header="Done Peices" text="250" />
        </CCol>
        <CCol xs="2">
          <CWidgetSimple header="Pending Peices" text="1150" />
        </CCol>
        <CCol xs="2">
          <CWidgetSimple header="Peices/Hour (on time)" text="50" />
        </CCol>
        <CCol xs="2">
          <CWidgetSimple header="Peices/Hour (Day)" text="80" />
        </CCol>
        <CCol xs="2">
          <CWidgetSimple header="Target" text="700" />
        </CCol>
      </CRow>
      <hr></hr>
      <CRow>
        {/* <CCol xl={12}> */}
        {cardsData}
        {/* </CCol> */}
      </CRow>
    </CFormGroup>
  )
}

export default Users
