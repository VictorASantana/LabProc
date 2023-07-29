var vectorCond = ["EQ", "NE", "CS", "HS", "CC", "LO", "MI", "PL", "VS", "VC", "HI", "LS", "GE", "LT", "GT", "LE", "AL", "S"];

const shftcodes = {"LSL":"", "LSR":"","ASR":"", "ROR":""};

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
    "LDR"   :  "LDR",
    "LDRB"  :  "LDRB",
    "LDRH"  :  "LDRH",
    "LDRSB" :  "LDRSB",
    "LDRSH" :  "LDRSH",
    "MLA"   :  "MADD", //tem 4 regs  
    "MOV"   :  "MOV",  //tem 2 parametro só
    "MUL"   :  "MUL",
    "MVN"   :  "MVN",
    "ORR"   :  "ORR",
    "SBC"   :  "SBC", //não aceita imediatos no A64
    "STR"   :  "STR", //aceita os mesmo formatos do a32 (pos/pre indexado)
    "STRB"  :  "STRB",
    "STRH"  :  "STRH",
    "SUB"   :  "SUB",
    "TST"   :   "TST"
};

var A32ToA64 = function (inst) {
    var vectorInst = inst.split(' ');
    const interOut = GetopcodeA64(vectorInst[0]);

    var opcodeA64 = interOut[0];
    var auxExtra = interOut[1];

    switch (opcodeA64) {
        case "MOV":
            opcodeA64 = verifyMOV(vectorInst);
            vectorInst.splice(3, 1);
            inst = vectorInst.toString().replace(/,,/g, ', ').replace(/,/, ' ');
            break;
        case "B": //unico caso que mantem o condicional, mas adiciona um ponto
            if (auxExtra!="")
                opcodeA64 = opcodeA64 + "." + auxExtra;
            break;
        default:
            break;
    }

    //como gcc traduz do gimple/llvm(mais dificil) para o A32

    if (opcodeA64 != "UEPA") {
        var operandsA64 = inst.slice(vectorInst[0].length);
        //tratar registradores


        return opcodeA64 + operandsA64;
    }
    return "UEPA";
};

var GetopcodeA64 = function (opcodeA32) {
    var auxExtra = opcodeA32.slice(3);
    opcodeA32 = simplifyOpcodeA32(opcodeA32);
    interInstruction = instructions32to64[opcodeA32];
    //console.log(interInstruction)
    if (interInstruction != ""){
        if(auxExtra==="S") //values
            return [interInstruction+"S", auxExtra];
        else
            return [interInstruction, auxExtra];
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

var verifyMOV = function (vectorInst) {
    if (vectorInst.length > 3) {
        return vectorInst[3];
    }
    return "MOV";
};

var teste1 = A32ToA64("ADDS R0, R0, #2");
var teste2 = A32ToA64("MOVLE R1, R1, LSL #Offset5");
var teste3 = A32ToA64("B R7");

console.log(teste1 + "\n");
//console.log(teste2 + "\n");
//console.log(teste3);


