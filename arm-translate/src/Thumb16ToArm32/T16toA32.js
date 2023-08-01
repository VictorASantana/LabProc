var matrixT16 = [["ADC", "ADD", "AND", "B", "BIC", "BL", "BX", "CMN", "CMP", "EOR", "LDMIA", "LDR", "LDRB", "LDRH", "LDSB", "LDSH", "MOV", "MUL", "MVN", "NEG", "ORR", "POP", "PUSH", "SBC", "STMIA", "STR", "STRB", "STRH", "SWI", "SUB", "TST"], [1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 13, 14, 15, 16, 17, 18, 21, 25, 26, 28, 27, 13, 32, 30, 32, 33, 34, 35, 37, 36, 40]];
var vectorA32 = ["UND", "ADC", "ADD", "AND", "B", "BIC", "BL", "BX", "CDP", "CMN", "CMP", "EOR", "LDC", "LDM", "LDR", "LDRB", "LDRH", "LDRSB", "LDRSH", "MCR", "MLA", "MOV", "MRC", "MRS", "MSR", "MUL", "MVN", "ORR", "RSB", "RSC", "SBC", "STC", "STM", "STR", "STRB", "STRH", "SUB", "SWI", "SWP", "TEQ", "TST"];
var ThumbToArm = function (inst) {
    inst = inst.toUpperCase();
    var vectorInst = inst.split(' ');
    var opcodeT16 = GetOpcodeOnly(vectorInst[0]);
    var operandsT16 = inst.slice(vectorInst[0].length);
    var lastOperand = vectorInst[vectorInst.length - 1];
    switch (opcodeT16) {
        case "ADC":
            if (vectorInst.length > 3 || !isRegister(vectorInst[1]) || !isRegister(vectorInst[2])) {
                return "ERRO: Formato não suportado / Formato esperado: ADC Rd, Rs";
            }
            if (hasHighRegisterThumb(operandsT16, false)) {
                return "ERRO: Instrução não suporta high registers";
            }
            operandsT16 = ' ' + vectorInst[1] + ' ' + vectorInst[1] + ' ' + vectorInst[2];
            break;
        case "ADD":
            return "FALTA: instrução ainda não traduzida";
            break;
        case "AND":
            if (vectorInst.length > 3 || !isRegister(vectorInst[1]) || !isRegister(vectorInst[2])) {
                return "ERRO: Formato não suportado / Formato esperado: AND Rd, Rs";
            }
            if (hasHighRegisterThumb(operandsT16, false)) {
                return "ERRO: Instrução não suporta high registers";
            }
            operandsT16 = ' ' + vectorInst[1] + ' ' + vectorInst[1] + ' ' + vectorInst[2];
            break;
        case "B":
            return "FALTA: instrução ainda não traduzida";
            break;
        case "BIC":
            if (vectorInst.length > 3 || !isRegister(vectorInst[1]) || !isRegister(vectorInst[2])) {
                return "ERRO: Formato não suportado / Formato esperado: BIC Rd, Rs";
            }
            if (hasHighRegisterThumb(operandsT16, false)) {
                return "ERRO: Instrução não suporta high registers";
            }
            operandsT16 = ' ' + vectorInst[1] + ' ' + vectorInst[1] + ' ' + vectorInst[2];
            break;
        case "BL":
            if (vectorInst.length > 2 || isRegister(vectorInst[1])) {
                return "ERRO: Formato não suportado / Formato esperado: BL label";
            }
            break;
        case "BX":
            if (vectorInst.length > 2 || !isRegister(vectorInst[1])) {
                return "ERRO: Formato não suportado / Formato esperado: BX Rs";
            }
            break;
        default:
            if (matrixT16[0].some(function (x) { return x === opcodeT16; })) {
                return "ATENÇÃO: instrução esquecida - " + opcodeT16;
            }
            break;
    }
    if (opcodeT16 != "UEPA") {
        operandsT16 = operandsT16.replace(/SP/gi, "R13");
        operandsT16 = operandsT16.replace(/LR/gi, "R14");
        operandsT16 = operandsT16.replace(/SP/gi, "R15");
        return opcodeT16 + operandsT16;
    }
    return "ERRO: Operação não existente";
};
var GetOpcodeOnly = function (fullOpcode) {
    var vectorCond = ["EQ", "NE", "CS", "CC", "MI", "PL", "VS", "VC", "HI", "LS", "GE", "LT", "GT", "LE", "AL", ""];
    var auxSliced = fullOpcode.slice(0, 1);
    var auxExtra = fullOpcode.slice(1);
    if (auxSliced === "B" && (vectorCond.some(function (x) { return x === auxExtra || x + 'S' === auxExtra; }))) {
        return "B";
    }
    return fullOpcode;
};
var hasHighRegisterThumb = function (operands, specialFlag) {
    var vectorHighReg = ["R8", "R9", "R10", "R11", "R12", "R13", "R14", "R15", "SP", "LR", "PC"];
    var maxlength = specialFlag ? 5 : vectorHighReg.length;
    for (var i = 0; i < maxlength; i++) {
        if (operands.includes(vectorHighReg[i])) {
            return true;
        }
    }
    return false;
};
var isRegister = function (operand) {
    var firstChar = operand.slice(0, 1);
    var extraChars = operand.slice(1, (operand.includes(",") ? operand.indexOf(",") : operand.length));
    if ((firstChar === "R" && Number(extraChars) >= 0 && Number(extraChars) <= 15) || firstChar + extraChars === "SP" || firstChar + extraChars === "LR" || firstChar + extraChars === "PC") {
        return true;
    }
    return false;
};
var test1 = ThumbToArm("BX arroz, faraway");
var test2 = ThumbToArm("BX longe");
var test3 = ThumbToArm("BX R1");
var test4 = ThumbToArm("BX SP");
console.log(test1 + "\n" + test2 + "\n" + test3 + "\n" + test4 + "\n");
