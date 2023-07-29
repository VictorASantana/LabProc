const ccodes = [
    "eq",             // 0000
    "ne",             // 0001
    "cs",             // 0010
    "cc",             // 0011
    "mi",             // 0100
    "pl",             // 0101
    "vs",             // 0110
    "vc",             // 0111
    "hi",             // 1000
    "ls",             // 1001
    "ge",             // 1010
    "lt",             // 1011
    "gt",             // 1100
    "le",             // 1101
    "",               // 1110
    ""                // 1111
];

const opcodes = [
    "and",         // 0
    "eor",         // 1
    "sub",         // 2
    "rsb",         // 3
    "add",         // 4
    "adc",         // 5
    "sbc",         // 6
    "rsc",         // 7
    "tst",         // 8
    "teq",         // 9
    "cmp",         // 10
    "cmn",         // 11
    "orr",         // 12
    "mov",         // 13
    "bic",         // 14
    "mvn",         // 15
];

const shftcodes = [
    "lsl",         // 0
    "lsr",         // 1
    "asr",         // 2
    "ror"          // 3
];

var instructions32to64 = {
    "ADC"   :  "ADC", //A64 não aceita imediato
    "ADD"   :  "ADD", //reg, imediato ou shiftado
    "AND"   :  "AND", //reg, imediato ou shiftado
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
}
   