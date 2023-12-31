import React from 'react';
import { BodyStyled, MainStyled, ButtonStyled, SectionStyled, SelectionStyled, SubTitleStyled, TitleStyled, InputStyled, ParagraphStyled } from './App.style';
import { ArmToThumb } from './Arm32ToThumb16/A32toT16';
import { ThumbToArm } from './Thumb16ToArm32/T16toA32';
import { A32ToA64 } from './Arm32toArm64/32to64';

function App() {
  const [used, setUsed] = React.useState('A32')
  const [text, setText] = React.useState('')
  const [arm, setARM] = React.useState<string[]>([])
  const [out, setOut] = React.useState<string[]>([])
  const architecture: string[] = ['A32', 'T16']

  const translateToThumb = () => {
    setOut([])
    const a32 = text.split("\n")
    for (let i = 0; i < a32.length; i++) {
      setOut((prev) => [...prev, ArmToThumb(a32[i]) + "\n"])
    }
    translateToARM64()
  }

  const translateToARM = () => {
    setOut([])
    const t16 = text.split("\n")
    for (let i = 0; i < t16.length; i++) {
      setOut((prev) => [...prev, ThumbToArm(t16[i]) + "\n"])
    }
    setARM([])
  }

  const translateToARM64 = () => {
    setARM([])
    const a64 = text.split("\n")
    for (let i = 0; i < a64.length; i++) {
      let actual = A32ToA64(a64[i]).split("\n")
      for(let j = 0; j <actual.length;j++)
        setARM((prev) => [...prev, actual[j] + "\n"])
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
          <SubTitleStyled>{used}</SubTitleStyled>
          <InputStyled onChange={(text: { target: { value: React.SetStateAction<string>; }; }) => setText(text.target.value)} />
        </SectionStyled>
        <SectionStyled>
          <SubTitleStyled>{used === architecture[1] ? architecture[0] : architecture[1]}</SubTitleStyled>
          {out.map((instr) => (
            <>
              <ParagraphStyled>{instr.split("\n")}</ParagraphStyled >
              <br />
            </>
          ))} 
          <SubTitleStyled>{"A64"}</SubTitleStyled>
          {arm.map((instr) => (
            <>
              <ParagraphStyled>{instr}</ParagraphStyled >
              <br />
            </>
          ))}
          <ButtonStyled type="button" onClick={used === architecture[0] ? translateToThumb : translateToARM}>Traduzir</ButtonStyled>
        </SectionStyled>
      </BodyStyled>
    </MainStyled>
  );
}

export default App;
