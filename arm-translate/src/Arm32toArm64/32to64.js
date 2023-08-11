"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.A32ToA64 = void 0;
var vectorCond = ["EQ", "NE", "CS", "HS", "CC", "LO", "MI", "PL", "VS", "VC", "HI", "LS", "GE", "LT", "GT", "LE", "AL", "S"];
//rever isso, talvez tenha que ver em cada caso
var shiftCodes = ["LSL", "LSR", "ASR", "ROR"];
var instructions32to64 = {
    "ADC": "ADC",
    "ADD": "ADD",
    "AND": "AND",
    "B": "B",
    "BIC": "BIC",
    "BL": "BL",
    "BX": "BR",
    "CMN": "CMN",
    "CMP": "CMP",
    "EOR": "EOR",
    "LDR": "LDR",
    // "LDRB"  :  "LDRB",
    // "LDRH"  :  "LDRH",
    // "LDRSB" :  "LDRSB",
    // "LDRSH" :  "LDRSH",
    "MLA": "MADD",
    "MOV": "MOV",
    "MUL": "MUL",
    "MVN": "MVN",
    "ORR": "ORR",
    "SBC": "SBC",
    "STR": "STR",
    // "STRB"  :  "STRB",
    // "STRH"  :  "STRH",
    "SUB": "SUB",
    "TST": "TST"
};
//mapeando valores significativos de cada instrucao
// (quantidade de operandos, a posicao dos registradores e a posicao da instrucao de shift )
var partes_e_registradores = {
    "ADC": [[3], [[1, 1, 1]], [0]],
    "ADD": [[3, 3, 5, 5], [[1, 1, 1], [1, 1, 0], [1, 1, 0, 0, 0], [1, 1, 1, 0, 0]], [0, 0, 4, 4]],
    "AND": [[3, 3, 5], [[1, 1, 0], [1, 1, 1], [1, 1, 1, 0, 0]], [0, 0, 4]],
    "B": [[], [[]], []],
    "BIC": [[3, 5], [[1, 1, 1], [1, 1, 1, 0, 0]], [0, 4]],
    "BL": [[], [[]], []],
    "BR": [[1], [[1]], [0]],
    "CMN": [[2, 4, 2, 4], [[1, 1], [1, 1, 0, 0], [1, 0], [1, 0, 0, 0]], [0, 0, 0, 0]],
    "CMP": [[2, 4, 2, 4], [[1, 1], [1, 1, 0, 0], [1, 0], [1, 0, 0, 0]], [0, 0, 0, 0]],
    "EOR": [[3, 5, 3], [[1, 1, 0], [1, 1, 1, 0, 0], [1, 1, 1]], [0, 4, 0]],
    "LDR": [[3, 2, 3, 5], [[1, 1, 0], [1, 0], [1, 1, 1], [1, 1, 1, 0, 0]], [0, 0, 0, 4]],
    // "LDRB"  :,
    // "LDRH"  :,
    // "LDRSB" :,
    // "LDRSH" :,
    "MADD": [[4], [[1, 1, 1, 1]], [0]],
    "MOV": [[2, 2], [[1, 0], [1, 1]], [0, 0]],
    "MUL": [[3], [[1, 1, 1]], [0]],
    "MVN": [[2, 4], [[1, 1], [1, 1, 0, 0]], [0, 3]],
    "ORR": [[3, 5], [[1, 1, 0], [1, 1, 1, 0, 0]], [0, 4]],
    "SBC": [[3], [[1, 1, 1]], [0]],
    "STR": [[3, 2, 3, 5], [[1, 1, 0], [1, 0], [1, 1, 1], [1, 1, 1, 0, 0]], [0, 0, 0, 4]],
    // "STRB"  :,
    // "STRH"  :,
    "SUB": [[3, 3, 5, 5], [[1, 1, 1], [1, 1, 0], [1, 1, 0, 0, 0], [1, 1, 1, 0, 0]], [0, 0, 4, 4]],
    "TST": [[2, 2, 4], [[1, 0], [1, 1], [1, 1, 0, 0]], [0, 0, 3]]
};
var A32ToA64 = function (inst) {
    var vectorInst = inst.toUpperCase().split(' ');
    var interOut = GetopcodeA64(vectorInst[0]);
    if (interOut === null)
        return "Não foi possivel encontrar a instrução";
    var opcodeA64 = interOut[0];
    var setSignal = interOut[1];
    var auxExtra = interOut[2];
    var nullVector = [0];
    var disposicaoRegsShift = verifyRegs(vectorInst, opcodeA64);
    console.log(disposicaoRegsShift);
    if (disposicaoRegsShift === null)
        return "Erro na disposição dos registradores para a tradução para A64";
    var shiftCorrect = verifyShift(vectorInst, disposicaoRegsShift[1]);
    if (!shiftCorrect && disposicaoRegsShift === nullVector)
        return "Erro no Barrel Shift para a tradução para A64";
    // let operandsA64 = inst.slice(vectorInst[0].length);
    switch (opcodeA64) {
        case "B": //unico caso que mantem o condicional, mas adiciona um ponto
            if (auxExtra !== "")
                opcodeA64 = opcodeA64 + "." + auxExtra + " ";
            if (vectorInst.length === 2)
                return opcodeA64 + " " + vectorInst[1];
            return null;
        case "BR":
            if (vectorInst.length === 2 && auxExtra !== "")
                return instructionCond(opcodeA64 + " " + vectorInst[1], auxExtra);
            else if (vectorInst.length === 2)
                return opcodeA64 + " " + vectorInst[1];
            return null;
        case "STR":
        case "LDR": //registrador precisa ser X
            vectorInst[2] = vectorInst[2].replace("R", "X");
            if (disposicaoRegsShift[0].length === 5)
                if (vectorInst[4] !== "LSL")
                    return "Operação shift inválida para A64, não é permitido o \"" + vectorInst[4] + "\"";
            break;
        case "CMP":
            break;
        case "CMN":
            break; //ele utiliza o extend, precisaria mapear e verificar
        default:
            break;
    }
    var wholeInstruction = treatRegistors(opcodeA64, setSignal, vectorInst, disposicaoRegsShift[0]);
    if (auxExtra !== "" && auxExtra !== "S")
        wholeInstruction = instructionCond(wholeInstruction, auxExtra);
    return wholeInstruction;
};
exports.A32ToA64 = A32ToA64;
var GetopcodeA64 = function (opcodeA32) {
    var padraoBranch = new RegExp("^B(".concat(vectorCond.join('|'), ")$"));
    var padraoBranchLink = new RegExp("^BL(".concat(vectorCond.join('|'), ")$"));
    //verifica se são Branches
    if (padraoBranch.test(opcodeA32))
        return ["B", "", opcodeA32.slice(1)];
    else if (padraoBranchLink.test(opcodeA32))
        return ["BL", "", opcodeA32.slice(2)];
    var condicionais_e_S = new RegExp("^(".concat(vectorCond.join('|'), ")S$"));
    var auxExtra = opcodeA32.slice(3);
    opcodeA32 = simplifyOpcodeA32(opcodeA32);
    var interInstruction = instructions32to64[opcodeA32];
    if (condicionais_e_S.test(auxExtra))
        return [interInstruction, "S", auxExtra.slice(0, 2)];
    if (interInstruction !== "") {
        if (auxExtra === "S") //values
            return [interInstruction, "S", auxExtra];
        else
            return [interInstruction, "", auxExtra];
    }
    return null;
};
var simplifyOpcodeA32 = function (opcodeA32) {
    var _loop_1 = function (i) {
        var auxSliced = opcodeA32.slice(0, i);
        var auxExtra = opcodeA32.slice(i);
        if (Object.keys(instructions32to64).some(function (x) { return x === auxSliced; }) && vectorCond.some(function (x) { return x === auxExtra || x + 'S' === auxExtra; })) {
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
var verifyRegs = function (vectorInst, opcodeA64) {
    var arrayInfos = [[], 0];
    var infos_operandos = partes_e_registradores[opcodeA64];
    console.log(infos_operandos.length);
    if (infos_operandos[0].length === 0)
        return arrayInfos;
    for (var i = 0; i < infos_operandos[0].length; i++) {
        if (vectorInst.length - 1 === infos_operandos[0][i]) {
            for (var j = 0; j < infos_operandos[0][i]; j++) {
                if (/R(1[0-5]|[0-9])/.test(vectorInst[j + 1])) {
                    if (infos_operandos[1][i][j] === 1) {
                        if (j + 1 === infos_operandos[0][i]) {
                            arrayInfos = [infos_operandos[1][i], infos_operandos[2][i]];
                            return arrayInfos;
                        }
                    }
                    else
                        break;
                }
                else if (infos_operandos[1][i][j] === 0) {
                    if (j + 1 === infos_operandos[0][i]) {
                        arrayInfos = [infos_operandos[1][i], infos_operandos[2][i]];
                        return arrayInfos;
                    }
                }
                else
                    break;
            }
        }
    }
    return null;
};
var verifyShift = function (vectorInst, posicaoShift) {
    var posicaoShiftReal = -1;
    for (var i = 0; i < shiftCodes.length && posicaoShiftReal === -1; i++) {
        if (vectorInst.indexOf(shiftCodes[i]) === posicaoShift || posicaoShift === 0)
            return true;
    }
    return false;
};
var treatRegistors = function (opcodeA64, setSignal, vectorInst, disposicaoRegs) {
    var tudaoInstruction = opcodeA64 + setSignal + " ";
    for (var i = 1; i < disposicaoRegs.length + 1; i++) {
        if (disposicaoRegs[i - 1])
            tudaoInstruction = tudaoInstruction + vectorInst[i].replace("R", "W") + " ";
        else
            tudaoInstruction = tudaoInstruction + vectorInst[i] + " ";
    }
    return tudaoInstruction;
};
var instructionCond = function (wholeInstruction, auxExtra) {
    var structPadInstCond = "B.COND branch \nexit: \n\tB exit \nbranch: \n\tINSTRUCAO \n\tB exit\n*essa é uma alternativa, existem outras válidas";
    return structPadInstCond.replace("COND", auxExtra).replace("INSTRUCAO", wholeInstruction);
};
var teste1 = (0, exports.A32ToA64)("ADDEQS R0, R0, R0");
var teste2 = (0, exports.A32ToA64)("MOVLE R1, R1");
var teste3 = (0, exports.A32ToA64)("STR R1, [R2, R4]!");
console.log(teste1 + "\n\n");
console.log(teste2 + "\n\n");
console.log(teste3);
