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
            if (vectorInst.length != 3 || !isRegister(vectorInst[1], opcodeT16) || !isRegister(vectorInst[2], opcodeT16)) {
                return "ERRO: Formato não suportado / Formato esperado: ADC Rd, Rs";
            }
            if (hasHighRegisterThumb(operandsT16, false)) {
                return "ERRO: Instrução não suporta high registers";
            }
            opcodeT16 = opcodeT16 + "S";
            operandsT16 = ' ' + vectorInst[1] + ' ' + vectorInst[1] + ' ' + vectorInst[2];
            break;
        case "ADD":
            // Casos com 3 operandos
            if (vectorInst.length == 4 && isRegister(vectorInst[1], opcodeT16) && isRegister(vectorInst[2], opcodeT16)) {
                // Último operando é imediato/offset
                if (lastOperand.includes("#")) {
                    if (hasHighRegisterThumb(vectorInst[1], false)) {
                        return "ERRO: Instrução não suporta high registers (apenas R13 e R15 no segundo operando desse formato)";
                    }
                    // Segundo operando é Lo register
                    if (!hasHighRegisterThumb(vectorInst[2], false)) {
                        if (parseInt(lastOperand.slice(lastOperand.indexOf("#") + 1)) > 7) {
                            return "ERRO: Imediato maior que o valor máximo (7)";
                        }
                        opcodeT16 = "ADDS";
                    }
                    else {
                        // Segundo operando é PC ou SP
                        if (vectorInst[2].includes("R13") || vectorInst[2].includes("SP") || vectorInst[2].includes("R15") || vectorInst[2].includes("PC")) {
                            if (parseInt(lastOperand.slice(lastOperand.indexOf("#") + 1)) > 255) {
                                return "ERRO: Imediato maior que o valor máximo (255)";
                            }
                        }
                        else {
                            return "ERRO: Instrução não suporta high registers (apenas R13 e R15 no segundo operando desse formato)";
                        }
                    }
                }
                else {
                    // Último operando é registrador
                    if (isRegister(vectorInst[3], opcodeT16)) {
                        if (hasHighRegisterThumb(operandsT16, false)) {
                            return "ERRO: Instrução não suporta high registers nesse formato";
                        }
                        opcodeT16 = "ADDS";
                    }
                }
            }
            else {
                // Casos com 2 operandos
                if (vectorInst.length == 3 && isRegister(vectorInst[1], opcodeT16)) {
                    // Último operando é imediato/offset
                    if (lastOperand.includes("#")) {
                        // O operando é Lo register
                        if (!hasHighRegisterThumb(vectorInst[1], false)) {
                            if (parseInt(lastOperand.slice(lastOperand.indexOf("#") + 1)) > 255) {
                                return "ERRO: Imediato maior que o valor máximo (255)";
                            }
                            opcodeT16 = "ADDS";
                            operandsT16 = " " + vectorInst[1] + " " + vectorInst[1] + " " + vectorInst[2];
                        }
                        else {
                            // O operando é SP
                            if (vectorInst[1].includes("R13") || vectorInst[1].includes("SP")) {
                                if (Math.abs(parseInt(lastOperand.slice(lastOperand.indexOf("#") + 1))) > 127) {
                                    return "ERRO: Imediato maior que o valor máximo (127)";
                                }
                                // Imediato positivo
                                if (parseInt(lastOperand.slice(lastOperand.indexOf("#") + 1)) > 0 || parseInt(lastOperand.slice(lastOperand.indexOf("#") + 1)) == 0) {
                                    opcodeT16 = "ADD";
                                    operandsT16 = " " + vectorInst[1] + " " + vectorInst[1] + " " + vectorInst[2];
                                }
                                else {
                                    // Imediato negativo
                                    if (parseInt(lastOperand.slice(lastOperand.indexOf("#") + 1)) < 0) {
                                        opcodeT16 = "SUB";
                                        operandsT16 = " " + vectorInst[1] + " " + vectorInst[1] + " #" + vectorInst[2].slice(2);
                                    }
                                }
                            }
                            else {
                                return "ERRO: Instrução não suporta high registers (apenas R13 no primeiro operando desse formato)";
                            }
                        }
                    }
                    else {
                        // Último operando é registrador
                        if (isRegister(vectorInst[2], opcodeT16)) {
                            if (!hasHighRegisterThumb(operandsT16, false)) {
                                return "ERRO: Instrução necessita de ao menos um Hi register nesse formato";
                            }
                            operandsT16 = operandsT16 = " " + vectorInst[1] + " " + vectorInst[1] + " " + vectorInst[2];
                        }
                    }
                }
                else {
                    return "ERRO: Formato não suportado / Formato esperado: ADD Rd, Rs, Rn | ADD Rd, Rs, #Offset3 | ADD Rd, Hs | ADD Rd, #Offset8";
                }
            }
            break;
        case "AND":
            if (vectorInst.length != 3 || !isRegister(vectorInst[1], opcodeT16) || !isRegister(vectorInst[2], opcodeT16)) {
                return "ERRO: Formato não suportado / Formato esperado: AND Rd, Rs";
            }
            if (hasHighRegisterThumb(operandsT16, false)) {
                return "ERRO: Instrução não suporta high registers";
            }
            opcodeT16 = opcodeT16 + "S";
            operandsT16 = ' ' + vectorInst[1] + ' ' + vectorInst[1] + ' ' + vectorInst[2];
            break;
        case "B":
            // Caso de OPCODE ser não condicional (B)
            if (vectorInst[0] === "B" && vectorInst.length == 2 && !isRegister(vectorInst[1], opcodeT16)) {
                opcodeT16 = "BAL";
            }
            else {
                // Branch condicional
                if (vectorInst[0] !== "B" && vectorInst.length == 2 && !isRegister(vectorInst[1], opcodeT16)) {
                    opcodeT16 = vectorInst[0];
                }
                else {
                    return "ERRO: Formato não suportado / Formato esperado: B label | Bxx label";
                }
            }
            break;
        case "BIC":
            if (vectorInst.length != 3 || !isRegister(vectorInst[1], opcodeT16) || !isRegister(vectorInst[2], opcodeT16)) {
                return "ERRO: Formato não suportado / Formato esperado: BIC Rd, Rs";
            }
            if (hasHighRegisterThumb(operandsT16, false)) {
                return "ERRO: Instrução não suporta high registers";
            }
            opcodeT16 = opcodeT16 + "S";
            operandsT16 = ' ' + vectorInst[1] + ' ' + vectorInst[1] + ' ' + vectorInst[2];
            break;
        case "BL":
            if (vectorInst.length != 2 || isRegister(vectorInst[1], opcodeT16)) {
                return "ERRO: Formato não suportado / Formato esperado: BL label";
            }
            break;
        case "BX":
            if (vectorInst.length != 2 || !isRegister(vectorInst[1], opcodeT16)) {
                return "ERRO: Formato não suportado / Formato esperado: BX Rs";
            }
            break;
        case "CMN":
            if (vectorInst.length != 3 || !isRegister(vectorInst[1], opcodeT16) || !isRegister(vectorInst[2], opcodeT16)) {
                return "ERRO: Formato não suportado / Formato esperado: CMN Rd, Rs";
            }
            if (hasHighRegisterThumb(operandsT16, false)) {
                return "ERRO: Instrução não suporta high registers";
            }
            break;
        case "CMP":
            if (vectorInst.length != 3 || !isRegister(vectorInst[1], opcodeT16) || !(isRegister(vectorInst[2], opcodeT16) || lastOperand.includes("#"))) {
                return "ERRO: Formato não suportado / Formato esperado: CMP Rd, Rs | CMP Rd, #Offset8";
            }
            if (lastOperand.includes("#")) {
                if (parseInt(lastOperand.slice(lastOperand.indexOf("#") + 1)) > 255) {
                    return "ERRO: Imediato maior que o valor máximo (255)";
                }
                if (hasHighRegisterThumb(operandsT16, false)) {
                    return "ERRO: Instrução não suporta high registers com offset";
                }
            }
            break;
        case "EOR":
            if (vectorInst.length != 3 || !isRegister(vectorInst[1], opcodeT16) || !isRegister(vectorInst[2], opcodeT16)) {
                return "ERRO: Formato não suportado / Formato esperado: EOR Rd, Rs";
            }
            if (hasHighRegisterThumb(operandsT16, false)) {
                return "ERRO: Instrução não suporta high registers";
            }
            opcodeT16 = opcodeT16 + "S";
            operandsT16 = ' ' + vectorInst[1] + ' ' + vectorInst[1] + ' ' + vectorInst[2];
            break;
        case "LDMIA":
            if (!(isRegister(vectorInst[1], opcodeT16) && vectorInst[1].slice(vectorInst[1].length - 2, vectorInst[1].length - 1) == "!" && vectorInst[2].includes("{") && vectorInst[vectorInst.length - 1].includes("}"))) {
                return "ERRO: Formato não suportado / Formato esperado: LDMIA Rb!, { Rlist }";
            }
            if (hasHighRegisterThumb(operandsT16, false)) {
                return "ERRO: Instrução não suporta high registers";
            }
            break;
        case "LDR":
            // Confere disposição da instrução
            if (!(vectorInst.length == 4 && isRegister(vectorInst[1], opcodeT16) && vectorInst[2].includes("[") && vectorInst[3].includes("]") && isRegister(vectorInst[2].slice(1), opcodeT16))) {
                return "ERRO: Formato não suportado / Formato esperado: LDR Rd, [Rb, Ro] | LDR Rd, [Rb, #Imm]";
            }
            // Confere primeiro registrador
            if (hasHighRegisterThumb(vectorInst[1], false)) {
                return "ERRO: Instrução não suporta high registers (apenas R13 ou R15 no registrador de destino com imediato)";
            }
            // Se tiver imediato
            if (lastOperand.includes("#")) {
                if (hasHighRegisterThumb(operandsT16, false)) {
                    if (!vectorInst[2].includes("R15") && !vectorInst[2].includes("R13")) {
                        return "ERRO: Instrução não suporta high registers (apenas R13 ou R15 no registrador de destino com imediato)";
                    }
                    if (parseInt(lastOperand.slice(lastOperand.indexOf("#") + 1)) > 255) {
                        return "ERRO: Imediato maior que o valor máximo (255)";
                    }
                }
                else {
                    if (parseInt(lastOperand.slice(lastOperand.indexOf("#") + 1)) > 31) {
                        return "ERRO: Imediato maior que o valor máximo (31)";
                    }
                }
            }
            // Sem imediato
            else {
                if (hasHighRegisterThumb(operandsT16, false)) {
                    return "ERRO: Instrução não suporta high registers (apenas R13 ou R15 no registrador de destino com imediato)";
                }
                if (!isRegister(vectorInst[3].slice(0, vectorInst[3].length - 1), opcodeT16)) {
                    return "ERRO: Formato não suportado / Formato esperado: LDR Rd, [Rb, Ro] | LDR Rd, [Rb, #Imm]";
                }
            }
            break;
        case "LDRB":
            // Confere disposição da instrução
            if (!(vectorInst.length == 4 && isRegister(vectorInst[1], opcodeT16) && vectorInst[2].includes("[") && vectorInst[3].includes("]") && isRegister(vectorInst[2].slice(1), opcodeT16))) {
                return "ERRO: Formato não suportado / Formato esperado: LDRB Rd, [Rb, Ro] | LDRB Rd, [Rb, #Imm]";
            }
            // Confere high register
            if (hasHighRegisterThumb(operandsT16, false)) {
                return "ERRO: Instrução não suporta high registers";
            }
            // Se tiver imediato
            if (lastOperand.includes("#")) {
                if (parseInt(lastOperand.slice(lastOperand.indexOf("#") + 1)) > 31) {
                    return "ERRO: Imediato maior que o valor máximo (31)";
                }
            }
            else {
                if (!isRegister(vectorInst[3].slice(0, vectorInst[3].length - 1), opcodeT16)) {
                    return "ERRO: Formato não suportado / Formato esperado: LDRB Rd, [Rb, Ro] | LDRB Rd, [Rb, #Imm]";
                }
            }
            break;
        case "LDRH":
            // Confere disposição da instrução
            if (!(vectorInst.length == 4 && isRegister(vectorInst[1], opcodeT16) && vectorInst[2].includes("[") && vectorInst[3].includes("]") && isRegister(vectorInst[2].slice(1), opcodeT16))) {
                return "ERRO: Formato não suportado / Formato esperado: LDRH Rd, [Rb, Ro] | LDRH Rd, [Rb, #Imm]";
            }
            // Confere high register
            if (hasHighRegisterThumb(operandsT16, false)) {
                return "ERRO: Instrução não suporta high registers";
            }
            // Se tiver imediato
            if (lastOperand.includes("#")) {
                if (parseInt(lastOperand.slice(lastOperand.indexOf("#") + 1)) > 31) {
                    return "ERRO: Imediato maior que o valor máximo (31)";
                }
            }
            else {
                if (!isRegister(vectorInst[3].slice(0, vectorInst[3].length - 1), opcodeT16)) {
                    return "ERRO: Formato não suportado / Formato esperado: LDRH Rd, [Rb, Ro] | LDRH Rd, [Rb, #Imm]";
                }
            }
            break;
        case "LSL":
            if (vectorInst.length == 3 && isRegister(vectorInst[1], opcodeT16) && isRegister(vectorInst[2], opcodeT16)) {
                opcodeT16 = "MOVS";
                operandsT16 = " " + vectorInst[1] + " " + vectorInst[1] + " LSL " + vectorInst[2];
            }
            else {
                if (vectorInst.length == 4 && isRegister(vectorInst[1], opcodeT16) && isRegister(vectorInst[2], opcodeT16) && vectorInst[3].includes("#")) {
                    if (parseInt(lastOperand.slice(lastOperand.indexOf("#") + 1)) > 31) {
                        return "ERRO: Imediato maior que o valor máximo (31)";
                    }
                    opcodeT16 = "MOVS";
                    operandsT16 = " " + vectorInst[1] + " " + vectorInst[2] + " LSL " + vectorInst[3];
                }
                else {
                    return "ERRO: Formato não suportado / Formato esperado: LSL Rd, Rs | LSL Rd, Rs, #Offset5";
                }
            }
            if (hasHighRegisterThumb(operandsT16, false)) {
                return "ERRO: Instrução não suporta high registers";
            }
            break;
        case "LDSB":
            if (!(vectorInst.length == 4 && isRegister(vectorInst[1], opcodeT16) && isRegister(vectorInst[2].slice(1), opcodeT16) && isRegister(vectorInst[3].slice(0, vectorInst[3].length - 1), opcodeT16))) {
                return "ERRO: Formato não suportado / Formato esperado: LDSB Rd, [Rb, Ro]";
            }
            if (hasHighRegisterThumb(operandsT16, false)) {
                return "ERRO: Instrução não suporta high registers";
            }
            opcodeT16 = "LDRSB";
            break;
        case "LDSH":
            if (!(vectorInst.length == 4 && isRegister(vectorInst[1], opcodeT16) && isRegister(vectorInst[2].slice(1), opcodeT16) && isRegister(vectorInst[3].slice(0, vectorInst[3].length - 1), opcodeT16))) {
                return "ERRO: Formato não suportado / Formato esperado: LDSH Rd, [Rb, Ro]";
            }
            if (hasHighRegisterThumb(operandsT16, false)) {
                return "ERRO: Instrução não suporta high registers";
            }
            opcodeT16 = "LDRSH";
            break;
        case "LSR":
            if (vectorInst.length == 3 && isRegister(vectorInst[1], opcodeT16) && isRegister(vectorInst[2], opcodeT16)) {
                opcodeT16 = "MOVS";
                operandsT16 = " " + vectorInst[1] + " " + vectorInst[1] + " LSR " + vectorInst[2];
            }
            else {
                if (vectorInst.length == 4 && isRegister(vectorInst[1], opcodeT16) && isRegister(vectorInst[2], opcodeT16) && vectorInst[3].includes("#")) {
                    if (parseInt(lastOperand.slice(lastOperand.indexOf("#") + 1)) > 31) {
                        return "ERRO: Imediato maior que o valor máximo (31)";
                    }
                    opcodeT16 = "MOVS";
                    operandsT16 = " " + vectorInst[1] + " " + vectorInst[2] + " LSR " + vectorInst[3];
                }
                else {
                    return "ERRO: Formato não suportado / Formato esperado: LSR Rd, Rs | LSR Rd, Rs, #Offset5";
                }
            }
            if (hasHighRegisterThumb(operandsT16, false)) {
                return "ERRO: Instrução não suporta high registers";
            }
            break;
        case "MOV":
            // Dois registradores como operando
            if (vectorInst.length == 3 && isRegister(vectorInst[1], opcodeT16) && vectorInst[2].includes("#")) {
                if (parseInt(lastOperand.slice(lastOperand.indexOf("#") + 1)) > 255) {
                    return "ERRO: Imediato maior que o valor máximo (255)";
                }
                if (hasHighRegisterThumb(operandsT16, false)) {
                    return "ERRO: Instrução não suporta high registers com offset";
                }
                opcodeT16 = "MOVS";
            }
            else {
                if (!isRegister(vectorInst[2], opcodeT16)) {
                    return "ERRO: Formato não suportado / Formato esperado: MOV Rd, #Offset8 | MOV Rd, Rs";
                }
            }
            break;
        case "MUL":
            if (!(vectorInst.length == 3 && isRegister(vectorInst[1], opcodeT16) && isRegister(vectorInst[2], opcodeT16))) {
                return "ERRO: Formato não suportado / Formato esperado: MUL Rd, Rs";
            }
            if (hasHighRegisterThumb(operandsT16, false)) {
                return "ERRO: Instrução não suporta high registers";
            }
            opcodeT16 = opcodeT16 + "S";
            operandsT16 = ' ' + vectorInst[1] + ' ' + vectorInst[1] + ' ' + vectorInst[2];
            break;
        case "MVN":
            if (!(vectorInst.length == 3 && isRegister(vectorInst[1], opcodeT16) && isRegister(vectorInst[2], opcodeT16))) {
                return "ERRO: Formato não suportado / Formato esperado: MVN Rd, Rs";
            }
            if (hasHighRegisterThumb(operandsT16, false)) {
                return "ERRO: Instrução não suporta high registers";
            }
            opcodeT16 = opcodeT16 + "S";
            break;
        case "NEG":
            if (!(vectorInst.length == 3 && isRegister(vectorInst[1], opcodeT16) && isRegister(vectorInst[2], opcodeT16))) {
                return "ERRO: Formato não suportado / Formato esperado: NEG Rd, Rs";
            }
            if (hasHighRegisterThumb(operandsT16, false)) {
                return "ERRO: Instrução não suporta high registers";
            }
            opcodeT16 = "RSBS";
            operandsT16 = ' ' + vectorInst[1] + ' ' + vectorInst[2] + ", #0";
            break;
        case "ORR":
            if (!(vectorInst.length == 3 && isRegister(vectorInst[1], opcodeT16) && isRegister(vectorInst[2], opcodeT16))) {
                return "ERRO: Formato não suportado / Formato esperado: ORR Rd, Rs";
            }
            if (hasHighRegisterThumb(operandsT16, false)) {
                return "ERRO: Instrução não suporta high registers";
            }
            opcodeT16 = opcodeT16 + "S";
            operandsT16 = ' ' + vectorInst[1] + ' ' + vectorInst[1] + ' ' + vectorInst[2];
            break;
        case "POP":
            if (!(vectorInst[1].includes("{") && vectorInst[vectorInst.length - 1].includes("}"))) {
                return "ERRO: Formato não suportado / Formato esperado: POP { Rlist } | POP { Rlist, PC }";
            }
            if (hasHighRegisterThumb(operandsT16, true) || operandsT16.includes("R13") || operandsT16.includes("R14") || operandsT16.includes("SP") || operandsT16.includes("LR")) {
                return "ERRO: Instrução não suporta high registers (apenas o R15/PC na lista)";
            }
            opcodeT16 = "LDMIA";
            operandsT16 = " R13!," + operandsT16;
            break;
        case "PUSH":
            if (!(vectorInst[1].includes("{") && vectorInst[vectorInst.length - 1].includes("}"))) {
                return "ERRO: Formato não suportado / Formato esperado: PUSH { Rlist } | PUSH { Rlist, PC }";
            }
            if (hasHighRegisterThumb(operandsT16, true) || operandsT16.includes("R13") || operandsT16.includes("R15") || operandsT16.includes("SP") || operandsT16.includes("PC")) {
                return "ERRO: Instrução não suporta high registers (apenas o R14/LR na lista)";
            }
            opcodeT16 = "STMDB";
            operandsT16 = " R13!," + operandsT16;
            break;
        case "ROR":
            if (!(vectorInst.length === 3 && isRegister(vectorInst[1], opcodeT16) && isRegister(vectorInst[2], opcodeT16))) {
                return "ERRO: Formato não suportado / Formato esperado: ROR Rd, Rs";
            }
            if (hasHighRegisterThumb(operandsT16, false)) {
                return "ERRO: Instrução não suporta high registers";
            }
            opcodeT16 = "MOVS";
            operandsT16 = " " + vectorInst[1] + " " + vectorInst[1] + " ROR " + vectorInst[2];
            break;
        case "SBC":
            if (!(vectorInst.length === 3 && isRegister(vectorInst[1], opcodeT16) && isRegister(vectorInst[2], opcodeT16))) {
                return "ERRO: Formato não suportado / Formato esperado: SBC Rd, Rs";
            }
            if (hasHighRegisterThumb(operandsT16, false)) {
                return "ERRO: Instrução não suporta high registers";
            }
            opcodeT16 = opcodeT16 + "S";
            operandsT16 = " " + vectorInst[1] + " " + vectorInst[1] + " " + vectorInst[2];
            break;
        case "STMIA":
            if (!(isRegister(vectorInst[1], opcodeT16) && vectorInst[1].slice(vectorInst[1].length - 2, vectorInst[1].length - 1) == "!" && vectorInst[2].includes("{") && vectorInst[vectorInst.length - 1].includes("}"))) {
                return "ERRO: Formato não suportado / Formato esperado: STMIA Rb!, { Rlist }";
            }
            if (hasHighRegisterThumb(operandsT16, false)) {
                return "ERRO: Instrução não suporta high registers";
            }
            break;
        case "STR":
            // Confere disposição da instrução
            if (!(vectorInst.length == 4 && isRegister(vectorInst[1], opcodeT16) && vectorInst[2].includes("[") && vectorInst[3].includes("]") && isRegister(vectorInst[2].slice(1), opcodeT16))) {
                return "ERRO: Formato não suportado / Formato esperado: STR Rd, [Rb, Ro] | STR Rd, [Rb, #Imm]";
            }
            // Confere primeiro registrador
            if (hasHighRegisterThumb(vectorInst[1], false)) {
                return "ERRO: Instrução não suporta high registers (apenas R13/SP no registrador de destino com imediato)";
            }
            // Se tiver imediato
            if (lastOperand.includes("#")) {
                if (hasHighRegisterThumb(operandsT16, false)) {
                    if (!vectorInst[2].includes("R13")) {
                        return "ERRO: Instrução não suporta high registers (apenas R13/SP registrador de destino com imediato)";
                    }
                    if (parseInt(lastOperand.slice(lastOperand.indexOf("#") + 1)) > 255) {
                        return "ERRO: Imediato maior que o valor máximo (255)";
                    }
                }
                else {
                    if (parseInt(lastOperand.slice(lastOperand.indexOf("#") + 1)) > 31) {
                        return "ERRO: Imediato maior que o valor máximo (31)";
                    }
                }
            }
            // Sem imediato
            else {
                if (hasHighRegisterThumb(operandsT16, false)) {
                    return "ERRO: Instrução não suporta high registers (apenas R13/SP no registrador de destino com imediato)";
                }
                if (!isRegister(vectorInst[3].slice(0, vectorInst[3].length - 1), opcodeT16)) {
                    return "ERRO: Formato não suportado / Formato esperado: STR Rd, [Rb, Ro] | STR Rd, [Rb, #Imm]";
                }
            }
            break;
        case "STRB":
            // Confere disposição da instrução
            if (!(vectorInst.length == 4 && isRegister(vectorInst[1], opcodeT16) && vectorInst[2].includes("[") && vectorInst[3].includes("]") && isRegister(vectorInst[2].slice(1), opcodeT16))) {
                return "ERRO: Formato não suportado / Formato esperado: STRB Rd, [Rb, Ro] | STRB Rd, [Rb, #Imm]";
            }
            // Confere high register
            if (hasHighRegisterThumb(operandsT16, false)) {
                return "ERRO: Instrução não suporta high registers";
            }
            // Se tiver imediato
            if (lastOperand.includes("#")) {
                if (parseInt(lastOperand.slice(lastOperand.indexOf("#") + 1)) > 31) {
                    return "ERRO: Imediato maior que o valor máximo (31)";
                }
            }
            else {
                if (!isRegister(vectorInst[3].slice(0, vectorInst[3].length - 1), opcodeT16)) {
                    return "ERRO: Formato não suportado / Formato esperado: STRB Rd, [Rb, Ro] | STRB Rd, [Rb, #Imm]";
                }
            }
            break;
        case "STRH":
            // Confere disposição da instrução
            if (!(vectorInst.length == 4 && isRegister(vectorInst[1], opcodeT16) && vectorInst[2].includes("[") && vectorInst[3].includes("]") && isRegister(vectorInst[2].slice(1), opcodeT16))) {
                return "ERRO: Formato não suportado / Formato esperado: STRH Rd, [Rb, Ro] | STRH Rd, [Rb, #Imm]";
            }
            // Confere high register
            if (hasHighRegisterThumb(operandsT16, false)) {
                return "ERRO: Instrução não suporta high registers";
            }
            // Se tiver imediato
            if (lastOperand.includes("#")) {
                if (parseInt(lastOperand.slice(lastOperand.indexOf("#") + 1)) > 31) {
                    return "ERRO: Imediato maior que o valor máximo (31)";
                }
            }
            else {
                if (!isRegister(vectorInst[3].slice(0, vectorInst[3].length - 1), opcodeT16)) {
                    return "ERRO: Formato não suportado / Formato esperado: STRH Rd, [Rb, Ro] | STRH Rd, [Rb, #Imm]";
                }
            }
            break;
        case "SWI":
            if (!(vectorInst.length == 2 && parseInt(vectorInst[1]))) {
                return "ERRO: Formato não suportado / Formato esperado: SWI Value8";
            }
            if (parseInt(vectorInst[1]) > 255) {
                return "ERRO: Valor maior que o máximo (255)";
            }
            break;
        case "SUB":
            // Os casos com 3 operandos
            if (vectorInst.length == 4 && isRegister(vectorInst[1], opcodeT16) && isRegister(vectorInst[2], opcodeT16)) {
                // Se tiver imediato
                if (lastOperand.includes("#")) {
                    if (parseInt(lastOperand.slice(lastOperand.indexOf("#") + 1)) > 7) {
                        return "ERRO: Imediato maior que o valor máximo (7)";
                    }
                }
                // Se ultimo operando for registrador também
                else {
                    if (!isRegister(vectorInst[3], opcodeT16)) {
                        return "ERRO: Formato não suportado / Formato esperado: SUB Rd, Rs, Rn | SUB Rd, Rs, #Offset3 | SUB Rd, #Offset8";
                    }
                }
            }
            else {
                // O caso com 2 operandos (Rd e #Offset8)
                if (vectorInst.length == 3 && isRegister(vectorInst[1], opcodeT16) && lastOperand.includes("#")) {
                    if (parseInt(lastOperand.slice(lastOperand.indexOf("#") + 1)) > 255) {
                        return "ERRO: Imediato maior que o valor máximo (255)";
                    }
                    operandsT16 = " " + vectorInst[1] + " " + vectorInst[1] + " " + vectorInst[2];
                }
                // Nenhum dos casos foi atentido
                else {
                    return "ERRO: Formato não suportado / Formato esperado: SUB Rd, Rs, Rn | SUB Rd, Rs, #Offset3 | SUB Rd, #Offset8";
                }
            }
            if (hasHighRegisterThumb(operandsT16, false)) {
                return "ERRO: Instrução não suporta high registers";
            }
            opcodeT16 = "SUBS";
            break;
        case "TST":
            if (!(vectorInst.length == 3 && isRegister(vectorInst[1], opcodeT16) && isRegister(vectorInst[2], opcodeT16))) {
                return "ERRO: Formato não suportado / Formato esperado: TST Rd, Rs";
            }
            if (hasHighRegisterThumb(operandsT16, false)) {
                return "ERRO: Instrução não suporta high registers";
            }
            break;
        default:
            if (matrixT16[0].some(function (x) { return x === opcodeT16; })) {
                return "ATENÇÃO: instrução esquecida - " + opcodeT16;
            }
            else {
                return "ERRO: Operação não existente";
            }
    }
    operandsT16 = operandsT16.replace(/SP/gi, "R13");
    operandsT16 = operandsT16.replace(/LR/gi, "R14");
    operandsT16 = operandsT16.replace(/PC/gi, "R15");
    return opcodeT16 + operandsT16;
};
var GetOpcodeOnly = function (fullOpcode) {
    var vectorCond = ["EQ", "NE", "CS", "CC", "MI", "PL", "VS", "VC", "HI", "LS", "GE", "LT", "GT", "LE"];
    var auxSliced = fullOpcode.slice(0, 1);
    var auxExtra = fullOpcode.slice(1);
    if (auxSliced === "B" && (vectorCond.some(function (x) { return x === auxExtra; }))) {
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
var isRegister = function (operand, opcode) {
    var firstChar = operand.slice(0, 1);
    var extraLength = (operand.includes("!") && (opcode == "LDMIA" || opcode == "STMIA")) ? operand.indexOf("!") : (operand.includes(",") ? operand.indexOf(",") : operand.length);
    var extraChars = operand.slice(1, extraLength);
    if ((firstChar === "R" && Number(extraChars) >= 0 && Number(extraChars) <= 15) || firstChar + extraChars === "SP" || firstChar + extraChars === "LR" || firstChar + extraChars === "PC") {
        return true;
    }
    return false;
};
var test1 = ThumbToArm("MOV R1, R13");
var test2 = ThumbToArm("MOV R13, R2");
var test3 = ThumbToArm("MOV R1, R2");
var test4 = ThumbToArm("MOV SP, PC");
console.log(test1 + "\n" + test2 + "\n" + test3 + "\n" + test4 + "\n");
// OFFSET NEGATIVO ???? FAZER TESTES E ARRUMAR
// MOV Rd, Rb before Thumb-2 only with one or both being Hi Registers
