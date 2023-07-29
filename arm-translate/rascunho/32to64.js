const shftcodes = {
    "LSL":"",         
    "LSR":"",         
    "ASR":"",         
    "ROR":""          
};

const instructions32to64 = {
    "AND":"AND",
    "ANDS":"ANDS",         
    "EOR":"EOR",
    "EORS":"EORS",         
    "SUB":"",         
    "RSB":"",         
    "ADD":"",         
    "ADC":"",         
    "SBC":"",         
    "RSC":"",         
    "TST":"",         
    "TEQ":"",         
    "CMP":"",         
    "CMN":"",         
    "ORR":"",         
    "MOV":"",         
    "BIC":"",         
    "MVN":"",
    "B": "B",
    "BEQ":"B.EQ",
};

var instructionsRegs = {
    ADD: [[1, 1, 1, 0, 1], [1, 1, 1, 0, 0], [1, 1, 1], [1, 1, 0]],
};
var instructionsImm = {
    ADD: [[0, 0, 0, 0, 0], [0, 0, 0, 0, 1], [0, 0, 0], [0, 0, 1]],
};

function convert32to64(instructionSet){

    var vectorSplit = instructionSet.split("\n");
    var instructionVectorOut;

    for(var i = 0; i<vectorSplit.length; i++)
    {
        var instruction32 = vectorSplit[i].replace(/,/g,"").split(" "); //ADD r0, r1, r2
        var instruction64; 
        console.log(instruction32);
        
        if (instruction32[0] in instructions32to64)
            instruction64 = instructions32to64[instruction32[0]] + " ";
        else{
            instruction64 = "Não existe"
            break;
        }

        //verifica padrao de registradores e imediatos
        var sequenciaRegs = [];
        for(var i = 1; i<instruction32.length;i++)
        {
            if(/r([0-9]|1[0-5])/.test(instruction32[i]))
                sequenciaRegs.push(1);
            else
                sequenciaRegs.push(0);
        }
        
        //verifica qual é o item que tem correspondencia
        console.log(instructionsRegs[instruction32[0]].length);
        for(var i = 0; i<instructionsRegs[instruction32[0]].length; i++)
        {
            console.log(instructionsRegs[instruction32[0]][i]);
            if(instructionsRegs[instruction32[0]][i].every((elemento, indice) => elemento === sequenciaRegs[indice])){                
                var itemInstruction = i;
                break;
            }
        }
        console.log(itemInstruction);

        var teste = instructionsRegs[instruction32[0]].some(elemento => JSON.stringify(elemento) === JSON.stringify(sequenciaRegs))

        console.log(teste)

        
        


    }


    return instructionVectorOut
}

var resultado;
resultado = convert32to64("ADD r1, r2, r3\n")
