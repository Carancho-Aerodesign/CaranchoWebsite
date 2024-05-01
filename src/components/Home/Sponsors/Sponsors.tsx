import React from 'react'

import * as Brand from './assets'

import { SponsorsProps } from './interfaces'

import * as S from './Sponsors.styles'

const Sponsors = ({ translate }: SponsorsProps) => {
  return (
    <S.Container>
      <S.SectionTitle>{translate?.title}</S.SectionTitle>
      <S.Column>
        <S.Row>
        <S.Brand src={Brand.SolidWorks} alt="SolidWorks logo" />
        <S.Brand src={Brand.Ska} alt="SKA logo" />
        <S.Brand src={Brand.Ansys} alt="Ansys logo" />
        <S.Brand src={Brand.Jorginho} alt="Jorginho logo" />
        <S.Brand src={Brand.Ct} alt="CT logo" />
        <S.Brand src={Brand.Ufsm} alt="UFSM logo" />
        <S.Brand src={Brand.ctism} alt="CTISM logo" />
        </S.Row> 
      </S.Column>
      <S.Column>
        <S.CallToAction>{translate?.call_to_action}</S.CallToAction>
        <a
          href="https://mail.google.com/mail/u/0/?view=cm&fs=1&tf=1&to=carancho@ufsm.br"
          target="_blank"
          rel="noopener noreferrer"
        >
          <S.Mail>📫 carancho@ufsm.br</S.Mail>
        </a>
      </S.Column>
    </S.Container>
  )
}

export default Sponsors
