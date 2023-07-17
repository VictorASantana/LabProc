var vectorT16 = ["ADD", "SUB", "MOV", "B", "BL", "UND"];
var matrixA32 = [["ADD", "SUB", "MOV", "B", "BL", "BLEQ", "AND", "RSB", "SWI"],
    [0, 1, 2, 3, 4, 4, 5, 5, 5]];
var vectorCond = ["EQ", "NE", "CS", "HS", "CC", "LO", "MI", "PL", "VS", "VC", "HI", "LS", "GE", "LT", "GT", "LE", "AL", "S"];
var ArmToThumb = function (inst) {
    var vectorInst = inst.split(' ');
    var opcodeT16 = GetOpcodeT16(vectorInst[0]);
    switch (opcodeT16) {
        case "MOV":
            opcodeT16 = verifyMOV(vectorInst);
            vectorInst.splice(3, 1);
            inst = vectorInst.toString().replace(/,,/g, ', ').replace(/,/, ' ');
            break;
        default:
            break;
    }
    if (opcodeT16 != "UEPA") {
        var operandsT16 = inst.slice(vectorInst[0].length);
        return opcodeT16 + operandsT16;
    }
    return "UEPA";
};
var simplifyOpcodeA32 = function (opcodeA32) {
    var auxSliced = opcodeA32.slice(0, 3);
    var auxExtra = opcodeA32.slice(3);
    if (matrixA32[0].some(function (x) { return x === auxSliced; }) && vectorCond.some(function (x) { return x === auxExtra; })) {
        return auxSliced;
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
var teste1 = ArmToThumb("ADDS R0, R0, #2");
var teste2 = ArmToThumb("MOVLE R1, R1, LSL #Offset5");
var teste3 = ArmToThumb("BLEQ R7");
console.log(teste1 + "\n" + teste2 + "\n" + teste3);
