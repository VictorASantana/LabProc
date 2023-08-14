let vectorT16 = ["UND", "ADC", "ADD", "AND", "B", "BIC", "BL", "BX", "CMN", "CMP", "EOR", "LDMIA", "LDR", "LDRB", "LDRH", "LDSB", "LDSH", "MOV", "MUL", "MVN", "NEG", "ORR", "POP", "PUSH", "SBC", "STMIA", "STR", "STRB", "STRH", "SWI", "SUB", "TST"]
let matrixA32 = [["ADC", "ADD", "AND", "B", "BIC", "BL", "BX", "CDP", "CMN", "CMP", "EOR", "LDC", "LDM", "LDR", "LDRB", "LDRH", "LDRSB", "LDRSH", "MCR", "MLA", "MOV", "MRC", "MRS", "MSR", "MUL", "MVN", "ORR", "RSB", "RSC", "SBC", "STC", "STM", "STR", "STRB", "STRH", "SUB", "SWI", "SWP", "TEQ", "TST"],
[1, 2, 3, 4, 5, 6, 7, 0, 8, 9, 10, 0, 11, 12, 13, 14, 15, 16, 0, 18, 17, 0, 0, 0, 18, 19, 21, 20, 0, 24, 0, 25, 26, 27, 28, 30, 29, 0, 0, 31]]
let vectorCond = ["EQ", "NE", "CS", "CC", "MI", "PL", "VS", "VC", "HI", "LS", "GE", "LT", "GT", "LE", "AL", ""]
let vectorAddr = ["ED", "FD", "EA", "FA", "IB", "IA", "DB", "DA"];

export const ArmToThumb = (inst: string) => {
    inst = inst.toUpperCase()

    let vectorInst = inst.split(' ')

    let opcodeT16 = GetOpcodeT16(vectorInst[0])
    let operandsT16 = inst.slice(vectorInst[0].length)
    let lastOperand = vectorInst[vectorInst.length - 1]

    switch (opcodeT16) {
        case "ADC":
            if (vectorInst[1] !== vectorInst[2]) {
                return "ERRO: Formato não suportado / Formato esperado: ADC Rd, Rd, Rs"
            }
            if (vectorInst.length !== 4 || !isRegister(vectorInst[1], opcodeT16) || !isRegister(vectorInst[2], opcodeT16)) {
                return "ERRO: Formato não suportado / Formato esperado: ADC Rd, Rd, Rs"
            } 
            if (hasHighRegister(operandsT16, false)) {
                return "ERRO: Instrução não suporta high registers"
            }
            operandsT16 = ' ' + vectorInst[1] + ' ' + vectorInst[3]
            break;
        case "ADD":
            if (vectorInst.length !== 4 || !isRegister(vectorInst[1], opcodeT16) || !isRegister(vectorInst[2], opcodeT16)){
                return "ERRO: Formato não suportado / Formato esperado: ADD Rd, Rs, Rn | ADD Rd, Rs, #Offset3 | ADD Rd, Rd, Hs | ADD Rd, Rd, #Offset8"
            }
            // Se tiver offset
            if (lastOperand.includes("#")) {
                // Se offset tiver até 3 bits, mantém operandos
                // Se offset tiver mais que 3 e até 8 bits:
                if (parseInt(lastOperand.slice(lastOperand.indexOf("#") + 1)) > 7 && parseInt(lastOperand.slice(lastOperand.indexOf("#") + 1)) <= 255) {
                    if (vectorInst[1] !== vectorInst[2]) {
                        return "ERRO: Offset grande demais para esse formato"
                    }
                    operandsT16 = ' ' + vectorInst[1] + ' ' + vectorInst[3]
                }
                if (hasHighRegister(operandsT16, false)) {
                    if (!(vectorInst[2].includes("R13") || vectorInst[2].includes("R15"))) {
                        return "ERRO: Instrução não suporta high registers"
                    }
                    if (parseInt(lastOperand.slice(lastOperand.indexOf("#") + 1)) > 1023) {
                        return "ERRO: Imediato maior que o valor máximo (1023)"
                    }
                    if (vectorInst[1].includes("R13") && vectorInst[2].includes("R13")) {
                        operandsT16 = ' ' + vectorInst[1] + ' ' + vectorInst[3]
                    }
                }
            }
            // Sem offset
            else {
                if (hasHighRegister(operandsT16, false)) {
                    if (vectorInst[1] !== vectorInst[2]) {
                        return "ERRO: Formato não suportado / Formato esperado: ADD Rd, Rs, Rn | ADD Rd, Rs, #Offset3 | ADD Rd, Rd, Hs | ADD Rd, Rd, #Offset8"
                    }
                    operandsT16 = ' ' + vectorInst[1] + ' ' + vectorInst[3]
                }
            }
            break;
        case "AND":
            if (vectorInst.length !== 4 || !isRegister(vectorInst[1], opcodeT16) || !isRegister(vectorInst[2], opcodeT16) || !isRegister(vectorInst[3], opcodeT16)) {
                return "ERRO: Formato não suportado / Formato esperado: AND Rd, Rd, Rs"
            }
            if (vectorInst[1] !== vectorInst[2]) {
                return "ERRO: Formato não suportado / Formato esperado: AND Rd, Rd, Rs"
            }
            if (hasHighRegister(operandsT16, false)) {
                return "ERRO: Instrução não suporta high registers"
            }
            operandsT16 = ' ' + vectorInst[1] + ' ' + vectorInst[3]
            break;
        case "B":
            opcodeT16 = verifyB(vectorInst[0])
            if(vectorInst.length !== 2){
                return "ERRO: Formato não suportado / Formato esperado: B label | Bxx label"
            }
            break;
        case "BIC":
            if (vectorInst.length !== 4 || !isRegister(vectorInst[1], opcodeT16) || !isRegister(vectorInst[2], opcodeT16) || !isRegister(vectorInst[3], opcodeT16)){
                return "ERRO: Formato não suportado / Formato esperado: BIC Rd, Rd, Rs"
            }
            if (vectorInst[1] !== vectorInst[2]) {
                return "ERRO: Formato não suportado / Formato esperado: BIC Rd, Rd, Rs"
            }
            operandsT16 = ' ' + vectorInst[1] + ' ' + vectorInst[3]
            if (hasHighRegister(operandsT16, false)) {
                return "ERRO: Instrução não suporta high registers"
            }
            break;
        case "BL":
            if (vectorInst.length !== 2) {
                return "ERRO: Formato não suportado / Formato esperado: BL label"
            }
            break;
        case "BX":
            if (vectorInst.length !== 2) {
                return "ERRO: Formato não suportado / Formato esperado: BX Rs"
            }
            break;
        case "CMN":
            if (vectorInst.length !== 3 || !isRegister(vectorInst[1], opcodeT16) || !isRegister(vectorInst[2], opcodeT16)) {
                return "ERRO: Formato não suportado / Formato esperado: CMN Rd, Rs"
            }
            if (hasHighRegister(operandsT16, false)) {
                return "ERRO: Instrução não suporta high registers"
            }
            break;
        case "CMP":
            if (vectorInst.length !== 3 || !isRegister(vectorInst[1], opcodeT16) || !(isRegister(vectorInst[2], opcodeT16) || lastOperand.includes("#"))) {
                return "ERRO: Formato não suportado / Formato esperado: CMP Rd, Rs | CMP Rd, #Offset8"
            }
            if (lastOperand.includes("#")) {
                if (parseInt(lastOperand.slice(lastOperand.indexOf("#") + 1)) > 255) {
                    return "ERRO: Imediato maior que o valor máximo (255)"
                }
                if (parseInt(lastOperand.slice(lastOperand.indexOf("#") + 1)) < 0) {
                    return "ERRO: Imediato tem que ser positivo"
                }
                if (hasHighRegister(operandsT16, false)) {
                    return "ERRO: Instrução não suporta high registers com offset"
                }
            }
            break;
        case "EOR":
            if (vectorInst.length !== 4 || !isRegister(vectorInst[1], opcodeT16) || !isRegister(vectorInst[2], opcodeT16) || !isRegister(vectorInst[3], opcodeT16)){
                return "ERRO: Formato não suportado / Formato esperado: EOR Rd, Rd, Rs"
            }
            if (vectorInst[1] !== vectorInst[2]) {
                return "ERRO: Formato não suportado / Formato esperado: EOR Rd, Rd, Rs"
            }
            if (hasHighRegister(operandsT16, false)) {
                return "ERRO: Instrução não suporta high registers"
            }
            operandsT16 = ' ' + vectorInst[1] + ' ' + vectorInst[3]
            break;
        case "LDMIA": // e POP
            opcodeT16 = verifyPOP(vectorInst[1]);
            if (!(isRegister(vectorInst[1], "LDMIA") && vectorInst[2].includes("{") && vectorInst[vectorInst.length - 1].includes("}"))) {
                return "ERRO: Formato não suportado / Formato esperado: LDMIA Rb!, { Rlist } | LDMIA R13!, { Rlist } | LDMIA R13!, { Rlist, R15 }"
            }
            // Se for POP
            if (opcodeT16 === "POP") {
                operandsT16 = ' ' + inst.slice(inst.indexOf("{"))
                // Se o rlist tiver R15
                if (operandsT16.includes(",")) {
                    if (!operandsT16.slice(operandsT16.lastIndexOf(",")).includes("R15") || hasHighRegister(operandsT16.slice(0, operandsT16.lastIndexOf(",")), false)) {
                        return "ERRO: Instrução não suporta high registers (apenas o R13 no endereço base ou o R15 na lista)"
                    }
                }
                else {
                    if(operandsT16.includes("R15") && !operandsT16.includes("-")){
                        break;
                    }
                    if (hasHighRegister(operandsT16, false)) {
                        return "ERRO: Instrução não suporta high registers (apenas o R13 no endereço base ou o R15 na lista)"
                    }
                }
            }
            // Se for LDMIA
            else {
                if (hasHighRegister(operandsT16, false)) {
                    return "ERRO: Instrução não suporta high registers (apenas o R13 no endereço base)"
                }
            }
            break;
        case "LDR":
            // Confere disposição da instrução
            if (!(vectorInst.length === 4 && isRegister(vectorInst[1], opcodeT16) && vectorInst[2].includes("[") && vectorInst[3].includes("]") && isRegister(vectorInst[2].slice(1), opcodeT16))) {
                return "ERRO: Formato não suportado / Formato esperado: LDR Rd, [Rb, Ro] | LDR Rd, [Rb, #Imm]"
            }
            // Confere primeiro registrador
            if (hasHighRegister(vectorInst[1], false)) {
                return "ERRO: Instrução não suporta high registers (apenas R13 ou R15 no registrador de destino com imediato)"
            }
            // Se tiver imediato
            if (lastOperand.includes("#")) {
                if (hasHighRegister(operandsT16, false)) {
                    if (!vectorInst[2].includes("R15") && !vectorInst[2].includes("R13")) {
                        return "ERRO: Instrução não suporta high registers (apenas R13 ou R15 no registrador de destino com imediato)"
                    }
                    if (parseInt(lastOperand.slice(lastOperand.indexOf("#") + 1)) > 255) {
                        return "ERRO: Imediato maior que o valor máximo (255)"
                    }
                }
                else {
                    if (parseInt(lastOperand.slice(lastOperand.indexOf("#") + 1)) > 31) {
                        return "ERRO: Imediato maior que o valor máximo (31)"
                    }
                }
            }
            // Sem imediato
            else {
                if (hasHighRegister(operandsT16, false)) {
                    return "ERRO: Instrução não suporta high registers (apenas R13 ou R15 no registrador de destino com imediato)"
                }
            }
            break;
        case "LDRB":
            // Confere disposição da instrução
            if (!(vectorInst.length === 4 && isRegister(vectorInst[1], opcodeT16) && vectorInst[2].includes("[") && vectorInst[3].includes("]") && isRegister(vectorInst[2].slice(1), opcodeT16))) {
                return "ERRO: Formato não suportado / Formato esperado: LDRB Rd, [Rb, Ro] | LDRB Rd, [Rb, #Imm]"
            }
            // Confere high register
            if (hasHighRegister(operandsT16, false)) {
                return "ERRO: Instrução não suporta high registers"
            }
            // Se tiver imediato
            if (lastOperand.includes("#")) {
                if (parseInt(lastOperand.slice(lastOperand.indexOf("#") + 1)) > 31) {
                    return "ERRO: Imediato maior que o valor máximo (31)"
                }
                if (parseInt(lastOperand.slice(lastOperand.indexOf("#") + 1)) < 0) {
                    return "ERRO: Imediato tem que ser positivo"
                }
            }
            else {
                if (!isRegister(vectorInst[3].slice(0, vectorInst[3].length - 1), opcodeT16)) {
                    return "ERRO: Formato não suportado / Formato esperado: LDRB Rd, [Rb, Ro] | LDRB Rd, [Rb, #Imm]"
                }
            }
            break;
        case "LDRH":
            // Confere disposição da instrução
            if (!(vectorInst.length === 4 && isRegister(vectorInst[1], opcodeT16) && vectorInst[2].includes("[") && vectorInst[3].includes("]") && isRegister(vectorInst[2].slice(1), opcodeT16))) {
                return "ERRO: Formato não suportado / Formato esperado: LDRH Rd, [Rb, Ro] | LDRH Rd, [Rb, #Imm]"
            }
            // Confere high register
            if (hasHighRegister(operandsT16, false)) {
                return "ERRO: Instrução não suporta high registers"
            }
            // Se tiver imediato
            if (lastOperand.includes("#")) {
                if (parseInt(lastOperand.slice(lastOperand.indexOf("#") + 1)) > 31) {
                    return "ERRO: Imediato maior que o valor máximo (31)"
                }
                if (parseInt(lastOperand.slice(lastOperand.indexOf("#") + 1)) < 0) {
                    return "ERRO: Imediato tem que ser positivo"
                }
            }
            else {
                if (!isRegister(vectorInst[3].slice(0, vectorInst[3].length - 1), opcodeT16)) {
                    return "ERRO: Formato não suportado / Formato esperado: LDRH Rd, [Rb, Ro] | LDRH Rd, [Rb, #Imm]"
                }
            }
            break;
        case "LDSB":
            if (!(vectorInst.length === 4 && isRegister(vectorInst[1], opcodeT16) && isRegister(vectorInst[2].slice(1), opcodeT16) && isRegister(vectorInst[3].slice(0, vectorInst[3].length - 1), opcodeT16))) {
                return "ERRO: Formato não suportado / Formato esperado: LDRSB Rd, [Rb, Ro]"
            }
            if (hasHighRegister(operandsT16, false)) {
                return "ERRO: Instrução não suporta high registers"
            }
            break;
        case "LDSH":
            if (!(vectorInst.length === 4 && isRegister(vectorInst[1], opcodeT16) && isRegister(vectorInst[2].slice(1), opcodeT16) && isRegister(vectorInst[3].slice(0, vectorInst[3].length - 1), opcodeT16))) {
                return "ERRO: Formato não suportado / Formato esperado: LRDSH Rd, [Rb, Ro]"
            }
            if (hasHighRegister(operandsT16, false)) {
                return "ERRO: Instrução não suporta high registers"
            }
            break;
        case "MOV": // e ASR, LSL, LSR e ROR
            opcodeT16 = verifyMOV(vectorInst)
            // Com rotação
            if (opcodeT16 === "ASR" || opcodeT16 === "LSL" || opcodeT16 === "LSR" || opcodeT16 === "ROR") {
                if(!(vectorInst.length === 5 && isRegister(vectorInst[1], opcodeT16) && isRegister(vectorInst[2], opcodeT16))){
                    return "ERRO: Formato não suportado / Formato esperado: MOV Rd, Rs, LSL, #Offset5 | MOV Rd, Rd, LSL, Rs |MOV Rd, #Offset8 | MOV Rd, Hd"
                }
                // Se tiver offset
                if (lastOperand.includes("#")) {
                    if (parseInt(lastOperand.slice(lastOperand.indexOf("#") + 1)) > 31) {
                        return "ERRO: Offset muito grande"
                    }
                    operandsT16 = ' ' + vectorInst[1] + ' ' + vectorInst[2] + ' ' + vectorInst[4]
                }
                // Com registrador
                else {
                    if (vectorInst[1] !== vectorInst[2]) {
                        return "ERRO: Formato não suportado / Formato esperado: MOV Rd, Rs, LSL, #Offset5 | MOV Rd, Rd, LSL, Rs |MOV Rd, #Offset8 | MOV Rd, Hd"
                    }
                    operandsT16 = ' ' + vectorInst[1] + ' ' + vectorInst[4]
                }
                if (hasHighRegister(operandsT16, false)) {
                    return "ERRO: Instrução não suporta high registers"
                }
            }
            else {
                if(!(vectorInst.length === 3 && isRegister(vectorInst[1], opcodeT16))){
                    return "ERRO: Formato não suportado / Formato esperado: MOV Rd, Rs, LSL, #Offset5 | MOV Rd, Rd, LSL, Rs |MOV Rd, #Offset8 | MOV Rd, Hd"
                }
                if (lastOperand.includes("#")) {
                    if (parseInt(lastOperand.slice(lastOperand.indexOf("#") + 1)) > 255) {
                        return "ERRO: Offset muito grande"
                    }
                    if (hasHighRegister(operandsT16, false)) {
                        return "ERRO: Instrução não suporta high registers"
                    }
                }
            }
            break;
        case "MUL":
            if (vectorInst.length !== 4 || !isRegister(vectorInst[1], opcodeT16) || !isRegister(vectorInst[2], opcodeT16) || !isRegister(vectorInst[3], opcodeT16)){
                return "ERRO: Formato não suportado / Formato esperado: MUL Rd, Rd, Rs"
            }
            if (vectorInst[1].includes(vectorInst[2])) {
                operandsT16 = ' ' + vectorInst[1] + ' ' + vectorInst[3]
            }
            else {
                if (vectorInst[1].includes(vectorInst[3])) {
                    operandsT16 = ' ' + vectorInst[1] + ' ' + vectorInst[2].slice(0, vectorInst[2].length - 1)
                }
                else {
                    return "ERRO: Formato não suportado / Formato esperado: MUL Rd, Rd, Rs"
                }
            }
            if (hasHighRegister(operandsT16, false)) {
                return "ERRO: Instrução não suporta high registers"
            }
            break;
        case "MVN":
            if (!(vectorInst.length === 3 && isRegister(vectorInst[1], opcodeT16) && isRegister(vectorInst[2], opcodeT16))) {
                return "ERRO: Formato não suportado / Formato esperado: MVN Rd, Rs"
            }
            if (hasHighRegister(operandsT16, false)) {
                return "ERRO: Instrução não suporta high registers"
            }
            break;
        case "NEG":
            opcodeT16 = verifyNEG(vectorInst)
            if (!(vectorInst.length === 4 && isRegister(vectorInst[1], opcodeT16) && isRegister(vectorInst[2], opcodeT16))) {
                return "ERRO: Formato não suportado / Formato esperado: RSBS Rd, Rs, #0"
            }
            operandsT16 = ' ' + vectorInst[1] + ' ' + vectorInst[2].slice(0, vectorInst[2].length - 1)
            if (hasHighRegister(operandsT16, false)) {
                return "ERRO: Instrução não suporta high registers"
            }
            break;
        case "ORR":
            if (vectorInst.length !== 4 || !isRegister(vectorInst[1], opcodeT16) || !isRegister(vectorInst[2], opcodeT16) || !isRegister(vectorInst[3], opcodeT16)){
                return "ERRO: Formato não suportado / Formato esperado: ORR Rd, Rd, Rs"
            }
            if (vectorInst[1].includes(vectorInst[2])) {
                operandsT16 = ' ' + vectorInst[1] + ' ' + vectorInst[3]
            }
            else {
                if (vectorInst[1].includes(vectorInst[3])) {
                    operandsT16 = ' ' + vectorInst[1] + ' ' + vectorInst[2].slice(0, vectorInst[2].length - 1)
                }
                else {
                    return "ERRO: Formato não suportado / Formato esperado: ORR Rd, Rd, Rs"
                }
            }
            if (hasHighRegister(operandsT16, false)) {
                return "ERRO: Instrução não suporta high registers"
            }
            break;
        case "SBC":
            if (vectorInst.length !== 4 || !isRegister(vectorInst[1], opcodeT16) || !isRegister(vectorInst[2], opcodeT16) || !isRegister(vectorInst[3], opcodeT16)){
                return "ERRO: Formato não suportado / Formato esperado: SBC Rd, Rd, Rs"
            }
            if (vectorInst[1] !== vectorInst[2]) {
                return "ERRO: Formato não suportado / Formato esperado: SBC Rd, Rd, Rs"
            }
            operandsT16 = ' ' + vectorInst[1] + ' ' + vectorInst[3]
            if (hasHighRegister(operandsT16, false)) {
                return "ERRO: Instrução não suporta high registers"
            }
            break;
        case "STMIA": // e PUSH
            opcodeT16 = verifyPUSH(vectorInst)
            if (!(isRegister(vectorInst[1], opcodeT16) && vectorInst[1].slice(vectorInst[1].length - 2, vectorInst[1].length - 1) === "!" && vectorInst[2].includes("{") && vectorInst[vectorInst.length - 1].includes("}"))) {
                return "ERRO: Formato não suportado / Formato esperado: STMIA Rb!, { Rlist }"
            }
            // Se for PUSH 
            if (opcodeT16 === "PUSH") {
                operandsT16 = ' ' + inst.slice(inst.indexOf("{"))
                // Se o rlist tiver R14
                if (operandsT16.includes(",")) {
                    if (!operandsT16.slice(operandsT16.lastIndexOf(",")).includes("R14") || hasHighRegister(operandsT16.slice(0, operandsT16.lastIndexOf(",")), false)) {
                        return "ERRO: Instrução não suporta high registers (apenas o R13 no endereço base ou o R14 na lista)"
                    }
                }
                else {
                    if (hasHighRegister(operandsT16, false)) {
                        return "ERRO: Instrução não suporta high registers (apenas o R13 no endereço base ou o R14 na lista)"
                    }
                }
            }
            // Se for STMIA
            else {
                if (hasHighRegister(operandsT16, false)) {
                    return "ERRO: Instrução não suporta high registers (apenas o R13 no endereço base em caso de STMDB)"
                }
            }
            break;
        case "STR":
            // Confere disposição da instrução
            if (!(vectorInst.length === 4 && isRegister(vectorInst[1], opcodeT16) && vectorInst[2].includes("[") && vectorInst[3].includes("]") && isRegister(vectorInst[2].slice(1), opcodeT16))) {
                return "ERRO: Formato não suportado / Formato esperado: STR Rd, [Rb, Ro] | STR Rd, [Rb, #Imm]"
            }
            // Confere primeiro registrador
            if (hasHighRegister(vectorInst[1], false)) {
                return "ERRO: Instrução não suporta high registers (apenas R13 ou R15 no registrador de destino com imediato)"
            }
            // Se tiver imediato
            if (lastOperand.includes("#")) {
                if (hasHighRegister(operandsT16, false)) {
                    if (!vectorInst[2].includes("R13")) {
                        return "ERRO: Instrução não suporta high registers (apenas R13 no registrador de destino com imediato)"
                    }
                    if (parseInt(lastOperand.slice(lastOperand.indexOf("#") + 1)) > 255) {
                        return "ERRO: Imediato maior que o valor máximo (255)"
                    }
                }
                else {
                    if (parseInt(lastOperand.slice(lastOperand.indexOf("#") + 1)) > 31) {
                        return "ERRO: Imediato maior que o valor máximo (31)"
                    }
                }
            }
            // Sem imediato
            else {
                if (hasHighRegister(operandsT16, false)) {
                    return "ERRO: Instrução não suporta high registers (apenas R13 no registrador de destino com imediato)"
                }
            }
            break;
        case "STRB":
            // Confere disposição da instrução
            if (!(vectorInst.length === 4 && isRegister(vectorInst[1], opcodeT16) && vectorInst[2].includes("[") && vectorInst[3].includes("]") && isRegister(vectorInst[2].slice(1), opcodeT16))) {
                return "ERRO: Formato não suportado / Formato esperado: STRB Rd, [Rb, Ro] | STRB Rd, [Rb, #Imm]"
            }
            if (hasHighRegister(operandsT16, false)) {
                return "ERRO: Instrução não suporta high registers"
            }
            break;
        case "STRH":
            // Confere disposição da instrução
            if (!(vectorInst.length === 4 && isRegister(vectorInst[1], opcodeT16) && vectorInst[2].includes("[") && vectorInst[3].includes("]") && isRegister(vectorInst[2].slice(1), opcodeT16))) {
                return "ERRO: Formato não suportado / Formato esperado: STRH Rd, [Rb, Ro] | STRH Rd, [Rb, #Imm]"
            }
            if (hasHighRegister(operandsT16, false)) {
                return "ERRO: Instrução não suporta high registers"
            }
            break;
        case "SWI":
            if (!(vectorInst.length === 2 && parseInt(vectorInst[1]))) {
                return "ERRO: Formato não suportado / Formato esperado: SWI Value8"
            }
            if (parseInt(vectorInst[1]) > 255) {
                return "ERRO: Valor maior que o máximo (255)"
            }
            break;
        case "SUB":
            if (!(vectorInst.length === 4 && isRegister(vectorInst[1], opcodeT16) && isRegister(vectorInst[2], opcodeT16))) {
                return "ERRO: Formato não suportado / Formato esperado: SUB Rd, Rs, Rn | SUB Rd, Rs, #Offset3 | SUB Rd, #Offset8 | SUB R13, R13, #Imm"
            }
            opcodeT16 = verifySUB(vectorInst)
            if (opcodeT16 === "ADD") {
                operandsT16 = ' ' + vectorInst[1] + ' #-' + vectorInst[3].slice(1)
                if (parseInt(lastOperand.slice(lastOperand.indexOf("#") + 1)) > 127) {
                    return "ERRO: Imediato muito grande"
                }
            }
            // Se tiver offset
            else {
                if (lastOperand.includes("#")) {
                    // Se offset tiver até 3 bits, mantém operandos
                    // Se offset tiver mais que 3 e até 8 bits:
                    if (parseInt(lastOperand.slice(lastOperand.indexOf("#") + 1)) > 7 && parseInt(lastOperand.slice(lastOperand.indexOf("#") + 1)) <= 255) {
                        if (vectorInst[1] !== vectorInst[2]) {
                            return "ERRO: Formato não suportado (Rd := Rn - offset8) / Formato esperado: Rd := Rd - offset8"
                        }
                        operandsT16 = ' ' + vectorInst[1] + ' ' + vectorInst[3]
                    }
                }
            }
            if (hasHighRegister(operandsT16, false)) {
                return "ERRO: Instrução não suporta high registers"
            }
            break;
        case "TST":
            if (!(vectorInst.length === 3 && isRegister(vectorInst[1], opcodeT16) && isRegister(vectorInst[2], opcodeT16))) {
                return "ERRO: Formato não suportado / Formato esperado: TST Rd, Rs"
            }
            if (hasHighRegister(operandsT16, false)) {
                return "ERRO: Instrução não suporta high registers"
            }
            break;
        default:
            break;
    }

    if (opcodeT16 !== "UEPA") {
        operandsT16 = operandsT16.replace(/R13/gi, "SP")
        operandsT16 = operandsT16.replace(/R14/gi, "LR")
        operandsT16 = operandsT16.replace(/R15/gi, "PC")
        return opcodeT16 + operandsT16
    }

    if (matrixA32[0].some(x => x === simplifyOpcodeA32(vectorInst[0]))) {
        if(simplifyOpcodeA32(vectorInst[0]) !== "RSB"){
            return "ATENÇÃO: instrução " + simplifyOpcodeA32(vectorInst[0]) + " não tem mapeamento para T16"
        }
        else{
            return "ERRO: Formato não suportado / Formato esperado: RSBS Rd, Rs, #0"
        }   
    }
    return "ERRO: Operação não existente"
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
    if (instr[1].includes("R13") && instr[2].includes("R13") && instr[3].includes("#")) {
        return "ADD"
    }
    return "SUB"
}

const hasHighRegister = (operands: string, specialFlag: boolean) => {
    let vectorHighReg = ["R8", "R9", "R10", "R11", "R12", "R13", "R14", "R15"]
    let maxlength = specialFlag ? 5 : 8

    for (let i = 0; i < maxlength; i++) {
        if (operands.includes(vectorHighReg[i])) {
            return true
        }
    }

    return false
}

const isRegister = (operand: string, opcode: string) => {
    let firstChar = operand.slice(0, 1)
    let extraLength = (operand.includes("!") && (opcode === "LDMIA" || opcode === "STMIA")) ? operand.indexOf("!") : (operand.includes(",") ? operand.indexOf(",") : operand.length)
    let extraChars = operand.slice(1, extraLength)

    if ((firstChar === "R" && Number(extraChars) >= 0 && Number(extraChars) <= 15) || firstChar + extraChars === "SP" || firstChar + extraChars === "LR" || firstChar + extraChars === "PC") {
        return true
    }

    return false
}

let teste1 = ArmToThumb("STMDB R13!, {R1-R3, R14}")
let teste2 = ArmToThumb("stmdb R13!, {R1-R3, R14}")
let teste3 = ArmToThumb("LDMIA R13!, {R1, R3, R15}")
let teste4 = ArmToThumb("ldmia R13!, {R1, R2, R14}")

console.log(teste1 + "\n" + teste2 + "\n" + teste3 + "\n" + teste4 + "\n")

export { }