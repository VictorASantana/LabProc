import React from 'react';
import { BodyStyled, MainStyled, SectionStyled, SelectionStyled, SubTitleStyled, TitleStyled, InputStyled } from './App.style';

function App() {
  const [used, setUsed] = React.useState('')
  const [text, setText] = React.useState('')
  const [thumb, setThumb] = React.useState<string[]>([])
  const architecture: string[] = ['A32', 'A64', 'T16']

  const translateToThumb = () => {
    const a32 = text.split("/\r?\n/")
    for (let i = 0; i < a32.length; i++) {
      setThumb((prevThumb) => [...prevThumb, a32[i]])
    }
  }

  return (
    <MainStyled>
      <header>
        <TitleStyled>Tradutor ARM</TitleStyled>
      </header>
      <BodyStyled>
        <SectionStyled>
          <SubTitleStyled>Instruções a Traduzir: </SubTitleStyled>
          <SelectionStyled onChange={(arch: { target: { value: React.SetStateAction<string>; }; }) => setUsed(arch.target.value)}>
            {architecture.map((arch) => (
              <option>{arch}</option>
            ))}
          </SelectionStyled>
          <InputStyled onChange={(text: { target: { value: React.SetStateAction<string>; }; }) => setText(text.target.value)} />
        </SectionStyled>
        <SectionStyled>
          <SubTitleStyled>{architecture[0] !== used ? architecture[0] : architecture[1]}</SubTitleStyled>
          <p>{thumb}</p>
          <SubTitleStyled>{architecture[2] !== used ? architecture[2] : architecture[1]}</SubTitleStyled>
          <button type="button" onClick={translateToThumb}>Traduzir</button>
        </SectionStyled>
      </BodyStyled>
    </MainStyled>
  );
}

export default App;
