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

var instructionsNumRegs = {
    ADD: [2, 3],

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
        {
            instruction64 = instructions32to64[instruction32[0]] + " "

            console.log(instructionsNumRegs[instruction32[0]]);
            var j = 0;
            const regExRegistradores = "/r\b(?:1[0-5]|[0-9])\b/";

            for(var i = 1; i<instruction32.length;i++)
            {
                //DOTO: nao deu certo a regex,arrumar 
                if(regExRegistradores.test(instruction32[i]))
                {
                    j++;
                    console.log(instruction32[i]);
                }
            }
        }

        instruction64 = "Não existe"
        


    }


    return instructionVectorOut
}

var resultado;
resultado = convert32to64("ADD r1, r2, r3\n")
