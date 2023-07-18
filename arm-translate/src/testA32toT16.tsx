let vectorT16 = ["UND", "ADC", "ADD", "AND", "B", "BIC", "BL", "BX", "CMN", "CMP", "EOR", "LDMIA", "LDR", "LDRB", "LDRH", "LDSB", "LDSH", "MOV", "MUL", "MVN", "NEG", "ORR", "POP", "PUSH", "SBC", "STMIA", "STR", "STRB", "STRH", "SWI", "SUB", "TST"]
let matrixA32 = [["ADC", "ADD", "AND", "B", "BIC", "BL", "BX", "CDP", "CMN", "CMP", "EOR", "LDC", "LDM", "LDR", "LDRB", "LDRH", "LDRSB", "LDRSH", "MCR", "MLA", "MOV", "MRC", "MRS", "MSR", "MUL", "MVN", "ORR", "RSB", "RSC", "SBC", "STC", "STM", "STR", "STRB", "STRH", "SUB", "SWI", "SWP", "TEQ", "TST"],
[1, 2, 3, 4, 5, 6, 7, 0, 8, 9, 10, 0, 11, 12, 13, 14, 15, 16, 0, 18, 17, 0, 0, 0, 18, 19, 21, 20, 0, 24, 0, 25, 26, 27, 28, 30, 29, 0, 0, 31]]
let vectorCond = ["EQ", "NE", "CS", "HS", "CC", "LO", "MI", "PL", "VS", "VC", "HI", "LS", "GE", "LT", "GT", "LE", "AL", ""]
let vectorAddr = ["ED", "FD", "EA", "FA", "IB", "IA", "DB", "DA"];



const ArmToThumb = (inst: string) => {
    let vectorInst = inst.split(' ')

    let opcodeT16 = GetOpcodeT16(vectorInst[0])

    switch (opcodeT16) {
        case "MOV":
            opcodeT16 = verifyMOV(vectorInst)
            vectorInst.splice(3, 1)
            inst = vectorInst.toString().replace(/,,/g, ', ').replace(/,/, ' ')
            break;
        case "B":
            opcodeT16 = verifyB(vectorInst[0])
            break;
        case "LDMIA":
            opcodeT16 = verifyPOP(vectorInst[1]);
            break;
        case "STMIA":
            opcodeT16 = verifyPUSH(vectorInst);
            break;
        case "NEG":
            opcodeT16 = verifyNEG(vectorInst);
            break;
        default:
            break;
    }

    if (opcodeT16 !== "UEPA") {
        let operandsT16 = inst.slice(vectorInst[0].length)
        return opcodeT16 + operandsT16;
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
    if (opcode.length > 1) {
        return opcode;
    }
    return "B"
}

const verifyPOP = (operand: string) => {
    if (operand.includes("R13")) {
        return "POP";
    }
    console.log(operand);
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

let teste1 = ArmToThumb("RSBS R0, R1, #0")
let teste2 = ArmToThumb("RSBEQS R1, R2, R3")
let teste3 = ArmToThumb("BLEQ R7")
let teste4 = ArmToThumb("STMDB R13!, {R1, R2}")

console.log(teste1 + "\n" + teste2 + "\n" + teste3 + "\n" + teste4)

// TAMANHO DE REGISTRADORES (Hi e Lo)