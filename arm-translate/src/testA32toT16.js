var vectorT16 = ["UND", "ADC", "ADD", "AND", "B", "BIC", "BL", "BX", "CMN", "CMP", "EOR", "LDMIA", "LDR", "LDRB", "LDRH", "LDSB", "LDSH", "MOV", "MUL", "MVN", "NEG", "ORR", "POP", "PUSH", "SBC", "STMIA", "STR", "STRB", "STRH", "SWI", "SUB", "TST"];
var matrixA32 = [["ADC", "ADD", "AND", "B", "BIC", "BL", "BX", "CDP", "CMN", "CMP", "EOR", "LDC", "LDM", "LDR", "LDRB", "LDRH", "LDRSB", "LDRSH", "MCR", "MLA", "MOV", "MRC", "MRS", "MSR", "MUL", "MVN", "ORR", "RSB", "RSC", "SBC", "STC", "STM", "STR", "STRB", "STRH", "SUB", "SWI", "SWP", "TEQ", "TST"],
    [1, 2, 3, 4, 5, 6, 7, 0, 8, 9, 10, 0, 11, 12, 13, 14, 15, 16, 0, 18, 17, 0, 0, 0, 18, 19, 21, 20, 0, 24, 0, 25, 26, 27, 28, 30, 29, 0, 0, 31]];
var vectorCond = ["EQ", "NE", "CS", "CC", "MI", "PL", "VS", "VC", "HI", "LS", "GE", "LT", "GT", "LE", "AL", ""];
var vectorAddr = ["ED", "FD", "EA", "FA", "IB", "IA", "DB", "DA"];
var ArmToThumb = function (inst) {
    var vectorInst = inst.split(' ');
    var opcodeT16 = GetOpcodeT16(vectorInst[0]);
    var operandsT16 = inst.slice(vectorInst[0].length);
    var lastOperand = vectorInst[vectorInst.length - 1];
    switch (opcodeT16) {
        case "ADC":
            if (vectorInst[1] != vectorInst[2]) {
                return "ERRO: Formato não suportado (Rd := Rn + Rs + C-bit) / Formato esperado: Rd := Rd + Rs + C-bit";
            }
            operandsT16 = ' ' + vectorInst[1] + ' ' + vectorInst[3];
            break;
        case "ADD":
            // Se tiver offset
            if (lastOperand.includes("#")) {
                // Se offset tiver até 3 bits, mantém operandos
                // Se offset tiver mais que 3 e até 8 bits:
                if (parseInt(lastOperand.slice(lastOperand.indexOf("#") + 1)) > 7 && parseInt(lastOperand.slice(lastOperand.indexOf("#") + 1)) <= 255) {
                    if (vectorInst[1] != vectorInst[2]) {
                        return "ERRO: Formato não suportado (Rd := Rn + offset8) / Formato esperado: Rd := Rd + offset8";
                    }
                    operandsT16 = ' ' + vectorInst[1] + ' ' + vectorInst[3];
                }
            }
            break;
        case "AND":
            if (vectorInst[1] != vectorInst[2]) {
                return "ERRO: Formato não suportado (Rd := Rn AND Rs) / Formato esperado: Rd := Rd AND Rs";
            }
            operandsT16 = ' ' + vectorInst[1] + ' ' + vectorInst[3];
            break;
        case "B":
            opcodeT16 = verifyB(vectorInst[0]);
            break;
        case "BIC":
            if (vectorInst[1] != vectorInst[2]) {
                return "ERRO: Formato não suportado (Rd := Rn AND NOT Rs) / Formato esperado: Rd := Rd AND NOT Rs";
            }
            operandsT16 = ' ' + vectorInst[1] + ' ' + vectorInst[3];
            break;
        case "BL":
            break;
        case "BX":
            break;
        case "CMN":
            break;
        case "CMP":
            break;
        case "EOR":
            if (vectorInst[1] != vectorInst[2]) {
                return "ERRO: Formato não suportado (Rd := Rn EOR Rs) / Formato esperado: Rd := Rd EOR Rs";
            }
            operandsT16 = ' ' + vectorInst[1] + ' ' + vectorInst[3];
            break;
        case "LDMIA": // e POP
            opcodeT16 = verifyPOP(vectorInst[1]);
            if (opcodeT16 == "POP") {
                operandsT16 = ' ' + inst.slice(inst.indexOf("{"));
            }
            break;
        case "LDR":
            break;
        case "LDRB":
            break;
        case "LDRH":
            break;
        case "LDSB":
            break;
        case "LDSH":
            break;
        case "MOV": // e ASR, LSL, LSR e ROR
            opcodeT16 = verifyMOV(vectorInst);
            // Com rotação
            if (opcodeT16 == "ASR" || opcodeT16 == "LSL" || opcodeT16 == "LSR" || opcodeT16 == "ROR") {
                // Se tiver offset
                if (lastOperand.includes("#")) {
                    if (parseInt(lastOperand.slice(lastOperand.indexOf("#") + 1)) > 31) {
                        return "ERRO: Offset muito grande";
                    }
                    operandsT16 = ' ' + vectorInst[1] + ' ' + vectorInst[2] + ' ' + vectorInst[4];
                }
                // Com registrador
                else {
                    if (vectorInst[1] != vectorInst[2]) {
                        return "ERRO: Formato não suportado (Rd := Rn EOR Rs) / Formato esperado: Rd := Rd EOR Rs";
                    }
                    operandsT16 = ' ' + vectorInst[1] + ' ' + vectorInst[4];
                }
            }
            else {
                if (lastOperand.includes("#")) {
                    if (parseInt(lastOperand.slice(lastOperand.indexOf("#") + 1)) > 255) {
                        return "ERRO: Offset muito grande";
                    }
                }
            }
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
        return opcodeT16 + operandsT16;
    }
    return "UEPA";
};
var simplifyOpcodeA32 = function (opcodeA32) {
    var _loop_1 = function (i) {
        var auxSliced = opcodeA32.slice(0, i);
        var auxExtra = opcodeA32.slice(i);
        if (matrixA32[0].some(function (x) { return x === auxSliced; }) && (vectorCond.some(function (x) { return x === auxExtra || x + 'S' === auxExtra; }) || vectorAddr.some(function (x) { return x === auxExtra; }))) {
            return { value: auxSliced };
        }
    };
    for (var i = 1; i <= opcodeA32.length; i++) {
        var state_1 = _loop_1(i);
        if (typeof state_1 === "object")
            return state_1.value;
    }
    return opcodeA32;
};
var GetOpcodeT16 = function (opcodeA32) {
    opcodeA32 = simplifyOpcodeA32(opcodeA32);
    var instPos = matrixA32[0].findIndex(function (x) { return x === opcodeA32; });
    if (instPos >= 0) {
        return vectorT16[Number(matrixA32[1][instPos])];
    }
    return "UEPA";
};
var verifyMOV = function (vectorInst) {
    if (vectorInst.length > 3) {
        return vectorInst[3];
    }
    return "MOV";
};
var verifyB = function (opcode) {
    if (opcode.length > 1 && !opcode.includes("AL")) {
        return opcode;
    }
    return "B";
};
var verifyPOP = function (operand) {
    if (operand.includes("R13")) {
        return "POP";
    }
    return "LDMIA";
};
var verifyPUSH = function (instr) {
    if (instr[0] === "STMDB") {
        if (instr[1].includes("R13")) {
            return "PUSH";
        }
    }
    return "STMIA";
};
var verifyNEG = function (instr) {
    if (instr[instr.length - 1].includes("#0")) {
        return "NEG";
    }
    return "UEPA";
};
var teste1 = ArmToThumb("MOVS R0, R2, LSL #20");
var teste2 = ArmToThumb("MOVS R0, R2, LSL #40");
var teste3 = ArmToThumb("MOVS R0, #40");
var teste4 = ArmToThumb("MOVS R0, #256");
console.log(teste1 + "\n" + teste2 + "\n" + teste3 + "\n" + teste4);
