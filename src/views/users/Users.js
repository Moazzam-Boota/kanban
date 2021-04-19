import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { intial_excel_sheet } from "../../redux/actions/actions";
import CWidgetBrand from './CWidgetBrand';
import {
  CWidgetSimple,
  CFormGroup,
  CCol,
  CRow,
} from '@coreui/react'

const lodash = require('lodash');

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
    successforgotmsg.rows.map(row => {
      row.doc.values.map(values => {
        parentsData.push(values);
      });
    });

    // for (var i = 0; i <= parentsData.length; i++) {
    //   if (parentsData[i] !== undefined) {
    //     parentsData[i].color = colors[i];
    //   }
    // }
  }

  function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  const colors = ['black', 'black', 'black', 'black', 'black', 'red', 'red', 'red', 'orange', 'orange', 'orange', 'green', 'green', 'green', 'royalBlue', 'royalBlue'];
  //   // const colors = ['royalBlue', 'royalBlue', 'green', 'green', 'green', 'orange', 'orange', 'orange', 'red', 'red', 'red', 'black', 'black', 'black', 'black', 'black'];

  useEffect(() => {
    dispatch(intial_excel_sheet());

    currentPage !== page && setPage(currentPage)
  }, [currentPage, page])

  // const cardsSet = ['red', 'lightgreen'];
  const cards = ['red', 'lightgreen'];

  console.log(lodash.groupBy(['one', 'two', 'three', 'two', 'one']))
  console.log(parentsData, 'parentsData')
  const dataGroupByOrder = lodash.chain(parentsData)
    // Group the elements of Array based on `color` property
    .groupBy("order_num_VHMFNO_D")
    // `key` is group's name (color), `value` is the array of objects
    .map((value, key) => ({ orderNumber: key, data: value }))
    .value();

  const dataGroupByShift = lodash.chain(parentsData)
    // Group the elements of Array based on `color` property
    .groupBy("shift_PPSHFT_IS")
    // `key` is group's name (color), `value` is the array of objects
    .map((value, key) => ({ shiftNumber: key, data: value }))
    .value();

  const quantityPerBox = 3;   // .per_box_qty_UNITCAIXA_IT

  const dataGroupByProduct = lodash.chain(parentsData)
    // Group the elements of Array based on `color` property
    .groupBy("part_num_VHPRNO_C")
    // `key` is group's name (color), `value` is the array of objects
    .map((value, key) => ({
      product: key,
      data: value,
      color: getRandomColor(),
      sum: lodash.sumBy(value, 'quantity_VHOROQ_AH'),
      productsPerBox: lodash.sumBy(value, 'quantity_VHOROQ_AH') / quantityPerBox
    }))
    .value();
  console.log(dataGroupByOrder, 'newData', dataGroupByShift, 'product', dataGroupByProduct);
  // console.log(dataGroupByOrder, 'newData', parentsData.slice(0).reverse())

  const dailyHours = 8; //hours, sum of all shifts (1, 2, 3) - sum of breaks (15min, 20min)
  const pitchPeriod = 30; //minutes
  const totalQuantity = lodash.sumBy(parentsData, 'quantity_VHOROQ_AH'); //sum of all quantities
  const quantityPerHour = dailyHours / totalQuantity;   // quanitity per hour
  const quantityPerMinute = quantityPerHour * 60;   // quanitity per minute
  const quantityPerSecond = quantityPerMinute * 60;   // quanitity per second

  const quantityPerBoxPerMinute = quantityPerBox * quantityPerMinute;  // per box time
  const quantityPerBoxPerSecond = quantityPerBox * quantityPerSecond;  // per box time

  const boxesPerPitch = pitchPeriod / quantityPerBoxPerMinute;  //13.875 -> 13, 13, 13, 13, 14, when decimal equals 1, add to next one
  console.log(boxesPerPitch, 'boxesPerPitch', quantityPerBoxPerMinute)
  // console.log(totalQuantity, 'totalQuantity')
  // TODO:: sum of all orders, quantity
  // TODO:: sum of all orders, quantity
  // 

  const donePieces = 100; //receive from clicking the button double click

  const kanbanBoxes = (dailyHours * 60) / pitchPeriod;
  console.log(kanbanBoxes, 'kanbanBoxes');

  const cardsData = [];
  for (var i = kanbanBoxes; i >= 1; i--) {
    console.log(i, 'data')
    var color = '';

    if (i <= 2) color = 'blue';
    else if (i > 2 && i <= 5) color = 'green';
    else if (i > 5 && i <= 8) color = 'orange';
    else if (i > 8 && i <= 11) color = 'red';
    else if (i > 11) color = 'black';

    cardsData.push(<CWidgetBrand
      style={{ marginLeft: '5px' }}
      color={color}
      shift={Math.round(boxesPerPitch)}
      cardName={dataGroupByProduct.map(product => {
        return (
          <span style={{
            backgroundColor: product.color,
            padding: '5px',
            marginLeft: '5px',
            width: '10px',
            textAlign: 'center',
            textWeight: 'bold',
            fontSize: '24px',
            color: 'white'
          }}>
            <span style={{
              padding: '5px'
            }}>{Math.round(product.productsPerBox / boxesPerPitch)}</span>
          </span>
        )
      })}
      leftHeader="459"
      leftFooter="feeds"
    >
    </CWidgetBrand >);
  }
  return (
    <CFormGroup>
      <CRow>
        <CCol xs="2">
          <CWidgetSimple header="Total Pieces" text={totalQuantity} />
        </CCol>
        <CCol xs="2">
          <CWidgetSimple header="Done Pieces" text={donePieces} />
        </CCol>
        <CCol xs="2">
          <CWidgetSimple header="Pending Pieces" text={totalQuantity - donePieces} />
        </CCol>
        <CCol xs="2">
          <CWidgetSimple header="Pieces/Hour (On Time)" text={(totalQuantity - donePieces) / dailyHours} />
        </CCol>
        <CCol xs="2">
          <CWidgetSimple header="Pieces/Hour (Day)" text={totalQuantity / dailyHours} />
        </CCol>
        <CCol xs="2">
          <CWidgetSimple header="Pieces/Hour (Target)" text={totalQuantity / kanbanBoxes} />
        </CCol>
      </CRow>
      <hr style={{ borderTop: '3px solid rgba(0, 0, 21, 0.2)' }}></hr>
      <CRow>
        {/* <CCol xl={12}> */}
        {cardsData}
        {/* </CCol> */}
      </CRow>
      <CRow>
        <CCol xs={{ offset: 9, size: 3 }} >
          <CWidgetSimple header="Kanban en curs" text={<div>
            <p>Ordre de fabricació </p>
            <p>Referencia de producte </p>
            <p>Descripció de producte </p>
            <p>Quantitat a produir total </p>
            <p>Quantitat que falten per produit </p>
            <p>Quantitat per caixa </p>
          </div>} />
        </CCol>
      </CRow>
    </CFormGroup>
  )
}

export default Users;