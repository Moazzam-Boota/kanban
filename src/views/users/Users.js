import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { intial_excel_sheet } from "../../redux/actions/actions";
import CIcon from '@coreui/icons-react';
import CWidgetBrand from './CWidgetBrand';
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
  const parents = ["", "SHIFT1", "SHIFT1", "SHIFT1", "SHIFT1", "SHIFT1", "SHIFT1", "SHIFT1", "SHIFT1",
    "SHIFT1", "SHIFT1", "SHIFT1", "SHIFT1", "SHIFT1", "SHIFT1", "SHIFT1", "SHIFT1"
    , "PITCH16", "PITCH16", "PITCH16", "PITCH16", "PITCH16", "PITCH16",
    "PITCH15", "PITCH15", "PITCH15", "PITCH15", "PITCH15", "PITCH15",
    "PITCH14", "PITCH14", "PITCH14", "PITCH14", "PITCH14"
    , "PITCH13", "PITCH13", "PITCH13", "PITCH13"
    , "PITCH12", "PITCH12", "PITCH12", "PITCH12"
    , "PITCH11", "PITCH11", "PITCH11", "PITCH11"
    , "PITCH10", "PITCH10", "PITCH10", "PITCH10"
    , "PITCH09", "PITCH09", "PITCH09", "PITCH09"
    , "PITCH08", "PITCH08", "PITCH08", "PITCH08"
    , "PITCH07", "PITCH07", "PITCH07", "PITCH07"
    , "PITCH06", "PITCH06", "PITCH06", "PITCH06"
    , "PITCH05", "PITCH05", "PITCH05", "PITCH05"
    , "PITCH04", "PITCH04", "PITCH04", "PITCH04"
    , "PITCH03", "PITCH03", "PITCH03", "PITCH03"
    , "PITCH02", "PITCH02", "PITCH02", "PITCH02"
    , "PITCH01", "PITCH01", "PITCH01", "PITCH01"

  ];
  const markers = {
    colors: ["SILVER", "BLACK", "BLACK", "BLACK", "BLACK",
      "BLACK", "RED", "RED", "RED", "ORANGE", "ORANGE", "ORANGE", "GREEN",
      "GREEN", "GREEN", "ROYALBLUE", "ROYALBLUE"]
  };
  const labelsData = ["SHIFT1", "PITCH16", "PITCH15", "PITCH14",
    "PITCH13", "PITCH12", "PITCH11", "PITCH10", "PITCH09", "PITCH08",
    "PITCH07", "PITCH06", "PITCH05", "PITCH04", "PITCH03", "PITCH02",
    "PITCH01", "CARD 1", "CARD 2", "CARD 3", "CARD 4", "CARD 5", "CARD 6",
    "CARD1", "CARD2", "CARD3", "CARD4", "CARD5", "CARD6", "CARD_1", "CARD_2",
    "CARD_3", "CARD_4", "CARD_5", "CARD.1", "CARD.2", "CARD.3", "CARD.4",
    "CAR1", "CAR2", "CAR3", "CAR4",
    "CRD1", "CRD2", "CRD3", "CRD4",
    "CAR1.", "CAR2.", "CAR3.", "CAR4.",
    "CAD.1", "CAD.2", "CAD.3", "CAD.4",
    "CRD.1", "CRD.2", "CRD.3", "CRD.4",
    ".CARD1", ".CARD2", ".CARD3", ".CARD4",
    "C.ARD1", "C.ARD2", "C.ARD3", "C.ARD4",
    "CA.RD1", "CA.RD2", "CA.RD3", "CA.RD4",
    "CAR.D1", "CAR.D2", "CAR.D3", "CAR.D4",
    "CARD.1.", "CARD.2.", "CARD.3.", "CARD.4.",
    "C.AR1", "C.AR2", "C.AR3", "C.AR4",
    "CR.D1", "CR.D2", "CR.D3", "CR.D4"
  ];

  if (successforgotmsg) {

    const colors = ['royalBlue', 'royalBlue', 'green', 'green', 'green', 'orange', 'orange', 'orange', 'red', 'red', 'red', 'black', 'black', 'black', 'black', 'black'];

    successforgotmsg.rows.map(row => {

      row.doc.values.map(values => {

        parentsData.push(values);

      });

    });

    for (var i = 0; i <= parentsData.length; i++) {
      console.log(colors[i]);
      if (parentsData[i] !== undefined) {
        parentsData[i].color = colors[i];

      }

    }

  }

  console.log(parentsData);
  useEffect(() => {
    dispatch(intial_excel_sheet());

    currentPage !== page && setPage(currentPage)
  }, [currentPage, page])

  const cards = ['red', 'lightgreen', 'purple', 'black', 'brown'];

  const cardsData = parentsData.slice(0).reverse().map(k => {

    return (<CCol sm="2" lg="2">
      <CWidgetBrand
        color={k.color}
        shift={k.shift_PPSHFT_IS}

        cardName={cards.map(i => {
          console.log(i)
          return (<CIcon
            name="cil-credit-card"
            height="50"
            style={{ color: i }}
            width="50"
            className="my-4"
          />)
        })}

        leftHeader="459"
        leftFooter="feeds"
      >
      </CWidgetBrand>
    </CCol>);
  });
  console.log(cardsData);


  return (
    <CRow>
      <CCol xl={12}>
        <CCard>
          <CCardHeader>
            Visualization
          </CCardHeader>
          <CRow>
            {cardsData}
          </CRow>
          <Plot
            data={[{
              type: "treemap",
              labels: labelsData,
              // labels: ["A1", "A2", "A3", "A4", "A5", "B1", "B2", "B3", "B4"],
              // values: valuesData,
              // parents: ["", "A1", "A2", "A2", "A2", "", "A1", "B1", "B1"]
              parents: parents,
              marker: markers,
              // domain: {"row": [1]},
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
