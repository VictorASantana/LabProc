let vectorT16 = ["UND", "ADC", "ADD", "AND", "B", "BIC", "BL", "BX", "CMN", "CMP", "EOR", "LDMIA", "LDR", "LDRB", "LDRH", "LDSB", "LDSH", "MOV", "MUL", "MVN", "NEG", "ORR", "POP", "PUSH", "SBC", "STMIA", "STR", "STRB", "STRH", "SWI", "SUB", "TST"]
let matrixA32 = [["ADC", "ADD", "AND", "B", "BIC", "BL", "BX", "CDP", "CMN", "CMP", "EOR", "LDC", "LDM", "LDR", "LDRB", "LDRH", "LDRSB", "LDRSH", "MCR", "MLA", "MOV", "MRC", "MRS", "MSR", "MUL", "MVN", "ORR", "RSB", "RSC", "SBC", "STC", "STM", "STR", "STRB", "STRH", "SUB", "SWI", "SWP", "TEQ", "TST"],
[1, 2, 3, 4, 5, 6, 7, 0, 8, 9, 10, 0, 11, 12, 13, 14, 15, 16, 0, 18, 17, 0, 0, 0, 18, 19, 21, 20, 0, 24, 0, 25, 26, 27, 28, 30, 29, 0, 0, 31]]
let vectorCond = ["EQ", "NE", "CS", "CC", "MI", "PL", "VS", "VC", "HI", "LS", "GE", "LT", "GT", "LE", "AL", ""]
let vectorAddr = ["ED", "FD", "EA", "FA", "IB", "IA", "DB", "DA"];

const ArmToThumb = (inst: string) => {
    let vectorInst = inst.split(' ')

    let opcodeT16 = GetOpcodeT16(vectorInst[0])
    let operandsT16 = inst.slice(vectorInst[0].length)
    let lastOperand = vectorInst[vectorInst.length - 1]

    switch (opcodeT16) {
        case "ADC":
            if(vectorInst[1] != vectorInst[2]){
                return "ERRO: Formato não suportado (Rd := Rn + Rs + C-bit) / Formato esperado: Rd := Rd + Rs + C-bit"
            }
            operandsT16 = ' ' + vectorInst[1] + ' ' + vectorInst[3]
            if(hasHighRegister(operandsT16, false)){
                return "ERRO: Instrução não suporta high registers"
            }
            break;
        case "ADD":
            // Se tiver offset
            if(lastOperand.includes("#")){
                // Se offset tiver até 3 bits, mantém operandos
                // Se offset tiver mais que 3 e até 8 bits:
                if(parseInt(lastOperand.slice(lastOperand.indexOf("#") + 1)) > 7 && parseInt(lastOperand.slice(lastOperand.indexOf("#") + 1)) <= 255){
                    if(vectorInst[1] != vectorInst[2]){
                        return "ERRO: Formato não suportado (Rd := Rn + offset8) / Formato esperado: Rd := Rd + offset8"
                    }
                    operandsT16 = ' ' + vectorInst[1] + ' ' + vectorInst[3]
                }
                if(hasHighRegister(operandsT16, false)){
                    if(!(vectorInst[2].includes("R13") || vectorInst[2].includes("R15"))){
                        return "ERRO: Instrução não suporta high registers"
                    }
                    if(parseInt(lastOperand.slice(lastOperand.indexOf("#") + 1)) > 1023){
                        return "ERRO: Imediato maior que o valor máximo (1023)"
                    }
                    if(vectorInst[1].includes("R13") && vectorInst[2].includes("R13")){
                        operandsT16 = ' ' + vectorInst[1] + ' ' + vectorInst[3]
                    }
                }
            }
            // Sem offset
            else{
                if(hasHighRegister(operandsT16, false)){
                    if(vectorInst[1] != vectorInst[2]){
                        return "ERRO: Formato não suportado / Formato esperado: Rd/Hd := Rd/Hd + Hs/Rs"
                    }
                    operandsT16 = ' ' + vectorInst[1] + ' ' + vectorInst[3]
                }
            }
            break;
        case "AND":
            if(vectorInst[1] != vectorInst[2]){
                return "ERRO: Formato não suportado (Rd := Rn AND Rs) / Formato esperado: Rd := Rd AND Rs"
            }
            operandsT16 = ' ' + vectorInst[1] + ' ' + vectorInst[3]
            if(hasHighRegister(operandsT16, false)){
                return "ERRO: Instrução não suporta high registers"
            }
            break;
        case "B":
            opcodeT16 = verifyB(vectorInst[0])
            break;
        case "BIC":
            if(vectorInst[1] != vectorInst[2]){
                return "ERRO: Formato não suportado (Rd := Rn AND NOT Rs) / Formato esperado: Rd := Rd AND NOT Rs"
            }
            operandsT16 = ' ' + vectorInst[1] + ' ' + vectorInst[3]
            if(hasHighRegister(operandsT16, false)){
                return "ERRO: Instrução não suporta high registers"
            }
            break;
        case "BL":
            break;
        case "BX":
            break;
        case "CMN":
            if(hasHighRegister(operandsT16, false)){
                return "ERRO: Instrução não suporta high registers"
            }
            break;
        case "CMP":
            if(lastOperand.includes("#")){
                if(parseInt(lastOperand.slice(lastOperand.indexOf("#") + 1)) > 255){
                    return "ERRO: Imediato maior que o valor máximo (255)"
                }
                if(hasHighRegister(operandsT16, false)){
                    return "ERRO: Instrução não suporta high registers com offset"
                }
            }
            break;
        case "EOR":
            if(vectorInst[1] != vectorInst[2]){
                return "ERRO: Formato não suportado (Rd := Rn EOR Rs) / Formato esperado: Rd := Rd EOR Rs"
            }
            operandsT16 = ' ' + vectorInst[1] + ' ' + vectorInst[3]
            if(hasHighRegister(operandsT16, false)){
                return "ERRO: Instrução não suporta high registers"
            }
            break;
        case "LDMIA": // e POP (FALTA REGISTRADORES)
            opcodeT16 = verifyPOP(vectorInst[1]);
            if(opcodeT16 === "POP"){
                operandsT16 = ' ' + inst.slice(inst.indexOf("{"))
            }
            break;
        case "LDR": //(FALTA REGISTRADORES)
            break;
        case "LDRB":
            if(hasHighRegister(operandsT16, false)){
                return "ERRO: Instrução não suporta high registers"
            }
            break;
        case "LDRH":
            if(hasHighRegister(operandsT16, false)){
                return "ERRO: Instrução não suporta high registers"
            }
            break;
        case "LDSB":
            if(hasHighRegister(operandsT16, false)){
                return "ERRO: Instrução não suporta high registers"
            }
            break;
        case "LDSH":
            if(hasHighRegister(operandsT16, false)){
                return "ERRO: Instrução não suporta high registers"
            }
            break;
        case "MOV": // e ASR, LSL, LSR e ROR
            opcodeT16 = verifyMOV(vectorInst)
            // Com rotação
            if(opcodeT16 === "ASR" || opcodeT16 === "LSL" || opcodeT16 === "LSR" || opcodeT16 === "ROR"){
                // Se tiver offset
                if(lastOperand.includes("#")){
                    if(parseInt(lastOperand.slice(lastOperand.indexOf("#") + 1)) > 31){
                        return "ERRO: Offset muito grande"
                    }
                    operandsT16 = ' ' + vectorInst[1] + ' ' + vectorInst[2] + ' ' + vectorInst[4]
                }
                // Com registrador
                else {
                    if(vectorInst[1] != vectorInst[2]){
                        return "ERRO: Formato não suportado (Rd := Rn EOR Rs) / Formato esperado: Rd := Rd EOR Rs"
                    }
                    operandsT16 = ' ' + vectorInst[1] + ' ' + vectorInst[4]
                }
                if(hasHighRegister(operandsT16, false)){
                    return "ERRO: Instrução não suporta high registers"
                }
            }
            else {
                if(lastOperand.includes("#")){
                    if(parseInt(lastOperand.slice(lastOperand.indexOf("#") + 1)) > 255){
                        return "ERRO: Offset muito grande"
                    }
                    if(hasHighRegister(operandsT16, false)){
                        return "ERRO: Instrução não suporta high registers"
                    }
                }
            }
            break;
        case "MUL":
            if(vectorInst[1].includes(vectorInst[2])){
                operandsT16 = ' ' + vectorInst[1] + ' ' + vectorInst[3]
            }
            else {
                if(vectorInst[1].includes(vectorInst[3])){
                    operandsT16 = ' ' + vectorInst[1] + ' ' + vectorInst[2].slice(0, vectorInst[2].length - 1)
                }
                else {
                    return "ERRO: Formato não suportado (Rd := Rn * Rs) / Formato esperado: Rd := Rd * Rs"
                }
            }
            if(hasHighRegister(operandsT16, false)){
                return "ERRO: Instrução não suporta high registers"
            }
            break;
        case "MVN":
            if(hasHighRegister(operandsT16, false)){
                return "ERRO: Instrução não suporta high registers"
            }
            break;
        case "NEG":
            opcodeT16 = verifyNEG(vectorInst)
            operandsT16 = ' ' + vectorInst[1] + ' ' + vectorInst[2].slice(0, vectorInst[2].length - 1)
            if(hasHighRegister(operandsT16, false)){
                return "ERRO: Instrução não suporta high registers"
            }
            break;
        case "ORR":
            if(vectorInst[1].includes(vectorInst[2])){
                operandsT16 = ' ' + vectorInst[1] + ' ' + vectorInst[3]
            }
            else {
                if(vectorInst[1].includes(vectorInst[3])){
                    operandsT16 = ' ' + vectorInst[1] + ' ' + vectorInst[2].slice(0, vectorInst[2].length - 1)
                }
                else {
                    return "ERRO: Formato não suportado (Rd := Rn OR Rs) / Formato esperado: Rd := Rd OR Rs"
                }
            }
            if(hasHighRegister(operandsT16, false)){
                return "ERRO: Instrução não suporta high registers"
            }
            break;
        case "SBC":
            if(vectorInst[1] != vectorInst[2]){
                return "ERRO: Formato não suportado (Rd := Rn - Rs - NOT C-bit) / Formato esperado: Rd := Rd - Rs - NOT C-bit"
            }
            operandsT16 = ' ' + vectorInst[1] + ' ' + vectorInst[3]
            if(hasHighRegister(operandsT16, false)){
                return "ERRO: Instrução não suporta high registers"
            }
            break;
        case "STMIA": // e PUSH (FALTA REGISTRADORES)
            opcodeT16 = verifyPUSH(vectorInst) 
            if(opcodeT16 === "PUSH"){
                operandsT16 = ' ' + inst.slice(inst.indexOf("{"))
            }
            break;
        case "STR": // (FALTA REGISTRADORES)
            break;
        case "STRB":
            if(hasHighRegister(operandsT16, false)){
                return "ERRO: Instrução não suporta high registers"
            }
            break;
        case "STRH":
            if(hasHighRegister(operandsT16, false)){
                return "ERRO: Instrução não suporta high registers"
            }
            break;
        case "SWI":
            break;
        case "SUB":
            opcodeT16 = verifySUB(vectorInst)
            if(opcodeT16 === "ADD"){
                operandsT16 = ' ' + vectorInst[1] + ' #-' + vectorInst[3].slice(1)
                if(parseInt(lastOperand.slice(lastOperand.indexOf("#") + 1)) > 127){
                    return "ERRO: Imediato muito grande"
                }
            }
            // Se tiver offset
            else {
                if(lastOperand.includes("#")){
                    // Se offset tiver até 3 bits, mantém operandos
                    // Se offset tiver mais que 3 e até 8 bits:
                    if(parseInt(lastOperand.slice(lastOperand.indexOf("#") + 1)) > 7 && parseInt(lastOperand.slice(lastOperand.indexOf("#") + 1)) <= 255){
                        if(vectorInst[1] != vectorInst[2]){
                            return "ERRO: Formato não suportado (Rd := Rn - offset8) / Formato esperado: Rd := Rd - offset8"
                        }
                        operandsT16 = ' ' + vectorInst[1] + ' ' + vectorInst[3]
                    }
                }
            }
            if(hasHighRegister(operandsT16, false)){
                return "ERRO: Instrução não suporta high registers"
            }
            break;
        case "TST":
            if(hasHighRegister(operandsT16, false)){
                return "ERRO: Instrução não suporta high registers"
            }
            break;
        default:
            break;
    }

    if (opcodeT16 != "UEPA") {
        
        return opcodeT16 + operandsT16
    }

    return "UEPA"
}

const simplifyOpcodeA32 = (opcodeA32: string) => {
    for (let i = 1; i <= opcodeA32.length; i++) {
        let auxSliced = opcodeA32.slice(0, i)
        let auxExtra = opcodeA32.slice(i)

        if (matrixA32[0].some(x => x === auxSliced) && (vectorCond.some(x => x === auxExtra || x + 'S' === auxExtra) || vectorAddr.some(x => x === auxExtra))) {
            return auxSliced
        }
    }

    return opcodeA32

}

const GetOpcodeT16 = (opcodeA32: string) => {
    opcodeA32 = simplifyOpcodeA32(opcodeA32);
    let instPos = matrixA32[0].findIndex(x => x === opcodeA32)

    if (instPos >= 0) {
        return vectorT16[Number(matrixA32[1][instPos])]
    }

    return "UEPA"
}

const verifyMOV = (vectorInst: string[]) => {

    if (vectorInst.length > 3) {
        return vectorInst[3]
    }

    return "MOV"
}

const verifyB = (opcode: string) => {
    if (opcode.length > 1 && !opcode.includes("AL")) {
        return opcode;
    }
    return "B"
}

const verifyPOP = (operand: string) => {
    if (operand.includes("R13")) {
        return "POP";
    }
    return "LDMIA"
}

const verifyPUSH = (instr: string[]) => {
    if (instr[0] === "STMDB") {
        if (instr[1].includes("R13")) {
            return "PUSH";
        }
    }
    return "STMIA"
}

const verifyNEG = (instr: string[]) => {
    if (instr[instr.length - 1].includes("#0")) {
        return "NEG"
    }
    return "UEPA";
}

const verifySUB = (instr: string[]) => {
    if(instr[1].includes("R13") && instr[2].includes("R13") && instr[3].includes("#")){
        return "ADD"
    }
    return "SUB"
}

const hasHighRegister = (operands: string, specialFlag: boolean) => {
    let vectorHighReg = ["R8", "R9", "R10", "R11", "R12", "R14", "R13", "R15"]
    let maxlength = specialFlag ? 6 : 8

    for(let i = 0; i < maxlength; i++){
        if(operands.includes(vectorHighReg[i])){
            return true
        }
    }

    return false
}

let teste1 = ArmToThumb("ADC R1, R1, R2")
let teste2 = ArmToThumb("ADC R1, R13, R2")
let teste3 = ArmToThumb("ADC R1, R1, R12")
let teste4 = ArmToThumb("ADD R8, R8, R2")

console.log(teste1 + "\n" + teste2 + "\n" + teste3 + "\n" + teste4)