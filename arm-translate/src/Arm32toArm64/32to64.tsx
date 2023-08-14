/* 
    Vetores e dicionários com as informações de de-para utilizados no código
*/

let vectorCond = ["EQ", "NE", "CS", "HS", "CC", "LO", "MI", "PL", "VS", "VC", "HI", "LS", "GE", "LT", "GT", "LE", "AL", "S"];

const shiftCodes = ["LSL", "LSR", "ASR", "ROR"];

const instructions32to64 : { [nome: string]: string } = {
    "ADC": "ADC", 
    "ADD": "ADD",
    "AND": "AND",
    "B"  : "B",   
    "BIC": "BIC", 
    "BL" : "BL",
    "BX" : "BR",
    "CMN": "CMN",
    "CMP": "CMP",
    "EOR": "EOR",
    "LDR": "LDR", 
    "MLA": "MADD",
    "MOV": "MOV", 
    "MUL": "MUL",
    "MRS": "MRS",
    "MSR": "MSR",
    "MVN": "MVN",
    "ORR": "ORR",
    "SBC": "SBC", 
    "STR": "STR", 
    "SUB": "SUB",
    "TST": "TST"
};

//mapeando valores significativos de cada instrucao
// (quantidade de operandos, a posicao dos registradores e a posicao da instrucao de shift )
const partes_e_registradores: { [nome: string]: [number[], number[][], number[]] } = {
    "ADC": [[3], [[1, 1, 1]], [0]], //A64 não aceita imediato
    "ADD": [[3, 3, 5, 5], [[1, 1, 1], [1, 1, 0], [1, 1, 0, 0, 0], [1, 1, 1, 0, 0]], [0, 0, 4, 4]],
    "AND": [[3, 3, 5], [[1, 1, 0], [1, 1, 1], [1, 1, 1, 0, 0]], [0, 0, 4]],
    "B":   [[],[[]], []],
    "BIC": [[3, 5], [[1, 1, 1], [1, 1, 1, 0, 0]], [0, 4]], 
    "BL":  [[],[[]], []],
    "BR":  [[1], [[1]], [0]],  
    "CMN": [[2, 4, 2, 4], [[1, 1], [1, 1, 0, 0], [1, 0], [1, 0, 0, 0]], [0, 0, 0, 0]],
    "CMP": [[2, 4, 2, 4], [[1, 1], [1, 1, 0, 0], [1, 0], [1, 0, 0, 0]], [0, 0, 0, 0]],
    "EOR": [[3, 5, 3], [[1, 1, 0], [1, 1, 1, 0, 0], [1, 1, 1]], [0, 4, 0]],
    "LDR": [[3, 2, 3, 5], [[1, 1, 0], [1, 0], [1, 1, 1], [1, 1, 1, 0, 0]], [0, 0, 0, 4]],
    "MADD":[[4], [[1, 1, 1, 1]], [0]], 
    "MOV": [[2, 2], [[1, 0], [1, 1]], [0, 0]],  
    "MUL": [[3], [[1, 1, 1]], [0]],
    "MRS": [[2], [[0, 1]], [0]],
    "MSR": [[2], [[1, 0]], [0]],
    "MVN": [[2, 4], [[1, 1], [1, 1, 0, 0]], [0, 3]],
    "ORR": [[3, 5], [[1, 1, 0], [1, 1, 1, 0, 0]], [0, 4]],
    "SBC": [[3], [[1, 1, 1]], [0]], 
    "STR": [[3, 2, 3, 5], [[1, 1, 0], [1, 0], [1, 1, 1], [1, 1, 1, 0, 0]], [0, 0, 0, 4]], 
    "SUB": [[3, 3, 5, 5], [[1, 1, 1], [1, 1, 0], [1, 1, 0, 0, 0], [1, 1, 1, 0, 0]], [0, 0, 4, 4]],
    "TST": [[2, 2, 4], [[1, 0], [1, 1], [1, 1, 0, 0]], [0, 0, 3]]
};

/*
Função princial
*/
export const A32ToA64 = (inst: string) => {
    let vectorInst: string[] = inst.toUpperCase().split(' ');
    const interOut = GetopcodeA64(vectorInst[0]);

    if (interOut === null)
        return "Não foi possivel encontrar a instrução"

    let opcodeA64 = interOut[0];
    let setSignal = interOut[1];
    let auxExtra = interOut[2];
    const nullVector = [0];

    let disposicaoRegsShift = verifyRegs(vectorInst, opcodeA64);

    if (disposicaoRegsShift === null)
        return "Erro na disposição dos registradores e imediatos para a tradução";

    let shiftCorrect = verifyShift(vectorInst, disposicaoRegsShift[1])
    if (!shiftCorrect && disposicaoRegsShift === nullVector)
        return "Erro no Barrel Shift para a tradução"

    // let operandsA64 = inst.slice(vectorInst[0].length);

    switch (opcodeA64) {
        case "B": //unico caso que mantem o condicional, mas adiciona um ponto
            if (auxExtra !== "")
                opcodeA64 = opcodeA64 + "." + auxExtra + " ";
            if (vectorInst.length === 2)
                return opcodeA64 + " " + vectorInst[1];
            return "Não foi possível converter a instrução";
        case "BR":
            if (vectorInst.length === 2 && auxExtra !== "")
                return instructionCond(opcodeA64 + " " + vectorInst[1], auxExtra, vectorInst[1] )
            else if (vectorInst.length === 2)
                return opcodeA64 + " " + vectorInst[1]
            return "Não foi possível converter a instrução";
        case "STR":
        case "LDR": //registrador precisa ser X
            vectorInst[2] = vectorInst[2].replace("R", "X")
            if (disposicaoRegsShift[0].length === 5)
                if (vectorInst[4] !== "LSL")
                    return "Operação shift inválida para A64, não é permitido o \"" + vectorInst[4] + "\""
            break;
        case "MRS":
            vectorInst[1] = vectorInst[2].replace("R", "X");
            vectorInst[2] = "NZCV"
            break;
        case "MSR":
            vectorInst[1] = "NZCV"
            vectorInst[2] = vectorInst[2].replace("R", "X");
            break;
        case "ADD":
        case "SUB":
            if (disposicaoRegsShift[1] !== 0){
                if(vectorInst[disposicaoRegsShift[1]] === "ROR")
                    return "Não existe o ROR nessas instruções"
            }
            break;
        default:
            break;
    }

    let wholeInstruction = treatRegistors(opcodeA64, setSignal, vectorInst, disposicaoRegsShift[0]);

    if (auxExtra !== "" && auxExtra !== "S")
        wholeInstruction = instructionCond(wholeInstruction, auxExtra, vectorInst[1])

    return wholeInstruction;
};

/*
    Funções auxiliares
*/

const GetopcodeA64 = (opcodeA32: string) => {

    const padraoBranch = new RegExp(`^B(${vectorCond.join('|')})$`);
    const padraoBranchLink = new RegExp(`^BL(${vectorCond.join('|')})$`);
    //verifica se são Branches
    if (padraoBranch.test(opcodeA32))
        return ["B", "", opcodeA32.slice(1)];
    else if (padraoBranchLink.test(opcodeA32))
        return ["BL", "", opcodeA32.slice(2)];

    const condicionais_e_S = new RegExp(`^(${vectorCond.join('|')})S$`);
    let auxExtra = opcodeA32.slice(3);
    opcodeA32 = simplifyOpcodeA32(opcodeA32);
    let interInstruction: string = instructions32to64[opcodeA32];

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

const simplifyOpcodeA32 = (opcodeA32: string) => {
    let _loop_1 = function (i: number) {
        let auxSliced = opcodeA32.slice(0, i);
        let auxExtra = opcodeA32.slice(i);

        if (Object.keys(instructions32to64).some(function (x) { return x === auxSliced; }) && vectorCond.some(function (x) { return x === auxExtra || x + 'S' === auxExtra; })) {
            return { value: auxSliced };
        }
    }

    for (let i = 1; i <= opcodeA32.length; i++) {
        let state_1 = _loop_1(i);
        if (typeof state_1 === "object")
            return state_1.value;
    }
    return opcodeA32;
};

const verifyRegs = (vectorInst: string[], opcodeA64: string) => {
    let arrayInfos: [number[], number] = [[], 0];
    const infos_operandos = partes_e_registradores[opcodeA64];
    console.log(infos_operandos.length)

    if (infos_operandos[0].length === 0)
        return arrayInfos;

    for (let i = 0; i < infos_operandos[0].length; i++) {
        if (vectorInst.length - 1 === infos_operandos[0][i]) {
            for (let j = 0; j < infos_operandos[0][i]; j++) {
                if (/R(1[0-5]|[0-9])/.test(vectorInst[j + 1])) { 
                    if(infos_operandos[1][i][j] === 1){
                        if (j + 1 === infos_operandos[0][i]){
                            arrayInfos = [infos_operandos[1][i], infos_operandos[2][i]]
                            return arrayInfos
                        }
                    }
                    else
                        break;
                }
                else
                    if (infos_operandos[1][i][j] === 0){
                        if (j + 1 === infos_operandos[0][i]){
                            arrayInfos = [infos_operandos[1][i], infos_operandos[2][i]]
                            return arrayInfos
                        }
                    }
                    else
                        break;
            }
        }
    }
    return null;
};

const verifyShift = function (vectorInst: string[], posicaoShift: number) {
    let posicaoShiftReal = -1;

    for (let i = 0; i < shiftCodes.length && posicaoShiftReal === -1; i++) {
        if (vectorInst.indexOf(shiftCodes[i]) === posicaoShift || posicaoShift === 0)
            return true;
    }
    return false;
};

const treatRegistors = (opcodeA64: string, setSignal: string, vectorInst: string[], disposicaoRegs: number[]) => {
    let tudaoInstruction = opcodeA64 + setSignal + " ";

    for (let i = 1; i < disposicaoRegs.length + 1; i++) {
        if (disposicaoRegs[i - 1])
            tudaoInstruction = tudaoInstruction + vectorInst[i].replace("R", "W") + " ";
        else
            tudaoInstruction = tudaoInstruction + vectorInst[i] + " "
    }
    return tudaoInstruction;
};

const instructionCond = (wholeInstruction: string, auxExtra: string, registradorDestino: string) => {
    // const structPadInstCond = "B.COND branch \nexit: \n\tB exit \nbranch: \n\tINSTRUCAO \n\tB exit\n*essa é uma alternativas, a instrução M";
    let structPadInstCond = "MOV Wt, REGISTRADOR \nINSTRUCAO\nCSEL REGISTRADOR, REGISTRADOR, Wt, COND\n*Wt é qualquer registrador que não está sendo utilizado\n**essa é apenas uma das possibilidades";
    registradorDestino = registradorDestino.replace(/,/g, "").replace("R", "W")
    console.log(registradorDestino)
    return structPadInstCond.replace(/REGISTRADOR/g, registradorDestino).replace("COND", auxExtra).replace("INSTRUCAO", wholeInstruction);
}

let teste1 = A32ToA64("MOVEQ R0, R1");
// let teste2 = A32ToA64("MOVLE R1, R1");
// // let teste3 = A32ToA64("STR R1, [R2, R4]!");

console.log(teste1 + "\n\n");
// console.log(teste2 + "\n\n");
// console.log(teste3);


/* Instruçoes que faltam
 - instrucoes condicionais (Tipo ADDEQ R1, R2, R3 ficaria: ADD R4, R2, R3 \nCSEL R1, R4, R1, EQ)
 ADD R4, R2, R3 
 CSEL R1, R4, R1, EQ

 MOV RX, R1
 ADD R1, R2, R3
 CSEL R1, R1, RX, EQ
*/