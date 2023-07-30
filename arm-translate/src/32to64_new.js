var vectorCond = ["EQ", "NE", "CS", "HS", "CC", "LO", "MI", "PL", "VS", "VC", "HI", "LS", "GE", "LT", "GT", "LE", "AL", "S"];

//rever isso, talvez tenha que ver em cada caso
const shftcodes = {
    "LSL":"LSL", 
    "LSR":"LSR",
    "ASR":"ASR", 
    "ROR":""
};

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
// (quantidade de operandos, registradores para cada caso e a posicao dos registradores)
const partes_e_registradores = {
    "ADC"   :[[3], [3], [[1, 1, 1]]], //A64 não aceita imediato
    "ADD"   :[[3, 3, 5, 5], [3, 2, 2, 3], [[1, 1, 1], [1, 1, 0], [1, 1, 0, 0, 0], [1, 1, 1, 0, 0]]], 
    "AND"   :[[3, 3, 5], [2, 3, 3], [[1, 1, 0], [1, 1, 1], [1, 1, 1, 0, 0]]], 
    "B"     :[], //nao será utilizado, uma vez que deve ser com label ou com valores de pc
    "BIC"   :[[3, 5], [3, 3], [[1, 1, 1], [1, 1, 1, 0, 0]]], //A64 nao aceita imediato
    "BL"    :[], 
    "BR"    :[[1], [1], [[1]]], //registrador tem que ser X, ou seja, precisa traduzir para X   
    "CMN"   :[[2, 4, 2, 4], [2, 2, 1, 1], [[1, 1], [1, 1, 0, 0], [1, 0], [1, 0, 0, 0]]], 
    "CMP"   :[[2, 4, 2, 4], [2, 2, 1, 1], [[1, 1], [1, 1, 0, 0], [1, 0], [1, 0, 0, 0]]], 
    "EOR"   :[[3, 5, 3], [2, 3, 3], [[1, 1, 0], [1, 1, 1, 0, 0], [1, 1, 1]]],
    "LDR"   :[[3, 2, 3, 5], [2, 1, 3, 3], [[1, 1, 0], [1, 0], [1, 1, 1], [1, 1, 1, 0,0]]], 
    // "LDRB"  :,
    // "LDRH"  :,
    // "LDRSB" :,
    // "LDRSH" :,
    "MADD"  :[[4], [4], [[1, 1, 1, 1]]], //tem 4 regs
    "MOV"   :[[2, 2], [1, 2], [[1, 0], [1, 1]]],  //tem 2 parametro só
    "MUL"   :[[3], [3], [[1, 1, 1]]],
    "MVN"   :[[2, 4], [2, 2], [[1, 1], [1, 1, 0, 0]]],
    "ORR"   :[[3, 5], [2, 3], [[1, 1, 0], [1, 1, 1, 0, 0]]],
    "SBC"   :[[3], [3], [[1, 1, 1]]], //não aceita imediatos no A64
    "STR"   :[[3, 2, 3, 5], [2, 1, 3, 3], [[1, 1, 0], [1, 0], [1, 1, 1], [1, 1, 1, 0, 0]]], //aceita os mesmo formatos do a32 (pos/pre indexado)
    // "STRB"  :,
    // "STRH"  :,
    "SUB"   :[[3, 3, 5, 5], [3, 2, 2, 3], [[1, 1, 1], [1, 1, 0], [1, 1, 0, 0, 0], [1, 1, 1, 0, 0]]],
    "TST"   :[[2, 2, 4], [1, 2, 2], [[1, 0], [1, 1], [1, 1, 0, 0]]]
};

structPadInstCond = "B.COND branch \nexit: \nB exit \nbranch: \nINSTRUCAO \nB exit";

regexRegs = /r(1[0-5]|[0-9])/;

var A32ToA64 = function (inst) {
    var vectorInst = inst.split(' ');
    const interOut = GetopcodeA64(vectorInst[0]);

    var opcodeA64 = interOut[0];
    var setSignal = interOut[1];
    var auxExtra = interOut[2];

    var operandsA64 = inst.slice(vectorInst[0].length);

    disposicaoRegs = verifyRegs(vectorInst, opcodeA64)
    console.log(disposicaoRegs)
    // switch (opcodeA64) {
    //     case "B": //unico caso que mantem o condicional, mas adiciona um ponto
    //         if (auxExtra!="")
    //             opcodeA64 = opcodeA64 + "." + auxExtra + " ";
    //         if (vectorInst.length === 2){
    //             label = vectorInst[1];
    //             return opcodeA64 + registradores;
    //         }
    //         return "UEPA";
    //     case "MOV":
    //         opcodeA64 = verifyRegs(vectorInst, "MOV");
    //         vectorInst.splice(3, 1);
    //         inst = vectorInst.toString().replace(/,,/g, ', ').replace(/,/, ' ');
    //         break;
    //     case "LDR":
    //         //endereco base precisa ser um registrador X 
    //     default:
    //         break;
    // }

    // wholeInstruction = treatRegistors(vectorInst, opcodeA64);

    // if (auxExtra!="" && auxExtra!="S")
    //     wholeInstruction = instructionCond(opcodeA64, auxExtra)


    if (opcodeA64 != "UEPA") {
        //tratar registradores

        return opcodeA64 + operandsA64;
    }
    return "UEPA";
};

var GetopcodeA64 = function (opcodeA32) {
    var auxExtra = opcodeA32.slice(3);
    opcodeA32 = simplifyOpcodeA32(opcodeA32);
    interInstruction = instructions32to64[opcodeA32];

    if (interInstruction != ""){
        if(auxExtra==="S") //values
            return [interInstruction, "S", auxExtra];
        else
            return [interInstruction, "", auxExtra];  
    }

    return "UEPA";
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

    for(var i = 0; i < infos_operandos[0].length; i++){
        if(vectorInst.length - 1 === infos_operandos[0][i]){
            for (var j = 0; j < infos_operandos[0][i]; j++){
                if (regexRegs.test(vectorInst[j+1]) == infos_operandos[2][i][j]){ //verifica se true == 1 ou false == 0, significado se tem ou nao tem mesmo regs
                    if (j+1 === infos_operandos[0][i])
                        return infos_operandos[2][i];
                }
                else
                    break;
            }
        }
    }
    return "Formato inválido para a instrução " + opcodeA64;
};

var instructionCond = function (opcodeA64, auxExtra){

}

var teste1 = A32ToA64("ADDS r0, r0, r1 LSL r1");
// var teste2 = A32ToA64("MOVLE R1, R1, LSL #Offset5");
// var teste3 = A32ToA64("B label");

console.log(teste1 + "\n");
//console.log(teste2 + "\n");
//console.log(teste3);


