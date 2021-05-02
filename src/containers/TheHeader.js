import React from 'react'
import {
  CHeader,
  CHeaderBrand,
  CHeaderNav,
  CHeaderNavItem,
  CHeaderNavLink,
  CImg
} from '@coreui/react'
import CIcon from '@coreui/icons-react'

const TheHeader = () => {
  return (
    <CHeader withSubheader>
      <div className="navbar-left">
        <CImg
          src={'logo/gestlean.png'}
          className="c-avatar-img"
          style={{ width: "116px" }}
          alt="admin@bootstrapmaster.com"
        />
      </div>
      <CHeaderBrand className="mx-auto d-lg-none" to="/">
        <CIcon name="logo" height="48" alt="Logo" />
      </CHeaderBrand>

      <CHeaderNav className="d-md-down-none mr-auto">
        <CHeaderNavItem className="px-3" >
          <CHeaderNavLink to="/dashboard">Parameters</CHeaderNavLink>
        </CHeaderNavItem>
        <CHeaderNavItem className="px-3">
          <CHeaderNavLink to="/chart">Chart</CHeaderNavLink>
        </CHeaderNavItem>
      </CHeaderNav>
    </CHeader>
  )
}

export default TheHeader