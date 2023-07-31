var vectorCond = ["EQ", "NE", "CS", "HS", "CC", "LO", "MI", "PL", "VS", "VC", "HI", "LS", "GE", "LT", "GT", "LE", "AL", "S"];

//rever isso, talvez tenha que ver em cada caso
const shiftCodes = ["LSL", "LSR", "ASR", "ROR"];

const instructions32to64 = {
    "ADC"   :  "ADC", //A64 não aceita imediato
    "ADD"   :  "ADD", 
    "AND"   :  "AND", 
    "B"     :  "B",   //B com condição é B.cond no A64
    "BIC"   :  "BIC", //A64 nao aceita imediato
    "BL"    :  "BL", 
    "BX"    :  "BR",   
    "CMN"   :  "CMN", 
    "CMP"   :  "CMP", 
    "EOR"   :  "EOR",
    "LDR"   :  "LDR", //registrador do endereco base deve ser X
    // "LDRB"  :  "LDRB",
    // "LDRH"  :  "LDRH",
    // "LDRSB" :  "LDRSB",
    // "LDRSH" :  "LDRSH",
    "MLA"   :  "MADD", //tem 4 regs  
    "MOV"   :  "MOV",  //tem 2 parametro só
    "MUL"   :  "MUL",
    "MVN"   :  "MVN",
    "ORR"   :  "ORR",
    "SBC"   :  "SBC", //não aceita imediatos no A64
    "STR"   :  "STR", //aceita os mesmo formatos do a32 (pos/pre indexado)
    // "STRB"  :  "STRB",
    // "STRH"  :  "STRH",
    "SUB"   :  "SUB",
    "TST"   :  "TST"
};

//mapeando valores significativos de cada instrucao
// (quantidade de operandos, a posicao dos registradores e a posicao da instrucao de shift )
const partes_e_registradores = {
    "ADC"   :[[3], [[1, 1, 1]], [0]], //A64 não aceita imediato
    "ADD"   :[[3, 3, 5, 5], [[1, 1, 1], [1, 1, 0], [1, 1, 0, 0, 0], [1, 1, 1, 0, 0]], [0, 0, 4, 4]], 
    "AND"   :[[3, 3, 5], [[1, 1, 0], [1, 1, 1], [1, 1, 1, 0, 0]], [0, 0, 4]], 
    "B"     :[], //nao será utilizado, uma vez que deve ser com label ou com valores de pc
    "BIC"   :[[3, 5], [[1, 1, 1], [1, 1, 1, 0, 0]], [0, 4]], //A64 nao aceita imediato
    "BL"    :[], 
    "BR"    :[[1], [1], [[1]]], //registrador tem que ser X, ou seja, precisa traduzir para X   
    "CMN"   :[[2, 4, 2, 4], [[1, 1], [1, 1, 0, 0], [1, 0], [1, 0, 0, 0]], [0, 0, 0, 0]], 
    "CMP"   :[[2, 4, 2, 4], [[1, 1], [1, 1, 0, 0], [1, 0], [1, 0, 0, 0]], [0, 0, 0, 0]], 
    "EOR"   :[[3, 5, 3], [[1, 1, 0], [1, 1, 1, 0, 0], [1, 1, 1]], [0, 4, 0]],
    "LDR"   :[[3, 2, 3, 5], [[1, 1, 0], [1, 0], [1, 1, 1], [1, 1, 1, 0, 0]], [0, 0, 0, 4]], 
    // "LDRB"  :,
    // "LDRH"  :,
    // "LDRSB" :,
    // "LDRSH" :,
    "MADD"  :[[4], [[1, 1, 1, 1]], [0]], //tem 4 regs
    "MOV"   :[[2, 2], [[1, 0], [1, 1]], [0, 0]],  //tem 2 parametro só
    "MUL"   :[[3], [[1, 1, 1]], [0]],
    "MVN"   :[[2, 4], [[1, 1], [1, 1, 0, 0]], [0, 3]],
    "ORR"   :[[3, 5], [[1, 1, 0], [1, 1, 1, 0, 0]], [0, 4]],
    "SBC"   :[[3], [[1, 1, 1]], [0]], //não aceita imediatos no A64
    "STR"   :[[3, 2, 3, 5], [[1, 1, 0], [1, 0], [1, 1, 1], [1, 1, 1, 0, 0]], [0, 0, 0, 4]], //aceita os mesmo formatos do a32 (pos/pre indexado)
    // "STRB"  :,
    // "STRH"  :,
    "SUB"   :[[3, 3, 5, 5], [[1, 1, 1], [1, 1, 0], [1, 1, 0, 0, 0], [1, 1, 1, 0, 0]], [0, 0, 4, 4]],
    "TST"   :[[2, 2, 4], [[1, 0], [1, 1], [1, 1, 0, 0]], [0, 0, 3]]
};


regexRegs = /R(1[0-5]|[0-9])/; 

var A32ToA64 = function (inst) {
    var vectorInst = inst.split(' ');
    console.log(vectorInst[0])
    const interOut = GetopcodeA64(vectorInst[0]);
    if(interOut === null)
        return "Não foi possivel encontrar a instrução"

    var opcodeA64 = interOut[0];
    var setSignal = interOut[1];
    var auxExtra = interOut[2];
    console.log(interOut)


    disposicaoRegsShift = verifyRegs(vectorInst, opcodeA64)
    if (disposicaoRegsShift === null)
        return "Erro na disposição dos registradores";

    shiftCorrect = verifyShift(vectorInst, disposicaoRegsShift[1])
    if (! shiftCorrect && disposicaoRegsShift === [0])
        return "Erro no Barrel Shift"

    var operandsA64 = inst.slice(vectorInst[0].length);

    switch (opcodeA64) {
        case "B": //unico caso que mantem o condicional, mas adiciona um ponto
            if (auxExtra!="")
                opcodeA64 = opcodeA64 + "." + auxExtra + " ";
            if (vectorInst.length === 2)
                return opcodeA64 + " " + vectorInst[1];
            return null;
        case "BL":
            if (vectorInst.length === 2 && auxExtra!="")
                return instructionCond(opcodeA64 + " " + vectorInst[1], auxExtra)
            else if (vectorInst.length === 2)
                return opcodeA64 + " " + vectorInst[1]
            return null
        case "LDR" || "STR": //registrador precisa ser X
            vectorInst[2] = vectorInst[2].replace("R", "X")
        case "CMN" || "CMP":
            //ele utiliza o extend, precisaria mapear e verificar
        default:
            break;
    }

    wholeInstruction = treatRegistors(opcodeA64, vectorInst, disposicaoRegsShift[0]);

    if (auxExtra!="" && auxExtra!="S")
        wholeInstruction = instructionCond(wholeInstruction, auxExtra)

    return wholeInstruction;
};

var GetopcodeA64 = function (opcodeA32) {
    
    const padraoBranch = new RegExp(`^B(${vectorCond.join('|')})$`);
    const padraoBranchLink = new RegExp(`^BL(${vectorCond.join('|')})$`);
    //verifica se são Branches
    if(padraoBranch.test(opcodeA32))
        return ["B", "", opcodeA32.slice(1)];
    else if (padraoBranchLink.test(opcodeA32))
        return ["BL", "", opcodeA32.slice(2)];

    var auxExtra = opcodeA32.slice(3);
    opcodeA32 = simplifyOpcodeA32(opcodeA32);
    console.log(opcodeA32)
    interInstruction = instructions32to64[opcodeA32];

    if (interInstruction != ""){
        if(auxExtra==="S") //values
            return [interInstruction, "S", auxExtra];
        else
            return [interInstruction, "", auxExtra];  
    }

    return null;
};

var simplifyOpcodeA32 = function (opcodeA32) {
    var auxSliced = opcodeA32.slice(0, 3);
    var auxExtra = opcodeA32.slice(3);
    if (Object.keys(instructions32to64).some(function (x) { return x === auxSliced; }) && vectorCond.some(function (x) { return x === auxExtra; })) {
        return auxSliced;
    }
    return opcodeA32;
};

var verifyRegs = function (vectorInst, opcodeA64) {

    const infos_operandos = partes_e_registradores[opcodeA64];

    if(infos_operandos.length == 0)
        return [0]

    for(var i = 0; i < infos_operandos[0].length ; i++){
        if(vectorInst.length - 1 === infos_operandos[0][i]){
            for (var j = 0; j < infos_operandos[0][i]; j++){
                if (regexRegs.test(vectorInst[j+1]) == infos_operandos[1][i][j]){ //verifica se true == 1 ou false == 0, significado se tem ou nao tem mesmo regs
                    if (j+1 === infos_operandos[0][i])
                        return [infos_operandos[1][i], infos_operandos[2][i]];
                }
                else
                    break;
            }
        }
    }
    return null;
};

var verifyShift = function (vectorInst, posicaoShift){
    var posicaoShiftReal = -1;

    for(var i = 0; i < shiftCodes.length && posicaoShiftReal===-1; i++){
        if (vectorInst.indexOf(shiftCodes[i]) === posicaoShift || posicaoShift === 0)
            return true;
    }
    return false;
};

var treatRegistors = function (opcodeA64, vectorInst, disposicaoRegs){
    var tudaoInstruction = opcodeA64 + " ";

    for(var i = 1; i < disposicaoRegs.length+1; i++){
        if (disposicaoRegs[i-1])
            tudaoInstruction = tudaoInstruction + vectorInst[i].replace("R", "W") + " ";
        else
            tudaoInstruction = tudaoInstruction + vectorInst[i] + " "
    }
    return tudaoInstruction;
};

var instructionCond = function (wholeInstruction, auxExtra){
    const structPadInstCond = "B.COND branch \nexit: \n\tB exit \nbranch: \n\tINSTRUCAO \n\tB exit\n*essa é uma alternativa, existem outras válidas";
    return structPadInstCond.replace("COND", auxExtra).replace("INSTRUCAO", wholeInstruction)
}

var teste1 = A32ToA64("ADDEQS R0, R0, R0");
var teste2 = A32ToA64("MOVLE R1, R1");
var teste3 = A32ToA64("BL label");

console.log(teste1 + "\n");
console.log(teste2 + "\n");
console.log(teste3);


