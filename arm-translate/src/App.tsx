import React from 'react';
import { BodyStyled, MainStyled, ButtonStyled, SectionStyled, SelectionStyled, SubTitleStyled, TitleStyled, InputStyled, ParagraphStyled } from './App.style';
import { ArmToThumb } from './Arm32ToThumb16/A32toT16';

function App() {
  const [used, setUsed] = React.useState('')
  const [text, setText] = React.useState('')
  const [thumb, setThumb] = React.useState<string[]>([])
  const architecture: string[] = ['A32', 'A64', 'T16']

  const translateToThumb = () => {
    setThumb([])
    const a32 = text.split("\n")
    for (let i = 0; i < a32.length; i++) {
      console.log(i + " " + a32[i])
      setThumb((prevThumb) => [...prevThumb, ArmToThumb(a32[i]) + "\n"])
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
          <SubTitleStyled>{used === architecture[0] ? architecture[2] : architecture[0]}</SubTitleStyled>
          {thumb.map((instr) => (
            <>
              <ParagraphStyled>{instr}</ParagraphStyled >
              <br />
            </>
          ))}
          <SubTitleStyled>{architecture[1]}</SubTitleStyled>
          {thumb.map((instr) => (
            <>
              <ParagraphStyled>{instr}</ParagraphStyled >
              <br />
            </>
          ))}
          <ButtonStyled type="button" onClick={translateToThumb}>Traduzir</ButtonStyled>
        </SectionStyled>
      </BodyStyled>
    </MainStyled>
  );
}

export default App;
