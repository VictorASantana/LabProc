import React from 'react';
import { BodyStyled, MainStyled, SectionStyled, SubTitleStyled, TitleStyled } from './App.style';

function App() {
  const [used, setUsed] = React.useState('')
  const architecture: string[] = ['A32', 'A64', 'T16']

  return (
    <MainStyled>
      <header>
        <TitleStyled>Tradutor ARM</TitleStyled>
      </header>
      <BodyStyled>
        <SectionStyled>
          <SubTitleStyled>Instruções a Traduzir: </SubTitleStyled>
          <select onChange={(arch) => setUsed(arch.target.value)}>
            {architecture.map((arch) => (
              <option>{arch}</option>
            ))}
          </select>
        </SectionStyled>
        <SectionStyled>
          <SubTitleStyled>{architecture[0] !== used ? architecture[0] : architecture[1]}</SubTitleStyled>
          <SubTitleStyled>{architecture[2] !== used ? architecture[2] : architecture[1]}</SubTitleStyled>
        </SectionStyled>
      </BodyStyled>
    </MainStyled>
  );
}

export default App;
